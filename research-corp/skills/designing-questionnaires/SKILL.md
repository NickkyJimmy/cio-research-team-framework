---
name: designing-questionnaires
description: Transform research plans and content frameworks into execution-ready instruments — screener, survey questionnaire (Quant), and discussion guide (Qual). Use whenever the user needs to design, review, or improve questionnaires, screeners, discussion guides, or bảng câu hỏi from a content framework. Also triggers for skip logic, bias checking, mode adaptation (CASI/CATI/Field/Mobile/IDI/FGD), tracking studies, pilot testing, or instrument translation. Covers bộ câu hỏi khảo sát, hướng dẫn thảo luận, and question mapping — even without the word "questionnaire."
---



**Default output language: Vietnamese.** All respondent-facing questions, response options, instructions, and termination messages are written in Vietnamese unless the user explicitly requests English or bilingual output. Internal metadata, section headers, and analyst-facing notes may use English for clarity.
Always use full Vietnamese diacritics in all Vietnamese text, including headings and section titles. Do not drop diacritics.

---

# Core Responsibilities

1. Parse the approved research plan to extract objectives, methodology, content blocks, target segments, and sample design
2. Systematically map each content framework element to appropriate question types
3. Generate a **screener questionnaire** with correct routing logic
4. Generate a **main survey** (Quant) or **discussion guide** (Qual) mapped 1:1 to content blocks
5. Apply **skip logic and routing** aligned to segments and mode
6. Detect and eliminate **question bias**
7. Adapt instrument format for the target collection mode
8. Produce **IRIS SURVEY DETAIL output** plus a markdown questionnaire deliverable for issue display
9. Ensure **data analysis readiness**
10. Design **pilot test protocol** before fieldwork
11. Support **bilingual output** (Vietnamese primary, English secondary)
12. Self-validate against **quality gates** before output
13. Support **tracking/multi-wave studies** with instrument versioning
14. Attach both the final IRIS Excel artifact and markdown deliverable to the governing issue, then post a handoff note before `ready_for_review`

---

# Handoff Protocol

**Upstream:** This skill receives input from `planning-research`.

**Input required:** Approved Research Plan with objectives, methodology, method (CASI/CATI/IDI/FGD), target segments with behavioral criteria, quota table, content framework (measures, dimensions, question types, analysis approach), and timeline.

**Output produced:** Two final deliverables are required: (1) IRIS Excel artifact (`SURVEY DETAIL`) generated from script, and (2) markdown questionnaire deliverable for issue display and human review.

**Downstream:** Output feeds into fieldwork execution and Data Processing Agent.

**Issue handoff rule (mandatory):** Once the questionnaire/discussion guide is complete, you must attach both the final IRIS Excel artifact and markdown deliverable back to the governing issue, then post a concise handoff note for the next stage. Do not create a separate "Phase 7.6" or any extra pseudo-phase after completion.

**Before marking "ready":** Every content block has questions. Screener routes all segments correctly. Zero bias violations. Completion time fits mode. Analysis readiness confirmed. Final IRIS Excel artifact and markdown deliverable are attached to the issue and handoff note is posted.

---

# Input Parsing

Before instrument design, parse the approved research plan:

1. **Extract methodology and method** — Quant (CASI/CATI/Field/Mobile), Qual (IDI/FGD), or Mixed
2. **Extract content framework** — Map objectives → sections, measures → questions, analysis approach → scales
3. **Extract segment definitions** — Behavioral criteria → screener, quotas → routing, exclusions → termination
4. **Extract constraints** — Timeline → length, mode → format rules, budget → complexity
5. **Check for tracking study** — Is this wave 2+? Benchmark questions to preserve? New questions to add?

**If the plan is incomplete:** Flag gaps, do NOT guess content blocks, request clarification, suggest defaults marked as **"[GIẢ ĐỊNH — cần xác nhận]"**

---

# Process

Follow these 13 phases in order. Do not skip phases.

## Phase 1 — Build Content Framework Traceability Matrix

Map the entire content framework to question specifications before writing any questions. Present the matrix for stakeholder confirmation before proceeding.

→ Read `references/content-framework-mapping` for the full mapping engine: traceability matrix template, question type decision tree, analysis-scale compatibility table, and coverage validation checklist.

## Phase 2 — Design Screener

Design the screener to determine eligibility and segment assignment:

- **2.1** Demographic screener (quota-controlling only)
- **2.2** Category/industry screener (exclude sensitive industries)
- **2.3** Behavioral screener (translate segment criteria into concrete questions with timeframes)
- **2.4** Routing logic (answer combinations → segment assignment, termination messages in Vietnamese)
- **2.5** Quota check integration (over-quota rules, backup routing)

→ Read `references/examples` for screener examples with routing tables.

## Phase 3 — Design Main Instrument

### Step 3a — Construct Decomposition (do this FIRST)

Before writing any questions, decompose every content block into a generation hierarchy:

> **Content Block → Construct → Dimensions → Indicators**
> 

Each indicator becomes a generation seed. For example:

- Content Block: "Digital Payment Adoption"
    - Construct: Perceived Ease of Use
        - Dimension: Interface usability → Indicators: navigation clarity, task completion confidence, error recovery
        - Dimension: Learning curve → Indicators: time to first transaction, help-seeking frequency

This decomposition is the primary multiplier for question pool size. Present the full decomposition to the user before generating questions.

### Step 3b — Per-Indicator Question Generation

Generate questions **per indicator, not per construct**. For each indicator:

- Generate **5–8 candidate items**
- Use **at least 3 different question formats** (e.g., Likert, behavioral frequency, scenario-based, semantic differential, ranking)
- Write all respondent-facing content in **Vietnamese**
- Tag each item with: indicator, format type, recommended scale, analysis method

This approach ensures a rich question pool (typically 70–180 items for a standard study) that can be curated down to the final instrument.

### Step 3c — Instrument Assembly

- **IF Quantitative** → Survey questionnaire with section structure, scale rules, recommended question flow, attention checks. Select the strongest 2–3 items per indicator from the pool.
- **IF Qualitative** → Discussion guide with section timing, flow (intro → context → journey → deep-dive → stimulus → wrap), probing rules
- **IF Mixed** → Both instruments with sequencing notes

**Scale labeling rule (Quant):** Use fully labeled 5-point scales by default (label 1–5), unless the user explicitly asks for anchor-only labels.

→ Read `references/question-patterns` for 8 reusable Vietnamese-language patterns (Awareness Funnel, SOA, Product Funnel, Satisfaction Battery, Attribute Evaluation, IPA, Behavioral Recall, Concept Testing).

### Step 3d — Expansion Pass (Gap Analysis)

After initial generation, review the question pool for gaps:

1. **Coverage check** — Which dimensions have fewer than 5 items? Generate more for those.
2. **Format diversity check** — Are any indicators covered by only one question format? Add variety.
3. **Edge case check** — Are there respondent scenarios (e.g., non-users, lapsed users) not adequately covered?
4. **Cross-indicator check** — Can any questions serve double duty across related indicators?

Output the gap analysis as a table and generate additional items to fill gaps before proceeding to Phase 4.

## Phase 4 — Apply Skip Logic & Routing

Define all skip/routing rules in a table format. Validate: every path reaches the end, no dead ends, no infinite loops, minimum path captures core metrics.

## Phase 5 — Bias Detection & Quality Check

Review every question for 6 bias types and validate all response options.

→ Read `references/bias-detection` for the full bias checklist with Vietnamese examples (leading, double-barreled, loaded, ambiguous, social desirability, order bias) and response option validation rules.

## Phase 6 — Data Analysis Readiness Check

Verify scale-analysis compatibility, sample size sufficiency, comparison design, and coding frame readiness. Output a readiness checklist table.

→ See the analysis-scale compatibility table in `references/content-framework-mapping` (Step 3).

## Phase 7 — Mode Adaptation

Adapt the instrument for the target collection mode.

→ Read `references/mode-adaptation` for constraints per mode: CASI, CATI, Field, Mobile In-app, IDI/FGD.

## Phase 8 — IRIS Template Output (Always)

Always produce two final artifacts:

1. IRIS template Excel output (`SURVEY DETAIL`) generated via IRIS rules.
2. Markdown questionnaire deliverable for issue display (human-readable screener, main instrument/discussion guide, skip logic summary, and key notes).

Workflow:
1. Read `references/survey_questionaire_sheet_rule.md` before formatting.
2. Use `scripts/build_iris_survey_detail.py` to generate the sheet from a JSON spec.
3. If available, use `references/TTT_questionnaire_IRIS.xlsx` as a concrete reference for structure.

Mandatory IRIS output rules:
- Output contains only the `SURVEY DETAIL` sheet (remove `HDSD`, `TEMPLATE`).
- Always fill the Survey Objective block (rows 1-4) before questions.
- Start writing at the first `PAGENAME` row (row 6 in the reference) to avoid duplicates.
- The Excel file generated by script is a required final deliverable for handoff and attachment.
- A markdown deliverable is also required for issue readability and reviewer workflow.

## Phase 9 — Pilot Test Protocol

Design a pilot test: 5–10 respondents per segment, test completion time, confusing questions, drop-off points, screener effectiveness, skip logic, scale usage. Output a checklist and apply post-pilot revisions.

## Phase 10 — Stakeholder Review Protocol

Send review package (matrix + draft + skip logic + readiness checklist). Guide review focus: coverage, priority, wording, options, length. Track revisions and get sign-off.

## Phase 11 — Bilingual Adaptation

- Primary: Vietnamese (natural, not academic; "bạn" for B2C, "anh/chị" for B2B)
- Technical terms: keep English (CASI, CATI, NPS, CSAT)
- Back-translate key questions; adapt cultural references
- If English required: side-by-side format

## Phase 12 — Self-Validate

Run all quality gates. Fix any failures before output.

- Content framework coverage (every block has ≥ 1 question, no orphans)
- Screener integrity (all segments reachable, termination correct)
- Skip logic completeness (every path reaches completion)
- Bias check passed (zero violations, randomization applied)
- Mode compliance (time within limits, formats appropriate)
- Data analysis readiness (scale-analysis compatibility confirmed)
- Language quality (natural Vietnamese, consistent terminology)
- Instrument metadata complete

**IF any gate fails** → revise before output. **IF gate failure requires plan clarification** → flag and request.

## Phase 13 — Mandatory Issue Attachment & Handoff

This phase is required every time. Do not mark the task ready without completing it.

Required actions:
1. Attach final IRIS Excel artifact to the governing issue (required).
2. Attach markdown questionnaire deliverable to the governing issue (required).
3. Post a handoff comment to the issue that includes:
   - What was attached
   - Instrument version
   - Estimated completion time
   - Any constraints/assumptions
   - Suggested next owner (Research Leader / downstream stage)
4. Only after (1), (2), and (3), move status to ready_for_review.

If attachment is blocked (permission/tooling issue), do not proceed silently. Mark as blocked and state exactly what is missing.

---

# Output Format

When all quality gates pass, deliver as:

1. **Final artifact 1 (required):** IRIS Excel file (`SURVEY DETAIL`) generated by script.
2. **Final artifact 2 (required):** Markdown questionnaire deliverable attached to the issue.
3. **Handoff comment (required):** concise summary for reviewer/downstream agent.
---

# Quality Standards (Non-negotiable)

1. **1:1 mapping** — Every content block → question section
2. **Zero bias tolerance** — No leading, double-barreled, or loaded questions
3. **Exhaustive & exclusive options** — Complete, non-overlapping response options
4. **Order discipline** — Unaided before aided, general before specific, behavior before opinion
5. **Mode-appropriate** — Length and format match mode constraints
6. **Screener accuracy** — 100% correct segment classification
7. **Skip logic integrity** — Every path reaches completion
8. **Natural Vietnamese** — No awkward translations
9. **Randomization** — Applied to all multi-select lists and evaluations
10. **Attention checks** — At least 1 in surveys > 15 questions, placed after the first third of the survey (never in the first 3 questions). For surveys > 30 questions, add a second check in the final third. Use instructed-response format (e.g., "Vui lòng chọn 'Đồng ý' cho câu này") rather than consistency traps.
11. **Analysis readiness** — Every question compatible with planned analysis
12. **Pilot tested** — Protocol included with every instrument
13. **Instrument versioning** — Track draft versions throughout the design process: v0.1 (initial generation), v0.2 (post-bias-check), v0.3 (post-pilot revision), v1.0 (final approved). Include version number, date, and change summary in instrument metadata. For tracking studies, also maintain a change log across waves.
14. **Issue attachment completed** — Final IRIS Excel artifact and markdown deliverable are attached to the governing issue and handoff note is posted before ready_for_review.

---

# References

Load these as needed based on the current phase:

- `references/content-framework-mapping` — Phase 1 & 6: Traceability matrix, question type decision tree, analysis-scale table, coverage validation
- `references/question-patterns` — Phase 3: 8 reusable Vietnamese question patterns by measurement type
- `references/bias-detection` — Phase 5: 6 bias types with Vietnamese examples, response option validation
- `references/mode-adaptation` — Phase 7: Constraints per mode (CASI, CATI, Field, Mobile, IDI/FGD)
- `references/survey_questionaire_sheet_rule.md` — IRIS SURVEY DETAIL rules and question types
- `references/tracking-study` — When multi-wave: Benchmark preservation, versioning, wave metadata
- `references/examples` — Any phase: Screener, traceability matrix, good/bad question, discussion guide examples
- `references/edge-cases` — When non-standard: >5 blocks, mixed methods, incomplete framework, sensitive topics
