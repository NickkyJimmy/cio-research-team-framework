# Content Framework Mapping

This is the **core engine** of the skill. It systematically translates the content framework from the research plan into questionnaire items.

> The content framework hierarchy:
Research Objective → Sub-objective → Content Block → Measure → Dimension → Indicator → Question(s)
> 

---

## Step 1 — Build the Traceability Matrix

Before writing any questions, create a mapping table that traces every element from the content framework to its instrument counterpart. This ensures nothing is missed and every question has a clear purpose.

| Objective | Sub-obj | Content Block | Measure | Dimension | Indicator | Q# | Type | Scale | Analysis Method |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| O1 | O1.1 | Block A | Awareness | Unaided | Top-of-mind | Q1 | OE | — | Coding → % |
| O1 | O1.1 | Block A | Awareness | Aided | Recognition | Q2 | SS | Y/N | % |
| O1 | O1.2 | Block B | Satisfaction | Overall | CSAT | Q5 | SS | 1-5 | Mean, Top-2-box |

*Abbreviations: OE=Open-end, SS=Single-select, MS=Multi-select, SC=Scale, RK=Ranking, MT=Matrix/Grid*

---

## Step 2 — Select Question Type by Measure

Use this decision tree to select the right question type for each measure:

### Awareness measures

- → Unaided: Open-end (OE)
- → Aided: Single-select (SS) or Multi-select (MS) with list
- → Source of awareness: Multi-select (MS) with touchpoint list

### Behavior measures

- → Frequency: Categorical scale or numeric input
- → Recency: Categorical scale with time anchors
- → Usage occasions: Multi-select (MS)
- → Journey/process: Open-end (OE) or sequential questions

### Attitude measures

- → Agreement: Likert scale (SC, 5 or 7 point)
- → Importance: Scale (SC) or ranking (RK)
- → Preference: Ranking (RK) or MaxDiff
- → Perception: Semantic differential (SC)

### Satisfaction measures

- → CSAT: 5-point scale (SC)
- → NPS: 0–10 scale (SC) + open-end reason
- → CES (Customer Effort Score): 7-point scale (SC)
- → Touchpoint satisfaction: Matrix/grid (MT)

### Evaluation measures

- → Overall liking: Scale (SC) + open-end "Tại sao?"
- → Attribute evaluation: Matrix/grid (MT) with Likert scale
- → Concept test: Monadic or sequential monadic design

### Intention measures

- → Purchase/usage intent: 5-point scale (SC)
- → Willingness to recommend: 0–10 scale (SC)
- → Likelihood to switch: Scale (SC) with behavioral anchors

---

## Step 3 — Map Analysis Method to Scale Design

The analysis approach specified in the content framework determines scale design. Choosing the wrong scale can make the planned analysis impossible.

| Analysis Method | Required Scale | Min Points | Notes |
| --- | --- | --- | --- |
| Mean comparison (t-test, ANOVA) | Interval/ratio | 5+ | Fully labeled preferred |
| Top-2-box / Bottom-2-box | Ordinal | 5 | Clear positive/negative split |
| Correlation / regression | Interval | 5-7 | Avoid 3-point scales |
| Cross-tabulation / chi-square | Nominal or ordinal | N/A | Categories must be distinct |
| Factor analysis | Interval | 5-7 | Need enough variance |
| Cluster analysis | Interval | 5-7 | Consistent scales across items |
| Net score (NPS) | Fixed 0-10 | 11 | Standard NPS format required |
| Qualitative coding | Open-end | N/A | Allow sufficient space |
| MaxDiff / trade-off | Ranking or choice | N/A | Specialized design needed |

---

## Step 4 — Validate Coverage

After mapping is complete, verify:

- [ ]  Every content block has at least 1 question
- [ ]  No content block is over-represented (too many questions for its importance weight)
- [ ]  Every sub-objective is measurable through at least one question
- [ ]  The total question count fits within mode time constraints
- [ ]  No orphan questions exist (every question traces back to the content framework)