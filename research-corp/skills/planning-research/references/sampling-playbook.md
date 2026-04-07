## Sampling Playbook

Use this guide to design sample and quota logic that matches objective complexity and decision risk.

## 1) Start From Decision Risk

- High-risk decision (large budget/product direction): use stronger sample confidence and segment coverage.
- Medium-risk decision: balanced depth + speed.
- Low-risk decision: scoped sample acceptable with explicit caveats.

## 2) Quantitative Sizing Heuristics

- n >= 100 per core segment for stable directional comparison.
- If comparing multiple segments, each compared segment should meet minimum n.
- Total n often 300-500 for practical multi-cut analysis.

If deadline/budget blocks ideal n, document:

- what confidence is reduced
- which comparisons are no longer reliable

## 3) Qualitative Sizing Heuristics

- IDI: 8-15 interviews per key segment
- FGD: 2-3 groups per segment, 6-8 participants/group
- Online diary: 15-30 participants per segment, 5-14 day period

Add participants only when objective requires additional behavioral diversity.

## 4) Quota Design Principles

- Quotas should reflect objective priorities, not only population proportions.
- Include must-have cells for critical decisions.
- Avoid thin cells that prevent interpretable analysis.

## 5) Quota Table Template

| Segment | Criteria | Target n | Priority | Rationale |
|---------|----------|----------|----------|-----------|
| ...     | ...      | ...      | High/Med/Low | ... |
| Total   |          | [N]      |          | |

## 6) Feasibility Stress Test

Run before finalizing:

- Can recruitment source fill each quota cell?
- Is timeline realistic for this n and method?
- Does analysis plan still work with proposed n?
- Is budget sufficient for proposed sample (field cost + incentives)?
- Are trade-offs documented clearly for stakeholder sign-off?

## 7) Non-Probability Sampling Methods

When probability sampling is not feasible (budget, timeline, or population access constraints), these methods can be used with appropriate caveats.

### Convenience Sampling
- Recruit from readily available sources (social media, existing panels, app push).
- Acceptable for: exploratory research, early-stage concept testing, internal benchmarking.
- Caveat: cannot claim population representativeness. Always state this limitation.

### Purposive / Judgment Sampling
- Researcher selects participants based on specific criteria relevant to the objective.
- Acceptable for: expert interviews, hard-to-reach populations, niche segments.
- Caveat: selection bias is inherent. Mitigate by documenting criteria transparently.

### Snowball Sampling
- Existing participants recruit others from their network.
- Acceptable for: hidden populations, sensitive topics, communities with low visibility.
- Caveat: network homogeneity bias. Set a cap on referrals per participant.

### Quota Sampling (Non-probability)
- Set quotas by key characteristics but recruit non-randomly.
- Acceptable for: market research where perfect randomness is impractical but demographic balance matters.
- Caveat: within-quota selection is still non-random. Document the recruitment method per quota cell.

### When to Flag Non-Probability Limitations
- Always document sampling method in the plan.
- If the decision at stake is high-risk, strongly recommend probability-based methods or larger n to compensate.
- If using non-probability for quant, increase n by 20-30% as a hedge and state that confidence intervals are approximate.