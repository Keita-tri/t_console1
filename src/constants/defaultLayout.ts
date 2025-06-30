import { PanelLayout, PanelType } from '../types';

export const DEFAULT_LAYOUT_NAME = 'Default Layout';

export const defaultLayout: PanelLayout[] = [
  {
    i: 'graph-panel-1', // Unique ID for the panel
    x: 0, // Horizontal position in grid units
    y: 0, // Vertical position in grid units
    w: 6, // Width in grid units (assuming a 12-column grid)
    h: 4, // Height in grid units
    type: PanelType.Graph, // Type of the panel
    title: 'Graph Panel 1', // Default title for the panel
    // graphType: 'power', // Example: default graph type
    // selectedSensors: [], // Example: default selected sensors
  },
  {
    i: 'trainer-panel-1',
    x: 6,
    y: 0,
    w: 6,
    h: 4,
    type: PanelType.Trainer,
    title: 'Trainer Panel 1',
    // targetPower: 200, // Example: default target power
  },
  {
    i: 'graph-panel-2',
    x: 0,
    y: 4,
    w: 6,
    h: 4,
    type: PanelType.Graph,
    title: 'Graph Panel 2',
  },
  {
    i: 'trainer-panel-2',
    x: 6,
    y: 4,
    w: 6,
    h: 4,
    type: PanelType.Trainer,
    title: 'Trainer Panel 2',
  },
];
