export function TextInput({ value, placeholder, onChange, isSelected, onSelect }) {
  return (
    <div
      className={`text-input-component ${isSelected ? 'selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      style={{ padding: '8px', border: isSelected ? '2px solid blue' : '1px solid #ccc', margin: '4px 0', borderRadius: '4px' }}
    >
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder || 'Enter text...'}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
      />
    </div>
  );
}
