import React, { useState } from 'react';
import './InputSettingsPanel.css';

export function InputSettingsPanel({ component, onChange, onClose, availableContexts = [] }) {
  const [activeTab, setActiveTab] = useState('settings');

  const getPurposeGroups = (contextId) => {
    let contextActions = [
      { value: 'edit-update', label: 'Edit Field - Update Existing Item' },
      { value: 'edit-create', label: 'Edit Field - Create New Item' },
      { value: 'filter', label: 'Filter Items' },
      { value: 'sort', label: 'Sort Items' },
    ];

    // Text inputs don't support sorting - filter only to update, create, and filter
    if (component.type === 'textInput') {
      contextActions = contextActions.filter(a => a.value !== 'sort');
    }

    // Add eCommerce specific actions if connected to a store context
    if (contextId === 'stores') {
      contextActions.push(
        { value: 'updateQuantity', label: 'Update Cart Quantity' },
        { value: 'selectVariant', label: 'Select Product Variant' }
      );
    }

    return [
      {
        label: 'Standard Purposes',
        options: contextActions
      }
    ];
  };

  const contextGroups = [
    {
      label: 'Available Contexts',
      options: availableContexts.map(c => ({ value: c.id, label: c.label }))
    }
  ];

  const fieldOptions = {
    'recipes': ['title', 'description', 'course', 'image', 'buttonText'],
    'team': ['title', 'image', 'buttonText'],
    'services': ['title', 'description', 'duration'],
    'bookends': ['title', 'author', 'genre'],
    'realestate': ['title', 'location', 'price'],
    'stores': ['name', 'price', 'inventory'],
    'sys-geo': ['country', 'city', 'timezone'],
    'sys-user': ['name', 'email', 'role'],
  };

  const hasOptions = component.type === 'dropdown';

  const getFieldIcon = (fieldName) => {
    // Return icon based on field type
    if (fieldName === 'price' || fieldName === 'bedrooms' || fieldName === 'duration' || fieldName === 'inventory') {
      return '#️⃣'; // Number
    } else if (fieldName === 'image') {
      return '🖼️'; // Image
    } else if (fieldName === 'email') {
      return '✉️'; // Email
    } else if (fieldName === 'title' || fieldName === 'name' || fieldName === 'author' || fieldName === 'genre' || fieldName === 'city' || fieldName === 'country') {
      return '📝'; // Text
    } else {
      return '📋'; // Default
    }
  };

  const getSortOptionsForField = (fieldName) => {
    // Return sort options relevant to field type
    if (fieldName === 'price' || fieldName === 'bedrooms' || fieldName === 'duration' || fieldName === 'inventory') {
      // Numeric fields
      return [
        { value: 'asc', label: 'Ascending (Low to High)' },
        { value: 'desc', label: 'Descending (High to Low)' },
      ];
    } else if (fieldName === 'image') {
      // Image fields
      return [
        { value: 'present', label: 'Images Present First' },
        { value: 'missing', label: 'Missing Images First' },
      ];
    } else {
      // Text fields
      return [
        { value: 'asc', label: 'Ascending (A-Z)' },
        { value: 'desc', label: 'Descending (Z-A)' },
      ];
    }
  };

  const getConditionsForField = (fieldName) => {
    // Return conditions relevant to field type
    if (fieldName === 'price' || fieldName === 'bedrooms' || fieldName === 'duration' || fieldName === 'inventory') {
      // Numeric fields
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'greaterOrEqual', label: 'Greater or equal' },
        { value: 'lessOrEqual', label: 'Less or equal' },
        { value: 'between', label: 'Between' },
      ];
    } else if (fieldName === 'image') {
      // Image fields
      return [
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
      ];
    } else {
      // Text fields
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
      ];
    }
  };

  const getSampleFieldValues = (contextId, fieldName) => {
    // Mock data for each context - in a real app, this would pull from actual data
    const sampleData = {
      'recipes': { title: ['Pasta Carbonara', 'Caesar Salad', 'Tiramisu'], course: ['Appetizer', 'Main', 'Dessert'], description: ['Classic Italian dish', 'Fresh greens', 'Coffee-flavored dessert'], image: ['pasta.jpg', 'salad.jpg', 'tiramisu.jpg'] },
      'team': { title: ['Alice Johnson', 'Bob Smith', 'Carol Davis'], role: ['Designer', 'Developer', 'Manager'], image: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'] },
      'services': { title: ['Web Design', 'Branding', 'SEO'], duration: ['2 weeks', '4 weeks', '8 weeks'], description: ['Professional design', 'Full brand identity', 'Search optimization'] },
      'bookends': { title: ['The Great Gatsby', '1984', 'To Kill a Mockingbird'], author: ['F. Scott Fitzgerald', 'George Orwell', 'Harper Lee'], genre: ['Fiction', 'Dystopian', 'Classic'] },
      'realestate': { title: ['Sunny Apartment', 'Modern House', 'Cozy Studio'], location: ['Downtown', 'Suburbs', 'Beachfront'], price: ['$500k', '$1.2M', '$750k'] },
      'stores': { name: ['Wireless Headphones', 'Laptop Stand', 'USB Cable'], price: ['$79.99', '$45.99', '$12.99'], inventory: ['45 in stock', '12 in stock', '200 in stock'] },
      'sys-geo': { country: ['USA', 'Canada', 'Mexico'], city: ['New York', 'Toronto', 'Mexico City'], timezone: ['EST', 'CST', 'MST'] },
      'sys-user': { name: ['John Doe', 'Jane Smith', 'Bob Wilson'], email: ['john@example.com', 'jane@example.com', 'bob@example.com'], role: ['Admin', 'User', 'Moderator'] },
    };

    return (sampleData[contextId]?.[fieldName] || []).slice(0, 5);
  };

  return (
    <div className="input-settings-panel">
      <header className="input-settings-panel__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
          <div className="input-settings-panel__tabs">
            <button 
              className={`input-settings-panel__tab ${activeTab === 'design' ? 'active' : ''}`}
              onClick={() => setActiveTab('design')}
            >
              Design
            </button>
            <button 
              className={`input-settings-panel__tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
          <button className="input-settings-panel__close" onClick={onClose}>×</button>
        </div>
      </header>
      
      <div className="input-settings-panel__body">
        {activeTab === 'design' && (
          <div className="input-settings-panel__group">
            <label className="input-settings-panel__label">Placeholder Text</label>
            <input 
              type="text" 
              className="input-settings-panel__input"
              value={component.placeholder || ''} 
              onChange={e => onChange({ placeholder: e.target.value })} 
              placeholder="e.g. Enter value..." 
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <>
            <div className="input-settings-panel__group">
              <label className="input-settings-panel__label">Select Source (Context)</label>
              <select 
                className="input-settings-panel__select"
                value={component.boundContext || ''} 
                onChange={e => onChange({ boundContext: e.target.value, boundField: '', role: '' })}
              >
                <option value="">Select context...</option>
                {contextGroups.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </optgroup>
                ))}
              </select>
              <p className="input-settings-panel__help">
                Choose a context available from parent containers.
              </p>
            </div>

            <div className="input-settings-panel__group">
              <label className="input-settings-panel__label">What is this input for? <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>(aka onChange)</span></label>
              <select 
                className="input-settings-panel__select"
                value={component.role || ''} 
                onChange={e => onChange({ role: e.target.value })}
                disabled={!component.boundContext}
              >
                <option value="">Select purpose...</option>
                {component.boundContext && getPurposeGroups(component.boundContext).map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </optgroup>
                ))}
              </select>
              <p className="input-settings-panel__help">
                Choose the role this input will play in your context. The system automatically handles what happens when the user interacts with it.
              </p>

              {(component.role === 'filter' || component.role === 'sort' || component.role === 'edit-update') && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <label className="input-settings-panel__label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={component.role === 'edit-update' ? component.triggerOnChange === true : component.triggerOnChange !== false} 
                      onChange={e => onChange({ triggerOnChange: e.target.checked })}
                    />
                    Trigger on change
                  </label>
                  <p className="input-settings-panel__help">
                    {component.role === 'filter' ? 'Apply filter immediately when value changes' :
                     component.role === 'sort' ? 'Apply sort immediately when value changes' :
                     'Execute action immediately when value changes'}
                  </p>
                </div>
              )}
            </div>

            <div className="input-settings-panel__group">
              <label className="input-settings-panel__label">
                {component.role === 'filter' ? 'Field to filter by' :
                 component.role === 'sort' ? 'Field to sort by' :
                 component.role === 'edit-update' ? 'Field to update' :
                 component.role === 'edit-create' ? 'Field to populate' :
                 component.role === 'custom' ? 'Pass field argument' :
                 'Target Field'}
              </label>
              <select 
                className="input-settings-panel__select"
                value={component.boundField || ''} 
                onChange={e => onChange({ boundField: e.target.value })}
                disabled={!component.role}
              >
                <option value="">Select field...</option>
                {component.boundContext && (fieldOptions[component.boundContext] || []).map(f => <option key={f} value={f}>{getFieldIcon(f)} {f}</option>)}
              </select>
              <p className="input-settings-panel__help">
                {component.role === 'edit-update' ? 'Input values will update the current item. Add a Submit button to save changes to the database.' :
                 component.role === 'edit-create' ? 'Input values will populate a new item draft. Add a Submit button to create the item in the database.' :
                 'Select the specific field from the context that this action will apply to.'}
              </p>
            </div>

            {component.role === 'filter' && component.boundField && (
              <div className="input-settings-panel__group">
                <label className="input-settings-panel__label">Condition</label>
                <select 
                  className="input-settings-panel__select"
                  value={component.filterCondition || ''} 
                  onChange={e => onChange({ filterCondition: e.target.value })}
                >
                  <option value="">Select condition...</option>
                  {getConditionsForField(component.boundField).map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
                <p className="input-settings-panel__help">
                  Select the filter condition to apply to the chosen field.
                </p>
              </div>
            )}

            {component.role === 'sort' && component.boundField && (
              <div className="input-settings-panel__group">
                <label className="input-settings-panel__label">Sort Order</label>
                <select 
                  className="input-settings-panel__select"
                  value={component.sortOrder || ''} 
                  onChange={e => onChange({ sortOrder: e.target.value })}
                >
                  <option value="">Select sort order...</option>
                  {getSortOptionsForField(component.boundField).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="input-settings-panel__help">
                  Choose how to sort items by this field.
                </p>
              </div>
            )}

            {hasOptions && (component.role !== 'filter' && component.role !== 'sort') && (
              <div className="input-settings-panel__group">
                <label className="input-settings-panel__label">Options Source</label>
                <select 
                  className="input-settings-panel__select"
                  value={component.optionsSourceType || 'static'} 
                  onChange={e => {
                    const isDynamic = e.target.value === 'dynamic';
                    onChange({ 
                      optionsSourceType: e.target.value,
                      optionsSource: isDynamic ? 'same' : 'static'
                    });
                  }}
                >
                  <option value="static">Static list (Manual)</option>
                  <option value="dynamic">Dynamic (From Context)</option>
                </select>

                {(!component.optionsSourceType || component.optionsSourceType === 'static') && (
                  <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid #eee' }}>
                    <label className="input-settings-panel__label">List Options (comma separated)</label>
                    <textarea 
                      className="input-settings-panel__input"
                      value={component.staticOptions || 'Option 1, Option 2, Option 3'} 
                      onChange={e => onChange({ staticOptions: e.target.value })}
                      rows={3}
                      placeholder="e.g. Red, Green, Blue"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                )}

                {component.optionsSourceType === 'dynamic' && (
                  <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid #eee' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="input-settings-panel__label">Connect Options to</label>
                      <select 
                        className="input-settings-panel__select"
                        value={component.optionsSource || 'same'} 
                        onChange={e => onChange({ optionsSource: e.target.value })}
                      >
                        <option value="same">Same as Target Field</option>
                        <option value="other">Another Context / Field</option>
                      </select>
                    </div>

                    {component.optionsSource === 'other' && (
                      <>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="input-settings-panel__label">Options Context</label>
                          <select 
                            className="input-settings-panel__select"
                            value={component.optionsContext || ''} 
                            onChange={e => onChange({ optionsContext: e.target.value, optionsField: '' })}
                          >
                            <option value="">Select context...</option>
                            {contextGroups.map(group => (
                              <optgroup key={group.label} label={group.label}>
                                {group.options.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {component.optionsContext && (
                          <div>
                            <label className="input-settings-panel__label">Options Field</label>
                            <select 
                              className="input-settings-panel__select"
                              value={component.optionsField || ''} 
                              onChange={e => onChange({ optionsField: e.target.value })}
                            >
                              <option value="">Select field...</option>
                              {(fieldOptions[component.optionsContext] || []).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {component.boundField && (component.role === 'edit-update' || component.role === 'edit-create') && (
              <div className="input-settings-panel__group validation-section">
                <h4 className="validation-section__title">Validation</h4>
                
                <div className="cms-validation">
                  <span className="cms-validation__label" style={{ fontSize: '12px', color: '#666' }}>Context Schema (applied automatically)</span>
                  <ul className="cms-validation__list" style={{ marginTop: '6px', marginBottom: '12px' }}>
                    <li>Required: Yes</li>
                    {component.boundField === 'phone' && <li>Min length: 8</li>}
                    {component.boundField === 'price' && <li>Type: Number</li>}
                    {component.boundField === 'email' && <li>Format: Email</li>}
                    {component.boundField === 'title' && <li>Max length: 200</li>}
                  </ul>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="input-settings-panel__label">Custom Validations</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const customValidations = component.customValidations || [];
                        onChange({ customValidations: [...customValidations, { id: Date.now(), type: '', value: '' }] });
                      }}
                      style={{
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#333'
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {(!component.customValidations || component.customValidations.length === 0) ? (
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '0' }}>No additional validations added</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {component.customValidations.map((validation, index) => (
                        <div key={validation.id} style={{ padding: '8px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <select 
                              className="input-settings-panel__select"
                              value={validation.type || ''} 
                              onChange={e => {
                                const updated = [...component.customValidations];
                                updated[index].type = e.target.value;
                                onChange({ customValidations: updated });
                              }}
                              style={{ flex: 1, marginBottom: '0' }}
                            >
                              <option value="">Select validation...</option>
                              {component.boundContext && (
                                <optgroup label="Functions">
                                  <option value="validateEmail">validateEmail</option>
                                  <option value="validatePhone">validatePhone</option>
                                  <option value="validatePostalCode">validatePostalCode</option>
                                  <option value="checkUniqueness">checkUniqueness</option>
                                  <option value="custom">Custom</option>
                                </optgroup>
                              )}
                              {!component.boundContext && (
                                <option value="custom">Custom</option>
                              )}
                              {component.type === 'textInput' && (
                                <option value="regex">Regex Pattern</option>
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = component.customValidations.filter((_, i) => i !== index);
                                onChange({ customValidations: updated });
                              }}
                              style={{
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                color: '#999',
                                fontSize: '12px',
                                marginTop: '2px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {validation.type === 'custom' && (
                            <input 
                              type="text" 
                              className="input-settings-panel__input"
                              value={validation.value || ''} 
                              onChange={e => {
                                const updated = [...component.customValidations];
                                updated[index].value = e.target.value;
                                onChange({ customValidations: updated });
                              }}
                              placeholder="Function name"
                              style={{ marginTop: '8px', width: '100%' }}
                            />
                          )}
                          
                          {validation.type === 'regex' && (
                            <input 
                              type="text" 
                              className="input-settings-panel__input"
                              value={validation.value || ''} 
                              onChange={e => {
                                const updated = [...component.customValidations];
                                updated[index].value = e.target.value;
                                onChange({ customValidations: updated });
                              }}
                              placeholder="e.g. ^[0-9]+$"
                              style={{ marginTop: '8px', width: '100%' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
