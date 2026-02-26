import { useState } from 'react';
import './RepeaterItemSettingsPanel.css';

const FIELD = ({ item, onUpdate, name, label, placeholder = '' }) => (
  <label className="repeater-item-settings-panel__label">
    {label}
    <input
      type="text"
      className="repeater-item-settings-panel__input"
      value={item[name] ?? ''}
      placeholder={placeholder}
      onChange={(e) => onUpdate?.({ ...item, [name]: e.target.value })}
    />
  </label>
);

/**
 * Panel for an inner repeater item. Shows dedicated settings by context type
 * (recipe card, office, team, or generic item).
 */
export function RepeaterItemSettingsPanel({ item, contextType, contextId, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('settings');
  if (!item) return null;

  const isRecipe = contextType === 'recipes';
  const isTeam = contextId === 'team';
  const isOffices = contextType === 'offices';
  const title = isTeam ? 'Team card' : isRecipe ? 'Recipe card' : isOffices ? 'Office item' : 'Repeater item';

  function renderSettingsFields() {
    if (isRecipe) {
      return (
        <>
          <FIELD item={item} onUpdate={onUpdate} name="title" label={isTeam ? 'Name' : 'Recipe name'} />
          <FIELD item={item} onUpdate={onUpdate} name="image" label="Image URL" />
          {!isTeam && (
            <>
              <FIELD item={item} onUpdate={onUpdate} name="description" label="Description" placeholder="Short description..." />
              <FIELD item={item} onUpdate={onUpdate} name="course" label="Course" placeholder="breakfast, lunch, or dinner" />
            </>
          )}
          <FIELD
            item={item}
            onUpdate={onUpdate}
            name="buttonText"
            label={isTeam ? 'Button link' : 'Button text'}
            placeholder={isTeam ? 'View profile' : 'Read recipe'}
          />
        </>
      );
    }
    if (isOffices) {
      return (
        <>
          <FIELD item={item} onUpdate={onUpdate} name="name" label="Name" />
          <FIELD item={item} onUpdate={onUpdate} name="code" label="Code" />
          <FIELD item={item} onUpdate={onUpdate} name="description" label="Description" />
          <FIELD item={item} onUpdate={onUpdate} name="image" label="Image URL" />
        </>
      );
    }
    return (
      <>
        <FIELD item={item} onUpdate={onUpdate} name="title" label="Title" />
        <FIELD item={item} onUpdate={onUpdate} name="name" label="Name" />
        <FIELD item={item} onUpdate={onUpdate} name="image" label="Image URL" />
        <FIELD item={item} onUpdate={onUpdate} name="buttonText" label="Button text" />
      </>
    );
  }

  return (
    <div className="repeater-item-settings-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">{title}</h2>
        <div className="repeater-item-settings-panel__header-actions">
          <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__tabs">
        <button
          type="button"
          className={`repeater-item-settings-panel__tab ${activeTab === 'settings' ? 'repeater-item-settings-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          type="button"
          className={`repeater-item-settings-panel__tab ${activeTab === 'design' ? 'repeater-item-settings-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design
        </button>
      </div>
      <div className="repeater-item-settings-panel__body">
        {activeTab === 'settings' && renderSettingsFields()}
        {activeTab === 'design' && (
          <p className="repeater-item-settings-panel__placeholder">Design options for this item will appear here.</p>
        )}
      </div>
    </div>
  );
}
