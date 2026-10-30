# Rebuild validation record

Checked 30 October 2026. Tests establish the behavior of the documented data-foundation slice, not professional experience, a complete BI platform or a production service.

| Check | Observed result |
|---|---|
| Offline business/integration tests | **27 passed** on Python 3.12 and 3.14.7 |
| Synthetic CLI demonstration | 9 input rows = 4 accepted + 5 quarantined; exact signed value GBP 5.0010 |
| Historical UCI run | First 50,000 physical data rows of the named worksheet; 50,000 accepted, zero quarantined under the published contract |
| Post-fix source replay | Same source partition replaced; canonical UTF-8/LF aggregate manifest SHA-256 `9ff53b407ca666fae91296361bd82dc7e3e175043d37c67e44b19dfd5b891905` |
| Data coverage | 13,897 missing-customer lines retained in all-line controls; no individual customer records committed |
| Independent code review | Duplicate-header, over-precision and duplicate-source-identity defects fixed and regression-tested; rollback and extreme-number reproductions passed |
| Registry and local links | Stage/evidence contracts, relative file/heading targets and fenced Markdown checked by `scripts/validate_portfolio.py` |
| New images | SVG XML/accessibility/security checks; PNG banner exported and inspected; desktop and 390px content-column previews of GitHub-rendered Markdown checked |
| GitHub Markdown | Root README successfully rendered through GitHub's Markdown API with the exact repository context |
| External source links | Twelve unique non-LinkedIn destinations returned HTTP 200 during the final content check. LinkedIn returned HTTP 999 (automated access restricted), so its destination requires signed-in manual review; the existing public profile link was retained |
| Credential/data artifacts | Current publishable files checked for credential-shaped tokens and disallowed local/raw-data files; none detected. This is not a full historical secret scan |
| Workbook-reader dependencies | PyPI release metadata reported no published vulnerability advisory for pinned openpyxl 3.1.5 and et-xmlfile 2.0.0; a scoped metadata check, not a safety guarantee |
| CI | Read-only GitHub Actions workflow is configured for the offline checks. Actual run conclusions are available in the repository Actions tab; configuration alone is not a passing-run claim |

The earlier animated assets and non-default branch history were preserved in Git and a pre-rebuild local bundle. Their presence does not support new implementation claims. No legacy application code was executed.

See [BI validation](../projects/governed-bi/reports/VALIDATION.md) for source commands and detailed measurements. The pipeline-reliability and knowledge-assistant packages are designs; they have no executed application/model results. Native Power BI/DAX, RLS, cloud deployment, trained ML/NLP, generated-answer evaluation and live automation are not complete.

## Repeat the offline checks

```powershell
python scripts/validate_portfolio.py
python -m unittest discover -s projects/governed-bi/tests -v
python projects/governed-bi/cli.py fixture --db projects/governed-bi/.local/fixture.db --report projects/governed-bi/.local/fixture-report
```

`python scripts/validate_portfolio.py --external` separately performs network checks and reports restricted/unverified destinations honestly. Live link status can change. Do not interpret the offline CI as an external-link availability guarantee.
