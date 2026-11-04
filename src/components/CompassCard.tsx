import { CARD_HEADINGS } from '../domain/formulas/compass';
import type { NumericInput } from '../domain/types';
interface Props { deviations: NumericInput[]; onEdit: (index: number, value: string) => void; }
const cardHeadingLabel = (heading: number) => heading === 0 ? '360' : String(heading).padStart(3, '0');
export function CompassCard({ deviations, onEdit }: Props) {
  return <section className="page-panel"><h1>Aircraft compass deviation card</h1><p>Enter deviations from this aircraft’s current compass card at the headings shown below. Leave unlisted headings blank. The closest entered heading supplies each leg’s deviation. Use a positive number for east/add and a negative number for west/subtract.</p><div className="compass-grid"><div className="compass-caption">For MH</div>{CARD_HEADINGS.map(value => <b key={value}>{cardHeadingLabel(value)}°</b>)}<div className="compass-caption">Deviation ±°</div>{deviations.map((value,index) => <input key={index} aria-label={`Deviation at ${CARD_HEADINGS[index] === 0 ? 360 : CARD_HEADINGS[index]}`} type="number" min="-180" max="180" value={value} onChange={event => onEdit(index,event.target.value)} />)}</div><p className="note">At least one valid deviation is required. Positive deviation is added to magnetic heading to obtain compass heading.</p></section>;
}
