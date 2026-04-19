# Output Templates

These templates are for the FINAL handoff to `planning-research`. Mid-conversation responses should be natural — no template needed.

## Structured Brief (status = ready)

Use this when all 4 core sections are pass and user has confirmed.

The format matters because `planning-research` parses it. But within each field, write naturally — don't pad or over-formalize.

<structured_brief>
  <brief_id>YYMMDD_ProductName_Feature</brief_id>
  <requester>Name</requester>
  <decision_maker>Name (if different from requester)</decision_maker>

  <business_performance>
    <context>What changed/launched — specific events and dates</context>
    <current_metrics>Numbers and rates, with sources where known</current_metrics>
    <problem>The gap or barrier — stated as specific, observable</problem>
    <solution>Product/feature response</solution>
    <kpis>Targets with numbers and timeframes</kpis>
  </business_performance>

  <research_objective>
    <raw>User's original words, verbatim, in their language</raw>
    <enhanced>Formal rewrite with all 4 elements: measurable + segment + scope + decision</enhanced>
    <sub_objectives>
      <obj_1>Sub-objective</obj_1>
      <obj_2>Sub-objective</obj_2>
      <obj_3>Sub-objective</obj_3>
    </sub_objectives>
  </research_objective>

  <target_audience>
    <primary_segment>Who + behavior + size + rationale</primary_segment>
    <secondary_segment>If applicable</secondary_segment>
  </target_audience>

  <timeframe>
    <deadline>Date</deadline>
    <dependencies>What depends on this</dependencies>
    <feasibility>green/amber/red + brief justification</feasibility>
  </timeframe>

  <classification>
    <research_type>Exploratory / Evaluative / Generative / Validating</research_type>
    <methodology_hint>Qual / Quant / Mixed + rationale</methodology_hint>
    <effort>Small / Medium / Large + key factors</effort>
  </classification>

  <research_context>
    <reach>
      <mau_momo>Range or "I don't know"</mau_momo>
    </reach>
    <product_research_type>Sản phẩm mới / Hiện hữu</product_research_type>
    <existing_info>What's already available</existing_info>
    <desired_info>Gaps to fill</desired_info>
    <hypotheses>Hypotheses or "None identified"</hypotheses>
    <actions>Expected actions or "To be defined"</actions>
  </research_context>
</structured_brief>

## Clarification (status = needs_clarification)

You don't need to output rigid XML for clarifications. Just make sure your response includes:

1. **Progress snapshot** — where each section stands (pass/partial/missing)
2. **What's missing** — the specific gap and why it matters
3. **One question** — the highest-priority question that unlocks the most progress

How you present this is up to you — a short paragraph, a bullet list, whatever fits the conversation tone. The only rule: one question per turn.

### Example (natural style):

> Here's where we are:
> - Business context pass
> - Objective partial — I have the topic but need to sharpen it
> - Audience missing
> - Timeline missing
>
> Next up: Bạn muốn ra quyết định gì sau khi có kết quả nghiên cứu này? This will help me write a focused objective.

### Example (compact style for returning users):

> Still need: deadline and target segment. Deadline trước nhé — khi nào cần kết quả?
