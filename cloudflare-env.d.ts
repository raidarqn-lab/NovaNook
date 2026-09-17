declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    DISCORD_PUBLIC_KEY?: string;
    DISCORD_APPLICATION_ID?: string;
    DISCORD_BOT_TOKEN?: string;
    DISCORD_GUILD_ID?: string;
    DISCORD_CHANNEL_ID?: string;
  }
}
