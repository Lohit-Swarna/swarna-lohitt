# Data and operation contracts

Proposed contract v1. Exact source fields and types must be verified on the acquired TLC snapshot before implementation is accepted.

## Source manifest

Each file record requires `dataset`, `partition` (`YYYY-MM`), `source_url`, `retrieved_at_utc`, `sha256`, `byte_count`, `source_schema_fingerprint`, `observed_row_count`, `terms_reference` and `lookup_revision` where applicable. The logical partition and immutable content revision are separate identities.

Rules:

- Verify TLS and restrict downloads to the source allowlist; bound download size/time and retry attempts.
- Write a temporary download, verify it, then promote it to immutable landing storage.
- Persist the source bytes outside Git; do not overwrite a previously hashed file.
- Treat checksum changes as revisions, not as duplicate downloads to ignore.
- Preserve the exact schema in the manifest. A newly added nullable field may be compatible; missing/changed required fields fail closed until a new contract is approved.

## Typed trip contract

| Field / group | Planned treatment |
|---|---|
| Source row | Required file hash and zero-based or one-based ordinal; choose one convention and test it |
| Pickup/dropoff timestamps | Parse required fields; preserve source timezone semantics and document ambiguity; flag impossible order/duration |
| Pickup/dropoff location IDs | Resolve against versioned zone lookup; unknown IDs use explicit unknown member and quality flag |
| Distances/counts | Validate finite numeric values and sensible domain; document zero/negative policy rather than silently remove records |
| Fare/total components | Use explicit decimal precision; preserve valid source adjustments under a documented rule; no transport profit inference |
| Dataset-specific flags | Keep source values and contract mapping; unsupported values are visible validation exceptions |

Every source row must end in exactly one accepted or rejected category for the selected run. Multiple rejection reasons are allowed, but rejected-row counts are distinct source rows. A successful run satisfies `input_rows = accepted_rows + rejected_rows`.

## Proposed CLI contract

The following describes intended behavior, **not currently available commands**:

| Operation | Input | Required behavior |
|---|---|---|
| Fetch | Explicit dataset/partition and approved manifest | Download/verify one source revision, or reuse identical verified bytes |
| Validate | File hash and contract version | Emit accepted/rejected controls and compatible-schema decision |
| Publish | Partition, source revision, contract/code versions | Atomically publish after controls pass; preserve previous revision on failure |
| Backfill | Bounded inclusive partition range | Process explicit partitions; report partial failures and do not hide missing months |
| Status | Partition/run identifier | Return state, freshness, controls, version and safe failure reason |

Each operation returns a nonzero exit for an unsuccessful requested delivery. Retryable network errors, incompatible schema and failed reconciliation remain distinguishable. A run ID supports tracing, but idempotency is based on partition/source/contract identity rather than a random attempt ID.

## Metric definitions

| Measure | Definition / interpretation |
|---|---|
| Accepted share | Distinct accepted rows divided by input rows for one run; empty input is explicitly undefined |
| Unknown-zone share | Accepted rows with an unresolved required zone divided by accepted rows |
| Source publication lag | Observation time minus source reporting-period end; not an internal processing SLA |
| Internal processing lag | Successful publication time minus verified source availability time; availability observation method documented |
| Partition readiness | Required partition has a successful, active publication under its expected contract |
| Runtime / peak memory | Measured for a named dataset, hardware and environment; no unmeasured scale claim |

Dashboards must show the source revision and reporting period. Thresholds for warnings are set after baseline profiling and frozen before final evaluation; no current SLO result is claimed.
