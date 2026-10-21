import type { Plan } from '../domain/types';
import { samplePlan } from '../data/samplePlan';
import { logEvent } from './logger';
export const STORAGE_KEY = 'navlog.plan.v1';
export function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const value = JSON.parse(raw) as Plan;
      if (value.version === 1 && Array.isArray(value.routes?.IFR) && Array.isArray(value.routes?.VFR) && Array.isArray(value.compassSteer)) {
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
