import type { NumericInput } from '../domain/types';
interface Props { label: string; value: string | NumericInput; onChange: (value: string) => void; numeric?: boolean; step?: string; type?: string; className?: string; }
export function Field({ label, value, onChange, numeric, step = 'any', type, className = '' }: Props) {
  return <label className={`field ${className}`}><span>{label}</span><input aria-label={label} type={type || (numeric ? 'number' : 'text')} step={numeric ? step : undefined} value={value} onChange={event => onChange(event.target.value)} /></label>;
}
