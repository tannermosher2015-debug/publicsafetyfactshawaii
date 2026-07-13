import type { Config, Context } from "@netlify/functions";

// Adds a newsletter signup to a Resend Audience. The API key lives in a Netlify
// env var (RESEND_API_KEY) and never reaches the browser — the NewsletterSignup
// React component POSTs { email } here, this function makes the authenticated
// call. RESEND_AUDIENCE_ID picks which audience the contact lands in.
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { email?: unknown; "bot-field"?: unknown } | null;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot: a real user never fills bot-field. If it's set, pretend success.
  const hp = body?.["bot-field"];
  if (typeof hp === "string" && hp.trim() !== "") {
    return Response.json({ ok: true });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    // Env vars not set yet — surface it instead of silently dropping signups.
    return Response.json({ error: "Newsletter not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );

  // Resend returns 201 for a new contact; an existing email also resolves ok.
  if (!res.ok) {
    return Response.json({ error: "Subscribe failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
};

export const config: Config = {
  path: "/api/subscribe",
};
