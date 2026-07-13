CREATE TABLE "newsletter_sends" (
	"slug" text PRIMARY KEY,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
