# Engineering and evidence standards

## Business and data

Define a stakeholder persona, decision, requirement and acceptance criterion before selecting a stack. Declare source rights, grain, keys, currency, time basis, exclusions and metric denominators. Preserve source hashes and account for accepted/rejected rows. Public data is not automatically licensed for redistribution. Keep raw files and individual customer records outside Git; label authored fixtures and simulations.

Revenue requires a documented transaction policy. Profit requires actual costs. Purchase non-return is not verified churn. Observed sales are not unconstrained demand. Synthetic fraud labels do not establish real-bank model performance.

## Code and validation

Use modular source, explicit configuration, actionable errors and deterministic local commands. Test business invariants, failure handling and reruns. Model pipelines need temporal/entity boundaries, a simple baseline, frozen holdouts and uncertainty/error analysis. Knowledge products need source/version citations, abstention, access checks and separate retrieval/generation evaluation. No model metric is claimed before the evaluation actually runs.

Use focused dependencies and pinned versions where external packages are needed. CI runs the offline fixture path; downloading a changing dataset on every PR is not a reproducibility strategy. Record live-data scope/hashes and commands separately.

## Documentation and presentation

Every featured project explains its problem, objectives, architecture, source rights, setup, execution, measured results, tests, limitations and next milestone. A mockup, specification or DAX handoff is identified as such. Do not invent customers, job experience, deployment, financial benefits or proficiency. AI-assisted development is part of this repository's workflow; the owner should be able to reproduce, review and explain each published artifact.

## Security and publication

Never commit credentials, `.env`, personal datasets, local databases or access keys. Use scoped authentication and keep tokens out of logs. Retrieved content cannot grant tool authority. Session-authenticated mutations require appropriate request protection; automation requires explicit approval boundaries, retries, idempotency and audit trails.

Changes use a feature branch, focused commits and reviewed checks. Require user approval for default-branch merges/releases and all destructive repository/account actions. The initial rebuild has explicit user approval; future approvals attach to a concrete diff and evidence. No paid service or account/security change is assumed. Security findings and test scopes must be described honestly, without a blanket safety guarantee.
