import { CARD_HEADINGS } from '../domain/formulas/compass';
import type { NumericInput } from '../domain/types';
interface Props { deviations: NumericInput[]; onEdit: (index: number, value: string) => void; }
export function CompassCard({ deviations, onEdit }: Props) {
  return <section className="page-panel"><h1>Aircraft compass deviation card</h1><p>Enter each deviation directly from this aircraft’s current compass card. Use a positive number for east/add and a negative number for west/subtract. Values between headings are interpolated.</p><div className="compass-grid"><div className="compass-caption">For MH</div>{CARD_HEADINGS.map(value => <b key={value}>{String(value).padStart(3,'0')}°</b>)}<div className="compass-caption">Deviation ±°</div>{deviations.map((value,index) => <input key={index} aria-label={`Deviation at ${CARD_HEADINGS[index]}`} type="number" min="-180" max="180" value={value} onChange={event => onEdit(index,event.target.value)} />)}</div><p className="note">Each aircraft needs its own measured card. Positive deviation is added to magnetic heading to obtain compass heading.</p></section>;
}
