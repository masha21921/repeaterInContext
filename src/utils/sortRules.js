/**
 * Apply sort rules to a list of items. Each rule has { fieldId, direction: 'asc' | 'desc' }.
 */
function getFieldValue(item, fieldId) {
  if (fieldId === 'title') return (item.title ?? item.name ?? '').toString();
  if (fieldId === 'dateCreated') return (item._createdDate ?? item._updatedDate ?? item.id ?? '').toString();
  if (fieldId === 'name') return (item.name ?? item.title ?? '').toString();
  if (fieldId === 'description') return (item.description ?? '').toString();
  if (fieldId === 'course') return (item.course ?? '').toString();
  if (fieldId === 'author') return (item.author ?? '').toString();
  if (fieldId === 'code') return (item.code ?? '').toString();
  if (fieldId === 'year') return (item.year ?? 0);
  if (fieldId === 'label') return (item.label ?? '').toString();
  if (fieldId === 'value') return (item.value ?? 0);
  return (item[fieldId] ?? '').toString();
}

export function applySortRules(items, sortRules) {
  if (!sortRules?.length) return [...items];
  const sorted = [...items];
  sorted.sort((a, b) => {
    for (const rule of sortRules) {
      const aVal = getFieldValue(a, rule.fieldId);
      const bVal = getFieldValue(b, rule.fieldId);
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      if (cmp !== 0) return rule.direction === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
  return sorted;
}

/** Human-readable summary of sort rules for display (e.g. "Date created (New → Old)"). */
export function getSortSummary(sortRules, availableFields = []) {
  if (!sortRules?.length) return 'Default';
  const fieldById = Object.fromEntries((availableFields || []).map((f) => [f.id, f.label]));
  return sortRules
    .map((r) => {
      const label = fieldById[r.fieldId] ?? r.fieldId;
      const dir = r.direction === 'desc' ? 'New → Old' : 'Old → New';
      return `${label} (${dir})`;
    })
    .join(', ');
}
