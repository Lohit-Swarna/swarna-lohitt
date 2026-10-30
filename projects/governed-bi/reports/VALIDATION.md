# Executed foundation validation

Run on 30 October 2026. Results describe the current data foundation and bounded historical input; they do not certify a native Power BI report, production service, full dataset, business impact or the portfolio owner's unaided proficiency.

| Check actually performed | Result |
|---|---|
| Offline unit/integration suite, Python 3.14.7 | **27 tests passed** |
| Same offline suite, Python 3.12 | **27 tests passed** |
| Synthetic CLI fixture | Nine source records; four accepted; five quarantined; GBP 5.0010 signed line value |
| Official UCI download | Archive and extracted workbook SHA-256 recorded in `SOURCE_PROVENANCE.json` |
| Shipped downloader's existing-file verification | Pinned workbook verified; changed snapshots are not silently accepted |
| Real XLSX reader and SQLite load | First 50,000 data rows of `Year 2009-2010`; 50,000 accepted; zero quarantined under the declared contract |
| Same-source full replay | Second load produced identical aggregate manifest; no appended duplicates |
| Row accounting, exact-money controls, foreign keys | Checked before commit and passed |
| Aggregate SVG generation | `render_summary.py` executed from saved manifest |

Real-data runtime environment: Windows, Python **3.14.7**, SQLite **3.50.4**, openpyxl **3.1.5**, et-xmlfile **2.0.0**. No performance benchmark is claimed. The canonical UTF-8/LF manifest's SHA-256 after replay is `9ff53b407ca666fae91296361bd82dc7e3e175043d37c67e44b19dfd5b891905`.

## Test coverage by failure mode

The 27 tests verify source row accounting; fixed-point sign/sub-penny precision; repeated invoice/product lines; unknown customers; cancellation/sign independence; deterministic replay; replacement semantics; source isolation; reader-failure rollback; duplicate-row-identity rollback; nonfinite values; excess precision; per-row overflow; timezone-policy rejection; schema-drift rollback; foreign-key/control invariants; aggregate-overflow rollback; unexpected CSV field rejection; duplicate-header rollback; long-decimal rejection without rounding; insignificant trailing-zero handling; exact fixed-point boundaries; cross-destination duplicate-ordinal rollback; positive bounded ordinal validation; extreme exponent guards; independence from Decimal context precision; and canonical UTF-8/LF output without trailing whitespace.

Independent review found duplicate-header ambiguity, context-rounded decimal precision and duplicate ordinals across accepted/quarantined destinations. These were corrected and covered by regression tests before publication. Exact source controls remained unchanged after the fixes.

Report and SVG writers explicitly emit UTF-8/LF on every platform so Git line-ending normalization cannot change the advertised artifact hash. Generated source/scope labels in the SVG derive from the run manifest rather than a fixed row-count caption.

They use a temporary SQLite database and authored synthetic data. They do not read real customer rows, require accounts or network, or mutate a shared database.

## Reproduction commands

From the repository root:

```powershell
python -m unittest discover -s projects/governed-bi/tests -v
python projects/governed-bi/cli.py fixture --db projects/governed-bi/.local/fixture.db --report projects/governed-bi/.local/fixture-report
```

The README contains the pinned-source download and exact first-50,000-row command. Run it twice with the same source key, database and scope; compare `run_manifest.json` byte-for-byte. Changing the descriptive scope changes the manifest text even if controls match, so preserve the documented command when comparing committed evidence.

## Explicitly unperformed work

No Power BI/DAX/RLS execution, complete 1,067,371-row processing, production deployment, cloud/Spark/dbt/Airflow operation, cost/margin analysis, customer-level publication, causal retention experiment, model training or enterprise scaling test was performed. CI is recorded separately by its actual run; a local pass is not evidence that an unexecuted remote workflow passed.
