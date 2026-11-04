import { describe, expect, it } from 'vitest';
import { samplePlan } from '../../data/samplePlan';
import { magneticCourse, normalizeHeading } from './angles';
import { cardDeviations, nearestDeviation } from './compass';
import { cruiseFuelGallons, legMinutes, utcMinutes, vfrAltitudeValid } from './flight';
import { calculatePlan } from './plan';
import { solveWind } from './wind';
const fresh = () => structuredClone(samplePlan);
describe('navigation formulas', () => {
  it('normalizes headings and applies east positive variation', () => { expect(normalizeHeading(-1)).toBe(359); expect(magneticCourse(90, -6)).toBe(96); expect(magneticCourse(90, 6)).toBe(84); });
  it('solves calm wind and a crosswind independently', () => { expect(solveWind(90, 100, 0, 0)).toEqual({ wca: 0, groundSpeed: 100 }); const crosswind = solveWind(0, 100, 90, 20)!; expect(crosswind.wca).toBeCloseTo(11.537, 2); expect(crosswind.groundSpeed).toBeCloseTo(97.98, 2); });
  it('rejects impossible or nonpositive ground speed', () => { expect(solveWind(0, 80, 90, 90)).toBeNull(); expect(solveWind(0, 80, 0, 100)).toBeNull(); expect(solveWind(0, 0, 0, 0)).toBeNull(); });
  it('uses the closest entered card heading across north and accepts a partial card', () => { const values: (number | '')[] = Array(12).fill(''); values[0] = 3; values[6] = -2; const card = cardDeviations(values)!; expect(nearestDeviation(345, card)).toBe(3); expect(nearestDeviation(175, card)).toBe(-2); expect(cardDeviations(Array(12).fill(''))).toBeNull(); expect(cardDeviations(Array(12).fill(181))).toBeNull(); });
  it('uses manually entered aircraft deviations', () => { const plan = fresh(); plan.compassDeviations = Array(12).fill(5); const result = calculatePlan(plan); expect(result.legs[1].deviation).toBe(5); expect(result.legs[1].ch).toBe(normalizeHeading(result.legs[1].mh! + 5)); });
  it('calculates IFR wind correction from magnetic course and wind, then applies the closest card deviation', () => { const plan = fresh(); plan.routes.IFR[1].magneticCourse = 90; plan.routes.IFR[1].windFromDeg = 180; plan.routes.IFR[1].windKt = 20; plan.routes.IFR[1].tasKt = 100; plan.compassDeviations = Array(12).fill(''); plan.compassDeviations[3] = 4; const result = calculatePlan(plan); expect(result.errors).not.toContain('Enter at least one valid aircraft compass deviation.'); expect(result.legs[1].mc).toBe(90); expect(result.legs[1].wca).toBeCloseTo(solveWind(90, 100, 186, 20)!.wca); expect(result.legs[1].deviation).toBe(4); expect(result.legs[1].ch).toBeCloseTo(normalizeHeading(result.legs[1].mh! + 4)); });
  it('computes time, fuel, and VFR altitude checks', () => { expect(legMinutes(50, 100)).toBe(30); expect(cruiseFuelGallons(8,30)).toBe(4); expect(vfrAltitudeValid(5500,90)).toBe(true); expect(vfrAltitudeValid(4500,90)).toBe(false); expect(vfrAltitudeValid(4500,270)).toBe(true); });
  it('rejects invalid departure dates', () => { expect(utcMinutes('2026-02-30','14:00')).toBeNull(); expect(utcMinutes('2026-10-21','24:00')).toBeNull(); });
});
describe('plan calculations', () => {
  it('calculates the reference sample without rounding intermediate results', () => { const result = calculatePlan(fresh()); expect(result.complete).toBe(true); expect(result.distanceNm).toBe(131); expect(result.legs[1].mc).toBe(219); expect(result.legs[1].eteMin).toBeGreaterThan(9); expect(result.legs[1].ch).toBeDefined(); expect(result.fuelLeft).toBeLessThan(40); });
  it('updates totals when a distance changes', () => { const plan = fresh(); plan.routes.IFR[1].distanceNm = 23; expect(calculatePlan(plan).distanceNm).toBe(141); });
  it('requires named departure and arrival checkpoints', () => { const plan = fresh(); plan.routes.IFR[0].fix = ''; plan.routes.IFR[1].fix = ''; const result = calculatePlan(plan); expect(result.complete).toBe(false); expect(result.errors).toContain('Enter a departure checkpoint.'); expect(result.errors.some(error => error.includes('Enter a checkpoint'))).toBe(true); });
  it('withholds totals when a leg is incomplete', () => { const plan = fresh(); plan.routes.IFR[2].distanceNm = ''; const result = calculatePlan(plan); expect(result.complete).toBe(false); expect(result.etaMin).toBeUndefined(); expect(result.errors.some(error => error.includes('ALNZO'))).toBe(true); });
  it('warns when cruise fuel is insufficient', () => { const plan = fresh(); plan.setup.fuelGal = 1; const result = calculatePlan(plan); expect(result.fuelLeft).toBeLessThan(0); expect(result.errors).toContain('Cruise fuel exceeds fuel on board.'); });
  it('rolls UTC arrival into the following date', () => { const plan = fresh(); plan.setup.date = '2026-10-21'; plan.setup.time = '23:55'; const result = calculatePlan(plan); expect(new Date(result.etaMin! * 60000).toISOString().startsWith('2026-10-22')).toBe(true); });
  it('flags VFR altitudes and invalid wind', () => { const plan = fresh(); plan.mode = 'VFR'; plan.routes.VFR[1].altitudeFt = 5500; plan.routes.VFR[1].windFromDeg = 257; plan.routes.VFR[1].windKt = 200; const result = calculatePlan(plan); expect(result.legs[1].altitudeWarning).toBe(true); expect(result.complete).toBe(false); expect(result.errors.some(error => error.includes('Wind/TAS'))).toBe(true); });
});
