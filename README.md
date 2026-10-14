# VetCred

VetCred translates military learning into evidence-backed, human-reviewed credit recommendations for the fictional **University of Notion Dame**. It **never awards credit**.

The self-contained application is in [`vetcred/`](vetcred/). This repository was empty when the prototype was added.

## Open the prototype

- **Run locally:** follow the [quick start](vetcred/README.md#quick-start).
- **Replit:** import this GitHub repository, select a Node.js environment, and press Run. The root `.replit` configuration opens the Vite app on port 5173. If automatic setup is unavailable, use the two commands in the quick start from a Replit Shell and run the dev server with `--host 0.0.0.0`. Replit hosting has not been provisioned by this repository.
- **GitHub Pages:** a build/test/deploy workflow is included. A repository owner must enable **Settings → Pages → Build and deployment → GitHub Actions** before deployment succeeds. Once deployed, the expected address is `https://jlu27-nd.github.io/gen-ai/`. Treat this address as unverified until a successful Pages deployment.

## First working slice

1. Load a synthetic JST or CCAF example, upload a text-based PDF/TXT, or paste supported transcript text.
2. Review and correct extracted learning records, confirm each against the source, and choose a degree program.
3. Compare with synthetic syllabi and approved fictional pathways. Inspect rationale, cited evidence, gaps, and a confidence heuristic.
4. Demonstrate Faculty → Academic director → Registrar review. Ask for evidence or reject when appropriate.
5. Export an advisory JSON packet, CSV summary, or print to PDF. Unresolved reviews remain visible in drafts.

## AI role and transparency

**Currently functional:** local PDF/text extraction, editable learning records, deterministic matching, evidence citations, program applicability, review gating, review history, and export. Forty synthetic courses and four degree programs are included.

**Currently simulated:** the AI judgment is a transparent rules engine, not a live model. Exact synthetic pathways produce a 95/100 evidence heuristic when all eligibility checks pass. Otherwise exact topic-word overlap suggests a course for faculty investigation, with no credit proposal. Confidence is not a calibrated probability. Institutional approvals, policy and reviewer roles are fictional; switching a role does not authenticate a person.

**Future AI:** extract varied JST/CCAF layouts, retrieve institution-approved syllabi and authorized ACE evidence, compare learning outcomes, and draft cited explanations with calibrated uncertainty and an abstention option. Human institutional decisions remain mandatory. Real integrations would require evaluation, privacy controls and authenticated reviewers before use.

## Three quick test results

Executed on October 13, 2026 in a headless Edge browser against the working application; also covered by automated logic tests.

| Test | Input or action | What happened | Result |
| --- | --- | --- | --- |
| Typical | Load JST example; verify both records; compare with BS Computer Science; advance first item through all three roles; export JSON | Two candidates, six proposed semester credits, linked syllabus/pathway evidence, three recorded review decisions and an exported advisory packet. No credit award. | Pass |
| Challenge | Load ambiguous example, verify records, analyze; attempt to advance then request evidence | Zero proposed credits. Topic-only and incomplete-training gaps shown; advancement blocked; request for evidence recorded. | Pass |
| Invalid or empty | Clear session and extract; then choose an unsupported DOCX file | Actionable empty-input and unsupported-file errors; no stale recommendations or crash. | Pass |

Additional checks passed: CCAF example, synthetic PDF upload/extraction, duplicate prevention, role ordering, date/credit/level checks, CSV formula escaping, session clearing, and a 390px mobile viewport. See [`vetcred/tests/`](vetcred/tests/) for reproducible tests.

## Known limitations

1. **Extraction supports limited layouts.** Labeled course blocks and a simple CCAF table work; arbitrary official layouts may omit records or need manual restructuring. Scanned or password-protected PDFs are unsupported; a reviewer must verify every extracted field.
2. **Academic equivalence is simulated.** The catalog, syllabi and pathways are synthetic and incomplete; confidence is uncalibrated. There is no live AI/ACE integration or comprehensive residency, prerequisite, existing-credit or graduation audit.
3. **Review is a single-session demonstration.** Roles are unauthenticated, there is no backend or saved case management, and refresh clears work. Export before leaving; institutional credit posting is deliberately outside the prototype.

## Privacy and source integrity

Only invented course records are committed. No personal transcripts, passwords, API keys or access tokens are required. Documents are processed in browser memory and are not sent to an application server. Clear session removes the displayed records, reviews and input; previously downloaded exports remain on your device. Do not commit real transcripts or private exports to this public repository.

The [source register](vetcred/data/catalog.js) cites public university catalogs consulted for structure. [Iowa State's computer science catalog](https://catalog.iastate.edu/collegeofliberalartsandsciences/computerscience/index.html) informed the semester-credit framework; [Oregon State's business catalog](https://catalog.oregonstate.edu/college-departments/business/business-administration-ba-bs-hba-hbs/) informed business-core organization. Oregon State uses quarter credits, which were not copied as semester values. All course prose, syllabi, policies and equivalencies are newly invented and labeled synthetic.

For Canvas: submit this [public repository](https://github.com/jlu27-nd/gen-ai), your verified Replit or deployed prototype URL, and point reviewers to **Three quick test results** and **Known limitations** above.
