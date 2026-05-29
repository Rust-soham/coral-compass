import { Result } from "better-result";
import type { SlashCommandEvent } from "chat";
import { coralSourceList, coralSql, table } from "@/lib/coral";
import { DiscordCommandError } from "@/lib/errors";

type CommandName = "/ping" | "/pulse" | "/blockers" | "/source-requests" | "/release-risk";

const fallbackCopy: Record<CommandName, string> = {
  "/ping": "Coral Compass is online. Coral wiring comes next.",
  "/pulse": [
    "**Coral Compass Pulse**",
    "",
    "Bot shell is live. Next milestone: join Coral-backed GitHub, Discord/community, transcript, and product analytics evidence.",
    "",
    "**Evidence sources planned**",
    "- GitHub issues and PRs",
    "- Discord/community support logs",
    "- Livestream transcript",
    "- PostHog usage events when available",
    "- File-backed webhook exports"
  ].join("\n"),
  "/blockers": [
    "**Builder Blockers**",
    "",
    "Coral query layer is not connected yet. This command is reserved for ranking recurring user pain from Discord logs, GitHub issues, and docs/transcript mentions."
  ].join("\n"),
  "/source-requests": [
    "**Source Requests**",
    "",
    "Coral query layer is not connected yet. This command will rank requested sources and compare them against bundled Coral sources."
  ].join("\n"),
  "/release-risk": [
    "**Release Risk**",
    "",
    "Coral query layer is not connected yet. This command will connect recent PRs, issues, support chatter, and product events into a release-readiness brief."
  ].join("\n")
};

export function isKnownCommand(command: string): command is CommandName {
  return command in fallbackCopy;
}

function coralErrorMessage(error: { message: string; stderr?: string }) {
  const detail = error.stderr ? `\n\n\`\`\`text\n${error.stderr.slice(0, 900)}\n\`\`\`` : "";
  return `Coral query failed: ${error.message}${detail}`;
}

export async function getCommandResponse(command: string) {
  if (!isKnownCommand(command)) {
    return `Unknown command \`${command}\`. Try \`/ping\`, \`/pulse\`, \`/blockers\`, \`/source-requests\`, or \`/release-risk\`.`;
  }

  if (command === "/ping") {
    return fallbackCopy[command];
  }

  if (command === "/pulse") {
    const [sources, eventCounts, tables] = await Promise.all([
      coralSourceList(),
      coralSql(
        "select type, count(*) as events from codex.events where year = 2026 and month = 5 and day = 29 group by type order by events desc limit 10"
      ),
      coralSql("select schema_name, table_name, description from coral.tables order by schema_name, table_name")
    ]);

    if (sources.isErr()) {
      return coralErrorMessage(sources.error);
    }
    if (eventCounts.isErr()) {
      return coralErrorMessage(eventCounts.error);
    }
    if (tables.isErr()) {
      return coralErrorMessage(tables.error);
    }

    return [
      "**Coral Compass Pulse**",
      "",
      "Coral is live and queryable from Discord.",
      "",
      "**Installed Sources**",
      `\`\`\`text\n${sources.value || "No sources configured."}\n\`\`\``,
      "**Today From Coral `codex.events`**",
      table(eventCounts.value, ["type", "events"]),
      "",
      "**Queryable Coral Tables**",
      table(tables.value, ["schema_name", "table_name"])
    ].join("\n");
  }

  if (command === "/source-requests") {
    const rows = await coralSql(
      "select schema_name, table_name, description from coral.tables where schema_name in ('github', 'posthog', 'slack', 'codex') order by schema_name, table_name"
    );

    if (rows.isErr()) {
      return coralErrorMessage(rows.error);
    }

    return [
      "**Source Coverage Check**",
      "",
      "Current useful bundled sources for Coral Compass: GitHub, PostHog, Slack, and Codex.",
      "Missing for this project: Discord. For now, Discord community messages should be ingested as JSONL/Parquet through a file-backed source; a proper Discord source spec is a strong later contribution.",
      "",
      "**Currently Queryable Here**",
      table(rows.value, ["schema_name", "table_name"])
    ].join("\n");
  }

  if (command === "/blockers") {
    return [
      "**Builder Blockers**",
      "",
      "Coral is wired, but the live enterprise evidence set is not complete yet.",
      "",
      "1. GitHub source needs `GITHUB_TOKEN` before querying `withcoral/coral` issues and PRs.",
      "2. Discord has no bundled Coral source, so we need a JSONL/Parquet export or webhook receiver next.",
      "3. PostHog can be added later with `POSTHOG_API_KEY` if product analytics are available.",
      "",
      "Working now: Coral CLI from Discord plus `codex.events` as a real file-backed source."
    ].join("\n");
  }

  if (command === "/release-risk") {
    return [
      "**Release Risk**",
      "",
      "GitHub is the next source to connect. Once `GITHUB_TOKEN` is available, this command can query Coral's GitHub tables for recent PRs, issues, reviews, and cache/source-spec changes.",
      "",
      "For now, `/pulse` proves the Discord to Coral query loop is working."
    ].join("\n");
  }

  return fallbackCopy[command];
}

export async function handleSlashCommand(event: SlashCommandEvent) {
  console.info("[coral-compass] slash command received", {
    command: event.command,
    text: event.text,
    user: event.user.userName
  });

  const result = await Result.tryPromise({
    try: async () => {
      if (!isKnownCommand(event.command)) {
        await event.channel.post(await getCommandResponse(event.command));
        return;
      }

      await event.channel.post(await getCommandResponse(event.command));
      console.info("[coral-compass] slash command response posted", {
        command: event.command
      });
    },
    catch: (error) =>
      new DiscordCommandError({
        cause: error,
        message: `Failed to handle ${event.command}`
      })
  });

  result.tapError((error) => {
    console.error(error.message, error.cause);
  });
}

export const discordApplicationCommands = [
  {
    name: "ping",
    description: "Check whether Coral Compass is online"
  },
  {
    name: "pulse",
    description: "Summarize Coral community and product signal"
  },
  {
    name: "blockers",
    description: "Find the main things blocking Coral builders"
  },
  {
    name: "source-requests",
    description: "Rank requested Coral sources"
  },
  {
    name: "release-risk",
    description: "Brief the team on release risks"
  }
] as const;
