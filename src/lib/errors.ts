import { TaggedError } from "better-result";

export class EnvError extends TaggedError("EnvError")<{
  issues: string[];
  message: string;
}>() {}

export class DiscordCommandError extends TaggedError("DiscordCommandError")<{
  message: string;
  cause?: unknown;
}>() {}
