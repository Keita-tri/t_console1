import { StateCreator } from 'zustand';
import { PanelLayout } from '../../types';
import { defaultLayout, DEFAULT_LAYOUT_NAME } from '../../constants/defaultLayout';

// Helper to generate a simple unique ID (for demonstration)
const generateId = () => Date.now().toString();

export interface LayoutSlice {
  // State
  layouts: Record<string, PanelLayout[]>; // Key is layout ID
  layoutNames: Record<string, string>; // Key is layout ID, value is user-defined name
  currentLayoutId: string | null;
  currentLayoutName: string; // This will now reflect the name from layoutNames or a default
  isEditMode: boolean;
  editingLayoutId: string | null; // Changed from editingLayoutName
  hasUnsavedChanges: boolean;
  originalLayout: PanelLayout[] | null;
  isTrainingMode: boolean;

  // Actions
  layoutActions: {
    // Edit mode management
    enterEditMode: (layoutId?: string) => void; // Takes layoutId
    exitEditMode: () => void;
    discardChanges: () => void;
    markAsChanged: () => void;
    
    // Training mode
    enterTrainingMode: () => void;
    exitTrainingMode: () => void;
    
    // Layout management
    saveLayout: (name: string, layout: PanelLayout[]) => void; // Name is for new or renaming
    loadLayoutById: (id: string) => void;
    deleteLayout: (id: string) => void;
    renameLayout: (id: string, newName: string) => void;
    prepareNewLayout: () => void; // Action to set up for a new, unsaved layout
    
    // Panel management
    addPanel: (panel: PanelLayout) => void;
    removePanel: (panelId: string) => void;
    updatePanel: (panelId: string, updates: Partial<PanelLayout>) => void;
    updatePanelLayout: (layouts: PanelLayout[]) => void;

    // Initialization
    initializeDefaultLayout: () => void;
  };
}

export const createLayoutSlice: StateCreator<
  LayoutSlice,
  [],
  [],
  LayoutSlice
> = (set, get) => ({
  // Initial state
  layouts: {}, // Will be populated by initializeDefaultLayout or from storage
  layoutNames: {}, // Same here
  currentLayoutId: null,
  currentLayoutName: DEFAULT_LAYOUT_NAME, // Default name for an unsaved new layout
  isEditMode: false,
  editingLayoutId: null,
  hasUnsavedChanges: false,
  originalLayout: null,
  isTrainingMode: false,

  layoutActions: {
    initializeDefaultLayout: () => {
      set((state) => {
        // Only initialize if no layouts exist (e.g., first run or cleared storage)
        if (Object.keys(state.layouts).length === 0) {
          const newId = generateId(); // Generate an ID for the initial default layout
          return {
            layouts: { [newId]: JSON.parse(JSON.stringify(defaultLayout)) },
            layoutNames: { [newId]: DEFAULT_LAYOUT_NAME },
            currentLayoutId: newId,
            currentLayoutName: DEFAULT_LAYOUT_NAME,
            isEditMode: false,
            editingLayoutId: null,
            hasUnsavedChanges: false,
          };
        }
        // If layouts exist, try to set currentLayoutId to the first one if not set
        // This handles rehydration where currentLayoutId might be null
        if (!state.currentLayoutId && Object.keys(state.layouts).length > 0) {
          const firstId = Object.keys(state.layouts)[0];
          return {
            currentLayoutId: firstId,
            currentLayoutName: state.layoutNames[firstId] || DEFAULT_LAYOUT_NAME,
          };
        }
        return state; // No change needed
      });
    },

    enterEditMode: (layoutId?: string) => {
      set((state) => {
        const targetId = layoutId || state.currentLayoutId;
        if (!targetId || !state.layouts[targetId]) return state; // Cannot edit if no valid target

        return {
          isEditMode: true,
          editingLayoutId: targetId,
          hasUnsavedChanges: false,
          // Store a deep copy of the layout being edited
          originalLayout: JSON.parse(JSON.stringify(state.layouts[targetId])),
        };
      });
    },

    exitEditMode: () => {
      set(() => ({
        isEditMode: false,
        editingLayoutId: null,
        hasUnsavedChanges: false,
        originalLayout: null,
      }));
    },

    discardChanges: () => {
      set((state) => {
        if (!state.originalLayout || !state.editingLayoutId || !state.layouts[state.editingLayoutId]) {
          return state;
        }
        return {
          layouts: {
            ...state.layouts,
            [state.editingLayoutId]: JSON.parse(JSON.stringify(state.originalLayout)),
          },
          isEditMode: false,
          editingLayoutId: null,
          hasUnsavedChanges: false,
          originalLayout: null,
        };
      });
    },

    markAsChanged: () => {
      set((state) => (state.isEditMode ? { hasUnsavedChanges: true } : {}));
    },

    enterTrainingMode: () => set({ isTrainingMode: true }),
    exitTrainingMode: () => set({ isTrainingMode: false }),

    saveLayout: (name: string, layout: PanelLayout[]) => {
      set((state) => {
        let idToSave = state.currentLayoutId;
        const newLayouts = { ...state.layouts };
        const newLayoutNames = { ...state.layoutNames };

        if (!idToSave) { // New layout
          idToSave = generateId();
        }

        newLayouts[idToSave] = JSON.parse(JSON.stringify(layout)); // Save a deep copy
        newLayoutNames[idToSave] = name;

        return {
          layouts: newLayouts,
          layoutNames: newLayoutNames,
          currentLayoutId: idToSave,
          currentLayoutName: name,
          isEditMode: false, // Exit edit mode on save
          editingLayoutId: null,
          hasUnsavedChanges: false,
          originalLayout: null,
        };
      });
    },

    loadLayoutById: (id: string) => {
      set((state) => {
        if (!state.layouts[id]) return state; // Layout with ID does not exist

        if (state.isEditMode && state.hasUnsavedChanges) {
          const shouldDiscard = window.confirm(
            'You have unsaved changes. Discard changes and switch layouts?'
          );
          if (!shouldDiscard) {
            return state;
          }
        }
        return {
          currentLayoutId: id,
          currentLayoutName: state.layoutNames[id] || DEFAULT_LAYOUT_NAME,
          isEditMode: false,
          editingLayoutId: null,
          hasUnsavedChanges: false,
          originalLayout: null,
        };
      });
    },

    deleteLayout: (id: string) => {
      set((state) => {
        if (!state.layouts[id]) return state;

        const { [id]: deletedLayout, ...remainingLayouts } = state.layouts;
        const { [id]: deletedName, ...remainingLayoutNames } = state.layoutNames;
        
        let nextCurrentLayoutId: string | null = state.currentLayoutId;
        let nextCurrentLayoutName: string = state.currentLayoutName;

        if (state.currentLayoutId === id) { // If deleting the current layout
          const remainingIds = Object.keys(remainingLayouts);
          if (remainingIds.length > 0) {
            nextCurrentLayoutId = remainingIds[0];
            nextCurrentLayoutName = remainingLayoutNames[nextCurrentLayoutId] || DEFAULT_LAYOUT_NAME;
          } else { // No layouts left, prepare a new default one
            const newDefaultId = generateId();
            remainingLayouts[newDefaultId] = JSON.parse(JSON.stringify(defaultLayout));
            remainingLayoutNames[newDefaultId] = DEFAULT_LAYOUT_NAME;
            nextCurrentLayoutId = newDefaultId;
            nextCurrentLayoutName = DEFAULT_LAYOUT_NAME;
          }
        }

        return {
          layouts: remainingLayouts,
          layoutNames: remainingLayoutNames,
          currentLayoutId: nextCurrentLayoutId,
          currentLayoutName: nextCurrentLayoutName,
          isEditMode: state.editingLayoutId === id ? false : state.isEditMode,
          editingLayoutId: state.editingLayoutId === id ? null : state.editingLayoutId,
          hasUnsavedChanges: state.editingLayoutId === id ? false : state.hasUnsavedChanges,
          originalLayout: state.editingLayoutId === id ? null : state.originalLayout,
        };
      });
    },

    renameLayout: (id: string, newName: string) => {
      set((state) => {
        if (!state.layouts[id]) return state;

        return {
          layoutNames: {
            ...state.layoutNames,
            [id]: newName,
          },
          currentLayoutName: state.currentLayoutId === id ? newName : state.currentLayoutName,
        };
      });
    },

    prepareNewLayout: () => {
      set((state) => {
        // If current layout has unsaved changes in edit mode, prompt user
        if (state.isEditMode && state.hasUnsavedChanges) {
          const shouldDiscard = window.confirm(
            'You have unsaved changes. Discard changes and create a new layout?'
          );
          if (!shouldDiscard) {
            return state;
          }
        }
        // A new layout doesn't have an ID until saved.
        // We represent the "currently being worked on" layout via currentLayoutId being null.
        // The actual panel configuration for this new layout will be held directly in the
        // component state (e.g., react-grid-layout's state) or a temporary spot in the store
        // if needed, but for now, we assume the Dashboard component will use defaultLayout
        // when currentLayoutId is null.
        // A simpler approach: current layout in layouts slice always points to a *copy* of defaultLayout
        // when currentLayoutId is null. Let's use a temporary ID for the "new" layout in the store.
        const tempNewId = "unsaved_new_layout_marker"; // Special marker ID
        
        return {
          layouts: {
            ...state.layouts,
            [tempNewId]: JSON.parse(JSON.stringify(defaultLayout)) // Store a copy of default
          },
          layoutNames: {
            ...state.layoutNames,
            [tempNewId]: "New Layout" // Temporary name
          },
          currentLayoutId: tempNewId, // Point to this temporary new layout
          currentLayoutName: "New Layout",
          isEditMode: true, // Enter edit mode for the new layout immediately
          editingLayoutId: tempNewId,
          hasUnsavedChanges: true, // It's a new layout, so it's "changed" from nothing
          originalLayout: null, // No original to compare against for a brand new one
        };
      });
    },

    // Panel management actions need to operate on the correct layout
    // (either currentLayoutId or editingLayoutId if in edit mode)
    addPanel: (panel: PanelLayout) => {
      set((state) => {
        const targetId = state.isEditMode ? state.editingLayoutId : state.currentLayoutId;
        if (!targetId || !state.layouts[targetId]) return state;

        const newLayout = [...(state.layouts[targetId] || []), panel];
        return {
          layouts: { ...state.layouts, [targetId]: newLayout },
          hasUnsavedChanges: state.isEditMode || !state.currentLayoutId ? true : state.hasUnsavedChanges,
        };
      });
    },

    removePanel: (panelId: string) => {
      set((state) => {
        const targetId = state.isEditMode ? state.editingLayoutId : state.currentLayoutId;
        if (!targetId || !state.layouts[targetId]) return state;
        
        const newLayout = (state.layouts[targetId] || []).filter(p => p.i !== panelId);
        return {
          layouts: { ...state.layouts, [targetId]: newLayout },
          hasUnsavedChanges: state.isEditMode || !state.currentLayoutId ? true : state.hasUnsavedChanges,
        };
      });
    },

    updatePanel: (panelId: string, updates: Partial<PanelLayout>) => {
      set((state) => {
        const targetId = state.isEditMode ? state.editingLayoutId : state.currentLayoutId;
        if (!targetId || !state.layouts[targetId]) return state;

        const newLayout = (state.layouts[targetId] || []).map(p =>
          p.i === panelId ? { ...p, ...updates } : p
        );
        return {
          layouts: { ...state.layouts, [targetId]: newLayout },
          hasUnsavedChanges: state.isEditMode || !state.currentLayoutId ? true : state.hasUnsavedChanges,
        };
      });
    },

    updatePanelLayout: (newPanelLayouts: PanelLayout[]) => {
      set((state) => {
        const targetId = state.isEditMode ? state.editingLayoutId : state.currentLayoutId;
        if (!targetId) { // Handling the case where currentLayoutId might be null (new unsaved layout)
            // If currentLayoutId is null, we assume we are working on a new layout.
            // We need a way to store this temporary layout.
            // For now, let's assume `prepareNewLayout` sets up a temporary ID like "unsaved_new_layout_marker".
            if (targetId === "unsaved_new_layout_marker" || !state.currentLayoutId ) {
                 return {
                    layouts: {
                        ...state.layouts,
                        [state.currentLayoutId || "unsaved_new_layout_marker"]: newPanelLayouts,
                    },
                    hasUnsavedChanges: true, // Always true for an unsaved layout
                 };
            }
            return state; // Should not happen if prepareNewLayout is used correctly.
        }
        
        if (!state.layouts[targetId] && targetId !== (state.currentLayoutId || "unsaved_new_layout_marker")) return state;


        return {
          layouts: {
            ...state.layouts,
            [targetId]: newPanelLayouts,
          },
          hasUnsavedChanges: state.isEditMode || !state.currentLayoutId ? true : state.hasUnsavedChanges,
        };
      });
    },
  },
}));