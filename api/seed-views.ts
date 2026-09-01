import { db } from "../db/index.js";
import { pageViews } from "../db/schema.js";
import { sql } from "drizzle-orm";

// THROWAWAY. Delete this file as soon as it has run once.
//
// Why it exists: the live counts live in Netlify's database and the Vercel/Neon
// store is a different, empty one. Vercel refuses to export sensitive env values
// ("16 Secret values cannot be pulled"), so DATABASE_URL cannot be read locally to
// run scripts/seed-page-views.mjs. The deployed function already holds the real
// value, so the seed runs in here instead.
//
// Safe to be briefly unauthenticated, which is the only reason it ships without a
// secret: it REFUSES once the table has real content (>= 5 rows), and it only ever
// raises a count via greatest(), never lowers one. A stranger hitting it during the
// few minutes it exists can do nothing but re-apply these same 19 rows.
//
// Rows generated from db/seed/page_views-2026-09-01.json by machine, not retyped.
const SEED: Array<{ pagePath: string; viewCount: number }> = [
  { pagePath: "/posts/the_family_behind_the_firefighter_badge", viewCount: 40 },
  { pagePath: "/posts/maui_firefighter_vacancies_county_roster", viewCount: 42 },
  { pagePath: "/posts/ocean_safety_2026_award_vs_honolulu_inflation", viewCount: 60 },
  { pagePath: "/posts/hawaii_s_two-tier_public_safety_system", viewCount: 131 },
  { pagePath: "/posts/the_slowest_firefighter_step_ladder_in_the_nation", viewCount: 72 },
  { pagePath: "/posts/maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management", viewCount: 110 },
  { pagePath: "/hawaii_firefighter_disciplines.html", viewCount: 44 },
  { pagePath: "/posts/hawaii_firefighter_recruitment_collapse", viewCount: 42 },
  { pagePath: "/posts/haiku_fire_station_east_maui_coverage_gap", viewCount: 44 },
  { pagePath: "/posts/maui_fire_commission_was_told_firefighters_do_fairly_well", viewCount: 105 },
  { pagePath: "/posts/where_the_system_fails", viewCount: 74 },
  { pagePath: "/posts/behind_every_siren", viewCount: 47 },
  { pagePath: "/posts/the_federal_exemption_that_costs_hawaii_firefighters_millions", viewCount: 114 },
  { pagePath: "/", viewCount: 1178 },
  { pagePath: "/posts/recognition_without_compensation_is_just_words", viewCount: 83 },
  { pagePath: "/posts/hawaii_deputy_sheriff_docare_contract_unit_14", viewCount: 82 },
  { pagePath: "/posts/the_third_tier_hawaii_ocean_safety_pay", viewCount: 49 },
  { pagePath: "/posts/cost_of_living_gap_hawaii_firefighter_pay", viewCount: 35 },
  { pagePath: "/posts/why_5_person_fire_crews_are_the_standard", viewCount: 34 },
];

const handler = async (): Promise<Response> => {
  const existing = await db.select().from(pageViews);
  if (existing.length >= 5) {
    return Response.json(
      { skipped: "table already has real content", rows: existing.length },
      { status: 409 },
    );
  }

  for (const r of SEED) {
    await db
      .insert(pageViews)
      .values({ pagePath: r.pagePath, viewCount: r.viewCount })
      .onConflictDoUpdate({
        target: pageViews.pagePath,
        set: { viewCount: sql`greatest(${pageViews.viewCount}, ${r.viewCount})` },
      });
  }

  const after = await db.select().from(pageViews);
  const total = after.reduce((a, r) => a + r.viewCount, 0);
  return Response.json({
    seeded: SEED.length,
    rowsBefore: existing.length,
    rowsAfter: after.length,
    totalAfter: total,
  });
};

export default { fetch: handler };
