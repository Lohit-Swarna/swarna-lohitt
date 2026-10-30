# Project registry

Updated 30 October 2026. Machine-readable companion: [portfolio.json](portfolio.json).

| ID | Project | Stage | Demonstration / evidence | Next gate |
|---|---|---|---|---|
| BI-001 | [Governed Business Intelligence Platform](projects/governed-bi/README.md) | Validated data foundation | [Executive report](projects/governed-bi/reports/EXECUTIVE_REPORT.md), [run manifest](projects/governed-bi/reports/run_manifest.json), [tests](projects/governed-bi/tests) | Native Power BI report/model and reconciled DAX |
| DE-001 | [Data Pipeline Reliability & Monitoring Platform](projects/pipeline-reliability/README.md) | Design ready; not implemented | Source contracts, architecture and acceptance specification | Atomic partition ingestion and recovery tests |
| AI-001 | [Enterprise AI Knowledge Assistant](projects/knowledge-assistant/README.md) | Design ready; not implemented | Corpus/retrieval/answering design and evaluation specification | Licensed corpus and evaluated retrieval baseline |

Only the BI data foundation has execution evidence. There is no deployed service, native Power BI file, production customer, trained model or measured financial impact claimed by this registry. Read the run manifest for the exact bounded source scope.

## Evidence contract

Every project record names its accountable portfolio owner, directory, stage, source/data assumptions, roles, demonstration path and next milestone. A demonstration path must exist and show executed behavior; a design-only project has no demonstration URL. Data/model versions, commands and measured results belong in the project's own evidence records, not marketing copy.

Before moving a project to released: verify source rights, clean-environment reproduction, meaningful tests, security checks appropriate to the code, documentation and limitations, then approve the exact publication. Design-ready projects cannot borrow the BI project's passing tests as their own execution evidence.
