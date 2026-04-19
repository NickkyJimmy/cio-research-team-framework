---
name: grade-brief-quality
description: 
  Evaluate the quality of a research brief using a rubric and produce actionable
  feedback. Use this skill whenever the user asks to assess, score, review, QA,
  or improve a research brief/intake brief/request brief, even if they do not
  explicitly ask for "grading". Trigger on prompts about brief clarity,
  feasibility, audience definition, decision focus, or brief completeness.
---

# Grade Brief Quality

Use this skill to grade a brief in a consistent, evidence-based way.

## When to apply this skill

Apply it when the user provides a brief (draft or final) and wants a quality assessment, a score, or prioritized improvements.

## Workflow

### Step 1: Parse the brief

Extract key elements:
- Business context
- Decision to be made
- Research objective
- Target audience
- Scope and constraints (time, budget, market)
- Deliverables

If required fields are missing, continue grading with explicit penalties instead of blocking.

### Step 2: Grade with rubric

Read and apply `references/brief-rubric.md`.

Use the 0-5 scale for each dimension and cite concrete evidence from the brief for each score.

### Step 3: Calculate totals and classify

- Compute weighted overall score (0-100).
- Assign quality band:
  - 85-100: Ready
  - 70-84: Minor revisions
  - 50-69: Major revisions
  - <50: Rewrite needed

### Step 4: Recommend improvements

Prioritize top 3 gaps with highest impact on decision quality.

For each gap include:
- Problem
- Why it matters
- Exact rewrite suggestion

## Output format

Use this structure:

```md
# Brief Quality Assessment

## Overall Verdict
- Score: X/100
- Band: Ready | Minor revisions | Major revisions | Rewrite needed
- Decision confidence: High | Medium | Low

## Rubric Scores
| Dimension | Score (0-5) | Weight | Weighted Score | Evidence |
|---|---:|---:|---:|---|

## Strengths
- ...

## Critical Gaps
1. ...

## Recommended Rewrites
1. ...

## Final Recommendation
- Ship as-is / Revise then proceed / Do not proceed yet
```
