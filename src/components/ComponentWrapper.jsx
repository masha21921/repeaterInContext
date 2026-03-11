import './ComponentWrapper.css';

/**
 * Wraps a stage component (e.g. Repeater, Text, Image) with selection.
 * When draggablePayload is set (e.g. for Text/Image), the component can be dragged onto a repeater.
 * Delete is done via settings panel when component is selected.
 */
export function ComponentWrapper({ children, isSelected, onSelect, draggablePayload, connected }) {
  const handleDragStart = (e) => {
    if (!draggablePayload) return;
    e.dataTransfer.setData('application/x-repeater-element', JSON.stringify(draggablePayload));
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', ''); // some browsers need this
  };

  return (
    <div
      className={`component-wrapper ${isSelected ? 'component-wrapper--selected' : ''} ${connected ? 'component-wrapper--connected' : ''} ${draggablePayload ? 'component-wrapper--draggable' : ''}`}
      draggable={!!draggablePayload}
      onDragStart={draggablePayload ? handleDragStart : undefined}
      onClick={(e) => {
        if (e.target.closest('.recipe-card') || e.target.closest('[data-repeater-item]')) return;
        if (e.target.closest('.ctx-repeater')) return;
        e.stopPropagation();
        onSelect?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
    >
      {connected && (
        <div className="component-wrapper__bound-indicator" title="Bound to context">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
      )}
      <div className="component-wrapper__content">{children}</div>
    </div>
  );
}
