"""Business invariants and recovery checks; no network and no third-party packages."""
import copy
import csv
import json
import sqlite3
import sys
import tempfile
import unittest
from decimal import localcontext
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "src"))
from governed_bi.pipeline import connect, fingerprint, load, normalize, pounds, read_csv, report, write_report


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = connect(Path(self.temp.name) / "test.db")
        self.fixture = PROJECT / "fixtures" / "synthetic_edges.csv"
        self.base = next(read_csv(self.fixture))[1]

    def tearDown(self):
        self.db.close()
        self.temp.cleanup()

    def ingest(self, records=None, key="test"):
        return load(self.db, read_csv(self.fixture) if records is None else records,
                    source_key=key, sha256=fingerprint(self.fixture), scope="synthetic test")

    def test_every_source_row_is_accepted_or_quarantined(self):
        result = self.ingest()
        self.assertEqual((result["source"]["source_rows"], result["source"]["accepted_rows"], result["source"]["rejected_rows"]), (9, 4, 5))
        self.assertEqual(sum(result["quarantine_reasons"].values()), 5)

    def test_money_signs_and_sub_penny_precision_are_preserved(self):
        controls = self.ingest()["controls"]
        self.assertEqual(controls["signed_line_value_units"], 50010)
        self.assertEqual(controls["positive_line_value_units"], 62510)
        self.assertEqual(controls["negative_line_value_units"], -12500)

    def test_invoice_product_is_not_assumed_unique(self):
        self.ingest()
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM fact_line WHERE invoice='SYN100' AND product_code='SKU-A'").fetchone()[0], 2)

    def test_missing_customer_is_retained_in_all_line_totals(self):
        result = self.ingest()
        self.assertEqual(result["controls"]["unknown_customer_lines"], 1)
        self.assertEqual(self.db.execute("SELECT is_unknown FROM dim_customer WHERE customer_key='UNKNOWN'").fetchone()[0], 1)

    def test_cancellation_flag_and_negative_quantity_are_not_forced_equal(self):
        row = copy.deepcopy(self.base)
        row.update(Invoice="CSYN200", Quantity=2)
        normalized = normalize(row)
        self.assertEqual(normalized["is_cancellation"], 1)
        self.assertEqual(normalized["line_value"], 25000)

    def test_rerun_has_identical_controls_and_counts(self):
        first, second = self.ingest(), self.ingest()
        self.assertEqual(first, second)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM fact_line").fetchone()[0], 4)

    def test_source_rebuild_replaces_instead_of_appends(self):
        self.ingest()
        updated = copy.deepcopy(self.base)
        updated["Quantity"] = 10
        result = self.ingest([(2, updated)])
        self.assertEqual(result["source"]["source_rows"], 1)
        self.assertEqual(result["controls"]["signed_line_value_units"], 125000)
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM quarantine").fetchone()[0], 0)

    def test_replacing_one_partition_preserves_another(self):
        self.ingest(key="other")
        self.ingest([(2, self.base)], key="test")
        self.assertEqual(report(self.db, "other")["controls"]["accepted_rows"], 4)

    def test_reader_failure_rolls_back_prior_partition(self):
        before = self.ingest()

        def broken():
            yield 2, self.base
            raise RuntimeError("simulated input failure")

        with self.assertRaisesRegex(RuntimeError, "simulated input"):
            self.ingest(broken())
        self.assertEqual(report(self.db, "test"), before)

    def test_duplicate_source_row_rolls_back_prior_partition(self):
        before = self.ingest()
        with self.assertRaisesRegex(ValueError, "duplicate_source_row_identity"):
            self.ingest([(2, self.base), (2, self.base)])
        self.assertEqual(report(self.db, "test"), before)

    def test_nonfinite_prices_are_rejected(self):
        for value in ["NaN", "Infinity", "-Infinity"]:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "non_finite"):
                normalize(dict(self.base, Price=value))

    def test_more_than_four_decimal_places_are_not_silently_rounded(self):
        with self.assertRaisesRegex(ValueError, "precision"):
            normalize(dict(self.base, Price="0.00001"))

    def test_money_overflow_is_quarantined(self):
        result = self.ingest([(2, dict(self.base, Quantity="999999999999999999999"))])
        self.assertEqual(result["quarantine_reasons"], {"numeric_overflow": 1})

    def test_timezone_aware_values_are_not_silently_reinterpreted(self):
        with self.assertRaisesRegex(ValueError, "timezone_aware"):
            normalize(dict(self.base, InvoiceDate="2020-01-01T00:00:00+01:00"))

    def test_schema_drift_preserves_prior_partition(self):
        before = self.ingest()
        malformed = Path(self.temp.name) / "drift.csv"
        malformed.write_text("Invoice,RenamedPrice\nA,10\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "schema"):
            self.ingest(read_csv(malformed))
        self.assertEqual(report(self.db, "test"), before)

    def test_foreign_keys_and_metric_control_hold(self):
        result = self.ingest()
        self.assertEqual(self.db.execute("PRAGMA foreign_key_check").fetchall(), [])
        controls = result["controls"]
        self.assertEqual(controls["signed_line_value_units"], controls["positive_line_value_units"] + controls["negative_line_value_units"])

    def test_aggregate_overflow_blocks_commit_and_preserves_snapshot(self):
        before = self.ingest()
        large = dict(self.base, Quantity=1, Price="500000000000000")
        with self.assertRaises(sqlite3.OperationalError):
            self.ingest([(2, large), (3, large)])
        self.assertEqual(report(self.db, "test"), before)

    def test_extra_csv_values_are_not_silently_ignored(self):
        invalid = dict(self.base)
        invalid[None] = ["unexpected"]
        result = self.ingest([(2, invalid)])
        self.assertEqual(result["quarantine_reasons"], {"unexpected_field_count": 1})

    def test_duplicate_csv_header_aborts_and_preserves_snapshot(self):
        before = self.ingest()
        malformed = Path(self.temp.name) / "duplicate-header.csv"
        with malformed.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.writer(stream)
            writer.writerow([*self.base, "Price"])
            writer.writerow([*self.base.values(), "999"])
        with self.assertRaisesRegex(ValueError, "schema"):
            self.ingest(read_csv(malformed))
        self.assertEqual(report(self.db, "test"), before)

    def test_long_decimal_input_is_checked_before_any_rounding(self):
        with self.assertRaisesRegex(ValueError, "precision"):
            normalize(dict(self.base, Price="1.00000000000000000000000000001"))

    def test_insignificant_price_zeros_remain_exact(self):
        normalized = normalize(dict(self.base, Price="1.25000000000000000000000000000"))
        self.assertEqual(normalized["unit_value"], 12500)

    def test_fixed_point_boundary_uses_exact_integer_units(self):
        normalized = normalize(dict(self.base, Quantity=1, Price="922337203685477.5807"))
        self.assertEqual(normalized["unit_value"], 2**63 - 1)

    def test_duplicate_identity_across_accept_and_quarantine_aborts(self):
        before = self.ingest()
        bad = dict(self.base, Price="-1")
        for records in [[(2, self.base), (2, bad)], [(2, bad), (2, self.base)]]:
            with self.subTest(records=records), self.assertRaisesRegex(ValueError, "duplicate_source_row_identity"):
                self.ingest(records)
            self.assertEqual(report(self.db, "test"), before)

    def test_source_ordinals_must_be_positive_bounded_integers(self):
        before = self.ingest()
        for ordinal in [0, -1, True, 2.5, "2", 2**63]:
            with self.subTest(ordinal=ordinal), self.assertRaisesRegex(ValueError, "source_row_must_be_positive_integer"):
                self.ingest([(ordinal, self.base)])
            self.assertEqual(report(self.db, "test"), before)

    def test_extreme_numeric_exponents_do_not_expand_large_integers(self):
        cases = [("Price", "1E1000000", "overflow"), ("Quantity", "1E1000000", "overflow"), ("Price", "1E-1000000", "precision")]
        for field, value, reason in cases:
            with self.subTest(field=field, value=value), self.assertRaisesRegex(ValueError, reason):
                normalize(dict(self.base, **{field: value}))
        # Oversized numeric-looking identifiers remain labels, not massive ints.
        self.assertEqual(normalize(dict(self.base, Invoice="1E1000000"))["invoice"], "1E1000000")

    def test_fixed_point_money_is_independent_of_decimal_context(self):
        with localcontext() as context:
            context.prec = 2
            normalized = normalize(dict(self.base, Price="1.2500"))
            self.assertEqual(normalized["unit_value"], 12500)
            self.assertEqual(pounds(normalized["line_value"]), "2.5000")

    def test_report_bytes_are_canonical_utf8_lf_without_trailing_spaces(self):
        result = self.ingest()
        result["source"]["scope"] = "Synthetic scope £ — Unicode fixture"
        output = Path(self.temp.name) / "reports"
        write_report(result, output)
        for filename in ["run_manifest.json", "EXECUTIVE_REPORT.md"]:
            content = (output / filename).read_bytes()
            with self.subTest(filename=filename):
                self.assertNotIn(b"\r", content)
                self.assertTrue(content.endswith(b"\n"))
                self.assertTrue(all(line == line.rstrip() for line in content.decode("utf-8").splitlines()))
        self.assertEqual(json.loads((output / "run_manifest.json").read_bytes()), result)
        self.assertIn("£ —", (output / "EXECUTIVE_REPORT.md").read_bytes().decode("utf-8"))


if __name__ == "__main__":
    unittest.main()
