import { StateCreator } from 'zustand';
import { PanelLayout } from '../../types';

export interface LayoutSlice {
  // State
  layouts: Record<string, PanelLayout[]>;
  currentLayoutName: string;
  isEditMode: boolean;
  editingLayoutName: string | null;
  hasUnsavedChanges: boolean;
  originalLayout: PanelLayout[] | null;
  isTrainingMode: boolean;

  // Actions
  layoutActions: {
    // Edit mode management
    enterEditMode: (layoutName?: string) => void;
    exitEditMode: () => void;
    discardChanges: () => void;
    markAsChanged: () => void;
    
    // Training mode
    enterTrainingMode: () => void;
    exitTrainingMode: () => void;
    
    // Layout management
    saveLayout: (name: string, layout: PanelLayout[]) => void;
    loadLayout: (name: string) => void;
    deleteLayout: (name: string) => void;
    renameLayout: (oldName: string, newName: string) => void;
    
    // Panel management
    addPanel: (panel: PanelLayout) => void;
    removePanel: (panelId: string) => void;
    updatePanel: (panelId: string, updates: Partial<PanelLayout>) => void;
    updatePanelLayout: (layouts: PanelLayout[]) => void;
  };
}

export const createLayoutSlice: StateCreator<
  LayoutSlice,
  [],
  [],
  LayoutSlice
> = (set, get) => ({
  // Initial state
  layouts: {
    default: []
  },
  currentLayoutName: 'default',
  isEditMode: false,
  editingLayoutName: null,
  hasUnsavedChanges: false,
  originalLayout: null,
  isTrainingMode: false,

  layoutActions: {
    // Edit mode management
    enterEditMode: (layoutName?: string) => {
      set((state) => {
        const targetLayoutName = layoutName || state.currentLayoutName;
        const currentLayout = state.layouts[targetLayoutName] || [];
        
        return {
          isEditMode: true,
          editingLayoutName: targetLayoutName,
          hasUnsavedChanges: false,
          originalLayout: JSON.parse(JSON.stringify(currentLayout))
        };
      });
    },

    exitEditMode: () => {
      set((state) => {
        const newCurrentLayoutName = state.editingLayoutName || state.currentLayoutName;
        
        return {
          isEditMode: false,
          editingLayoutName: null,
          hasUnsavedChanges: false,
          originalLayout: null,
          currentLayoutName: newCurrentLayoutName
        };
      });
    },

    discardChanges: () => {
      set((state) => {
        if (!state.originalLayout || !state.editingLayoutName) return state;
        
        return {
          layouts: {
            ...state.layouts,
            [state.editingLayoutName]: JSON.parse(JSON.stringify(state.originalLayout))
          },
          isEditMode: false,
          editingLayoutName: null,
          hasUnsavedChanges: false,
          originalLayout: null
        };
      });
    },

    markAsChanged: () => {
      set((state) => ({
        hasUnsavedChanges: state.isEditMode ? true : state.hasUnsavedChanges
      }));
    },

    // Training mode
    enterTrainingMode: () => {
      set(() => ({
        isTrainingMode: true
      }));
    },

    exitTrainingMode: () => {
      set(() => ({
        isTrainingMode: false
      }));
    },

    // Layout management
    saveLayout: (name: string, layout: PanelLayout[]) => {
      set((state) => ({
        layouts: {
          ...state.layouts,
          [name]: layout
        },
        isEditMode: state.editingLayoutName === name ? false : state.isEditMode,
        editingLayoutName: state.editingLayoutName === name ? null : state.editingLayoutName,
        hasUnsavedChanges: state.editingLayoutName === name ? false : state.hasUnsavedChanges,
        originalLayout: state.editingLayoutName === name ? null : state.originalLayout,
        currentLayoutName: state.editingLayoutName === name ? name : state.currentLayoutName
      }));
    },

    loadLayout: (name: string) => {
      set((state) => {
        if (state.isEditMode && state.hasUnsavedChanges) {
          const shouldDiscard = window.confirm(
            'You have unsaved changes. Discard changes and switch layouts?'
          );
          if (!shouldDiscard) {
            return state;
          }
        }

        return {
          currentLayoutName: name,
          isEditMode: false,
          editingLayoutName: null,
          hasUnsavedChanges: false,
          originalLayout: null
        };
      });
    },

    deleteLayout: (name: string) => {
      set((state) => {
        if (name === 'default') return state;
        
        const { [name]: deleted, ...remainingLayouts } = state.layouts;
        const newCurrentLayoutName = state.currentLayoutName === name ? 'default' : state.currentLayoutName;
        const isEditingDeleted = state.editingLayoutName === name;
        
        return {
          layouts: remainingLayouts,
          currentLayoutName: newCurrentLayoutName,
          isEditMode: isEditingDeleted ? false : state.isEditMode,
          editingLayoutName: isEditingDeleted ? null : state.editingLayoutName,
          hasUnsavedChanges: isEditingDeleted ? false : state.hasUnsavedChanges,
          originalLayout: isEditingDeleted ? null : state.originalLayout
        };
      });
    },

    renameLayout: (oldName: string, newName: string) => {
      set((state) => {
        if (oldName === 'default' || !state.layouts[oldName]) return state;
        
        const layout = state.layouts[oldName];
        const { [oldName]: removed, ...otherLayouts } = state.layouts;
        
        return {
          layouts: {
            ...otherLayouts,
            [newName]: layout
          },
          currentLayoutName: state.currentLayoutName === oldName ? newName : state.currentLayoutName,
          editingLayoutName: state.editingLayoutName === oldName ? newName : state.editingLayoutName
        };
      });
    },

    // Panel management
    addPanel: (panel: PanelLayout) => {
      set((state) => {
        const targetLayoutName = state.isEditMode ? state.editingLayoutName! : state.currentLayoutName;
        const currentLayout = state.layouts[targetLayoutName] || [];
        
        return {
          layouts: {
            ...state.layouts,
            [targetLayoutName]: [...currentLayout, panel]
          },
          hasUnsavedChanges: state.isEditMode ? true : state.hasUnsavedChanges
        };
      });
    },

    removePanel: (panelId: string) => {
      set((state) => {
        const targetLayoutName = state.isEditMode ? state.editingLayoutName! : state.currentLayoutName;
        const currentLayout = state.layouts[targetLayoutName] || [];
        
        return {
          layouts: {
            ...state.layouts,
            [targetLayoutName]: currentLayout.filter(panel => panel.i !== panelId)
          },
          hasUnsavedChanges: state.isEditMode ? true : state.hasUnsavedChanges
        };
      });
    },

    updatePanel: (panelId: string, updates: Partial<PanelLayout>) => {
      set((state) => {
        const targetLayoutName = state.isEditMode ? state.editingLayoutName! : state.currentLayoutName;
        const currentLayout = state.layouts[targetLayoutName] || [];
        
        return {
          layouts: {
            ...state.layouts,
            [targetLayoutName]: currentLayout.map(panel => 
              panel.i === panelId ? { ...panel, ...updates } : panel
            )
          },
          hasUnsavedChanges: state.isEditMode ? true : state.hasUnsavedChanges
        };
      });
    },

    updatePanelLayout: (layouts: PanelLayout[]) => {
      set((state) => {
        const targetLayoutName = state.isEditMode ? state.editingLayoutName! : state.currentLayoutName;
        
        return {
          layouts: {
            ...state.layouts,
            [targetLayoutName]: layouts
          },
          hasUnsavedChanges: state.isEditMode ? true : state.hasUnsavedChanges
        };
      });
    }
  }
});