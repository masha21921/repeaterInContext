import './RepeaterItemSettingsPanel.css';
import './RepeaterItemElementPanel.css';

/**
 * Settings panel for the Image component – edit image URL and alt text.
 * onOpenConnectorPanel('image' | 'imageAlt') opens the Use collection content panel when provided.
 */
export function ImageSettingsPanel({ src = '', alt = '', onSrcChange, onAltChange, onClose, onOpenConnectorPanel, srcConnected = false, altConnected = false }) {
  return (
    <div className="repeater-item-settings-panel edit-text-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">Image</h2>
        <div className="repeater-item-settings-panel__header-actions">
          <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        <div className={`edit-text-panel__text-row ${srcConnected ? 'edit-text-panel__text-row--connected' : ''}`}>
          <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
            Image URL
            <input
              type="text"
              className="repeater-item-settings-panel__input"
              value={src}
              onChange={(e) => onSrcChange?.(e.target.value)}
              placeholder="https://..."
            />
          </label>
          {onOpenConnectorPanel && (
            <button
              type="button"
              className="edit-text-panel__connector-btn"
              onClick={() => onOpenConnectorPanel('image')}
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
        <div className={`edit-text-panel__text-row ${altConnected ? 'edit-text-panel__text-row--connected' : ''}`}>
          <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
            Alt text
            <input
              type="text"
              className="repeater-item-settings-panel__input"
              value={alt}
              onChange={(e) => onAltChange?.(e.target.value)}
              placeholder="Describe the image"
            />
          </label>
          {onOpenConnectorPanel && (
            <button
              type="button"
              className="edit-text-panel__connector-btn"
              onClick={() => onOpenConnectorPanel('imageAlt')}
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
