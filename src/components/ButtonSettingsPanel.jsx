import React, { useState } from 'react';

export function ButtonSettingsPanel({ component, onChange, onClose, availableContexts = [] }) {
  const [activeTab, setActiveTab] = useState('settings');

  const getActionGroups = (contextId) => {
    const contextActions = [
      { value: 'applyFilters', label: 'Apply filters' },
      { value: 'resetFilters', label: 'Reset applied filters' },
      { value: 'submitCreate', label: 'Create new item' },
      { value: 'submitUpdate', label: 'Update item' },
      { value: 'delete', label: 'Delete item' },
    ];

    if (contextId === 'stores') {
      contextActions.push(
        { value: 'checkout', label: 'Checkout' },
        { value: 'clearCart', label: 'Clear Cart' }
      );
    }

    return [
      {
        label: 'Context Actions',
        options: contextActions
      },
      {
        label: 'Custom Actions',
        options: [
          { value: 'custom', label: 'Custom function' },
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

  return (
    <div className="input-settings-panel">
      <header className="input-settings-panel__header">
        <div className="input-settings-panel__title-row">
          <h3 className="input-settings-panel__title">Button Settings</h3>
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
            <label className="input-settings-panel__label">Label</label>
            <input 
              type="text" 
              className="input-settings-panel__input"
              value={component.label || ''} 
              onChange={e => onChange({ label: e.target.value })} 
              placeholder="e.g. Submit" 
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
            onChange={e => onChange({ boundContext: e.target.value, action: '' })}
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

        {component.boundContext && (
          <div className="input-settings-panel__group">
            <label className="input-settings-panel__label">Click Action</label>
            <select 
              className="input-settings-panel__select"
              value={component.action || ''} 
              onChange={e => onChange({ action: e.target.value })}
            >
              <option value="">Define action...</option>
              {getActionGroups(component.boundContext).map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </optgroup>
              ))}
            </select>
            <p className="input-settings-panel__help">
              Select what happens when the user clicks this button.
            </p>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
