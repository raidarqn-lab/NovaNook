import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { boardUpdates } from "../../../db/schema";

export const dynamic = "force-dynamic";
const encoder = new TextEncoder();
const hex = (value: string) => new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
const sections = new Set(["bulletin", "tasks", "captures", "strategy", "train", "hammer", "spotlight", "meme", "battle"]);
const languages = new Set(["en", "ar", "fr", "de", "ko", "pt", "es", "vi"]);
type Translation = { title?: string; body?: string; meta?: string };

async function verify(request: Request, body: string) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp || !env.DISCORD_PUBLIC_KEY) return false;
  try {
    const key = await crypto.subtle.importKey("raw", hex(env.DISCORD_PUBLIC_KEY), { name: "Ed25519" }, false, ["verify"]);
    return crypto.subtle.verify("Ed25519", key, hex(signature), encoder.encode(timestamp + body));
  } catch { return false; }
}

function reply(content: string) { return Response.json({ type: 4, data: { content, flags: 64 } }); }
type Option = { name: string; value?: string | number; options?: Option[] };
const optionMap = (options: Option[] = []) => Object.fromEntries(options.map((item) => [item.name, item.value]));

function parseTranslations(value: unknown): Record<string, Translation> {
  if (!value) return {};
  const parsed = JSON.parse(String(value));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Translations must be a JSON object.");
  const result: Record<string, Translation> = {};
  for (const [language, fields] of Object.entries(parsed)) {
    if (!languages.has(language) || !fields || typeof fields !== "object" || Array.isArray(fields)) continue;
    const item = fields as Translation;
    result[language] = {
      title: typeof item.title === "string" ? item.title.slice(0, 100) : undefined,
      body: typeof item.body === "string" ? item.body.slice(0, 1000).replaceAll("|", "\n") : undefined,
      meta: typeof item.meta === "string" ? item.meta.slice(0, 100) : undefined,
    };
  }
  return result;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!(await verify(request, raw))) return new Response("Invalid signature", { status: 401 });
  const interaction = JSON.parse(raw);
  if (interaction.type === 1) return Response.json({ type: 1 });
  if (interaction.type !== 2 || interaction.data?.name !== "nova") return reply("That command is not available.");
  if (env.DISCORD_GUILD_ID && interaction.guild_id !== env.DISCORD_GUILD_ID) return reply("This command is restricted to the Nova Sapphire server.");
  if (env.DISCORD_CHANNEL_ID && interaction.channel_id !== env.DISCORD_CHANNEL_ID) return reply("Please use the private Nova Nook publishing channel.");
  const sub = interaction.data.options?.[0];
  const values = optionMap(sub?.options);
  const db = getDb();

  if (sub?.name === "clear") {
    const section = String(values.section ?? "");
    if (!sections.has(section)) return reply("That board section is not available.");
    await db.update(boardUpdates).set({ active: false }).where(eq(boardUpdates.section, section));
    return reply(`✦ ${section} has been cleared from The Nova Nook.`);
  }

  if (sub?.name === "publish") {
    const section = String(values.section ?? "");
    if (!sections.has(section)) return reply("That board section is not available.");
    const title = String(values.title ?? "").trim();
    const body = String(values.details ?? "").trim().replaceAll("|", "\n");
    const meta = String(values.meta ?? "").trim();
    const sourceLanguage = languages.has(String(values.language ?? "en")) ? String(values.language ?? "en") : "en";
    let translations: Record<string, Translation>;
    try { translations = parseTranslations(values.translations); } catch { return reply("Translations could not be read. Use valid JSON, or leave that field empty."); }
    translations[sourceLanguage] = { title, body, meta };
    const expiryHours = Number(values.expires ?? 168);
    const attachmentId = values.image ? String(values.image) : "";
    const attachment = attachmentId ? interaction.data.resolved?.attachments?.[attachmentId] : null;
    let imageKey: string | null = null;
    let imageUrl: string | null = null;
    if (attachment?.url && env.BUCKET) {
      const image = await fetch(attachment.url);
      if (image.ok) {
        imageKey = `${crypto.randomUUID()}-${String(attachment.filename ?? "image").replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        await env.BUCKET.put(imageKey, image.body, { httpMetadata: { contentType: image.headers.get("content-type") ?? "application/octet-stream" } });
        imageUrl = `/api/media/${encodeURIComponent(imageKey)}`;
      }
    }
    await db.update(boardUpdates).set({ active: false }).where(eq(boardUpdates.section, section));
    await db.insert(boardUpdates).values({
      section, title, body, meta, translations: JSON.stringify(translations), imageKey, imageUrl,
      updatedBy: interaction.member?.user?.global_name ?? interaction.member?.user?.username ?? "Discord",
      active: true,
      expiresAt: expiryHours > 0 ? new Date(Date.now() + expiryHours * 60 * 60 * 1000) : null,
      createdAt: new Date(),
    });
    const languageCount = Object.keys(translations).length;
    return reply(`✦ Published **${title}** to **${section}** on The Nova Nook in ${languageCount} language${languageCount === 1 ? "" : "s"}.`);
  }
  return reply("Choose Publish or Clear.");
}
