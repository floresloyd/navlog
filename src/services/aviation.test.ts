import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from './aviation';

beforeEach(() => vi.unstubAllGlobals());
describe('weather client', () => {
  it('requests the chosen ICAO code and returns timed reports', async () => {
    const result = { metar: { raw: 'METAR KOPF', time: '2026-10-21T13:00:00Z' }, taf: null, fetchedAt: '2026-10-21T13:01:00Z' };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => result });
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchWeather('KOPF')).toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith('/api/weather?ids=KOPF', { signal: undefined });
  });
  it('shows the server error body when available and explains an unhandled 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({ error: 'metar upstream 503' }) }).mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw new Error('HTML'); } }));
    await expect(fetchWeather('KOPF')).rejects.toThrow('metar upstream 503');
    await expect(fetchWeather('KOPF')).rejects.toThrow('Weather service returned 500');
  });
});
