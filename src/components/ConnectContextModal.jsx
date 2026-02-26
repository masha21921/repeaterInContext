import { useState, useMemo } from 'react';
import { connectContextCategories, availableContexts } from '../data/demoData';
import './ConnectContextModal.css';

/**
 * Connect Context modal: "Connect this page to a context..." with search, categories (CMS, Wix Stores, System, Custom), checkboxes, Cancel/Add.
 * Used in Studio when Connect is clicked (page, section, or repeater).
 * When allowedContextIds is provided (e.g. for repeater Replace), only contexts in that list are shown (contexts "on the page").
 */
export function ConnectContextModal({
  isOpen,
  onClose,
  onConnect,
  targetLabel = 'this page',
  /** When set (e.g. for repeater Replace), only show these context ids (contexts already connected to page/section). */
  allowedContextIds,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(() =>
    connectContextCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const allowedSet = useMemo(
    () => (allowedContextIds && allowedContextIds.length > 0 ? new Set(allowedContextIds) : null),
    [allowedContextIds]
  );
  const availableIds = useMemo(
    () => (allowedSet != null ? allowedSet : new Set(availableContexts.map((c) => c.id))),
    [allowedSet]
  );

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    const baseCategories =
      allowedSet != null
        ? connectContextCategories
            .map((cat) => ({
              ...cat,
              options: cat.options.filter((opt) => allowedSet.has(opt.id)),
            }))
            .filter((cat) => cat.options.length > 0)
        : connectContextCategories;
    if (!q)
      return baseCategories.map((cat) => ({
        ...cat,
        options: cat.options.map((opt) => ({ ...opt, disabled: !availableIds.has(opt.id) })),
      }));
    return baseCategories
      .map((cat) => ({
        ...cat,
        options: cat.options
          .filter((opt) => opt.label.toLowerCase().includes(q))
          .map((opt) => ({ ...opt, disabled: !availableIds.has(opt.id) })),
      }))
      .filter((cat) => cat.options.length > 0);
  }, [search, availableIds, allowedSet]);

  const canAdd = selectedId && availableIds.has(selectedId);

  if (!isOpen) return null;

  function handleAdd() {
    if (canAdd) onConnect?.(selectedId);
    onClose();
  }

  function toggleCategory(catId) {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
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
            Connect Context
          </h2>
          <div className="connect-context-modal__header-actions">
            <button type="button" className="connect-context-modal__help" aria-label="Help">?</button>
            <button type="button" className="connect-context-modal__close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <p className="connect-context-modal__subtitle">
          Connect {targetLabel} to a context to make data and business logic available to all elements inside it.
        </p>

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

        <div className="connect-context-modal__body">
          {allowedSet != null && allowedSet.size === 0 ? (
            <p className="connect-context-modal__empty">
              No context available on the page. Connect the page or a section to a context first.
            </p>
          ) : (
          filteredCategories.map((cat) => (
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
                        onChange={() => !opt.disabled && setSelectedId(opt.id)}
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
          <button type="button" className="connect-context-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="connect-context-modal__add"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
