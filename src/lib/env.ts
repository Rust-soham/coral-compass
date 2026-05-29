import { Result } from "better-result";
import { z } from "zod";
import { EnvError } from "@/lib/errors";

const envSchema = z.object({
  CRON_SECRET: z.string().optional(),
  DISCORD_APPLICATION_ID: z.string().min(1),
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_MENTION_ROLE_IDS: z.string().optional(),
  DISCORD_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000")
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv() {
  return Result.try({
    try: () => envSchema.parse(process.env),
    catch: (error) => {
      const issues =
        error instanceof z.ZodError
          ? error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          : ["Unable to parse environment"];

      return new EnvError({
        issues,
        message: `Missing or invalid environment: ${issues.join("; ")}`
      });
    }
  });
}

export function requireEnv(): AppEnv {
  return readEnv().match({
    ok: (env) => env,
    err: (error) => {
      throw new Error(error.message);
    }
  });
}
