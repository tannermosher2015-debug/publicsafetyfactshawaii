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
  /** alt text for the photo in the article header (cards leave it decorative) */
  alt?: string
}

export const POST_META: Record<string, PostMeta> = {
  'hawaii_s_two-tier_public_safety_system': {
    topic: 'Pay Equity',
    stat: '2×',
    statLabel: 'the raise police won vs. firefighters',
    photo: 'pay-equity.jpg',
    alt: 'A U.S. Navy firefighter in a helmet and air mask holds a radio in front of fire Engine 108',
  },
  recognition_without_compensation_is_just_words: {
    topic: 'Recognition',
    stat: 'Both',
    statLabel: 'firefighters are asking for recognition and a contract',
    photo: 'recognition.jpg',
    alt: 'Coast Guard crew members lean over a ship rail to hand gear down to a rescue boat crew at sea',
  },
  hawaii_firefighter_recruitment_collapse: {
    topic: 'Recruitment',
    stat: '−70%+',
    statLabel: 'firefighter applicants since the 2017 peak',
    photo: 'recruitment-dark.jpg',
    alt: 'On a balcony, a firefighter in a silver suit sprays a hose into a burning doorway while another in turnout gear stands behind',
  },
  the_family_behind_the_firefighter_badge: {
    topic: 'Recognition',
    stat: '1 in 3',
    statLabel: 'days a firefighter spends away from home',
    photo: 'firefighter-family.jpg',
    alt: 'A smiling firefighter kneels in a fire station to hand a teddy bear to a young girl',
  },
  the_federal_exemption_that_costs_hawaii_firefighters_millions: {
    topic: 'Overtime Law',
    stat: '53 hrs',
    statLabel: 'a week before overtime is owed',
    photo: 'overtime.jpg',
    alt: 'A wildland firefighter in a yellow shirt and hard hat pulls a hose line through burned brush',
  },
  maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management:
    {
      topic: 'Governance',
      stat: '$0',
      statLabel: "of the study's logic applied to firefighters",
      photo: 'governance.jpg',
      alt: 'A burned-out two-story building behind a large banyan tree after a wildfire',
    },
  maui_fire_commission_was_told_firefighters_do_fairly_well: {
    topic: 'Governance',
    stat: '<40th',
    statLabel: 'where firefighter pay ranks nationally after cost of living',
    photo: 'commission.jpg',
    alt: 'Coast Guard crew members lean over a ship rail to hand gear down to a rescue boat crew at sea',
  },
  maui_firefighter_vacancies_county_roster: {
    topic: 'Staffing',
    stat: '10',
    statLabel: "line vacancies named on the county's own May 2026 roster",
    photo: 'vacancies.jpg',
    alt: 'Firefighters in air packs advance a hose line up a ramp into a burning structure at night',
  },
  cost_of_living_gap_hawaii_firefighter_pay: {
    topic: 'Cost of Living',
    stat: '~4.5×',
    statLabel: "a starting firefighter's salary to afford Maui's median home",
    photo: 'cost-of-living.jpg',
    alt: 'Two firefighters in training walk a charged hose line with a nozzle',
  },
  why_5_person_fire_crews_are_the_standard: {
    topic: 'Staffing',
    stat: '5',
    statLabel: 'firefighters per crew, the federal safety optimum',
    photo: 'staffing.jpg',
    alt: 'Firefighters in air packs advance a hose line up a ramp into a burning structure at night',
  },
  behind_every_siren: {
    topic: 'Recognition',
    stat: '$43K',
    statLabel: 'starting pay for the clerks who keep the department running',
    photo: 'behind-every-siren.jpg',
    alt: 'A dispatcher in a headset works a bank of screens in a National Park Service emergency dispatch center',
  },
  the_slowest_firefighter_step_ladder_in_the_nation: {
    topic: 'Pay Equity',
    stat: '28 yrs',
    statLabel: 'to reach top pay, the longest of 37 U.S. departments',
    photo: 'slowest-step-ladder.jpg',
    alt: 'A firefighter in silhouette sprays a stream of water into a wall of flame',
  },
  the_third_tier_hawaii_ocean_safety_pay: {
    topic: 'Ocean Safety',
    stat: '33 yrs',
    statLabel: 'for a lifeguard to reach the top of the pay scale',
    photo: 'ocean-safety-tower.jpg',
    alt: 'A Kailua Beach lifeguard tower at dusk with a sign reading No Lifeguard On Duty, Call 911',
  },
  ocean_safety_2026_award_vs_honolulu_inflation: {
    topic: 'Ocean Safety',
    stat: '11.12%',
    statLabel: 'raise across four years, against 5.1% Honolulu inflation in twelve months',
    photo: 'ocean-safety-waikiki.jpg',
    alt: 'A lifeguard watches the water from a tower under palm trees at Waikiki Beach',
  },
  hawaii_deputy_sheriff_docare_contract_unit_14: {
    topic: 'State Law Enforcement',
    stat: '18 mos',
    statLabel: 'at impasse, with no arbitration award on the public record',
    photo: 'state-law-enforcement-patrol.jpg',
    alt: 'A police patrol boat speeds across open ocean',
  },
  haiku_fire_station_east_maui_coverage_gap: {
    topic: 'Staffing',
    stat: '18 yrs',
    statLabel: 'since the county bought the land, with no Haʻikū station built',
    photo: 'haiku-road.jpg',
    alt: 'Aerial view of a winding two-lane road through dense forest in Haiku, East Maui',
  },
  where_the_system_fails: {
    topic: 'Governance',
    stat: '2',
    statLabel: 'systems in one government: officials get a study, the workforce bargains',
    photo: 'capitol.jpg',
    alt: 'The Hawaii State Capitol in Honolulu, framed by palm trees under a cloudy sky',
  },
  hawaii_firefighter_overtime_68_hour_ceiling: {
    topic: 'Overtime Law',
    stat: '68',
    statLabel: 'hours before overtime, the exact federal maximum for a nine-day work period',
    photo: 'dusk-shift.jpg',
    alt: 'Two Marine Corps firefighters in proximity suits, silhouetted against the sky at dusk',
  },
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return POST_META[slug]
}
