# Future backend boundary

No backend is required or running in this version. Keep any future service separate from the React application. The browser-facing adapters belong in `src/services/`; formulas and types in `src/domain/` remain pure.

A backend can later add authenticated plans, verified fix and airport data, route geometry, AviationWeather.gov requests with caching and source timestamps, and a PDF generation service. Define and test API contracts before changing the frontend adapters. Do not label sample data as live. Direct 1800WXBRIEF integration needs confirmed provider access; the current app only links to its site.
