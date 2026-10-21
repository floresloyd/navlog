export const oneDecimal = (value?: number) => value === undefined ? '—' : value.toFixed(1);
export const heading = (value?: number) => value === undefined ? '—' : String(Math.round(value) % 360).padStart(3, '0');
export const signed = (value?: number) => value === undefined ? '—' : `${value > 0 ? '+' : ''}${Math.round(value)}`;
export const duration = (minutes?: number) => minutes === undefined ? '—' : `${Math.floor(Math.round(minutes) / 60)}:${String(Math.round(minutes) % 60).padStart(2, '0')}`;
export const utc = (minutes?: number) => minutes === undefined ? '—' : new Date(Math.round(minutes) * 60000).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
