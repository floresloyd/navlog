export type EventName = 'plan.loaded' | 'plan.saved' | 'plan.save_failed' | 'plan.edited' | 'plan.clear_requested' | 'plan.clear_canceled' | 'plan.cleared' | 'plan.demo_loaded' | 'mode.changed' | 'tab.changed' | 'checkpoint.added' | 'checkpoint.removed' | 'compass.edited' | 'weather.edited' | 'weather.lookup_failed' | 'welcome.accepted' | 'print.requested' | 'briefing.opened' | 'calculation.invalid';
export function logEvent(event: EventName, detail: Record<string, unknown> = {}) {
  console.info('[NavLog]', JSON.stringify({ event, at: new Date().toISOString(), ...detail }));
}
