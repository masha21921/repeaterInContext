# Input Components Binding System

## Overview

The Input Components editor enables designers and developers to create interactive forms with seamless context binding. Input components (text inputs, dropdowns) and buttons can be connected to context providers, allowing them to filter, sort, edit, and create items without writing code.

## Core Concepts

### Input Purpose (What is this input for?)

Instead of thinking in terms of technical `onChange` event handlers, the system uses **Input Purpose**—a semantic, user-friendly way to describe what an input does in your application. Also known as the `onChange` handler conceptually.

**Available Input Purposes:**

1. **Edit Field - Update Existing Item**
   - Updates a field on an existing item in the context
   - Changes are saved to a draft state
   - Requires a "Submit" button to persist changes to the database
   - Includes validation rules
   - *Note: "Trigger on change" is unchecked by default for updates*

2. **Edit Field - Create New Item**
   - Populates fields for a brand new item being created
   - Changes accumulate in a draft state
   - Requires a Submit button to create the item
   - Includes validation rules

3. **Filter Items**
   - Filters the context's items based on the selected field value
   - Can apply immediately on change or wait for an "Apply Filters" button
   - Supports cascading filters (multiple filters work together automatically)
   - Only shows valid options in dependent filters
   - *Note: "Trigger on change" is checked by default for filters*

4. **Sort Items**
   - Sorts the context's items by the selected field
   - Can sort ascending or descending
   - *Note: Only available for dropdowns, not text inputs*

### Input Types

#### Text Input
- **Purpose Options**: Edit Field (Update/Create), Filter only
  - Sort is not available for text inputs
- **Target Field**: Connects to a specific field in the context
- **No special options**: Updates directly

#### Dropdown
- **Purpose Options**: Edit Field (Update/Create), Filter, Sort
- **Target Field**: Connects to a specific field in the context
- **Options Source**: Determines where dropdown choices come from
  - **Dynamic (From Context)**
    - Same as Target Field: Uses unique values from that field
    - Another Context/Field: Pulls options from a different context or field (useful for reference data)
  - **Static (Manual)**: User defines a comma-separated list of options

#### Button
- **Purposes**: Submit Create, Submit Update, Apply Filters, Delete Item
- **No target field needed**: Triggers an action when clicked
- **Connected to a context**: Performs the action on items in that context

## Binding Flow

### Step 1: Select Source (Context)
Choose which context this input is connected to. Only contexts available from parent containers (Page or Section) appear in the dropdown.

### Step 2: What is this input for?
Select the input's purpose. This determines the role it plays:
- Will it edit data? Filter? Sort?
- The system automatically handles the correct behavior

### Step 3: Target Field (if applicable)
Select the specific field from the context that this purpose applies to:
- For filters: "Field to filter by"
- For editing: "Field to update" or "Field to populate"
- For sorting: "Field to sort by"

### Step 4: Options Source (Dropdowns only)
If using a dropdown:
- **Dynamic**: Options come from the context (auto-updates when data changes)
- **Static**: You manually define the list of options

## Cascading Filters

When multiple filter inputs are connected to the same context, they automatically work together:

1. **First filter** narrows the context's data
2. **Second filter's options** automatically update to show only valid choices
3. No extra configuration needed—it works out of the box

Example:
- Filter A: "Cuisine" → User selects "Italian"
- Filter B: "Course" (with Dynamic Options) → Only shows courses available in Italian recipes
- User selects "Pasta"
- Context now shows only Italian Pasta recipes

See [CASCADING_FILTERS.md](./CASCADING_FILTERS.md) for detailed information.

## Immediate vs. Deferred Filtering

### Immediate Filtering (Default)
- "Apply filter immediately on change" is checked
- Filter applies as soon as the user changes the input
- Real-time, responsive feel
- Good for most scenarios

### Deferred Filtering
- "Apply filter immediately on change" is unchecked
- Filter inputs update a pending filter state
- Actual filtering only happens when an "Apply Filters" button is clicked
- Better for forms with multiple filters (apply all at once)
- Better performance on very large datasets

## Component Selection and Settings

### Floating Toolbar
When you select a component on the canvas, a floating toolbar appears with:
- **Settings**: Opens the component's binding settings panel
- Additional layout controls

### Component States
- **Unselected, Not Connected**: Gray border, minimal visual presence
- **Unselected, Connected**: Light dashed pink border (subtle indication of binding)
- **Selected, Connected**: Soft semi-transparent pink border (clearly shows active selection)
- **Selected, Not Connected**: Blue border (indicates selected but not yet bound)

### Settings Panel Structure
The component settings panel displays the component type (Text Input, Dropdown, or Button) at the top, and has two tabs:

**Design Tab:**
- **Placeholder Text** (Text inputs): Default text shown when empty
- **Label** (Buttons): Text displayed on the button

**Settings Tab:**
- All binding configuration (Select Source, Input Purpose, Target Field, etc.)
- Validation Rules section with context schema and multiple component-level overrides

## Validation

### Context Schema Validation (Always Applied)
When an input is set to "Edit Field" (Update or Create), the Validation Rules section shows:
- **From Context Schema (Read-only)**: Auto-generated validation rules from your CMS schema
  - Required status
  - Type constraints (e.g., Email, Number)
  - Min/Max length rules
  - These cannot be modified and are always enforced

### Component Level Validation
Add custom validation beyond the schema:

**Multiple Custom Validations:**
- Click "+ Add" to add additional validation rules
- Each validation can be independently configured and removed
- Supports unlimited custom validations

**Custom Validation Function:**
- Select from pre-built validation functions (validateEmail, validatePhone, validatePostalCode, checkUniqueness)
- Or select "Custom" to enter your own Velo function name
- Available for both text inputs and dropdowns

**Regex Pattern (Text Inputs Only):**
- Define a regex pattern for format validation
- Only appears for text input components
- Not available for dropdowns

## Tips & Best Practices

### 1. Start with Context Assignment
Assign contexts at the Section or Page level first. Only then add inputs and buttons to those sections.

### 2. Use Dynamic Options for Dropdowns
When possible, set dropdowns to pull options from the context. This keeps data in sync and enables cascading filters.

### 3. Always Pair Data Entry with Submit
If you're using "Edit Field" inputs, always include a corresponding Submit button. Users expect to see a "Save" or "Create" action.

### 4. Group Related Filters
Place filter inputs that work together in the same section or visual area for better UX.

### 5. Leverage Cascading Filters
You don't need to manually connect filters. Just:
- Set first filter's Options Source to "Same as Target Field"
- Set subsequent filters' Options Source to "Dynamic (From Context)"
- They'll cascade automatically

### 6. Use Static Options Sparingly
Static option lists require manual maintenance. Use dynamic options when possible so they stay in sync with your data.

## Troubleshooting

### "Options not updating in my dropdown"
- Verify the Options Source is set to "Dynamic (From Context)"
- Check that your context provider is actually filtering the data
- Make sure dependent filters are applied in the correct order

### "Filter isn't working"
- Ensure the input's Purpose is set to "Filter Items"
- Check that "Apply filter immediately on change" is enabled (or use an Apply Filters button)
- Verify you selected the correct context

### "Changes aren't saving"
- For "Edit Field" inputs, you must have a corresponding Submit button
- Verify the button's action is "Submit Update" or "Submit Create"
- Check validation rules aren't blocking the submission

## Related Documentation

- [CASCADING_FILTERS.md](./CASCADING_FILTERS.md) - Detailed guide on filter chaining and multi-filter scenarios
