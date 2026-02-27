import './Stage.css';

/**
 * Wix Editor Stage — the page where you add components.
 * Contains sections; components (e.g. Repeater) live inside sections.
 * Page can be selected to assign context at page level.
 * pageContexts: array of { label, instanceLabel } for each attached context (supports multiple).
 */
export function Stage({
  children,
  className = '',
  isPageSelected,
  onSelectPage,
  /** Single-context legacy: if provided, used as sole context line. */
  pageContextLabel,
  pageContextInstanceLabel,
  /** Multi-context: list of { label, instanceLabel } to display (overrides single if length > 0). */
  pageContexts = [],
  showPageContextLabel = true,
  onOpenPageConnect,
  /** When false, Connect/Replace button is hidden (e.g. in Harmony when page header is hidden). */
  showPageConnectButton = true,
  /** When true, button shows "Replace" instead of "Connect". */
  hasPageContext = false,
  /** When false, the page header (Page + CTX + Connect) is not rendered (e.g. Harmony). */
  showPageHeader = true,
}) {
  const contextsToShow = Array.isArray(pageContexts) && pageContexts.length > 0
    ? pageContexts
    : (pageContextLabel != null || pageContextInstanceLabel != null
      ? [{ label: pageContextLabel ?? '—', instanceLabel: pageContextInstanceLabel ?? '—' }]
      : []);

  return (
    <div className={`stage ${className}`.trim()}>
      <div className="stage-viewport-label">Desktop (Primary)</div>
      <div
        className={`stage-background ${isPageSelected ? 'stage-background--selected' : ''}`}
        role={onSelectPage ? 'button' : undefined}
        tabIndex={onSelectPage ? 0 : undefined}
        onClick={onSelectPage ?? undefined}
        onKeyDown={onSelectPage ? (e) => e.key === 'Enter' && onSelectPage() : undefined}
        aria-hidden={!onSelectPage}
      />
      <div className="stage-page">
        {showPageHeader && onSelectPage && (
          <div
            className={`stage-page-header ${isPageSelected ? 'stage-page-header--selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSelectPage(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectPage()}
          >
            <span>Page</span>
            {showPageContextLabel && (
              <span className="stage-page-header__ctx">
                {contextsToShow.length === 0 ? (
                  <span className="stage-page-header__ctx-line">
                    <strong>CTX:</strong> — <strong>CTX instance:</strong> —
                  </span>
                ) : (
                  contextsToShow.map((ctx, i) => (
                    <span key={i} className="stage-page-header__ctx-line">
                      <strong>CTX:</strong> {ctx.label ?? '—'}{' '}
                      <strong>CTX instance:</strong> {ctx.instanceLabel ?? '—'}
                      {i < contextsToShow.length - 1 ? ', ' : ''}
                    </span>
                  ))
                )}
              </span>
            )}
            {onOpenPageConnect && showPageConnectButton && (
              <button
                type="button"
                className="stage-page-header__connect ctx-connect-link"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onOpenPageConnect(); }}
                title={hasPageContext ? 'Settings' : 'Connect to context'}
                aria-label={hasPageContext ? 'Settings' : 'Connect to context'}
              >
                <span className="ctx-connect-link__icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="7" cy="12" r="2.5" fill="none" />
                    <circle cx="17" cy="12" r="2.5" fill="none" />
                    <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                  </svg>
                </span>
                {hasPageContext ? 'Settings' : 'Connect'}
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
