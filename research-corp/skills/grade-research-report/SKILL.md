---
name: grade-research-report
description: 
  Evaluate research report quality with a rubric focused on insight quality,
  evidence strength, and decision usefulness. Use this skill whenever the user
  asks to review, score, QA, or improve a research report/deck/findings summary,
  especially when they need clearer recommendations, tighter narratives, or better
  evidence-to-conclusion logic.
---

# Grade Research Report

Use this skill to evaluate whether a report is credible, clear, and decision-useful.

## Workflow

### Step 1: Parse report elements

Extract:
- Executive summary
- Key findings
- Evidence sources (data/quotes/charts)
- Segment comparisons
- Recommendations
- Limitations and confidence level

### Step 2: Score with rubric

Read `references/report-rubric.md` and score each dimension 0-5 with evidence.

### Step 3: Quantify quality

- Weighted total score (0-100)
- Readiness band:
  - 85-100: Decision-ready
  - 70-84: Mostly ready
  - 50-69: Needs substantial revision
  - <50: Rebuild required

### Step 4: Improve decision impact

Prioritize changes that improve actionability and traceability from evidence to recommendation.

## Output format

```md
# Research Report Quality Assessment

## Overall Verdict
- Score: X/100
- Band: Decision-ready | Mostly ready | Needs substantial revision | Rebuild required

## Rubric Scorecard
| Dimension | Score (0-5) | Weight | Weighted Score | Evidence |
|---|---:|---:|---:|---|

## What Works Well
- ...

## Gaps That Reduce Decision Confidence
1. ...

## Rewrite Suggestions
1. ...

## Recommendation to Stakeholders
- Publish now / Revise before sharing / Do not publish yet
```
