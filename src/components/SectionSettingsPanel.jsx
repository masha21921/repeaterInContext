import './SectionSettingsPanel.css';

/**
 * Settings panel for the selected section (title, content title, context/source).
 */
export function SectionSettingsPanel({
  sectionId,
  title,
  contentTitle,
  availableContexts = [],
  selectedContextId,
  onSelectContext,
  onUpdateTitle,
  onUpdateContentTitle,
}) {
  return (
    <div className="section-settings-panel">
      <h2 className="section-settings-panel__title">Section</h2>
      <div className="section-settings-panel__body">
        <label className="section-settings-panel__label">
          Context (source)
          <select
            className="section-settings-panel__input section-settings-panel__select"
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
        <label className="section-settings-panel__label">
          Title
          <input
            type="text"
            className="section-settings-panel__input"
            value={title ?? ''}
            onChange={(e) => onUpdateTitle?.(e.target.value)}
          />
        </label>
        {contentTitle !== undefined && (
          <label className="section-settings-panel__label">
            Content title
            <input
              type="text"
              className="section-settings-panel__input"
              value={contentTitle ?? ''}
              onChange={(e) => onUpdateContentTitle?.(e.target.value)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
