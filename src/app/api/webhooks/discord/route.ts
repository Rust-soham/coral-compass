import { after } from "next/server";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { getCommandResponse } from "@/lib/commands";
import { readEnv } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const interaction = JSON.parse(rawBody) as {
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

  if (interaction.type === InteractionType.PING) {
    return Response.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return new Response("Unsupported interaction", { status: 400 });
  }

  const command = `/${interaction.data?.name ?? ""}`;
  const text = getInteractionText(interaction.data?.options);
  const user = interaction.member?.user?.username ?? interaction.user?.username ?? "unknown";

  console.info("[coral-compass] slash command received", {
    command,
    user
  });

  if (command !== "/ping") {
    after(async () => {
      const content = await getCommandResponse(command, text);
      await postDiscordFollowup({
        applicationId: interaction.application_id,
        botToken: env.value.DISCORD_BOT_TOKEN,
        channelId: interaction.channel_id,
        content,
        interactionToken: interaction.token
      });
    });

    return Response.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Running Coral queries for \`${command}\`...`
      }
    });
  }

  const content = await getCommandResponse(command);

  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content
    }
  });
}

async function postDiscordFollowup({
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
      console.warn("[coral-compass] Discord followup failed", {
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
      console.warn("[coral-compass] Discord channel post failed", {
        status: response.status,
        body: await response.text()
      });
    }
  }
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
