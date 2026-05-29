import { after } from "next/server";
import { getBotRuntime } from "@/lib/bot";

export const runtime = "nodejs";
export const maxDuration = 800;

export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const runtime = getBotRuntime();
  if (runtime.isErr()) {
    return Response.json(
      {
        ok: false,
        error: runtime.error.message,
        issues: runtime.error.issues
      },
      { status: 500 }
    );
  }

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    new URL(request.url).host;
  const webhookUrl = `https://${host}/api/webhooks/discord`;

  await runtime.value.bot.initialize();

  return runtime.value.discordAdapter.startGatewayListener(
    { waitUntil: (task: Promise<unknown>) => after(() => task) },
    600 * 1000,
    undefined,
    webhookUrl
  );
}
