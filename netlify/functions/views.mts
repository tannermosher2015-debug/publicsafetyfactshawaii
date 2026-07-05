import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { pageViews } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async (req: Request, context: Context) => {
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

export const config: Config = {
  path: "/api/views",
};
