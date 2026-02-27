import { useState, useRef, useEffect } from 'react';
import './RepeaterItemSettingsPanel.css';
import './UseCollectionContentPanel.css';

/**
 * Panel opened when clicking the connector icon in Edit Text / Image / Button.
 * bindProperty: 'text' | 'image' | 'imageAlt' | 'imageLink' | 'button' | 'buttonLink'.
 */
const FIELD_TYPE = { text: 'text', link: 'link', number: 'number', image: 'image', array: 'array' };

const FIELD_OPTIONS_BY_CONTEXT = {
  team: [
    { value: 'title', label: 'Name', fieldType: FIELD_TYPE.text },
    { value: 'bio', label: 'Bio', fieldType: FIELD_TYPE.text },
  ],
  teamImage: [
    { value: 'image', label: 'Main image', fieldType: FIELD_TYPE.image },
    { value: 'imageAdditional', label: 'Additional image', fieldType: FIELD_TYPE.image },
  ],
  teamImageAlt: [
    { value: 'title', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Recipe description', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  teamImageLink: [
    { value: 'videoUrl', label: 'Recipe video url', fieldType: FIELD_TYPE.link },
    { value: 'detailPage', label: 'Recipe page', fieldType: FIELD_TYPE.link },
  ],
  teamButton: [
    { value: 'title', label: 'Name', fieldType: FIELD_TYPE.text },
    { value: 'buttonText', label: 'Button text', fieldType: FIELD_TYPE.text },
  ],
  teamButtonLink: [
    { value: 'detailPage', label: 'Recipes dynamic page', fieldType: FIELD_TYPE.link },
  ],
  recipes: [
    { value: 'title', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
    { value: 'course', label: 'Course', fieldType: FIELD_TYPE.array },
  ],
  recipesImage: [
    { value: 'image', label: 'Main image', fieldType: FIELD_TYPE.image },
    { value: 'imageAdditional', label: 'Additional image', fieldType: FIELD_TYPE.image },
  ],
  recipesImageAlt: [
    { value: 'title', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Recipe description', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  recipesImageLink: [
    { value: 'videoUrl', label: 'Recipe video url', fieldType: FIELD_TYPE.link },
    { value: 'detailPage', label: 'Recipe page', fieldType: FIELD_TYPE.link },
  ],
  recipesButton: [
    { value: 'title', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'buttonText', label: 'Button text', fieldType: FIELD_TYPE.text },
  ],
  recipesButtonLink: [
    { value: 'detailPage', label: 'Recipes dynamic page', fieldType: FIELD_TYPE.link },
  ],
  offices: [
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
    { value: 'code', label: 'Code', fieldType: FIELD_TYPE.number },
  ],
  officesImage: [
    { value: 'image', label: 'Main image', fieldType: FIELD_TYPE.image },
    { value: 'imageAdditional', label: 'Additional image', fieldType: FIELD_TYPE.image },
  ],
  officesImageAlt: [
    { value: 'name', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Recipe description', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  officesImageLink: [
    { value: 'videoUrl', label: 'Recipe video url', fieldType: FIELD_TYPE.link },
    { value: 'detailPage', label: 'Recipe page', fieldType: FIELD_TYPE.link },
  ],
  officesButton: [
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
  ],
  officesButtonLink: [
    { value: 'detailPage', label: 'Recipes dynamic page', fieldType: FIELD_TYPE.link },
  ],
  films: [
    { value: 'title', label: 'Film title', fieldType: FIELD_TYPE.text },
    { value: 'year', label: 'Year', fieldType: FIELD_TYPE.number },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
    { value: 'director', label: 'Director', fieldType: FIELD_TYPE.text },
  ],
  filmsImage: [
    { value: 'image', label: 'Poster', fieldType: FIELD_TYPE.image },
  ],
  filmsImageAlt: [
    { value: 'title', label: 'Film title', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  filmsButton: [
    { value: 'title', label: 'Film title', fieldType: FIELD_TYPE.text },
  ],
  filmsButtonLink: [
    { value: 'detailPage', label: 'Film page', fieldType: FIELD_TYPE.link },
  ],
  actors: [
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
    { value: 'bio', label: 'Bio', fieldType: FIELD_TYPE.text },
  ],
  actorsImage: [
    { value: 'image', label: 'Photo', fieldType: FIELD_TYPE.image },
  ],
  actorsImageAlt: [
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
    { value: 'bio', label: 'Bio', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  actorsButton: [
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
  ],
  actorsButtonLink: [
    { value: 'detailPage', label: 'Actor page', fieldType: FIELD_TYPE.link },
  ],
  services: [
    { value: 'title', label: 'Service name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
  ],
  servicesImage: [
    { value: 'image', label: 'Main image', fieldType: FIELD_TYPE.image },
  ],
  servicesImageAlt: [
    { value: 'title', label: 'Service name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Description', fieldType: FIELD_TYPE.text },
  ],
  servicesButton: [
    { value: 'title', label: 'Service name', fieldType: FIELD_TYPE.text },
    { value: 'buttonText', label: 'Button text', fieldType: FIELD_TYPE.text },
  ],
  servicesButtonLink: [
    { value: 'detailPage', label: 'Service page', fieldType: FIELD_TYPE.link },
  ],
  bookends: [
    { value: 'title', label: 'Book title', fieldType: FIELD_TYPE.text },
    { value: 'author', label: 'Author', fieldType: FIELD_TYPE.text },
  ],
  bookendsImage: [
    { value: 'image', label: 'Cover', fieldType: FIELD_TYPE.image },
  ],
  bookendsImageAlt: [
    { value: 'title', label: 'Book title', fieldType: FIELD_TYPE.text },
    { value: 'author', label: 'Author', fieldType: FIELD_TYPE.text },
  ],
  bookendsButton: [
    { value: 'title', label: 'Book title', fieldType: FIELD_TYPE.text },
  ],
  bookendsButtonLink: [
    { value: 'detailPage', label: 'Book page', fieldType: FIELD_TYPE.link },
  ],
  default: [
    { value: 'title', label: 'Title', fieldType: FIELD_TYPE.text },
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
  ],
  defaultImage: [
    { value: 'image', label: 'Main image', fieldType: FIELD_TYPE.image },
    { value: 'imageAdditional', label: 'Additional image', fieldType: FIELD_TYPE.image },
  ],
  defaultImageAlt: [
    { value: 'title', label: 'Recipe name', fieldType: FIELD_TYPE.text },
    { value: 'description', label: 'Recipe description', fieldType: FIELD_TYPE.text },
    { value: 'imageAlt', label: 'Alt text', fieldType: FIELD_TYPE.text },
  ],
  defaultImageLink: [
    { value: 'videoUrl', label: 'Recipe video url', fieldType: FIELD_TYPE.link },
    { value: 'detailPage', label: 'Recipe page', fieldType: FIELD_TYPE.link },
  ],
  defaultButton: [
    { value: 'title', label: 'Title', fieldType: FIELD_TYPE.text },
    { value: 'name', label: 'Name', fieldType: FIELD_TYPE.text },
  ],
  defaultButtonLink: [
    { value: 'detailPage', label: 'Recipes dynamic page', fieldType: FIELD_TYPE.link },
  ],
};

function FieldTypeIcon({ type, className = '' }) {
  const size = 16;
  const common = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, className: `field-type-icon field-type-icon--${type} ${className}`.trim() };
  switch (type) {
    case FIELD_TYPE.text:
      return (
        <svg {...common}>
          <path d="M3 4h10M3 8h10M3 12h6" strokeLinecap="round" />
        </svg>
      );
    case FIELD_TYPE.link:
      return (
        <svg {...common}>
          <path d="M6.5 9.5L9.5 6.5M7 5l1.5-1.5a2 2 0 012.8 2.8L9 8M9 8L7.5 9.5a2 2 0 01-2.8-2.8L5 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case FIELD_TYPE.number:
      return (
        <svg {...common}>
          <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" stroke="none">#</text>
        </svg>
      );
    case FIELD_TYPE.image:
      return (
        <svg {...common}>
          <rect x="2" y="2" width="12" height="10" rx="1" />
          <circle cx="5.5" cy="5.5" r="1.5" />
          <path d="M2 11l3-3 2 2 4-4 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case FIELD_TYPE.array:
      return (
        <svg {...common}>
          <path d="M3 5h10M3 8h10M3 11h6" strokeLinecap="round" />
          <circle cx="12" cy="5" r="1" fill="currentColor" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

function getFieldOptions(contextId, contextType, bindProperty = 'text') {
  const suffix =
    bindProperty === 'image' ? 'Image'
    : bindProperty === 'imageAlt' ? 'ImageAlt'
    : bindProperty === 'imageLink' ? 'ImageLink'
    : bindProperty === 'button' ? 'Button'
    : bindProperty === 'buttonLink' ? 'ButtonLink'
    : '';
  if (contextId === 'team') return FIELD_OPTIONS_BY_CONTEXT['team' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.team;
  if (contextType === 'recipes' || contextId === 'recipes') return FIELD_OPTIONS_BY_CONTEXT['recipes' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.recipes;
  if (contextId === 'services' || contextType === 'services') return FIELD_OPTIONS_BY_CONTEXT['services' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.services;
  if (contextId === 'bookends' || contextType === 'bookends') return FIELD_OPTIONS_BY_CONTEXT['bookends' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.bookends;
  if (contextType === 'offices') return FIELD_OPTIONS_BY_CONTEXT['offices' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.offices;
  if (contextId === 'films' || contextType === 'films') return FIELD_OPTIONS_BY_CONTEXT['films' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.films;
  if (contextId === 'actors' || contextType === 'actors') return FIELD_OPTIONS_BY_CONTEXT['actors' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.actors;
  return FIELD_OPTIONS_BY_CONTEXT['default' + suffix] ?? FIELD_OPTIONS_BY_CONTEXT.default;
}

export function UseCollectionContentPanel({
  collectionLabel = 'Collection',
  contextId,
  contextType,
  bindProperty = 'text',
  selectedField = '',
  onSelectField,
  onClose,
  repeaterAssignedContextId = null,
  repeaterContextLabel = null,
  /** Single label when Source is read-only (no dropdown). */
  sourceLabel = null,
  /** When set, Source is a dropdown; options are { contextId, label }. */
  sourceOptions = null,
  selectedSourceContextId = null,
  onSourceChange,
  /** When no source is selected, use this context to resolve field labels (e.g. repeater's context) so the Property button shows "Recipe name" not "Title". */
  fallbackContextIdForLabel = null,
  fallbackContextTypeForLabel = null,
  /** Optional aria-label for the Source select (e.g. "Source collection" in Harmony). */
  sourceSelectAriaLabel = 'Source context',
}) {
  const [open, setOpen] = useState(false);
  const effectiveContextId = contextId ?? (selectedField ? fallbackContextIdForLabel : null);
  const effectiveContextType = contextType ?? (selectedField ? fallbackContextTypeForLabel : null);
  const fieldOptions = getFieldOptions(effectiveContextId, effectiveContextType, bindProperty);
  const noConnectionOption = { value: '', label: 'No connection', fieldType: FIELD_TYPE.text };
  const selectedOption = selectedField === '' || selectedField == null
    ? noConnectionOption
    : (fieldOptions.find((o) => o.value === selectedField) ?? { value: selectedField, label: selectedField, fieldType: FIELD_TYPE.text });

  // When Source is a dropdown, use selectedSourceContextId so the notice reflects the user's choice immediately
  const selectedSourceId =
    (sourceOptions && selectedSourceContextId != null && selectedSourceContextId !== '')
      ? selectedSourceContextId
      : (contextId ?? (selectedSourceContextId || null));
  // Show warning when we're in repeater-item panel and the chosen source is not the repeater's context (or repeater has no context but user picked a source)
  const isRepeaterItemPanel = repeaterAssignedContextId !== undefined;
  const hasSourceSelected = selectedSourceId != null && String(selectedSourceId).trim() !== '';
  const sourceIsNotRepeaterContext =
    repeaterAssignedContextId == null ||
    repeaterAssignedContextId === '' ||
    String(selectedSourceId) !== String(repeaterAssignedContextId);
  const connectingToNonRepeaterContext =
    isRepeaterItemPanel && hasSourceSelected && sourceIsNotRepeaterContext;
  const hasOnlyPlaceholderSource = sourceOptions?.length === 1 && sourceOptions[0]?.contextId === '';
  const noContextAvailable = repeaterAssignedContextId !== undefined && !contextId && (!sourceOptions || sourceOptions.length === 0 || hasOnlyPlaceholderSource);
  /** When Source is a dropdown, Property is disabled until user selects a source (context). */
  const propertyDisabled = sourceOptions != null && sourceOptions.length > 0 && (contextId == null || contextId === '');

  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="repeater-item-settings-panel use-collection-content-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">Use collection content</h2>
        <div className="repeater-item-settings-panel__header-actions">
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        {(sourceLabel != null || (sourceOptions && sourceOptions.length > 0)) && (
          <div className="use-collection-content-panel__meta">
            <div className="use-collection-content-panel__meta-row">
              <span className="use-collection-content-panel__meta-label">Source</span>
              {(sourceOptions && sourceOptions.length > 0) && (onSourceChange != null || sourceOptions.some((o) => o.contextId === '')) ? (
                <select
                  className="use-collection-content-panel__source-select"
                  value={selectedSourceContextId ?? ''}
                  onChange={(e) => onSourceChange?.(e.target.value || null)}
                  aria-label={sourceSelectAriaLabel}
                  disabled={sourceOptions.length === 1 && sourceOptions[0].contextId === ''}
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt.contextId || '__none__'} value={opt.contextId}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="use-collection-content-panel__meta-value">{sourceLabel ?? '—'}</span>
              )}
            </div>
          </div>
        )}
        {noContextAvailable && (
          <div className="use-collection-content-panel__notice" role="status">
            There is no context available. First add context to the repeater in Repeater settings.
          </div>
        )}
        {!noContextAvailable && connectingToNonRepeaterContext && (
          <div className="use-collection-content-panel__notice" role="status">
            This source is not the repeater&apos;s context. The text will display the same content for all items.
          </div>
        )}
        <div className="repeater-item-settings-panel__row">
          <label className="repeater-item-settings-panel__label">
            Property
            {propertyDisabled && (
              <span className="use-collection-content-panel__property-hint">Select a source first</span>
            )}
          </label>
          <div className="use-collection-content-panel__field-wrap" ref={ref}>
            <button
              type="button"
              className={`use-collection-content-panel__field-btn ${propertyDisabled ? 'use-collection-content-panel__field-btn--disabled' : ''}`}
              onClick={() => !propertyDisabled && setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label="Property"
              aria-disabled={propertyDisabled}
              disabled={propertyDisabled}
            >
              <FieldTypeIcon type={selectedOption?.fieldType ?? FIELD_TYPE.text} />
              <span className="use-collection-content-panel__field-btn-label">
                {propertyDisabled ? 'Select field' : (selectedOption?.label ?? 'Select field')}
              </span>
              <span className="use-collection-content-panel__field-btn-arrow" aria-hidden>▼</span>
            </button>
            {open && (
              <ul className="use-collection-content-panel__field-list" role="listbox">
                <li
                  key="__no_connection__"
                  role="option"
                  aria-selected={selectedField === '' || selectedField == null}
                  className={`use-collection-content-panel__field-option ${(selectedField === '' || selectedField == null) ? 'use-collection-content-panel__field-option--selected' : ''}`}
                  onClick={() => {
                    onSelectField?.('');
                    setOpen(false);
                  }}
                >
                  <span>{noConnectionOption.label}</span>
                  {(selectedField === '' || selectedField == null) && <span className="use-collection-content-panel__field-check" aria-hidden>✓</span>}
                </li>
                {fieldOptions.map((o) => (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={o.value === selectedField}
                    className={`use-collection-content-panel__field-option ${o.value === selectedField ? 'use-collection-content-panel__field-option--selected' : ''}`}
                    onClick={() => {
                      onSelectField?.(o.value);
                      setOpen(false);
                    }}
                  >
                    <FieldTypeIcon type={o.fieldType ?? FIELD_TYPE.text} />
                    <span>{o.label}</span>
                    {o.value === selectedField && <span className="use-collection-content-panel__field-check" aria-hidden>✓</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
