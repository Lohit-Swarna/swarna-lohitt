# Requirements and evaluation plan

**All tests and numerical results are pending implementation.** This package contains a release plan, not a passing benchmark or operational assistant.

## User stories and requirements

| ID | Story / requirement | Acceptance evidence |
|---|---|---|
| E-F01 | As a service operator, I need an answer tied to approved guidance | Each factual claim maps to permitted supporting evidence; citations resolve to the exact version/passage |
| E-F02 | As a knowledge owner, I need stale policies handled explicitly | Current and historical test cases select the valid revision; conflicts trigger a documented abstention |
| E-F03 | As an operator, I need the system to admit missing evidence | Unanswerable cases produce an explanation instead of unsupported policy instructions |
| E-F04 | As a reviewer, I need access boundaries to hold | Synthetic restricted text never reaches an unauthorized retrieval result, prompt, answer, citation or log |
| E-F05 | As an engineer, I need reproducible comparisons | Lexical and embedding configurations run against the same frozen corpus and held-out cases |
| E-F06 | As a maintainer, I need failures attributable to a stage | Parser, retrieval, evidence selection, generation and citation failures are reported separately |

## Non-functional requirements

- A free local demonstration with declared hardware/resource requirements; no new provider account assumed.
- Versioned corpus, rights records, model license and deterministic processing where applicable.
- Trusted authentication middleware before any shared access claim; synthetic ACL tests labeled as fixtures.
- Bounded inputs/context, safe errors and no execution of retrieved instructions.
- Text-accessible evidence and abstention status, not color-only indicators.
- Source attribution and limitations visible in README, responses and evaluation report.

## Evaluation design

Author at least **60 questions** spanning answerable, absent-evidence, stale-version, conflicting-source, restricted-access and injection cases. This is a planned minimum, not a dataset already created. Freeze a held-out portion before tuning and preserve case/source versions.

| Measure | Planned method / limitation |
|---|---|
| Retrieval recall@k | Compare returned permitted passages with authored relevance labels; report by case category |
| Citation correctness | Manually confirm that each sampled citation resolves and supports its associated claim |
| Unsupported-claim rate | Human adjudication of individual factual claims, with denominator and ambiguity policy |
| Abstention behavior | Report correct abstentions and unnecessary abstentions separately; do not reward blanket refusal |
| Access leakage | Adversarial fixture suite checks text, metadata, citations, errors and logs |
| Version validity | Cases spanning superseded/current/historical intervals and conflicts |
| Latency and cost | p50/p95 on named workload/hardware; cost only if an authorized metered runtime is actually exercised |

Choose numerical quality thresholds after the baseline is measured but before final tuning. Require **zero restricted-document leakage on the declared adversarial fixtures**; that fixture result would not prove universal security. Do not use an LLM judge alone as proof of factual correctness or convert test accuracy into saved staff hours.

## Release-blocking test plan

| Layer | Planned cases | Required behavior |
|---|---|---|
| Parser | Text PDF, empty extraction, broken HTML, duplicate content | Correct provenance; unsupported scanned/OCR case identified explicitly |
| Version policy | Current, future, expired and conflicting revisions | Only applicable authorized evidence selected; ambiguity disclosed |
| Access policy | Synthetic public/restricted documents and cross-user cache tests | No denied text/metadata leak in any response or log surface |
| Injection resistance | A document attempts to change role, reveal secrets or invoke tools | Treated as untrusted content; no authority escalation or side effect |
| Retrieval | Lexical baseline and embedding challenger | Frozen-set metrics and honest failure categories retained |
| Answering | Supported, absent and conflicting evidence | Correct citations or explicit abstention; generator failure not reported as success |
| API | Invalid/missing auth, oversized request, unavailable dependency | Contract-compliant status and safe error body |
| Reproduction | New local environment and pinned corpus/config | Same inputs and configurations recover the evaluation setup |

## Delivery gates

1. **Corpus gate:** bounded source allowlist, rights/attribution, synthetic labels and validity metadata accepted.
2. **Retrieval gate:** parser/provenance and lexical baseline implemented; labels/splits frozen.
3. **Semantic gate:** embedding model rights/runtime validated; challenger measured against baseline.
4. **Answer gate:** authorized generator exercised, claim/citation review and abstention cases completed.
5. **Security gate:** authentication/access/version/injection fixtures and safe logs pass review.
6. **Publication gate:** clean reproduction, limitations, actual results and the user's required approval.

A tested retrieval-only milestone may be published honestly while generation remains incomplete. Trained NLP/fine-tuning and action automation require separate scope and evaluation; they do not become demonstrated skills merely because this assistant design mentions them.
