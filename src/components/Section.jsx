import { useState, useRef, useEffect } from 'react';
import { ComponentWrapper } from './ComponentWrapper';
import './Section.css';

const DEFAULT_ADDABLE_COMPONENTS = [
  { type: 'repeater', label: 'Repeater' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
];

/**
 * Section on the stage. Can hold a list of components; supports "Add component" dropdown.
 * addableComponents: optional list of { type, label, preset? }. If not provided, uses default (Repeater, Text).
 */
export function Section({
  sectionId,
  title,
  contentTitle,
  components = [],
  renderComponent,
  onAddComponent,
  addableComponents,
  onRemoveComponent,
  isSectionSelected,
  isContentTitleSelected,
  selectedComponentId,
  onSelectSection,
  onSelectContentTitle,
  onSelectComponent,
  /** Single-context legacy. */
  contextLabel,
  contextInstanceLabel,
  /** Multi-context: array of { label, instanceLabel } (overrides single if length > 0). */
  sectionContexts = [],
  showContextLabel = true,
  onOpenSectionConnect,
  /** When false, Connect button is hidden. */
  showSectionConnectButton = true,
}) {
  const contextsToShow = Array.isArray(sectionContexts) && sectionContexts.length > 0
    ? sectionContexts
    : (contextLabel != null || contextInstanceLabel != null
      ? [{ label: contextLabel ?? '—', instanceLabel: contextInstanceLabel ?? '—' }]
      : []);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!addMenuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAddMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  const hasContent = components.length > 0;
  const options = addableComponents ?? DEFAULT_ADDABLE_COMPONENTS;

  /** Group options by optional .group; returns [{ groupLabel, options }, ...]. Ungrouped options go in a final group with no label. */
  const groupedOptions = (() => {
    const groups = new Map();
    const ungrouped = [];
    for (const opt of options) {
      if (opt.group) {
        if (!groups.has(opt.group)) groups.set(opt.group, []);
        groups.get(opt.group).push(opt);
      } else {
        ungrouped.push(opt);
      }
    }
    const result = [];
    groups.forEach((opts, label) => result.push({ groupLabel: label, options: opts }));
    if (ungrouped.length) result.push({ groupLabel: null, options: ungrouped });
    return result;
  })();

  function handleAdd(option) {
    onAddComponent?.(sectionId, option.type, option.preset);
    setAddMenuOpen(false);
  }

  return (
    <div
      className={`stage-section ${hasContent ? 'stage-section--has-content' : ''} ${isSectionSelected ? 'stage-section--selected' : ''}`}
      onClick={(e) => {
        if (e.target.closest('.repeater-ctx-content') || e.target.closest('.ctx-repeater')) return;
        onSelectSection?.(sectionId);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelectSection?.(sectionId)}
    >
      <div className="stage-section__header">
        <span className="stage-section__title">{title}</span>
        {showContextLabel && (
          <span className="stage-section__ctx">
            {contextsToShow.length === 0 ? (
              <span className="stage-section__ctx-line">
                <strong>CTX:</strong> — <strong>CTX instance:</strong> —
              </span>
            ) : (
              contextsToShow.map((ctx, i) => (
                <span key={i} className="stage-section__ctx-line">
                  <strong>CTX:</strong> {ctx.label ?? '—'}{' '}
                  <strong>CTX instance:</strong> {ctx.instanceLabel ?? '—'}
                  {i < contextsToShow.length - 1 ? ', ' : ''}
                </span>
              ))
            )}
          </span>
        )}
        {onOpenSectionConnect && showSectionConnectButton && (
          <button
            type="button"
            className="stage-section__connect ctx-connect-link"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onOpenSectionConnect(); }}
            title="Connect to CMS field"
            aria-label="Connect to CMS field"
          >
            <span className="ctx-connect-link__icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="12" r="2.5" fill="none" />
                <circle cx="17" cy="12" r="2.5" fill="none" />
                <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
              </svg>
            </span>
            Connect
          </button>
        )}
      </div>
      <div className="stage-section__content">
        {contentTitle && (
          <div
            className={`section-content-title-wrap ${isContentTitleSelected ? 'section-content-title-wrap--selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectContentTitle?.(sectionId);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectContentTitle?.(sectionId)}
          >
            <h2 className="section-content-title">{contentTitle}</h2>
          </div>
        )}
        {components.map((comp) => (
          <ComponentWrapper
            key={comp.id}
            isSelected={selectedComponentId === comp.id}
            connected={comp.connected ?? false}
            onSelect={() => onSelectComponent?.(sectionId, comp.id)}
            draggablePayload={
              comp.type === 'text'
                ? { type: 'text', content: comp.content ?? '' }
                : comp.type === 'image'
                  ? { type: 'image', src: comp.src ?? '', alt: comp.alt ?? '' }
                  : null
            }
          >
            {renderComponent?.(comp, sectionId)}
          </ComponentWrapper>
        ))}
        {onAddComponent && (
          <div className="stage-section__add-wrap" ref={menuRef}>
            <button
              type="button"
              className="stage-section__add visible"
              onClick={(e) => {
                e.stopPropagation();
                setAddMenuOpen((o) => !o);
              }}
            >
              + Add component
            </button>
            {addMenuOpen && (
              <div className="stage-section__add-menu">
                {groupedOptions.map(({ groupLabel, options: groupItems }) => (
                  <div key={groupLabel ?? '__ungrouped__'} className="stage-section__add-menu-group">
                    {groupLabel != null && (
                      <div className="stage-section__add-menu-group-label" aria-hidden>
                        {groupLabel}
                      </div>
                    )}
                    {groupItems.map((option) => (
                      <button
                        key={option.preset != null ? `${option.type}-${option.preset}` : option.type}
                        type="button"
                        className="stage-section__add-menu-item"
                        onClick={() => handleAdd(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
