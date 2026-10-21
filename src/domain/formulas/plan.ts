import type { LegResult, Plan, PlanResult, NumericInput } from '../types';
import { magneticCourse, normalizeHeading } from './angles';
import { cardDeviations, interpolatedDeviation } from './compass';
import { cruiseFuelGallons, legMinutes, utcMinutes, vfrAltitudeValid } from './flight';
import { solveWind } from './wind';
const valid = (value: NumericInput): value is number => typeof value === 'number' && Number.isFinite(value);
export function calculatePlan(plan: Plan): PlanResult {
  const route = plan.routes[plan.mode];
  const results: LegResult[] = route.map(() => ({}));
  const errors: string[] = [];
  const departure = utcMinutes(plan.setup.date, plan.setup.time);
  const fuel = plan.setup.fuelGal;
  const variation = valid(plan.setup.variationDeg) ? plan.setup.variationDeg : -6; // Prototype sample; edit in setup.
  const deviations = cardDeviations(plan.compassSteer);
  const distances = route.slice(1).map(leg => leg.distanceNm);
  const allDistances = distances.every(value => valid(value) && value >= 0);
  const totalDistance = allDistances ? distances.reduce<number>((sum, value) => sum + Number(value), 0) : undefined;
  let elapsed = 0, used = 0, traveled = 0;
  let chainValid = true;
  if (departure === null) errors.push('Enter a valid UTC departure date and time.');
  if (!valid(fuel) || fuel < 0) errors.push('Enter fuel on board in gallons.');
  if (!deviations) errors.push('Complete all 12 compass card steer headings.');
  if (!route[0]?.fix.trim()) errors.push('Enter a departure checkpoint.');
  route.slice(1).forEach((leg, index) => {
    const result = results[index + 1];
    const label = leg.fix || `Leg ${index + 1}`;
    if (!leg.fix.trim()) result.error = 'Enter a checkpoint name or identifier.';
    if (valid(leg.trueCourse)) result.mc = magneticCourse(leg.trueCourse, variation);
    if (plan.mode === 'VFR' && valid(leg.altitudeFt) && result.mc !== undefined) result.altitudeWarning = !vfrAltitudeValid(leg.altitudeFt, result.mc);
    const inputs = [leg.trueCourse, leg.tasKt, leg.windFromDeg, leg.windKt, leg.gph, leg.distanceNm];
    if (inputs.some(value => !valid(value)) || !valid(leg.gph) || leg.gph < 0 || !valid(leg.distanceNm) || leg.distanceNm < 0) {
      result.error ??= 'Complete course, wind, TAS, GPH and distance with valid values.';
    } else {
      const wind = solveWind(leg.trueCourse as number, leg.tasKt as number, leg.windFromDeg as number, leg.windKt as number);
      if (!wind) result.error ??= 'Wind/TAS combination has no positive ground speed.';
      else if (result.mc !== undefined) {
        result.wca = wind.wca;
        result.mh = normalizeHeading(result.mc + wind.wca);
        const deviation = interpolatedDeviation(result.mh, deviations);
        if (deviation !== null) {
          result.deviation = deviation;
          result.ch = normalizeHeading(result.mh + deviation);
        }
        result.gs = wind.groundSpeed;
        result.eteMin = legMinutes(leg.distanceNm as number, wind.groundSpeed);
        result.fuelLeg = cruiseFuelGallons(leg.gph as number, result.eteMin);
      }
    }
    if (result.error) errors.push(`${label}: ${result.error}`);
    if (!deviations) result.error ??= 'Compass card is incomplete.';
    if (chainValid && !result.error && result.eteMin !== undefined && result.fuelLeg !== undefined && departure !== null && valid(fuel)) {
      elapsed += result.eteMin; used += result.fuelLeg; traveled += leg.distanceNm as number;
      result.etaMin = departure + elapsed;
      result.fuelRemaining = fuel - used;
      if (totalDistance !== undefined) result.distanceRemaining = totalDistance - traveled;
    } else chainValid = false;
  });
  const complete = chainValid && !!route[0]?.fix.trim() && route.length > 1 && allDistances && departure !== null && valid(fuel) && !!deviations;
  if (complete) results.forEach((result, index) => { if (index > 0 && result.etaMin !== undefined) result.eteRemaining = elapsed - (result.etaMin - departure); });
  if (complete && fuel - used < 0) errors.push('Cruise fuel exceeds fuel on board.');
  return { legs: results, distanceNm: totalDistance, eteMin: complete ? elapsed : undefined, fuelUsed: complete ? used : undefined, fuelLeft: complete ? fuel - used : undefined, etaMin: complete ? departure + elapsed : undefined, complete, errors };
}
