export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({
    ok: true,
    status: "gateway_disabled",
    message: "Discord slash commands use /api/webhooks/discord. Gateway listening is disabled for the v0 Vercel deployment."
  });
}
