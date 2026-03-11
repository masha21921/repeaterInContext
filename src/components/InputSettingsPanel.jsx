import React, { useState } from 'react';
import './InputSettingsPanel.css';

export function InputSettingsPanel({ component, onChange, onClose, availableContexts = [] }) {
  const [activeTab, setActiveTab] = useState('settings');

  const getPurposeGroups = (contextId) => {
    const contextActions = [
      { value: 'edit-update', label: 'Edit Field - Update Existing Item' },
      { value: 'edit-create', label: 'Edit Field - Create New Item' },
      { value: 'filter', label: 'Filter Items' },
      { value: 'sort', label: 'Sort Items' },
    ];

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
      },
      {
        label: 'Advanced',
        options: [
          { value: 'custom', label: 'Custom Behavior (Velo)' },
        ]
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
    'recipes': ['title', 'description', 'course', 'buttonText'],
    'team': ['title', 'image', 'buttonText'],
    'services': ['title', 'description', 'duration'],
    'bookends': ['title', 'author', 'genre'],
    'realestate': ['title', 'location', 'price'],
    'stores': ['name', 'price', 'inventory'],
    'sys-geo': ['country', 'city', 'timezone'],
    'sys-user': ['name', 'email', 'role'],
  };

  const hasOptions = component.type === 'dropdown';

  const getSampleFieldValues = (contextId, fieldName) => {
    // Mock data for each context - in a real app, this would pull from actual data
    const sampleData = {
      'recipes': { title: ['Pasta Carbonara', 'Caesar Salad', 'Tiramisu'], course: ['Appetizer', 'Main', 'Dessert'], description: ['Classic Italian dish', 'Fresh greens', 'Coffee-flavored dessert'] },
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
        <div className="input-settings-panel__title-row">
          <h3 className="input-settings-panel__title">Input Connection</h3>
          <button className="input-settings-panel__close" onClick={onClose}>×</button>
        </div>
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
              <label className="input-settings-panel__label">What is this input for?</label>
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
                {component.boundContext && (fieldOptions[component.boundContext] || []).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p className="input-settings-panel__help">
                {component.role === 'edit-update' ? 'Input values will update the current item. Add a Submit button to save changes to the database.' :
                 component.role === 'edit-create' ? 'Input values will populate a new item draft. Add a Submit button to create the item in the database.' :
                 'Select the specific field from the context that this action will apply to.'}
              </p>
            </div>

            {component.role === 'filter' && (
              <div className="input-settings-panel__group">
                <label className="input-settings-panel__label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={component.applyFilterImmediately !== false} 
                    onChange={e => onChange({ applyFilterImmediately: e.target.checked })}
                  />
                  Apply filter immediately on change
                </label>
                <p className="input-settings-panel__help">
                  If unchecked, filtering will only apply when a connected "Apply Filters" button is clicked.
                </p>
              </div>
            )}

            {hasOptions && (
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

                {component.optionsSourceType === 'static' && (
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
                            
                            {component.optionsField && (
                              <div style={{ marginTop: '12px', padding: '10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Sample Options from {component.optionsField}:</div>
                                <ul style={{ margin: 0, paddingLeft: '16px', color: '#666' }}>
                                  {getSampleFieldValues(component.optionsContext, component.optionsField).map((val, idx) => (
                                    <li key={idx}>{val}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

        {component.boundContext && component.boundField && (component.role === 'edit-update' || component.role === 'edit-create' || component.role === 'custom') && (
          <div className="input-settings-panel__group validation-section">
            <h4 className="validation-section__title">Validation</h4>
            
            <div className="cms-validation">
              <span className="cms-validation__label">Context Schema Rules (Read-only)</span>
              <ul className="cms-validation__list">
                <li>Required: Yes</li>
                {component.boundField === 'phone' && <li>Min length: 8</li>}
                {component.boundField === 'price' && <li>Type: Number</li>}
              </ul>
            </div>

            <label className="input-settings-panel__label">Custom Regex (Component level)</label>
            <input 
              type="text" 
              className="input-settings-panel__input"
              value={component.regex || ''} 
              onChange={e => onChange({ regex: e.target.value })} 
              placeholder="e.g. ^[0-9]+$" 
            />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
