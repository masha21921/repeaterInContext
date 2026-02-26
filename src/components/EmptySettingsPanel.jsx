import './RepeaterItemSettingsPanel.css';
import './EmptySettingsPanel.css';

/**
 * Shown when no element is selected, or when the selected element has no settings (e.g. unconfigured repeater).
 * When onClose is provided, renders with a panel header and close button (e.g. for "no context" connector panel).
 */
export function EmptySettingsPanel({ message, onClose, title }) {
  const text = message ?? 'Select an element to edit its settings.';
  if (onClose != null) {
    return (
      <div className="repeater-item-settings-panel empty-settings-panel--with-close">
        <div className="repeater-item-settings-panel__header">
          <h2 className="repeater-item-settings-panel__title">{title ?? 'Connect to CMS field'}</h2>
          <div className="repeater-item-settings-panel__header-actions">
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <div className="repeater-item-settings-panel__body">
          <p className="empty-settings-panel__text">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="empty-settings-panel">
      <p className="empty-settings-panel__text">{text}</p>
    </div>
  );
}
