export interface WeatherReport { raw: string; time: string | null; }
export interface WeatherResult { metar: WeatherReport | null; taf: WeatherReport | null; fetchedAt: string; error?: string; }
export async function fetchWeather(code: string, signal?: AbortSignal): Promise<WeatherResult> {
  const response = await fetch(`/api/weather?ids=${encodeURIComponent(code)}`, { signal });
  if (!response.ok) {
    let detail = '';
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') detail = body.error;
    } catch { /* An upstream host may return HTML or an empty error body. */ }
    throw new Error(detail || `Weather service returned ${response.status}. Check that the NavLog weather server is running and reachable.`);
  }
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('fetchedAt' in data)) throw new Error('Invalid weather response');
  return data as WeatherResult;
}
