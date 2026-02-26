import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './FilterModal.css';

const CONDITION_NEEDS_VALUE = new Set(['contains', 'does not contain', 'equals', 'starts with', 'ends with']);
const CONDITIONS = [
  { id: 'contains', label: 'contains' },
  { id: 'does not contain', label: 'does not contain' },
  { id: 'equals', label: 'equals' },
  { id: 'starts with', label: 'starts with' },
  { id: 'ends with', label: 'ends with' },
  { id: 'is empty', label: 'is empty' },
  { id: 'is not empty', label: 'is not empty' },
];

const FIELD_TYPE_ICON = { text: 'T', number: '#' };
const DEFAULT_FIELDS = [
  { id: 'title', label: 'Recipe name', type: 'text' },
  { id: 'image', label: 'Image', type: 'text' },
  { id: 'description', label: 'Description', type: 'text' },
  { id: 'course', label: 'Course', type: 'text' },
  { id: 'buttonText', label: 'Button text', type: 'text' },
];

function fieldDisplayLabel(field) {
  const icon = FIELD_TYPE_ICON[field.type] || 'T';
  return `${icon} ${field.label}`;
}

/**
 * Filter modal: define rules (Field + Condition + Value) to filter repeater items.
 * Only items matching all rules are shown.
 */
export function FilterModal({
  isOpen,
  onClose,
  filterRules = [],
  onApply,
  availableFields = DEFAULT_FIELDS,
}) {
  const [rules, setRules] = useState(() => [...filterRules]);

  useEffect(() => {
    if (!isOpen) return;
    const rules = filterRules ?? [];
    setRules(
      rules.length
        ? rules.map((r) => ({ ...r }))
        : [{ field: availableFields[0]?.id ?? 'title', condition: 'contains', value: '' }]
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const addRule = () => {
    setRules((prev) => [...prev, { field: availableFields[0]?.id ?? 'title', condition: 'contains', value: '' }]);
  };

  const removeRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRule = (index, key, value) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const handleApply = () => {
    const valid = rules.filter((r) => {
      const needsVal = CONDITION_NEEDS_VALUE.has(r.condition);
      if (needsVal) return (r.value ?? '').trim() !== '';
      return true;
    });
    onApply?.(valid);
    onClose?.();
  };

  const modalContent = (
    <div
      className="filter-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal__header">
          <div>
            <h2 id="filter-modal-title" className="filter-modal__title">
              Filter
            </h2>
            <p className="filter-modal__desc">
              Choose which items to show in this container. Only items that match the filter conditions will appear.
            </p>
          </div>
          <div className="filter-modal__header-actions">
            <button type="button" className="filter-modal__icon-btn" aria-label="Help">?</button>
            <button type="button" className="filter-modal__icon-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="filter-modal__body">
          <div className="filter-modal__rules">
            {rules.map((rule, index) => (
              <div key={index} className="filter-modal__rule">
                <div className="filter-modal__field-wrap">
                  <label className="filter-modal__label">Field</label>
                  <select
                    className="filter-modal__select"
                    value={rule.field ?? availableFields[0]?.id}
                    onChange={(e) => updateRule(index, 'field', e.target.value)}
                    aria-label="Field"
                  >
                    {availableFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {fieldDisplayLabel(f)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-modal__condition-wrap">
                  <label className="filter-modal__label">Condition</label>
                  <select
                    className="filter-modal__select"
                    value={rule.condition ?? 'contains'}
                    onChange={(e) => updateRule(index, 'condition', e.target.value)}
                    aria-label="Condition"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {CONDITION_NEEDS_VALUE.has(rule.condition ?? 'contains') && (
                  <div className="filter-modal__value-wrap">
                    <label className="filter-modal__label">Value</label>
                    <input
                      type="text"
                      className="filter-modal__input"
                      value={rule.value ?? ''}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                      placeholder="Value"
                      aria-label="Value"
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="filter-modal__delete"
                  onClick={() => removeRule(index)}
                  aria-label="Delete rule"
                  title="Delete rule"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="filter-modal__add" onClick={addRule}>
            + Add another filter
          </button>
        </div>

        <div className="filter-modal__footer">
          {rules.length > 0 && (
            <button
              type="button"
              className="filter-modal__btn filter-modal__btn--secondary filter-modal__btn--remove"
              onClick={() => { setRules([]); onApply?.([]); onClose?.(); }}
            >
              Remove filter
            </button>
          )}
          <button type="button" className="filter-modal__btn filter-modal__btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="filter-modal__btn filter-modal__btn--primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
