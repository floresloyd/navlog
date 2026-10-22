# NavLog

NavLog is a React flight planning aid converted from the supplied NavLog prototype. It lets a user edit IFR and VFR route legs, review calculated headings, ground speed, ETA, and cruise fuel, maintain a 12-point compass card, look up dated FAA airport information and AviationWeather.gov METARs and TAFs, and print the current screen to PDF through the browser. The built app uses a small Node server for weather requests.

## Project overview

- **Nav log:** Editable aircraft setup and ordered checkpoints. Each leg belongs to the checkpoint where it ends. Changes recalculate the route immediately. Amber highlights identify missing distance or a VFR altitude warning.
- **IFR and VFR:** Separate locally saved routes share the aircraft setup and compass card. VFR adds a route label and a hemispheric altitude warning.
- **Airport info:** Departure, destination, and alternate panels. Airport name, city, elevation and variation come from the FAA NASR CSV effective October 1, 2026. METARs and TAFs are fetched through the local Node server from AviationWeather.gov, with report times and unavailable states. Manual weather notes can be entered. The official 1800WXBRIEF link opens separately.
- **Compass card:** Twelve manually entered aircraft specific deviations are interpolated by heading. An incomplete card withholds completed plan totals.
- **Saved plans:** A first-use pilot notice appears once per browser. Changes automatically save in this browser's `localStorage` under `navlog.plan.v1`. A different browser or cleared storage does not have the saved plan.
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
  services/         Browser storage, weather client, and structured event logging
server/             Weather proxy and production static server
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

There is no routing, state management, chart, or PDF library. State is held in React and stored locally. Formula code has no React dependency. The weather server uses Node built-ins and needs outbound HTTPS access.

## Run the project

Use Node.js 24 LTS and npm. The test environment requires Node 24 or newer; Debian distributions may ship an older `node` binary. Check `node -v` before installing dependencies.

```bash
nvm use        # if nvm is installed; uses .nvmrc
npm ci         # install the exact lockfile versions
npm run dev     # starts both Vite and the weather API
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Other commands:

```bash
npm test          # full verbose test run
npm run test:watch
npm run lint
npm run build     # TypeScript check and production bundle
npm run serve     # serve production bundle and weather API after build
```

## Formula and test guides

- [Formulas and assumptions](docs/FORMULAS.md)
- [Tests and logging](docs/TESTS.md)

## Future backend integration

The `src/services/` layer contains browser storage and the weather client. `server/weather.mjs` proxies AviationWeather.gov because its API does not permit browser cross-origin requests. FAA NASR airport records are bundled with their October 1, 2026 effective date. To refresh, run `python3 scripts/update-faa-airports.py <APT_CSV_ZIP_URL>` with the current cycle’s APT CSV link from the FAA NASR subscription page, review the effective date, then rebuild. Keep formulas in `src/domain/formulas/`; the same typed inputs and outputs can be reused or cross-checked by a server. The [server plan](server/README.md) describes the intended boundary. There are no user accounts or remote plan storage. The weather server has a five minute in-memory cache.

## Current limits

The supplied developer brief also describes a larger product, including verified fix lookup, performance lookup, and hosted delivery. Those remain future features. Live METAR and TAF lookup requires the Node server. Waypoint coordinates are removed. Distances and variation are entered manually. Airport frequencies are not displayed because this dataset import does not include verified communications fields. FAA airport records are a dated snapshot, and weather reports must be judged by their displayed timestamps. The app has not been validated against the reference workbook or independent E6B benchmark yet.
