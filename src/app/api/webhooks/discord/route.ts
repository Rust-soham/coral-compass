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
    type: InteractionType;
    data?: { name?: string };
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
  const user = interaction.member?.user?.username ?? interaction.user?.username ?? "unknown";

  console.info("[coral-compass] slash command received", {
    command,
    user
  });

  const content = await getCommandResponse(command);

  return Response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content
    }
  });
}
