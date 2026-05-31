import { after } from "next/server";
import { Result, TaggedError } from "better-result";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { getCommandResponse } from "@/lib/commands";
import { readEnv } from "@/lib/env";
import { createRequestLogger, eventLog } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

class DiscordWebhookError extends TaggedError("DiscordWebhookError")<{
  message: string;
  status?: number;
  body?: string;
  cause?: unknown;
}>() {}

type DiscordInteraction = {
  application_id: string;
  channel_id?: string;
  type: InteractionType;
  data?: {
    name?: string;
    options?: Array<{
      name: string;
      type: number;
      value?: string | number | boolean;
      options?: Array<{ name: string; value?: string | number | boolean }>;
    }>;
  };
  token?: string;
  member?: { user?: { username?: string } };
  user?: { username?: string };
};

export async function POST(request: Request): Promise<Response> {
  const env = readEnv();

  if (env.isErr()) {
    return Response.json(
      {
        ok: false,
        error: env.error.message,
        issues: env.error.issues
      },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return new Response("Missing signature", { status: 401 });
  }

  const isValid = await verifyKey(
    rawBody,
    signature,
    timestamp,
    env.value.DISCORD_PUBLIC_KEY
  );

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const interaction = Result.try({
    try: () => JSON.parse(rawBody) as DiscordInteraction,
    catch: (error) =>
      new DiscordWebhookError({
        message: "Invalid Discord interaction JSON",
        cause: error
      })
  });

  if (interaction.isErr()) {
    return Response.json(
      {
        ok: false,
        error: interaction.error.message
      },
      { status: 400 }
    );
  }

  if (interaction.value.type === InteractionType.PING) {
    return Response.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.value.type !== InteractionType.APPLICATION_COMMAND) {
    return new Response("Unsupported interaction", { status: 400 });
  }

  const command = `/${interaction.value.data?.name ?? ""}`;
  const text = getInteractionText(interaction.value.data?.options);
  const user =
    interaction.value.member?.user?.username ?? interaction.value.user?.username ?? "unknown";
  const requestLog = createRequestLogger({
    method: "POST",
    path: "/api/webhooks/discord"
  });

  eventLog.info({
    message: "[coral-compass] slash command received",
    command,
    user
  });
  requestLog.set({
    command,
    user,
    interaction: {
      type: interaction.value.type,
      hasToken: Boolean(interaction.value.token),
      hasChannel: Boolean(interaction.value.channel_id),
      textLength: text.length
    }
  });

  if (command !== "/ping") {
    after(async () => {
      const result = await Result.gen(async function* () {
        requestLog.set({ stage: "command_response_started" });
        const discordMessages =
          command === "/triage" && interaction.value.channel_id
            ? yield* Result.await(fetchDiscordMessages({
                botToken: env.value.DISCORD_BOT_TOKEN,
                channelId: interaction.value.channel_id
              }))
            : [];
        const content = await getCommandResponse(command, text, { discordMessages });
        requestLog.set({
          response: {
            length: content.length,
            chunks: chunkDiscordMessage(content).length
          }
        });
        yield* Result.await(postDiscordFollowup({
          applicationId: interaction.value.application_id,
          botToken: env.value.DISCORD_BOT_TOKEN,
          channelId: interaction.value.channel_id,
          content,
          interactionToken: interaction.value.token
        }));
        requestLog.emit({ status: 200 });
        return Result.ok(undefined);
      });

      result.tapError((error) => {
        requestLog.error(error.message, {
          body: "body" in error ? error.body : undefined,
          stage: "command_followup_failed"
        });
        requestLog.emit({ status: 500 });
      });
    });

    return Response.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          command === "/ask"
            ? "Thinking with Coral tools..."
            : `Running Coral queries for \`${command}\`...`
      }
    });
  }

  const content = await getCommandResponse(command);
  requestLog.set({
    response: {
      length: content.length,
      chunks: 1
    }
  });
  requestLog.emit({ status: 200 });

  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content
    }
  });
}

function fetchDiscordMessages({
  botToken,
  channelId
}: {
  botToken: string;
  channelId: string;
}) {
  return Result.tryPromise({
    try: async () => {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages?limit=15`,
        {
          headers: {
            Authorization: `Bot ${botToken}`
          }
        }
      );

      if (!response.ok) {
        throw new DiscordWebhookError({
          message: "Discord message fetch failed",
          status: response.status,
          body: await response.text()
        });
      }

      const messages = (await response.json()) as Array<{
        author?: { bot?: boolean; username?: string };
        content?: string;
        timestamp?: string;
      }>;

      return messages
        .filter((message) => !message.author?.bot && message.content?.trim())
        .reverse()
        .map((message) => ({
          author: message.author?.username ?? "unknown",
          content: message.content ?? "",
          timestamp: message.timestamp
        }));
    },
    catch: (error) =>
      error instanceof DiscordWebhookError
        ? error
        : new DiscordWebhookError({
            message: "Failed to fetch Discord messages",
            cause: error
          })
  });
}

function postDiscordFollowup({
  applicationId,
  botToken,
  channelId,
  content,
  interactionToken
}: {
  applicationId: string;
  botToken: string;
  channelId?: string;
  content: string;
  interactionToken?: string;
}) {
  return Result.tryPromise({
    try: async () => {
      const chunks = chunkDiscordMessage(content);
      const firstChunk = chunks.shift();

      if (interactionToken && firstChunk) {
        const response = await fetch(
          `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: firstChunk })
          }
        );

        if (!response.ok) {
          throw new DiscordWebhookError({
            message: "Discord followup failed",
            status: response.status,
            body: await response.text()
          });
        }
      }

      if (!channelId) {
        return;
      }

      for (const chunk of chunks) {
        const response = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bot ${botToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: chunk })
          }
        );

        if (!response.ok) {
          throw new DiscordWebhookError({
            message: "Discord channel post failed",
            status: response.status,
            body: await response.text()
          });
        }
      }
    },
    catch: (error) =>
      error instanceof DiscordWebhookError
        ? error
        : new DiscordWebhookError({
            message: "Failed to post Discord followup",
            cause: error
          })
  });
}

function chunkDiscordMessage(content: string) {
  const limit = 1900;
  const chunks: string[] = [];
  let remaining = content;

  while (remaining.length > limit) {
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt < 1) {
      splitAt = limit;
    }
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

function getInteractionText(
  options?: Array<{
    name: string;
    value?: string | number | boolean;
    options?: Array<{ name: string; value?: string | number | boolean }>;
  }>
) {
  if (!options?.length) {
    return "";
  }

  const values: string[] = [];
  const collect = (
    items: Array<{
      name: string;
      value?: string | number | boolean;
      options?: Array<{ name: string; value?: string | number | boolean }>;
    }>
  ) => {
    for (const item of items) {
      if (item.value !== undefined) {
        values.push(String(item.value));
      }
      if (item.options) {
        collect(item.options);
      }
    }
  };

  collect(options);
  return values.join(" ");
}
