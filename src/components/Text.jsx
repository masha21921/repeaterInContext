import { useRef, useLayoutEffect, useEffect } from 'react';
import './Text.css';

const PLACEHOLDER = 'Add your text here';

/**
 * Text component – text block on stage. Editable inline when selected and in the settings panel.
 */
export function Text({ content = '', isSelected, onSelect, onChange }) {
  const editableRef = useRef(null);

  // Sync from props when not focused so panel edits apply and cursor doesn't jump
  useLayoutEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      const value = (content ?? '').trim() ? content : '';
      el.textContent = value || PLACEHOLDER;
    }
  }, [content, isSelected]);

  const handleInput = (e) => {
    const value = e.currentTarget.textContent ?? '';
    onChange?.(value === PLACEHOLDER ? '' : value);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.();
  };

  const displayContent = (content ?? '').trim() ? content : PLACEHOLDER;

  return (
    <div
      className={`text-component ${isSelected ? 'text-component--selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isSelected && onSelect?.()}
    >
      {isSelected ? (
        <span
          ref={editableRef}
          className="text-component__content text-component__content--editable"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={PLACEHOLDER}
        />
      ) : (
        <span className="text-component__content">{displayContent}</span>
      )}
    </div>
  );
}
