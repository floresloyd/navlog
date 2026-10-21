import type { Leg, Plan } from '../domain/types';
const start = (fix: string): Leg => ({ id: crypto.randomUUID(), fix, vorIdent: '', vorFrequency: '', route: '', trueCourse: '', altitudeFt: '', windFromDeg: '', windKt: '', temperatureC: '', tasKt: '', gph: '', distanceNm: '', latitude: '', longitude: '' });
const arrive = (fix: string, tc: number, alt: number, wd: number, ws: number, temp: number, tas: number, gph: number, dist: number, route = ''): Leg => ({ ...start(fix), route, trueCourse: tc, altitudeFt: alt, windFromDeg: wd, windKt: ws, temperatureC: temp, tasKt: tas, gph, distanceNm: dist });
export const samplePlan: Plan = {
  version: 1, mode: 'IFR', setup: { aircraft: 'N123AB', date: '2026-10-07', time: '14:00', fuelGal: 40, variationDeg: -6, alternate: 'KOPF' },
  routes: {
    IFR: [start('KHWO'), arrive('DHP/TOC',213,5000,200,4,12,82,7,13), arrive('ALNZO(R-348)',352,5000,177,16,11,99,7,43), arrive('FLMGO(R-348)',351,5000,177,16,11,99,7,27), arrive('RALPH',1,5000,177,16,10,99,7,19), arrive('ZAHZA(IAF)',32,5000,177,16,10,99,7,18), arrive('KFPR',98,5000,127,9,12,90,7,11)],
    VFR: [start('KHWO'), arrive('KTNT',257,5000,70,10,12,82,7,36.4,'Direct'), arrive('X01',268,4500,80,12,12,99,7,26.7,'Direct'), arrive('KAPF',311,4500,90,12,12,99,7,27.7,'Direct')]
  },
  compassSteer: [1,29,58,88,119,151,182,212,241,269,298,329], manualWeather: ''
};
export const sampleAirports: Record<string, { name: string; elevation: string; variation: string; atis: string; ground: string; tower: string; approach: string; ctaf: string; metar: string }> = {
  KHWO: { name: 'North Perry', elevation: '7 ft', variation: '6° W', atis: '135.475', ground: '120.45', tower: '132.1 / 134.3', approach: '128.6', ctaf: '132.1', metar: 'KHWO 071353Z 09008KT 10SM FEW035 27/21 A3004' },
  KFPR: { name: 'Treasure Coast Intl', elevation: '24 ft', variation: '6° W', atis: '134.825', ground: '119.55', tower: '128.2', approach: '132.8', ctaf: '128.2', metar: 'KFPR 071353Z 12007KT 10SM SCT040 26/20 A3005' },
  KAPF: { name: 'Naples Muni', elevation: '7 ft', variation: '3° W', atis: '134.225', ground: '121.6', tower: '128.5', approach: '119.75', ctaf: '128.5', metar: 'KAPF 071353Z 10006KT 10SM FEW030 28/22 A3003' },
  KOPF: { name: 'Opa-locka Executive', elevation: '7 ft', variation: '6° W', atis: '125.9', ground: '121.9', tower: '134.675', approach: '128.6', ctaf: '120.7', metar: 'KOPF 071353Z 08009KT 6SM BR BKN012 25/22 A3003' }
};
