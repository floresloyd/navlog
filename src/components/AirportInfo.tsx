import { useEffect, useState } from 'react';
import faaAirports from '../data/faaAirports.json';
import type { Plan } from '../domain/types';
import { fetchWeather, type WeatherResult } from '../services/aviation';
import { logEvent } from '../services/logger';
interface Props { plan: Plan; onWeather: (value: string) => void; onBriefing: () => void; }
const faa = faaAirports as Record<string, { name: string; city: string; elevationFt: string; variation: string; effectiveDate: string }>;
function Report({ label, report }: { label: string; report: { raw: string; time: string | null } | null }) { return <div className="weather-report"><b>{label}</b><span>{report?.raw || 'No report available'}</span><small>{report?.time ? `Report time ${new Date(report.time).toLocaleString('en-US', { timeZone:'UTC', hour12:false })} UTC` : 'Report time unavailable'}</small></div>; }
function AirportPanel({ code }: { code: string }) {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!/^[A-Z0-9]{4}$/.test(code)) return;
    const controller = new AbortController();
    setLoading(true);
    setWeather(null);
    setError('');
    fetchWeather(code, controller.signal).then(value => { setWeather(value); setError(''); if (value.error) logEvent('weather.lookup_failed', { code }); }).catch(cause => { if (controller.signal.aborted) return; setError(cause instanceof Error ? cause.message : 'Weather unavailable'); logEvent('weather.lookup_failed', { code }); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [code, attempt]);
  const airport = faa[code];
  return <article className="airport-card"><h2>{code || '—'}</h2>{airport ? <><strong>{airport.name}</strong><p>{airport.city} · Elevation {airport.elevationFt} ft · Variation {airport.variation || 'unavailable'}</p><small>FAA NASR · effective {airport.effectiveDate} · <a href="https://www.faa.gov/air_traffic/flight_info/aeronav/Aero_Data/NASR_Subscription/" target="_blank" rel="noreferrer">source</a></small></> : <p>Airport not found in the FAA dataset. Check the four character ICAO code.</p>}
    {loading && <p>Loading weather…</p>}{error && <div role="alert"><p>Weather lookup failed: {error}</p><button className="outline" onClick={() => setAttempt(value => value + 1)}>Retry weather</button></div>}{weather?.error && <p role="alert">Partial weather lookup: {weather.error}</p>}{weather && <><Report label="METAR" report={weather.metar}/><Report label="TAF" report={weather.taf}/><small>Retrieved {new Date(weather.fetchedAt).toLocaleString('en-US', { timeZone:'UTC', hour12:false })} UTC · <a href="https://aviationweather.gov/data/api/" target="_blank" rel="noreferrer">AviationWeather.gov</a></small></>}</article>;
}
export function AirportInfo({ plan, onWeather, onBriefing }: Props) {
  const route = plan.routes[plan.mode];
  const codes = [route[0]?.fix, route.at(-1)?.fix, plan.setup.alternate].map(code => (code || '').trim().toUpperCase());
  return <section className="page-panel"><h1>Airport info and weather</h1><p>Departure and destination follow the active route. FAA airport details have a published effective date. METARs and TAFs show their report time when available.</p><div className="airport-layout"><div className="airport-cards">{codes.map((code,index) => <div key={`${index}-${code}`}><h2>{['Departure','Destination','Alternate'][index]}</h2><AirportPanel code={code}/></div>)}</div><aside className="side-stack"><div className="card"><h2>Official briefing</h2><p>Open 1800WXBRIEF for a current preflight briefing.</p><button className="primary" onClick={onBriefing}>Open 1800WXBRIEF ↗</button></div><div className="card"><h2>Manual weather notes</h2><p>Record your verified weather and source here. Notes stay in this browser.</p><textarea aria-label="Manual weather notes" rows={8} value={plan.manualWeather} onChange={event => onWeather(event.target.value)} placeholder="Paste current report and observation time…" /></div></aside></div></section>;
}
