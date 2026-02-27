import './RepeaterItemSettingsPanel.css';
import './RepeaterItemElementPanel.css';

/** Human-readable label for button link field when connected (value from Use Collection Content panel). */
const BUTTON_LINK_FIELD_LABELS = { detailPage: 'Recipes dynamic page' };

/** Label for text (boundField) by context, so we can show "connected to Recipe name" etc. */
function getTextFieldLabel(contextId, contextType, fieldValue) {
  if (!fieldValue) return '';
  const byContext = {
    recipes: { title: 'Recipe name', description: 'Description', course: 'Course' },
    team: { title: 'Name', bio: 'Bio' },
    services: { title: 'Service name', description: 'Description' },
    bookends: { title: 'Book title', author: 'Author' },
    offices: { name: 'Name', description: 'Description', code: 'Code' },
    films: { title: 'Film title', year: 'Year', description: 'Description', director: 'Director' },
    actors: { name: 'Name', bio: 'Bio' },
    default: { title: 'Title', name: 'Name', description: 'Description' },
  };
  const ctx = contextId === 'recipes' || contextType === 'recipes' ? 'recipes'
    : contextId === 'team' ? 'team'
    : contextId === 'services' || contextType === 'services' ? 'services'
    : contextId === 'bookends' || contextType === 'bookends' ? 'bookends'
    : contextType === 'offices' ? 'offices'
    : contextId === 'films' || contextType === 'films' ? 'films'
    : contextId === 'actors' || contextType === 'actors' ? 'actors'
    : 'default';
  return byContext[ctx][fieldValue] ?? fieldValue;
}

/**
 * Panel for a single inner element (image, text, or button) of a repeater item.
 * Text element gets "Edit Text" panel (text input + Connect to CMS field; no formatting toolbar).
 * onOpenConnectorPanel(bindProperty) opens the Use collection content panel; bindProperty is 'text' | 'image' | 'imageAlt' | 'imageLink' | 'button' | 'buttonLink'.
 */
export function RepeaterItemElementPanel({ item, elementKind, contextId, contextType, onUpdate, onClose, onOpenConnectorPanel }) {
  if (!item) return null;

  const isTeam = contextId === 'team';
  const isOffices = contextType === 'offices';
  const labels = {
    image: 'Image',
    text: 'Text',
    button: 'Button',
  };
  const title = labels[elementKind] ?? elementKind;

  function handleChange(name, value) {
    onUpdate?.({ ...item, [name]: value });
  }

  if (elementKind === 'text') {
    const textContent = item.boundField && item[item.boundField] != null
      ? String(item[item.boundField])
      : (isOffices ? (item.name ?? '') : (item.title ?? item.name ?? ''));
    const textContentKey = isOffices ? 'name' : 'title';
    const textConnected = !!(item.boundField && item.boundField.trim() !== '');
    const textFieldLabel = textConnected ? getTextFieldLabel(contextId, contextType, item.boundField) : '';
    return (
      <div className="repeater-item-settings-panel edit-text-panel">
        <div className="repeater-item-settings-panel__header">
          <h2 className="repeater-item-settings-panel__title">Edit Text</h2>
          <div className="repeater-item-settings-panel__header-actions">
            <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
            {onClose && (
              <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
            )}
          </div>
        </div>
        <div className="repeater-item-settings-panel__body">
          <div className={`edit-text-panel__text-row ${textConnected ? 'edit-text-panel__text-row--connected' : ''}`}>
            <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
              Text
              <input
                type="text"
                className="repeater-item-settings-panel__input"
                value={textConnected ? (textFieldLabel || item.boundField || '') : (textContent || 'text')}
                onChange={(e) => handleChange(textContentKey, e.target.value)}
                placeholder={textConnected ? '' : (isOffices ? 'Name' : 'Recipe name')}
                readOnly={textConnected}
                aria-readonly={textConnected}
                title={textConnected ? `Connected to ${textFieldLabel || item.boundField}` : undefined}
              />
            </label>
            {onOpenConnectorPanel && (
              <button
                type="button"
                className="edit-text-panel__connector-btn"
                onClick={() => onOpenConnectorPanel('text')}
                title="Connect to CMS field"
                aria-label="Connect to CMS field"
              >
                <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="7" cy="12" r="2.5" fill="none" />
                    <circle cx="17" cy="12" r="2.5" fill="none" />
                    <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
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
      <div className="repeater-item-settings-panel__body">
        {elementKind === 'image' && (
          <>
            <div className={`edit-text-panel__text-row ${!!(item.boundFieldImage && item.boundFieldImage.trim?.() !== '') ? 'edit-text-panel__text-row--connected' : ''}`}>
              <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
                Image src
                <input
                  type="text"
                  className="repeater-item-settings-panel__input"
                  value={item.image ?? ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="Image URL"
                />
              </label>
              {onOpenConnectorPanel && (
                <button
                  type="button"
                  className="edit-text-panel__connector-btn"
                  onClick={() => onOpenConnectorPanel('image')}
                  title="Connect to CMS field"
                  aria-label="Connect to CMS field"
                >
                  <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="12" r="2.5" fill="none" />
                      <circle cx="17" cy="12" r="2.5" fill="none" />
                      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <div className={`edit-text-panel__text-row ${!!(item.boundFieldImageAlt && item.boundFieldImageAlt.trim?.() !== '') ? 'edit-text-panel__text-row--connected' : ''}`}>
              <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
                Alt text
                <input
                  type="text"
                  className="repeater-item-settings-panel__input"
                  value={item.imageAlt ?? ''}
                  onChange={(e) => handleChange('imageAlt', e.target.value)}
                  placeholder="Alternative text for the image"
                />
              </label>
              {onOpenConnectorPanel && (
                <button
                  type="button"
                  className="edit-text-panel__connector-btn"
                  onClick={() => onOpenConnectorPanel('imageAlt')}
                  title="Connect to CMS field"
                  aria-label="Connect to CMS field"
                >
                  <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="12" r="2.5" fill="none" />
                      <circle cx="17" cy="12" r="2.5" fill="none" />
                      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <div className={`edit-text-panel__text-row ${!!(item.boundFieldImageLink && item.boundFieldImageLink.trim?.() !== '') ? 'edit-text-panel__text-row--connected' : ''}`}>
              <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
                Link
                <input
                  type="text"
                  className="repeater-item-settings-panel__input"
                  value={item.imageLink ?? ''}
                  onChange={(e) => handleChange('imageLink', e.target.value)}
                  placeholder="URL when image is clicked"
                />
              </label>
              {onOpenConnectorPanel && (
                <button
                  type="button"
                  className="edit-text-panel__connector-btn"
                  onClick={() => onOpenConnectorPanel('imageLink')}
                  title="Connect to CMS field"
                  aria-label="Connect to CMS field"
                >
                  <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="12" r="2.5" fill="none" />
                      <circle cx="17" cy="12" r="2.5" fill="none" />
                      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </>
        )}
        {elementKind === 'button' && (
          <>
            <div className={`edit-text-panel__text-row ${!!(item.boundFieldButtonText && item.boundFieldButtonText.trim?.() !== '') ? 'edit-text-panel__text-row--connected' : ''}`}>
              <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
                Text
                <input
                  type="text"
                  className="repeater-item-settings-panel__input"
                  value={item.buttonText ?? ''}
                  placeholder={isTeam ? 'View profile' : 'Read recipe'}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                />
              </label>
              {onOpenConnectorPanel && (
                <button
                  type="button"
                  className="edit-text-panel__connector-btn"
                  onClick={() => onOpenConnectorPanel('button')}
                  title="Connect to CMS field"
                  aria-label="Connect to CMS field"
                >
                  <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="12" r="2.5" fill="none" />
                      <circle cx="17" cy="12" r="2.5" fill="none" />
                      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <div className={`edit-text-panel__text-row ${!!(item.boundFieldButtonLink && item.boundFieldButtonLink.trim?.() !== '') ? 'edit-text-panel__text-row--connected' : ''}`}>
              <label className="repeater-item-settings-panel__label edit-text-panel__text-label">
                Link
                <input
                  type="text"
                  className="repeater-item-settings-panel__input"
                  value={item.boundFieldButtonLink && item.boundFieldButtonLink.trim?.() !== ''
                    ? (BUTTON_LINK_FIELD_LABELS[item.boundFieldButtonLink] ?? item.boundFieldButtonLink)
                    : (item.buttonLink ?? '')}
                  placeholder={item.boundFieldButtonLink && item.boundFieldButtonLink.trim?.() !== '' ? '' : 'URL when button is clicked'}
                  readOnly={!!(item.boundFieldButtonLink && item.boundFieldButtonLink.trim?.() !== '')}
                  onChange={(e) => handleChange('buttonLink', e.target.value)}
                />
              </label>
              {onOpenConnectorPanel && (
                <button
                  type="button"
                  className="edit-text-panel__connector-btn"
                  onClick={() => onOpenConnectorPanel('buttonLink')}
                  title="Connect to Recipes dynamic page"
                  aria-label="Connect to Recipes dynamic page"
                >
                  <span className="edit-text-panel__connector-icon edit-text-panel__connector-icon--curve" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="7" cy="12" r="2.5" fill="none" />
                      <circle cx="17" cy="12" r="2.5" fill="none" />
                      <path d="M9.5 12 C12 12 12 6 14.5 6 C17 6 17 12 14.5 12" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
