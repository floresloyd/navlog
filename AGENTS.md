# NavLog agent instructions

- Treat `README.md` as the project entry point. Keep it updated whenever features, setup commands, libraries, project structure, or limitations change. Update `docs/FORMULAS.md` when calculation behavior or assumptions change, and `docs/TESTS.md` when coverage or logging changes.
- Keep formula functions pure and grouped in `src/domain/formulas/`. Do not bury aviation math in JSX. Preserve full precision during calculation and round only for display.
- Add meaningful tests for new formulas and user features. Use structured events in `src/services/logger.ts` for user actions and failures; avoid logging full plans or weather notes.
- The bundled airport and weather data are historical prototype samples. Never present them as live or current. Do not add a live data claim without a verified source, source time, error handling, and tests.
- Keep `src/services/` as the boundary for storage and external data. A future backend belongs outside `src/` and should have explicit API contracts.
- Before finishing a change, run `npm test`, `npm run lint`, and `npm run build`. For layout or print changes, inspect them in a browser and in a saved PDF.
