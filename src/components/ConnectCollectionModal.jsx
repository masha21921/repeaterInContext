import { useState, useMemo } from 'react';
import './ConnectCollectionModal.css';
import {
  availableContexts,
  connectModalPresetIds,
  connectModalExistingOrder,
  connectModalExistingLabels,
} from '../data/demoData';

/**
 * Connect Collection modal: "connect" mode shows New + Existing collection;
 * "replace" mode shows only Existing collection.
 * When allowedContextIds is provided (e.g. for repeater Replace), only contexts on the page are shown.
 */
export function ConnectCollectionModal({
  isOpen,
  onClose,
  onConnect,
  presetUsedIds = [],
  mode = 'connect',
  /** When set (e.g. for repeater Replace), only show these context ids (contexts connected to page/section). */
  allowedContextIds,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const presetCollections = useMemo(
    () =>
      mode === 'connect'
        ? availableContexts.filter(
            (c) => connectModalPresetIds.includes(c.id) && !presetUsedIds.includes(c.id)
          )
        : [],
    [mode, presetUsedIds]
  );
  const baseExistingIds = useMemo(
    () =>
      mode === 'replace'
        ? [...new Set([...connectModalExistingOrder, ...connectModalPresetIds.filter((id) => presetUsedIds.includes(id))])]
        : [
            ...presetUsedIds,
            ...connectModalExistingOrder.filter((id) => !presetUsedIds.includes(id)),
          ],
    [mode, presetUsedIds]
  );
  const existingCollectionIds = useMemo(
    () =>
      allowedContextIds && allowedContextIds.length > 0
        ? baseExistingIds.filter((id) => allowedContextIds.includes(id))
        : baseExistingIds,
    [baseExistingIds, allowedContextIds]
  );
  const existingCollections = useMemo(
    () =>
      existingCollectionIds
        .map((id) => availableContexts.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          ...c,
          displayLabel: connectModalExistingLabels[c.id] || c.label,
        })),
    [existingCollectionIds]
  );
  const noContextOnPage = allowedContextIds && allowedContextIds.length === 0;

  const selectedCollection = selectedId
    ? availableContexts.find((c) => c.id === selectedId)
    : null;

  const isRecipesCollection = selectedCollection?.id === 'recipes';
  const RECIPE_PREVIEW_COLUMNS = [
    { key: 'title', label: 'Recipe name' },
    { key: 'image', label: 'Image' },
    { key: 'description', label: 'Description' },
    { key: 'course', label: 'Course' },
  ];

  const previewItems = useMemo(() => {
    const items = selectedCollection?.items ?? [];
    if (isRecipesCollection) return [...items];
    return items.slice(0, 3);
  }, [selectedCollection?.items, isRecipesCollection]);

  const previewColumns = useMemo(() => {
    if (isRecipesCollection) return RECIPE_PREVIEW_COLUMNS;
    if (!previewItems.length) return [];
    const first = previewItems[0];
    return Object.keys(first)
      .filter((k) => k !== 'id' && typeof first[k] !== 'object')
      .map((key) => ({ key, label: key.replace(/^[Tt]\s*/, '') }));
  }, [isRecipesCollection, previewItems]);

  if (!isOpen) return null;

  function handleConnect() {
    if (selectedId) onConnect?.(selectedId);
    onClose();
  }

  return (
    <div
      className="connect-collection-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-collection-modal-title"
    >
      <div
        className="connect-collection-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="connect-collection-modal__header">
          <h2 id="connect-collection-modal-title" className="connect-collection-modal__title">
            Connect Collection
          </h2>
          <div className="connect-collection-modal__header-actions">
            <button type="button" className="connect-collection-modal__help" aria-label="Help">?</button>
            <button type="button" className="connect-collection-modal__close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <p className="connect-collection-modal__subtitle">
          {noContextOnPage
            ? 'No context available on the page. Connect the page or a section to a context first.'
            : 'Select the collection you want to display content from.'}
        </p>

        <div className="connect-collection-modal__body">
          {noContextOnPage ? null : (
          <div className="connect-collection-modal__body-inner">
          <div className="connect-collection-modal__left">
            {mode === 'connect' && presetCollections.length > 0 && (
              <section className="connect-collection-modal__section">
                <h3 className="connect-collection-modal__section-title">New collection</h3>
                <p className="connect-collection-modal__section-desc">
                  Start with the template&apos;s content and edit it later.
                </p>
                {presetCollections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    className={`connect-collection-modal__card ${selectedId === col.id ? 'connect-collection-modal__card--selected' : ''}`}
                    onClick={() => setSelectedId(col.id)}
                  >
                    <span className="connect-collection-modal__card-label">{col.label}</span>
                    <span className="connect-collection-modal__card-meta">{col.items?.length ?? 0} items</span>
                  </button>
                ))}
              </section>
            )}
            <section className="connect-collection-modal__section">
              <h3 className="connect-collection-modal__section-title">Existing collection</h3>
              {existingCollections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={`connect-collection-modal__card ${selectedId === col.id ? 'connect-collection-modal__card--selected' : ''}`}
                  onClick={() => setSelectedId(col.id)}
                >
                  <span className="connect-collection-modal__card-label">{col.displayLabel}</span>
                  <span className="connect-collection-modal__card-meta">{col.items?.length ?? 0} items</span>
                </button>
              ))}
            </section>
          </div>

          <div className="connect-collection-modal__preview">
            <h3 className="connect-collection-modal__preview-title">Collection preview</h3>
            {selectedCollection ? (
              <>
                <p className="connect-collection-modal__preview-name">{selectedCollection.label}</p>
                <div className="connect-collection-modal__preview-table-wrap">
                  <table className="connect-collection-modal__preview-table">
                    <thead>
                      <tr>
                        {previewColumns.map((col) => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewItems.map((item) => (
                        <tr key={item.id}>
                          {previewColumns.map((col) => {
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
              </>
            ) : (
              <p className="connect-collection-modal__preview-empty">Select a collection to preview.</p>
            )}
          </div>
          </div>
          )}
        </div>

        <div className="connect-collection-modal__footer">
          <button type="button" className="connect-collection-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="connect-collection-modal__connect"
            onClick={handleConnect}
            disabled={!selectedId || noContextOnPage}
          >
            Connect Collection
          </button>
        </div>
      </div>
    </div>
  );
}
