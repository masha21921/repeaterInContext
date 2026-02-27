import { useState, useMemo, useEffect } from 'react';
import { connectContextCategories, availableContexts } from '../data/demoData';
import './ConnectContextModal.css';

/**
 * Connect Context modal: "Connect this page to a context..." with search, categories (CMS, Wix Stores, System, Custom), checkboxes, Cancel/Add.
 * Used in Studio when Connect is clicked (page, section, or repeater).
 * When allowedContextsWithInstances is provided (repeater Select context), show "Available on this page" with instance labels, then "Add context" with all contexts.
 */
export function ConnectContextModal({
  isOpen,
  onClose,
  onConnect,
  /** Target passed from parent so the callback applies to the correct scope (page/section/component). */
  connectTarget = null,
  targetLabel = 'this page',
  /** When set (e.g. for repeater Replace), only show these context ids (contexts already connected to page/section). */
  allowedContextIds,
  /** For repeater: list of { contextId, label, instanceLabel } from parent (page/section). Shown as "Available on this page" with instance labels. */
  allowedContextsWithInstances,
  /** When true (with allowedContextsWithInstances), show "Add context" section with all contexts; on select use addContextTarget for onConnect. */
  allowAddContext,
  /** Target to pass to onConnect when user selects from "Add context" (e.g. connect section then repeater). */
  addContextTarget,
  /** Current selection: context id already connected to the target (page/section/repeater). When the modal opens, this option is pre-selected. */
  selectedContextId = null,
  /** When adding context to page/section: ids already attached so we can disable them (add another = pick one not yet added). */
  attachedContextIds,
  /** For repeaters with design preset: suggest this context id (e.g. "services", "bookends") – CMS context with topic matching the preset. */
  suggestedContextIdForPreset = null,
  /** Context ids that are already in use on the page (page + sections + repeater-assigned). When user connects a preset repeater to e.g. Services, that context is "created" and appears in the CMS list for other connect flows. */
  createdContextIds = [],
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null); // 'available' | 'add'
  const [search, setSearch] = useState('');
  const [expandedAdd, setExpandedAdd] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(() =>
    connectContextCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const isRepeaterModeForEffect = Array.isArray(allowedContextsWithInstances);
  const availableContextIdsSet = useMemo(
    () => (isRepeaterModeForEffect && allowedContextsWithInstances?.length > 0
      ? new Set(allowedContextsWithInstances.map((a) => a.contextId))
      : null),
    [isRepeaterModeForEffect, allowedContextsWithInstances]
  );

  const attachedSetForEffect = useMemo(
    () => (Array.isArray(attachedContextIds) && attachedContextIds.length > 0 ? new Set(attachedContextIds) : null),
    [attachedContextIds]
  );

  const allowedSet = useMemo(
    () => (allowedContextIds && allowedContextIds.length > 0 ? new Set(allowedContextIds) : null),
    [allowedContextIds]
  );
  const isRepeaterMode = Array.isArray(allowedContextsWithInstances);
  const availableIds = useMemo(
    () =>
      isRepeaterMode
        ? new Set(availableContexts.map((c) => c.id))
        : allowedSet != null
          ? allowedSet
          : new Set(availableContexts.map((c) => c.id)),
    [allowedSet, isRepeaterMode]
  );

  useEffect(() => {
    if (isOpen) {
      if (selectedContextId != null && selectedContextId !== '') {
        if (isRepeaterModeForEffect && availableContextIdsSet?.has(selectedContextId)) {
          setSelectedId(selectedContextId);
          setSelectedSource('available');
        } else if (!isRepeaterModeForEffect) {
          if (attachedSetForEffect?.has(selectedContextId)) {
            setSelectedId(null);
            setSelectedSource(null);
          } else {
            setSelectedId(selectedContextId);
            setSelectedSource(null);
          }
        } else {
          setSelectedId(null);
          setSelectedSource(null);
        }
      } else if (suggestedContextIdForPreset && availableIds.has(suggestedContextIdForPreset)) {
        setSelectedId(suggestedContextIdForPreset);
        setSelectedSource('add');
        setExpandedAdd(true);
      } else {
        setSelectedId(null);
        setSelectedSource(null);
      }
      setSearch('');
      if (!suggestedContextIdForPreset) setExpandedAdd(false);
    }
  }, [isOpen, connectTarget, selectedContextId, isRepeaterModeForEffect, availableContextIdsSet, attachedSetForEffect, suggestedContextIdForPreset, availableIds]);

  const parentAvailableIds = useMemo(
    () => (isRepeaterMode && allowedContextsWithInstances.length > 0 ? new Set(allowedContextsWithInstances.map((a) => a.contextId)) : null),
    [isRepeaterMode, allowedContextsWithInstances]
  );

  const attachedSet = useMemo(
    () => (Array.isArray(attachedContextIds) && attachedContextIds.length > 0 ? new Set(attachedContextIds) : null),
    [attachedContextIds]
  );

  const suggestedContext = useMemo(() => {
    if (!suggestedContextIdForPreset || !availableContexts?.length) return null;
    const ctx = availableContexts.find((c) => c.id === suggestedContextIdForPreset);
    if (!ctx) return null;
    return ctx;
  }, [suggestedContextIdForPreset, availableContexts]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    const baseCategories = connectContextCategories.map((cat) => {
      if (cat.id !== 'cms' || !createdContextIds?.length) return cat;
      const existingIds = new Set(cat.options.map((o) => o.id));
      const createdOptions = createdContextIds
        .filter((id) => !existingIds.has(id))
        .map((id) => {
          const ctx = availableContexts.find((c) => c.id === id);
          return ctx ? { id: ctx.id, label: ctx.label } : null;
        })
        .filter(Boolean);
      return { ...cat, options: [...cat.options, ...createdOptions] };
    });
    const isDisabled = (opt) => {
      if (!availableIds.has(opt.id)) return true;
      if (attachedSet && attachedSet.has(opt.id)) return true;
      return false;
    };
    const excludePresetContext = (opts) =>
      suggestedContext ? opts.filter((opt) => opt.id !== suggestedContextIdForPreset) : opts;
    let result;
    if (!q)
      result = baseCategories.map((cat) => ({
        ...cat,
        options: excludePresetContext(cat.options).map((opt) => ({ ...opt, disabled: isDisabled(opt) })),
      }));
    else
      result = baseCategories
        .map((cat) => ({
          ...cat,
          options: excludePresetContext(
            cat.options.filter((opt) => opt.label.toLowerCase().includes(q))
          ).map((opt) => ({ ...opt, disabled: isDisabled(opt) })),
        }))
        .filter((cat) => cat.options.length > 0);
    return result.filter((cat) => cat.options.length > 0);
  }, [search, availableIds, attachedSet, suggestedContextIdForPreset, createdContextIds]);

  const canAdd = selectedId && (
    isRepeaterMode
      ? (selectedSource === 'add' ? availableIds.has(selectedId) : (parentAvailableIds?.has(selectedId) ?? false))
      : availableIds.has(selectedId) && (!attachedSet || !attachedSet.has(selectedId))
  );

  if (!isOpen) return null;

  function handleAdd(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!canAdd) return;
    if (isRepeaterMode && selectedSource === 'add' && addContextTarget) {
      onConnect?.(selectedId, addContextTarget);
    } else {
      onConnect?.(selectedId, connectTarget);
    }
    onClose();
  }

  function toggleCategory(catId) {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  function selectAvailable(contextId) {
    setSelectedId(contextId);
    setSelectedSource('available');
  }

  function selectAdd(contextId) {
    setSelectedId(contextId);
    setSelectedSource('add');
  }

  return (
    <div
      className="connect-context-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-context-modal-title"
    >
      <div className="connect-context-modal" onClick={(e) => e.stopPropagation()}>
        <div className="connect-context-modal__header">
          <h2 id="connect-context-modal-title" className="connect-context-modal__title">
            Select context
          </h2>
          <div className="connect-context-modal__header-actions">
            <button type="button" className="connect-context-modal__help" aria-label="Help">?</button>
            <button type="button" className="connect-context-modal__close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <p className="connect-context-modal__subtitle">
          {isRepeaterMode
            ? 'Choose a context from the page or section, or add a new context for this repeater.'
            : `Connect ${targetLabel} to a context to make data and business logic available to all elements inside it.`}
        </p>

        {!isRepeaterMode && (
          <div className="connect-context-modal__search-wrap">
            <span className="connect-context-modal__search-icon" aria-hidden>⌕</span>
            <input
              type="text"
              className="connect-context-modal__search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          </div>
        )}

        <div className="connect-context-modal__body">
          {isRepeaterMode ? (
            <>
              {suggestedContext && (
                <section className="connect-context-modal__section connect-context-modal__section--suggested" aria-labelledby="connect-context-suggested-head">
                  <h3 id="connect-context-suggested-head" className="connect-context-modal__section-title">
                    Suggested for this design
                  </h3>
                  <p className="connect-context-modal__suggested-hint">
                    CMS context with relevant topic for this preset. If you select it, a new CMS collection will be created.
                  </p>
                  <ul className="connect-context-modal__available-list" role="listbox">
                    <li>
                      <label
                        className={`connect-context-modal__option connect-context-modal__option--suggested ${selectedId === suggestedContext.id && selectedSource === 'add' ? 'connect-context-modal__option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="connect-context-suggested"
                          checked={selectedId === suggestedContext.id && selectedSource === 'add'}
                          onChange={() => selectAdd(suggestedContext.id)}
                          className="connect-context-modal__checkbox"
                        />
                        <span className="connect-context-modal__option-label">
                          <span className="connect-context-modal__option-line connect-context-modal__option-line--provider">
                            {suggestedContext.label}{suggestedContext.source ? ` (${suggestedContext.source})` : ''}
                          </span>
                        </span>
                      </label>
                    </li>
                  </ul>
                </section>
              )}
              <section className="connect-context-modal__section" aria-labelledby="connect-context-available-head">
                <h3 id="connect-context-available-head" className="connect-context-modal__section-title">
                  Available from parent level
                </h3>
                {allowedContextsWithInstances.length === 0 ? (
                  <p className="connect-context-modal__empty">
                    No context available. Connect the page or a section to a context first, or add one below.
                  </p>
                ) : (
                  <ul className="connect-context-modal__available-list" role="listbox">
                    {allowedContextsWithInstances.map(({ contextId, label, instanceLabel, source, level }) => (
                      <li key={contextId}>
                        <label
                          className={`connect-context-modal__option ${selectedId === contextId && selectedSource === 'available' ? 'connect-context-modal__option--selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="connect-context-available"
                            checked={selectedId === contextId && selectedSource === 'available'}
                            onChange={() => selectAvailable(contextId)}
                            className="connect-context-modal__checkbox"
                          />
                          <span className="connect-context-modal__option-label">
                            <span className="connect-context-modal__option-line connect-context-modal__option-line--provider">
                              Context provider: {label}{source ? ` (${source})` : ''}
                            </span>
                            <span className="connect-context-modal__option-line connect-context-modal__option-line--instance">
                              Content instance: {instanceLabel ?? '—'}
                            </span>
                            {level != null && (
                              <span className="connect-context-modal__option-level" aria-label={`Level: ${level}`}>
                                {level}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {allowAddContext && (
                <section className="connect-context-modal__section" aria-labelledby="connect-context-add-head">
                  <button
                    type="button"
                    id="connect-context-add-head"
                    className="connect-context-modal__section-head"
                    onClick={() => setExpandedAdd((e) => !e)}
                    aria-expanded={expandedAdd}
                  >
                    <span className="connect-context-modal__category-arrow">{expandedAdd ? '▼' : '▶'}</span>
                    <span className="connect-context-modal__section-title">Add context to the repeater</span>
                  </button>
                  {expandedAdd && (
                    <div className="connect-context-modal__add-body">
                      {filteredCategories.map((cat) => (
                        <div key={cat.id} className="connect-context-modal__category">
                          <button
                            type="button"
                            className="connect-context-modal__category-head"
                            onClick={() => toggleCategory(cat.id)}
                            aria-expanded={expandedCategories[cat.id] !== false}
                          >
                            <span className="connect-context-modal__category-arrow">
                              {expandedCategories[cat.id] !== false ? '▼' : '▶'}
                            </span>
                            <span className="connect-context-modal__category-label">{cat.label}</span>
                          </button>
                          {expandedCategories[cat.id] !== false && (
                            <div className="connect-context-modal__category-options">
                              {cat.options.map((opt) => (
                                <label
                                  key={opt.id}
                                  className={`connect-context-modal__option ${selectedId === opt.id && selectedSource === 'add' ? 'connect-context-modal__option--selected' : ''} ${opt.disabled ? 'connect-context-modal__option--disabled' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name="connect-context-add"
                                    checked={selectedId === opt.id && selectedSource === 'add'}
                                    onChange={() => !opt.disabled && selectAdd(opt.id)}
                                    disabled={opt.disabled}
                                    className="connect-context-modal__checkbox"
                                  />
                                  <span className="connect-context-modal__option-label">{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          ) : allowedSet != null && allowedSet.size === 0 ? (
            <p className="connect-context-modal__empty">
              No context available on the page. Connect the page or a section to a context first.
            </p>
          ) : (
            filteredCategories
              .filter((cat) => !allowedSet || cat.options.some((opt) => allowedSet.has(opt.id)))
              .map((cat) => ({
                ...cat,
                options: allowedSet ? cat.options.filter((opt) => allowedSet.has(opt.id)) : cat.options,
              }))
              .filter((cat) => cat.options.length > 0)
              .map((cat) => (
                <div key={cat.id} className="connect-context-modal__category">
                  <button
                    type="button"
                    className="connect-context-modal__category-head"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={expandedCategories[cat.id] !== false}
                  >
                    <span className="connect-context-modal__category-arrow">
                      {expandedCategories[cat.id] !== false ? '▼' : '▶'}
                    </span>
                    <span className="connect-context-modal__category-label">{cat.label}</span>
                    <span className="connect-context-modal__category-add" aria-hidden>+</span>
                  </button>
                  {expandedCategories[cat.id] !== false && (
                    <div className="connect-context-modal__category-options">
                      {cat.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`connect-context-modal__option ${selectedId === opt.id ? 'connect-context-modal__option--selected' : ''} ${opt.disabled ? 'connect-context-modal__option--disabled' : ''}`}
                        >
                          <input
                            type="radio"
                            name="connect-context"
                            checked={selectedId === opt.id}
                            onChange={() => !opt.disabled && (setSelectedId(opt.id), setSelectedSource(null))}
                            disabled={opt.disabled}
                            className="connect-context-modal__checkbox"
                          />
                          <span className="connect-context-modal__option-label">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        <div className="connect-context-modal__footer">
          {isRepeaterMode && selectedContextId && (
            <button
              type="button"
              className="connect-context-modal__disconnect"
              onClick={() => {
                onConnect?.(null, connectTarget);
                onClose();
              }}
            >
              Disconnect
            </button>
          )}
          <button type="button" className="connect-context-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="connect-context-modal__add"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {isRepeaterMode && selectedSource === 'add' ? 'Add & select' : (attachedSet ? 'Add' : 'Select')}
          </button>
        </div>
      </div>
    </div>
  );
}
