import { generateText, stepCountIs, type ToolSet } from "ai";
import { Result, TaggedError } from "better-result";
import { z } from "zod";
import { coralSql } from "@/lib/coral";
import { readEnv } from "@/lib/env";

const ASK_MODEL = "openai/gpt-5-nano";

class AskError extends TaggedError("AskError")<{
  message: string;
  cause?: unknown;
}>() {}

const coralQueryInputSchema = z.object({
  sql: z
    .string()
    .min(1)
    .describe(
      "A read-only Coral SQL query. Prefer github.pulls, github.commits, coral.tables, coral.columns, and codex.events."
    )
});

function isReadOnlyQuery(sql: string) {
  const trimmed = sql.trim().toLowerCase();
  return (
    (trimmed.startsWith("select ") || trimmed.startsWith("with ")) &&
    !trimmed.includes(";") &&
    !/\b(insert|update|delete|drop|alter|create|truncate|copy|attach|detach)\b/i.test(sql)
  );
}

const tools = {
  queryCoral: {
    description:
      "Run a read-only SQL query through Coral. Use this for factual evidence about the withcoral/coral GitHub repo, installed Coral tables, and Codex session events.",
    inputSchema: coralQueryInputSchema,
    execute: async ({ sql }: z.infer<typeof coralQueryInputSchema>) => {
      if (!isReadOnlyQuery(sql)) {
        return {
          ok: false,
          error: "Only single read-only SELECT/WITH Coral SQL queries are allowed."
        };
      }

      const result = await coralSql(sql);

      if (result.isErr()) {
        return {
          ok: false,
          error: result.error.stderr ?? result.error.message
        };
      }

      return {
        ok: true,
        rows: result.value.slice(0, 12)
      };
    }
  }
} satisfies ToolSet;

export async function askCoral(question: string) {
  return Result.gen(async function* () {
    const env = yield* readEnv();

    if (!env.AI_GATEWAY_API_KEY) {
      yield* new AskError({
        message:
          "AI Gateway is not configured. Add AI_GATEWAY_API_KEY to .env.local before using /ask."
      });
    }

    const result = yield* Result.await(
      Result.tryPromise({
        try: () =>
          generateText({
            model: ASK_MODEL,
            system: [
              "You are Coral Compass, a Discord assistant for the Coral OSS team.",
              "Answer questions using Coral query tool evidence.",
              "Focus on the withcoral/coral GitHub repo unless the user asks otherwise.",
              "Keep answers concise and cite the table/query evidence in plain language.",
              "Useful tables include github.pulls, github.commits, coral.tables, coral.columns, and codex.events.",
              "For github.pulls and github.commits, include owner = 'withcoral' and repo = 'coral'.",
              "If evidence is insufficient, say what source/table is missing."
            ].join("\n"),
            prompt: question,
            tools,
            stopWhen: stepCountIs(4),
            maxRetries: 1,
            timeout: 45_000
          }),
        catch: (error) =>
          new AskError({
            message: "AI Gateway request failed",
            cause: error
          })
      })
    );

    return Result.ok(result.text.trim());
  });
}
