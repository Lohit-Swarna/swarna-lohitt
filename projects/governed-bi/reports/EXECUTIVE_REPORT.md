# Governed BI: measured data-foundation report

This is a retrospective source-processing demonstration, not a production deployment or business-impact claim.

**Scope:** UCI Online Retail II; Year 2009-2010 worksheet; first 50,000 physical data rows after header in original order; historical nonrepresentative bounded slice

**Source key:** `uci-502-year2009-2010-first50000-v1`

**Input SHA-256:** `bcbe73b35f5b7babf197fb0cb983a11f5d9ff929078d4aa53d171b1f2df2e980`

| Control | Measured value |
|---|---:|
| Rows inspected | 50,000 |
| Accepted lines | 50,000 |
| Quarantined lines | 0 |
| Known-customer lines | 36,103 |
| Missing-customer lines retained | 13,897 |
| Cancellation-invoice lines | 1,154 |
| Negative-quantity lines | 1,255 |
| Signed line value, GBP | 969943.2200 |
| Positive line value, GBP | 997908.3900 |
| Negative line value, GBP | -27965.1700 |
| Source date range | 2009-12-01 to 2010-01-11 |

Signed line value is quantity × stated unit price, preserving the source sign. It is not audited recognized revenue, profitability or savings. Cancellation invoices are flagged separately; unmatched reversals are not inferred. Figures retain four decimal places and are not rounded per line.

## Quarantine accounting

| Reason | Lines |
|---|---:|
| None | 0 |

## Monthly source activity

| Month | Lines | Signed line value, GBP |
|---|---:|---:|
| 2009-12 | 45,228 | 799847.1100 |
| 2010-01 | 4,772 | 170096.1100 |

## Decisions supported and limits

An analyst can reconcile accepted and quarantined rows, separate missing-customer coverage from all-line totals, and investigate cancellation/negative-quantity activity before publishing a measure. A bounded sequential slice is not representative of the full business: no customer concentration or retention recommendation is inferred from this slice. Customer identifiers and individual rows are deliberately excluded from this report.

See the source provenance, metric contract and reproduction instructions in the project README. Native Power BI report authoring, DAX execution, stakeholder validation and production operation remain uncompleted milestones.
