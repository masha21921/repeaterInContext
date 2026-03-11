export function Button({ label, isSelected, onSelect }) {
  return (
    <div
      className={`button-component-wrapper ${isSelected ? 'selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      style={{ padding: '4px', border: isSelected ? '2px solid blue' : '2px solid transparent', margin: '4px 0', display: 'inline-block', borderRadius: '4px' }}
    >
      <button style={{ padding: '8px 16px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px' }}>
        {label || 'Submit'}
      </button>
    </div>
  );
}
