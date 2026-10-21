import { degrees, radians } from './angles';
export interface WindResult { wca: number; groundSpeed: number }
// Wind direction is where the wind comes FROM, in true degrees.
export function solveWind(trueCourse: number, tas: number, windFrom: number, windSpeed: number): WindResult | null {
  if (![trueCourse, tas, windFrom, windSpeed].every(Number.isFinite) || tas <= 0 || windSpeed < 0) return null;
  const angle = radians(windFrom - trueCourse);
  const crosswind = windSpeed * Math.sin(angle);
  if (Math.abs(crosswind) > tas) return null;
  const wca = windSpeed === 0 ? 0 : degrees(Math.asin(crosswind / tas));
  const groundSpeed = Math.sqrt(tas * tas - crosswind * crosswind) - windSpeed * Math.cos(angle);
  return groundSpeed > 0 ? { wca, groundSpeed } : null;
}
