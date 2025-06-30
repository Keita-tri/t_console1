import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Ensure this path points to your store's RootState
import {
  saveCurrentLayoutAsNew,
  updateCurrentLayout,
  setCurrentLayoutObject, // Example: For a "Reset to Default" button
  loadLayoutById,         // Example: For a layout switcher UI
  deleteLayoutById,       // Example: For managing saved layouts
} from '../../store/slices/layoutSlice';
import Modal from '../common/Modal';
import { defaultLayout } from '../../constants/defaultLayout'; // For resetting to default

/**
 * MainLayout component serves as the primary UI structure for the dashboard.
 * It includes a header with a save button and a content area for displaying dashboard panels.
 * It also manages the logic for saving new and updating existing layouts.
 */
const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  // Select the current layout and saved layouts from the Redux store.
  const currentLayout = useSelector((state: RootState) => state.layout.currentLayout);
  const savedLayouts = useSelector((state: RootState) => state.layout.savedLayouts); // For layout switcher/management examples

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the visibility of the save layout modal.

  /**
   * Handles the click event of the "Save Layout" button.
   * If the current layout has an ID, it's considered saved, and `updateCurrentLayout` is dispatched.
   * Otherwise (new or modified default layout), the "Save New Layout" modal is opened.
   */
  const handleSaveLayoutClick = () => {
    if (currentLayout.id) {
      // Layout is already saved (has an ID), so dispatch action to update it.
      dispatch(updateCurrentLayout());
      alert(`Layout "${currentLayout.name}" updated successfully.`); // User feedback
    } else {
      // Layout is new (no ID) or a modified default; open modal to prompt for a name.
      setIsModalOpen(true);
    }
  };

  /**
   * Handles the save action from the modal.
   * Dispatches `saveCurrentLayoutAsNew` with the provided layout name.
   * Closes the modal and provides user feedback.
   * @param layoutName The name entered by the user in the modal.
   */
  const handleModalSave = (layoutName: string) => {
    dispatch(saveCurrentLayoutAsNew(layoutName));
    setIsModalOpen(false); // Close the modal
    alert(`Layout "${layoutName}" saved successfully.`); // User feedback
  };

  /**
   * Placeholder function to render the dashboard panels based on the currentLayout.
   * This function would typically iterate over `currentLayout.panels` and render
   * the corresponding panel components (e.g., GraphPanel, TrainerPanel)
   * using a grid system like react-grid-layout.
   */
  const renderDashboardPanels = () => {
    if (!currentLayout || !currentLayout.panels || currentLayout.panels.length === 0) {
      return <p style={{ padding: '20px', textAlign: 'center' }}>No layout loaded or layout is empty. Try loading a default or saved layout.</p>;
    }
    return (
      <div style={{ border: '1px solid #ddd', padding: '15px', margin: '15px', backgroundColor: '#f9f9f9' }}>
        <h4 style={{ marginTop: 0 }}>Current Layout: {currentLayout.name} (ID: {currentLayout.id || 'Unsaved'})</h4>
        <p>Panels ({currentLayout.panels.length}):</p>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {currentLayout.panels.map(panel => (
            <li key={panel.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>{panel.title}</strong> (Type: {panel.type})
              <br />
              Position: (x: {panel.gridPosition.x}, y: {panel.gridPosition.y}),
              Size: (w: {panel.gridPosition.w}, h: {panel.gridPosition.h})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // --- Example UI elements for development/testing layout management ---
  const devLayoutControls = (
    <div style={{ border: '1px solid #ddd', padding: '15px', margin: '15px', backgroundColor: '#f0f0f0' }}>
      <h5 style={{marginTop: 0}}>Layout Management (Dev Controls)</h5>
      <div>
        <strong>Saved Layouts:</strong>
        {savedLayouts.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '150px', overflowY: 'auto' }}>
            {savedLayouts.map(layout => (
              <li key={layout.id} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{layout.name} (ID: {layout.id})</span>
                <div>
                  <button onClick={() => dispatch(loadLayoutById(layout.id!))} style={{marginRight: '5px'}}>Load</button>
                  <button onClick={() => {
                    if (window.confirm(`Are you sure you want to delete layout "${layout.name}"?`)) {
                      dispatch(deleteLayoutById(layout.id!));
                    }
                  }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No layouts saved yet.</p>
        )}
      </div>
      <button onClick={() => {
        if (window.confirm("Are you sure you want to reset to the unsaved default layout? Any current unsaved changes will be lost.")) {
          dispatch(setCurrentLayoutObject(defaultLayout));
        }
      }}>
        Reset to Default (Unsaved)
      </button>
    </div>
  );
  // --- End of example UI elements ---


  return (
    <div>
      <header style={{
        padding: '15px 20px',
        backgroundColor: '#333',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>Dashboard Application</h2>
        {/* Placeholder for other header items like a user profile or settings */}
        <button
          onClick={handleSaveLayoutClick}
          style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Layout
        </button>
      </header>

      {/* Render the actual dashboard panels based on currentLayout */}
      {renderDashboardPanels()}

      {/* Modal for saving a new layout */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        // Pre-fill modal with currentLayout.name. If it's the default layout (id: null),
        // it might be "Default Layout", or if user modified it, it's still unsaved.
        // If user loaded a saved layout and modified it, its name is used as base.
        currentLayoutName={currentLayout.name || "My New Layout"}
        title="Save New Layout"
      />

      {/* Render development controls (can be conditionally rendered based on environment) */}
      {devLayoutControls}
    </div>
  );
};

export default MainLayout;
