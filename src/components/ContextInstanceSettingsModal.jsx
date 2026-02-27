import { createPortal } from 'react-dom';
import { getSortSummary } from '../utils/sortRules';
import './ContextInstanceSettingsModal.css';

/**
 * Modal to edit a single context instance's settings (items per load, filter, sort).
 * Used from Repeater settings when the repeater has a context — edits that instance, not page/section.
 * Sort is edited in a separate Sort modal (like Filter); default: Date created, New → Old.
 */
export function ContextInstanceSettingsModal({
  isOpen,
  onClose,
  instanceLabel = '—',
  pageLoad = 4,
  onPageLoadChange,
  filterRules = [],
  onOpenFilter,
  sortRules = [],
  onOpenSort,
  availableSortFields = [],
}) {
  if (!isOpen) return null;

  const sortSummary = getSortSummary(sortRules, availableSortFields);
  const filterSummary =
    (filterRules?.length ?? 0) > 0
      ? `${filterRules.length} rule${filterRules.length === 1 ? '' : 's'}`
      : 'None';

  const content = (
    <div
      className="context-instance-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-instance-modal-title"
    >
      <div className="context-instance-modal">
        <div className="context-instance-modal__header">
          <div>
            <h2 id="context-instance-modal-title" className="context-instance-modal__title">
              Context instance settings
            </h2>
            <p className="context-instance-modal__instance">{instanceLabel}</p>
          </div>
          <button
            type="button"
            className="context-instance-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="context-instance-modal__body">
          <div className="context-instance-modal__row">
            <label className="context-instance-modal__label">Items per load</label>
            <input
              type="number"
              min={1}
              max={100}
              value={pageLoad ?? 4}
              onChange={(e) => onPageLoadChange?.(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="context-instance-modal__input"
            />
          </div>
          <div className="context-instance-modal__row">
            <span className="context-instance-modal__label">Filter</span>
            <div className="context-instance-modal__field">
              <span className="context-instance-modal__value">{filterSummary}</span>
              {onOpenFilter && (
                <button
                  type="button"
                  className="context-instance-modal__btn-text"
                  onClick={onOpenFilter}
                  aria-label="Edit filter"
                >
                  Edit filter
                </button>
              )}
            </div>
          </div>
          <div className="context-instance-modal__row">
            <span className="context-instance-modal__label">Sort</span>
            <div className="context-instance-modal__field">
              <span className="context-instance-modal__value">{sortSummary}</span>
              {onOpenSort && (
                <button
                  type="button"
                  className="context-instance-modal__btn-text"
                  onClick={onOpenSort}
                  aria-label="Edit sort"
                >
                  Edit sort
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="context-instance-modal__footer">
          <button type="button" className="context-instance-modal__btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
