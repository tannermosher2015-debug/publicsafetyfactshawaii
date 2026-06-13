import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  pagePath: text("page_path").primaryKey(),
  viewCount: integer("view_count").notNull().default(0),
});
