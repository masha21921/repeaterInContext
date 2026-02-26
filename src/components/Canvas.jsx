import './Canvas.css';

/**
 * Canvas — design surface like Wix Studio: white page, viewport label, 1280px width.
 */
export function Canvas({ children, className = '' }) {
  return (
    <div className={`canvas ${className}`.trim()}>
      <div className="canvas-viewport-label">Desktop (Primary)</div>
      <div className="canvas-background" aria-hidden />
      <div className="canvas-content">
        {children}
      </div>
    </div>
  );
}
