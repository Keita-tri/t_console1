import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Layout, PanelConfig, defaultLayout } from '../../constants/defaultLayout';

// Key used for storing and retrieving layout data from localStorage.
const LAYOUTS_STORAGE_KEY = 'dashboardLayouts';

/**
 * Defines the shape of the layout state managed by Redux.
 */
export interface LayoutState {
  currentLayout: Layout; // The layout currently being displayed or edited.
  savedLayouts: Layout[]; // An array of all layouts saved by the user.
}

/**
 * Helper function to load layouts from localStorage.
 * Handles potential errors during parsing.
 * @returns An array of Layout objects, or an empty array if none found or an error occurs.
 */
const loadLayoutsFromStorage = (): Layout[] => {
  try {
    const serializedLayouts = localStorage.getItem(LAYOUTS_STORAGE_KEY);
    if (serializedLayouts === null) {
      return []; // No layouts saved yet.
    }
    return JSON.parse(serializedLayouts) as Layout[];
  } catch (error) {
    console.error("Error loading layouts from localStorage:", error);
    return []; // Return empty array on error to prevent app crash.
  }
};

/**
 * Helper function to save layouts to localStorage.
 * Handles potential errors during stringification.
 * @param layouts The array of Layout objects to save.
 */
const saveLayoutsToStorage = (layouts: Layout[]) => {
  try {
    const serializedLayouts = JSON.stringify(layouts);
    localStorage.setItem(LAYOUTS_STORAGE_KEY, serializedLayouts);
  } catch (error)
    console.error("Error saving layouts to localStorage:", error);
  }
};

// Load initial layouts from storage.
const savedLayoutsFromStorage = loadLayoutsFromStorage();

// Determine the initial current layout. If layouts are in storage, use the first one. Otherwise, use the default layout.
const initialCurrentLayout = savedLayoutsFromStorage.length > 0 ? savedLayoutsFromStorage[0] : defaultLayout;

// Initialize savedLayouts. If layouts were loaded from storage, use them. Otherwise, start with an empty array.
// The defaultLayout is not added to savedLayouts initially; it's only saved upon a user "Save" action.
const initialSavedLayouts = savedLayoutsFromStorage.length > 0 ? savedLayoutsFromStorage : [];

// Define the initial state for the layout slice.
const initialState: LayoutState = {
  currentLayout: initialCurrentLayout,
  savedLayouts: initialSavedLayouts,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    /**
     * Sets the current layout to the provided Layout object.
     * Useful for directly replacing the current layout, e.g., when resetting to default.
     */
    setCurrentLayoutObject: (state, action: PayloadAction<Layout>) => {
      state.currentLayout = action.payload;
    },
    /**
     * Saves the current layout as a new layout with the given name.
     * A new ID is generated for this layout.
     * The new layout becomes the currentLayout and is added to savedLayouts.
     * Persists changes to localStorage.
     * @param action.payload The name for the new layout.
     */
    saveCurrentLayoutAsNew: (state, action: PayloadAction<string>) => {
      const newLayoutName = action.payload;
      const newLayout: Layout = {
        ...state.currentLayout, // Base the new layout on the current one (including its panels)
        id: Date.now().toString(), // Generate a simple unique ID
        name: newLayoutName,
      };
      state.currentLayout = newLayout; // Set the newly saved layout as the current one
      state.savedLayouts.push(newLayout);
      saveLayoutsToStorage(state.savedLayouts);
    },
    /**
     * Updates the current layout if it has an ID (i.e., it's an existing saved layout).
     * Finds the layout in savedLayouts by ID and replaces it with the currentLayout object.
     * Persists changes to localStorage.
     * If currentLayout has an ID but isn't in savedLayouts (edge case), it saves it as new.
     */
    updateCurrentLayout: (state) => {
      if (state.currentLayout.id) { // Only proceed if the current layout is a saved one
        const index = state.savedLayouts.findIndex(layout => layout.id === state.currentLayout.id);
        if (index !== -1) {
          // Update existing layout
          state.savedLayouts[index] = state.currentLayout;
          saveLayoutsToStorage(state.savedLayouts);
        } else {
          // Edge case: currentLayout has an ID but is not found in savedLayouts.
          // This might happen if localStorage was tampered with or due to a previous bug.
          // To handle gracefully, save it as a new layout with its existing ID if possible, or generate new.
          // For simplicity here, we'll add it as if it's a new entry, though this might lead to duplicate names.
          // A more robust solution might involve user confirmation or a different ID generation.
          console.warn(`Layout with ID ${state.currentLayout.id} not found in savedLayouts for update. Adding it.`);
          state.savedLayouts.push(state.currentLayout); // Add the current (presumably modified) layout
          saveLayoutsToStorage(state.savedLayouts);
        }
      }
      // If currentLayout.id is null, it's an unsaved layout.
      // The UI should ensure `saveCurrentLayoutAsNew` is called in this scenario.
      // This reducer assumes `updateCurrentLayout` is only called for existing, saved layouts.
    },
    /**
     * Loads a layout from savedLayouts by its ID and sets it as the currentLayout.
     * @param action.payload The ID of the layout to load.
     */
    loadLayoutById: (state, action: PayloadAction<string>) => {
      const layoutId = action.payload;
      const foundLayout = state.savedLayouts.find(layout => layout.id === layoutId);
      if (foundLayout) {
        state.currentLayout = foundLayout;
      } else {
        console.warn(`Layout with ID ${layoutId} not found. Cannot load.`);
      }
    },
    /**
     * Deletes a layout from savedLayouts by its ID.
     * Persists changes to localStorage.
     * If the deleted layout was the currentLayout, it sets the currentLayout to the first available saved layout,
     * or to the defaultLayout if no saved layouts remain.
     * @param action.payload The ID of the layout to delete.
     */
    deleteLayoutById: (state, action: PayloadAction<string>) => {
      const layoutIdToDelete = action.payload;
      const initialSavedLayoutsCount = state.savedLayouts.length;
      state.savedLayouts = state.savedLayouts.filter(layout => layout.id !== layoutIdToDelete);

      if (state.savedLayouts.length < initialSavedLayoutsCount) { // Check if a layout was actually deleted
        saveLayoutsToStorage(state.savedLayouts);
        // If the active layout was the one deleted, load another or default
        if (state.currentLayout.id === layoutIdToDelete) {
          state.currentLayout = state.savedLayouts.length > 0 ? state.savedLayouts[0] : defaultLayout;
        }
      } else {
        console.warn(`Layout with ID ${layoutIdToDelete} not found. Cannot delete.`);
      }
    },
    /**
     * Updates a specific panel's configuration within the currentLayout.
     * This is typically used when a panel is moved, resized, or its internal settings change.
     * Note: This action makes the currentLayout "dirty". The UI is responsible for
     * triggering `updateCurrentLayout` (if saved) or `saveCurrentLayoutAsNew` (if new)
     * to persist these changes.
     * @param action.payload The updated PanelConfig object.
     */
    updatePanelInCurrentLayout: (state, action: PayloadAction<PanelConfig>) => {
      const updatedPanel = action.payload;
      if (!state.currentLayout || !state.currentLayout.panels) {
        console.error("Cannot update panel: currentLayout or its panels are undefined.");
        return;
      }
      const panelIndex = state.currentLayout.panels.findIndex(panel => panel.id === updatedPanel.id);
      if (panelIndex !== -1) {
        state.currentLayout.panels[panelIndex] = updatedPanel;
      } else {
        console.warn(`Panel with ID ${updatedPanel.id} not found in current layout. Cannot update.`);
      }
    },
  },
});

// Export actions for use in components
export const {
  setCurrentLayoutObject,
  saveCurrentLayoutAsNew,
  updateCurrentLayout,
  loadLayoutById,
  deleteLayoutById,
  updatePanelInCurrentLayout,
} = layoutSlice.actions;

// Export the reducer to be included in the store
export default layoutSlice.reducer;
