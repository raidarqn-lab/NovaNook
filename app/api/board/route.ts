import { and, desc, eq, or, gt, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { boardUpdates } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getDb().select().from(boardUpdates)
      .where(and(eq(boardUpdates.active, true), or(isNull(boardUpdates.expiresAt), gt(boardUpdates.expiresAt, new Date()))))
      .orderBy(desc(boardUpdates.createdAt), desc(boardUpdates.id));
    const sections: Record<string, (typeof rows)[number][]> = {};
    for (const row of rows) {
      let translations = {};
      try { translations = JSON.parse(row.translations); } catch {}
      (sections[row.section] ??= []).push({ ...row, translations });
    }
    return Response.json({ sections, updatedAt: rows[0]?.createdAt ?? null });
  } catch {
    return Response.json({ sections: {}, updatedAt: null, error: "Live updates are temporarily unavailable." });
  }
}
