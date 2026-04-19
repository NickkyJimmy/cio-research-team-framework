---
name: grade-research-plan
description: 
  Evaluate a research plan using a structured rubric and return a clear readiness
  verdict. Use this skill whenever the user asks to review, score, QA, pressure-
  test, or improve a research plan/proposal/study design, especially around method
  choice, sample design, timeline realism, or objective coverage.
---

# Grade Research Plan

Use this skill to assess whether a research plan is execution-ready.

## Workflow

### Step 1: Extract plan components

Identify:
- Decision and objective
- Research questions/hypotheses
- Method (qual/quant/mixed)
- Sample and recruitment approach
- Instrument/content mapping
- Analysis plan
- Timeline and dependencies
- Risks and mitigations

### Step 2: Apply rubric

Read `references/plan-rubric.md` and score each dimension 0-5 with evidence.

### Step 3: Compute readiness

- Calculate weighted score (0-100)
- Assign status:
  - 85-100: Execution-ready
  - 70-84: Ready with fixes
  - 50-69: Not ready
  - <50: Redesign required

### Step 4: Give corrective actions

Provide highest-priority improvements first and phrase them as concrete edits.

## Output format

```md
# Research Plan Quality Assessment

## Overall Verdict
- Score: X/100
- Status: Execution-ready | Ready with fixes | Not ready | Redesign required

## Rubric Scorecard
| Dimension | Score (0-5) | Weight | Weighted Score | Evidence |
|---|---:|---:|---:|---|

## Top Risks
1. ...

## Required Fixes Before Launch
1. ...

## Optional Enhancements
1. ...

## Final Recommendation
- Proceed / Proceed after fixes / Hold
```
