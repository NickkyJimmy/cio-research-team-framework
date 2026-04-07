## Quantitative Research Reference

Use quantitative methods when objectives require incidence, prevalence, segment comparison, trend tracking, forecasting, or lift estimation.

## 1) Method Selection Decision Rules

Select mode by objective + access + timeline, not by habit.

- CASI / online survey:
  - Best when online reach is strong and timeline is at least 3 weeks.
  - Strong for scale, randomization, and complex logic routing.
- CATI:
  - Best when timeline is tight (under 2 weeks) or segments are harder to reach online.
  - Strong for speed and interviewer support on complex questions.
- Field survey with quota sampling:
  - Use when online frames are weak, biased, or under-cover priority segments.
  - Strong for representativeness in offline-heavy populations.
- Mobile survey (in-app / SMS-triggered):
  - Best for capturing in-moment feedback or post-interaction satisfaction.
  - Strong for high response rates among active digital users.
  - Limitation: questionnaire must be short (under 5 minutes).

If method and objective conflict, prioritize objective fit and clearly log trade-offs.

## 2) Sample and Confidence Guidance

Use practical thresholds for directional decision quality.

- Core segment estimate: n >= 100 per main segment.
- Multi-segment comparison: n >= 100 per compared segment minimum.
- Typical total n: 300-500 for robust multi-cut analysis.
- Tight-budget fallback: reduce scope to fewer decision-critical segments and document confidence loss.

### Precision shortcuts (for planning, not formal stats appendix)

- For a proportion around 50%:
  - n = 100 -> margin of error about +/-10 percentage points.
  - n = 400 -> margin of error about +/-5 percentage points.
- If expected segment gap is small (<8 percentage points), plan larger n or avoid hard claims.
- For campaign lift, require exposed and non-exposed groups with balanced cells before claiming impact.

## 3) Strengths and Limits

- Strength:
  - Supports measurable comparisons and directional confidence.
  - Enables prioritization across segments, channels, and product stages.
- Limit:
  - Weak at uncovering deep motivations without qualitative follow-up.
  - Causal claims are weak without experimental or quasi-experimental design.

## 4) Questionnaire Design Standards

Design each block to map directly to sub-objectives and decision use.

- Start with screener logic first; do not allow ineligible respondents into core blocks.
- Keep scale formats consistent inside a section (for example, all 1-5 agreement or all 0-10 intent).
- Avoid double-barreled or leading wording.
- Include balanced answer choices and explicit "other/specify" when needed.
- Randomize item or asset order where order bias is likely.
- Keep sensitive questions late, unless needed for routing.
- For mobile surveys: keep total under 5 minutes, use tap-friendly formats.

## 5) Data Quality Controls

Define quality gates before fieldwork starts.

- Pilot:
  - Run a pilot and fix confusing items before full launch.
- Speeding:
  - Flag interviews far below realistic completion time.
- Straight-lining:
  - Flag respondents with zero variance on long scale batteries.
- Attention checks:
  - Add at least one logic or instruction check in long surveys.
- Duplicates and bot risk:
  - Deduplicate by stable identifiers and behavior signals.
- Missing data:
  - Set rules for mandatory fields and acceptable missingness by section.

## 6) Core Measurement Frameworks

### Product Funnel

Awareness -> Consideration -> Trial -> Usage (P3M) -> Advocacy

- Metrics per stage: aided/unaided recall, intent score, trial rate, active usage rate, NPS/recommend score.
- Triggers and barriers: capture at every funnel transition.
- Conversion rate: calculate stage-to-stage conversion to locate priority drop-offs.

### Product Health Metrics

- CSAT: satisfaction score by key touchpoint.
- NPS: promoter/passive/detractor profile and benchmark.
- TRUST index (composite from scaled items): reliability, security, transparency, brand credibility.

### Campaign / KV / Game Evaluation

- Awareness: aided and unaided campaign recall.
- SOA (source of awareness): in-app, out-app, social, PR, WOM.
- Overall liking: clarity, message strength, visual appeal, relevance, uniqueness.
- Intention to use: post-exposure intent scale.
- Trigger / barrier: which creative elements drive or block action.
- Asset prioritization: impact x liking matrix.

### U&A + Sizing

- Demand: current demand, latent demand, market sizing signal.
- Behavior and motivation:
  - Frequency, occasion, transaction value.
  - Functional drivers (convenience, speed, cost).
  - Emotional drivers (trust, habit, pride).
- Perception mapping: semantic differential scales and attribute association.

## 7) Analysis Plan Guidance

Predefine analysis cuts before fieldwork.

- Cross-tab:
  - By segment, funnel stage, channel exposure, lifecycle stage.
- Significance testing:
  - Chi-square for proportions.
  - T-test / ANOVA for means.
  - Flag p < 0.05 and report direction, not only pass/fail.
- Effect interpretation:
  - Pair significance with practical effect size or absolute gap.
- Indexing:
  - Index segment scores vs total sample (100 = average).
- Driver analysis:
  - Correlation or regression for CSAT, NPS, intent drivers.
- Gap analysis:
  - Importance vs performance matrix for prioritization.

Do not claim impact from correlation alone.

## 8) Common Misuse to Avoid

- Using small convenience n for segment-level claims.
- Forcing percentages when objective is mechanism discovery.
- Writing survey items that cannot map to a decision.
- Over-interpreting non-significant or tiny differences.

## 9) Recommended Question Flow

1. Screener: demographics, usage qualification, segment assignment.
2. U&A block: behavior, frequency, alternatives, motivations.
3. Product funnel: awareness -> trial -> usage -> advocacy, with triggers/barriers.
4. Campaign exposure: recall, SOA, asset evaluation (with rotation).
5. Key metrics: CSAT, NPS, TRUST battery.
6. Sizing / intent: future intention, willingness to pay, demand indicators.

## 10) Output Quality Checklist

Before finalizing a quant section in the plan, verify:

- Every sub-objective has at least one quant metric path.
- Every metric ties to a decision use statement.
- Sample and quota logic support required comparisons.
- Quality control rules are explicit.
- Limitations and confidence caveats are clearly stated.