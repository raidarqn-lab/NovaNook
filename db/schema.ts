import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const boardUpdates = sqliteTable("board_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  meta: text("meta").notNull().default(""),
  translations: text("translations").notNull().default("{}"),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  updatedBy: text("updated_by").notNull().default("Discord"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_board_updates_active_section").on(table.active, table.section)]);
