import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createDeviceSlice, DeviceSlice } from './slices/deviceSlice';
import { createSessionSlice, SessionSlice } from './slices/sessionSlice';
import { createLayoutSlice, LayoutSlice } from './slices/layoutSlice';

// Combined store type
export type AppStore = UserSlice & DeviceSlice & SessionSlice & LayoutSlice & {
  // Dashboard display options
  dashboardDisplayOptions: {
    colorCodeByAthlete: boolean;
    showAthleteNames: boolean;
  };

  // Legacy actions for backward compatibility
  actions: {
    // User actions
    addUserProfile: UserSlice['userActions']['addUserProfile'];
    updateUserProfile: UserSlice['userActions']['updateUserProfile'];
    deleteUserProfile: UserSlice['userActions']['deleteUserProfile'];
    setUserActive: UserSlice['userActions']['setUserActive'];
    getIsMultiUserMode: UserSlice['userActions']['getIsMultiUserMode'];
    getActiveUserCount: UserSlice['userActions']['getActiveUserCount'];
    toggleMultiUserMode: UserSlice['userActions']['toggleMultiUserMode'];
    setMultiUserMode: UserSlice['userActions']['setMultiUserMode'];
    updatePowerZones: UserSlice['userActions']['updatePowerZones'];
    updateHrZones: UserSlice['userActions']['updateHrZones'];
    getUserZones: UserSlice['userActions']['getUserZones'];

    // Device actions
    addSensor: DeviceSlice['deviceActions']['addSensor'];
    removeSensor: DeviceSlice['deviceActions']['removeSensor'];
    updateSensorData: DeviceSlice['deviceActions']['updateSensorData'];
    saveSensorInfo: DeviceSlice['deviceActions']['saveSensorInfo'];
    removeSavedSensor: DeviceSlice['deviceActions']['removeSavedSensor'];
    updateSensorAlias: DeviceSlice['deviceActions']['updateSensorAlias'];
    getSavedSensors: DeviceSlice['deviceActions']['getSavedSensors'];
    assignSensorToUser: DeviceSlice['deviceActions']['assignSensorToUser'];
    unassignSensorFromUser: DeviceSlice['deviceActions']['unassignSensorFromUser'];
    getSensorAssignedUser: DeviceSlice['deviceActions']['getSensorAssignedUser'];
    getUserAssignedSensors: DeviceSlice['deviceActions']['getUserAssignedSensors'];
    getSensorData: DeviceSlice['deviceActions']['getSensorData'];
    getSensorTimestamps: DeviceSlice['deviceActions']['getSensorTimestamps'];
    getSensorStats: DeviceSlice['deviceActions']['getSensorStats'];
    getSensorLapStats: DeviceSlice['deviceActions']['getSensorLapStats'];
    clearSensorSessionData: DeviceSlice['deviceActions']['clearSensorSessionData']; // ★ 新しいアクション
    addTrainer: DeviceSlice['deviceActions']['addTrainer'];
    removeTrainer: DeviceSlice['deviceActions']['removeTrainer'];
    updateTrainerStatus: DeviceSlice['deviceActions']['updateTrainerStatus'];
    updateTrainerState: DeviceSlice['deviceActions']['updateTrainerState'];
    assignTrainerToUser: DeviceSlice['deviceActions']['assignTrainerToUser'];
    sendTrainerCommand: DeviceSlice['deviceActions']['sendTrainerCommand'];

    // Session actions
    startSession: SessionSlice['sessionActions']['startSession'];
    stopSession: SessionSlice['sessionActions']['stopSession'];
    pauseSession: SessionSlice['sessionActions']['pauseSession'];
    addLap: SessionSlice['sessionActions']['addLap'];
    updateElapsedTime: SessionSlice['sessionActions']['updateElapsedTime'];
    recordSensorData: SessionSlice['sessionActions']['recordSensorData'];
    clearSessionData: SessionSlice['sessionActions']['clearSessionData'];
    clearAllSessionData: SessionSlice['sessionActions']['clearAllSessionData']; // ★ 新しいアクション
    exportSessionData: SessionSlice['sessionActions']['exportSessionData']; // ★ 新しいアクション
    hasExportableData: SessionSlice['sessionActions']['hasExportableData']; // ★ 新しいアクション
    getExportStats: SessionSlice['sessionActions']['getExportStats']; // ★ 新しいアクション
    getUserData: SessionSlice['sessionActions']['getUserData'];
    getUserTimestamps: SessionSlice['sessionActions']['getUserTimestamps'];
    getUserStats: SessionSlice['sessionActions']['getUserStats'];
    getUserLapStats: SessionSlice['sessionActions']['getUserLapStats'];
    getUserSessionStats: SessionSlice['sessionActions']['getUserSessionStats'];
    getSessionStats: SessionSlice['sessionActions']['getSessionStats'];
    getCurrentLapStats: SessionSlice['sessionActions']['getCurrentLapStats'];
    getLapStats: SessionSlice['sessionActions']['getLapStats'];

    // Layout actions
    enterEditMode: LayoutSlice['layoutActions']['enterEditMode'];
    exitEditMode: LayoutSlice['layoutActions']['exitEditMode'];
    discardChanges: LayoutSlice['layoutActions']['discardChanges'];
    markAsChanged: LayoutSlice['layoutActions']['markAsChanged'];
    enterTrainingMode: LayoutSlice['layoutActions']['enterTrainingMode'];
    exitTrainingMode: LayoutSlice['layoutActions']['exitTrainingMode'];
    saveLayout: LayoutSlice['layoutActions']['saveLayout'];
    loadLayout: LayoutSlice['layoutActions']['loadLayout'];
    deleteLayout: LayoutSlice['layoutActions']['deleteLayout'];
    renameLayout: LayoutSlice['layoutActions']['renameLayout'];
    addPanel: LayoutSlice['layoutActions']['addPanel'];
    removePanel: LayoutSlice['layoutActions']['removePanel'];
    updatePanel: LayoutSlice['layoutActions']['updatePanel'];
    updatePanelLayout: LayoutSlice['layoutActions']['updatePanelLayout'];

    // Dashboard display options
    setDashboardDisplayOptions: (options: Partial<{ colorCodeByAthlete: boolean; showAthleteNames: boolean }>) => void;

    // Additional helper methods
    updateIntegratedSessionData: (sessionData: any, allSensorData: any, trainers: any) => void;
    updateTemperatureAndOxygenData: (sessionData: any, allSensorData: any) => void;
  };
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get, store) => {
      const userSlice = createUserSlice(set, get, store);
      const deviceSlice = createDeviceSlice(set, get, store);
      const sessionSlice = createSessionSlice(set, get, store);
      const layoutSlice = createLayoutSlice(set, get, store);

      return {
        // Combine all slices
        ...userSlice,
        ...deviceSlice,
        ...sessionSlice,
        ...layoutSlice,

        // Dashboard display options
        dashboardDisplayOptions: {
          colorCodeByAthlete: false,
          showAthleteNames: false,
        },

        // Legacy actions object for backward compatibility
        actions: {
          // User actions
          addUserProfile: userSlice.userActions.addUserProfile,
          updateUserProfile: userSlice.userActions.updateUserProfile,
          deleteUserProfile: userSlice.userActions.deleteUserProfile,
          setUserActive: userSlice.userActions.setUserActive,
          getIsMultiUserMode: userSlice.userActions.getIsMultiUserMode,
          getActiveUserCount: userSlice.userActions.getActiveUserCount,
          toggleMultiUserMode: userSlice.userActions.toggleMultiUserMode,
          setMultiUserMode: userSlice.userActions.setMultiUserMode,
          updatePowerZones: userSlice.userActions.updatePowerZones,
          updateHrZones: userSlice.userActions.updateHrZones,
          getUserZones: userSlice.userActions.getUserZones,

          // Device actions
          addSensor: deviceSlice.deviceActions.addSensor,
          removeSensor: deviceSlice.deviceActions.removeSensor,
          updateSensorData: deviceSlice.deviceActions.updateSensorData,
          saveSensorInfo: deviceSlice.deviceActions.saveSensorInfo,
          removeSavedSensor: deviceSlice.deviceActions.removeSavedSensor,
          updateSensorAlias: deviceSlice.deviceActions.updateSensorAlias,
          getSavedSensors: deviceSlice.deviceActions.getSavedSensors,
          assignSensorToUser: deviceSlice.deviceActions.assignSensorToUser,
          unassignSensorFromUser: deviceSlice.deviceActions.unassignSensorFromUser,
          getSensorAssignedUser: deviceSlice.deviceActions.getSensorAssignedUser,
          getUserAssignedSensors: deviceSlice.deviceActions.getUserAssignedSensors,
          getSensorData: deviceSlice.deviceActions.getSensorData,
          getSensorTimestamps: deviceSlice.deviceActions.getSensorTimestamps,
          getSensorStats: deviceSlice.deviceActions.getSensorStats,
          getSensorLapStats: deviceSlice.deviceActions.getSensorLapStats,
          clearSensorSessionData: deviceSlice.deviceActions.clearSensorSessionData, // ★ 新しいアクション
          addTrainer: deviceSlice.deviceActions.addTrainer,
          removeTrainer: deviceSlice.deviceActions.removeTrainer,
          updateTrainerStatus: deviceSlice.deviceActions.updateTrainerStatus,
          updateTrainerState: deviceSlice.deviceActions.updateTrainerState,
          assignTrainerToUser: deviceSlice.deviceActions.assignTrainerToUser,
          sendTrainerCommand: deviceSlice.deviceActions.sendTrainerCommand,

          // Session actions
          startSession: sessionSlice.sessionActions.startSession,
          stopSession: sessionSlice.sessionActions.stopSession,
          pauseSession: sessionSlice.sessionActions.pauseSession,
          addLap: sessionSlice.sessionActions.addLap,
          updateElapsedTime: sessionSlice.sessionActions.updateElapsedTime,
          recordSensorData: sessionSlice.sessionActions.recordSensorData,
          clearSessionData: sessionSlice.sessionActions.clearSessionData,
          clearAllSessionData: sessionSlice.sessionActions.clearAllSessionData, // ★ 新しいアクション
          exportSessionData: sessionSlice.sessionActions.exportSessionData, // ★ 新しいアクション
          hasExportableData: sessionSlice.sessionActions.hasExportableData, // ★ 新しいアクション
          getExportStats: sessionSlice.sessionActions.getExportStats, // ★ 新しいアクション
          getUserData: sessionSlice.sessionActions.getUserData,
          getUserTimestamps: sessionSlice.sessionActions.getUserTimestamps,
          getUserStats: sessionSlice.sessionActions.getUserStats,
          getUserLapStats: sessionSlice.sessionActions.getUserLapStats,
          getUserSessionStats: sessionSlice.sessionActions.getUserSessionStats,
          getSessionStats: sessionSlice.sessionActions.getSessionStats,
          getCurrentLapStats: sessionSlice.sessionActions.getCurrentLapStats,
          getLapStats: sessionSlice.sessionActions.getLapStats,

          // Layout actions
          enterEditMode: layoutSlice.layoutActions.enterEditMode,
          exitEditMode: layoutSlice.layoutActions.exitEditMode,
          discardChanges: layoutSlice.layoutActions.discardChanges,
          markAsChanged: layoutSlice.layoutActions.markAsChanged,
          enterTrainingMode: layoutSlice.layoutActions.enterTrainingMode,
          exitTrainingMode: layoutSlice.layoutActions.exitTrainingMode,
          saveLayout: layoutSlice.layoutActions.saveLayout,
          loadLayout: layoutSlice.layoutActions.loadLayout,
          deleteLayout: layoutSlice.layoutActions.deleteLayout,
          renameLayout: layoutSlice.layoutActions.renameLayout,
          addPanel: layoutSlice.layoutActions.addPanel,
          removePanel: layoutSlice.layoutActions.removePanel,
          updatePanel: layoutSlice.layoutActions.updatePanel,
          updatePanelLayout: layoutSlice.layoutActions.updatePanelLayout,

          // Dashboard display options
          setDashboardDisplayOptions: (options) => {
            set((state) => ({
              dashboardDisplayOptions: { ...state.dashboardDisplayOptions, ...options }
            }));
          },

          // Additional helper methods (placeholder implementations)
          updateIntegratedSessionData: (sessionData: any, allSensorData: any, trainers: any) => {
            // Implementation would be moved here from the original store
            console.log('updateIntegratedSessionData called');
          },

          updateTemperatureAndOxygenData: (sessionData: any, allSensorData: any) => {
            // Implementation would be moved here from the original store
            console.log('updateTemperatureAndOxygenData called');
          }
        }
      };
    },
    {
      name: 'cycling-console-storage',
      skipHydration: true,
      partialize: (state) => ({
        userProfiles: state.userProfiles,
        powerZones: state.powerZones,
        hrZones: state.hrZones,
        layouts: state.layouts,
        currentLayoutName: state.currentLayoutName,
        savedSensors: state.savedSensors,
        trainerState: state.trainerState,
        isMultiUserMode: state.isMultiUserMode,
        dashboardDisplayOptions: state.dashboardDisplayOptions
      })
    }
  )
);

// Hydration handling
if (typeof window !== 'undefined') {
  useAppStore.persist.rehydrate();
}