import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  pagePath: text("page_path").primaryKey(),
  viewCount: integer("view_count").notNull().default(0),
});

// One row per post that has been emailed to the newsletter audience. Presence of
// a slug means "already sent" — the scheduled send-newsletter function uses this
// to avoid re-sending, and backfills every existing post here on its first run.
export const newsletterSends = pgTable("newsletter_sends", {
  slug: text("slug").primaryKey(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});
