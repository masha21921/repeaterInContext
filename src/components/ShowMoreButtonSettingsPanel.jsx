import './RepeaterItemSettingsPanel.css';

/**
 * Settings panel for the repeater "Show more" button (label, etc.).
 */
export function ShowMoreButtonSettingsPanel({ label = 'Show more', onLabelChange, onClose }) {
  return (
    <div className="repeater-item-settings-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">Show more button</h2>
        <div className="repeater-item-settings-panel__header-actions">
          <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        <div className="repeater-item-settings-panel__row">
          <label className="repeater-item-settings-panel__label">
            Button label
            <input
              type="text"
              className="repeater-item-settings-panel__input"
              value={label}
              onChange={(e) => onLabelChange?.(e.target.value)}
              placeholder="Show more"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
