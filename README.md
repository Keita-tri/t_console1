# Web Training Console

Web-based training console for cycling with Bluetooth sensor support and smart trainer control.

## 🚀 Features

### Phase 1 - Core Infrastructure ✅
- **F-001**: Bluetooth sensor connection and management
  - Heart Rate monitors (ANT+ and Bluetooth)
  - Power meters with real-time data
  - Speed/Cadence sensors
  - Core body temperature sensors
  - Muscle oxygen (SmO2/tHb) sensors
- **F-002**: Real-time data display system
  - Customizable data panels with drag-and-drop
  - Live sensor data visualization
  - Multiple data types support
- **F-003**: Session recording and management
  - Start/stop/pause session control
  - Lap recording with statistics
  - Real-time session timer
- **F-004**: User profile and training zones
  - FTP and max heart rate configuration
  - Power zones (7 zones) with custom colors
  - Heart rate zones (5 zones) with custom colors
- **F-005**: Dashboard layout system
  - Drag-and-drop panel arrangement
  - Resizable panels with grid layout
  - Multiple layout save/load

### Phase 2 - Enhanced Visualization ✅
- **F-006**: Advanced graph panels
  - Time-series data visualization
  - Real-time updating charts
  - Configurable time windows (1-60 minutes)
- **F-007**: Zone-based visualization
  - Color-coded power and heart rate zones
  - Real-time zone indicators
  - Zone boundary lines on graphs
- **F-008**: Multiple dashboard layouts
  - Named layout management
  - Layout switching and organization
  - Import/export layout configurations
- **F-009**: Layout editing system
  - Protected edit mode with confirmation
  - Unsaved changes tracking
  - Layout versioning and backup

### Phase 3 - Advanced Features 🚧
- **F-010**: Data calculation engine
  - Normalized Power (NP) calculation
  - Intensity Factor (IF) and TSS
  - 3-second power smoothing
  - Moving averages and statistics
- **F-011**: Enhanced panel configuration
  - Individual panel color settings
  - Precision and unit display options
  - Custom panel naming
- **F-012**: Session data management
  - Historical session storage
  - Session statistics and analysis
  - Data persistence across sessions
- **F-013**: Advanced graph features
  - Zoom and pan functionality
  - Multiple data overlay
  - Custom Y-axis scaling
- **F-014**: Data export capabilities
  - CSV export for analysis
  - TCX format for training platforms
  - FIT file generation
- **F-015**: Smart trainer control
  - ERG mode (target power control)
  - Resistance mode settings
  - Real-time trainer status monitoring
  - Safety features and emergency stop
- **F-016**: Structured workout support
  - .erg and .zwo file parsing
  - Workout step progression
  - Target power automation
- **F-017**: Performance analytics
  - Power distribution analysis
  - Training load calculations
  - Zone time analysis
- **F-018**: Advanced sensor management
  - Sensor calibration tools
  - Data quality monitoring
  - Automatic reconnection
- **F-019**: Enhanced graph visualization
  - Multiple chart types (line, bar, scatter)
  - Interactive data exploration
  - Custom graph templates
- **F-020**: Individual graph configuration
  - Per-graph settings panel
  - Data filtering and smoothing
  - Custom color schemes

### Phase 4 - Professional Features (Planned)
- **F-021**: Training plan management
- **F-022**: Cloud data synchronization
- **F-023**: Mobile companion app
- **F-024**: Advanced coaching tools
- **F-025**: Performance trending

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand with persistence
- **Styling**: Styled Components + Tailwind CSS
- **Charts**: Recharts for data visualization
- **Layout**: React Grid Layout for dashboard
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest (planned)

## 📁 Architecture

```
src/
├── app/                    # Application entry point
│   └── App.tsx            # Main application component
├── components/             # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── Dashboard.tsx  # Main dashboard container
│   │   ├── Panel.tsx      # Data display panels
│   │   ├── GraphPanel.tsx # Chart visualization panels
│   │   ├── PanelEditModal.tsx # Panel configuration
│   │   ├── LayoutManager.tsx  # Layout management
│   │   └── DashboardSettingsModal.tsx # Settings
│   ├── common/            # Common UI components
│   │   ├── Button.tsx     # Styled button component
│   │   ├── Modal.tsx      # Modal dialog component
│   │   └── ColorPicker.tsx # Color selection component
│   ├── layout/            # Layout components
│   │   └── MainLayout.tsx # Application layout wrapper
│   └── trainer/           # Smart trainer components
│       └── TrainerControlPanel.tsx # Trainer control interface
├── constants/             # Application constants
│   ├── ble.ts            # Bluetooth sensor profiles
│   └── dataTypes.ts      # Data type configurations
├── features/              # Feature-specific modules
│   └── workout/           # Structured workout functionality
│       ├── workoutParser.ts    # Workout file parsing
│       └── WorkoutController.tsx # Workout execution
├── hooks/                 # Custom React hooks
│   └── useSessionTimer.ts # Session timing logic
├── services/              # External service integrations
│   ├── bleService.ts      # Bluetooth sensor communication
│   └── trainerService.ts  # Smart trainer communication
├── store/                 # State management
│   └── useAppStore.ts     # Zustand store configuration
├── styles/                # Global styles
│   └── globalStyles.ts    # Styled components theme
├── types/                 # TypeScript type definitions
│   └── index.ts           # Application type definitions
└── utils/                 # Utility functions
    └── calculationUtils.ts # Data calculation engine
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** 
- **Modern browser** with Web Bluetooth API support (Chrome 56+, Edge 79+)
- **Bluetooth-enabled cycling sensors** (optional for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/Keita-tri/training_console.git
cd training_console

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Supported Sensors

### Heart Rate Monitors
- ANT+ heart rate monitors via Bluetooth bridge
- Bluetooth Low Energy heart rate monitors
- Chest strap and wrist-based monitors

### Power Meters
- Crank-based power meters
- Pedal-based power meters
- Hub-based power meters
- Direct drive trainers with power measurement

### Speed & Cadence
- Combined speed/cadence sensors
- Separate cadence sensors
- Wheel speed sensors

### Environmental Sensors
- Core body temperature sensors
- Skin temperature monitoring
- Ambient temperature sensors

### Muscle Oxygen Sensors
- SmO2 (muscle oxygen saturation) sensors
- tHb (total hemoglobin) measurement
- NIRS-based muscle oxygen monitors

### Smart Trainers (Phase 3)
- ERG mode compatible trainers
- Resistance control trainers
- FE-C protocol support

## 🌐 Browser Compatibility

| Browser | Version | Web Bluetooth | Status |
|---------|---------|---------------|--------|
| Chrome | 56+ | ✅ | Recommended |
| Edge | 79+ | ✅ | Supported |
| Opera | 43+ | ✅ | Supported |
| Samsung Internet | 6.0+ | ✅ | Supported |
| Firefox | - | ❌ | Not supported |
| Safari | - | ❌ | Not supported |

*Note: Web Bluetooth API is required for sensor connectivity*

## 📊 Data Types Supported

### Real-time Data
- Power (W)
- 3-second power (W)
- Heart rate (bpm)
- Cadence (rpm)
- Core temperature (°C)
- Skin temperature (°C)
- SmO2 (%)
- tHb (g/dl)

### Calculated Metrics
- Normalized Power (NP)
- Intensity Factor (IF)
- Training Stress Score (TSS)
- Average/Max values
- Lap statistics
- Work (kJ)

### Session Information
- Elapsed time
- Lap count
- Session status
- Target power (trainer control)

## 🎯 Usage Examples

### Basic Session Recording
1. Connect your sensors via Bluetooth
2. Configure your FTP and max heart rate in settings
3. Add data panels to your dashboard
4. Start a session and begin training
5. Use lap button to mark intervals

### Custom Dashboard Creation
1. Enter edit mode from the dashboard
2. Add panels for desired data types
3. Drag and resize panels as needed
4. Save your layout with a custom name
5. Switch between layouts as needed

### Smart Trainer Workouts (Phase 3)
1. Connect your smart trainer
2. Load a structured workout (.erg or .zwo file)
3. Start the workout for automatic power targets
4. Monitor progress with real-time feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use styled-components for styling
- Write comprehensive type definitions
- Test with real Bluetooth sensors when possible
- Maintain backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺 Roadmap

### Phase 3 (Q1 2024) - Advanced Features
- ✅ Smart trainer integration and control
- ✅ Enhanced graph visualization with zoom/pan
- ✅ Structured workout file support (.erg, .zwo)
- 🚧 Advanced data calculation engine
- 🚧 Individual panel configuration system

### Phase 4 (Q2 2024) - Professional Tools
- 📋 Data export (TCX, FIT, CSV)
- 📋 Training plan management
- 📋 Performance analytics dashboard
- 📋 Historical data analysis

### Phase 5 (Q3 2024) - Cloud & Mobile
- 📋 Cloud data synchronization
- 📋 Mobile companion app
- 📋 Advanced coaching features
- 📋 Social training features

### Phase 6 (Q4 2024) - Enterprise
- 📋 Multi-user support
- 📋 Team management tools
- 📋 Advanced reporting
- 📋 API for third-party integrations

## 🆘 Support

For support and questions:
- 📧 Open an issue on GitHub
- 📖 Check the documentation
- 💬 Join our community discussions

## 🏆 Acknowledgments

- Web Bluetooth API community
- Cycling sensor manufacturers
- Open source contributors
- Beta testing community

---

**Built with ❤️ for the cycling community**