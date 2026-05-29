import { createDiscordAdapter } from "@chat-adapter/discord";
import { createMemoryState } from "@chat-adapter/state-memory";
import { Result } from "better-result";
import { Chat } from "chat";
import type { DiscordAdapter } from "@chat-adapter/discord";
import { handleSlashCommand } from "@/lib/commands";
import { readEnv } from "@/lib/env";

type BotRuntime = {
  bot: Chat<{ discord: DiscordAdapter }>;
  discordAdapter: DiscordAdapter;
};

let runtime: BotRuntime | undefined;

export function getBotRuntime() {
  return Result.gen(function* () {
    if (runtime) {
      return Result.ok(runtime);
    }

    const env = yield* readEnv();
    const discordAdapter = createDiscordAdapter({
      applicationId: env.DISCORD_APPLICATION_ID,
      botToken: env.DISCORD_BOT_TOKEN,
      publicKey: env.DISCORD_PUBLIC_KEY
    });

    const bot = new Chat({
      userName: "Coral Compass",
      adapters: {
        discord: discordAdapter
      },
      state: createMemoryState()
    });

    bot.onSlashCommand(handleSlashCommand);

    bot.onNewMention(async (thread) => {
      await thread.post(
        "Coral Compass is listening. Try `/pulse`, `/blockers`, `/source-requests`, or `/release-risk`."
      );
    });

    runtime = { bot, discordAdapter };
    return Result.ok(runtime);
  });
}
