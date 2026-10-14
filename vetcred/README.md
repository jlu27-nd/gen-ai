# VetCred application

An advisory military-credit review prototype for a fictional university. See the [root README](../README.md) for the assignment's AI disclosure, three test results and limitations.

## Quick start

Use Node.js 24 (Node 22.12+ is also supported by the build tool). From the repository root:

```sh
cd vetcred
npm install
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`. No API keys or server configuration are needed. On Replit append `-- --host 0.0.0.0` to the dev command.

The committed `pnpm-lock.yaml` provides reproducible installation with pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser test starts and stops a local production preview on port 4175. On Windows with Edge installed, `BROWSER_CHANNEL=msedge` can select it instead of a downloaded Chromium browser (PowerShell: `$env:BROWSER_CHANNEL='msedge'`). Test data is synthetic and created in memory. The default test command runs the logic suite without a browser.

## Supported input and evidence

Upload a selectable-text PDF or UTF-8 TXT (10 MB, at most 50 PDF pages and 100 records), or paste text. PDFs are read with a locally bundled PDF.js worker. Supported blocks start with `Course ID:`, `ACE Identifier:`, `ACE ID:`, or `Military Course ID:`. Each recognized course requires separately labeled fields:

```text
JOINT SERVICES TRANSCRIPT (JST)
Course ID: SYN-JST-NET-101
Course Title: Network Operations Fundamentals
Completion Date: 2025-05-16
Status: Completed
Semester Credits: 3
Level: lower
Learning Outcomes: Networking, TCP and routing.
```

CCAF text can use the same labeled blocks or pipe-separated rows `NET101 | Network Systems | 2025-01-01 | 3 | P` beneath a CCAF heading. Table records have unknown level until corrected. Quarter-hour units are not silently converted. This parser is a conservative first slice, not universal official-transcript support. Unsupported sections can be omitted; compare the complete original before confirming fields. Never treat extraction as proof of attendance or achievement.

Evidence locations refer to extracted-text line numbers; PDF line numbers are not original document page coordinates. Edits are reflected in the final record, and field changes remove its verification. Raw transcript text and filenames are not included in the packet; the packet does contain entered course fields and reviewer notes.

## Recommendation and review rules

- Exact synthetic ID + completion date within the approved pathway interval + matching level + enough source credits + human-verified fields can propose the target course's credits.
- Without an approved pathway, exact topic-word overlap finds a syllabus to investigate. It cannot propose credit or advance the review until supported evidence is available in a new analysis. There is no UI for inventing new approved pathways.
- Scores: 95 for a valid pathway; topic overlap / course-topic count × 55 for a search lead; cap at 40 for evidence gaps. No-match scores are zero. These are deterministic, uncalibrated heuristics, not probabilities.
- Missing information, invalid or future completion dates, incomplete training, low credits, level mismatches, duplicate target courses and the fictional 30-credit military cap block proposals. The small seed has only four approved targets, so the cap is presently a defensive future-expansion constraint.
- Program membership labels major core, general education, or elective candidate; elective credit requires advisor confirmation. This is not a degree audit.
- Faculty → Academic director → Registrar must each provide a rationale. Review completion means an advisory packet is ready, never that credit was awarded. Rejecting or requesting evidence removes that item's proposed credits.
- Input changes and program changes invalidate recommendations. Reanalysis creates a new session review, so export earlier history first if needed.

## Code map

| Path | Purpose |
| --- | --- |
| `data/catalog.js` | 40 courses, original synthetic syllabus summaries, four programs, source register, policy and pathways |
| `src/parser.js` | Bounded PDF/TXT extraction and conservative record parsing |
| `src/engine.js` | Pure recommendation, validation, review and export logic |
| `src/main.js` | Browser UI with escaped user text and in-memory state |
| `public/samples/` | Three wholly synthetic, identifier-free transcript extracts |
| `tests/engine.test.js` | Logic, invalid-input, review and export checks |
| `tests/browser.e2e.js` | Typical, challenge, invalid, PDF, CCAF and mobile browser checks |

## Deployment

`pnpm build` creates `dist/`, a static app suitable for GitHub Pages, Replit static hosting, or any static host. Relative asset paths support the repository subpath. `pnpm preview` previews that build locally. Runtime requests only fetch bundled assets and synthetic examples; there is no document upload endpoint, analytics or external model service.

The repository's Pages workflow runs logic tests and builds before deployment. Enable Pages with GitHub Actions in repository settings. Browser tests are a separate local acceptance check because they require a browser installation. The root `.replit` provides a development launch; this code was built and tested locally, not inside Replit.
