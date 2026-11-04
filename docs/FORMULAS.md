# NavLog formulas and assumptions

This guide is for reviewing the current calculation model with clients. Each formula lives in a small pure module under `src/domain/formulas/`; `plan.ts` combines the results for a route. The code uses full floating-point precision while calculating and rounds only in `src/domain/format.ts` for display.

## Inputs and units

| Input | Unit | Meaning |
| --- | --- | --- |
| IFR magnetic course (MC) | degrees magnetic | Entered intended track for the arriving IFR leg |
| VFR true course (TC) | degrees true | Entered intended track for the arriving VFR leg |
| Wind direction | degrees true | Direction the wind comes **from** |
| Wind speed, TAS, ground speed | knots | Nautical miles per hour |
| Variation | degrees | East positive, west negative |
| Distance | nautical miles | Chart or user supplied leg distance |
| GPH, fuel | US gallons/hour, US gallons | Cruise burn and fuel on board |
| Departure date/time | UTC | Used for every ETA, including next-day rollover |

A leg's values are entered on the row of the checkpoint where that leg ends. The departure checkpoint has no inbound leg. Temperature is recorded but does not alter TAS or fuel burn, matching the prototype's entered-performance model.

## Calculation sequence

1. **Magnetic course (MC):** IFR uses entered MC directly. VFR uses `normalize(TC − variation)`. Example: TC 090° and 6° W (`−6`) gives MC 096°.
2. **Wind correction angle (WCA):** VFR uses true wind direction against TC. IFR converts entered true wind direction to magnetic with `wind-from magnetic = normalize(wind-from true − variation)`, then compares it with entered MC. Let `a = wind-from − course` in the same reference. `WCA = asin(wind speed × sin(a) / TAS)`. Positive WCA means steer right. A wind/crosswind combination with absolute crosswind greater than TAS is invalid. The compass card does not affect WCA.
3. **Magnetic heading (MH):** `normalize(MC + WCA)`.
4. **Compass deviation:** Choose the entered card heading nearest MH by circular distance, including across 330° to north. The card labels north 360°; the calculation stores it as 0°. At an exact tie, use the lower listed card index. Blank card positions are skipped.
5. **Compass heading (CH):** `normalize(MH + chosen deviation)`.
6. **Ground speed (GS):** `sqrt(TAS² − (wind speed × sin(a))²) − wind speed × cos(a)`. Zero or negative GS is invalid.
7. **Leg ETE:** `60 × distance / GS` minutes.
8. **Leg cruise fuel:** `GPH × leg ETE / 60` gallons.
9. **Cumulative outputs:** ETA adds cumulative ETE to UTC departure. Fuel remaining subtracts cumulative cruise fuel from fuel on board. Distance and ETE remaining subtract completed legs from totals.

`normalize` produces headings from 000° up to but excluding 360°. Display headings are rounded to whole degrees; distance, time in minutes, speed, and fuel display to one decimal. Formatting does not feed back into calculations.

## Warnings and incomplete plans

- A missing checkpoint, blank/invalid leg input, or impossible wind stops complete route totals; the affected leg shows an error.
- A compass card with no valid entries stops complete route totals because CH cannot be determined. One valid entry is enough to calculate, though more entries better represent the aircraft’s card.
- Negative cruise fuel remaining triggers a warning but keeps the mathematical result visible.
- The VFR altitude check warns above 3,000 ft: MC 000–179° expects odd thousands + 500 ft; MC 180–359° expects even thousands + 500 ft. This is a prototype planning rule and does not replace current regulatory review.
- If variation is blank, calculation currently uses the prototype sample `−6°`. Set the actual value for the route before use.
- No route geometry or coordinate lookup is calculated. Waypoint coordinate fields have been removed; leg distance is entered directly.

## How to review or replace a formula

| Formula group | File | Tests |
| --- | --- | --- |
| Angle wrap and MC | `src/domain/formulas/angles.ts` | `formulas.test.ts` |
| Wind triangle and GS | `src/domain/formulas/wind.ts` | `formulas.test.ts` |
| Compass card and nearest heading | `src/domain/formulas/compass.ts` | `formulas.test.ts` |
| ETE, fuel, VFR check, UTC | `src/domain/formulas/flight.ts` | `formulas.test.ts` |
| Route totals and validation | `src/domain/formulas/plan.ts` | `formulas.test.ts` |

Replace a pure function or inject an alternate implementation into `plan.ts`, add benchmark cases, then run `npm test` and `npm run build`. If units or sign conventions change, update this guide, relevant field labels, and tests together. The current values are based on the supplied prototype and developer brief; full workbook and E6B validation remains a separate acceptance step.
