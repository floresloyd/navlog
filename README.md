# NavLog

NavLog is a React flight planning aid converted from the supplied NavLog prototype. It lets a user edit IFR and VFR route legs, review calculated headings, ground speed, ETA, and cruise fuel, maintain a 12-point compass card, view airport sample information, and print the current screen to PDF through the browser. This is a frontend application; there is no backend or live aviation data connection.

## Project overview

- **Nav log:** Editable aircraft setup and ordered checkpoints. Each leg belongs to the checkpoint where it ends. Changes recalculate the route immediately. Amber highlights identify missing distance or a VFR altitude warning.
- **IFR and VFR:** Separate locally saved routes share the aircraft setup and compass card. VFR adds a route label and a hemispheric altitude warning.
- **Airport info:** Departure, destination, and alternate panels. The bundled airport and METAR values are fixed prototype samples dated October 7, 2026. Manual weather notes can be entered. The official 1800WXBRIEF link opens separately.
- **Compass card:** Twelve steer headings create heading-dependent compass deviation. An incomplete card withholds completed plan totals.
- **Saved plans:** Changes automatically save in this browser's `localStorage` under `navlog.plan.v1`. A different browser or cleared storage does not have the saved plan.
- **Clear and Demo:** Clear asks for confirmation, then empties the setup, both routes, compass card, and weather notes in local storage. The same button becomes Demo while the plan is blank; Demo restores the bundled sample route. Clearing cannot recover previous edits.
- **PDF export:** “Export PDF / Print” opens the browser print dialog. Choose “Save as PDF” there. This is a print workflow, not a generated PDF service.

NavLog is a planning aid. Cruise fuel excludes taxi, climb, descent, and reserves. Confirm all values using the aircraft POH, current charts and NOTAMs, and an official preflight briefing.

## Project structure

```text
src/
  components/       React screens and input components
  data/             Clearly labeled prototype sample plan and airport records
                    Blank and demo plan templates
  domain/
    formulas/       Pure, replaceable calculation functions and route orchestration
    format.ts       Display rounding and UTC formatting
    types.ts        Shared plan and result contracts
  services/         Browser storage and structured event logging
  test/             Test environment setup
  App.tsx           Application state and feature actions
  styles.css        Responsive and print styles
  *.test.tsx        React feature tests
docs/
  FORMULAS.md       Client-readable formulas and assumptions
  TESTS.md          Test coverage, commands, and logging
server/
  README.md         Future backend boundary and API plan
```

## Tech stack and libraries

| Purpose | Library |
| --- | --- |
| UI | React 19, React DOM 19, TypeScript |
| Development and production build | Vite 7, `@vitejs/plugin-react` |
| Unit and feature tests | Vitest 3, Testing Library, user-event, jest-dom, jsdom |
| Static checks | TypeScript and ESLint with TypeScript and React Hooks rules |

There is no routing, state management, chart, PDF, weather API, or backend library. State is held in React and stored locally. Formula code has no React dependency.

## Run the project

Use Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Other commands:

```bash
npm test          # full verbose test run
npm run test:watch
npm run lint
npm run build     # TypeScript check and production bundle
npm run preview   # preview the production bundle
```

## Formula and test guides

- [Formulas and assumptions](docs/FORMULAS.md)
- [Tests and logging](docs/TESTS.md)

## Future backend integration

The `src/services/` layer is where remote plan storage, verified airport data, and weather services can replace browser-only adapters. Keep formulas in `src/domain/formulas/`; the same typed inputs and outputs can be reused or cross-checked by a server. The [server plan](server/README.md) describes the intended boundary. No API, user accounts, cache, or server process is included yet.

## Current limits

The supplied developer brief also describes a larger product, including verified fix lookup, live weather, performance lookup, and hosted delivery. Those are separate future features, not implemented data sources in this frontend conversion. Coordinates are accepted and saved but do not calculate route distances. Distances and variation are entered manually. Sample airport frequencies and METARs must not be treated as current data. The app has not been validated against the reference workbook or independent E6B benchmark yet.
