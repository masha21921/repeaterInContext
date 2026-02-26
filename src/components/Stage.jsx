import './Stage.css';

/**
 * Wix Editor Stage — the page where you add components.
 * Contains sections; components (e.g. Repeater) live inside sections.
 * Page can be selected to assign context at page level.
 */
export function Stage({
  children,
  className = '',
  isPageSelected,
  onSelectPage,
  technicalMode,
  pageContextLabel,
  pageContextInstanceLabel,
  showPageContextLabel = true,
  onOpenPageConnect,
  /** When false, Connect button is hidden (e.g. when page is already connected). */
  showPageConnectButton = true,
}) {
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
        {onSelectPage && (
          <div
            className={`stage-page-header ${isPageSelected ? 'stage-page-header--selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSelectPage(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectPage()}
          >
            <span>Page</span>
            {showPageContextLabel && (
              <span className="stage-page-header__ctx-line">
                <strong>CTX:</strong> {pageContextLabel ?? '—'}{' '}
                <strong>CTX instance:</strong> {pageContextInstanceLabel ?? '—'}
              </span>
            )}
            {onOpenPageConnect && showPageConnectButton && (
              <button
                type="button"
                className="stage-page-header__connect ctx-connect-link"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onOpenPageConnect(); }}
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
        )}
        {children}
      </div>
    </div>
  );
}
