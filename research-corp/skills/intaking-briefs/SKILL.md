---
name: intaking-briefs
description: Turn messy research requests (chat messages, docs, notes, partially filled forms) into a validated structured brief with business context, decision-linked objective, behavioral target audience, feasibility-checked timeframe, and research classification. Use whenever the user wants to intake, scope, or clarify a research request — even without the word "brief." Also trigger for rewriting vague objectives, preparing research handoffs, checking brief completeness, or phrases like "I need to understand why users..." / "Can we research..." / "Tôi muốn tìm hiểu..." / "Làm brief cho..." / "Scope cái này giúp mình." Trigger proactively when a conversation contains an unstructured research need. Required gate before planning-research — do not skip. If you see any research request without a structured brief, use this skill first.
---

# Brief Intaking



## First Turn: Quick Assessment

Before anything else, classify the input:

| Signal | Action |
|--------|--------|
| All 4 core sections recognizable | **Fast path** — extract, validate, enhance, confirm |
| 2-3 sections, clear gaps | **Targeted path** — extract what's there, ask 1-2 questions |
| 1 sentence or product name | **Conversational path** — start with the business decision question |
| Multiple disconnected objectives | **Split path** — flag, ask user to prioritize |
| Returning conversation | **Resume path** — load prior state, continue |

## Why This Matters

- No decision-linked objective → research nobody acts on
- Missing sections → `planning-research` guesses → 1-2 weeks wasted
- Multiple conflated objectives → unfocused research
- Your `<structured_brief>` output is the ONLY input `planning-research` accepts

## State Management

### Working Draft

Track this mentally after every user response:

- Section A (Business Performance): ✅/⚠️/❌ — context, metrics, problem, solution, KPIs
- Section B (Research Objective): ✅/⚠️/❌ — raw, enhanced, sub-objectives, user approved?
- Section C (Target Audience): ✅/⚠️/❌ — primary segment, secondary, size, rationale
- Section D (Timeframe): ✅/⚠️/❌ — deadline, dependencies, feasibility
- Sections E-H: status summary
- Overall: ready / needs_clarification
- Next gap to resolve

### Rules

- Before asking anything: check if already answered, inferable, or actually needed
- Never restart mid-conversation — always build on what you have
- Acknowledge corrections explicitly
- Show progress summary (✅/⚠️/❌) after 2-3 exchanges

## Process

### Step 1 — Detect Input Mode & Extract

**Document/long text:** Extract silently → show section summary → ask only for gaps
**Chat/notes:** One question at a time → prioritize high-unlock questions → progress summary after 2-3 turns
**Structured form:** Validate against 4 sections → ask about empty/insufficient fields only
**Mixed:** Extract from document first → chat fills gaps

**Normalization:**
- Merge duplicates into canonical fields
- User-provided data = source of truth
- Mark uncertain facts `[unconfirmed]`, inferences `[inferred]`
- Preserve original objective wording in `raw` always
- Capture both requester and decision-maker

### Step 2 — Build the 4 Core Sections

Ask ONE question per turn. Resolve in this priority order — each unlocks the most downstream context:
1. Business decision → what to measure
2. Target segment → who to study
3. Scope boundary → what's in/out
4. Timeline → feasibility

**Section A — Business Performance**
- Context: what happened / launched / changed (>20 words for specificity)
- Current Metrics: numbers — adoption, MAU, revenue, conversion (ranges OK, mark `[approximate]`)
- Problem Statement: the gap or barrier (>20 words)
- Solution Description: product/feature response
- Business KPIs: numeric targets with timeframes

**Section B — Research Objective**
- Raw: user's original words, verbatim
- Enhanced: formal rewrite (Step 3)
- Sub-objectives: 2-5 specific numbered goals

**Section C — Target Audience**
- Primary segment: defined by BEHAVIOR ("what do they DO?"), not demographics alone
- Secondary: only if objective needs a comparison group
- Size estimate: order of magnitude (~2M users, ~15% MAU)
- Rationale: why this segment connects to the business decision

**Section D — Timeframe**
- Deadline
- Dependencies: campaigns, sprints, releases
- Feasibility: 🟢 standard / 🟡 tight but possible / 🔴 unrealistic

Feasibility benchmarks: desk research 3-5 days, survey 2-3 weeks, qual 3-4 weeks, mixed 4-6 weeks, large-scale 6+ weeks.

### Step 3 — Enhance the Research Objective

This is the highest-value step. A casual "tìm hiểu về user" should never pass downstream.

**The enhanced objective needs 4 elements:**

| Element | Test |
|---------|------|
| Measurable | Can you count, rank, rate, or compare something? |
| Explicit segment | Is the exact user group named? |
| Scope boundary | Clear what's in and out? |
| Decision link | What changes based on findings? |

**Process:**
1. Check which elements are present, partial, or missing
2. Draft enhancement with available info
3. Annotate: `[stated]` / `[inferred]` / `[needs confirmation]`
4. Present to user for approval — never silently finalize
5. If rejected: keep their version in `raw`, yours in `enhanced`, flag measurability risk
6. If multiple disconnected goals: flag, suggest splitting

### Step 4 — Enrich with Context

- **Reach (E):** MAU MoMo % range (default: "I don't know")
- **Product Research Type (F):** Sản phẩm mới / Hiện hữu (required, no default)
- **Information Context (G):** Existing info (ask — requesters forget prior data) + Desired info (required)
- **Hypotheses & Actions (H):** What they believe is true + what they'd do with results (both optional but valuable)

### Step 5 — Classify

- **Type:** Exploratory / Evaluative / Generative / Validating
- **Method hint:** Quantitative / Qualitative / Mixed
- **Effort:** Small (1-2w) / Medium (3-4w) / Large (6+w)

### Step 6 — Validate & Score

All 4 core sections must be ✅ AND user must approve the enhanced objective → status = `ready`.
Any core section ⚠️ or ❌ → `needs_clarification`.

### Step 7 — Confirm & Output

**If ready:** Present a natural summary of the complete brief. Get user confirmation. Then output structured brief per `references/output_templates.md`.

**If needs_clarification:** Show progress, explain the top gap, ask one focused question.

**If stuck (3+ rounds same gap):** Offer to proceed with best inference marked `[inferred]`.

**If user is rushed:** Do a "quick draft" — fill all gaps with inferences, present everything at once, let them correct in one pass.

## How to Respond

Respond like a sharp colleague, not a form. Adapt to the user:

- **Casual PM:** conversational, Vietnamese default, research terms in English
- **Formal VP:** crisp, executive-style
- **Frustrated/rushed user:** fast-draft mode, one pass
- Always use full Vietnamese diacritics in all Vietnamese text. Do not drop diacritics.

Mid-conversation responses should feel natural — use ✅/⚠️/❌ progress indicators when helpful, but don't force rigid structure on every message. The structured output only matters at the final handoff.

Present the brief summary however is clearest for the situation — a clean list, a short narrative, a table. The point is clarity, not format compliance.

## Red Flags — Stop Immediately

| Red Flag | Do |
|----------|----|
| "Research everything about users" | Offer 2-3 scoping options |
| Qual + < 1 week | 🔴, suggest alternatives |
| No business question | "What decision will this inform?" |
| No target segment | "Who specifically?" |
| Contradictions | Flag, ask to resolve |
| Multiple objectives | Flag, ask to split or prioritize |
| Product name only | Ask what question needs answering |

## Stage-Gate Governance

This skill is Gate A (Brief). Weave into your flow:
- Drafting → `in_progress`
- Brief ready + confirmed → `in_review` + request human decision (approval)
- Hard stop: no planning until board/CEO approves
- Approved → close Gate A, hand off
- Changes requested → back to `in_progress`

### How To Request Gate A Review (Paperclip Approval)

When the brief is ready and confirmed, create an approval request so it lands in the board inbox and produces an explicit outcome.

This is resolved by a board-authenticated user (human).

- Approval type: `research_gate_a_brief`
- Link it to the governing Gate A issue (so activity, context, and wakeups route correctly)
- Payload should include at least:
  - `gate`: `"A"`
  - `artifact`: `"brief"`
  - `briefId`: the Brief ID (see below)
  - `objective`: the enhanced objective (short)
  - `decisionNeeded`: one sentence describing what approval enables

Interpret outcomes:

- **Approved**: proceed to `planning-research` (Gate B)
- **Request revision**: return to `in_progress`, apply changes, then resubmit the same approval
- **Rejected**: stop and escalate to a human for scope reset (do not proceed)

## Brief ID

Format: `YYMMDD_ProductName_Feature` (date = finalization date)

## Output

When the brief is complete and confirmed, output the structured brief following the template in `references/output_templates.md`. For mid-conversation, just be clear and natural.

For detailed examples of good and bad intake handling, see `references/examples.md`.
