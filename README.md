# KAIROS — 0-9-0 Reflection and Journaling PWA

<p><strong>Status: experimental browser-based prototype.</strong> This application is a self-reflection and journaling tool built around the author's 0-9-0 / SAP framework. It is not a diagnostic, treatment, clinical decision-support, or validated psychological assessment product.</p>

## Conceptual provenance

The project owner states that the 0-9-0 / SAP concepts, stage framework, and KAIROS product idea originated with him. AI systems generated the implementation code and suggested supporting technical mechanisms. NSDT and the Container Rule were introduced by AI as implementation mechanisms within the owner's framework; they are not independent conceptual foundations. This records the owner's account and is not a legal determination of rights or inventorship.

## What the current application does

- Provides a 15-question self-reflection check-in using user-entered answers.
- Maps the check-in to a project-defined five-dimensional vector and applies fixed stage-centroid and threshold rules.
- Displays one of ten SAP stages and related framework interpretations, prompts, and journal content.
- Includes static reflection prompts and a local journal.
- Plays simple audio tones at selected frequencies.
- Uses a service worker to cache the static application shell for offline use where the browser supports it.

## Canonical SAP stages

| Stage | Canonical name |
|---:|---|
| 0 | PLENARA |
| 1 | SPARK OF NAVIGATION |
| 2 | FORGE OF POLARITY |
| 3 | ENGINE OF EXPRESSION |
| 4 | CRUCIBLE OF EQUILIBRIUM |
| 5 | DYNAMO OF WILL |
| 6 | NEXUS OF HARMONY |
| 7 | LENS OF DISTILLATION |
| 8 | VESSEL OF GROUNDING |
| 9 | TRANSPARENCY OF THE GUIDE |

The friendly stage labels in the application are presentation descriptions. The canonical names above identify the underlying framework stages.

## Current NSDT implementation and axis mapping

The questionnaire returns values in this order: **Complexity, Stability, Adaptability, Tension, Coherence**. The engine expects: **N, S, T, D, C** — represented in this code as Novelty/Complexity, Stability, Tension, Dynamism/Adaptability, Coherence. The application now explicitly reorders the questionnaire vector before passing it to the engine: `[Complexity, Stability, Tension, Adaptability, Coherence]`.

These axis definitions and scoring rules are project-defined implementation conventions. They are not validated physiological, psychological, cognitive, or risk measurements. The questionnaire has not undergone psychometric validation.

## Technical structure

| File | Actual role |
|---|---|
| `index.html` | Browser UI and prototype limitations notice |
| `js/app.js` | View rendering, event handling, and check-in-to-engine adapter |
| `js/diagnostic.js` | Self-report questions and project-defined scoring |
| `js/engine.js` | Fixed stage centroids, weighted-distance classification, and rule thresholds |
| `js/state.js` | Browser state and localStorage persistence |
| `js/content.js` | Static reflection prompts and framework content |
| `js/ai-sentinel.js` | Keyword heuristic for selected certainty language; not an AI or fact-checker |
| `js/simulation.js` | Synthetic random-vector scenario exploration; not empirical validation |
| `js/audio.js` | Local tone generation and playback |
| `sw.js` | Static asset caching for the PWA shell |

## Limitations and data handling

- The check-in is not a validated psychometric instrument and does not diagnose any condition.
- Stage classifications, multipliers, thresholds, and interpretations are internal framework rules, not measured states or proven predictors.
- The Monte Carlo module uses random vectors and model-generated outcomes. Any correlation it reports is internal to the same rules and is not evidence of real-world predictive accuracy.
- The AI Sentinel uses keyword matching. It cannot detect hallucinations, verify facts, or assess safety.
- Audio frequencies are tones for listening preference. The application does not establish DNA repair, cellular regeneration, nervous-system effects, or other medical or psychological benefits.
- Journal entries and check-in content are stored in browser localStorage. The application does not encrypt this content, provide user accounts, or offer a secure cloud backend. Anyone with access to the browser profile may be able to access it.
- No external AI service or remote inference call is enabled in this repository.
- Framework prompts and stage interpretations are not instructions for medical, mental-health, legal, or emergency decisions.

## Running locally

No runtime dependency installation is required for the current static PWA. Serve the repository over localhost with any simple static HTTP server, then open `index.html`. Service-worker installation generally requires localhost or HTTPS.

## Regression tests

The repository includes a minimal Node test runner configuration (no third-party test dependencies):

```bash
npm test
```

Tests cover the questionnaire-to-engine axis mapping, basic stage output, heuristic-only AI Sentinel behavior, and the synthetic-only Monte Carlo notice. They do not validate the framework or its predictions.

## Verification status

The repository contains no independent clinical, psychometric, physiological, or predictive validation. The synthetic simulation is not a pilot study. Passing browser checks or seeing expected stage outputs demonstrates software behavior only, not the validity of the framework's measurements or interpretations.

## Commercial assessment

The most defensible near-term positioning is a private, local-first reflection and journaling prototype. Before public or commercial release, review localStorage privacy, accessibility, source and prompt provenance, browser compatibility, audio claims, and the reliability of the scoring implementation. Do not market it as a cognitive diagnostic, therapeutic intervention, or clinically validated system.

## License and rights status

This repository has no standard open-source license. [PROPRIETARY_USE_NOTICE.md](PROPRIETARY_USE_NOTICE.md) records the project owner's attribution and current use position; it is not a standard license or a legal determination. No patent application has been filed. The legal status of AI-generated code and third-party materials requires review before commercial licensing or transfer.