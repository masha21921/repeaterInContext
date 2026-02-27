import './RepeaterSettingsPanel.css';

const ConnectIcon = () => (
  <span className="repeater-settings-panel__connect-icon" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="12" r="2.5" fill="none" />
      <circle cx="17" cy="12" r="2.5" fill="none" />
      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
    </svg>
  </span>
);

/**
 * Container settings panel. Shown when the container (outer) is selected.
 * Same experience as Page and Section: "Context (source)" with Connect or Replace (opens modal).
 */
export function ContainerSettingsPanel({
  /** Contexts available from parents (page, section). Shown as hint when empty. */
  parentContexts = [],
  onOpenConnectModal,
  onClose,
  contextLabel,
  hasContext,
}) {
  const hasParentContext = parentContexts.length > 0;

  return (
    <div className="repeater-settings-panel">
      <div className="repeater-settings-panel__header">
        <h2 className="repeater-settings-panel__title">Container</h2>
        <div className="repeater-settings-panel__header-actions">
          <button type="button" className="repeater-settings-panel__icon-btn" aria-label="Help">?</button>
          <button type="button" className="repeater-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>
      <div className="repeater-settings-panel__body">
        <div className="repeater-settings-panel__row repeater-settings-panel__row--display">
          <label className="repeater-settings-panel__row-label">Context (source)</label>
          <div className="repeater-settings-panel__display-wrap">
            {hasContext ? (
              <>
                <span className="repeater-settings-panel__display-value">{contextLabel ?? '—'}</span>
                {onOpenConnectModal && (
                  <button
                    type="button"
                    className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                    onClick={onOpenConnectModal}
                    aria-label="Replace context"
                  >
                    <ConnectIcon />
                    Replace
                  </button>
                )}
              </>
            ) : (
              <>
                {onOpenConnectModal && (
                  <button
                    type="button"
                    className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                    onClick={onOpenConnectModal}
                    aria-label="Connect to context"
                  >
                    <ConnectIcon />
                    Connect
                  </button>
                )}
                {!hasParentContext && (
                  <p className="repeater-settings-panel__hint">Connect the page or a section to a context first, or connect this container to a context.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
