import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { UserProfile, Zone } from '../../types';
import { Save, RotateCcw, Plus, Edit3, Trash2, User, Users, Palette } from 'lucide-react';
import { DEFAULT_POWER_ZONES, DEFAULT_HR_ZONES } from '../../constants/ble';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Container = styled.div`
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

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: ${({ active }) => active ? 'rgba(59, 130, 246, 0.3)' : 'transparent'};
  color: ${({ active }) => active ? '#e2e8f0' : '#94a3b8'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${({ active }) => active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)'};
    color: #e2e8f0;
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const UserItem = styled.div<{ isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid ${({ isActive }) => isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.2)'};
  border-radius: 8px;
  background: ${({ isActive }) => isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.5)'};
  backdrop-filter: blur(10px);
  transition: all 200ms ease;
  
  &:hover {
    border-color: ${({ isActive }) => isActive ? 'rgba(16, 185, 129, 0.7)' : 'rgba(59, 130, 246, 0.6)'};
    background: ${({ isActive }) => isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.7)'};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const UserAvatar = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color }) => color};
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
`;

const FormInput = styled.input`
  padding: 8px 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  transition: all 200ms ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
`;

const MultiUserToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 20px;
`;

const ToggleLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleSwitch = styled.button<{ enabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${({ enabled }) => enabled ? 'rgba(16, 185, 129, 0.8)' : 'rgba(148, 163, 184, 0.3)'};
  position: relative;
  cursor: pointer;
  transition: all 200ms ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ enabled }) => enabled ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 200ms ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userProfiles, isMultiUserMode, actions } = useAppStore();
  const [activeTab, setActiveTab] = useState<'users' | 'multiuser'>('users');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    ftp: 250,
    maxHr: 190,
    color: '#3b82f6'
  });

  const userList = Object.values(userProfiles).filter(user => user.id !== 'default');

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser);
    } else if (isCreating) {
      setFormData({
        name: '',
        ftp: 250,
        maxHr: 190,
        color: '#3b82f6'
      });
    }
  }, [editingUser, isCreating]);

  const handleSaveUser = () => {
    if (!formData.name?.trim()) {
      alert('Please enter a user name');
      return;
    }

    const userData: UserProfile = {
      id: editingUser?.id || `user-${Date.now()}`,
      name: formData.name,
      ftp: formData.ftp || 250,
      maxHr: formData.maxHr || 190,
      color: formData.color || '#3b82f6',
      powerZones: formData.powerZones || DEFAULT_POWER_ZONES,
      hrZones: formData.hrZones || DEFAULT_HR_ZONES,
      createdAt: editingUser?.createdAt || Date.now(),
      lastUsed: Date.now(),
      isActive: formData.isActive || false
    };

    if (editingUser) {
      actions.updateUserProfile(userData.id, userData);
    } else {
      actions.addUserProfile(userData);
    }

    setEditingUser(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      actions.deleteUserProfile(userId);
    }
  };

  const handleToggleActive = (userId: string, active: boolean) => {
    actions.setUserActive(userId, active);
  };

  const handleToggleMultiUserMode = () => {
    actions.toggleMultiUserMode();
  };

  const getUserInitials = (name: string) => {
    // Handle null, undefined, or empty string cases
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Management"
      size="large"
    >
      <Container>
        <TabContainer>
          <Tab 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          >
            <User size={16} />
            Users
          </Tab>
          <Tab 
            active={activeTab === 'multiuser'} 
            onClick={() => setActiveTab('multiuser')}
          >
            <Users size={16} />
            Multi-User Mode
          </Tab>
        </TabContainer>

        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
                User Profiles
              </h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsCreating(true)}
                icon={<Plus size={14} />}
              >
                Add User
              </Button>
            </div>

            {userList.length === 0 ? (
              <EmptyState>
                <p>No users created yet</p>
                <p>Create your first user profile to get started</p>
              </EmptyState>
            ) : (
              <UserList>
                {userList.map(user => (
                  <UserItem key={user.id} isActive={user.isActive}>
                    <UserInfo>
                      <UserAvatar color={user.color}>
                        {getUserInitials(user.name)}
                      </UserAvatar>
                      <UserDetails>
                        <UserName>{user.name || 'Unnamed User'}</UserName>
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
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <ActionButton onClick={() => setEditingUser(user)}>
                        <Edit3 size={14} />
                      </ActionButton>
                      <ActionButton 
                        className="danger"
                        onClick={() => handleDeleteUser(user.id)}
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
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h4>
                
                <FormRow>
                  <FormGroup>
                    <FormLabel>Name</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter user name"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Color</FormLabel>
                    <ColorPicker
                      type="color"
                      value={formData.color || '#3b82f6'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <FormLabel>FTP (Watts)</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.ftp || ''}
                      onChange={(e) => setFormData({ ...formData, ftp: Number(e.target.value) })}
                      placeholder="250"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Max Heart Rate (bpm)</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.maxHr || ''}
                      onChange={(e) => setFormData({ ...formData, maxHr: Number(e.target.value) })}
                      placeholder="190"
                    />
                  </FormGroup>
                </FormRow>

                <ButtonGroup>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingUser(null);
                      setIsCreating(false);
                      setFormData({});
                    }}
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
                </ButtonGroup>
              </FormContainer>
            )}
          </>
        )}

        {activeTab === 'multiuser' && (
          <>
            <MultiUserToggle>
              <ToggleLabel>
                <Users size={16} />
                Multi-User Mode
              </ToggleLabel>
              <ToggleSwitch 
                enabled={isMultiUserMode}
                onClick={handleToggleMultiUserMode}
              />
            </MultiUserToggle>

            <div style={{ padding: '20px', background: 'rgba(15, 15, 35, 0.8)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>
                Multi-User Mode Features
              </h4>
              <ul style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <li>• Multiple users can be active simultaneously in the same session</li>
                <li>• Each sensor can be assigned to a specific user</li>
                <li>• Panels automatically display data based on sensor assignments</li>
                <li>• User-specific zones and colors are applied</li>
                <li>• Session data is recorded separately for each user</li>
              </ul>
            </div>

            {isMultiUserMode && (
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <p style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>
                  ✅ Multi-User Mode is enabled. You can now assign sensors to different users and track multiple athletes simultaneously.
                </p>
              </div>
            )}
          </>
        )}

        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </ButtonGroup>
      </Container>
    </Modal>
  );
};