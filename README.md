# Coral Compass

Coral Compass is a Discord-first agent shell for Coral product and community intelligence.

The deployed v0 lets a Discord server ask Coral-backed questions and turn recent Discord context into evidence-backed GitHub issues.

## Stack

- Next.js on Vercel
- Vercel Chat SDK
- `@chat-adapter/discord`
- `better-result` for typed recoverable errors
- Discord HTTP interactions for slash commands

## Commands

```text
/ping
/ask
/triage
/pulse
/blockers
/source-requests
/release-risk
```

`/ask`, `/pulse`, `/source-requests`, `/release-risk`, and `/triage` use Coral-backed evidence where the configured sources are available.

## Environment

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Required:

```bash
DISCORD_BOT_TOKEN=
DISCORD_PUBLIC_KEY=
DISCORD_APPLICATION_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_GATEWAY_API_KEY=
```

Required for `/triage` to create GitHub issues:

```bash
GITHUB_TOKEN=
```

Optional:

```bash
CRON_SECRET=
DISCORD_MENTION_ROLE_IDS=
```

## Discord Setup

To add the bot to a Discord server, open this install link:

```text
https://discord.com/oauth2/authorize?client_id=1450425908719517707&permissions=311385230336&integration_type=0&scope=bot+applications.commands
```

1. Create a Discord application in the Discord Developer Portal.
2. Copy the Application ID into `DISCORD_APPLICATION_ID`.
3. Copy the Public Key into `DISCORD_PUBLIC_KEY`.
4. Create a bot token and set `DISCORD_BOT_TOKEN`.
5. Set the Interactions Endpoint URL:

```text
https://YOUR_DOMAIN/api/webhooks/discord
```

For local testing, expose the Next dev server with a tunnel:

```bash
ngrok http 3000
```

Then use:

```text
https://YOUR_NGROK_DOMAIN/api/webhooks/discord
```

6. Invite the bot with these scopes:

```text
bot
applications.commands
```

Use permissions for viewing channels, sending messages, reading message history, creating threads, sending messages in threads, adding reactions, and attaching files.

## Register Slash Commands

After env vars are set:

```bash
pnpm discord:register
```

This registers the global Discord commands from `src/lib/commands.ts`.

## Triage Workflow

`/triage repo:owner/repo` turns recent Discord channel context into an evidence-backed GitHub issue. Coral checks related GitHub issues, PRs, and commits. If `GITHUB_TOKEN` is not set, the command returns the issue draft without creating it.

## Development

```bash
pnpm install
pnpm dev
```

Health check:

```text
http://localhost:3000/api/health
```

## Verification

```bash
pnpm typecheck
pnpm build
```

## Next Coral Milestone

The intended Coral integration points:

- `src/lib/commands.ts`: route slash commands to Coral query workflows
- `coral/queries/*.sql`: keep the query layer visible and demoable
- `data/*.jsonl` or Parquet: file-backed Discord/community/transcript fixtures
- Coral GitHub/PostHog/File sources: join community pain, product usage, and repo activity
