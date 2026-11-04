import { degrees, radians } from './angles';
export interface WindResult { wca: number; groundSpeed: number }
// Wind direction is where the wind comes FROM; course and wind must use the same reference (true or magnetic).
export function solveWind(courseDeg: number, tas: number, windFrom: number, windSpeed: number): WindResult | null {
  if (![courseDeg, tas, windFrom, windSpeed].every(Number.isFinite) || tas <= 0 || windSpeed < 0) return null;
  const angle = radians(windFrom - courseDeg);
  const crosswind = windSpeed * Math.sin(angle);
  if (Math.abs(crosswind) > tas) return null;
  const wca = windSpeed === 0 ? 0 : degrees(Math.asin(crosswind / tas));
  const groundSpeed = Math.sqrt(tas * tas - crosswind * crosswind) - windSpeed * Math.cos(angle);
  return groundSpeed > 0 ? { wca, groundSpeed } : null;
}
