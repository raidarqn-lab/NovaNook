# The Nova Nook

The Nova Nook is a multilingual alliance bulletin board for Nova Sapphire. It is ready to keep in GitHub and includes a secure Discord slash-command endpoint for publishing updates from a private channel.

## What is included

- English, Arabic, French, German, Korean, Portuguese, Spanish, and Vietnamese
- Right-to-left layout for Arabic
- Localized navigation, status messages, dates, fallback content, and live bulletin fields
- Discord signature verification before any write
- Optional server and private-channel restrictions
- D1 storage for bulletin data and R2 storage for uploaded images
- Expiring updates and one-command section clearing

## Run locally

Requirements: Node.js 22.13 or newer and pnpm 11.25.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The site is built with Vinext for Cloudflare Workers. The Sites project manifest in `.openai/hosting.json` declares the `DB` and `BUCKET` bindings.

## Put the source on GitHub

Create an empty GitHub repository, then push this project directory as the repository root. Keep `.env` files out of Git; `.env.example` contains only the names of the values you will need later.

```bash
git remote add github https://github.com/YOUR-NAME/the-nova-nook.git
git push -u github main
```

## Connect Discord later

1. Create a Discord application and bot in the Discord Developer Portal.
2. Set the application's Interactions Endpoint URL to `https://YOUR-SITE/api/discord`.
3. Add these hosted environment values:
   - `DISCORD_PUBLIC_KEY`: verifies requests really came from Discord.
   - `DISCORD_GUILD_ID`: restricts commands to the Nova Sapphire server.
   - `DISCORD_CHANNEL_ID`: restricts commands to the private publishing channel.
4. On your own computer, set `DISCORD_APPLICATION_ID`, `DISCORD_BOT_TOKEN`, and `DISCORD_GUILD_ID`, then run:

```bash
node scripts/register-discord.mjs
```

The registered `/nova` command is limited to members with Manage Server permission. The endpoint applies an additional server/channel check when those IDs are configured.

### Publishing from the private channel

Use `/nova publish` and choose a section. Add a title, details, optional label, expiration, and image. Choose the language used for the main text.

For fully localized live updates, the optional `translations` field accepts JSON generated from the same prompt. Supported keys are `en`, `ar`, `fr`, `de`, `ko`, `pt`, `es`, and `vi`:

```json
{
  "fr": { "title": "Capture de ville", "body": "Samedi à 13:00 ST", "meta": "Niveau 6" },
  "de": { "title": "Stadteroberung", "body": "Samstag um 13:00 ST", "meta": "Stufe 6" }
}
```

The language selected in the command is always stored automatically. Any missing language safely falls back to the source text, so the board never shows a blank update.

Use `/nova clear` to remove a section. Discord responses are private to the publisher.

## Data model

Each update stores source text, a JSON translation map, author, section, expiration, and optional R2 image reference. Schema changes live in `db/schema.ts`; generated migrations are committed under `drizzle/`.
