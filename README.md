# Coral Compass

Coral Compass is a Discord-first agent shell for Coral product and community intelligence.

This first milestone gets the Discord/Vercel bot surface working. Coral SQL, source specs, and evidence-backed summaries come next.

## Stack

- Next.js on Vercel
- Vercel Chat SDK
- `@chat-adapter/discord`
- `better-result` for typed recoverable errors
- Discord HTTP interactions for slash commands
- Optional Discord Gateway route for mentions/messages

## Commands

```text
/ping
/pulse
/blockers
/source-requests
/release-risk
```

Right now these commands return scaffolded responses. The next milestone is to connect each one to Coral-backed queries.

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
```

Optional for Gateway message/mention listening:

```bash
CRON_SECRET=
DISCORD_MENTION_ROLE_IDS=
```

## Discord Setup

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

Use permissions for sending messages, creating threads, reading message history, adding reactions, and attaching files.

## Register Slash Commands

After env vars are set:

```bash
pnpm discord:register
```

This registers the global Discord commands from `src/lib/commands.ts`.

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
