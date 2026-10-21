import { normalizeHeading, signedAngle } from './angles';
export const CARD_HEADINGS = Array.from({ length: 12 }, (_, index) => index * 30);
export function cardDeviations(steer: (number | '')[]): number[] | null {
  if (steer.length !== 12 || steer.some(value => value === '' || !Number.isFinite(value))) return null;
  return steer.map((value, index) => signedAngle(Number(value) - CARD_HEADINGS[index]));
}
export function interpolatedDeviation(magneticHeading: number, deviations: number[] | null): number | null {
  if (!deviations) return null;
  const heading = normalizeHeading(magneticHeading);
  const index = Math.floor(heading / 30);
  const fraction = (heading - index * 30) / 30;
  // Interpolate signed corrections across 330° -> 000° as well.
  return deviations[index] + (deviations[(index + 1) % 12] - deviations[index]) * fraction;
}
