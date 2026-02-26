import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import './CollectionPreviewModal.css';

const RECIPE_PREVIEW_COLUMNS = [
  { key: 'title', label: 'Recipe name' },
  { key: 'image', label: 'Image' },
  { key: 'description', label: 'Description' },
  { key: 'course', label: 'Course' },
];

/**
 * Modal that shows a table of collection items with relevant fields.
 * For Recipes: Recipe name, Image, Description, Course. Others: dynamic columns.
 */
export function CollectionPreviewModal({
  isOpen,
  onClose,
  collectionLabel,
  collectionId,
  items = [],
}) {
  const isRecipes = collectionId === 'recipes';
  const columns = useMemo(() => {
    if (isRecipes) return RECIPE_PREVIEW_COLUMNS;
    if (!items.length) return [];
    const first = items[0];
    return Object.keys(first)
      .filter((k) => k !== 'id' && typeof first[k] !== 'object')
      .map((key) => ({ key, label: key.replace(/^[Tt]\s*/, '') }));
  }, [isRecipes, items]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="collection-preview-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-preview-modal-title"
    >
      <div className="collection-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="collection-preview-modal__header">
          <h2 id="collection-preview-modal-title" className="collection-preview-modal__title">
            {collectionLabel} collection
          </h2>
          <button
            type="button"
            className="collection-preview-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="collection-preview-modal__body">
          {items.length === 0 ? (
            <p className="collection-preview-modal__empty">No items in this collection.</p>
          ) : (
            <div className="collection-preview-modal__table-wrap">
              <table className="collection-preview-modal__table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {columns.map((col) => {
                        const val = item[col.key];
                        const isImage = col.key.toLowerCase().includes('image') || col.key.toLowerCase().includes('photo');
                        const display = isImage && typeof val === 'string' ? '[Image]' : (typeof val === 'string' && val.length > 32 ? `${val.slice(0, 32)}...` : String(val ?? ''));
                        return <td key={col.key}>{display}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
