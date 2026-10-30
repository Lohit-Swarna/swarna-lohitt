# Contributing and reproducing checks

Use Python 3.12 or newer for the offline checks. From the repository root:

```powershell
python scripts/validate_portfolio.py
python -m unittest discover -s projects/governed-bi/tests -v
```

The fixture path needs no external service or credential. Follow the BI project's README for the separate historical-data run and optional workbook-reader dependency. Keep downloaded data and local databases in ignored runtime directories.

For a change, create a feature branch, define expected behavior, include relevant tests and update the registry only when new evidence supports a stage change. Keep commits focused. Explain the problem, resulting behavior, validation commands/results and limitations in the pull request. Do not mix formatting with unrelated feature changes or count the same test run as evidence for unimplemented projects.

Do not submit credentials, private records, raw customer transactions or unlicensed copied assets. Synthetic fixtures must be labeled. Publication follows the owner's approval policy in the engineering standards.
