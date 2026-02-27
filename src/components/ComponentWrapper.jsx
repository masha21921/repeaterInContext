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
      className={`component-wrapper ${isSelected ? 'component-wrapper--selected' : ''} ${isSelected && connected ? 'component-wrapper--connected' : ''} ${draggablePayload ? 'component-wrapper--draggable' : ''}`}
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
      <div className="component-wrapper__content">{children}</div>
    </div>
  );
}
