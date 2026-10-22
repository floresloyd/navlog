import type { Leg, Plan } from '../domain/types';
const start = (fix: string): Leg => ({ id: crypto.randomUUID(), fix, vorIdent: '', vorFrequency: '', route: '', trueCourse: '', altitudeFt: '', windFromDeg: '', windKt: '', temperatureC: '', tasKt: '', gph: '', distanceNm: '' });
const arrive = (fix: string, tc: number, alt: number, wd: number, ws: number, temp: number, tas: number, gph: number, dist: number, route = ''): Leg => ({ ...start(fix), route, trueCourse: tc, altitudeFt: alt, windFromDeg: wd, windKt: ws, temperatureC: temp, tasKt: tas, gph, distanceNm: dist });
export const samplePlan: Plan = {
  version: 1, mode: 'IFR', setup: { aircraft: 'N123AB', date: '2026-10-07', time: '14:00', fuelGal: 40, variationDeg: -6, alternate: 'KOPF' },
  routes: {
    IFR: [start('KHWO'), arrive('DHP/TOC',213,5000,200,4,12,82,7,13), arrive('ALNZO(R-348)',352,5000,177,16,11,99,7,43), arrive('FLMGO(R-348)',351,5000,177,16,11,99,7,27), arrive('RALPH',1,5000,177,16,10,99,7,19), arrive('ZAHZA(IAF)',32,5000,177,16,10,99,7,18), arrive('KFPR',98,5000,127,9,12,90,7,11)],
    VFR: [start('KHWO'), arrive('KTNT',257,5000,70,10,12,82,7,36.4,'Direct'), arrive('X01',268,4500,80,12,12,99,7,26.7,'Direct'), arrive('KAPF',311,4500,90,12,12,99,7,27.7,'Direct')]
  },
  compassDeviations: [1,-1,-2,-2,-1,1,2,2,1,-1,-2,-1], manualWeather: ''
};
