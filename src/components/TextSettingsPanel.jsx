import './RepeaterItemSettingsPanel.css';
import './RepeaterItemElementPanel.css';

/**
 * Settings panel for the Text component – edit content.
 * onOpenConnectorPanel('text') opens the Use collection content panel when provided.
 */
export function TextSettingsPanel({ content = '', onChange, onClose, onOpenConnectorPanel, connected = false }) {
  return (
    <div className="repeater-item-settings-panel edit-text-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">Text</h2>
        <div className="repeater-item-settings-panel__header-actions">
          <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        <div className={`edit-text-panel__text-row ${connected ? 'edit-text-panel__text-row--connected' : ''}`}>
          <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
            Content
            <textarea
              className="repeater-item-settings-panel__input repeater-item-settings-panel__textarea"
              value={content}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="Enter your text..."
              rows={5}
            />
          </label>
          {onOpenConnectorPanel && (
            <button
              type="button"
              className="edit-text-panel__connector-btn"
              onClick={() => onOpenConnectorPanel('text')}
              title="Connect to CMS field"
              aria-label="Connect to CMS field"
            >
              <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="12" r="2.5" fill="none" />
                  <circle cx="17" cy="12" r="2.5" fill="none" />
                  <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
