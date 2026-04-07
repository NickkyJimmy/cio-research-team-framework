---
name: planning-research
description: Convert a validated research brief into an execution-ready research plan with objective-led method selection, sample design, objective-to-content mapping, timeline, and deliverables. Use this skill whenever the user asks to build a research plan, proposal, or study design; choose qual vs quant vs mixed methods; translate business objectives into measurable research questions; design quotas, sampling, or recruitment strategy; pressure-test whether a plan can actually answer the decision; scope a research project; estimate research timelines or feasibility; or discuss tradeoffs between research approaches — even if they don't explicitly say "research plan."
---

## Purpose

Turn a structured brief into a complete plan that can be reviewed and executed by a research team without major rework.

Default output language:

- Write in Vietnamese.
- Keep method names and technical terms in English (IDI, FGD, CASI, CATI, NPS, CSAT, cross-tab, regression, thematic coding, quota sampling, etc.).
- Always use full Vietnamese diacritics in all Vietnamese text, including headings and section titles. Do not drop diacritics.

## Context Fields

These are the key contextual variables that shape every planning decision. Extract them from the brief and reference them throughout all phases.

- **Product maturity**: new launch / growth / mature / declining
- **Market type**: competitive / emerging / monopolistic
- **Budget envelope**: high (>$50k) / medium ($15-50k) / low (<$15k)
- **Data availability**: rich historical data / some prior research / greenfield
- **Stakeholder urgency**: high (decision deadline fixed) / medium / low (exploratory)
- **Regulatory constraints**: regulated industry (finance, health) / standard
- **User reach**: high digital penetration / mixed / offline-heavy
- **Decision reversibility**: irreversible (product kill) / semi-reversible / easily reversible

When context fields are ambiguous, state assumptions explicitly.

## Use References Intentionally

This skill has objective-focused reference docs. Load only what you need.

- `references/brief-template.md`: expected brief structure and validation
- `references/objectives-research.md`: convert business objective -> research objective -> decision questions
- `references/qualitative.md`: qualitative method selection and design
- `references/quantitative.md`: quantitative method selection and design
- `references/target-audiences.md`: audience segmentation and behavioral criteria
- `references/objective-content-mapping.md`: map sub-objectives to content blocks and analysis
- `references/sampling-playbook.md`: sample size logic and quota design
- `references/desk-research.md`: Phase 0 desk research execution guide
- `references/output-contract.md`: final output structure template
- `references/planning-guardrails.md`: edge cases and planning heuristics

If the brief objective is unclear, start with `references/objectives-research.md` before choosing methods.

### Reference Loading Protocol (Required)

Before drafting each major section, explicitly load the relevant reference file(s). Do not rely on memory when a reference exists.

- For brief validation and intake: read `references/brief-template.md`.
- For objective clarity and decision linkage: read `references/objectives-research.md`.
- For desk research planning: read `references/desk-research.md`.
- For method choice:
  - If quant intent, read `references/quantitative.md`.
  - If qual intent, read `references/qualitative.md`.
  - If mixed intent, read both.
- For audience and segment selection: read `references/target-audiences.md`.
- For sample sizing and quota logic: read `references/sampling-playbook.md`.
- For content block and report traceability: read `references/objective-content-mapping.md`.
- For final output formatting: read `references/output-contract.md`.
- For edge cases and decision heuristics: read `references/planning-guardrails.md`.

If any section is generated without loading the relevant reference, pause and correct it before final output.

### Reference Usage Rules (Anti-duplication)

Use references as decision support, not copy source.

- Do not paste large chunks of reference text into the plan.
- Extract only the parts needed for the current objective and constraints.
- If references conflict with the brief, call out the conflict and propose the safest assumption.
- Keep one authoritative rationale per decision (method, sample, timeline) to avoid contradictory statements.

## Plan Requirements

Produce these sections in the final plan (see `references/output-contract.md` for exact structure):

1. Project Information
2. Background & Research Objectives (including Research Context from brief)
3. Research Design (method + rationale)
4. Target Audience & Sample Design
5. Content Framework (objective-to-content mapping)
6. Timeline
7. Deliverables
8. Quality Gate Results
9. Assumptions & Limitations
10. Brief Deviation Log
11. Risk Register

## Execution Defaults

Use these defaults unless the brief explicitly overrides them:

- Include Desk Research as Phase 0.
- Prefer objective-fit over stakeholder method preference when they conflict.
- Keep recommendations decision-oriented, not method-oriented.
- If confidence is reduced due to constraints, quantify the risk in plain language.
- Budget awareness: if budget is specified, every method and sample recommendation must be feasible within it. If budget is not specified, ask or propose a reasonable range.

## Why This Matters

- Wrong method choice wastes budget and time.
- Weak mapping from objective to content creates reports that cannot answer business decisions.
- Weak sample design leads to unreliable evidence.
- Missing scope confirmation leads to rework and stakeholder misalignment.

The plan should be both reviewable and directly executable.

## Workflow

Follow phases in order.

## Stage-Gate Governance (Mandatory)

This skill is Gate B (Plan) in the research approval workflow.

- Before gate request: keep planning work `in_progress`.
- At gate request: move the governing gate issue to `in_review` and request board/CEO decision with plan artifacts.
- Hard stop: do not start or authorize instrument/questionnaire design until board/CEO explicitly approves in comments.
- If approved: mark Gate B done and hand off to Questionnaire Designer in `todo`.
- If revisions required: return to `in_progress`, update the plan, and resubmit for review.

Board/CEO decision should be requested via a Paperclip approval linked to the governing issue (rather than ad-hoc comments) so the outcome is explicit and wakeups route correctly.

### Phase 0 - Brief Validation

Before any planning work, validate the incoming brief.

Reference requirement:
- Read `references/brief-template.md`.

Check the brief contains these minimum fields:
- Business objective or problem statement
- Target audience (even if rough)
- Timeline or decision deadline
- Budget range (or confirmation that budget is flexible)
- Decision owner (who will act on findings)
- Existing data or prior research (even if "none")

If critical fields are missing, request them before proceeding. If optional fields are missing, note assumptions and continue.

Extract and document all Context Fields (see section above).

Assign a brief quality score:
- **High confidence**: all required fields present, KPI explicit, decision owner named, hypotheses stated
- **Medium confidence**: objective clear but KPI vague or decision framework incomplete
- **Low confidence**: vague objective, no decision framing, unclear audience

### Phase 1 - Synthesize Context

Use the validated brief as source of truth.

Reference requirement:
- Read `references/objectives-research.md` before rewriting objectives.
- Read `references/desk-research.md` to plan Phase 0 desk research scope.

- Rewrite business performance into narrative context:
  - product truth
  - current performance
  - business direction and KPI intent
- Reuse enhanced objective and sub-objectives from the brief.
- For each sub-objective, state the business decision it informs.
- Extract and integrate all Context Fields.

Before proceeding, validate objective quality with three checks:

- Is there a measurable or observable outcome?
- Is the user segment explicit?
- Is the decision that will use the result explicit?

If any check fails, rewrite objective statements first.

### Phase 1.5 - Scope Confirmation

Before detailed planning, present a lightweight scope summary for stakeholder alignment. This checkpoint prevents wasted effort from misaligned expectations.

Present:
- Recommended methodology (qual / quant / mixed) with one-sentence rationale
- Estimated sample scope (approximate n or number of sessions)
- Key segments to include (and notable exclusions)
- Approximate timeline range
- Budget feasibility assessment (fits / tight / over budget with options)
- Top 2-3 tradeoffs or risks

Format as a concise summary — not the full plan. The goal is to get a "yes, proceed" or "adjust X" before investing in detailed design.

If working in a context where stakeholder confirmation is not possible, note the scope assumptions and flag them for review.

### Phase 2 - Choose Method

Always include Desk Research as Phase 0 before primary research.

Reference requirement:
- Quant intent: read `references/quantitative.md`.
- Qual intent: read `references/qualitative.md`.
- Mixed intent: read both.

Decision guide:

- Quantitative intent (`how many`, `%`, measure, compare rates):
  - CASI if online reach is viable and timeline >= 3 weeks
  - CATI if timeline < 2 weeks
  - Boundary rule for 2-3 weeks: default to CATI for execution certainty and faster completion under review cycles; switch to CASI only if online reach is strong and questionnaire logic does not require interviewer support.
  - Field survey with quota sampling otherwise
- Qualitative intent (`why`, `how`, explore, understand):
  - IDI for individual depth (8-15 per segment)
  - FGD for group dynamics/idea generation (2-3 groups per segment)
  - In-home visit / immersion for behavioral context
  - Online diary / mobile ethnography for longitudinal behavioral capture
- Mixed intent:
  - Qual exploration -> Quant validation (when hypothesis is weak, mechanism unknown)
  - Quant screening -> Qual deep dive (when prevalence is known but mechanism is not)

For the chosen method, explain:

- What method is selected
- Why it fits the objective and constraints
- Why alternatives are less suitable
- Key trade-offs and limitations
- Budget fit (is this feasible within stated budget?)

Mixed methods handoff logic (state explicitly when using mixed):
- Qual -> Quant: "Qual themes generate hypothesis list -> quant survey validates prevalence and priority ranking. Handoff artifact: coded theme list with testable propositions."
- Quant -> Qual: "Quant identifies anomalous segments or unexpected patterns -> qual explores mechanism behind those patterns. Handoff artifact: segment profile + anomaly questions."

Method guardrails:

- Do not pick FGD/IDI for objectives that require prevalence, lift, or statistically stable segment comparisons.
- Do not pick pure survey when the core question is mechanism discovery and no strong hypothesis exists.
- For mixed methods, state sequence and handoff logic explicitly (what phase informs the next and what artifact bridges them).

Context Field calibration for method choice:
- Budget low: favor single-method over mixed; consider online-only
- User reach offline-heavy: favor CATI or field over CASI
- Stakeholder urgency high: favor faster methods (CATI, smaller qual sample)
- Data availability rich: lighter primary research may suffice; heavier desk research
- Decision reversibility low (irreversible): invest in stronger evidence quality

### Phase 3 - Design Sample

Sampling guidance:

- Quant:
  - CASI: n >= 100 per core segment; total n around 300-500
  - Segment comparisons: keep n >= 100 per compared segment
  - CATI: n >= 100 per segment
- Qual:
  - IDI: 8-15 participants per segment
  - FGD: 2-3 groups x 6-8 participants per segment

Reference requirement:
- Read `references/target-audiences.md` for segment routing.
- Read `references/sampling-playbook.md` for quota and feasibility stress test.

Before finalizing segments, use `references/target-audiences.md` and write explicit selection logic based on:

- objective type
- timeframe class
- brief confidence level
- budget constraints

For every segment:

- define behavioral inclusion criteria (not just demographics)
- assign explicit n per cell
- provide a quota table
- explain allocation rationale
- include recruitment feasibility (high/medium/low)
- estimate recruitment cost per segment (if budget is specified)

If deadline is unrealistic, propose a reduced-scope sample and document trade-offs.

If objective requires segment comparison, ensure each compared segment has enough n to support stable comparison.

If segment scope exceeds deadline or budget, reduce to decision-critical segments and document what confidence is lost.

Calibrate sample sizes based on Context Fields.

### Phase 4 - Map Research Content

This is the most important phase — it determines whether the plan can actually answer the business decision.

Reference requirement:
- Read `references/objective-content-mapping.md` before creating content blocks.

For each sub-objective, create at least one content block containing:

- block name
- objective mapping
- what will be measured/explored
- metrics/dimensions
- question types (scale, open-end, multiple choice, ranking)
- analysis approach (cross-tab, regression, thematic coding)

For each content block, add a decision linkage line:
- `Decision use:` what stakeholder action this block enables

Traceability checks:

- each sub-objective maps to >= 1 content block
- each content block maps to >= 1 sub-objective
- no orphan content blocks

Map content to desired information and hypotheses from the brief.

### Phase 5 - Build Timeline

Baseline durations (adjust by method and sample):

- Phase 0: Desk Research - 2-3 days
- Phase 1: Research design & questionnaire - 3-5 days
- Phase 2: Pilot / pre-test - 1-2 days
- Phase 3: Fieldwork / collection - 5-10 days
- Phase 4: Processing & cleaning - 2-3 days
- Phase 5: Analysis & report writing - 3-5 days
- Phase 6: Presentation & handover - 1 day

Mark human review checkpoints:

- after Phase 1 (questionnaire review)
- after Phase 5 (report review)

If total duration exceeds brief deadline:

- flag it explicitly
- propose scope-reduction options (see `references/planning-guardrails.md` for priority order)
- never compress silently

### Phase 6 - Self-Validate

Before final output, run all validation checks.

Completeness checks:
- all sub-objectives are mapped to content
- sample logic fits method choice
- method rationale explains why, not only what
- timeline aligns with deadline or includes explicit warning
- quota table sums correctly
- report preview aligns 1:1 with content blocks
- no unresolved placeholders (TBD, to be added)
- all Context Fields are documented
- budget feasibility confirmed

Objective coverage quality:
- no sub-objective is only weakly addressed (surface mention only)
- each key business decision has at least one strong evidence path
- all required references were loaded for the relevant phases

Cross-phase consistency checks (critical):
- Method chosen in Phase 2 is compatible with sample design in Phase 3
- Content blocks in Phase 4 are feasible within the timeline in Phase 5
- Audience segments in Phase 3 match the content targeting in Phase 4
- Budget (if specified) supports the combined method + sample + timeline
- Mixed methods handoff logic in Phase 2 is reflected in the timeline phases

Decision Risk Assessment:
Assign an overall decision risk level:
- Low: clear objective, adequate sample, proven method, comfortable timeline, budget fits
- Medium: some constraints require tradeoffs, but primary decision path is sound
- High: significant constraints force compromises that weaken evidence quality

Document the risk level and reasoning in the plan output.

If any check fails, revise before final output.

## Output

Read `references/output-contract.md` for the exact output structure template.

For edge cases and planning heuristics, consult `references/planning-guardrails.md`.
