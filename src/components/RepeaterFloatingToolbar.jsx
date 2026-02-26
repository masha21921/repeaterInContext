import './RepeaterFloatingToolbar.css';

/**
 * Floating panel/toolbar shown when a component is selected.
 * Repeater: show "Manage items" + Settings + icons. Others: Settings + icons only (no Manage items).
 */
export function RepeaterFloatingToolbar({
  showManageItems = true,
  onManageItems,
  onRepeaterSettings,
  onLayout,
  onStretch,
  onDuplicate,
  onConnect,
  onAlignment,
  onRefresh,
  onHelp,
}) {
  return (
    <div className="repeater-floating-toolbar" onClick={(e) => e.stopPropagation()}>
      {showManageItems && (
        <button type="button" className="repeater-floating-toolbar__btn repeater-floating-toolbar__btn--text" onClick={() => onManageItems?.()} title="Manage items" aria-label="Manage items">
          Manage items
        </button>
      )}
      <button type="button" className="repeater-floating-toolbar__btn repeater-floating-toolbar__btn--text" onClick={() => onRepeaterSettings?.()} title="Settings" aria-label="Settings">
        Settings
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onLayout?.()} title="Layout" aria-label="Layout">
        <span className="repeater-floating-toolbar__icon" aria-hidden>☰</span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onStretch?.()} title="Stretch" aria-label="Stretch">
        <span className="repeater-floating-toolbar__icon" aria-hidden>⊡</span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onDuplicate?.()} title="Duplicate" aria-label="Duplicate">
        <span className="repeater-floating-toolbar__icon" aria-hidden>⧉</span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn repeater-floating-toolbar__btn--connect" onClick={() => onConnect?.()} title="Connect to CMS field" aria-label="Connect to CMS field">
        <span className="repeater-floating-toolbar__icon repeater-floating-toolbar__icon--connect" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="12" r="2.5" fill="none" />
            <circle cx="17" cy="12" r="2.5" fill="none" />
            <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
          </svg>
        </span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onAlignment?.()} title="Alignment" aria-label="Alignment">
        <span className="repeater-floating-toolbar__icon" aria-hidden>⇅</span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onRefresh?.()} title="Refresh" aria-label="Refresh">
        <span className="repeater-floating-toolbar__icon" aria-hidden>↻</span>
      </button>
      <button type="button" className="repeater-floating-toolbar__btn" onClick={() => onHelp?.()} title="Help" aria-label="Help">
        <span className="repeater-floating-toolbar__icon" aria-hidden>?</span>
      </button>
    </div>
  );
}
