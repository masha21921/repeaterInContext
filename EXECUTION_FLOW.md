# Execution Flow Architecture

## Overview

Different input purposes require different execution triggers and workflows. This document outlines how filters, updates, and other actions should be configured.

## 1. Filter Execution Flow

### Option A: Immediate Filtering (Current Implementation)
```
User changes filter input → onChange fires → setFilter() executes immediately
```

**When to use:**
- Single filter or first in a cascade
- Real-time search/filtering UX
- Small datasets

**Configuration:**
```
Input Purpose: Filter Items
├─ Apply filter immediately on change: ✓ (checked)
└─ Trigger: onChange
```

### Option B: Deferred Filtering (Button-triggered)
```
User changes filter input → onChange updates draft filter state
User clicks "Apply Filters" button → setFilter() executes
```

**When to use:**
- Multiple filters that should be applied together
- Large datasets (reduce re-filtering)
- Users need to review filters before applying

**Configuration:**
```
Input Purpose: Filter Items
├─ Apply filter immediately on change: ☐ (unchecked)
├─ Trigger: Button Click
└─ Connected Button Action: Apply Filters
```

### Option C: Conditional Filtering
```
User changes filter input + meets condition → setFilter() executes
E.g., only filter after 3+ characters entered
```

**Configuration:**
```
Input Purpose: Filter Items
├─ Apply filter immediately on change: ☐ (unchecked)
├─ Trigger: Conditional
├─ Condition: Input length >= 3
└─ Debounce: 300ms
```

---

## 2. Update/Create Execution Flow

### Current Implementation
```
User enters values in input fields → onChange updates draft state
User clicks "Submit" button → Create/Update mutation executes
```

### Recommendation: Add "Execution Mode" Setting

**Proposed UI Section:**

```
Input Purpose: Edit Field - Create New Item
├─ Trigger Mode
│  ├─ Button Click (Recommended)
│  │  └─ Connected Button: Select Submit button
│  ├─ onChange (Advanced)
│  │  └─ Auto-save after X seconds
│  └─ On Blur (Text inputs only)
│      └─ Save field individually
└─ Conflict Resolution
   ├─ Ask User
   ├─ Overwrite
   └─ Merge
```

---

## 3. Proposed Settings Panel Extensions

### For Filter Inputs

**Add "Filter Execution" section:**

```jsx
<Section title="Filter Execution">
  <RadioGroup
    options={[
      { value: 'immediate', label: 'Apply immediately on change' },
      { value: 'button', label: 'Apply on button click' },
      { value: 'conditional', label: 'Apply on condition' }
    ]}
    value={component.filterTrigger}
    onChange={(trigger) => onChange({ filterTrigger: trigger })}
  />

  {component.filterTrigger === 'button' && (
    <Select
      label="Connected Button"
      value={component.triggerButton}
      options={/* List of buttons in same section */}
      placeholder="Select Apply button..."
    />
  )}

  {component.filterTrigger === 'conditional' && (
    <>
      <Select
        label="Condition"
        options={[
          { value: 'length', label: 'Input length' },
          { value: 'value', label: 'Value matches' },
          { value: 'custom', label: 'Custom function' }
        ]}
      />
      {/* Show additional inputs based on condition type */}
    </>
  )}

  {component.filterTrigger === 'immediate' && (
    <Checkbox
      label="Debounce input"
      help="Reduce re-filtering frequency"
      defaultValue={true}
    />
  )}
</Section>
```

### For Edit Field Inputs

**Add "Execution Mode" section:**

```jsx
<Section title="Execution Mode">
  <RadioGroup
    options={[
      { value: 'buttonClick', label: 'On button click (Recommended)', help: 'Requires a connected Submit button' },
      { value: 'onChange', label: 'On change (Auto-save)', help: 'Advanced - saves immediately' },
      { value: 'onBlur', label: 'On blur (Text inputs only)', help: 'Save when user leaves field' }
    ]}
    value={component.executionMode}
    onChange={(mode) => onChange({ executionMode: mode })}
  />

  {component.executionMode === 'buttonClick' && (
    <Select
      label="Connected Button"
      value={component.triggerButton}
      options={/* List of buttons in same section */}
      placeholder="Select Submit button..."
    />
  )}

  {component.executionMode === 'onChange' && (
    <>
      <NumberInput
        label="Auto-save delay"
        value={component.autoSaveDelay}
        min={300}
        max={5000}
        unit="ms"
        defaultValue={500}
      />
      <Checkbox
        label="Show saving indicator"
        defaultValue={true}
      />
    </>
  )}

  {component.executionMode === 'buttonClick' && (
    <Select
      label="On Conflict"
      options={[
        { value: 'ask', label: 'Ask user' },
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'merge', label: 'Merge changes' }
      ]}
      help="What to do if data changed externally"
    />
  )}
</Section>
```

---

## 4. Configuration Data Model

### Filter Configuration
```typescript
interface FilterInputConfig {
  role: 'filter';
  boundContext: string;
  boundField: string;
  
  // Execution
  triggerMode: 'immediate' | 'button' | 'conditional';
  debounce?: number; // ms, for immediate
  triggerButtonId?: string; // for button mode
  condition?: {
    type: 'length' | 'value' | 'custom';
    value: any;
    customFn?: string;
  };
  
  // Display
  applyFilterImmediately?: boolean; // Legacy, maps to triggerMode
}
```

### Edit Field Configuration
```typescript
interface EditFieldInputConfig {
  role: 'edit-update' | 'edit-create';
  boundContext: string;
  boundField: string;
  
  // Execution
  executionMode: 'buttonClick' | 'onChange' | 'onBlur';
  triggerButtonId?: string; // for buttonClick mode
  autoSaveDelay?: number; // for onChange mode
  showSavingIndicator?: boolean;
  
  // Conflict resolution
  conflictResolution: 'ask' | 'overwrite' | 'merge';
  
  // Validation
  customValidation?: string;
  customValidationFunction?: string;
  regex?: string;
}
```

---

## 5. Execution Engine Logic

### For Filters
```typescript
function handleFilterInputChange(value, config) {
  if (config.triggerMode === 'immediate') {
    if (config.debounce) {
      debounce(() => context.setFilter(config.boundField, value), config.debounce);
    } else {
      context.setFilter(config.boundField, value);
    }
  } else if (config.triggerMode === 'conditional') {
    if (evaluateCondition(value, config.condition)) {
      context.setFilter(config.boundField, value);
    }
  }
  // 'button' mode: do nothing, wait for button click
}
```

### For Updates/Creates
```typescript
function handleSubmitButton(config) {
  if (config.executionMode === 'buttonClick') {
    context.submitUpdate(config.boundField, draftState[config.boundField]);
  }
}

function handleEditFieldChange(value, config) {
  updateDraftState(config.boundField, value);
  
  if (config.executionMode === 'onChange') {
    debounce(
      () => context.submitUpdate(config.boundField, value),
      config.autoSaveDelay || 500
    );
  } else if (config.executionMode === 'onBlur') {
    // Store for onBlur handler
  }
}

function handleEditFieldBlur(config) {
  if (config.executionMode === 'onBlur') {
    context.submitUpdate(config.boundField, draftState[config.boundField]);
  }
}
```

---

## 6. UI/UX Recommendations

### For Users
1. **Default to safe patterns**: Button-triggered updates by default (less data loss risk)
2. **Warn about patterns**: Show hints when using onChange with destructive operations
3. **Visual indicators**: Show auto-save status and conflict warnings
4. **Test mode**: Let users test filter/update logic before deploying

### For Developers
1. **Validation hooks**: Execute validation before submission
2. **Error handling**: Graceful degradation if trigger button isn't found
3. **Analytics**: Track which execution modes are used
4. **Performance**: Track debounce effectiveness

---

## 7. Migration from Current Implementation

**Current state:**
- Filters: `applyFilterImmediately` boolean checkbox

**Migration path:**
1. Map old `applyFilterImmediately` to new `triggerMode`:
   - `true` → `'immediate'`
   - `false` → `'button'`
2. Preserve `triggerButtonId` from component if already set
3. Add new `triggerMode` field to settings panel

---

## Example: Complete Filter Configuration

```json
{
  "type": "dropdown",
  "role": "filter",
  "boundContext": "recipes",
  "boundField": "course",
  
  "triggerMode": "immediate",
  "debounce": 300,
  
  "optionsSourceType": "dynamic",
  "optionsSource": "same",
  
  "customValidation": "none"
}
```

## Example: Complete Update Configuration

```json
{
  "type": "textInput",
  "role": "edit-update",
  "boundContext": "recipes",
  "boundField": "title",
  
  "executionMode": "buttonClick",
  "triggerButtonId": "btn-submit-recipe",
  "conflictResolution": "ask",
  
  "customValidation": "validateTitle",
  "customValidationFunction": "myCustomValidator",
  "regex": "^[a-zA-Z0-9\\s]{1,200}$"
}
```
