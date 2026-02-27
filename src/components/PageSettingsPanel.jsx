import { useState } from 'react';
import './PageSettingsPanel.css';
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
 * Settings panel when the Page is selected. Design + Settings tabs.
 * Settings tab: list of attached contexts (card per context with provider, instance, filter, sort, items per load; Edit/Delete), Add context button.
 * Edit opens ContextInstanceSettingsModal for that instance.
 * attachedContexts: array of { contextId, label, instanceLabel, settings, sortSummary }. If provided, used; else built from single-context props.
 */
export function PageSettingsPanel({
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
}) {
  const [activeTab, setActiveTab] = useState('settings');
  const singleSettings = contextSettings ?? { pageLoad: 4, filterRules: [], sortOption: 'default' };
  const attachedContexts = Array.isArray(attachedContextsProp) && attachedContextsProp.length > 0
    ? attachedContextsProp
    : (selectedContextId
      ? [{ contextId: selectedContextId, label: contextLabel ?? '—', instanceLabel: contextInstanceLabel ?? null, settings: singleSettings, sortSummary: sortSummary ?? 'Default' }]
      : []);

  return (
    <div className="page-settings-panel">
      <div className="page-settings-panel__header">
        <h2 className="page-settings-panel__title">Page</h2>
        {onClose && (
          <button type="button" className="page-settings-panel__close" onClick={onClose} aria-label="Close">×</button>
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
      <div className="page-settings-panel__body">
        {activeTab === 'design' && (
          <p className="repeater-settings-panel__placeholder">Design options for this page will appear here.</p>
        )}
        {activeTab === 'settings' && (
          <>
            <section className="repeater-settings-panel__section" aria-labelledby="page-contexts-heading">
              <h3 id="page-contexts-heading" className="repeater-settings-panel__section-title">Attached contexts</h3>
              {attachedContexts.length > 0 ? (
                <ul className="page-settings-panel__context-list">
                  {attachedContexts.map((ctx) => {
                    const cardFilterSummary = (ctx.settings?.filterRules?.length ?? 0) > 0
                      ? `${ctx.settings.filterRules.length} rule${ctx.settings.filterRules.length === 1 ? '' : 's'}`
                      : 'None';
                    return (
                    <li key={ctx.contextId} className="page-settings-panel__context-item page-settings-panel__context-item--card">
                      <div className="page-settings-panel__context-card-content">
                        <div className="page-settings-panel__context-card-line">
                          <span className="page-settings-panel__context-card-meta">Context provider:</span>
                          <span className="page-settings-panel__context-card-value">{ctx.label}</span>
                        </div>
                        <div className="page-settings-panel__context-card-line">
                          <span className="page-settings-panel__context-card-meta">Content instance:</span>
                          <span className="page-settings-panel__context-card-value">{ctx.instanceLabel ?? '—'}</span>
                        </div>
                        <div className="page-settings-panel__context-card-line">
                          <span className="page-settings-panel__context-card-meta">Filter:</span>
                          <span className="page-settings-panel__context-card-value">{cardFilterSummary}</span>
                        </div>
                        <div className="page-settings-panel__context-card-line">
                          <span className="page-settings-panel__context-card-meta">Sort:</span>
                          <span className="page-settings-panel__context-card-value">{ctx.sortSummary}</span>
                        </div>
                        <div className="page-settings-panel__context-card-line">
                          <span className="page-settings-panel__context-card-meta">Items per load:</span>
                          <span className="page-settings-panel__context-card-value">{ctx.settings?.pageLoad ?? 4}</span>
                        </div>
                      </div>
                      <div className="page-settings-panel__context-card-actions">
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
                            className="repeater-settings-panel__btn-text page-settings-panel__context-card-delete"
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
                <p className="page-settings-panel__context-empty">No context attached.</p>
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
