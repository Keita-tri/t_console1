import React, { useState, useEffect } from 'react';

/**
 * Props for the SaveLayoutModal component.
 */
interface SaveLayoutModalProps {
  isOpen: boolean; // Controls whether the modal is visible.
  onClose: () => void; // Function to call when the modal should be closed (e.g., by clicking cancel or overlay).
  onSave: (layoutName: string) => void; // Function to call when the save button is clicked, passing the entered layout name.
  currentLayoutName?: string; // Optional: The initial name to display in the input, e.g., for "Save As" or current name.
  title?: string; // Optional: The title displayed at the top of the modal. Defaults to "Save Layout".
}

/**
 * A reusable modal component for saving a layout.
 * It includes an input field for the layout name and Save/Cancel buttons.
 */
const Modal: React.FC<SaveLayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentLayoutName = '', // Default to empty string if not provided
  title = "Save Layout" // Default title
}) => {
  const [layoutName, setLayoutName] = useState(currentLayoutName);

  // Effect to update the internal layoutName state when the modal is opened or currentLayoutName prop changes.
  useEffect(() => {
    if (isOpen) {
      // When modal opens, pre-fill with currentLayoutName (which could be "Default Layout" or an existing name)
      // or reset to empty if currentLayoutName is empty.
      setLayoutName(currentLayoutName || '');
    }
  }, [isOpen, currentLayoutName]);

  // Don't render anything if the modal is not open.
  if (!isOpen) {
    return null;
  }

  // Handles the save action. Trims the layout name and calls onSave if valid.
  const handleSave = () => {
    const trimmedName = layoutName.trim();
    if (trimmedName) {
      onSave(trimmedName);
      onClose(); // Automatically close the modal after a successful save.
    } else {
      // Basic validation: prevent saving with an empty name.
      // A more sophisticated UI might show an inline error message.
      alert("Layout name cannot be empty.");
    }
  };

  // Basic inline styling for the modal. For larger applications, consider CSS modules or a styled-components approach.
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure modal is on top of other content
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px', // Slightly more rounded corners
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Softer shadow
    width: '350px', // Adjusted width
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', // Space between elements
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', // Full width within padding
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box', // Include padding and border in the element's total width and height
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end', // Align buttons to the right
    gap: '10px', // Space between buttons
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 18px', // Slightly larger buttons
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  };

  const saveButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff', // Standard blue for save/confirm
    color: 'white',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d', // Standard gray for cancel
    color: 'white',
  };

  return (
    // Overlay closes the modal on click
    <div style={modalOverlayStyle} onClick={onClose}>
      {/* Content stops propagation to prevent overlay click when clicking inside modal */}
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: '5px' }}>{title}</h3>
        <input
          type="text"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          placeholder="Enter layout name"
          style={inputStyle}
          autoFocus // Automatically focus the input field when the modal opens
        />
        <div style={buttonContainerStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>Cancel</button>
          <button style={saveButtonStyle} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
