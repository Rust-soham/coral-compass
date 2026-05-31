import { generateText } from "ai";
import { Result, TaggedError } from "better-result";
import { z } from "zod";
import { coralSql } from "@/lib/coral";
import { readEnv } from "@/lib/env";

const TRIAGE_MODEL = "openai/gpt-5-nano";
const REPO_PATTERN = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;

export type DiscordContextMessage = {
  author: string;
  content: string;
  timestamp?: string;
};

class TriageError extends TaggedError("TriageError")<{
  message: string;
  cause?: unknown;
}>() {}

const triageDraftSchema = z.object({
  title: z.string().min(8).max(90),
  summary: z.string().min(20).max(1400),
  labels: z.array(z.string().min(1).max(40)).max(5),
  confidence: z.enum(["low", "medium", "high"]),
  duplicateRisk: z.enum(["low", "medium", "high"]),
  shouldCreateIssue: z.boolean()
});

type CoralRow = Record<string, unknown>;

export async function triageDiscordThread({
  discordMessages,
  repoSlug
}: {
  discordMessages: DiscordContextMessage[];
  repoSlug: string;
}) {
  return Result.gen(async function* () {
    const env = yield* readEnv();
    const parsedRepo = parseRepoSlug(repoSlug);

    if (!parsedRepo) {
      yield* new TriageError({
        message: "Use `/triage repo:owner/repo`, for example `/triage repo:withcoral/coral`."
      });
    }

    const repo = parsedRepo as { owner: string; repo: string };

    if (!env.AI_GATEWAY_API_KEY) {
      yield* new TriageError({
        message: "AI Gateway is not configured. Add AI_GATEWAY_API_KEY before using /triage."
      });
    }

    const context = compactDiscordMessages(discordMessages);
    if (!context) {
      yield* new TriageError({
        message:
          "I could not read enough Discord context to triage. Make sure the bot can read message history in this channel."
      });
    }

    const evidence = await collectTriageEvidence(repo.owner, repo.repo, context);
    const draft = yield* Result.await(draftIssue(context, evidence));

    if (!draft.shouldCreateIssue) {
      return Result.ok(formatSkippedTriage(repoSlug, draft, evidence));
    }

    if (!env.GITHUB_TOKEN) {
      return Result.ok(
        [
          "**Triage Draft Ready**",
          "",
          "I gathered Coral evidence and drafted the GitHub issue, but `GITHUB_TOKEN` is not configured so I did not create it.",
          "",
          formatDraft(draft),
          "",
          formatEvidence(evidence)
        ].join("\n")
      );
    }

    const issue = yield* Result.await(
      createGithubIssue({
        body: issueBody(context, draft, evidence),
        labels: draft.labels,
        owner: repo.owner,
        repo: repo.repo,
        title: draft.title,
        token: env.GITHUB_TOKEN
      })
    );

    return Result.ok(
      [
        "**Triage Complete**",
        `Created GitHub issue #${issue.number}: ${issue.html_url}`,
        "",
        `**Why this became work**`,
        `- Discord context produced a ${draft.confidence}-confidence work item.`,
        `- Duplicate risk: ${draft.duplicateRisk}.`,
        `- Coral checked GitHub issues, PRs, and commits.`,
        "",
        formatEvidence(evidence)
      ].join("\n")
    );
  });
}

function parseRepoSlug(repoSlug: string) {
  const match = repoSlug.trim().match(REPO_PATTERN);
  return match ? { owner: match[1], repo: match[2] } : undefined;
}

async function collectTriageEvidence(owner: string, repo: string, context: string) {
  const ownerValue = sqlString(owner);
  const repoValue = sqlString(repo);
  const keywords = extractKeywords(context);
  const issueWhere = keywords.length
    ? `and (${keywords
        .map((keyword) => `lower(title) like ${sqlString(`%${keyword}%`)}`)
        .join(" or ")})`
    : "";

  const [relatedIssues, recentPrs, recentCommits] = await Promise.all([
    coralSql(
      [
        "select number, title, state, user__login, updated_at, html_url",
        "from github.issues",
        `where owner = ${ownerValue} and repo = ${repoValue} ${issueWhere}`,
        "order by updated_at desc",
        "limit 8"
      ].join(" "),
      { timeoutMs: 10_000 }
    ),
    coralSql(
      [
        "select number, title, state, user__login, updated_at, html_url",
        "from github.pulls",
        `where owner = ${ownerValue} and repo = ${repoValue}`,
        "order by updated_at desc",
        "limit 5"
      ].join(" "),
      { timeoutMs: 10_000 }
    ),
    coralSql(
      [
        "select sha, commit__message, author__login, commit__author__date, html_url",
        "from github.commits",
        `where owner = ${ownerValue} and repo = ${repoValue}`,
        "order by commit__author__date desc",
        "limit 5"
      ].join(" "),
      { timeoutMs: 10_000 }
    ),
  ]);

  return {
    keywords,
    relatedIssues: resultRows(relatedIssues),
    recentPrs: resultRows(recentPrs),
    recentCommits: resultRows(recentCommits)
  };
}

function resultRows(result: Awaited<ReturnType<typeof coralSql>>) {
  return result.isOk() ? result.value : [];
}

async function draftIssue(context: string, evidence: Awaited<ReturnType<typeof collectTriageEvidence>>) {
  return Result.tryPromise({
    try: async () => {
      const result = await generateText({
        model: TRIAGE_MODEL,
        system: [
          "You draft concise GitHub issues from Discord support/product conversations.",
          "Use the supplied Coral evidence to avoid duplicates.",
          "Return strict JSON matching this TypeScript shape:",
          "{ title: string; summary: string; labels: string[]; confidence: 'low'|'medium'|'high'; duplicateRisk: 'low'|'medium'|'high'; shouldCreateIssue: boolean }",
          "Set shouldCreateIssue false only when the Discord context is too vague or Coral evidence strongly suggests a duplicate.",
          "Labels should be lowercase GitHub-style labels, such as bug, docs, enhancement, onboarding, source-github."
        ].join("\n"),
        prompt: [
          "Discord context:",
          context,
          "",
          "Coral evidence:",
          JSON.stringify(evidence, null, 2)
        ].join("\n"),
        maxRetries: 1,
        timeout: 25_000
      });

      const json = JSON.parse(stripJsonFence(result.text));
      return triageDraftSchema.parse(json);
    },
    catch: (error) =>
      new TriageError({
        message: "Failed to draft a triage issue from Discord context.",
        cause: error
      })
  });
}

async function createGithubIssue({
  body,
  labels,
  owner,
  repo,
  title,
  token
}: {
  body: string;
  labels: string[];
  owner: string;
  repo: string;
  title: string;
  token: string;
}) {
  return Result.tryPromise({
    try: async () => {
      const request = async (payload: { body: string; labels?: string[]; title: string }) =>
        fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "coral-compass"
          },
          body: JSON.stringify(payload)
        });

      let response = await request({ body, labels, title });
      if (response.status === 422 && labels.length > 0) {
        response = await request({ body, title });
      }

      if (!response.ok) {
        throw new Error(`GitHub issue creation failed (${response.status}): ${await response.text()}`);
      }

      return (await response.json()) as { number: number; html_url: string };
    },
    catch: (error) =>
      new TriageError({
        message: "Failed to create GitHub issue.",
        cause: error
      })
  });
}

function issueBody(
  context: string,
  draft: z.infer<typeof triageDraftSchema>,
  evidence: Awaited<ReturnType<typeof collectTriageEvidence>>
) {
  return [
    draft.summary,
    "",
    "## Discord context",
    context,
    "",
    "## Coral evidence",
    evidence.relatedIssues.length
      ? `Related issues checked:\n${evidence.relatedIssues.map(formatIssueRow).join("\n")}`
      : "Related issues checked: no close title matches returned.",
    evidence.recentPrs.length
      ? `Recent PRs:\n${evidence.recentPrs.slice(0, 3).map(formatIssueRow).join("\n")}`
      : "Recent PRs: none returned.",
    evidence.recentCommits.length
      ? `Recent commits:\n${evidence.recentCommits.slice(0, 3).map(formatCommitRow).join("\n")}`
      : "Recent commits: none returned.",
    "",
    `Confidence: ${draft.confidence}`,
    `Duplicate risk: ${draft.duplicateRisk}`,
    "",
    "_Generated by Coral Compass from Discord context and Coral source evidence._"
  ].join("\n");
}

function formatSkippedTriage(
  repoSlug: string,
  draft: z.infer<typeof triageDraftSchema>,
  evidence: Awaited<ReturnType<typeof collectTriageEvidence>>
) {
  return [
    "**Triage Skipped**",
    `Repo: \`${repoSlug}\``,
    "",
    formatDraft(draft),
    "",
    formatEvidence(evidence)
  ].join("\n");
}

function formatDraft(draft: z.infer<typeof triageDraftSchema>) {
  return [
    `**Draft**: ${draft.title}`,
    `Confidence: ${draft.confidence}`,
    `Duplicate risk: ${draft.duplicateRisk}`,
    `Labels: ${draft.labels.join(", ") || "none"}`,
    "",
    draft.summary
  ].join("\n");
}

function formatEvidence(evidence: Awaited<ReturnType<typeof collectTriageEvidence>>) {
  return [
    "**Coral Evidence Checked**",
    `- Related GitHub issues: ${evidence.relatedIssues.length}`,
    `- Recent GitHub PRs: ${evidence.recentPrs.length}`,
    `- Recent GitHub commits: ${evidence.recentCommits.length}`,
    evidence.relatedIssues.length
      ? `- Closest issue: ${formatIssueRow(evidence.relatedIssues[0])}`
      : "- Closest issue: none returned"
  ].join("\n");
}

function compactDiscordMessages(messages: DiscordContextMessage[]) {
  return messages
    .filter((message) => message.content.trim())
    .slice(-12)
    .map((message) => {
      const content = message.content.replace(/\s+/g, " ").slice(0, 500);
      return `- ${message.author}: ${content}`;
    })
    .join("\n")
    .slice(0, 5000);
}

function extractKeywords(context: string) {
  const stopWords = new Set([
    "about",
    "after",
    "again",
    "could",
    "discord",
    "error",
    "fails",
    "from",
    "have",
    "issue",
    "should",
    "that",
    "there",
    "this",
    "when",
    "with",
    "would"
  ]);

  const counts = new Map<string, number>();
  for (const word of context.toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g) ?? []) {
    if (!stopWords.has(word)) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function formatIssueRow(row?: CoralRow) {
  if (!row) {
    return "none";
  }
  return `#${row.number} ${firstLine(row.title)} (${row.state ?? "unknown"})`;
}

function formatCommitRow(row: CoralRow) {
  return `${String(row.sha ?? "").slice(0, 7)} ${firstLine(row.commit__message)}`;
}

function firstLine(value: unknown, maxLength = 110) {
  const line = String(value ?? "unknown").split("\n")[0] ?? "";
  return line.length > maxLength ? `${line.slice(0, maxLength - 1)}...` : line;
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}
