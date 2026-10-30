"""Run from any directory; offline fixture uses Python's standard library only."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "src"))
from governed_bi.pipeline import connect, fingerprint, load, read_csv, read_xlsx, write_report


def main() -> None:
    parser = argparse.ArgumentParser(description="Reconcile a declared source partition into a local retail star schema")
    parser.add_argument("mode", choices=["fixture", "csv", "xlsx"])
    parser.add_argument("--input", type=Path)
    parser.add_argument("--sheet", default="Year 2009-2010")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--source-key")
    parser.add_argument("--scope")
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    if args.mode == "fixture":
        source = HERE / "fixtures" / "synthetic_edges.csv"
        records = read_csv(source)
        key = args.source_key or "synthetic-edges-v1"
        scope = "Authored synthetic edge cases; no real customer data"
    else:
        if args.input is None or not args.source_key or not args.scope:
            parser.error("csv/xlsx require --input, --source-key and --scope")
        source, key, scope = args.input, args.source_key, args.scope
        if args.mode == "csv" and args.limit is not None:
            parser.error("--limit is supported only for xlsx; prepare an explicitly scoped CSV instead")
        records = read_csv(source) if args.mode == "csv" else read_xlsx(source, args.sheet, args.limit)
    with connect(args.db) as connection:
        result = load(connection, records, source_key=key, sha256=fingerprint(source), scope=scope)
        write_report(result, args.report)
    print(json.dumps({"source_rows": result["source"]["source_rows"], "accepted_rows": result["source"]["accepted_rows"], "rejected_rows": result["source"]["rejected_rows"], "report": str(args.report.resolve())}))


if __name__ == "__main__":
    main()
