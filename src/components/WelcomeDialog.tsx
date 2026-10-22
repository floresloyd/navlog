import { useEffect, useRef } from 'react';
interface Props { onAccept: () => void; }
export function WelcomeDialog({ onAccept }: Props) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { button.current?.focus(); }, []);
  return <div className="dialog-backdrop"><section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-description"><p className="eyebrow">BEFORE YOU BEGIN</p><h2 id="welcome-title">Welcome to NavLog</h2><p id="welcome-description">NavLog is a planning aid. It can contain errors, incomplete calculations, or unavailable data. You, the pilot, remain responsible for every flight decision. Verify the route, aircraft performance, current charts, NOTAMs, airport information, weather, and an official briefing before flight.</p><p>Any demo plan is historical sample data. Airport data shows its FAA effective date; weather reports show their own issue or observation time.</p><button ref={button} className="primary" onClick={onAccept}>I understand — continue</button></section></div>;
}
