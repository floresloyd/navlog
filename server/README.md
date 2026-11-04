# Weather server

`server/weather.mjs` serves the built React app and proxies METAR and TAF requests to AviationWeather.gov. Run `npm run build` and `npm run serve` for the production app, or run `npm run dev` for local development; it starts both processes and Vite forwards `/api` requests to the weather server. The server defaults to port 4174. `PORT` can change the port when running `npm run serve`; `npm run dev` expects the weather server on 4174. The server needs outbound HTTPS access to `aviationweather.gov`.

The browser calls `GET /api/weather?ids=KOPF` with a four-character airport code. The response includes `metar` and `taf` objects with `raw` text and a report `time`, or `null` when a report is unavailable. `fetchedAt` is the server retrieval time, not the observation or forecast issue time. An upstream failure is reported in `error` while any successful report remains available. Results without failures are cached in memory for five minutes. `GET /api/health` returns the server's health status. Airport records are a separate dated FAA NASR bundle in `src/data/faaAirports.json`.

For deployment, run this Node server to serve both the built app and `/api/weather`, or route `/api/weather` and `/api/health` to it from a separate static host. A static file host alone cannot provide live weather. Check `/api/health` and the weather endpoint directly if the UI reports HTTP 500 or 502; the weather response can contain a partial `error` even when the HTTP request succeeds.

Authenticated plan storage, route geometry, and PDF generation are not implemented.
