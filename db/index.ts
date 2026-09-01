import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

// Was drizzle-orm/netlify-db, which took zero config because Netlify injected the
// connection itself. Vercel does not, so the URL is explicit. The Vercel project
// already carries DATABASE_URL (Neon, store "publicsafetyfacts-db") on both the
// production and preview targets, so this needs no new secret.
//
// Thrown at import time on purpose: a missing URL should stop the function dead
// with a named cause, not surface later as a confusing query error.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export const db = drizzle(url, { schema });
