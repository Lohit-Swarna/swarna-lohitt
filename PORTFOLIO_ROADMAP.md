# Portfolio development roadmap

Updated 30 October 2026. This repository is the central portfolio hub. Keep implementations, specifications and measured results distinct; do not create separate empty repositories to imply delivery.

## Priority sequence

| Priority | Workstream | Scope and exit gate |
|---|---|---|
| 1 | Governed Business Intelligence Platform | A tested ingestion-to-metric foundation comes first. Extend it into a native Power BI report only after source controls, table grain and SQL totals are stable. Reconcile DAX against SQL under agreed filters. |
| 2 | Data Pipeline Reliability & Monitoring Platform | Build one atomic partition load, prove replay and recovery, then add PostgreSQL/dbt and scheduling. Observe freshness, rejected records, revisions and failures; source publication delay is separate from internal processing delay. |
| 3 | Enterprise AI Knowledge Assistant | Establish corpus rights/versioning, lexical and embedding baselines, a frozen held-out question set, citations and abstention before evaluating generated answers. No paid provider is assumed. |

## Milestones

1. **Data foundation:** document the business question and source rights; validate malformed records; reconcile all processed rows; demonstrate reruns; publish a bounded, attributed run with honest limits.
2. **BI reporting:** extend dimensional models, build Power BI/DAX measures, validate filter behavior and refreshes, add accessible screenshots and a native report/model artifact. A handoff document is not a Power BI report.
3. **Reliability vertical slice:** implement manifests and atomic partition replacement, backfills, failure injection, schema-change quarantine and an operational runbook. Orchestration follows a dependable command-line pipeline.
4. **Knowledge product vertical slice:** implement versioned ingestion/retrieval, then approved generation, access/version checks, manually reviewed grounding and held-out evaluation. Keep retrieval and generation failures separate.
5. **Application readiness:** select evidence for a specific role, verify fresh execution, prepare a short walkthrough and link measured results. Completing every candidate is not a prerequisite for applying.

## Later candidates

| Candidate | Distinct contribution required | Prerequisite |
|---|---|---|
| Customer lifecycle and repeat-purchase decision support | Time-safe customer snapshots, a defined non-return horizon, calibrated baseline/challenger and cohort analysis | Adequate historical labels; no true churn or uplift claims without supporting data |
| Demand planning and inventory simulation | Forecast backtests plus a clearly synthetic replenishment policy simulator | Controlling dataset terms verified; observed sales separated from unconstrained demand and simulated stock |
| Synthetic financial-crime alert triage | Capacity-constrained evaluation, seed/config provenance and pattern stress tests | Safe generator/dependencies; synthetic labels never presented as real-bank fraud performance |

## Promotion rules

`planned → design_ready → in_development → validated_foundation → awaiting_review → released`

Stages describe artifacts, not professional experience. `validated_foundation` means the documented slice and its checks ran; it does not claim a complete platform. Every promotion needs concrete evidence in the registry. Record data version/hash, scope, commands, actual test/evaluation output, limitations and the next gate. Keep targets separate from measured results.

No paid infrastructure or new account connection is assumed. Human approval is required for default-branch merges and releases under the portfolio operating policy. Existing approval for the initial rebuild covers its reviewed publication; future material changes need their own reviewed scope.
