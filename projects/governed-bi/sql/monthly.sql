-- Window total makes each month's contribution inspectable without leaking customer rows.
WITH monthly AS (
    SELECT substr(date_key,1,7) AS month, COUNT(*) AS line_count,
           SUM(line_value_units) AS signed_line_value_units
    FROM fact_line WHERE source_key=:source_key GROUP BY substr(date_key,1,7)
)
SELECT *, SUM(line_count) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS cumulative_lines
FROM monthly ORDER BY month;
