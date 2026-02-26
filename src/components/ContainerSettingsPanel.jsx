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
 * - If no context on page (parents have no context): message + "Add context" button.
 * - If parent has context: dropdown to use parent context, or "Add another" for this container only.
 */
export function ContainerSettingsPanel({
  /** Contexts available from parents (page, section). */
  parentContexts = [],
  assignedContextId,
  onSelectContext,
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
        {!hasParentContext ? (
          <>
            <p className="repeater-settings-panel__intro">
              No context on the page. Connect the page or a section to a context first, or add a context for this container.
            </p>
            <div className="repeater-settings-panel__row">
              <button
                type="button"
                className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                onClick={onOpenConnectModal}
              >
                <ConnectIcon />
                Add context
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="repeater-settings-panel__row repeater-settings-panel__row--display">
              <label className="repeater-settings-panel__row-label">
                {hasContext ? 'Context' : 'Use context from page'}
              </label>
              <div className="repeater-settings-panel__display-wrap">
                {hasContext ? (
                  <>
                    <span className="repeater-settings-panel__display-value">{contextLabel}</span>
                    {onOpenConnectModal && (
                      <button
                        type="button"
                        className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                        onClick={onOpenConnectModal}
                        aria-label="Add another context"
                      >
                        <ConnectIcon />
                        Add another
                      </button>
                    )}
                  </>
                ) : (
                  <select
                    className="repeater-settings-panel__select"
                    value={assignedContextId ?? ''}
                    onChange={(e) => onSelectContext?.(e.target.value || null)}
                  >
                    <option value="">Select context</option>
                    {parentContexts.map((ctx) => (
                      <option key={ctx.id} value={ctx.id}>{ctx.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
