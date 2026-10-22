import type { Leg, Plan } from '../domain/types';
import { samplePlan } from './samplePlan';

export function createBlankLeg(): Leg {
  return {
    id: crypto.randomUUID(), fix: '', vorIdent: '', vorFrequency: '', route: '',
    trueCourse: '', altitudeFt: '', windFromDeg: '', windKt: '',
    temperatureC: '', tasKt: '', gph: '', distanceNm: '',
  };
}

export function createBlankPlan(): Plan {
  return {
    version: 1,
    mode: 'IFR',
    setup: { aircraft: '', date: '', time: '', fuelGal: '', variationDeg: '', alternate: '' },
    routes: { IFR: [createBlankLeg(), createBlankLeg()], VFR: [createBlankLeg(), createBlankLeg()] },
    compassDeviations: Array(12).fill(''),
    manualWeather: '',
  };
}

export function createDemoPlan(): Plan {
  return structuredClone(samplePlan);
}

export function isBlankPlan(plan: Plan): boolean {
  const allEmpty = (values: unknown[]) => values.every(value => value === '');
  return allEmpty(Object.values(plan.setup))
    && allEmpty(plan.compassDeviations)
    && plan.manualWeather === ''
    && [...plan.routes.IFR, ...plan.routes.VFR].every(leg =>
      allEmpty(Object.entries(leg).filter(([key]) => key !== 'id').map(([, value]) => value)));
}
