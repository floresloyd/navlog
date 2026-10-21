export const legMinutes = (distanceNm: number, groundSpeedKt: number) => 60 * distanceNm / groundSpeedKt;
export const cruiseFuelGallons = (gph: number, minutes: number) => gph * minutes / 60;
export function vfrAltitudeValid(altitudeFt: number, magneticCourseDeg: number): boolean {
  if (altitudeFt <= 3000) return true;
  const thousands = Math.floor(altitudeFt / 1000);
  return altitudeFt % 1000 === 500 && thousands % 2 === (magneticCourseDeg < 180 ? 1 : 0);
}
export function utcMinutes(date: string, time: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const timestamp = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(timestamp);
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day && hour < 24 && minute < 60 ? timestamp / 60000 : null;
}
