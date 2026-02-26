import { useState, useEffect } from 'react';
import { RepeaterFloatingToolbar } from './RepeaterFloatingToolbar';
import './Repeater.css';

const DEFAULT_PAGE_SIZE = 4;

/**
 * Repeater — same component in both editors.
 * Recipes: cards (name, picture, Read recipe). Other types: chips + Show more.
 * When selected, shows a floating toolbar above.
 */
export function Repeater({
  context,
  items = [],
  pageSize = DEFAULT_PAGE_SIZE,
  showLoadMoreButton = true,
  connected = false,
  onConnect,
  selectedItemId,
  selectedElementKind,
  onSelectItem,
  onSelectItemElement,
  isSelected,
  onOpenConnectModal,
  onOpenManageItems,
  onOpenRepeaterSettings,
  technicalMode,
  exposeContext = false,
  contextLabel,
  contextInstanceLabel,
  contextInstance,
  onOpenContextDetails,
  isRepeaterSelected = false,
  onSelectRepeater,
  /** When user clicks the inner repeater content (below container header), call to select repeater and show Repeater settings. */
  onSelectInnerRepeater,
  requireContext = false,
  hasActiveFilter = false,
  unconfiguredRibbonDescription,
  unconfiguredRibbonButtonLabel = 'Connect collection',
  /** When true, unconnected repeater shows design (cards/chips) without blur and without ribbon. */
  unconfiguredDesignOnly = false,
  /** In the repeater header: 'connect' shows Connect (opens connect modal), 'details' shows View details (opens context details panel). */
  headerAction = 'connect',
  /** Studio preset: 'blank' shows three-column layout with drag/resize/expand chrome when unconfigured. */
  preset,
  /** Elements (text/image) dropped from section onto this repeater – rendered in each item. */
  droppedElements = [],
  onDropElement,
  /** For blank preset: components per slot. { 'blank-slot-0': [{ type, id, content? }], ... } */
  slotComponents = {},
  /** When user selects a text/image inside a blank slot, call with (slotId, elementId, elementType). */
  onSelectBlankSlotElement,
  /** { slotId, elementId } when a blank-slot inner element is selected (for visual highlight). */
  selectedBlankSlotElement,
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isDragOver, setIsDragOver] = useState(false);
  const type = context?.type ?? 'default';
  const displayContextLabel = contextLabel ?? context?.label ?? '—';
  const displayInstanceLabel = contextInstanceLabel ?? '—';

  const handleDragOver = (e) => {
    if (!onDropElement) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  };
  const handleDrop = (e) => {
    if (!onDropElement) return;
    e.preventDefault();
    setIsDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/x-repeater-element');
      if (raw) {
        const payload = JSON.parse(raw);
        if (payload && (payload.type === 'text' || payload.type === 'image')) onDropElement(payload);
      }
    } catch (_) {}
  };

  // When "Items per load" changes in settings, show that many items
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  const displayItems = items.slice(0, visibleCount);
  const hasMore = showLoadMoreButton && items.length > visibleCount;
  const isRecipes = type === 'recipes' || type === 'cms-collection' || type === 'offices';
  const isEmpty = items.length === 0;
  const emptyStateMessage = isEmpty && hasActiveFilter
    ? 'No items match your filter.'
    : 'No items';

  // Unconfigured: when requireContext, show only connect CTA; otherwise template design
  if (!connected) {
    const templateItems = items.length > 0 ? items : [];
    const templateDisplay = templateItems.slice(0, visibleCount);
    const templateHasMore = showLoadMoreButton && templateItems.length > visibleCount;
    const hasCardShapedItems = templateItems.some((i) => i.image) || templateItems.length > 0;
    const showCards = !requireContext && (isRecipes || type === 'default') && hasCardShapedItems;

    const showRibbon = !unconfiguredDesignOnly;
    const ribbonContent = showRibbon && (unconfiguredRibbonDescription ? (
      <div className="repeater-ribbon repeater-ribbon--on-top repeater-ribbon--with-button">
        <p className="repeater-ribbon__description">{unconfiguredRibbonDescription}</p>
        <button
          type="button"
          className="repeater-ribbon__btn"
          onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
        >
          {unconfiguredRibbonButtonLabel}
        </button>
      </div>
    ) : (
      <div className="repeater-ribbon repeater-ribbon--on-top" onClick={() => onConnect?.()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onConnect?.()}>
        <span className="repeater-ribbon__text">Select source</span>
      </div>
    ));

    const unconfiguredInner = requireContext ? (
      <div className="repeater-unconfigured-placeholder">
        <p>Connect a collection to display content.</p>
        <button type="button" className="repeater-connect-btn" onClick={() => onConnect?.()}>
          Connect collection
        </button>
      </div>
    ) : showCards ? (
      <>
        <div className="repeater-cards-grid">
          {templateDisplay.map((item) => (
            <RecipeCard
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              selectedElementKind={selectedItemId === item.id ? selectedElementKind : null}
              onSelect={() => onSelectItem?.(item.id)}
              onSelectElement={(kind) => onSelectItemElement?.(item.id, kind)}
            />
          ))}
        </div>
        {templateHasMore && (
          <button
            type="button"
            className="repeater-show-more"
            onClick={() => setVisibleCount((c) => Math.min(c + pageSize, templateItems.length))}
          >
            Show more
          </button>
        )}
      </>
    ) : preset === 'blank' && unconfiguredDesignOnly ? (
      <div className="repeater-blank-layout">
        <div
          className="repeater-blank-layout__header"
          role="button"
          tabIndex={0}
          title="Click to select repeater"
          aria-label="Repeater — click to select"
          onClick={(e) => {
            e.stopPropagation();
            onSelectInnerRepeater?.();
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectInnerRepeater?.(); } }}
        >
          <span className="repeater-blank-layout__label" aria-hidden>L. REPEATER</span>
          <div className="repeater-blank-layout__expand" aria-hidden title="Expand">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          </div>
        </div>
        <div className="repeater-blank-layout__columns">
          {[0, 1, 2].map((idx) => {
            const slotId = `blank-slot-${idx}`;
            const isSlotSelected = selectedItemId === slotId;
            const components = slotComponents[slotId] ?? [];
            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                className={`repeater-blank-layout__col ${isSlotSelected ? 'repeater-blank-layout__col--selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelectItem?.(slotId); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectItem?.(slotId); } }}
                aria-label={`Item slot ${idx + 1}`}
                aria-pressed={isSlotSelected}
              >
                <div className="repeater-blank-slot__content">
                  {components.map((c) => {
                    const isElementSelected = selectedBlankSlotElement?.slotId === slotId && selectedBlankSlotElement?.elementId === c.id;
                    const handleClick = (e) => {
                      e.stopPropagation();
                      onSelectBlankSlotElement?.(slotId, c.id, c.type);
                    };
                    if (c.type === 'text') {
                      return (
                        <div
                          key={c.id}
                          role="button"
                          tabIndex={0}
                          className={`repeater-blank-slot__text ${isElementSelected ? 'repeater-blank-slot__element--selected' : ''}`}
                          onClick={handleClick}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
                          aria-label="Text element"
                        >
                          {c.content || 'Text'}
                        </div>
                      );
                    }
                    if (c.type === 'image') {
                      return (
                        <div
                          key={c.id}
                          role="button"
                          tabIndex={0}
                          className={`repeater-blank-slot__img-wrap ${isElementSelected ? 'repeater-blank-slot__element--selected' : ''}`}
                          onClick={handleClick}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
                          aria-label="Image element"
                        >
                          {c.src ? (
                            <img src={c.src} alt={c.alt || ''} className="repeater-blank-slot__img" />
                          ) : (
                            <span className="repeater-blank-slot__img-placeholder">Image</span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div className="repeater-unconfigured-placeholder">
        <p>To use this container, select a source.</p>
        <button type="button" className="repeater-connect-btn" onClick={() => onConnect?.()}>
          Select source
        </button>
      </div>
    );

    const unconfiguredContent = (
      <div className="repeater-outer">
        {unconfiguredDesignOnly && isSelected && (
          <RepeaterFloatingToolbar
            onManageItems={onOpenManageItems}
            onRepeaterSettings={onOpenRepeaterSettings}
            onConnect={onOpenConnectModal ?? onConnect}
          />
        )}
      <div className={`repeater repeater--canvas repeater--unconfigured ${showCards ? 'repeater--cards' : ''} ${preset === 'blank' ? 'repeater--blank' : ''}`} data-context-type={type}>
        {ribbonContent}
        {unconfiguredDesignOnly ? (
          unconfiguredInner
        ) : (
          <div className="repeater-unconfigured__blurred">
            {unconfiguredInner}
          </div>
        )}
      </div>
      </div>
    );
    if (technicalMode || exposeContext) {
      return (
        <div className="repeater-ctx-wrapper" data-ctx={displayContextLabel}>
          <div
            className={`ctx-repeater ctx-repeater--header ${isRepeaterSelected ? 'ctx-repeater--selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRepeater?.();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectRepeater?.()}
          >
            <span className="ctx-repeater__title">Container</span>
            <span className="ctx-repeater__line">
              <strong>CTX:</strong> {displayContextLabel}{' '}
              <strong>CTX instance:</strong> {displayInstanceLabel}.{' '}
            </span>
            {headerAction === 'details' && onOpenContextDetails ? (
              <ContextDetailsLink onOpenDetails={onOpenContextDetails} />
            ) : !connected && (onOpenConnectModal ?? onConnect) ? (
              <ContextConnectLink onConnect={() => (onOpenConnectModal ?? onConnect)?.()} />
            ) : null}
          </div>
          <div
            className="repeater-ctx-content"
            role="button"
            tabIndex={0}
            title="Click to select repeater"
            aria-label="Repeater content — click to select repeater"
            onClickCapture={(e) => {
              if (!onSelectInnerRepeater) return;
              if (e.target.closest('.ctx-repeater')) return;
              e.stopPropagation();
              e.preventDefault();
              onSelectInnerRepeater();
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectInnerRepeater?.(); } }}
          >
            {unconfiguredContent}
          </div>
        </div>
      );
    }
    return unconfiguredContent;
  }

  const repeaterContent = (
    <>
      <div className="repeater-outer">
        {isSelected && (
          <RepeaterFloatingToolbar
            onManageItems={onOpenManageItems}
            onRepeaterSettings={onOpenRepeaterSettings}
            onConnect={onOpenConnectModal}
          />
        )}
        <div
          className={`repeater repeater--canvas ${isRecipes ? 'repeater--cards' : ''} ${isDragOver ? 'repeater--drop-target' : ''}`}
          data-context-type={type}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
      {isRecipes && items.some((i) => i.image) ? (
        <>
          {isEmpty ? (
            <div className="repeater-empty-state">
              <span className="repeater-empty-state__message">{emptyStateMessage}</span>
            </div>
          ) : (
            <>
              <div className="repeater-cards-grid">
                {displayItems.map((item) => (
                  <div key={item.id} className="repeater-item-with-dropped">
                    <RecipeCard
                      item={item}
                      isSelected={selectedItemId === item.id}
                      selectedElementKind={selectedItemId === item.id ? selectedElementKind : null}
                      onSelect={() => onSelectItem?.(item.id)}
                      onSelectElement={(kind) => onSelectItemElement?.(item.id, kind)}
                    />
                    {droppedElements?.length > 0 && (
                      <div className="repeater-dropped-elements">
                        {droppedElements.map((el, i) =>
                          el.type === 'text' ? (
                            <span key={i} className="repeater-dropped-text">{el.content ?? ''}</span>
                          ) : el.type === 'image' ? (
                            <img key={i} src={el.src ?? ''} alt={el.alt ?? ''} className="repeater-dropped-img" />
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {hasMore && (
                <button
                  type="button"
                  className="repeater-show-more"
                  onClick={() => setVisibleCount((c) => Math.min(c + pageSize, items.length))}
                >
                  Show more
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="repeater-items-row">
            {isEmpty ? (
              <div className="repeater-empty-state">
                <span className="repeater-empty-state__message">{emptyStateMessage}</span>
              </div>
            ) : (
              displayItems.map((item) => (
                <div key={item.id} className="repeater-item-with-dropped">
                  <RepeaterChip
                    item={item}
                    contextType={type}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => onSelectItem?.(item.id)}
                  />
                  {droppedElements?.length > 0 && (
                    <div className="repeater-dropped-elements">
                      {droppedElements.map((el, i) =>
                        el.type === 'text' ? (
                          <span key={i} className="repeater-dropped-text">{el.content ?? ''}</span>
                        ) : el.type === 'image' ? (
                          <img key={i} src={el.src ?? ''} alt={el.alt ?? ''} className="repeater-dropped-img" />
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {hasMore && (
            <button
              type="button"
              className="repeater-show-more"
              onClick={() => setVisibleCount((c) => Math.min(c + pageSize, items.length))}
            >
              Show more
            </button>
          )}
        </>
      )}
        </div>
      </div>
    </>
  );

  if (technicalMode || exposeContext) {
    return (
      <div className="repeater-ctx-wrapper" data-ctx={displayContextLabel}>
        <div
          className={`ctx-repeater ctx-repeater--header ${isRepeaterSelected ? 'ctx-repeater--selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRepeater?.();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectRepeater?.()}
        >
          <span className="ctx-repeater__title">Container</span>
          <span className="ctx-repeater__line">
            <strong>CTX:</strong> {displayContextLabel}{' '}
            <strong>CTX instance:</strong> {displayInstanceLabel}.{' '}
          </span>
          {headerAction === 'details' && onOpenContextDetails ? (
            <ContextDetailsLink onOpenDetails={onOpenContextDetails} />
          ) : !connected && (onOpenConnectModal ?? onConnect) ? (
            <ContextConnectLink onConnect={() => (onOpenConnectModal ?? onConnect)?.()} />
          ) : null}
        </div>
        <div
          className="repeater-ctx-content"
          role="button"
          tabIndex={0}
          title="Click to select repeater"
          aria-label="Repeater content — click to select repeater"
          onClickCapture={(e) => {
            if (!onSelectInnerRepeater) return;
            if (e.target.closest('.ctx-repeater')) return;
            e.stopPropagation();
            e.preventDefault();
            onSelectInnerRepeater();
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectInnerRepeater?.(); } }}
        >
          {repeaterContent}
        </div>
      </div>
    );
  }

  /* Normal mode: don't show context */
  return repeaterContent;
}

/** "Connect" link in repeater header – opens connect/replace collection modal */
function ContextConnectLink({ onConnect }) {
  return (
    <button
      type="button"
      className="ctx-connect-link"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onConnect?.();
      }}
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
  );
}

/** "View details" link in repeater header – opens context instance details panel (Harmony) */
function ContextDetailsLink({ onOpenDetails }) {
  return (
    <button
      type="button"
      className="ctx-connect-link"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenDetails?.();
      }}
    >
      View details
    </button>
  );
}

/** Format context instance (pagination, filter, sort) for technical mode display */
function formatContextInstance(instance) {
  if (!instance) return '';
  const lines = [];
  if (instance.pagination) {
    const p = instance.pagination;
    lines.push('pagination: {');
    lines.push(`  pageSize: ${p.pageSize ?? 4}`);
    lines.push('}');
  }
  if (instance.filter != null) {
    const rules = Array.isArray(instance.filter) ? instance.filter : instance.filter?.rules ?? [];
    lines.push('filter: ' + (rules.length ? `${rules.length} rule(s)` : '[]'));
    if (rules.length) {
      rules.forEach((r, i) => {
        lines.push(`  [${i}] ${r.field ?? '?'} ${r.condition ?? '?'} "${r.value ?? ''}"`);
      });
    }
  }
  if (instance.sort != null) {
    const s = typeof instance.sort === 'string' ? instance.sort : instance.sort?.option ?? 'default';
    lines.push('sort: "' + s + '"');
  }
  return lines.join('\n');
}

function InnerElementHandles() {
  const positions = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'];
  return (
    <div className="inner-element-handles" aria-hidden>
      {positions.map((p) => (
        <span key={p} className={`inner-element-handles__dot inner-element-handles__dot--${p}`} />
      ))}
    </div>
  );
}

function RecipeCard({ item, isSelected, selectedElementKind, onSelect, onSelectElement }) {
  const label = item.title ?? item.name ?? item.id;
  const fallbackUrl = `https://placehold.co/400x300/5f6368/ffffff?text=${encodeURIComponent(String(label).slice(0, 20))}`;
  const effectiveImageUrl = item.boundFieldImage && item[item.boundFieldImage] != null ? String(item[item.boundFieldImage]) : (item.image || fallbackUrl);
  const effectiveImageAlt = item.boundFieldImageAlt && item[item.boundFieldImageAlt] != null ? String(item[item.boundFieldImageAlt]) : (item.imageAlt ?? '');
  const effectiveImageLink = item.boundFieldImageLink && item[item.boundFieldImageLink] != null ? String(item[item.boundFieldImageLink]) : (item.imageLink ?? '');
  const [imageSrc, setImageSrc] = useState(effectiveImageUrl);
  useEffect(() => {
    setImageSrc(effectiveImageUrl);
  }, [effectiveImageUrl, item.id]);
  const handleImageError = () => {
    setImageSrc((current) => (current !== fallbackUrl ? fallbackUrl : current));
  };
  const buttonText = item.boundFieldButtonText && item[item.boundFieldButtonText] != null ? String(item[item.boundFieldButtonText]) : (item.buttonText ?? 'Read recipe');
  const effectiveButtonLink = item.boundFieldButtonLink && item[item.boundFieldButtonLink] != null ? String(item[item.boundFieldButtonLink]) : (item.buttonLink ?? '');
  const handleElementClick = (e, kind) => {
    e.stopPropagation();
    onSelectElement?.(kind);
  };
  const elementLabels = { image: 'Image', text: 'Text', button: 'Button' };
  const elementId = selectedElementKind ? `#${selectedElementKind}-${item.id}` : '';
  return (
    <article
      className={`recipe-card ${isSelected ? 'recipe-card--selected' : ''}`}
      data-repeater-item
      aria-label={isSelected && !selectedElementKind ? 'Container item selected' : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
    >
      {isSelected && !selectedElementKind && (
        <span className="recipe-card__item-selected-label" aria-hidden>Item selected</span>
      )}
      {(() => {
        const imageConnected = !!(item.boundFieldImage && String(item.boundFieldImage).trim() !== '');
        return (
      <div
        className={`recipe-card__image-outer recipe-card__inner-element-wrap ${selectedElementKind === 'image' ? 'recipe-card__image-wrap--selected' : ''} ${selectedElementKind === 'image' && imageConnected ? 'recipe-card__element--connected' : ''}`}
        onClick={(e) => handleElementClick(e, 'image')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleElementClick(e, 'image')}
      >
        {selectedElementKind === 'image' && (
          <>
            <span className="inner-element-badge" aria-hidden>
              &lt; Item – {elementLabels.image} {elementId}
            </span>
            <InnerElementHandles />
          </>
        )}
        <div className="recipe-card__image-wrap">
          {selectedElementKind === 'image' && (
            <span className="recipe-card__image-selected-label" aria-hidden>Item – Image selected</span>
          )}
          {effectiveImageLink ? (
            <a href={effectiveImageLink} className="recipe-card__image-link" onClick={(e) => e.preventDefault()}>
              <img src={imageSrc} alt={effectiveImageAlt} className="recipe-card__image" onError={handleImageError} />
            </a>
          ) : (
            <img src={imageSrc} alt={effectiveImageAlt} className="recipe-card__image" onError={handleImageError} />
          )}
        </div>
      </div>
        );
      })()}
      {(() => {
        const textConnected = !!(item.boundField && String(item.boundField).trim() !== '');
        return (
      <div className={`recipe-card__name-wrap recipe-card__inner-element-wrap ${selectedElementKind === 'text' ? 'recipe-card__name-wrap--selected' : ''} ${selectedElementKind === 'text' && textConnected ? 'recipe-card__element--connected' : ''}`}>
        {selectedElementKind === 'text' && (
          <>
            <span className="inner-element-badge" aria-hidden>
              &lt; Item – {elementLabels.text} {elementId}
            </span>
            <InnerElementHandles />
          </>
        )}
        {(() => {
          const Tag = (item.headingLevel && ['h1', 'h2', 'h3', 'p'].includes(item.headingLevel)) ? item.headingLevel : 'h3';
          const textStyle = {
            ...(item.fontSize && { fontSize: `${item.fontSize}px` }),
            ...(item.fontFamily && { fontFamily: item.fontFamily }),
            ...(item.textColor && { color: item.textColor }),
            ...(item.textBold && { fontWeight: 'bold' }),
            ...(item.textItalic && { fontStyle: 'italic' }),
            ...(item.textUnderline && { textDecoration: 'underline' }),
            ...((item.textUnderline || item.textStrikethrough) && { textDecoration: [item.textUnderline && 'underline', item.textStrikethrough && 'line-through'].filter(Boolean).join(' ') }),
            ...(item.textAlign && { textAlign: item.textAlign }),
          };
          const content = item.boundField && item[item.boundField] != null ? String(item[item.boundField]) : (item.title ?? item.name ?? '');
          const inner = item.textLink ? <a href={item.textLink} className="recipe-card__name-link" onClick={(e) => e.preventDefault()}>{content}</a> : content;
          return (
            <Tag
              className={`recipe-card__name ${selectedElementKind === 'text' ? 'recipe-card__name--selected' : ''}`}
              style={Object.keys(textStyle).length ? textStyle : undefined}
              onClick={(e) => handleElementClick(e, 'text')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleElementClick(e, 'text')}
            >
              {inner}
            </Tag>
          );
        })()}
      </div>
        );
      })()}
      {(() => {
        const buttonConnected = !!(item.boundFieldButtonText && String(item.boundFieldButtonText).trim() !== '') || !!(item.boundFieldButtonLink && String(item.boundFieldButtonLink).trim() !== '');
        return (
      <div className={`recipe-card__btn-wrap recipe-card__inner-element-wrap ${selectedElementKind === 'button' ? 'recipe-card__btn-wrap--selected' : ''} ${selectedElementKind === 'button' && buttonConnected ? 'recipe-card__element--connected' : ''}`}>
        {selectedElementKind === 'button' && (
          <>
            <span className="inner-element-badge" aria-hidden>
              &lt; Item – {elementLabels.button} {elementId}
            </span>
            <InnerElementHandles />
          </>
        )}
        {effectiveButtonLink ? (
          <a href={effectiveButtonLink} className="recipe-card__btn-link" onClick={(e) => { e.preventDefault(); handleElementClick(e, 'button'); }}>
            <span
              className={`recipe-card__btn ${selectedElementKind === 'button' ? 'recipe-card__btn--selected' : ''}`}
              role="button"
              tabIndex={0}
            >
              {buttonText}
            </span>
          </a>
        ) : (
          <span
            className={`recipe-card__btn ${selectedElementKind === 'button' ? 'recipe-card__btn--selected' : ''}`}
            onClick={(e) => handleElementClick(e, 'button')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleElementClick(e, 'button')}
          >
            {buttonText}
          </span>
        )}
      </div>
        );
      })()}
    </article>
  );
}

function RepeaterChip({ item, contextType, isSelected, onSelect }) {
  const label = getItemLabel(item, contextType);
  return (
    <span
      className={`repeater-chip ${isSelected ? 'repeater-chip--selected' : ''}`}
      data-repeater-item
      aria-label={isSelected ? `Container item selected: ${label}` : undefined}
      title={isSelected ? 'Item selected' : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
    >
      {label}
    </span>
  );
}

function getItemLabel(item, contextType) {
  if (contextType === 'cms-collection' || contextType === 'recipes') return item.title;
  if (contextType === 'seamless') return item.label;
  if (contextType === 'e-com') return item.name;
  if (contextType === 'bookends') return item.title;
  return item.title || item.name || item.label || item.id;
}
