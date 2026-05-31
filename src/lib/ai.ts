import { generateText, stepCountIs, type ToolSet } from "ai";
import { createAILogger, createEvlogIntegration } from "evlog/ai";
import { Result, TaggedError } from "better-result";
import { z } from "zod";
import { coralSql } from "@/lib/coral";
import { readEnv } from "@/lib/env";
import { createRequestLogger } from "@/lib/log";

const ASK_MODEL = "openai/gpt-5-nano";
const REPO_SLUG_PATTERN = /\b([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\b/g;

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

const githubRepoActivityInputSchema = z.object({
  repos: z
    .array(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1)
      })
    )
    .min(1)
    .max(4)
    .describe("GitHub repositories to inspect as owner/repo pairs."),
  limit: z.number().int().min(1).max(8).optional().describe("Rows per evidence category.")
});

function isReadOnlyQuery(sql: string) {
  const trimmed = sql.trim().toLowerCase();
  return (
    (trimmed.startsWith("select ") || trimmed.startsWith("with ")) &&
    !trimmed.includes(";") &&
    !/\b(insert|update|delete|drop|alter|create|truncate|copy|attach|detach)\b/i.test(sql)
  );
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

type RepoInput = z.infer<typeof githubRepoActivityInputSchema>["repos"][number];
type LocalRequestLog = {
  set: (context: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
};

async function inspectGithubRepos(repos: RepoInput[], limit = 5, timeoutMs = 10_000) {
  const snapshots = await Promise.all(
    repos.map(async ({ owner, repo }) => {
      const ownerValue = sqlString(owner);
      const repoValue = sqlString(repo);
      const rowLimit = Math.min(Math.max(limit, 1), 8);
      const [latestMergedPrs, recentCommits, openPrs] = await Promise.all([
        coralSql(
          [
            "select number, title, user__login, merged_at, additions, deletions, changed_files, html_url",
            "from github.pulls",
            `where owner = ${ownerValue} and repo = ${repoValue} and merged = true`,
            "order by merged_at desc",
            `limit ${rowLimit}`
          ].join(" "),
          { timeoutMs }
        ),
        coralSql(
          [
            "select sha, commit__message, author__login, commit__author__date, html_url",
            "from github.commits",
            `where owner = ${ownerValue} and repo = ${repoValue}`,
            "order by commit__author__date desc",
            `limit ${rowLimit}`
          ].join(" "),
          { timeoutMs }
        ),
        coralSql(
          [
            "select number, title, user__login, updated_at, html_url",
            "from github.pulls",
            `where owner = ${ownerValue} and repo = ${repoValue} and state = 'open'`,
            "order by updated_at desc",
            `limit ${rowLimit}`
          ].join(" "),
          { timeoutMs }
        )
      ]);

      return {
        repo: `${owner}/${repo}`,
        latestMergedPrs: latestMergedPrs.isOk()
          ? { rows: latestMergedPrs.value }
          : { error: latestMergedPrs.error.stderr ?? latestMergedPrs.error.message },
        recentCommits: recentCommits.isOk()
          ? { rows: recentCommits.value }
          : { error: recentCommits.error.stderr ?? recentCommits.error.message },
        openPrs: openPrs.isOk()
          ? { rows: openPrs.value }
          : { error: openPrs.error.stderr ?? openPrs.error.message }
      };
    })
  );

  return {
    ok: true,
    snapshots
  };
}

const tools = {
  inspectGithubRepos: {
    description:
      "Fetch recent GitHub evidence for one or more repos through Coral. Use this first for repo comparison, product direction, and latest merged PR questions.",
    inputSchema: githubRepoActivityInputSchema,
    execute: async ({
      limit = 5,
      repos
    }: z.infer<typeof githubRepoActivityInputSchema>) => {
      return inspectGithubRepos(repos, limit);
    }
  },
  queryCoral: {
    description:
      "Run a read-only SQL query through Coral. Use this for factual evidence from Coral sources, including GitHub repos, installed Coral tables, and Codex session events.",
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
    const requestLog = createRequestLogger({
      path: "/ask"
    });
    const aiLog = createAILogger(requestLog, {
      toolInputs: {
        maxLength: 1200
      },
      cost: {
        "openai/gpt-5-nano": {
          input: 0.05,
          output: 0.4
        }
      }
    });

    requestLog.set({
      action: "discord.ask",
      model: ASK_MODEL,
      question: {
        length: question.length,
        preview: question.slice(0, 180)
      }
    });

    if (!env.AI_GATEWAY_API_KEY) {
      requestLog.emit({ status: 500, error: "missing_ai_gateway_api_key" });
      yield* new AskError({
        message:
          "AI Gateway is not configured. Add AI_GATEWAY_API_KEY to .env.local before using /ask."
      });
    }

    const repoFastPath = extractRepoComparison(question);
    if (repoFastPath.length >= 2) {
      const evidence = await inspectGithubRepos(repoFastPath, 4, 8_000);
      requestLog.set({
        fastPath: {
          type: "repo_comparison",
          repos: repoFastPath.map((repo) => `${repo.owner}/${repo.repo}`),
          evidence: summarizeToolOutput(evidence)
        }
      });

    const answer = await synthesizeRepoComparison(question, evidence, requestLog, aiLog);
    requestLog.emit({ status: 200 });
      return Result.ok(compactDiscordAnswer(answer));
    }

    const result = yield* Result.await(
      Result.tryPromise({
        try: () =>
          generateText({
            model: aiLog.wrap(ASK_MODEL),
            system: [
              "You are Coral Compass, a Discord assistant for the Coral OSS team.",
              "You must call a Coral-backed tool before giving a final answer.",
              "Answer questions using Coral query tool evidence, not invented SQL.",
              "Use withcoral/coral as the default repo only when the user does not name another repo.",
              "When the user asks to compare repos, prefer inspectGithubRepos with all requested repos in one call.",
              "If a repo name is ambiguous, make a best-effort owner/repo guess only when it is widely known; otherwise say the exact GitHub slug is needed.",
              "Keep answers concise and cite the table/query evidence in plain language.",
              "For count questions, answer with the number first, then at most 8 compact examples.",
              "Do not include raw GitHub URLs unless the user explicitly asks for links; cite PRs as #1234.",
              "Do not end with an upsell or follow-up question.",
              "For product-path answers, separate evidence from inference: first summarize what changed recently, then infer likely product direction.",
              "Useful tables include github.pulls, github.commits, coral.tables, coral.columns, and codex.events.",
              "For github.pulls, useful columns include number, title, state, user__login, created_at, updated_at, html_url, owner, and repo.",
              "For github.commits, useful columns include sha, commit__message, author__login, commit__author__date, html_url, owner, and repo.",
              "For github.pulls and github.commits, always include owner and repo filters.",
              "Example newest open PR query: select number, title, user__login, created_at, html_url from github.pulls where owner = 'withcoral' and repo = 'coral' and state = 'open' order by created_at desc limit 10",
              "For last merged PRs, inspectGithubRepos already queries github.pulls with merged = true ordered by merged_at desc.",
              "If evidence is insufficient, say what source/table is missing."
            ].join("\n"),
            prompt: question,
            tools,
            toolChoice: "required",
            prepareStep: ({ stepNumber }) => ({
              toolChoice: stepNumber === 0 ? "required" : "auto"
            }),
            stopWhen: stepCountIs(5),
            maxRetries: 1,
            timeout: 45_000,
            experimental_telemetry: {
              isEnabled: true,
              functionId: "discord.ask",
              metadata: {
                route: "/ask"
              },
              integrations: [createEvlogIntegration(aiLog)]
            },
            experimental_onToolCallStart: ({ stepNumber, toolCall }) => {
              requestLog.set({
                toolCall: {
                  stepNumber,
                  toolName: toolCall.toolName,
                  input: toolCall.input
                }
              });
            },
            experimental_onToolCallFinish: (event) => {
              requestLog.set({
                toolResult: {
                  stepNumber: event.stepNumber,
                  toolName: event.toolCall.toolName,
                  durationMs: event.durationMs,
                  success: event.success,
                  output: event.success ? summarizeToolOutput(event.output) : undefined,
                  error: event.success ? undefined : String(event.error)
                }
              });
            },
            onStepFinish: (step) => {
              requestLog.set({
                lastStep: {
                  finishReason: step.finishReason,
                  toolCalls: step.toolCalls.map((toolCall) => toolCall.toolName),
                  toolResults: step.toolResults.length,
                  textLength: step.text.length
                }
              });
            },
            onFinish: (event) => {
              requestLog.set({
                finish: {
                  reason: event.finishReason,
                  steps: event.steps.length,
                  toolCalls: event.steps.flatMap((step) =>
                    step.toolCalls.map((toolCall) => toolCall.toolName)
                  ),
                  totalUsage: event.totalUsage
                },
                ai: aiLog.getMetadata()
              });
            }
          }),
        catch: (error) => {
          requestLog.error(error instanceof Error ? error : String(error), {
            stage: "ai_gateway_request_failed",
            ai: aiLog.getMetadata()
          });
          requestLog.emit({ status: 500 });
          return new AskError({
            message: "AI Gateway request failed",
            cause: error
          });
        }
      })
    );

    requestLog.emit({ status: 200 });
    return Result.ok(compactDiscordAnswer(result.text.trim()));
  });
}

async function synthesizeRepoComparison(
  question: string,
  evidence: Awaited<ReturnType<typeof inspectGithubRepos>>,
  requestLog: LocalRequestLog,
  aiLog: ReturnType<typeof createAILogger>
) {
  const fallback = fallbackRepoComparison(evidence);

  const result = await Result.tryPromise({
    try: () =>
      generateText({
        model: aiLog.wrap(ASK_MODEL),
        system: [
          "You are Coral Compass, a concise Discord assistant for product and engineering teams.",
          "Use only the provided Coral GitHub evidence.",
          "Separate evidence from inference.",
          "If a repo has empty or errored evidence, say that clearly.",
          "Keep the answer under 1200 characters.",
          "Do not include raw GitHub URLs unless asked; cite PRs as #1234.",
          "Do not end with an upsell or follow-up question."
        ].join("\n"),
        prompt: [
          `User question: ${question}`,
          "",
          "Coral evidence:",
          JSON.stringify(evidence, null, 2)
        ].join("\n"),
        maxRetries: 0,
        timeout: 18_000,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "discord.ask.repo_comparison",
          metadata: {
            route: "/ask"
          },
          integrations: [createEvlogIntegration(aiLog)]
        },
        onFinish: (event) => {
          requestLog.set({
            fastPathFinish: {
              reason: event.finishReason,
              totalUsage: event.totalUsage
            },
            ai: aiLog.getMetadata()
          });
        }
      }),
    catch: (error) => error
  });

  if (result.isErr()) {
    requestLog.warn("repo_comparison_synthesis_failed", {
      error: result.error instanceof Error ? result.error.message : String(result.error)
    });
    return fallback;
  }

  return result.value.text.trim() || fallback;
}

function extractRepoComparison(question: string): RepoInput[] {
  const repos = Array.from(question.matchAll(REPO_SLUG_PATTERN)).map((match) => ({
    owner: match[1],
    repo: match[2]
  }));

  const uniqueRepos = new Map(repos.map((repo) => [`${repo.owner}/${repo.repo}`, repo]));
  return Array.from(uniqueRepos.values()).slice(0, 4);
}

function fallbackRepoComparison(evidence: Awaited<ReturnType<typeof inspectGithubRepos>>) {
  const sections = evidence.snapshots.map((snapshot) => {
    const mergedRows =
      "rows" in snapshot.latestMergedPrs && Array.isArray(snapshot.latestMergedPrs.rows)
        ? snapshot.latestMergedPrs.rows
        : [];
    const commitRows =
      "rows" in snapshot.recentCommits && Array.isArray(snapshot.recentCommits.rows)
        ? snapshot.recentCommits.rows
        : [];
    const merged =
      "rows" in snapshot.latestMergedPrs
        ? mergedRows
            .slice(0, 2)
            .map((row) => `#${row.number} ${String(row.title ?? "untitled")}`)
            .join("; ") || "no merged PR rows"
        : `merged PR query failed: ${snapshot.latestMergedPrs.error}`;
    const commits =
      "rows" in snapshot.recentCommits
        ? commitRows
            .slice(0, 2)
            .map((row) => `${String(row.sha ?? "").slice(0, 7)} ${firstLine(row.commit__message)}`)
            .join("; ") || "no commit rows"
        : `commit query failed: ${snapshot.recentCommits.error}`;

    return `**${snapshot.repo}**\nMerged PRs: ${merged}\nRecent commits: ${commits}`;
  });

  return [
    "**Repo Comparison Evidence**",
    "",
    ...sections,
    "",
    "**Inference**",
    "The AI synthesis timed out, but Coral did return the evidence above. A useful next product path for Coral is to turn this into a deterministic release/product brief: compare recent merged work, open PR pressure, and commit themes across adjacent OSS projects, then surface what Coral should copy, avoid, or document."
  ].join("\n\n");
}

function firstLine(value: unknown, maxLength = 120) {
  const line = String(value ?? "unknown").split("\n")[0] ?? "";
  return line.length > maxLength ? `${line.slice(0, maxLength - 1)}...` : line;
}

function compactDiscordAnswer(answer: string) {
  return answer
    .replaceAll(/https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/g, "#$3")
    .replaceAll(/https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/commit\/([a-f0-9]+)/g, "$3")
    .replaceAll(/ — #(\d+)\b/g, " — #$1")
    .replaceAll(/\n{3,}/g, "\n\n")
    .replace(
      /\n?(If you want|Would you like|I can also|I can filter|Let me know)[^\n]*$/i,
      ""
    )
    .trim();
}

function summarizeToolOutput(output: unknown) {
  if (!output || typeof output !== "object") {
    return output;
  }

  const maybeRows = "rows" in output ? output.rows : undefined;
  return {
    ok: "ok" in output ? output.ok : undefined,
    rowCount: Array.isArray(maybeRows) ? maybeRows.length : undefined,
    error: "error" in output ? output.error : undefined
  };
}
