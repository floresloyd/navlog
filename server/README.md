# Weather server

`server/weather.mjs` serves the built React app and proxies METAR and TAF requests to AviationWeather.gov. Run `npm run build` and `npm run serve` for the production app, or run `npm run dev` for local development; it starts both processes. The default port is 4174; set `PORT` to change it. The server needs outbound HTTPS access to `aviationweather.gov`.

The browser calls `GET /api/weather?ids=KOPF`. The response includes `metar`, `taf`, and `fetchedAt`. A missing report is `null`; an upstream failure is reported in `error` while any successful report remains available. Results without failures are cached in memory for five minutes. Airport records are a separate dated FAA NASR bundle in `src/data/faaAirports.json`.

For deployment, route `/api/weather` to this Node server. A static file host alone cannot provide live weather. Check the endpoint directly if the UI reports HTTP 500 or 502; its JSON error body identifies upstream failures when they reach this server.

Authenticated plan storage, route geometry, and PDF generation are not implemented.
