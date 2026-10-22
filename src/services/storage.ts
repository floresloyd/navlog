import type { Plan } from '../domain/types';
import { samplePlan } from '../data/samplePlan';
import { signedAngle } from '../domain/formulas/angles';
import { CARD_HEADINGS } from '../domain/formulas/compass';
import { logEvent } from './logger';
export const STORAGE_KEY = 'navlog.plan.v1';
export function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const value = JSON.parse(raw) as Plan;
      if (value.version === 1 && Array.isArray(value.routes?.IFR) && Array.isArray(value.routes?.VFR) && (Array.isArray(value.compassDeviations) || Array.isArray((value as Plan & { compassSteer?: unknown[] }).compassSteer))) {
        const legacy = value as Plan & { compassSteer?: (number | '')[] };
        if (!Array.isArray(value.compassDeviations) && Array.isArray(legacy.compassSteer)) value.compassDeviations = legacy.compassSteer!.map((heading, index) => heading === '' ? '' : signedAngle(Number(heading) - CARD_HEADINGS[index]));
        delete legacy.compassSteer;
        for (const leg of [...value.routes.IFR, ...value.routes.VFR]) { delete (leg as typeof leg & { latitude?: number | ''; longitude?: number | '' }).latitude; delete (leg as typeof leg & { longitude?: number | '' }).longitude; }
        logEvent('plan.loaded', { source: 'local' }); return value;
      }
    }
  } catch { /* Fall back to the sample route. */ }
  logEvent('plan.loaded', { source: 'sample' });
  return structuredClone(samplePlan);
}
export function savePlan(plan: Plan): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); logEvent('plan.saved', { mode: plan.mode }); return true; }
  catch { logEvent('plan.save_failed'); return false; }
}
