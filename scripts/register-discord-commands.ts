import { config } from "dotenv";
import { Result, TaggedError } from "better-result";
import { discordApplicationCommands } from "../src/lib/commands";
import { readEnv } from "../src/lib/env";

config({ path: ".env.local" });
config();

class DiscordRegistrationError extends TaggedError("DiscordRegistrationError")<{
  message: string;
  status?: number;
  body?: string;
}>() {}

const result = await Result.gen(async function* () {
  const env = yield* readEnv();

  const response = yield* Result.await(
    Result.tryPromise({
      try: () =>
        fetch(
          `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(discordApplicationCommands)
          }
        ),
      catch: (error) =>
        new DiscordRegistrationError({
          message: "Failed to call Discord command registration API",
          body: error instanceof Error ? error.message : String(error)
        })
    })
  );

  if (!response.ok) {
    const body = yield* Result.await(
      Result.tryPromise({
        try: () => response.text(),
        catch: (error) =>
          new DiscordRegistrationError({
            message: "Failed to read Discord error response",
            status: response.status,
            body: error instanceof Error ? error.message : String(error)
          })
      })
    );

    yield* new DiscordRegistrationError({
      message: "Discord rejected command registration",
      status: response.status,
      body
    });
  }

  return Result.ok(discordApplicationCommands.length);
});

result.match({
  ok: (count) => {
    console.log(`Registered ${count} Discord commands.`);
  },
  err: (error) => {
    console.error(error.message);
    if ("issues" in error) {
      console.error(error.issues.join("\n"));
    }
    if ("body" in error && error.body) {
      console.error(error.body);
    }
    process.exit(1);
  }
});
