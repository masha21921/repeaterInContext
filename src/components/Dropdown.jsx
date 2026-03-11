export function Dropdown({ options, value, onChange, isSelected, onSelect }) {
  return (
    <div
      className={`dropdown-component ${isSelected ? 'selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      style={{ padding: '8px', border: isSelected ? '2px solid blue' : '1px solid #ccc', margin: '4px 0', borderRadius: '4px' }}
    >
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
      >
        <option value="" disabled>Select an option</option>
        {(options || ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
