import { Result } from "better-result";
import type { SlashCommandEvent } from "chat";
import { DiscordCommandError } from "@/lib/errors";

type CommandName = "/ping" | "/pulse" | "/blockers" | "/source-requests" | "/release-risk";

export const commandCopy: Record<CommandName, string> = {
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
  return command in commandCopy;
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
        await event.channel.post(
          `Unknown command \`${event.command}\`. Try \`/ping\`, \`/pulse\`, \`/blockers\`, \`/source-requests\`, or \`/release-risk\`.`
        );
        return;
      }

      await event.channel.post(commandCopy[event.command]);
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
