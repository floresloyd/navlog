# Tests and feature logging

## Run

```bash
npm test
npm run test:watch
npm run lint
npm run build
```

`npm test` runs Vitest once with a verbose reporter. A passing run prints each feature or formula case. Tests use jsdom, Testing Library, and a fresh in-memory `localStorage` adapter. They do not require a running backend, network, account, or browser print dialog. For a live development smoke check, run `npm run dev` and request `/api/weather?ids=KOPF` through the Vite URL; the command starts both Vite and the weather API.

## Coverage map

| Feature | Automated checks |
| --- | --- |
| Angle and variation | Wraparound and east/west sign |
| Wind | Calm, crosswind, impossible crosswind, and nonpositive GS |
| Compass card | Deviation and interpolation across 330° to 000° |
| Time and fuel | Leg ETE, cruise fuel, low fuel, UTC next-day arrival |
| VFR | Hemispheric altitude warning and invalid wind |
| Route calculation | Sample route, edit recalculation, incomplete leg withholding totals |
| Setup and persistence | Edit, local save, reload, validation message |
| Clear and Demo | Cancel or confirm the modal, clear all saved inputs, retain blank state after reload, restore the sample |
| IFR/VFR and checkpoints | Switch, add, and remove |
| Supporting screens | Compass edit, FAA airport record, manual weather, briefing link |
| Navigation and print | The three active tabs are shown, the Phone view tab is absent, and browser printing is requested |

The sample-route assertion is a regression check against the supplied prototype data, not a formal validation of the source workbook or E6B. Before aviation use, add independent benchmark values from the workbook and a vetted flight computer, including tolerances and source references.

## Structured feature events

`src/services/logger.ts` emits browser `console.info` records with a `[NavLog]` prefix and JSON containing `event`, UTC `at`, and a small detail object. Events cover load/save/failure, plan edits, clear request/cancel/confirm, demo restore, mode/tab changes, checkpoint changes, compass and weather edits, print requests, briefing link opens, and invalid calculations. Tests assert events for the main flows. Inputs such as the user's full plan or pasted weather text are not written to event detail.

Example:

```text
[NavLog] {"event":"mode.changed","at":"2026-10-21T12:00:00.000Z","mode":"VFR"}
```

The timestamp above is illustrative. Logging is local to the browser console; there is no telemetry service. When adding a feature, add an event if it represents a user action or failure, and add a behavior assertion to the relevant test rather than testing log text alone.

## Manual checks before a release

1. Run `npm test`, `npm run lint`, and `npm run build`.
2. Edit the route in a desktop browser and narrow viewport; inspect horizontal table scrolling.
3. Use “Export PDF / Print,” choose Save as PDF, and inspect the printed page for clipping.
4. Check current aviation data independently before using any plan. FAA airports are a dated October 1, 2026 snapshot; check each weather report time and verify current information independently.

The first-use notice is covered in the feature tests. The weather client tests cover a timed KOPF report, server error details, and an unhandled HTTP 500. A local server smoke request checks the live upstream connection. The weather proxy reports missing data and upstream errors separately.
