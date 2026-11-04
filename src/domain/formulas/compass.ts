import { normalizeHeading } from './angles';
export const CARD_HEADINGS = Array.from({ length: 12 }, (_, index) => index * 30);
export function cardDeviations(values: (number | '')[]): (number | '')[] | null {
  if (values.length !== 12 || values.some(value => value !== '' && (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 180))) return null;
  return values.some(value => value !== '') ? values : null;
}
export function nearestDeviation(magneticHeading: number, deviations: (number | '')[] | null): number | null {
  if (!deviations) return null;
  const heading = normalizeHeading(magneticHeading);
  let nearest: number | null = null;
  let distance = Infinity;
  deviations.forEach((deviation, index) => {
    if (deviation === '') return;
    const difference = Math.abs(heading - CARD_HEADINGS[index]);
    const circularDistance = Math.min(difference, 360 - difference);
    if (circularDistance < distance) { nearest = deviation; distance = circularDistance; }
  });
  return nearest;
}
