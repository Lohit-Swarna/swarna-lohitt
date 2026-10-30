"""Reproduce an aggregate-only SVG from the saved run manifest."""
import json
from decimal import Decimal
from html import escape
from pathlib import Path
from textwrap import wrap

HERE = Path(__file__).resolve().parent
data = json.loads((HERE / "reports" / "run_manifest.json").read_text(encoding="utf-8"))
source, controls = data["source"], data["controls"]
known = Decimal(controls["known_customer_lines"]) * 100 / source["accepted_rows"] if source["accepted_rows"] else None
row_count = f"{source['source_rows']:,}"
declared_scope = source["scope"]
scope_lines = wrap(declared_scope, width=125) or ["No declared scope"]
height = 445 + max(0, len(scope_lines) - 1) * 20
cards = [
    ("SOURCE ROWS", f"{source['source_rows']:,}", "Original worksheet order"),
    ("ACCOUNTED FOR", f"{source['accepted_rows'] + source['rejected_rows']:,}", "Accepted + quarantined"),
    ("KNOWN-CUSTOMER LINES", f"{known:.2f}%" if known is not None else "n/a", "Unknown customers remain in totals"),
]
parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-labelledby="title desc">', '<title id="title">Measured governed BI source controls</title>', f'<desc id="desc">{escape(row_count)} source rows inspected. Declared scope: {escape(declared_scope)}. No business impact is claimed.</desc>', f'<rect width="1200" height="{height}" rx="20" fill="#0c1729"/>', '<rect x="40" y="40" width="6" height="54" rx="3" fill="#42d3ba"/>', '<g font-family="Arial, sans-serif">', '<text x="66" y="63" font-size="16" font-weight="700" fill="#42d3ba">GOVERNED BUSINESS INTELLIGENCE</text>', '<text x="66" y="94" font-size="26" font-weight="700" fill="#f2f6fc">Source controls before headline metrics</text>']
for index, (label, value, detail) in enumerate(cards):
    x = 40 + index * 380
    parts += [f'<rect x="{x}" y="130" width="360" height="156" rx="12" fill="#16253b"/>', f'<text x="{x+22}" y="161" font-size="12" letter-spacing="1" fill="#b5c4d9">{label}</text>', f'<text x="{x+22}" y="220" font-size="40" font-weight="700" fill="#f2f6fc">{value}</text>', f'<text x="{x+22}" y="261" font-size="13" fill="#b5c4d9">{detail}</text>']
parts += [f'<text x="40" y="326" font-size="15" fill="#f2f6fc">Observed dates: {escape(str(controls["first_date"]))} to {escape(str(controls["last_date"]))}; {row_count} inspected source rows.</text>']
parts += [f'<text x="40" y="{355 + index * 20}" font-size="12" fill="#b5c4d9">{escape(line)}</text>' for index, line in enumerate(scope_lines)]
footer = 355 + len(scope_lines) * 20
parts += [f'<text x="40" y="{footer + 12}" font-size="13" fill="#b5c4d9">No customer records published • No profit or savings claim</text>', f'<text x="40" y="{footer + 40}" font-size="12" fill="#8d9eb6">Source: Chen (2012), UCI Online Retail II, CC BY 4.0 • See run_manifest.json and SOURCE_PROVENANCE.json</text>', '</g></svg>']
(HERE / "reports" / "kpi-summary.svg").write_text("\n".join(parts) + "\n", encoding="utf-8", newline="\n")
