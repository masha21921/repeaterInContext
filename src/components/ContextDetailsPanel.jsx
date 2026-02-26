import './RepeaterItemSettingsPanel.css';

/**
 * Panel shown in the right sidebar when "details" is clicked in technical mode.
 * Displays context instance: pagination, filter, sort. When not connected, shows empty state.
 */
export function ContextDetailsPanel({ contextInstance, contextLabel, contextInstanceLabel, connected, onClose }) {
  const hasContext = connected && contextInstance;
  if (!hasContext) {
    return (
      <div className="repeater-item-settings-panel">
        <div className="repeater-item-settings-panel__header">
          <h2 className="repeater-item-settings-panel__title">Context instance</h2>
          <div className="repeater-item-settings-panel__header-actions">
            {onClose && (
              <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
            )}
          </div>
        </div>
        <div className="repeater-item-settings-panel__body">
          <p className="repeater-item-settings-panel__placeholder">Connect a collection to see context details.</p>
        </div>
      </div>
    );
  }

  const lines = [];
  if (contextInstance.pagination) {
    const p = contextInstance.pagination;
    lines.push('pagination: {');
    lines.push(`  pageSize: ${p.pageSize ?? 4}`);
    lines.push('}');
  }
  if (contextInstance.filter != null) {
    const rules = Array.isArray(contextInstance.filter) ? contextInstance.filter : contextInstance.filter?.rules ?? [];
    lines.push('filter: ' + (rules.length ? `${rules.length} rule(s)` : '[]'));
    if (rules.length) {
      rules.forEach((r, i) => {
        lines.push(`  [${i}] ${r.field ?? '?'} ${r.condition ?? '?'} "${r.value ?? ''}"`);
      });
    }
  }
  if (contextInstance.sort != null) {
    const s = typeof contextInstance.sort === 'string' ? contextInstance.sort : contextInstance.sort?.option ?? 'default';
    lines.push('sort: "' + s + '"');
  }
  const detailsText = lines.join('\n');

  return (
    <div className="repeater-item-settings-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">
          {contextInstanceLabel != null ? `Context instance: ${contextInstanceLabel}` : 'Context instance'}
        </h2>
        <div className="repeater-item-settings-panel__header-actions">
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        {contextLabel != null && (
          <p className="repeater-item-settings-panel__placeholder" style={{ marginBottom: 8 }}>
            CTX: {contextLabel}
          </p>
        )}
        <pre className="context-details-panel__pre" aria-label="Context instance dataset">
          {detailsText || '—'}
        </pre>
      </div>
    </div>
  );
}
