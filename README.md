# Coral Compass

Coral Compass is a Discord-first agent for turning community and product conversations into evidence-backed engineering work.

The v0 is live as a Discord slash-command bot. It lets a team ask Coral-backed questions from Discord, inspect GitHub activity through Coral, and turn recent Discord channel context into a GitHub issue.

## Live Demo

Production endpoint:

```text
https://coral-hackathon-inky.vercel.app
```

Discord interactions endpoint:

```text
https://coral-hackathon-inky.vercel.app/api/webhooks/discord
```

Install link:

```text
https://discord.com/oauth2/authorize?client_id=1450425908719517707&permissions=311385230336&integration_type=0&scope=bot+applications.commands
```

## Why It Matters

Discord is where users describe bugs, blockers, and feature requests. GitHub is where engineering teams actually do the work. Coral Compass connects those surfaces with Coral as the evidence layer, so a noisy chat thread can become a focused issue with repository context attached.

The product is intentionally narrow:

```text
Discord conversation -> AI Gateway model -> Coral GitHub evidence -> GitHub issue -> Discord answer
```

## Core Workflow

`/ask` answers questions using AI SDK tool calls against Coral SQL.

Example:

```text
/ask question:what are the latest open PRs in withcoral/coral?
```

`/triage` turns recent Discord channel context into a GitHub issue.

Example:

```text
/triage repo:Rust-soham/coral-compass
```

The triage command:

- reads recent Discord messages from the channel
- asks the AI Gateway model to draft a concise work item
- queries Coral GitHub sources for related issues, recent PRs, and commits
- creates a GitHub issue when `GITHUB_TOKEN` has repo issue access
- replies in Discord with the issue link and evidence summary

If GitHub issue creation is not configured, `/triage` returns a ready-to-file draft instead of failing.

## Coral Usage

Coral Compass uses Coral as the local SQL evidence layer for external product and engineering data.

Current source usage:

- `github.issues`: duplicate and related-work checks
- `github.pulls`: recent pull request context
- `github.commits`: recent implementation activity
- `coral.tables` / `coral.columns`: source and schema introspection
- `codex.events`: local agent/session signal where available

The bot exposes Coral-backed tools to the AI SDK model, then returns compact Discord-native answers.

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

## Stack

- Next.js on Vercel
- Discord HTTP interactions
- AI SDK through Vercel AI Gateway
- Coral CLI / Coral SQL
- GitHub source spec
- `better-result` for typed recoverable errors
- `@chat-adapter/discord`

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
GITHUB_TOKEN=
```

Optional:

```bash
CRON_SECRET=
DISCORD_MENTION_ROLE_IDS=
```

## Discord Setup

Set the Discord Developer Portal interactions endpoint to:

```text
https://YOUR_DOMAIN/api/webhooks/discord
```

Register slash commands:

```bash
pnpm discord:register
```

Install the bot with scopes:

```text
bot
applications.commands
```

Required permissions include viewing channels, sending messages, reading message history, creating threads, sending messages in threads, adding reactions, and attaching files.

## Local Development

```bash
pnpm install
pnpm dev
```

Health check:

```text
http://localhost:3000/api/health
```

Verification:

```bash
pnpm typecheck
pnpm build
```

## V0 Deployment Note

The Discord Gateway listener is disabled for the Vercel Hobby deployment. The shipped v0 uses Discord HTTP interactions at `/api/webhooks/discord`, which is the path Discord verifies and calls for slash commands.
