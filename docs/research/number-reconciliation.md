# Number Reconciliation — for Tanner's confirmation

Resolving the figure conflicts found in the article audit before the rebuild. ✅ = I can resolve from sources in hand. ❓ = needs your confirmation.

---

## 1. ✅ Fire Chief pay — NOT a contradiction, it's a timeline (verified)
`$183,889` is confirmed in the MGT draft (Appendix C Fire Chief data sheet), alongside the `$179,523–$248,446` range article A cites; it's Maui's **study-era actual** salary. Our other figures are the **later outcome**. Proposed canonical framing (all dated):
- **Early 2025 (MGT study):** Maui Fire Chief actual ≈ **$183,889**, which MGT flagged as below the market average (~$232,368) for comparable jurisdictions.
- **April 2025 (county adopted, per 5/21 transcript):** Fire Chief raised to **$239,043** — an ~30% increase.
- **May 2026 (Commission's letter to Salary Commission):** reasserts a **75th-percentile** posture ≈ **$258,930** (Deputy $233,037).
→ This arc *is* the article's thesis: MGT said management was underpaid, and the county acted — twice. Article 1c should show all three points, not just $183,889.
- Minor: article A's "proposed $165,000–$222,750 (50th)" is from a *different* MGT option table than the $179,523–$248,446 survey range. I'll standardize on one option and label it. (Not material to the argument.)

## 2. ✅ 7(k) straight-time hours — resolved by the math
The "52 vs 65 vs 16/wk" wobble is a generic-vs-Maui mixup. Maui Kelly, no Kelly days ≈ 225 hrs/28-day cycle:
- **65 hrs** above the standard 40-hr-equivalent (225 − 160) ← the headline Maui figure
- **13 hrs** above the 7(k) overtime threshold (225 − 212)
- **16.3 hrs/wk** above 40 (56.3 − 40) — same thing per week (×4 ≈ 65)
- The stray **"52"** = the *generic* 7(k) gap (212 − 160) for a firefighter with no schedule loading — NOT Maui's. Drop it, or label it explicitly as the generic figure.
- The dollar tables are already built on 65 (e.g., $45/hr × 0.5 × 65 = $1,463/cycle → $19,013/yr → $475,313/25 yr ✓). So only the one caption needs fixing; the tables are correct.
- **Stale table cell caught (2026-07-17):** the **$35/hr** 25-year career total was **$369,713** in the old published version (both firecrawl scrapes) but is **$369,688** in the live 7(k) source. $369,688 is the correct one: 0.5 × $35 × 65 × 13 × 25 = $369,687.50, which rounds to $369,688; the old $369,713 was about $25 high. Only that one cell was affected (the $40 / $45 / $50 rows match to the dollar). The stale value survives only in the firecrawl snapshots, not in any live content, so nothing to fix on the site.
→ Standardize every 7(k) article on: **225 hrs/cycle · 65 above standard · 13 above the 212 threshold · 16.3/wk.**

## 3. ❓ Purchasing-power shortfall — $6,442 vs $7,370 (need your call)
- Published article C: wages **+23.3%** vs Hawaii CPI **+35.3%** (2015–2025) → to match 2015 purchasing power, start pay would need **$72,222**; actual **$65,780** → shortfall **$6,442/yr**. Math is shown and sourced (DHRD BU-11; BLS Hawaii CPI-U; Databook 14.04).
- Prior working notes said **$7,370** (different vintage/inputs).
- **My recommendation:** keep **$6,442** as canonical (it's published, sourced, and the math checks). Use $7,370 only if you have a newer calc with updated 2025 CPI/wage inputs. **Which is current?** If $7,370, send me the inputs and I'll show the corrected math.

## 4. ❓ Firefighter I starting pay — $65,780 vs $69,000 (need your call)
- Article C uses **$65,780** (recruit/start, post-3% raise). Article D uses **~$69,000** ("Firefighter I starts at approximately $69,000").
- **My proposed resolution:** label them distinctly — **recruit/probationary start ≈ $65,780; post-probation Firefighter I ≈ $69,000** — and use the right one per context. **Confirm the two DHRD BU-11 steps these map to** (e.g., which step = "start"), so every article uses identical figures.

---

## Also confirmed consistent (no action)
- Article D "**~325 firefighters**" = FY2026 budget's **325** Fire/Rescue Operations authorized E/P. ✅
- Article D's HFFA award **3/3/2.5/2.5% ≈ 11.46%** IS the "lower than most contracts" the Chief described (5/21 transcript). ✅
- 7(k) career loss **$475,313 @ $45/hr** consistent across A and B. ✅

## To finish the rebuild I still need from you
- **The repo** (path + stack: Markdown/MDX posts? plain HTML? build script?) so I produce drop-in, deploy-ready files.
- Your calls on **#3** and **#4** above.
