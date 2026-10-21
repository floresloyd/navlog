export type Mode = 'IFR' | 'VFR';
export type NumericInput = number | '';
export interface Leg {
  id: string; fix: string; vorIdent: string; vorFrequency: string; route: string;
  trueCourse: NumericInput; altitudeFt: NumericInput; windFromDeg: NumericInput;
  windKt: NumericInput; temperatureC: NumericInput; tasKt: NumericInput;
  gph: NumericInput; distanceNm: NumericInput;
  latitude: NumericInput; longitude: NumericInput;
}
export interface Setup {
  aircraft: string; date: string; time: string; fuelGal: NumericInput;
  variationDeg: NumericInput; alternate: string;
}
export interface Plan { version: 1; mode: Mode; setup: Setup; routes: Record<Mode, Leg[]>; compassSteer: NumericInput[]; manualWeather: string; }
export interface LegResult {
  mc?: number; wca?: number; mh?: number; deviation?: number; ch?: number;
  gs?: number; eteMin?: number; etaMin?: number; fuelLeg?: number;
  distanceRemaining?: number; eteRemaining?: number; fuelRemaining?: number;
  altitudeWarning?: boolean; error?: string;
}
export interface PlanResult { legs: LegResult[]; distanceNm?: number; eteMin?: number; fuelUsed?: number; fuelLeft?: number; etaMin?: number; complete: boolean; errors: string[]; }
