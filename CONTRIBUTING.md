# Contributing and reproducing checks

Use Python 3.12 or newer for the offline checks. From the repository root:

```powershell
python scripts/validate_portfolio.py
python -m unittest discover -s projects/governed-bi/tests -v
```

The application also has assertion-based processing tests. With Node.js 24 or newer, these use the built-in test runner and TypeScript stripping, without installing dependencies:

```text
node --test --experimental-strip-types lib/processing.test.ts
```

`npm test` invokes the same command. CI runs Python and Node checks in digest-pinned, network-disabled containers on standard GitHub-hosted runners. The source mount is read-only and no application credentials are supplied. Dependency installation, application builds and credential-dependent integrations are separate checks; do not infer their success from this offline suite.

The fixture path needs no external service or credential. Follow the BI project's README for the separate historical-data run and optional workbook-reader dependency. Keep downloaded data and local databases in ignored runtime directories.

For a change, create a feature branch, define expected behavior, include relevant tests and update the registry only when new evidence supports a stage change. Keep commits focused. Explain the problem, resulting behavior, validation commands/results and limitations in the pull request. Do not mix formatting with unrelated feature changes or count the same test run as evidence for unimplemented projects.

Do not submit credentials, private records, raw customer transactions or unlicensed copied assets. Synthetic fixtures must be labeled. Publication follows the owner's approval policy in the engineering standards.
