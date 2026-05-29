import { readEnv } from "@/lib/env";

export const runtime = "nodejs";

export function GET(): Response {
  return readEnv().match({
    ok: () => Response.json({ ok: true, service: "coral-compass" }),
    err: (error) =>
      Response.json(
        { ok: false, error: error.message, issues: error.issues },
        { status: 500 }
      )
  });
}
