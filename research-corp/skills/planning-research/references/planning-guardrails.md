## Planning Guardrails: Edge Cases & Heuristics

Consult this reference when facing complex planning decisions, constraints, or edge cases.

## Core Heuristics

- Objective-first, method-second. Never invert this order.
- Be specific enough that another researcher can execute without asking for major clarification.
- If trade-offs are required, show what confidence is lost and which decisions become unsafe.
- Prefer one coherent recommendation over multiple disconnected options unless user asks for alternatives.
- Budget is a constraint, not an afterthought — every recommendation must be feasible.

## Edge Cases

### High Objective Count (>= 5 sub-objectives)
- Cluster related objectives into 2-3 themes.
- Warn about scope complexity and recommend phasing if timeline allows.
- Each cluster should have a clear primary decision it serves.

### Budget Constrains Method
- If mixed methods is ideal but budget only allows one stream, recommend the method that best serves the primary decision.
- Suggest the second stream as follow-up research.
- Document what evidence quality is lost by going single-method.

### Very Small Budget (<$10k)
- Default to single-method, single-segment.
- Consider online-only methods (CASI, online IDI).
- Use existing internal data aggressively to reduce primary research scope.
- Be transparent about confidence limitations.

### Brief Changes After Planning
- If brief changes after plan generation, update only impacted sections.
- List what changed and cascade the impact (method? sample? timeline?).
- Use the Brief Deviation Log to track changes.

### Missing Historical Data
- If historical data is unavailable for desk research, declare the limitation.
- Suggest a small qualitative pilot (3-5 exploratory IDIs) before full primary research.
- Adjust the timeline to include the pilot phase.

### Stakeholder Method Insistence
- If stakeholders insist on a mismatched method (e.g., "we want FGD" when objective is prevalence):
  - Explain the evidence quality risk clearly but respectfully.
  - Propose a compromise (e.g., add a small qual component alongside the appropriate quant method).
  - Document the limitations if proceeding with the stakeholder's preferred method.

### Timeline Compression
When the deadline forces scope reduction, follow this priority order:
1. Reduce non-critical segments before decision-critical segments.
2. Reduce secondary content blocks before core objective blocks.
3. Compress desk research or processing phases (with caveats) before fieldwork.
4. Reduce pilot scope (fewer pre-test interviews) before eliminating pilot entirely.
5. Preserve at least one strong evidence path per key decision.

### Conflicting Stakeholder Priorities
- If different stakeholders want different things from the same study:
  - Identify the common decision thread.
  - Propose a shared core + optional add-on modules per stakeholder.
  - Make clear what is core vs optional in the plan.

## Decision Risk Assessment Guide

### Low Risk
- Clear, measurable objective with explicit KPI
- Adequate sample (n >= minimum per segment)
- Proven method for this objective type
- Timeline has buffer (>= 1 week slack)
- Budget fits comfortably

### Medium Risk
- Some constraints require tradeoffs
- Primary decision path is sound but secondary paths are weaker
- Timeline is tight but achievable
- Budget requires prioritization but covers essentials

### High Risk
- Significant constraints force compromises on method, sample, or coverage
- At least one key decision lacks a strong evidence path
- Timeline requires compression that affects data quality
- Budget forces elimination of important components