"""Download a pinned public UCI snapshot; never stores input data in Git by design."""
import argparse
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "src"))
from governed_bi.pipeline import fingerprint

URL = "https://archive.ics.uci.edu/static/public/502/online%2Bretail%2Bii.zip"
ARCHIVE_SHA256 = "572e36277c2390fbfde10664750731e0a86f55e33470d91919085f0408e67bfb"
WORKBOOK_SHA256 = "bcbe73b35f5b7babf197fb0cb983a11f5d9ff929078d4aa53d171b1f2df2e980"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    workbook = args.output / "online_retail_II.xlsx"
    if workbook.exists():
        if fingerprint(workbook) != WORKBOOK_SHA256:
            raise SystemExit("Existing workbook differs from pinned snapshot; choose a new directory or investigate source revision.")
        print("Pinned workbook already present: " + str(workbook.resolve()))
        return
    with tempfile.TemporaryDirectory(dir=args.output) as temporary:
        archive = Path(temporary) / "source.zip"
        with urllib.request.urlopen(URL, timeout=90) as response, archive.open("wb") as destination:
            shutil.copyfileobj(response, destination, 1024 * 1024)
        if fingerprint(archive) != ARCHIVE_SHA256:
            raise SystemExit("Archive checksum differs from recorded UCI snapshot; do not silently accept a new version.")
        with zipfile.ZipFile(archive) as bundle:
            members = [n for n in bundle.namelist() if Path(n).name == "online_retail_II.xlsx"]
            if len(members) != 1:
                raise SystemExit("Expected one known workbook in official archive")
            candidate = Path(temporary) / "online_retail_II.xlsx"
            with bundle.open(members[0]) as source, candidate.open("wb") as destination:
                shutil.copyfileobj(source, destination, 1024 * 1024)
        if fingerprint(candidate) != WORKBOOK_SHA256:
            raise SystemExit("Workbook checksum verification failed")
        candidate.replace(workbook)
    print("Pinned workbook downloaded and verified: " + str(workbook.resolve()))


if __name__ == "__main__":
    main()
