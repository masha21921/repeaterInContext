import { useState, useMemo } from 'react';
import { CollectionPreviewModal } from './CollectionPreviewModal';
import { getSortSummary } from '../utils/sortRules';
import './ManageItemsPanel.css';

/**
 * Manage Items panel: list of repeater items with Sort and Filter options.
 * Opens from "Manage Items" link in Repeater Settings.
 * Sort: when onOpenSort is provided, "Edit sort" opens the Sort modal; otherwise items are already sorted by parent.
 */
export function ManageItemsPanel({
  isOpen,
  onClose,
  collectionLabel,
  collectionId,
  items = [],
  sortRules = [],
  onSortChange,
  onOpenSort,
  availableSortFields = [],
  filterQuery = '',
  onFilterChange,
  onOpenFilter,
  filterRules = [],
  onRemoveFilter,
  onOpenCollection,
  onEditItem,
  onAddItem,
}) {
  const [activeTab, setActiveTab] = useState('items');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showCollectionPreview, setShowCollectionPreview] = useState(false);

  const sortSummary = getSortSummary(sortRules, availableSortFields);
  const displayItems = useMemo(() => items, [items]);

  if (!isOpen) return null;

  return (
    <>
      <CollectionPreviewModal
        isOpen={showCollectionPreview}
        onClose={() => setShowCollectionPreview(false)}
        collectionLabel={collectionLabel}
        collectionId={collectionId}
        items={items}
      />
      <div className="manage-items-panel-backdrop" onClick={onClose}>
      <div className="manage-items-panel" onClick={(e) => e.stopPropagation()}>
        <div className="manage-items-panel__header">
          <h2 className="manage-items-panel__title">Manage Items</h2>
          <div className="manage-items-panel__header-actions">
            <button type="button" className="manage-items-panel__icon-btn" aria-label="Help">?</button>
            <button type="button" className="manage-items-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="manage-items-panel__tabs">
          <button
            type="button"
            className={`manage-items-panel__tab ${activeTab === 'items' ? 'manage-items-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items
          </button>
          <button
            type="button"
            className={`manage-items-panel__tab ${activeTab === 'fields' ? 'manage-items-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('fields')}
          >
            Fields
          </button>
        </div>

        {activeTab === 'items' && (
          <>
            <p className="manage-items-panel__desc">
              These items come from the{' '}
              <button
                type="button"
                className="manage-items-panel__link"
                onClick={() => setShowCollectionPreview(true)}
              >
                {collectionLabel} collection
              </button>
              . Choose how they&apos;re shown on this list.
            </p>
            <p className="manage-items-panel__count">
              {displayItems.length} items{filterRules?.length > 0 ? ' (filtered)' : ''}
              {filterRules?.length > 0 && onRemoveFilter && (
                <>
                  {' · '}
                  <button type="button" className="manage-items-panel__link" onClick={onRemoveFilter}>
                    Remove filter
                  </button>
                </>
              )}
            </p>

            <div className="manage-items-panel__actions">
              <div className="manage-items-panel__action-wrap">
                <button
                  type="button"
                  className="manage-items-panel__action-btn"
                  onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
                  aria-expanded={sortOpen}
                >
                  <span className="manage-items-panel__action-icon" aria-hidden>⇅</span>
                  Sort
                </button>
                {sortOpen && (
                  <div className="manage-items-panel__dropdown">
                    <p className="manage-items-panel__sort-summary">{sortSummary}</p>
                    {onOpenSort && (
                      <button type="button" className="manage-items-panel__edit-sort-btn" onClick={() => { onOpenSort(); setSortOpen(false); }}>
                        Edit sort
                      </button>
                    )}
                    {!onOpenSort && onSortChange && (
                      <>
                        <button type="button" onClick={() => { onSortChange?.([]); setSortOpen(false); }}>Default order</button>
                        <button type="button" onClick={() => { onSortChange?.([{ fieldId: 'title', direction: 'asc' }]); setSortOpen(false); }}>Name A–Z</button>
                        <button type="button" onClick={() => { onSortChange?.([{ fieldId: 'title', direction: 'desc' }]); setSortOpen(false); }}>Name Z–A</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="manage-items-panel__action-wrap">
                <button
                  type="button"
                  className="manage-items-panel__action-btn"
                  onClick={() => {
                    if (onOpenFilter) {
                      onOpenFilter();
                      setFilterOpen(false);
                    } else {
                      setFilterOpen((o) => !o);
                      setSortOpen(false);
                    }
                  }}
                  aria-expanded={onOpenFilter ? false : filterOpen}
                >
                  <span className="manage-items-panel__action-icon" aria-hidden>⊡</span>
                  Filter{filterRules?.length > 0 ? ` (${filterRules.length})` : ''}
                </button>
                {!onOpenFilter && filterOpen && (
                  <div className="manage-items-panel__dropdown manage-items-panel__dropdown--filter">
                    <label className="manage-items-panel__filter-label">Filter by name</label>
                    <input
                      type="text"
                      className="manage-items-panel__filter-input"
                      placeholder="Type to filter..."
                      value={filterQuery}
                      onChange={(e) => onFilterChange?.(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <ul className="manage-items-panel__list">
              {displayItems.map((item) => (
                <li key={item.id} className="manage-items-panel__item">
                  <span className="manage-items-panel__drag" aria-hidden>⋮⋮</span>
                  <span className="manage-items-panel__avatar">
                    {item.image ? (
                      <img src={item.image} alt="" />
                    ) : (
                      <span className="manage-items-panel__avatar-placeholder">
                        {(item.title ?? item.name ?? '?').charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="manage-items-panel__item-label">{item.title ?? item.name ?? item.id}</span>
                  <button
                    type="button"
                    className="manage-items-panel__edit-btn"
                    onClick={() => onEditItem?.(item)}
                    title="Edit item"
                    aria-label="Edit item"
                  >
                    ✎
                  </button>
                </li>
              ))}
            </ul>

            <div className="manage-items-panel__footer">
              <button type="button" className="manage-items-panel__add-btn" onClick={onAddItem}>
                + Add Item
              </button>
              <button type="button" className="manage-items-panel__open-btn" onClick={onOpenCollection}>
                📁 Open collection
              </button>
            </div>
          </>
        )}

        {activeTab === 'fields' && (
          <div className="manage-items-panel__fields-placeholder">
            <p>Configure which fields from the collection are shown in the repeater.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
