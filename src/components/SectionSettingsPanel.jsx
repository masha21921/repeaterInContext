import { useState } from 'react';
import './SectionSettingsPanel.css';
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
 * Settings panel for the selected section. Design + Settings tabs.
 * Settings tab: list of attached contexts, Add context button.
 * attachedContexts: array of { contextId, label, instanceLabel, settings, sortSummary }. If provided, used; else built from single-context props.
 */
export function SectionSettingsPanel({
  sectionId,
  selectedContextId,
  contextLabel,
  contextInstanceLabel,
  contextSettings,
  sortSummary = 'Default',
  /** When set, overrides single-context props; each card calls onOpenContextInstanceSettings(contextId) and onDisconnectContext(contextId). */
  attachedContexts: attachedContextsProp,
  onOpenConnectModal,
  onClose,
  onContextSettingsChange,
  onOpenFilter,
  onOpenContextInstanceSettings,
  onDisconnectContext,
  allComponents = [], // Added to check bindings
  onAddComponentFromContext, // Added to handle + Add click
}) {
  const [activeTab, setActiveTab] = useState('settings');
  const singleSettings = contextSettings ?? { pageLoad: 4, filterRules: [], sortRules: [] };
  const attachedContexts = Array.isArray(attachedContextsProp) && attachedContextsProp.length > 0
    ? attachedContextsProp
    : (selectedContextId
      ? [{ contextId: selectedContextId, label: contextLabel ?? '—', instanceLabel: contextInstanceLabel ?? null, settings: singleSettings, sortSummary: sortSummary ?? 'Default' }]
      : []);

  return (
    <div className="section-settings-panel">
      <div className="section-settings-panel__header">
        <h2 className="section-settings-panel__title">Section</h2>
        {onClose && (
          <button type="button" className="section-settings-panel__close" onClick={onClose} aria-label="Close">×</button>
        )}
      </div>
      <div className="repeater-settings-panel__tabs">
        <button
          type="button"
          className={`repeater-settings-panel__tab ${activeTab === 'design' ? 'repeater-settings-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design
        </button>
        <button
          type="button"
          className={`repeater-settings-panel__tab ${activeTab === 'settings' ? 'repeater-settings-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      <div className="section-settings-panel__body">
        {activeTab === 'design' && (
          <p className="repeater-settings-panel__placeholder">Design options for this section will appear here.</p>
        )}
        {activeTab === 'settings' && (
          <>
            <section className="repeater-settings-panel__section" aria-labelledby="section-contexts-heading">
              <h3 id="section-contexts-heading" className="repeater-settings-panel__section-title">Attached contexts</h3>
              {attachedContexts.length > 0 ? (
                <ul className="section-settings-panel__context-list">
                  {attachedContexts.map((ctx) => {
                    const cardFilterSummary = (ctx.settings?.filterRules?.length ?? 0) > 0
                      ? `${ctx.settings.filterRules.length} rule${ctx.settings.filterRules.length === 1 ? '' : 's'}`
                      : 'None';
                    const isBound = allComponents.some(c => c.boundContext === ctx.contextId);
                    return (
                    <li key={ctx.contextId} className="section-settings-panel__context-item section-settings-panel__context-item--card">
                      <div className="section-settings-panel__context-card-header">
                        <div className="section-settings-panel__context-card-title-row">
                          <span className="section-settings-panel__context-card-name">{ctx.label}</span>
                        </div>
                        <div className="section-settings-panel__context-card-source">from {sectionId}</div>
                        <div className="section-settings-panel__context-card-instance">
                          <span className="meta">Instance:</span> {ctx.instanceLabel}
                        </div>
                        <div className={`section-settings-panel__context-card-status ${isBound ? 'in-use' : ''}`}>
                          <span className="status-dot"></span> {isBound ? 'In use' : 'Not connected'}
                        </div>
                      </div>
                      
                      <details className="section-settings-panel__context-card-details">
                        <summary>What this context exposes</summary>
                        <div className="section-settings-panel__context-category">
                          <strong>Data fields (3)</strong>
                          <ul>
                            <li>
                              <span className="icon">T</span> <span className="field-name">brand</span> 
                              {allComponents.some(c => c.boundContext === ctx.contextId && c.boundField === 'brand') ? (
                                <span className="tag tag--in-use">In use</span>
                              ) : (
                                <span className="tag tag--add" title="Add component to canvas" onClick={() => onAddComponentFromContext?.(ctx.contextId, 'brand', 'textInput')}>+ Add</span>
                              )}
                            </li>
                            <li>
                              <span className="icon">#</span> <span className="field-name">price</span> 
                              {allComponents.some(c => c.boundContext === ctx.contextId && c.boundField === 'price') ? (
                                <span className="tag tag--in-use">In use</span>
                              ) : (
                                <span className="tag tag--add" title="Add component to canvas" onClick={() => onAddComponentFromContext?.(ctx.contextId, 'price', 'textInput')}>+ Add</span>
                              )}
                            </li>
                            <li>
                              <span className="icon">🖼</span> <span className="field-name">image</span> 
                              {allComponents.some(c => c.boundContext === ctx.contextId && c.boundField === 'image') ? (
                                <span className="tag tag--in-use">In use</span>
                              ) : (
                                <span className="tag tag--add" title="Add component to canvas" onClick={() => onAddComponentFromContext?.(ctx.contextId, 'image', 'image')}>+ Add</span>
                              )}
                            </li>
                          </ul>
                        </div>
                        <div className="section-settings-panel__context-category">
                          <strong>Actions (2)</strong>
                          <ul>
                            <li>
                              <span className="icon">⚡</span> <span className="field-name">updateCurrentItem</span> 
                              {allComponents.some(c => c.boundContext === ctx.contextId && c.role === 'update') ? (
                                <span className="tag tag--in-use">In use</span>
                              ) : (
                                <span className="tag tag--add" title="Add component to canvas" onClick={() => onAddComponentFromContext?.(ctx.contextId, 'updateCurrentItem', 'button')}>+ Add</span>
                              )}
                            </li>
                            <li>
                              <span className="icon">⚡</span> <span className="field-name">setFilter</span> 
                              {allComponents.some(c => c.boundContext === ctx.contextId && c.role === 'filter') ? (
                                <span className="tag tag--in-use">In use</span>
                              ) : (
                                <span className="tag tag--add" title="Add component to canvas" onClick={() => onAddComponentFromContext?.(ctx.contextId, 'setFilter', 'dropdown')}>+ Add</span>
                              )}
                            </li>
                          </ul>
                        </div>
                      </details>

                      <div className="section-settings-panel__context-card-actions">
                        {onOpenContextInstanceSettings && (
                          <button
                            type="button"
                            className="repeater-settings-panel__btn-text"
                            onClick={() => onOpenContextInstanceSettings(ctx.contextId)}
                            aria-label="Edit context instance settings"
                          >
                            Edit
                          </button>
                        )}
                        {onDisconnectContext && (
                          <button
                            type="button"
                            className="repeater-settings-panel__btn-text section-settings-panel__context-card-delete"
                            onClick={() => onDisconnectContext(ctx.contextId)}
                            aria-label="Disconnect context"
                          >
                            Delete
                          </button>
                        )}
                        {onOpenConnectModal && !onOpenContextInstanceSettings && (
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
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="section-settings-panel__context-empty">No context attached.</p>
              )}
              {onOpenConnectModal && (
                <button
                  type="button"
                  className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                  onClick={onOpenConnectModal}
                  aria-label={attachedContexts.length > 0 ? 'Add another context' : 'Add context'}
                >
                  <ConnectIcon />
                  {attachedContexts.length > 0 ? 'Add another context' : 'Add context'}
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
