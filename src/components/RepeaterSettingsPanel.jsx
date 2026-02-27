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

/** Display source groups: List of items (main collection), Array fields (tags/media), Function. */
const DISPLAY_OPTION_GROUPS = [
  { group: 'List of items', options: [{ value: 'items', label: null }] },
  { group: 'Array fields', options: [{ value: 'tags', label: 'Tags' }, { value: 'media', label: 'Media gallery' }] },
  { group: 'Function', options: [{ value: 'function', label: 'Function' }] },
];

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
  /** For studio: "What to display" value (e.g. 'items', 'tags', 'media', 'function'). */
  itemsConnectTo = 'items',
  /** For studio: called when user changes the display source. */
  onItemsConnectToChange,
  /** For studio: show Load more button on repeater (repeater-only, not context). */
  loadMoreEnabled: studioLoadMoreEnabled = true,
  /** For studio: called when user toggles Load more. */
  onLoadMoreChange: onStudioLoadMoreChange,
  /** For studio: read-only context settings (items per load, filter, sort) from the selected context. */
  contextSettingsReadOnly = null,
  /** For studio: where the context is defined — 'page' | sectionId — for "Edit in Page/Section settings" (fallback). */
  contextSource = null,
  /** For studio: open the context settings (Page or Section panel) to edit items per load, filter, sort. */
  onOpenContextSettings,
  /** For studio: open the context instance settings modal (edits this instance only; preferred over onOpenContextSettings). */
  onOpenContextInstanceSettings,
  /** For studio: label of the context instance (e.g. "Team 2") shown in the edit button area. */
  contextInstanceLabel = null,
}) {
  const [activeTab, setActiveTab] = useState('settings');
  const [loadMoreMessageDismissed, setLoadMoreMessageDismissed] = useState(false);
  const [loadMoreLocal, setLoadMoreLocal] = useState(true);
  const [itemsPerLoadLocal, setItemsPerLoadLocal] = useState(initialPageLoad);
  const [sortExpanded, setSortExpanded] = useState(false);

  const loadMoreOn = controlledLoadMore !== undefined ? controlledLoadMore : loadMoreLocal;
  const setLoadMore = onLoadMoreChange ?? (() => setLoadMoreLocal((v) => !v));
  const itemsPerLoad = onPageLoadChange ? initialPageLoad : itemsPerLoadLocal;
  const setItemsPerLoad = onPageLoadChange
    ? (v) => onPageLoadChange(Math.max(1, Math.min(100, Number(v) || 1)))
    : (v) => setItemsPerLoadLocal(Math.max(1, Math.min(100, Number(v) || 1)));

  useEffect(() => {
    if (loadMoreOn) setLoadMoreMessageDismissed(false);
  }, [loadMoreOn]);

  const loadMoreOnStudio = studioLoadMoreEnabled !== false;
  const setLoadMoreStudio = onStudioLoadMoreChange ?? (() => {});

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
                  <input
                    type="text"
                    className="repeater-settings-panel__display-input"
                    value={[contextLabel, contextInstanceLabel].filter(Boolean).join(' — ') || '—'}
                    readOnly
                    aria-label="Context provider and content instance"
                  />
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
        <h2 className="repeater-settings-panel__title">Repeater</h2>
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
            <section className="repeater-settings-panel__section" aria-labelledby="repeater-display-section">
              <h3 id="repeater-display-section" className="repeater-settings-panel__section-title">
                What repeater will display
              </h3>
              <div className="repeater-settings-panel__row repeater-settings-panel__row--display">
                <label className="repeater-settings-panel__row-label">Select the context</label>
                <div className="repeater-settings-panel__display-wrap">
                  {hasContext ? (
                    <>
                      <input
                        type="text"
                        className="repeater-settings-panel__display-input"
                        value={[contextLabel ?? '—', contextInstanceLabel].filter(Boolean).join(' — ') || '—'}
                        readOnly
                        aria-label="Context provider and content instance"
                      />
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
                      {onOpenConnectModal && (
                        <button
                          type="button"
                          className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--connect"
                          onClick={onOpenConnectModal}
                          aria-label="Connect to context"
                        >
                          <ConnectIcon />
                          Connect
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {hasContext && (
                <div className="repeater-settings-panel__row">
                  <label className="repeater-settings-panel__row-label">Display</label>
                  <select
                    className="repeater-settings-panel__select"
                    value={itemsConnectTo ?? 'items'}
                    onChange={(e) => onItemsConnectToChange?.(e.target.value)}
                    aria-describedby="repeater-display-description"
                  >
                    {DISPLAY_OPTION_GROUPS.map(({ group, options }) => (
                      <optgroup key={group} label={group}>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label ?? `Items (${contextLabel || 'Collection'})`}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p id="repeater-display-description" className="repeater-settings-panel__hint" style={{ marginTop: 6 }}>
                    List of items = main collection. Array fields = Tags or Media gallery. Function = custom/section.
                  </p>
                </div>
              )}
            </section>

            {hasContext && itemsConnectTo !== 'function' && (
            <section className="repeater-settings-panel__section" aria-labelledby="repeater-context-settings-section">
              <h3 id="repeater-context-settings-section" className="repeater-settings-panel__section-title">Pagination, filter & sort</h3>
              {itemsConnectTo !== 'tags' && itemsConnectTo !== 'media' && (
                <>
                  <div className="repeater-settings-panel__row repeater-settings-panel__row--toggle">
                    <span className="repeater-settings-panel__row-label">
                      &apos;Load more&apos; button
                      <button type="button" className="repeater-settings-panel__info" aria-label="Info">ⓘ</button>
                    </span>
                    <button
                      type="button"
                      className={`repeater-settings-panel__toggle ${loadMoreOnStudio ? 'repeater-settings-panel__toggle--on' : ''}`}
                      onClick={() => setLoadMoreStudio(!loadMoreOnStudio)}
                      role="switch"
                      aria-checked={loadMoreOnStudio}
                    >
                      <span className="repeater-settings-panel__toggle-thumb" />
                    </button>
                  </div>
                  {!loadMoreOnStudio && !loadMoreMessageDismissed && (
                    <div className="repeater-settings-panel__message" role="status">
                      <span className="repeater-settings-panel__message-icon" aria-hidden>ⓘ</span>
                      <p className="repeater-settings-panel__message-text">
                        To display more than 100 items in your repeater, add the &apos;Load more&apos; button. This limit helps your site stay fast.
                      </p>
                      <button type="button" className="repeater-settings-panel__message-dismiss" onClick={() => setLoadMoreMessageDismissed(true)} aria-label="Dismiss">×</button>
                    </div>
                  )}
                </>
              )}
              {(itemsConnectTo === 'tags' || itemsConnectTo === 'media') ? (
                <div className="repeater-settings-panel__context-readonly repeater-settings-panel__context-readonly--empty">
                  <p className="repeater-settings-panel__context-readonly-text">
                    Filter and sort for {itemsConnectTo === 'tags' ? 'Tags' : 'Media gallery'} are not configured here.{' '}
                    <button
                      type="button"
                      className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--inline"
                      onClick={onOpenContextInstanceSettings}
                      aria-label="Add function to apply filter or sort"
                    >
                      Add function to apply filter or sort
                    </button>
                  </p>
                </div>
              ) : contextSettingsReadOnly && (onOpenContextInstanceSettings || (contextSource && onOpenContextSettings)) ? (
                <div className="repeater-settings-panel__context-readonly">
                  <dl className="repeater-settings-panel__context-dl">
                    <div className="repeater-settings-panel__context-dl-row">
                      <dt className="repeater-settings-panel__context-dt">Items per load</dt>
                      <dd className="repeater-settings-panel__context-dd">{contextSettingsReadOnly.pageLoad ?? 4}</dd>
                    </div>
                    <div className="repeater-settings-panel__context-dl-row">
                      <dt className="repeater-settings-panel__context-dt">Filter</dt>
                      <dd className="repeater-settings-panel__context-dd">
                        {(contextSettingsReadOnly.filterRules?.length ?? 0) > 0
                          ? `${contextSettingsReadOnly.filterRules.length} rule${contextSettingsReadOnly.filterRules.length === 1 ? '' : 's'}`
                          : 'None'}
                      </dd>
                    </div>
                    <div className="repeater-settings-panel__context-dl-row">
                      <dt className="repeater-settings-panel__context-dt">Sort</dt>
                      <dd className="repeater-settings-panel__context-dd">
                        {contextSettingsReadOnly.sortSummary ?? (contextSettingsReadOnly.sortRules?.length ? 'Custom sort' : 'Default')}
                      </dd>
                    </div>
                  </dl>
                  {onOpenContextInstanceSettings ? (
                    <button
                      type="button"
                      className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--edit"
                      onClick={onOpenContextInstanceSettings}
                      aria-label="Edit context instance settings"
                    >
                      Edit context instance{contextInstanceLabel ? ` (${contextInstanceLabel})` : ''}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--edit"
                      onClick={() => onOpenContextSettings(contextSource)}
                      aria-label={`Edit in ${contextSource === 'page' ? 'Page' : 'Section'} settings`}
                    >
                      Edit in {contextSource === 'page' ? 'Page' : 'Section'} settings
                    </button>
                  )}
                </div>
              ) : (
                <div className="repeater-settings-panel__context-readonly repeater-settings-panel__context-readonly--empty">
                  <p className="repeater-settings-panel__context-readonly-text">
                    Context settings (items per load, filter, sort) are managed per context instance.
                  </p>
                  {onOpenContextInstanceSettings && (
                    <button
                      type="button"
                      className="repeater-settings-panel__btn-text repeater-settings-panel__btn-text--edit"
                      onClick={onOpenContextInstanceSettings}
                      aria-label="Edit context instance settings"
                    >
                      Edit context instance{contextInstanceLabel ? ` (${contextInstanceLabel})` : ''}
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
          </>
        )}
      </div>
    </div>
  );
}
