import { useState, useEffect } from 'react';
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

/** Default array field options when context has items (e.g. "Items"). */
const DEFAULT_ARRAY_OPTIONS = [{ value: 'items', label: 'Items' }];

/**
 * Repeater Settings panel.
 * variant="harmony": original layout – "Repeater Settings" title, Display items from, Load more, Items per load.
 * variant="studio": tabbed layout – Select context, Repeater items connect to, Pagination (Harmony-style), Filter, Sort.
 */
export function RepeaterSettingsPanel({
  availableContexts = [],
  assignedContextId,
  onSelectContext,
  onOpenConnectModal,
  onClose,
  contextLabel,
  hasContext,
  totalItems = 0,
  pageLoad: initialPageLoad = 4,
  onPageLoadChange,
  loadMoreEnabled: controlledLoadMore,
  onLoadMoreChange,
  onOpenFilter,
  filterRules = [],
  sortOption = 'default',
  onSortChange,
  variant = 'studio',
  /** For studio: "Repeater items connect to" dropdown value (e.g. 'items'). */
  itemsConnectTo = 'items',
  /** For studio: called when user changes the "Repeater items connect to" selection. */
  onItemsConnectToChange,
  /** For studio: options for the "Repeater items connect to" dropdown (array-type fields). */
  arrayFieldOptions = DEFAULT_ARRAY_OPTIONS,
}) {
  const [activeTab, setActiveTab] = useState('settings');
  const [loadMoreLocal, setLoadMoreLocal] = useState(true);
  const [itemsPerLoadLocal, setItemsPerLoadLocal] = useState(initialPageLoad);
  const [loadMoreMessageDismissed, setLoadMoreMessageDismissed] = useState(false);
  const [sortExpanded, setSortExpanded] = useState(false);

  const loadMoreOn = controlledLoadMore !== undefined ? controlledLoadMore : loadMoreLocal;

  useEffect(() => {
    if (loadMoreOn) setLoadMoreMessageDismissed(false);
  }, [loadMoreOn]);
  const setLoadMore = onLoadMoreChange ?? (() => setLoadMoreLocal((v) => !v));
  const itemsPerLoad = onPageLoadChange ? initialPageLoad : itemsPerLoadLocal;
  const setItemsPerLoad = onPageLoadChange
    ? (v) => onPageLoadChange(Math.max(1, Math.min(100, Number(v) || 1)))
    : (v) => setItemsPerLoadLocal(Math.max(1, Math.min(100, Number(v) || 1)));

  if (variant === 'harmony') {
    return (
      <div className="repeater-settings-panel">
        <div className="repeater-settings-panel__header">
          <h2 className="repeater-settings-panel__title">Repeater settings</h2>
          <div className="repeater-settings-panel__header-actions">
            <button type="button" className="repeater-settings-panel__icon-btn" aria-label="Help">?</button>
            <button type="button" className="repeater-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <div className="repeater-settings-panel__body">
          <div className="repeater-settings-panel__row repeater-settings-panel__row--display">
            <span className="repeater-settings-panel__row-label">Display items from</span>
            <div className="repeater-settings-panel__display-wrap">
              {hasContext ? (
                <>
                  <span className="repeater-settings-panel__display-value">{contextLabel}</span>
                  {onOpenConnectModal && (
                    <button type="button" className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect" onClick={onOpenConnectModal} aria-label="Replace context">
                      <ConnectIcon />
                      Replace
                    </button>
                  )}
                </>
              ) : (
                <select
                  className="repeater-settings-panel__select"
                  value={assignedContextId ?? ''}
                  onChange={(e) => onSelectContext?.(e.target.value || null)}
                >
                  <option value="">Select context</option>
                  {availableContexts.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>{ctx.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {hasContext && (
            <>
              <div className="repeater-settings-panel__row repeater-settings-panel__row--toggle">
                <span className="repeater-settings-panel__row-label">
                  &apos;Load more&apos; button
                  <button type="button" className="repeater-settings-panel__info" aria-label="Info">ⓘ</button>
                </span>
                <button
                  type="button"
                  className={`repeater-settings-panel__toggle ${loadMoreOn ? 'repeater-settings-panel__toggle--on' : ''}`}
                  onClick={() => setLoadMore(!loadMoreOn)}
                  role="switch"
                  aria-checked={loadMoreOn}
                >
                  <span className="repeater-settings-panel__toggle-thumb" />
                </button>
              </div>
              {!loadMoreOn && !loadMoreMessageDismissed && (
                <div className="repeater-settings-panel__message" role="status">
                  <span className="repeater-settings-panel__message-icon" aria-hidden>ⓘ</span>
                  <p className="repeater-settings-panel__message-text">
                    To display more than 100 items in your repeater, add the &apos;Load more&apos; button. This limit helps your site stay fast.
                  </p>
                  <button type="button" className="repeater-settings-panel__message-dismiss" onClick={() => setLoadMoreMessageDismissed(true)} aria-label="Dismiss">×</button>
                </div>
              )}
              <div className="repeater-settings-panel__row repeater-settings-panel__row--slider">
                <span className="repeater-settings-panel__row-label">Items per load</span>
                <div className="repeater-settings-panel__slider-wrap">
                  <input type="range" className="repeater-settings-panel__slider" min={1} max={100} value={itemsPerLoad} onChange={(e) => setItemsPerLoad(Number(e.target.value))} />
                  <input type="number" className="repeater-settings-panel__number" min={1} max={100} value={itemsPerLoad} onChange={(e) => setItemsPerLoad(e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="repeater-settings-panel">
      <div className="repeater-settings-panel__header">
        <h2 className="repeater-settings-panel__title">Container</h2>
        <div className="repeater-settings-panel__header-actions">
          <button type="button" className="repeater-settings-panel__icon-btn" aria-label="Help">?</button>
          <button type="button" className="repeater-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
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

      <div className="repeater-settings-panel__body">
        {activeTab === 'design' && (
          <p className="repeater-settings-panel__placeholder">Design options for this container will appear here.</p>
        )}

        {activeTab === 'settings' && (
          <>
            {!hasContext && (
              <p className="repeater-settings-panel__intro">Repeater items display the List of Arrays.</p>
            )}
            <div className="repeater-settings-panel__row repeater-settings-panel__row--display">
              <label className="repeater-settings-panel__row-label">
                {hasContext ? 'Select context' : 'Available contexts'}
              </label>
              <div className="repeater-settings-panel__display-wrap">
                {hasContext ? (
                  <>
                    <span className="repeater-settings-panel__display-value">{contextLabel}</span>
                    {onOpenConnectModal && (
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
                  </>
                ) : (
                  <>
                    <select
                      className="repeater-settings-panel__select"
                      value={assignedContextId ?? ''}
                      onChange={(e) => onSelectContext?.(e.target.value || null)}
                    >
                      <option value="">
                        {availableContexts.length === 0
                          ? 'No context on page — connect page or section first'
                          : 'Select context'}
                      </option>
                      {availableContexts.map((ctx) => (
                        <option key={ctx.id} value={ctx.id}>{ctx.label}</option>
                      ))}
                    </select>
                    {availableContexts.length === 0 && (
                      <p className="repeater-settings-panel__hint">Connect the page or a section to a context to make it available here.</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {hasContext && (
              <>
                <div className="repeater-settings-panel__row">
                  <label className="repeater-settings-panel__row-label">Repeater items connect to</label>
                  <select
                    className="repeater-settings-panel__select"
                    value={itemsConnectTo ?? 'items'}
                    onChange={(e) => onItemsConnectToChange?.(e.target.value)}
                  >
                    {arrayFieldOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="repeater-settings-panel__row repeater-settings-panel__row--toggle">
                  <span className="repeater-settings-panel__row-label">
                    &apos;Load more&apos; button
                    <button type="button" className="repeater-settings-panel__info" aria-label="Info">ⓘ</button>
                  </span>
                  <button
                    type="button"
                    className={`repeater-settings-panel__toggle ${loadMoreOn ? 'repeater-settings-panel__toggle--on' : ''}`}
                    onClick={() => setLoadMore(!loadMoreOn)}
                    role="switch"
                    aria-checked={loadMoreOn}
                  >
                    <span className="repeater-settings-panel__toggle-thumb" />
                  </button>
                </div>
                {!loadMoreOn && !loadMoreMessageDismissed && (
                  <div className="repeater-settings-panel__message" role="status">
                    <span className="repeater-settings-panel__message-icon" aria-hidden>ⓘ</span>
                    <p className="repeater-settings-panel__message-text">
                      To display more than 100 items in your repeater, add the &apos;Load more&apos; button. This limit helps your site stay fast.
                    </p>
                    <button type="button" className="repeater-settings-panel__message-dismiss" onClick={() => setLoadMoreMessageDismissed(true)} aria-label="Dismiss">×</button>
                  </div>
                )}
                <div className="repeater-settings-panel__row repeater-settings-panel__row--slider">
                  <span className="repeater-settings-panel__row-label">Items per load</span>
                  <div className="repeater-settings-panel__slider-wrap">
                    <input type="range" className="repeater-settings-panel__slider" min={1} max={100} value={itemsPerLoad} onChange={(e) => setItemsPerLoad(Number(e.target.value))} />
                    <input type="number" className="repeater-settings-panel__number" min={1} max={100} value={itemsPerLoad} onChange={(e) => setItemsPerLoad(e.target.value)} />
                  </div>
                </div>

                <div className="repeater-settings-panel__row">
                  <label className="repeater-settings-panel__row-label">Filter</label>
                  <button
                    type="button"
                    className="repeater-settings-panel__btn-text"
                    onClick={() => onOpenFilter?.()}
                  >
                    {filterRules?.length ? `Edit filter (${filterRules.length} rule${filterRules.length === 1 ? '' : 's'})` : 'Add filter'}
                  </button>
                </div>

                <div className="repeater-settings-panel__row">
                  <label className="repeater-settings-panel__row-label">Sort</label>
                  <select
                    className="repeater-settings-panel__select"
                    value={sortOption ?? 'default'}
                    onChange={(e) => onSortChange?.(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="name">Name A–Z</option>
                    <option value="nameDesc">Name Z–A</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
