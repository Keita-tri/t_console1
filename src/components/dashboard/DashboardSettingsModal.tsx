import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { Zone, UserProfile } from '../../types';
import { Save, RotateCcw, User, Users, Settings, Plus, Edit3, Trash2, Bluetooth, Palette, Eye, Type, Link, CheckSquare, Square } from 'lucide-react';
import { DEFAULT_POWER_ZONES, DEFAULT_HR_ZONES } from '../../constants/ble';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSensorModal?: () => void;
}

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 20px;
  background: rgba(15, 15, 35, 0.5);
  border-radius: 8px 8px 0 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.3)' : 'transparent'};
  color: ${({ $active }) => $active ? '#e2e8f0' : '#94a3b8'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)'};
    color: #e2e8f0;
  }
`;

const SettingsSection = styled.div`
  padding: 20px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
`;

const FormInput = styled.input`
  padding: 8px 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const ColorPicker = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  background: transparent;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const UserItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.2)'};
  border-radius: 8px;
  background: ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.5)'};
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  
  &:hover {
    border-color: ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.7)' : 'rgba(59, 130, 246, 0.6)'};
    background: ${({ $isActive }) => $isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.7)'};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const UserAvatar = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
  font-size: 1rem;
`;

const UserStats = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActiveBadge = styled.span`
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.3);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  color: #94a3b8;
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    color: #e2e8f0;
    transform: scale(1.05);
  }
  
  &.danger {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
`;

const DisplayOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 12px;
`;

const OptionLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleSwitch = styled.button<{ $enabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${({ $enabled }) => $enabled ? 'rgba(16, 185, 129, 0.8)' : 'rgba(148, 163, 184, 0.3)'};
  position: relative;
  cursor: pointer;
  transition: all 200ms ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $enabled }) => $enabled ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 200ms ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SensorManagementSection = styled.div`
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 20px;
`;

const SensorManagementTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SensorManagementDescription = styled.p`
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 16px;
  line-height: 1.5;
`;

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenSensorModal
}) => {
  const { userProfiles, dashboardDisplayOptions, actions } = useAppStore();
  const [activeTab, setActiveTab] = useState<'athletes' | 'multiuser' | 'sensors'>('athletes');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    ftp: 250,
    maxHr: 190,
    color: '#3b82f6'
  });

  // デフォルトユーザーを除外したユーザーリスト
  const userList = Object.values(userProfiles);
  const activeUserCount = userList.filter(user => user.isActive).length;

  // フォームデータの初期化を修正
  useEffect(() => {
    if (editingUser) {
      console.log('Setting form data for editing athlete:', editingUser);
      setFormData({
        id: editingUser.id,
        name: editingUser.name,
        ftp: editingUser.ftp,
        maxHr: editingUser.maxHr,
        color: editingUser.color,
        powerZones: editingUser.powerZones,
        hrZones: editingUser.hrZones,
        createdAt: editingUser.createdAt,
        lastUsed: editingUser.lastUsed,
        isActive: editingUser.isActive
      });
    } else if (isCreating) {
      console.log('Setting form data for creating new athlete');
      setFormData({
        name: '',
        ftp: 250,
        maxHr: 190,
        color: '#3b82f6'
      });
    }
  }, [editingUser, isCreating]);

  const handleSaveUser = () => {
    console.log('handleSaveUser called');
    console.log('editingUser:', editingUser);
    console.log('formData:', formData);
    
    if (!formData.name?.trim()) {
      // TODO: 将来的にカスタム警告モーダルに置き換える
      alert('Please enter an athlete name');
      return;
    }

    if (editingUser) {
      // 編集モード: 変更があったフィールドのみを渡す
      const updates: Partial<UserProfile> = {
        name: formData.name,
        ftp: formData.ftp,
        maxHr: formData.maxHr,
        color: formData.color,
      };
      actions.updateUserProfile(editingUser.id, updates);
    } else {
      // 新規作成モード
      console.log('Creating new athlete');
      const newUserData: UserProfile = {
        id: `user-${Date.now()}`,
        name: formData.name,
        ftp: formData.ftp || 250,
        maxHr: formData.maxHr || 190,
        color: formData.color || '#3b82f6',
        powerZones: DEFAULT_POWER_ZONES,
        hrZones: DEFAULT_HR_ZONES,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        isActive: false
      };
      
      console.log('Calling addUserProfile with:', newUserData);
      actions.addUserProfile(newUserData);
    }

    // フォームをリセット
    handleCancelEdit();
  };

  const handleDeleteUser = (userId: string) => {
    const userCount = Object.keys(userProfiles).length;
    if (userCount <= 1) {
      // TODO: 将来的にカスタム確認モーダルに置き換える
      alert('Cannot delete the last athlete');
      return;
    }
    
    // TODO: 将来的にカスタム確認モーダルに置き換える
    if (window.confirm('このアスリートを削除してもよろしいですか？')) {
      actions.deleteUserProfile(userId);
    }
  };

  const handleToggleActive = (userId: string, active: boolean) => {
    const targetUser = userProfiles[userId];
    if (!targetUser) return;
    
    const activeUsers = Object.values(userProfiles).filter(user => user.isActive);
    if (targetUser.isActive && !active && activeUsers.length <= 1) {
      // TODO: 将来的にカスタム警告モーダルに置き換える
      alert('Cannot deactivate the last active athlete');
      return;
    }
    
    actions.setUserActive(userId, active);
  };

  const getUserInitials = (name: string) => {
    // Handle null, undefined, or empty string cases
    if (!name || typeof name !== 'string') {
      return 'A';
    }
    
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleOpenSensorModal = () => {
    console.log('handleOpenSensorModal called');
    console.log('onOpenSensorModal:', onOpenSensorModal);
    
    if (onOpenSensorModal) {
      console.log('Calling onOpenSensorModal');
      onClose(); // Settings画面を閉じる
      onOpenSensorModal(); // センサーモーダルを開く
    } else {
      console.error('onOpenSensorModal is not provided');
      alert('センサー管理機能が利用できません。onOpenSensorModalが設定されていません。');
    }
  };

  const handleCancelEdit = () => {
    console.log('Canceling edit/create');
    setEditingUser(null);
    setIsCreating(false);
    setFormData({
      name: '',
      ftp: 250,
      maxHr: 190,
      color: '#3b82f6'
    });
  };

  // フォーム入力の変更ハンドラー
  const handleFormChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dashboard Settings"
      size="large"
    >
      <SettingsContainer>
        <TabContainer>
          <Tab 
            $active={activeTab === 'athletes'} 
            onClick={() => setActiveTab('athletes')}
          >
            <User size={16} />
            Athletes
          </Tab>
          <Tab 
            $active={activeTab === 'multiuser'} 
            onClick={() => setActiveTab('multiuser')}
          >
            <Users size={16} />
            Multi Athlete Mode
          </Tab>
          <Tab 
            $active={activeTab === 'sensors'} 
            onClick={() => setActiveTab('sensors')}
          >
            <Bluetooth size={16} />
            Sensors
          </Tab>
        </TabContainer>

        {activeTab === 'athletes' && (
          <SettingsSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <SectionTitle>Athlete Management</SectionTitle>
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsCreating(true)}
                icon={<Plus size={14} />}
              >
                Add Athlete
              </Button>
            </div>

            {userList.length === 0 ? (
              <EmptyState>
                <p>No athletes created yet</p>
                <p>Create your first athlete profile to get started</p>
              </EmptyState>
            ) : (
              <UserList>
                {userList.map(user => (
                  <UserItem key={user.id} $isActive={user.isActive}>
                    <UserInfo>
                      <UserAvatar $color={user.color}>
                        {getUserInitials(user.name)}
                      </UserAvatar>
                      <UserDetails>
                        <UserName>{user.name || 'Unnamed Athlete'}</UserName>
                        <UserStats>
                          FTP: {user.ftp}W • Max HR: {user.maxHr}bpm
                        </UserStats>
                      </UserDetails>
                    </UserInfo>
                    <UserActions>
                      {user.isActive && <ActiveBadge>Active</ActiveBadge>}
                      <Button
                        variant={user.isActive ? "secondary" : "primary"}
                        size="small"
                        onClick={() => handleToggleActive(user.id, !user.isActive)}
                        disabled={user.isActive && Object.values(userProfiles).filter(u => u.isActive).length <= 1}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <ActionButton onClick={() => {
                        console.log('Edit button clicked for athlete:', user);
                        setEditingUser(user);
                      }}>
                        <Edit3 size={14} />
                      </ActionButton>
                      <ActionButton 
                        className="danger"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={Object.keys(userProfiles).length <= 1}
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </UserActions>
                  </UserItem>
                ))}
              </UserList>
            )}

            {(isCreating || editingUser) && (
              <FormContainer>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
                  {editingUser ? `Edit Athlete: ${editingUser.name}` : 'Create New Athlete'}
                </h4>
                
                <FormRow>
                  <FormGroup>
                    <FormLabel>Name</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Enter athlete name"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Color</FormLabel>
                    <ColorPicker
                      type="color"
                      value={formData.color || '#3b82f6'}
                      onChange={(e) => handleFormChange('color', e.target.value)}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>FTP (Watts)</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.ftp || ''}
                      onChange={(e) => handleFormChange('ftp', Number(e.target.value))}
                      placeholder="250"
                      min="50"
                      max="500"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Max Heart Rate (bpm)</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.maxHr || ''}
                      onChange={(e) => handleFormChange('maxHr', Number(e.target.value))}
                      placeholder="190"
                      min="100"
                      max="250"
                    />
                  </FormGroup>
                </FormRow>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveUser}
                    icon={<Save size={16} />}
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </Button>
                </div>
              </FormContainer>
            )}
          </SettingsSection>
        )}

        {activeTab === 'multiuser' && (
          <SettingsSection>
            <SectionTitle>Multi-Athlete Display Settings</SectionTitle>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px', lineHeight: '1.5' }}>
                Configure how panels display data when multiple athletes are active. Multi-Athlete Mode is automatically enabled when 2 or more athletes are active.
              </p>
              
              <div style={{ padding: '16px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', marginBottom: '20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>
                  Current Status: {activeUserCount >= 2 ? 'Multi-Athlete Mode Active' : 'Single Athlete Mode'}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                  {activeUserCount >= 2 ? `${activeUserCount} athletes are currently active` : `${activeUserCount} athlete${activeUserCount === 1 ? ' is' : 's are'} currently active`}
                </p>
              </div>
            </div>

            <div>
              <FormLabel style={{ marginBottom: '12px' }}>Panel Display Options</FormLabel>
              
              <DisplayOption>
                <OptionLabel>
                  <Palette size={16} />
                  Color-code panels by athlete
                </OptionLabel>
                <ToggleSwitch 
                  $enabled={dashboardDisplayOptions.colorCodeByAthlete}
                  onClick={() => actions.setDashboardDisplayOptions({ colorCodeByAthlete: !dashboardDisplayOptions.colorCodeByAthlete })}
                />
              </DisplayOption>

              <DisplayOption>
                <OptionLabel>
                  <Type size={16} />
                  Show athlete names on panels
                </OptionLabel>
                <ToggleSwitch 
                  $enabled={dashboardDisplayOptions.showAthleteNames}
                  onClick={() => actions.setDashboardDisplayOptions({ showAthleteNames: !dashboardDisplayOptions.showAthleteNames })}
                />
              </DisplayOption>

              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', marginTop: '16px' }}>
                <p style={{ color: '#10b981', fontSize: '0.75rem', margin: 0 }}>
                  ✅ Display options are now active and will be applied to all panels on the dashboard.
                </p>
              </div>
            </div>
          </SettingsSection>
        )}

        {activeTab === 'sensors' && (
          <SettingsSection>
            <SectionTitle>Sensor Settings</SectionTitle>
            
            <SensorManagementSection>
              <SensorManagementTitle>
                <Link size={16} />
                Sensor Assignment
              </SensorManagementTitle>
              <SensorManagementDescription>
                Assign sensors to athletes for individual tracking. Each sensor can be assigned to a specific athlete to track their data separately during multi-athlete sessions.
              </SensorManagementDescription>
              <Button
                variant="primary"
                onClick={handleOpenSensorModal}
                icon={<Bluetooth size={16} />}
              >
                Open Sensor Management
              </Button>
            </SensorManagementSection>

            <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <p style={{ color: '#3b82f6', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>
                Sensor Configuration
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '8px 0 0 0', lineHeight: '1.5' }}>
                Sensor-specific settings and calibration options will be available here in future updates. 
                Currently, sensor management is handled through the main Sensors modal.
              </p>
            </div>
          </SettingsSection>
        )}

        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </ButtonGroup>
      </SettingsContainer>
    </Modal>
  );
};