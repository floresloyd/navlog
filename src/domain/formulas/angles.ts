export const radians = (degrees: number) => degrees * Math.PI / 180;
export const degrees = (radiansValue: number) => radiansValue * 180 / Math.PI;
export const normalizeHeading = (heading: number) => ((heading % 360) + 360) % 360;
export const signedAngle = (angle: number) => ((angle + 180) % 360 + 360) % 360 - 180;
export const magneticCourse = (trueCourse: number, eastPositiveVariation: number) => normalizeHeading(trueCourse - eastPositiveVariation);
