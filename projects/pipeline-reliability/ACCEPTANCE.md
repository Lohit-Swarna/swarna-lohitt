# Requirements and acceptance plan

**All tests below are planned and unexecuted.** This design package has no implemented pipeline, CI result or measured performance report.

## User stories and functional requirements

| ID | Story / requirement | Acceptance evidence |
|---|---|---|
| B-F01 | As an analytics lead, I need to see which periods are ready before reporting | Status lists each requested partition, source revision, validation outcome and publication time |
| B-F02 | As a data engineer, I need retries to preserve a trustworthy mart | Replaying identical input/contract leaves fact counts and controls unchanged |
| B-F03 | As a maintainer, I need corrected source files to be visible | Changed checksum produces a traceable revision and explicit rebuild |
| B-F04 | As an analyst, I need explained exclusions | Accepted/rejected accounting reconciles every source row; reason counts avoid double-counting rows |
| B-F05 | As an operator, I need bounded recovery | An explicit backfill range supports rerun after a controlled failed partition |
| B-F06 | As a reviewer, I need lineage from aggregate to input | Mart identifies publication, contract, source and code revisions |

## Non-functional requirements

- Reproducible local execution with documented versions and a small offline synthetic fixture.
- No paid services, account secrets or confidential data required for the first demo.
- Transactional partition publication and bounded retries; no silent partial success.
- Accessible status reporting that communicates missing/stale/failed states in text, not color alone.
- Run-time/resource measurements on a stated workload before any scale or latency claim.
- Raw downloads, secrets and generated databases excluded from Git; license/terms decisions documented.

## Release-blocking test suite

| Test | Fixture / action | Pass condition |
|---|---|---|
| Unit: manifest validation | Missing partition, invalid hash, unapproved URL | Fail with a safe actionable error before download/load |
| Unit: schema policy | Missing required column, compatible optional addition, changed required type | Match the declared compatibility policy; unsupported changes do not publish |
| Unit: value/row accounting | Invalid dates, non-finite numbers, unknown zones, multiple errors on one row | Correct policy and reason codes; each input row counted exactly once |
| Integration: replay | Load the same file/contract twice | Same active rows/control totals; no duplicated publication effect |
| Integration: revision | Replace a month with a changed valid file | New revision becomes active; prior revision remains traceable |
| Integration: rollback | Fail between staging and transaction commit | Previous active partition remains unchanged; failed attempt recorded |
| Integration: concurrency | Two writers for the same partition | No mixed revision; deterministic lock/conflict behavior |
| Data quality | dbt key/FK tests and source-to-mart controls | All required checks pass or publication is blocked |
| Operations | Transient network failure, missing source month, bounded backfill | Bounded retry; clear cause; only requested partitions affected |
| Reproduction | New environment using documented commands | Offline fixture and selected real partition reproduce recorded controls |

Before release, save commands, exit codes, source/hash, environment, run IDs and actual results. A test definition is not a passing result. Numerical performance targets will be agreed after initial profiling, before final tuning.

## Stop/go and delivery gates

1. **Data gate:** exact source files obtainable; applicable terms recorded; sample schema/timezone assumptions validated.
2. **Core gate:** CLI ingestion, row accounting and atomic publish/replay tests pass.
3. **Analytics gate:** dbt lineage, keys and metric controls pass.
4. **Operations gate:** failure injection, safe backfill and status reporting demonstrated.
5. **Reproduction gate:** clean local run and honest report verified before adding Airflow.
6. **Publication gate:** independent review, scoped security checks and the user's required publication approval.

If the dataset exceeds the available machine's resources, reduce to a declared partition/sample and disclose it. Do not claim enterprise scale from a diagram. Keep Spark, cloud and transactional lakehouse work deferred until there is a measured requirement.
