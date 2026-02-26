import './PageSettingsPanel.css';

/**
 * Settings panel when the Page is selected. Context (source) can be assigned at page level.
 */
export function PageSettingsPanel({
  availableContexts = [],
  selectedContextId,
  onSelectContext,
}) {
  return (
    <div className="page-settings-panel">
      <h2 className="page-settings-panel__title">Page</h2>
      <div className="page-settings-panel__body">
        <label className="page-settings-panel__label">
          Context (source)
          <select
            className="page-settings-panel__select"
            value={selectedContextId ?? ''}
            onChange={(e) => onSelectContext?.(e.target.value || null)}
          >
            <option value="">None</option>
            {availableContexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.label} — {ctx.source}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
