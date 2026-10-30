# Power BI handoff — planned, not executed

No native `.pbix`/`.pbip` file has been authored, no DAX has been executed, and no report/RLS/performance result is claimed. This is a concrete implementation specification for the next milestone.

## Proposed model and measures

Import the validated fact and dimensions through a documented supported connection/export path. Establish one-to-many single-direction relationships from date/product/customer/country to fact. Hide raw integer fields from casual report users. Model a selected source partition explicitly; importing overlapping partitions without source filters can double-count.

The following DAX is an **unverified specification**, using the schema's four-decimal unit scale:

```dax
Signed Line Value GBP = DIVIDE(SUM(fact_line[line_value_units]), 10000)

Accepted Lines = COUNTROWS(fact_line)

Known Customer Lines =
    CALCULATE([Accepted Lines], fact_line[customer_key] <> "UNKNOWN")

Known Customer Line Share = DIVIDE([Known Customer Lines], [Accepted Lines])

Cancellation Invoice Lines =
    CALCULATE([Accepted Lines], fact_line[is_cancellation] = 1)
```

Keep source filtering and rounding behavior aligned with the SQL contract. Define display currency and non-calendar filters explicitly. Do not rename signed line value to profit or recognized revenue.

## Three report pages

1. **Executive source controls:** row accounting, signed/positive/negative values, source period, source hash/version, incomplete-period warning and customer coverage.
2. **Exceptions and adjustments:** quarantine counts/reasons, cancellation-vs-negative-quantity definitions, zero-price cases and an analyst investigation workflow.
3. **Customer coverage:** known vs unknown line coverage and eligible customer analysis. Cohort or retention calculations require a defined cutoff/horizon and are not in the current foundation.

## Acceptance before calling this milestone complete

- Deliver the native model/report plus screenshots, refresh instructions and versioned source definitions.
- Reconcile unfiltered and sliced DAX results to SQL on a frozen source partition. Match underlying four-decimal control values before choosing a presentation rounding rule.
- Test empty filters, unknown customers, cancellation and negative-quantity cases; ensure totals do not change because a dimension member is absent.
- Verify refresh and error behavior from a fresh environment. Validate report navigation, captions, keyboard/accessibility and mobile layout.
- Add RLS only when a concrete access requirement exists; if added, test at least allowed and denied identities rather than claiming RLS from a role definition.
- Label the historical bounded slice, incomplete periods, data license and remaining limitations on the report itself.

The current application supports a reproducible local data foundation. A completed handoff document is not a completed Power BI platform.
