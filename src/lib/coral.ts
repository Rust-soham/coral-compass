import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Result, TaggedError } from "better-result";

const execFileAsync = promisify(execFile);

export class CoralCliError extends TaggedError("CoralCliError")<{
  message: string;
  query?: string;
  stderr?: string;
  cause?: unknown;
}>() {}

type CoralRow = Record<string, unknown>;

const coralBin = process.env.CORAL_BIN ?? `${process.env.HOME}/.local/bin/coral`;

export async function coralSql(query: string) {
  return Result.gen(async function* () {
    const { stdout } = yield* Result.await(
      Result.tryPromise({
        try: () =>
          execFileAsync(coralBin, ["sql", "--format", "json", query], {
            timeout: 30_000,
            maxBuffer: 1024 * 1024 * 4
          }),
        catch: (error) =>
          new CoralCliError({
            message: "Coral SQL query failed",
            query,
            stderr:
              typeof error === "object" && error && "stderr" in error
                ? String(error.stderr)
                : undefined,
            cause: error
          })
      })
    );

    const rows = yield* Result.try({
      try: () => JSON.parse(stdout) as CoralRow[],
      catch: (error) =>
        new CoralCliError({
          message: "Coral SQL returned invalid JSON",
          query,
          cause: error
        })
    });

    return Result.ok(rows);
  });
}

export async function coralSourceList() {
  return Result.gen(async function* () {
    const { stdout } = yield* Result.await(
      Result.tryPromise({
        try: () =>
          execFileAsync(coralBin, ["source", "list"], {
            timeout: 10_000,
            maxBuffer: 1024 * 1024
          }),
        catch: (error) =>
          new CoralCliError({
            message: "Failed to list Coral sources",
            cause: error
          })
      })
    );

    return Result.ok(stdout.trim());
  });
}

export function table(rows: CoralRow[], columns: string[]) {
  if (rows.length === 0) {
    return "_No rows._";
  }

  return rows
    .map((row) =>
      columns
        .map((column) => `${column}: ${String(row[column] ?? "unknown")}`)
        .join(" | ")
    )
    .join("\n");
}
