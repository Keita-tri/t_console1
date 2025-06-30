import { StateCreator } from 'zustand';
import { UserProfile, Zone } from '../../types';
import { DEFAULT_POWER_ZONES, DEFAULT_HR_ZONES } from '../../constants/ble';
import { v4 as uuidv4 } from 'uuid';

export interface UserSlice {
  // State
  userProfiles: Record<string, UserProfile>;
  powerZones: Zone[];
  hrZones: Zone[];
  isMultiUserMode: boolean;

  // Actions
  userActions: {
    // User profile management
    addUserProfile: (profile: UserProfile) => void;
    updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
    deleteUserProfile: (id: string) => void;
    setUserActive: (userId: string, active: boolean) => void;
    
    // Multi-user mode
    getIsMultiUserMode: () => boolean;
    getActiveUserCount: () => number;
    toggleMultiUserMode: () => void;
    setMultiUserMode: (enabled: boolean) => void;
    
    // Zone management
    updatePowerZones: (zones: Zone[]) => void;
    updateHrZones: (zones: Zone[]) => void;
    getUserZones: (userId: string) => { powerZones: Zone[], hrZones: Zone[] };
  };
}

export const createUserSlice: StateCreator<
  UserSlice,
  [],
  [],
  UserSlice
> = (set, get) => {
  // ★ 修正: 初期ユーザーのID生成を一度だけ行い、一貫性を保つ
  const initialUserId = uuidv4();
  
  return {
    // Initial state
    userProfiles: {
      [initialUserId]: {
        id: initialUserId,
        name: 'アスリート 1',
        ftp: 200,
        maxHr: 190,
        color: '#4A90E2',
        powerZones: DEFAULT_POWER_ZONES,
        hrZones: DEFAULT_HR_ZONES,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        isActive: true,
        isProtected: true // 最後の一人として保護
      }
    },
    powerZones: DEFAULT_POWER_ZONES,
    hrZones: DEFAULT_HR_ZONES,
    isMultiUserMode: false,

    userActions: {
      // User profile management
      addUserProfile: (profile: UserProfile) => {
        console.log('addUserProfile called with:', profile);
        set((state) => {
          const newUserProfiles = {
            ...state.userProfiles,
            [profile.id]: profile
          };
          console.log('New user profiles after add:', newUserProfiles);
          return {
            userProfiles: newUserProfiles
          };
        });
      },

      // ★ 修正: updateUserProfile の実装を完全に修正
      updateUserProfile: (id: string, updates: Partial<UserProfile>) => {
        console.log('updateUserProfile called with id:', id, 'updates:', updates);
        
        set((state) => {
          if (!state.userProfiles[id]) {
            console.error('User not found for update:', id);
            return state;
          }

          // 既存のユーザー情報と更新情報を正しくマージ
          const existingUser = state.userProfiles[id];
          const updatedUser: UserProfile = {
            ...existingUser,
            ...updates,
            lastUsed: Date.now()
          };

          console.log('Updated user data:', updatedUser);

          return {
            userProfiles: {
              ...state.userProfiles,
              [id]: updatedUser
            }
          };
        });
      },

      deleteUserProfile: (id: string) => {
        set((state) => {
          // ★ 保護: ユーザーが1人以下の場合は削除を中断
          const userCount = Object.keys(state.userProfiles).length;
          if (userCount <= 1) {
            console.warn('Cannot remove the last user.');
            return state;
          }

          const { [id]: deleted, ...rest } = state.userProfiles;
          
          return {
            userProfiles: rest
          };
        });
      },

      setUserActive: (userId: string, active: boolean) => {
        set((state) => {
          const targetUser = state.userProfiles[userId];
          if (!targetUser) return state;
          
          // ★ 保護: アクティブユーザーが1人以下になる場合は非アクティブ化を中断
          const activeUsers = Object.values(state.userProfiles).filter(user => user.isActive);
          if (targetUser.isActive && !active && activeUsers.length <= 1) {
            console.warn('Cannot deactivate the last active user.');
            return state;
          }
          
          const updatedUserProfiles = {
            ...state.userProfiles,
            [userId]: { 
              ...targetUser, 
              isActive: active, 
              lastUsed: Date.now() 
            }
          };

          const activeUserCount = Object.values(updatedUserProfiles).filter(user => user.isActive).length;
          const isMultiUserMode = activeUserCount >= 2;

          return {
            userProfiles: updatedUserProfiles,
            isMultiUserMode
          };
        });
      },

      // Multi-user mode
      getIsMultiUserMode: () => {
        const state = get();
        const activeUserCount = Object.values(state.userProfiles).filter(user => user.isActive).length;
        return activeUserCount >= 2;
      },

      getActiveUserCount: () => {
        const state = get();
        return Object.values(state.userProfiles).filter(user => user.isActive).length;
      },

      toggleMultiUserMode: () => {
        set((state) => ({
          isMultiUserMode: !state.isMultiUserMode
        }));
      },

      setMultiUserMode: (enabled: boolean) => {
        set(() => ({
          isMultiUserMode: enabled
        }));
      },

      // Zone management
      updatePowerZones: (zones: Zone[]) => {
        set(() => ({ powerZones: zones }));
      },

      updateHrZones: (zones: Zone[]) => {
        set(() => ({ hrZones: zones }));
      },

      getUserZones: (userId: string) => {
        const state = get();
        const user = state.userProfiles[userId];
        if (!user) {
          return { powerZones: state.powerZones, hrZones: state.hrZones };
        }
        return { powerZones: user.powerZones, hrZones: user.hrZones };
      }
    }
  };
};