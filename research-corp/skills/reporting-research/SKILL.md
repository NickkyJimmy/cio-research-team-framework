---

name: reporting-research

description: Transform clean survey data and research context into polished, insight-driven research reports with executive summaries, segment analysis, and strategic recommendations. Use this skill whenever the user needs to write a research report, analyze survey results, create a findings deck, summarize quantitative or qualitative research, generate executive summaries from data, interpret NPS/CSAT/funnel metrics, or turn cross-tabs into actionable insights — even if they don't explicitly say "research report."

---

# Research Report Skill


---

## What You Need Before Starting

Every report requires three inputs. If any are missing or ambiguous, ask for clarification — never fabricate data to fill gaps.

### Required Inputs

1. **Research Plan** — Project name, background, business context, numbered research objectives, methodology (Quanti: CASI/CATI/Online Survey or Quali: IDI/FGD), target audience definition, sample size, and quota structure.
2. **Clean Data Table** — Cross-tabs, frequency tables, or coded qualitative responses in CSV, JSON, or markdown tables, with segment breakdowns matching the research plan.
3. **Questionnaire or Discussion Guide** — Full question list with codes, types (SA/MA/OE/Scale), answer options, skip logic, and section groupings aligned to research objectives.

### Optional Inputs

- **Prior Reports & Knowledge Base** — Historical reports on the same product/topic for benchmarking, category norms, or internal benchmarks (e.g., NPS, CSAT baselines). These help you contextualize findings rather than reporting numbers in a vacuum.

---

## Report Structure

Follow this structure exactly. The consistency matters because stakeholders learn to navigate it quickly across reports, which means they spend less time searching and more time acting.

### 01: Project Information

- Project name
- Research objectives (numbered)
- Methodology summary
- Sample size and composition
- Fieldwork period
- Report date

### 02: Executive Summary

Write this section **last**, after all findings sections are complete — you need the full picture before you can prioritize.

- 5–7 bullet points capturing the most critical findings
- Each bullet follows the pattern: **[Finding] → [So what / Implication]**
- Prioritize by **business impact**, not by question order
- Include one headline metric per research objective
- Use **bold** for key numbers so they pop on a quick scan

### 03–N: Key Findings (one section per research objective)

For each research objective, create a dedicated section:

- **Section title** = the research objective statement
- **Lead with the headline** — the single most important takeaway
- Present supporting data with exact percentages and base sizes: "XX% (n=YYY)"
- Use segment comparisons where meaningful (index vs. total sample)
- Flag statistically significant differences (p < 0.05)
- Include data tables for key metrics
- End each section with **"Implications & Recommendations"**

### Final Section: Strategic Recommendations

- Synthesize cross-cutting themes from all findings
- Prioritize by **impact × feasibility**
- Link every recommendation to a specific data point — no unsupported claims
- Organize into: **Immediate Actions** / **Short-term** / **Long-term**

---

## Analysis Frameworks

Choose the framework(s) that match the research objectives. Often you'll combine multiple frameworks in a single report.

### Product Funnel Analysis

Awareness → Consideration → Trial → Usage (P3M) → Advocacy

- Report stage-to-stage conversion rates
- Identify the biggest drop-off point — this is where the business should focus
- Map triggers and barriers at each transition
- Benchmark against prior waves if available

### Key Health Metrics

- **CSAT**: Top-2-Box (T2B) score + breakdown by segment
- **NPS**: Promoter / Passive / Detractor split → Net score + category benchmark
- **TRUST**: Composite index from Likert battery (Reliability, Security, Transparency, Brand Credibility)

### Campaign / Asset Evaluation

- **Awareness**: Aided + Unaided recall rates
- **Source of Awareness**: Channel attribution ranking
- **Overall Liking**: Sub-dimensions (Content clarity, Message strength, Visual appeal, Relevance, Uniqueness)
- **Impact × Liking matrix** for asset prioritization
- Post-exposure intention shift (pre vs. post if available)

### U&A + Sizing (Usage & Attitude)

- Current demand, latent demand, market size estimation
- Behavioral metrics: frequency, occasions, transaction value
- Functional vs. emotional driver ranking
- Brand perception mapping via semantic differential scales

### Statistical Methods

Apply these as appropriate — the goal is rigor, not decoration:

- **Cross-tabulation** with key cuts (segment, funnel stage, channel exposure)
- **Chi-square** for proportions; **t-test / ANOVA** for means (flag at p < 0.05)
- **Indexing**: Score per segment vs. total (100 = average) — makes segment differences scannable
- **Correlation / regression** for driver analysis when data permits
- **Gap analysis**: Importance vs. Performance matrix

---

## The Insight Quality Hierarchy

This is the most important concept in this skill. Surface-level reporting is easy but useless. Your job is to reach Level 3 consistently.

```markdown
| Level | What it is | Example |
|---|---|---|
| **Level 1: Fact** | Restating the data | "60% of users are aware of the feature" |
| **Level 2: Finding** | Adding comparison or context | "Awareness is 60% overall but drops to 35% among non-receivers — a 25pp gap" |
| **Level 3: Insight** | Answering "so what should we do?" | "Non-receivers' low awareness (35%) combined with high intent-to-use when informed (72%) signals an education gap, not a demand gap → prioritize targeted comms over product changes" |
```

Every finding in your report should answer: **"So what should the business DO with this information?"** If a finding doesn't lead to an action, either dig deeper or deprioritize it.

---

## Data Integrity Rules

These exist because a single fabricated number can destroy trust in the entire report.

- **Never invent** percentages, sample sizes, or statistical results
- Always show base size: "XX% (n=YYY)"
- When comparing segments, note if the difference is statistically significant
- If data is insufficient for a conclusion: *"Data inconclusive — recommend further investigation"*
- If a sub-sample is too small (n < 30): *"Directional only (n=XX, below minimum for statistical inference)"*
- Round percentages to 1 decimal place consistently
- If data contradicts the hypothesis — report it transparently. Suppressing inconvenient findings is how bad decisions get made.

---

## Visualization Guidance

Suggest the right chart type alongside data tables. Stakeholders process visuals faster than tables, so the right chart can be the difference between a finding being acted on or ignored.

```markdown
| Data Type | Recommended Visualization |
|---|---|
| Funnel metrics | Funnel chart or stacked bar |
| Segment comparison | Grouped bar chart with index labels |
| Time series / wave comparison | Line chart |
| Likert scales (CSAT, agreement) | Stacked horizontal bar (T2B highlighted) |
| NPS | Stacked bar (green/gray/red) + Net score callout |
| Channel attribution | Horizontal bar (ranked) |
| Importance vs. Performance | 2×2 scatter plot |
| Asset evaluation | Impact × Liking matrix |
```

For data tables, use this structure:

```markdown
| Metric | Total | Segment A | Segment B | Index |
|---|---|---|---|---|
| Awareness (aided) | 58% (n=500) | 67% (n=400) | 31%* (n=100) | 53 |
```

Highlight cells where differences are significant. Use consistent decimal formatting throughout.

---

## Workflow: Step by Step

### Step 1: Validate Inputs

- Confirm all required inputs are present
- Cross-check questionnaire codes against data columns
- Verify sample sizes match expected quotas
- Flag data quality issues (e.g., high straight-lining rate, missing segments)

### Step 2: Map Objectives → Data

Create an internal mapping before writing anything:

> Objective 1 → Questions Q1, Q3, Q7 → Data columns X, Y, Z
> 

> Objective 2 → Questions Q2, Q4–Q6 → Data columns A, B, C
> 

Identify gaps where objectives lack sufficient data coverage.

### Step 3: Analyze & Extract Findings

- Run cross-tabs for each objective
- Calculate key metrics (CSAT T2B, NPS, funnel conversion rates)
- Identify statistically significant segment differences
- Rank findings by business impact — this determines section order

### Step 4: Draft Report

- Follow the DTE Report Template structure exactly
- Write Executive Summary **last**
- Include data tables and suggest chart types for key visuals

### Step 5: Self-Review

Before delivering, verify every item:

- [ ]  Every research objective is addressed with data
- [ ]  All percentages include base sizes
- [ ]  Statistical significance is flagged where applicable
- [ ]  Executive Summary captures top 5–7 findings
- [ ]  Every recommendation links to specific data
- [ ]  No data points are fabricated
- [ ]  Report language matches stakeholder expectation
- [ ]  Segment comparisons use consistent definitions

---

## Language & Tone

- Professional but accessible — cut jargon unless the audience expects it
- Use active voice: *"Users prefer X"* not *"X was preferred by users"*
- **Default language**: Vietnamese for MoMo internal reports, English for cross-functional or international stakeholders. Match the language of the research plan provided.
- Use **bold** for key metrics and headline numbers throughout

---

## Example: Executive Summary

**Context**: Project Titan — Nhận tiền từ Ngân hàng qua SĐT MoMo. Objectives: (1) Measure awareness, (2) Evaluate campaign materials, (3) Assess usage intention. Sample: n=500 A30 MoMo users (Receivers n=400, Non-receivers n=100).

### 02: Executive Summary

1. **Awareness đạt 58% (aided) nhưng phân bố không đều** — Receiver awareness đạt 67% trong khi Non-receiver chỉ 31% (gap 36pp, p<0.01), cho thấy campaign chưa penetrate được nhóm target mới. → *Cần tăng cường touchpoint ngoài app cho nhóm Non-receiver.*
2. **Source of Awareness #1 là in-app notification (42%)** — Out-app channels (social, PR) chỉ chiếm 18% tổng SOA. → *Đầu tư thêm out-app channels để reach nhóm Non-receiver và Low-frequency users.*
3. **Key Visual đạt Overall Liking 3.8/5** — Điểm mạnh: Message clarity (4.1/5). Điểm yếu: Relevance to self (3.2/5). → *Cải thiện KV bằng cách thêm use case gần gũi với người dùng.*
4. **Usage intention cao ở cả hai nhóm** — 72% Receiver và 65% Non-receiver cho biết "sẽ sử dụng" (T2B). → *Demand không phải là barrier — vấn đề là awareness gap.*
5. **NPS = +32 (Promoter 48% | Passive 36% | Detractor 16%)** — Cao hơn benchmark ngành fintech (+25). → *Tận dụng Promoters làm kênh WOM tự nhiên qua referral program.*

---

## Error Handling

```
| Situation | What to do |
|---|---|
| Incomplete or low-quality data | Flag specific issues, proceed with available data, note limitations in each affected section |
| Vague research objectives | Ask for clarification before proceeding; suggest concrete interpretations |
| Sub-sample too small (n < 30) | Report with caveat: "Directional only (n=XX)" |
| Data contradicts the hypothesis | Report transparently — never suppress inconvenient findings |
| No clean data provided | Do not proceed. Ask: "I need the clean data table to generate an evidence-based report. Please provide the processed data." |
```

---

**Design Notes**: This skill uses chain-of-thought reasoning guidance, a few-shot example for calibration, explicit error handling protocols, the Fact → Finding → Insight quality hierarchy to prevent shallow reporting, and a self-review checklist for output validation. Domain-specific frameworks (Product Funnel, NPS, CSAT, Campaign Eval) are built in so the agent doesn't need to look them up.
