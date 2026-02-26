/**
 * Apply filter rules to a list of items. Each rule has { field, condition, value }.
 * Only items matching all rules are returned.
 */
const CONDITION_NEEDS_VALUE = new Set(['contains', 'does not contain', 'equals', 'starts with', 'ends with']);

function getFieldValue(item, field) {
  if (field === 'title') return (item.title ?? item.name ?? '').toString();
  if (field === 'buttonText') return (item.buttonText ?? '').toString();
  if (field === 'image') return (item.image ?? '').toString();
  if (field === 'description') return (item.description ?? '').toString();
  if (field === 'course') return (item.course ?? '').toString();
  return (item[field] ?? '').toString();
}

function ruleMatches(item, rule) {
  const val = getFieldValue(item, rule.field);
  const value = (rule.value ?? '').trim().toLowerCase();
  const needVal = CONDITION_NEEDS_VALUE.has(rule.condition);

  switch (rule.condition) {
    case 'contains':
      return needVal && val.toLowerCase().includes(value);
    case 'does not contain':
      return needVal && !val.toLowerCase().includes(value);
    case 'equals':
      return needVal && val.toLowerCase() === value;
    case 'starts with':
      return needVal && val.toLowerCase().startsWith(value);
    case 'ends with':
      return needVal && val.toLowerCase().endsWith(value);
    case 'is empty':
      return val.trim() === '';
    case 'is not empty':
      return val.trim() !== '';
    default:
      return true;
  }
}

export function applyFilterRules(items, filterRules) {
  if (!filterRules?.length) return items;
  return items.filter((item) => filterRules.every((rule) => ruleMatches(item, rule)));
}
