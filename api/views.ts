import { db } from "../db/index.js";
import { pageViews } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

// Vercel routes this file at /api/views by its path, so the Netlify `config.path`
// export is gone. The handler body below is unchanged from the Netlify version;
// only the export wrapper differs, which is why it is a named const rather than
// being inlined into the object.
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST") {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const pagePath = (body as { pagePath?: unknown } | null)?.pagePath;

    if (
      !pagePath ||
      typeof pagePath !== "string" ||
      !pagePath.startsWith("/") ||
      pagePath.length > 200
    ) {
      return Response.json(
        { error: "pagePath must start with / and be <=200 chars" },
        { status: 400 },
      );
    }

    const [result] = await db
      .insert(pageViews)
      .values({ pagePath, viewCount: 1 })
      .onConflictDoUpdate({
        target: pageViews.pagePath,
        set: { viewCount: sql`${pageViews.viewCount} + 1` },
      })
      .returning();

    return Response.json({ viewCount: result.viewCount });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const pagePath = url.searchParams.get("pagePath");

    if (pagePath) {
      const [result] = await db
        .select()
        .from(pageViews)
        .where(eq(pageViews.pagePath, pagePath));

      return Response.json({ viewCount: result?.viewCount ?? 0 });
    }

    const allViews = await db.select().from(pageViews);
    return Response.json(allViews);
  }

  return new Response("Method not allowed", { status: 405 });
};

export default { fetch: handler };
