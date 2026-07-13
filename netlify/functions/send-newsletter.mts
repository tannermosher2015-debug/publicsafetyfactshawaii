import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletterSends } from "../../db/schema.js";

// Daily scheduled sender. Reads the site's own RSS feed, and for any post not
// yet recorded in newsletter_sends, sends a Resend broadcast to the audience and
// records it. The RSS feed is the source of truth for "what has been published";
// newsletter_sends is the source of truth for "what has already gone out".
//
// Safety model (do not weaken):
//  - FIRST run (table empty) backfills every current post as already-sent and
//    emails nothing, so setup never blasts the whole archive to subscribers.
//  - Hard cap of MAX_PER_RUN sends per run, and only posts newer than
//    RECENCY_DAYS, as a runaway backstop if state is ever lost.
//  - A slug is recorded only AFTER a successful send, so failures retry next run.

const SITE_URL = "https://publicsafetyfactshawaii.org";
const RSS_URL = `${SITE_URL}/rss.xml`;
const MAX_PER_RUN = 2;
const RECENCY_DAYS = 21;

type Item = { slug: string; link: string; title: string; description: string; pubMs: number };

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function htmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ponytail: regex parse of our OWN generated feed (stable, controlled format).
// If the feed ever gains CDATA or nested markup, switch to a real XML parser.
function parseItems(xml: string): Item[] {
  const items: Item[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const pick = (tag: string) => {
      const mm = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return mm ? mm[1].trim() : "";
    };
    const link = pick("link");
    const slug = link.split("/").filter(Boolean).pop() ?? link;
    items.push({
      slug,
      link,
      title: unescapeXml(pick("title")),
      description: unescapeXml(pick("description")),
      pubMs: Date.parse(pick("pubDate")) || 0,
    });
  }
  return items;
}

function emailHtml(item: Item): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f3f6f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;">
        <tr><td style="background:#0F1F3D;padding:20px 28px;">
          <span style="color:#C9A84C;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-family:Arial,sans-serif;">PublicSafetyFactsHawaii</span>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;">
          <h1 style="margin:0 0 16px;color:#0F1F3D;font-size:26px;line-height:1.25;">${htmlEscape(item.title)}</h1>
          <p style="margin:0 0 24px;color:#333333;font-size:16px;line-height:1.6;">${htmlEscape(item.description)}</p>
          <a href="${item.link}" style="display:inline-block;background:#0F1F3D;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:6px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Read the full article</a>
        </td></tr>
        <tr><td style="padding:28px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
            You are receiving this because you subscribed at publicsafetyfactshawaii.org.<br/>
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#64748b;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendBroadcast(
  item: Item,
  opts: { apiKey: string; audienceId: string; from: string },
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${opts.apiKey}`,
    "Content-Type": "application/json",
  };
  const create = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      audience_id: opts.audienceId,
      from: opts.from,
      subject: item.title,
      html: emailHtml(item),
    }),
  });
  if (!create.ok) {
    throw new Error(`create broadcast ${create.status}: ${await create.text()}`);
  }
  const { id } = (await create.json()) as { id: string };

  const send = await fetch(`https://api.resend.com/broadcasts/${id}/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!send.ok) {
    throw new Error(`send broadcast ${send.status}: ${await send.text()}`);
  }
}

export default async () => {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !audienceId || !from) {
    console.log("send-newsletter: env not configured, skipping");
    return new Response("not configured", { status: 200 });
  }

  const res = await fetch(RSS_URL, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) {
    console.log(`send-newsletter: rss fetch failed ${res.status}`);
    return new Response("rss fetch failed", { status: 200 });
  }
  const items = parseItems(await res.text());
  if (!items.length) return new Response("no items", { status: 200 });

  const sent = await db
    .select({ slug: newsletterSends.slug })
    .from(newsletterSends);
  const sentSet = new Set(sent.map((r) => r.slug));

  // First-ever run: adopt the whole archive as already-sent, email nothing.
  if (sentSet.size === 0) {
    await db
      .insert(newsletterSends)
      .values(items.map((i) => ({ slug: i.slug })))
      .onConflictDoNothing();
    console.log(`send-newsletter: backfilled ${items.length} posts, sent 0`);
    return new Response(`backfilled ${items.length}`, { status: 200 });
  }

  const cutoff = Date.now() - RECENCY_DAYS * 86_400_000;
  // Newest-first from the feed; take the newest unsent+recent, send oldest-first.
  const toSend = items
    .filter((i) => !sentSet.has(i.slug) && i.pubMs >= cutoff)
    .slice(0, MAX_PER_RUN)
    .reverse();

  let count = 0;
  for (const item of toSend) {
    try {
      await sendBroadcast(item, { apiKey, audienceId, from });
      await db
        .insert(newsletterSends)
        .values({ slug: item.slug })
        .onConflictDoNothing();
      count++;
    } catch (err) {
      // Not recorded, so it retries on the next run.
      console.error(`send-newsletter: failed for ${item.slug}:`, err);
    }
  }
  console.log(`send-newsletter: sent ${count}`);
  return new Response(`sent ${count}`, { status: 200 });
};

export const config: Config = {
  schedule: "0 15 * * *", // 15:00 UTC = 05:00 HST, daily
};
