export interface PanelConfig {
  id: string; // Unique identifier for the panel
  type: string; // Type of the panel, e.g., 'GraphPanel', 'TrainerPanel'
  title: string; // Display title for the panel
  gridPosition: { x: number; y: number; w: number; h: number }; // Position and size in the grid
}

export interface Layout {
  id: string | null; // Unique ID of the layout, null if it's a new/unsaved layout
  name: string; // User-defined name for the layout
  panels: PanelConfig[]; // Array of panel configurations belonging to this layout
}

// Defines the default layout structure for the application when no saved layouts are found.
export const defaultLayout: Layout = {
  id: null, // Initially unsaved
  name: "Default Layout",
  panels: [
    {
      id: "panel-1", // Unique ID for this panel instance
      type: "GraphPanel", // Specifies the component type to render
      title: "Graph Panel 1", // Default title for this panel
      gridPosition: { x: 0, y: 0, w: 6, h: 4 }, // Position: top-left, Size: half-width, 4 rows (assuming a 12-column grid)
    },
    {
      id: "panel-2",
      type: "TrainerPanel",
      title: "Trainer Panel 1",
      gridPosition: { x: 6, y: 0, w: 6, h: 4 }, // Position: top-right, Size: half-width, 4 rows
    },
    {
      id: "panel-3",
      type: "GraphPanel",
      title: "Graph Panel 2",
      gridPosition: { x: 0, y: 4, w: 6, h: 4 }, // Position: bottom-left, Size: half-width, 4 rows
    },
    {
      id: "panel-4",
      type: "TrainerPanel",
      title: "Trainer Panel 2",
      gridPosition: { x: 6, y: 4, w: 6, h: 4 }, // Position: bottom-right, Size: half-width, 4 rows
    },
  ],
};
