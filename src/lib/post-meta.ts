// Presentation metadata keyed by slug: a plain-language topic (used for the
// filter tabs + card chip) and a headline stat rendered on the card/hero media
// panel, standing in for the photography a data-journalism site doesn't have.
// Shared by the home listing (blog-posts.tsx) and the article header
// (posts.$slug.tsx) so both read from one source of truth.
export type PostMeta = {
  topic: string
  stat: string
  statLabel: string
  photo?: string
}

export const POST_META: Record<string, PostMeta> = {
  'hawaii_s_two-tier_public_safety_system': {
    topic: 'Pay Equity',
    stat: '2×',
    statLabel: 'the raise police won vs. firefighters',
    photo: 'pay-equity.jpg',
  },
  recognition_without_compensation_is_just_words: {
    topic: 'Recognition',
    stat: 'Both',
    statLabel: 'firefighters are asking for recognition and a contract',
    photo: 'recognition.jpg',
  },
  hawaii_firefighter_recruitment_collapse: {
    topic: 'Recruitment',
    stat: '−73%',
    statLabel: 'firefighter applicants since the 2017 peak',
    photo: 'recruitment.jpg',
  },
  the_family_behind_the_firefighter_badge: {
    topic: 'Recognition',
    stat: '1 in 3',
    statLabel: 'days a firefighter spends away from home',
    photo: 'family.jpg',
  },
  the_federal_exemption_that_costs_hawaii_firefighters_millions: {
    topic: 'Overtime Law',
    stat: '53 hrs',
    statLabel: 'a week before overtime is owed',
    photo: 'overtime.jpg',
  },
  maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management:
    {
      topic: 'Governance',
      stat: '$0',
      statLabel: "of the study's logic applied to firefighters",
      photo: 'governance.jpg',
    },
  maui_fire_commission_was_told_firefighters_do_fairly_well: {
    topic: 'Governance',
    stat: '<40th',
    statLabel: 'where firefighter pay ranks nationally after cost of living',
    photo: 'commission.jpg',
  },
  maui_firefighter_vacancies_county_roster: {
    topic: 'Staffing',
    stat: '10',
    statLabel: "line vacancies named on the county's own May 2026 roster",
    photo: 'vacancies.jpg',
  },
  cost_of_living_gap_hawaii_firefighter_pay: {
    topic: 'Cost of Living',
    stat: '~5×',
    statLabel: "a starting firefighter's salary to afford Maui's median home",
    photo: 'cost-of-living.jpg',
  },
  why_5_person_fire_crews_are_the_standard: {
    topic: 'Staffing',
    stat: '5',
    statLabel: 'firefighters per crew, the federal safety optimum',
    photo: 'staffing.jpg',
  },
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return POST_META[slug]
}
