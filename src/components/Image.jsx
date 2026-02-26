import './Image.css';

const PLACEHOLDER_SRC = '';

/**
 * Image component – image block on stage. Select to edit src/alt in settings panel.
 */
export function Image({ src = '', alt = '', isSelected, onSelect }) {
  const displaySrc = (src ?? '').trim() || null;
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <div
      className={`image-component ${isSelected ? 'image-component--selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isSelected && onSelect?.()}
      aria-label={alt || 'Image'}
    >
      {displaySrc ? (
        <img src={displaySrc} alt={alt || ''} className="image-component__img" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
      ) : (
        <div className="image-component__placeholder">
          <span className="image-component__placeholder-icon" aria-hidden>🖼</span>
          <span className="image-component__placeholder-text">Add image</span>
        </div>
      )}
    </div>
  );
}
