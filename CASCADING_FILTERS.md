# Cascading Filters Architecture

## Overview

Cascading filters are a core feature of the Input Components binding system. When multiple filter inputs are connected to the same context, they work together seamlessly without requiring additional configuration.

## Expected Behavior

### Single Filter Input
When a user interacts with a single filter input:
1. The input's `onChange` handler (if "Apply immediately" is enabled) triggers `context.setFilter(field, value)`
2. The context provider updates its filtered view
3. The repeater/list displays only items that match the filter

### Multiple Filter Inputs (Cascading)
When multiple filter inputs are connected to the same context:

1. **First Filter Applied**: User selects a value in Filter A (e.g., "Category = Desserts")
   - Context filters all items where `category === 'Desserts'`
   - The filtered dataset is now reduced

2. **Second Filter Options Update Automatically**: Filter B's dropdown (e.g., "Subcategory") has its options source set to "Dynamic (From Context)"
   - Because the context's dataset is now filtered, Filter B only shows subcategories that exist within the "Desserts" category
   - Filter B's options automatically narrow down—no additional UI configuration needed

3. **Second Filter Applied**: User selects a value in Filter B (e.g., "Subcategory = Chocolate")
   - Context applies this additional filter: `category === 'Desserts' AND subcategory === 'Chocolate'`
   - The filtered dataset is now further reduced
   - Any downstream filters (Filter C, D, etc.) also update their options automatically

## Implementation Details

### Why It Works "Out of the Box"

The magic happens because:

1. **Context Reactivity**: The Context Provider maintains a reactive, filtered view of the data
2. **Dynamic Options**: Any dropdown with "Options Source = Dynamic (From Context)" automatically re-renders when the context's data changes
3. **No Manual Chaining**: There's no need to manually specify "Filter A filters Filter B". The system handles this automatically via the reactive context.

### Example: Restaurant Filters

```
Context: Recipes
Items: [
  { id: 1, cuisine: 'Italian', course: 'Pasta' },
  { id: 2, cuisine: 'Italian', course: 'Pizza' },
  { id: 3, cuisine: 'Asian', course: 'Noodles' },
  { id: 4, cuisine: 'Asian', course: 'Rice' }
]

Filter A: "Cuisine" (Unique values from context)
  - Options shown: [Italian, Asian]
  - User selects: Italian
  - Context now shows: [{ id: 1 }, { id: 2 }]

Filter B: "Course" (Dynamic options from context)
  - Before Filter A: Options would be [Pasta, Pizza, Noodles, Rice]
  - After Filter A (Cuisine = Italian): Options automatically become [Pasta, Pizza]
  - User selects: Pasta
  - Context now shows: [{ id: 1 }]

Filter C: "Spice Level" (Dynamic options from context)
  - After Filters A & B: Only shows options that exist in the remaining dataset
```

## Configuration

To set up cascading filters:

1. **Create Filter Inputs**: Add one filter input per field (Cuisine, Course, etc.)
2. **Set Each Filter's Purpose**: Choose "Filter Items" from the Input Purpose dropdown
3. **First Filter**: Set "Options Source" to "Static" or "Same as Target Field"
4. **Subsequent Filters**: Set "Options Source" to "Dynamic (From Context)"
5. **Apply Immediately**: For cascading filters, keep "Apply filter immediately on change" checked so the context updates in real-time

## Advanced: Deferred Filtering

For scenarios where you want to apply multiple filters at once (instead of incrementally):

1. Uncheck "Apply filter immediately on change" on all filter inputs
2. Add a Button with the purpose "Apply Filters"
3. User adjusts multiple filters, then clicks the button to apply all at once
4. This prevents excessive re-filtering and improves performance on large datasets

## Future Considerations

- **Filter Presets**: Save and recall common filter combinations
- **Filter Reset**: Quick button to clear all active filters
- **Filter Summary**: Visual indicator showing active filters and results count
- **Performance Optimization**: Debouncing for very large datasets
