CREATE TABLE IF NOT EXISTS dim_date (
    date_key TEXT PRIMARY KEY, year INTEGER NOT NULL, month TEXT NOT NULL, day INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS dim_product (product_code TEXT PRIMARY KEY, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS dim_customer (customer_key TEXT PRIMARY KEY, is_unknown INTEGER NOT NULL CHECK(is_unknown IN (0,1)));
CREATE TABLE IF NOT EXISTS dim_country (country TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS source_manifest (
    source_key TEXT PRIMARY KEY, sha256 TEXT NOT NULL, scope TEXT NOT NULL,
    source_rows INTEGER NOT NULL, accepted_rows INTEGER NOT NULL, rejected_rows INTEGER NOT NULL,
    CHECK(source_rows=accepted_rows+rejected_rows)
);
CREATE TABLE IF NOT EXISTS fact_line (
    source_key TEXT NOT NULL, source_row INTEGER NOT NULL, invoice TEXT NOT NULL,
    product_code TEXT NOT NULL REFERENCES dim_product(product_code),
    customer_key TEXT NOT NULL REFERENCES dim_customer(customer_key),
    country TEXT NOT NULL REFERENCES dim_country(country),
    date_key TEXT NOT NULL REFERENCES dim_date(date_key), timestamp_local TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity<>0), unit_value_units INTEGER NOT NULL CHECK(unit_value_units>=0),
    line_value_units INTEGER NOT NULL, is_cancellation INTEGER NOT NULL CHECK(is_cancellation IN(0,1)),
    PRIMARY KEY(source_key,source_row), CHECK(line_value_units=quantity*unit_value_units)
);
CREATE TABLE IF NOT EXISTS quarantine (
    source_key TEXT NOT NULL, source_row INTEGER NOT NULL, reason TEXT NOT NULL,
    PRIMARY KEY(source_key,source_row)
);
CREATE INDEX IF NOT EXISTS ix_line_date ON fact_line(date_key);
CREATE INDEX IF NOT EXISTS ix_line_customer ON fact_line(customer_key);
