import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { defaultSortRules } from '../data/demoData';
import './SortModal.css';

/**
 * Sort modal: define sort rules (field + direction) like the Filter modal.
 * Default: Date created, New → Old (desc).
 */
export function SortModal({
  isOpen,
  onClose,
  sortRules = [],
  onApply,
  availableFields = [],
}) {
  const getDefaultRules = () =>
    availableFields.length > 0
      ? [{ fieldId: availableFields[0].id, direction: 'desc' }]
      : defaultSortRules;
  const [rules, setRules] = useState(() =>
    (sortRules?.length ? sortRules.map((r) => ({ ...r })) : getDefaultRules())
  );

  useEffect(() => {
    if (!isOpen) return;
    const initial = sortRules?.length
      ? sortRules.map((r) => ({ ...r }))
      : getDefaultRules();
    setRules(initial);
  }, [isOpen, sortRules]);

  if (!isOpen) return null;

  const addRule = () => {
    const firstFieldId = availableFields[0]?.id ?? 'dateCreated';
    setRules((prev) => [...prev, { fieldId: firstFieldId, direction: 'asc' }]);
  };

  const removeRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index, key, value) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const handleApply = () => {
    onApply?.(rules);
    onClose?.();
  };

  const modalContent = (
    <div
      className="sort-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-modal-title"
    >
      <div className="sort-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sort-modal__header">
          <div>
            <h2 id="sort-modal-title" className="sort-modal__title">
              Sort
            </h2>
            <p className="sort-modal__desc">
              Choose which order items are shown in this repeater by adding sorts.
            </p>
          </div>
          <div className="sort-modal__header-actions">
            <button type="button" className="sort-modal__icon-btn" aria-label="Help">?</button>
            <button type="button" className="sort-modal__icon-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="sort-modal__body">
          <div className="sort-modal__rules">
            {rules.map((rule, index) => (
              <div key={index} className="sort-modal__rule">
                <div className="sort-modal__field-wrap">
                  <label className="sort-modal__label">Field</label>
                  <select
                    className="sort-modal__select"
                    value={rule.fieldId ?? availableFields[0]?.id}
                    onChange={(e) => updateRule(index, 'fieldId', e.target.value)}
                    aria-label="Choose a field"
                  >
                    {availableFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sort-modal__direction-wrap">
                  <label className="sort-modal__label">Order</label>
                  <div className="sort-modal__direction-btns" role="group" aria-label="Sort direction">
                    <button
                      type="button"
                      className={`sort-modal__direction-btn ${rule.direction === 'asc' ? 'sort-modal__direction-btn--active' : ''}`}
                      onClick={() => updateRule(index, 'direction', 'asc')}
                      title="Old → New (A–Z)"
                      aria-pressed={rule.direction === 'asc'}
                    >
                      A↓
                    </button>
                    <button
                      type="button"
                      className={`sort-modal__direction-btn ${rule.direction === 'desc' ? 'sort-modal__direction-btn--active' : ''}`}
                      onClick={() => updateRule(index, 'direction', 'desc')}
                      title="New → Old (Z–A)"
                      aria-pressed={rule.direction === 'desc'}
                    >
                      Z↓
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="sort-modal__delete"
                  onClick={() => removeRule(index)}
                  aria-label="Delete sort"
                  title="Delete sort"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="sort-modal__add" onClick={addRule}>
            + Add another sort
          </button>
        </div>

        <div className="sort-modal__footer">
          {rules.length > 0 && (
            <button
              type="button"
              className="sort-modal__btn sort-modal__btn--secondary sort-modal__btn--remove"
              onClick={() => { setRules([]); onApply?.([]); onClose?.(); }}
            >
              Remove sort
            </button>
          )}
          <button type="button" className="sort-modal__btn sort-modal__btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="sort-modal__btn sort-modal__btn--primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
