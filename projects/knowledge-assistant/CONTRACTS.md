# Corpus and API contracts

Proposed contract v1. These structures specify intended behavior; they are not a deployed API or applied database schema.

## Corpus manifest

Each document revision requires:

| Field | Meaning |
|---|---|
| `document_id`, `version_id` | Stable logical identity and immutable revision |
| `source_uri`, `retrieved_at_utc`, `sha256` | Provenance and exact content fingerprint |
| `title`, `owner`, `authority` | Human-readable context and approved source precedence |
| `license_reference`, `attribution`, `third_party_exclusions` | Reuse/redistribution decision |
| `valid_from`, `valid_to`, `supersedes` | Validity interval; null end means open, not independently verified forever |
| `visibility`, `allowed_groups` | Trusted corpus policy; public or synthetic restricted fixture |
| `parser_version`, `chunker_version` | Reproducible processing configuration |
| `synthetic` | Required boolean for authored company/runbook scenarios |

Chunks retain `chunk_id`, document/version IDs, ordinal, text hash, section path and PDF page range where meaningful. Citations use immutable references and resolve to a supporting passage. A parser must distinguish missing text from an empty valid document. Scanned PDF/OCR support is deferred rather than silently claimed.

## Proposed endpoint: `POST /v1/questions`

Request fields: `question` (bounded nonempty string), optional `as_of` date if historical lookup is implemented, and optional client correlation ID. Authentication supplies caller identity separately; the body cannot grant access or select arbitrary groups. Bound request size and search/context budgets.

Response fields:

| Field | Contract |
|---|---|
| `request_id` | Server-generated trace ID |
| `status` | `answered`, `insufficient_evidence`, `conflicting_sources`, `evidence_only` or a documented error |
| `answer` | Text, nullable when no supported answer is available |
| `citations` | Allowed document/version/chunk references, section/page and source URI |
| `retrieval_version`, `generation_version` | Exact configurations; generation null in evidence-only mode |
| `corpus_snapshot` | Versioned manifest/hash used for the request |
| `reason` | Safe explanation of abstention/error without leaking denied source existence or text |

Use 400 for malformed requests, 401 for unauthenticated requests, 403 for an unauthorized operation, 429 for a bounded rate limit and 503 for an unavailable required dependency. A valid question lacking evidence returns a normal structured abstention, not an invented answer. Per-document denials are not enumerated to unauthorized users.

## Logging contract

Store request ID, authorized evaluation-safe metadata, corpus/configuration versions, status, timing and adjudicated error category. Do not log credentials, unrestricted full prompts or real personal data. Evaluation fixtures may retain synthetic inputs/outputs under an explicit policy. Define retention before a shared deployment.

## Evaluation-case contract

Each authored case needs `case_id`, question, allowed caller scope, expected answerability, valid date, acceptable source/version references, relevant passage labels, and a rubric for supported claims. Category labels include answerable, absent evidence, stale version, conflicting authority, restricted access and prompt injection. The corpus and test questions are versioned independently.

Split tuning and held-out questions before model/index tuning. Deduplicate near-identical paraphrases across splits. Record label/adjudication decisions and ambiguous cases. Do not silently re-label a failure after seeing the final output.

## Optional automation extension

A later draft workflow may emit a proposed action object with request/evidence IDs, approval state and idempotency key. External sending or execution is unavailable until an explicit authorized approval mechanism, error handling, audit trail and duplicate-action tests exist. This endpoint does not authorize autonomous actions.
