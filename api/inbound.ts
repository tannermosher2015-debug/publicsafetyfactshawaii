import { createHmac, timingSafeEqual } from "node:crypto";

// Forwards mail sent to any @publicsafetyfactshawaii.org address (the apex MX
// points at Resend receiving) to a real inbox. Resend POSTs an `email.received`
// webhook here with metadata only; we fetch the parsed body, download the raw
// message, and send it on with the original attached as forwarded_message.eml.
// Reply-To is the original sender, so hitting Reply in the inbox answers them.
//
// Env: RESEND_API_KEY, RESEND_WEBHOOK_SECRET (whsec_..., from the webhook),
// FORWARD_TO (the inbox; never on this domain or every forward loops back),
// RESEND_FROM (the sending identity the newsletter already uses).

const OWN_DOMAIN = "@publicsafetyfactshawaii.org";
const TOLERANCE_S = 5 * 60;

// Svix scheme: HMAC-SHA256 over `${id}.${timestamp}.${rawBody}`, keyed by the
// base64 part of the whsec_ secret; the header holds space-separated `v1,<sig>`.
export function verifySignature(
  secret: string,
  id: string | null,
  timestamp: string | null,
  signatureHeader: string | null,
  body: string,
  nowS = Math.floor(Date.now() / 1000),
): boolean {
  if (!id || !timestamp || !signatureHeader) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowS - ts) > TOLERANCE_S) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signatureHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const forwardTo = process.env.FORWARD_TO;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !secret || !forwardTo || !from || forwardTo.toLowerCase().endsWith(OWN_DOMAIN)) {
    // 500 makes Resend retry, so mail is not lost while config is fixed.
    return Response.json({ error: "Inbound forwarding not configured" }, { status: 500 });
  }

  const body = await req.text();
  const h = req.headers;
  if (!verifySignature(secret, h.get("svix-id"), h.get("svix-timestamp"), h.get("svix-signature"), body)) {
    return Response.json({ error: "Bad signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as { type?: string; data?: { email_id?: string } };
  const emailId = event.data?.email_id;
  if (event.type !== "email.received" || !emailId) {
    return Response.json({ ok: true, ignored: event.type ?? null });
  }

  const auth = { Authorization: `Bearer ${apiKey}` };
  const got = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, { headers: auth });
  if (!got.ok) {
    return Response.json({ error: "Fetch received email failed" }, { status: 502 });
  }
  const email = (await got.json()) as {
    from?: string;
    to?: string[];
    subject?: string | null;
    text?: string | null;
    html?: string | null;
    raw?: { download_url?: string } | null;
  };

  const attachments: { filename: string; content: string; content_type: string }[] = [];
  if (email.raw?.download_url) {
    const raw = await fetch(email.raw.download_url);
    if (raw.ok) {
      attachments.push({
        filename: "forwarded_message.eml",
        content: Buffer.from(await raw.arrayBuffer()).toString("base64"),
        content_type: "message/rfc822",
      });
    }
  }

  const subject = email.subject || "(no subject)";
  const banner = `Forwarded from ${(email.to ?? []).join(", ")}. From: ${email.from ?? "unknown"}`;
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": "application/json",
      // Resend retries webhooks; the same key makes a retry a no-op send.
      "Idempotency-Key": `fwd-${emailId}`,
    },
    body: JSON.stringify({
      from,
      to: [forwardTo],
      reply_to: email.from ? [email.from] : undefined,
      subject: subject.startsWith("Fwd:") ? subject : `Fwd: ${subject}`,
      text: `${banner}\n\n${email.text ?? "(no plain-text body, see the attached original)"}`,
      html: email.html ? `<p>${banner.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p><hr>${email.html}` : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });
  if (!sent.ok) {
    return Response.json({ error: "Forward send failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
};

export default { fetch: handler };
