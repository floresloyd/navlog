import { useEffect, useMemo, useRef, useState } from 'react';
import { AirportInfo } from './components/AirportInfo';
import { ClearPlanDialog } from './components/ClearPlanDialog';
import { CompassCard } from './components/CompassCard';
import { Field } from './components/Field';
import { WelcomeDialog } from './components/WelcomeDialog';
import { NavTable, type NumericLegKey, type TextLegKey } from './components/NavTable';
import { createBlankLeg, createBlankPlan, createDemoPlan, isBlankPlan } from './data/planTemplates';
import { calculatePlan } from './domain/formulas/plan';
import { duration, oneDecimal, utc } from './domain/format';
import type { Mode, NumericInput, Plan, Setup } from './domain/types';
import { logEvent } from './services/logger';
import { loadPlan, savePlan } from './services/storage';
const numericLegFields = new Set<NumericLegKey>(['trueCourse','altitudeFt','windFromDeg','windKt','temperatureC','tasKt','gph','distanceNm']);
const numericSetupFields = new Set<keyof Setup>(['fuelGal','variationDeg']);
const numberInput = (value: string): NumericInput => value.trim() === '' ? '' : Number(value);
type Tab = 'plan' | 'airport' | 'compass';
const tabs: { id: Tab; label: string }[] = [{ id: 'plan', label: 'Nav log' }, { id: 'airport', label: 'Airport info' }, { id: 'compass', label: 'Compass card' }];
export default function App() {
  const [plan, setPlan] = useState<Plan>(loadPlan);
  const [tab, setTab] = useState<Tab>('plan');
  const [saveStatus, setSaveStatus] = useState('Saved locally');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('navlog.welcome.v1') !== 'accepted');
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const showDemo = isBlankPlan(plan);
  const result = useMemo(() => calculatePlan(plan), [plan]);
  const route = plan.routes[plan.mode];
  const visibleResults = showDemo ? route.map(() => ({})) : result.legs;
  useEffect(() => { setSaveStatus(savePlan(plan) ? 'Saved locally' : 'Save unavailable'); }, [plan]);
  useEffect(() => { if (!showDemo && result.errors.length) logEvent('calculation.invalid', { count: result.errors.length, first: result.errors[0] }); }, [result, showDemo]);
  function editSetup(key: keyof Setup, value: string) {
    setPlan(current => ({ ...current, setup: { ...current.setup, [key]: numericSetupFields.has(key) ? numberInput(value) : value } }));
    logEvent('plan.edited', { area: 'setup', field: key });
  }
  function editLeg(index: number, field: NumericLegKey | TextLegKey, value: string) {
    setPlan(current => ({ ...current, routes: { ...current.routes, [current.mode]: current.routes[current.mode].map((leg, i) => i === index ? { ...leg, [field]: numericLegFields.has(field as NumericLegKey) ? numberInput(value) : value } : leg) } }));
    logEvent('plan.edited', { area: 'leg', index, field });
  }
  function changeMode(mode: Mode) { setPlan(current => ({ ...current, mode })); logEvent('mode.changed', { mode }); }
  function addCheckpoint() { setPlan(current => ({ ...current, routes: { ...current.routes, [current.mode]: [...current.routes[current.mode], createBlankLeg()] } })); logEvent('checkpoint.added', { mode: plan.mode }); }
  function removeCheckpoint(index: number) { setPlan(current => ({ ...current, routes: { ...current.routes, [current.mode]: current.routes[current.mode].filter((_, i) => i !== index) } })); logEvent('checkpoint.removed', { mode: plan.mode, index }); }
  function editCompass(index: number, value: string) { setPlan(current => ({ ...current, compassDeviations: current.compassDeviations.map((item, i) => i === index ? numberInput(value) : item) })); logEvent('compass.edited', { index }); }
  function editWeather(value: string) { setPlan(current => ({ ...current, manualWeather: value })); logEvent('weather.edited'); }
  function printPlan() { logEvent('print.requested', { mode: plan.mode }); window.print(); }
  function openBriefing() { logEvent('briefing.opened'); window.open('https://www.1800wxbrief.com/', '_blank', 'noopener,noreferrer'); }
  function acceptWelcome() { localStorage.setItem('navlog.welcome.v1', 'accepted'); setShowWelcome(false); logEvent('welcome.accepted'); }
  function requestClear() { setShowClearDialog(true); logEvent('plan.clear_requested'); }
  function cancelClear() { setShowClearDialog(false); clearButtonRef.current?.focus(); logEvent('plan.clear_canceled'); }
  function confirmClear() { setPlan(createBlankPlan()); setTab('plan'); setShowClearDialog(false); clearButtonRef.current?.focus(); logEvent('plan.cleared'); }
  function loadDemo() { setPlan(createDemoPlan()); setTab('plan'); logEvent('plan.demo_loaded'); }
  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-dot"/>NavLog</div><nav aria-label="Main navigation">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); logEvent('tab.changed', { tab: item.id }); }}>{item.label}</button>)}</nav><div className="top-actions"><div className="mode-toggle" aria-label="Flight rules">{(['IFR','VFR'] as Mode[]).map(mode => <button key={mode} className={plan.mode === mode ? 'selected' : ''} aria-pressed={plan.mode === mode} onClick={() => changeMode(mode)}>{mode}</button>)}</div><span className="save-status">{saveStatus}</span><button ref={clearButtonRef} className="clear-demo" onClick={showDemo ? loadDemo : requestClear}>{showDemo ? 'Demo' : 'Clear'}</button><button className="export" onClick={printPlan}>Export PDF / Print</button></div></header>
  <main>{tab === 'plan' && <><div className="intro"><div><p className="eyebrow">FLIGHT PLANNING WORKSPACE</p><h1>Plan your route</h1><p>Build each leg, then review headings, time and cruise fuel as values change.</p></div><span className="route-chip">{route[0]?.fix || 'Departure'} <span>→</span> {route.at(-1)?.fix || 'Destination'}</span></div><div className="legend"><span><i className="mint"/>You enter</span><span><i className="white"/>Calculated</span><span><i className="amber-dot"/>Check value</span></div>
  <section className="setup-grid" aria-label="Flight setup"><Field label="Aircraft N-number" value={plan.setup.aircraft} onChange={value => editSetup('aircraft',value)} /><Field label="Departure date (UTC)" type="date" value={plan.setup.date} onChange={value => editSetup('date',value)} /><Field label="Time off (UTC)" type="time" value={plan.setup.time} onChange={value => editSetup('time',value)} /><Field label="Fuel on board (gal)" numeric value={plan.setup.fuelGal} onChange={value => editSetup('fuelGal',value)} /><Field label="Variation (° E+ / W−)" numeric value={plan.setup.variationDeg} onChange={value => editSetup('variationDeg',value)} /><Field label="Alternate ICAO" value={plan.setup.alternate} onChange={value => editSetup('alternate',value)} /></section>
  <section className="summary-grid" aria-label="Flight totals"><div><small>Total distance</small><strong>{oneDecimal(result.complete ? result.distanceNm : undefined)} <em>nm</em></strong></div><div><small>Time en route</small><strong>{duration(result.eteMin)} <em>h:mm</em></strong></div><div><small>Arrival UTC</small><strong>{result.etaMin === undefined ? '—' : utc(result.etaMin).slice(11)} <em>Z</em></strong></div><div><small>Fuel left · cruise only</small><strong className={result.fuelLeft !== undefined && result.fuelLeft < 0 ? 'danger-text' : ''}>{oneDecimal(result.fuelLeft)} <em>gal</em></strong></div></section>
  {!showDemo && result.errors.length > 0 && <div className="issues" role="status"><b>Check the plan</b><ul>{result.errors.map((error,index) => <li key={index}>{error}</li>)}</ul></div>}
  <NavTable route={route} results={visibleResults} mode={plan.mode} onEdit={editLeg} onRemove={removeCheckpoint} />
  {plan.mode === 'VFR' && <div className="rule-note"><b>VFR altitude check</b>{result.legs.some(leg => leg.altitudeWarning) ? ' Amber cells do not match the prototype hemispheric altitude rule.' : ' Above 3,000 ft: odd thousands + 500 eastbound, even thousands + 500 westbound.'}</div>}
  <div className="below-table"><button className="outline" onClick={addCheckpoint}>+ Add checkpoint</button><span>Enter leg distances from your chart.</span></div>
  <p className="disclaimer">Planning aid only. Cruise fuel excludes taxi, climb, descent and reserves. Verify against the aircraft POH, current charts and NOTAMs, and an official preflight briefing.</p></>}
  {tab === 'airport' && <AirportInfo plan={plan} onWeather={editWeather} onBriefing={openBriefing} />}{tab === 'compass' && <CompassCard deviations={plan.compassDeviations} onEdit={editCompass} />}</main>{showWelcome && <WelcomeDialog onAccept={acceptWelcome} />}{showClearDialog && <ClearPlanDialog onCancel={cancelClear} onConfirm={confirmClear} />}</div>;
}
