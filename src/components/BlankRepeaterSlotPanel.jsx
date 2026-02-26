import './RepeaterItemSettingsPanel.css';
import './BlankRepeaterSlotPanel.css';

/**
 * Settings panel when a blank repeater slot is selected. Add Text or Image to the slot; content fits inside the slot border.
 */
export function BlankRepeaterSlotPanel({
  slotIndex,
  onAddText,
  onAddImage,
  onClose,
}) {
  return (
    <div className="repeater-item-settings-panel">
      <div className="repeater-item-settings-panel__header">
        <h2 className="repeater-item-settings-panel__title">Item slot {slotIndex + 1}</h2>
        <div className="repeater-item-settings-panel__header-actions">
          <button type="button" className="repeater-item-settings-panel__icon-btn" aria-label="Help">?</button>
          {onClose && (
            <button type="button" className="repeater-item-settings-panel__icon-btn" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
      </div>
      <div className="repeater-item-settings-panel__body">
        <p className="blank-slot-panel__hint">Add content to this slot. It will fit inside the item border.</p>
        <div className="blank-slot-panel__actions">
          <button type="button" className="blank-slot-panel__add-btn" onClick={onAddText}>
            + Text
          </button>
          <button type="button" className="blank-slot-panel__add-btn" onClick={onAddImage}>
            + Image
          </button>
        </div>
      </div>
    </div>
  );
}
