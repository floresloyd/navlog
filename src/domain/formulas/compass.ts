import { normalizeHeading } from './angles';
export const CARD_HEADINGS = Array.from({ length: 12 }, (_, index) => index * 30);
export function cardDeviations(values: (number | '')[]): number[] | null {
  if (values.length !== 12 || values.some(value => typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 180)) return null;
  return values as number[];
}
export function interpolatedDeviation(magneticHeading: number, deviations: number[] | null): number | null {
  if (!deviations) return null;
  const heading = normalizeHeading(magneticHeading);
  const index = Math.floor(heading / 30);
  const fraction = (heading - index * 30) / 30;
  // Interpolate signed corrections across 330° -> 000° as well.
  return deviations[index] + (deviations[(index + 1) % 12] - deviations[index]) * fraction;
}
