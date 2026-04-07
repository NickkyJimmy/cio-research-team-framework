# Research Corp

Research company powered by a hierarchical pipeline — from brief intake through data analysis to executive-ready reports.

This is an [Agent Company](https://agentcompanies.io) package for [Paperclip](https://paperclip.ing).

## How it works

Research Corp operates as a **supervised pipeline**. Every research request flows through five specialist stages, with the Research Leader acting as a quality gate at each handoff.

```
CEO
 └── Research Leader (reviews every stage)
      ├── 1. Brief + Plan → brief + methodology + timeline
      ├── 2. Questionnaire Agent → surveys & instruments
      ├── 3. Data Processing → cleaned data & insights
      └── 4. Report Agent → final executive report
```

## Org Chart

| Agent | Title | Reports To | Role |
|-------|-------|------------|------|
| CEO | Chief Executive Officer | — | Receives research requests, delegates to Research Leader, reviews final reports |
| Research Leader | Head of Research | CEO | Supervises pipeline, reviews every stage output, ensures quality |
| Brief + Plan | Brief Intake Analyst & Research Planner | Research Leader | Produces structured research briefs and converts them into research plans |
| Questionnaire Agent | Survey & Instrument Designer | Research Leader | Designs surveys, interview guides, and data collection tools |
| Data Processing | Data Analyst | Research Leader | Cleans data, extracts insights, produces statistical analysis |
| Report Agent | Research Report Writer | Research Leader | Synthesizes findings into polished executive reports |

## Getting Started

Import this company into Paperclip:

```bash
npx companies.sh add <path-to-research-corp>
```

Or use the Paperclip CLI:

```bash
paperclipai company import --from ./research-corp
```

## References

- [Agent Companies Specification](https://agentcompanies.io/specification)
- [Paperclip](https://github.com/paperclipai/paperclip)
