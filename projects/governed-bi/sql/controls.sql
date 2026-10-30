SELECT COUNT(*) AS accepted_rows,
       COALESCE(SUM(line_value_units),0) AS signed_line_value_units,
       COALESCE(SUM(CASE WHEN line_value_units>0 THEN line_value_units ELSE 0 END),0) AS positive_line_value_units,
       COALESCE(SUM(CASE WHEN line_value_units<0 THEN line_value_units ELSE 0 END),0) AS negative_line_value_units,
       COALESCE(SUM(customer_key<>'UNKNOWN'),0) AS known_customer_lines,
       COALESCE(SUM(customer_key='UNKNOWN'),0) AS unknown_customer_lines,
       COALESCE(SUM(is_cancellation),0) AS cancellation_invoice_lines,
       COALESCE(SUM(quantity<0),0) AS negative_quantity_lines,
       MIN(date_key) AS first_date, MAX(date_key) AS last_date
FROM fact_line WHERE source_key=:source_key;
