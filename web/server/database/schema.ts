import { pgTable, pgEnum, text, timestamp } from "drizzle-orm/pg-core";

export const mapsDataId = pgEnum("maps_data_id", ["modes", "floors", "behaviors", "places", "detail", "map"]);

export const mapsData = pgTable("maps_data", {
  id: mapsDataId("id").primaryKey(),
  content: text("content").notNull(),
  editedAt: timestamp("edited_at", { withTimezone: true }).notNull().defaultNow(), // 挿入時はDBが自動で現在時刻を設定
});
