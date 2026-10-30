"""Validate public portfolio contracts without requiring network access by default."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r'!?\[[^\]]*\]\(([^\n)]+)\)')
TOKEN = re.compile(r'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{25,})')
STAGES = {'planned', 'design_ready', 'in_development', 'validated_foundation', 'awaiting_review', 'released'}


def files() -> list[Path]:
    result = subprocess.run(['git', '-C', str(ROOT), 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], check=True, capture_output=True)
    return sorted({ROOT / p.decode('utf-8') for p in result.stdout.split(b'\0') if p and (ROOT / p.decode('utf-8')).is_file()})


def headings(file: Path) -> set[str]:
    seen: dict[str, int] = {}
    result = set()
    for line in file.read_text(encoding='utf-8').splitlines():
        if not re.match(r'^#{1,6} ', line):
            continue
        slug = re.sub(r'[^\w\- ]', '', re.sub(r'^#{1,6} ', '', line).strip().lower()).replace(' ', '-')
        count = seen.get(slug, 0)
        seen[slug] = count + 1
        result.add(slug + (f'-{count}' if count else ''))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--external', action='store_true', help='Also inspect unique external HTTP links; external restrictions are reported separately')
    args = parser.parse_args()
    errors: list[str] = []
    external: set[str] = set()
    local_count = svg_count = 0
    inventory = files()

    def local(raw: str, parent: Path) -> None:
        nonlocal local_count
        target = urllib.parse.urlsplit(raw.strip('<>'))
        if target.username or target.password:
            errors.append('A URL embeds credentials; value suppressed')
            return
        if target.scheme in {'https', 'http'}:
            external.add(raw)
            return
        if target.scheme:
            errors.append(f'Unsupported link scheme: {raw}')
            return
        path = (parent / urllib.parse.unquote(target.path)).resolve() if target.path else current_file
        local_count += 1
        if not path.is_relative_to(ROOT) or not path.exists():
            errors.append(f'Missing or out-of-scope local link in {parent.relative_to(ROOT)}: {raw}')
        elif target.fragment and path.suffix.lower() == '.md' and urllib.parse.unquote(target.fragment) not in headings(path):
            errors.append(f'Missing Markdown heading: {raw}')

    for current_file in inventory:
        relative = current_file.relative_to(ROOT)
        if current_file.stat().st_size > 1_000_000:
            errors.append(f'Unexpected large public artifact: {relative}')
        if current_file.name == '.env' or current_file.suffix.lower() in {'.db', '.sqlite', '.sqlite3', '.xlsx', '.xls', '.parquet', '.bundle'}:
            errors.append(f'Local/data/credential artifact must not be published: {relative}')
        try:
            text = current_file.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        if TOKEN.search(text):
            errors.append(f'Credential-shaped material detected in {relative}; value suppressed')
        if current_file.suffix.lower() == '.md':
            if len(re.findall(r'^```', text, flags=re.M)) % 2:
                errors.append(f'Unbalanced Markdown fence: {relative}')
            # Fenced commands/code examples are not Markdown links.
            prose = re.sub(r'^```[^\n]*\n.*?^```\s*$', '', text, flags=re.M | re.S)
            for raw in LINK.findall(prose):
                local(raw, current_file.parent)
        if current_file.suffix.lower() == '.svg':
            svg_count += 1
            try:
                xml = ET.fromstring(text)
                tags = [node.tag.rsplit('}', 1)[-1] for node in xml.iter()]
                if any(tag in {'script', 'foreignObject'} for tag in tags):
                    errors.append(f'Unsafe SVG element: {relative}')
                if not {'title', 'desc'}.issubset(set(tags)):
                    errors.append(f'SVG requires title and description: {relative}')
                for node in xml.iter():
                    for key, value in node.attrib.items():
                        if key.lower().startswith('on') or value.strip().lower().startswith('javascript:'):
                            errors.append(f'Unsafe SVG event or URI: {relative}')
                        if key.rsplit('}', 1)[-1] in {'href', 'src'} and not value.startswith('#'):
                            errors.append(f'SVG has external dependency: {relative}')
            except ET.ParseError:
                errors.append(f'Invalid SVG XML: {relative}')

    registry = json.loads((ROOT / 'portfolio.json').read_text(encoding='utf-8'))
    projects = registry['projects']
    if len({p['id'] for p in projects}) != len(projects):
        errors.append('Project IDs must be unique')
    for project in projects:
        if project['stage'] not in STAGES:
            errors.append('Unknown stage: ' + project['id'])
        if any(not (ROOT / project[key]).resolve().is_relative_to(ROOT) for key in ['path', 'readme']):
            errors.append('Project paths must stay inside the repository: ' + project['id'])
        if not (ROOT / project['readme']).is_file() or not (ROOT / project['path']).is_dir():
            errors.append('Missing project entry: ' + project['id'])
        if project['stage'] in {'planned', 'design_ready'} and (project['demonstration'] or project['evidence']):
            errors.append('Design-only project cannot claim execution evidence: ' + project['id'])
        if project['stage'] in {'validated_foundation', 'released'}:
            if not project['demonstration'] or not project['evidence']:
                errors.append('Validated project requires demonstration and evidence: ' + project['id'])
            else:
                for key in ['demonstration', 'evidence']:
                    if not (ROOT / project[key]).is_file():
                        errors.append('Missing ' + key + ': ' + project['id'])
                evidence_file = ROOT / project['evidence']
                if evidence_file.is_file():
                    json.loads(evidence_file.read_text(encoding='utf-8'))

    network_results = []
    if args.external:
        for url in sorted(external):
            request = urllib.request.Request(url, headers={'User-Agent': 'Portfolio-link-validation/1.0'})
            try:
                with urllib.request.urlopen(request, timeout=20) as response:
                    status = response.status
                network_results.append({'url': url, 'status': status, 'result': 'reachable'})
            except urllib.error.HTTPError as exc:
                restricted = exc.code in {401, 403, 429, 999}
                network_results.append({'url': url, 'status': exc.code, 'result': 'restricted_manual_review' if restricted else 'failed'})
                if not restricted:
                    errors.append(f'External link returned HTTP {exc.code}: {url}')
            except urllib.error.URLError as exc:
                network_results.append({'url': url, 'result': 'network_unverified', 'reason': str(exc.reason)})

    result = {'files_checked': len(inventory), 'local_links_checked': local_count, 'svg_files_checked': svg_count, 'projects_checked': len(projects), 'errors': errors, 'external_links': network_results}
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return bool(errors)


if __name__ == '__main__':
    sys.exit(main())
