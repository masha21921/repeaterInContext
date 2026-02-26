import './ContentTitleSettingsPanel.css';

/**
 * Settings panel for the content heading (e.g. "Breakfast recipes").
 */
export function ContentTitleSettingsPanel({ value, onChange }) {
  return (
    <div className="content-title-settings-panel">
      <h2 className="content-title-settings-panel__title">Heading</h2>
      <div className="content-title-settings-panel__body">
        <label className="content-title-settings-panel__label">
          Content title
          <input
            type="text"
            className="content-title-settings-panel__input"
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
