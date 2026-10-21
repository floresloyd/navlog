interface Props { onCancel: () => void; onConfirm: () => void; }

export function ClearPlanDialog({ onCancel, onConfirm }: Props) {
  return <div className="modal-backdrop" onMouseDown={event => {
    if (event.target === event.currentTarget) onCancel();
  }}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="clear-plan-title" aria-describedby="clear-plan-description" onKeyDown={event => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Tab') {
        const buttons = event.currentTarget.querySelectorAll('button');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}>
      <span className="modal-icon" aria-hidden="true">!</span>
      <h2 id="clear-plan-title">Clear your work?</h2>
      <p id="clear-plan-description">This clears both IFR and VFR routes, flight setup, compass card, and weather notes from this browser. You can load the sample again with Demo, but your edits cannot be recovered.</p>
      <div className="modal-actions">
        <button className="outline" onClick={onCancel} autoFocus>Keep my work</button>
        <button className="danger-button" onClick={onConfirm}>Clear my work</button>
      </div>
    </div>
  </div>;
}
