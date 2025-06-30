import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { FolderOpen, Plus, Trash2, Edit3, Copy, Edit, AlertTriangle, Download, Upload, FileText } from 'lucide-react';
import { PanelLayout } from '../../types';
import toast from 'react-hot-toast';

interface LayoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ActionSection = styled.div`
  padding: 16px;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ActionCard = styled.div`
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 200ms ease;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(30, 41, 59, 0.7);
  }
`;

const ActionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionDescription = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
`;

const LayoutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const LayoutItem = styled.div<{ $isActive: boolean; $isEditing: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid ${({ $isActive, $isEditing }) => 
    $isEditing ? 'rgba(245, 158, 11, 0.5)' : 
    $isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 8px;
  background: ${({ $isActive, $isEditing }) => 
    $isEditing ? 'rgba(245, 158, 11, 0.1)' : 
    $isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.5)'
  };
  transition: all 200ms ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: ${({ $isEditing }) => $isEditing ? 'rgba(245, 158, 11, 0.7)' : 'rgba(59, 130, 246, 0.6)'};
    background: ${({ $isEditing }) => $isEditing ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.7)'};
  }
`;

const LayoutItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const LayoutItemName = styled.span`
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LayoutItemDetails = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const LayoutItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  color: #94a3b8;
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    color: #e2e8f0;
    transform: scale(1.05);
  }
  
  &.primary {
    background: rgba(59, 130, 246, 0.8);
    color: white;
    
    &:hover {
      background: rgba(59, 130, 246, 1);
    }
  }
  
  &.danger {
    background: rgba(239, 68, 68, 0.8);
    color: white;
    
    &:hover {
      background: rgba(239, 68, 68, 1);
    }
  }
  
  &.warning {
    background: rgba(245, 158, 11, 0.8);
    color: white;
    
    &:hover {
      background: rgba(245, 158, 11, 1);
    }
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
  z-index: 1000;
  margin-bottom: 4px;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
  
  ${ActionButton}:hover & {
    opacity: 1;
  }
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

const EditModeWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #f59e0b;
  font-size: 0.875rem;
`;

const LayoutInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const EditingBadge = styled.span`
  font-size: 0.75rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
`;

// レイアウトデータからセンサー情報を除去する関数
const sanitizeLayoutForExport = (layout: PanelLayout[]): any[] => {
  return layout.map(panel => ({
    i: panel.i,
    x: panel.x,
    y: panel.y,
    w: panel.w,
    h: panel.h,
    panelType: panel.panelType,
    dataType: panel.dataType,
    displayName: panel.displayName,
    config: panel.config
    // source は除外（センサー固有情報のため）
  }));
};

// インポート用のレイアウトデータを復元する関数
const restoreLayoutFromImport = (importedData: any[]): PanelLayout[] => {
  return importedData.map(panel => ({
    ...panel,
    source: undefined // センサー情報は初期化
  }));
};

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    layouts, 
    currentLayoutName, 
    isEditMode, 
    editingLayoutName, 
    hasUnsavedChanges,
    actions 
  } = useAppStore();
  
  const [editingLayout, setEditingLayout] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const layoutNames = Object.keys(layouts).filter(name => name !== 'default');
  const displayLayoutName = isEditMode ? editingLayoutName! : currentLayoutName;

  const handleCreateNewLayout = () => {
    const layoutName = prompt('Enter new layout name:');
    if (!layoutName?.trim()) return;
    
    if (layouts[layoutName]) {
      toast.error('A layout with this name already exists');
      return;
    }
    
    actions.saveLayout(layoutName, []);
    actions.enterEditMode(layoutName);
    toast.success(`New layout "${layoutName}" created and edit mode enabled`);
    onClose();
  };

  const handleLoadLayout = (layoutName: string) => {
    if (isEditMode && hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You are in edit mode. Discard unsaved changes and switch layouts?'
      );
      if (!shouldDiscard) return;
    }

    actions.loadLayout(layoutName);
    toast.success(`Layout "${layoutName}" loaded`);
    onClose();
  };

  const handleEditLayout = (layoutName: string) => {
    if (isEditMode && hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Discard changes and edit another layout?'
      );
      if (!shouldDiscard) return;
    }

    actions.enterEditMode(layoutName);
    toast.success(`Started editing layout "${layoutName}"`);
    onClose();
  };

  const handleDeleteLayout = (layoutName: string) => {
    if (layoutName === 'default') {
      toast.error('Cannot delete default layout');
      return;
    }

    if (layoutName === currentLayoutName) {
      toast.error('Cannot delete currently active layout');
      return;
    }

    if (isEditMode && layoutName === editingLayoutName) {
      toast.error('Cannot delete layout currently being edited');
      return;
    }

    if (window.confirm(`Delete layout "${layoutName}"?`)) {
      actions.deleteLayout(layoutName);
      toast.success(`Layout "${layoutName}" deleted`);
    }
  };

  const handleDuplicateLayout = (layoutName: string) => {
    const originalLayout = layouts[layoutName];
    if (!originalLayout) return;

    const duplicateName = `${layoutName} Copy`;
    let finalName = duplicateName;
    let counter = 1;

    while (layouts[finalName]) {
      finalName = `${duplicateName} (${counter})`;
      counter++;
    }

    actions.saveLayout(finalName, originalLayout);
    toast.success(`Layout "${finalName}" created`);
  };

  const handleRenameLayout = (oldName: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    if (oldName === 'default') {
      toast.error('Cannot rename default layout');
      return;
    }

    if (layouts[newName] && newName !== oldName) {
      toast.error('A layout with this name already exists');
      return;
    }

    actions.renameLayout(oldName, newName);
    toast.success(`Layout renamed to "${newName}"`);
    setEditingLayout(null);
    setEditName('');
  };

  const handleExportLayout = (layoutName: string) => {
    const layout = layouts[layoutName];
    if (!layout) {
      toast.error('Layout not found');
      return;
    }

    const exportData = {
      name: layoutName,
      version: '1.0',
      exportedAt: new Date().toISOString(),
      description: `Layout exported from Web Training Console`,
      panelCount: layout.length,
      layout: sanitizeLayoutForExport(layout)
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `layout-${layoutName.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast.success(`Layout "${layoutName}" exported successfully`);
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // バリデーション
        if (!importData.layout || !Array.isArray(importData.layout)) {
          throw new Error('Invalid layout file format');
        }

        // 必要なプロパティの検証
        const isValidLayout = importData.layout.every((panel: any) => 
          panel.hasOwnProperty('i') &&
          panel.hasOwnProperty('x') &&
          panel.hasOwnProperty('y') &&
          panel.hasOwnProperty('w') &&
          panel.hasOwnProperty('h') &&
          panel.hasOwnProperty('panelType') &&
          panel.hasOwnProperty('dataType')
        );

        if (!isValidLayout) {
          throw new Error('Invalid panel structure in layout file');
        }

        const layoutName = importData.name || 'Imported Layout';
        let finalName = layoutName;
        let counter = 1;

        // 重複する名前の場合は番号を付ける
        while (layouts[finalName]) {
          finalName = `${layoutName} (${counter})`;
          counter++;
        }

        const restoredLayout = restoreLayoutFromImport(importData.layout);
        actions.saveLayout(finalName, restoredLayout);
        
        toast.success(`Layout "${finalName}" imported successfully (${restoredLayout.length} panels)`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import layout. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    // ファイル入力をリセット
    event.target.value = '';
  };

  const startEditing = (layoutName: string) => {
    setEditingLayout(layoutName);
    setEditName(layoutName);
  };

  const cancelEditing = () => {
    setEditingLayout(null);
    setEditName('');
  };

  const getLayoutDetails = (layoutName: string) => {
    const layout = layouts[layoutName];
    if (!layout) return '';
    
    const panelCount = layout.length;
    const lastModified = new Date().toLocaleDateString();
    return `${panelCount} panels • ${lastModified}`;
  };

  const isLayoutActive = (layoutName: string) => {
    return displayLayoutName === layoutName;
  };

  const isLayoutBeingEdited = (layoutName: string) => {
    return isEditMode && editingLayoutName === layoutName;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Layout Management"
      size="large"
    >
      <LayoutContainer>
        {isEditMode && (
          <EditModeWarning>
            <AlertTriangle size={16} />
            Edit mode is active. Layout switching and deletion are restricted.
          </EditModeWarning>
        )}

        <ActionSection>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionGrid>
            <ActionCard>
              <ActionTitle>
                <Plus size={16} />
                New Layout
              </ActionTitle>
              <ActionDescription>
                Create a new empty layout and start editing
              </ActionDescription>
              <Button
                variant="primary"
                size="small"
                onClick={handleCreateNewLayout}
                icon={<Plus size={14} />}
              >
                Create New
              </Button>
            </ActionCard>

            <ActionCard>
              <ActionTitle>
                <Upload size={16} />
                Import Layout
              </ActionTitle>
              <ActionDescription>
                Import a layout from a JSON file. Sensor assignments will be reset.
              </ActionDescription>
              <Button
                variant="secondary"
                size="small"
                onClick={() => document.getElementById('import-file-input')?.click()}
                icon={<Upload size={14} />}
              >
                Import File
              </Button>
              <HiddenFileInput
                id="import-file-input"
                type="file"
                accept=".json"
                onChange={handleImportLayout}
              />
            </ActionCard>
          </ActionGrid>
        </ActionSection>

        <div>
          <SectionTitle>Saved Layouts</SectionTitle>
          {layoutNames.length === 0 ? (
            <EmptyState>
              <p>No saved layouts</p>
              <p>Create your first layout using the "New Layout" button above</p>
            </EmptyState>
          ) : (
            <LayoutList>
              <LayoutItem 
                $isActive={isLayoutActive('default')} 
                $isEditing={isLayoutBeingEdited('default')}
              >
                <LayoutItemInfo>
                  <LayoutItemName>
                    Default
                    {isLayoutBeingEdited('default') && (
                      <EditingBadge>
                        <Edit size={10} />
                        Editing
                      </EditingBadge>
                    )}
                  </LayoutItemName>
                  <LayoutItemDetails>{getLayoutDetails('default')}</LayoutItemDetails>
                </LayoutItemInfo>
                <LayoutItemActions>
                  <ActionButton
                    className={isLayoutActive('default') ? 'primary' : ''}
                    onClick={() => handleLoadLayout('default')}
                    disabled={isEditMode}
                  >
                    <FolderOpen size={14} />
                    <Tooltip>Load</Tooltip>
                  </ActionButton>
                  <ActionButton
                    className={isLayoutBeingEdited('default') ? 'warning' : ''}
                    onClick={() => handleEditLayout('default')}
                  >
                    <Edit size={14} />
                    <Tooltip>Edit</Tooltip>
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDuplicateLayout('default')}
                  >
                    <Copy size={14} />
                    <Tooltip>Duplicate</Tooltip>
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleExportLayout('default')}
                  >
                    <Download size={14} />
                    <Tooltip>Export</Tooltip>
                  </ActionButton>
                </LayoutItemActions>
              </LayoutItem>

              {layoutNames.map(layoutName => (
                <LayoutItem 
                  key={layoutName} 
                  $isActive={isLayoutActive(layoutName)} 
                  $isEditing={isLayoutBeingEdited(layoutName)}
                >
                  <LayoutItemInfo>
                    {editingLayout === layoutName ? (
                      <LayoutInput
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameLayout(layoutName, editName);
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                        onBlur={() => handleRenameLayout(layoutName, editName)}
                        autoFocus
                      />
                    ) : (
                      <LayoutItemName>
                        {layoutName}
                        {isLayoutBeingEdited(layoutName) && (
                          <EditingBadge>
                            <Edit size={10} />
                            Editing
                          </EditingBadge>
                        )}
                      </LayoutItemName>
                    )}
                    <LayoutItemDetails>{getLayoutDetails(layoutName)}</LayoutItemDetails>
                  </LayoutItemInfo>
                  <LayoutItemActions>
                    <ActionButton
                      className={isLayoutActive(layoutName) ? 'primary' : ''}
                      onClick={() => handleLoadLayout(layoutName)}
                      disabled={isEditMode}
                    >
                      <FolderOpen size={14} />
                      <Tooltip>Load</Tooltip>
                    </ActionButton>
                    <ActionButton
                      className={isLayoutBeingEdited(layoutName) ? 'warning' : ''}
                      onClick={() => handleEditLayout(layoutName)}
                    >
                      <Edit size={14} />
                      <Tooltip>Edit</Tooltip>
                    </ActionButton>
                    <ActionButton
                      onClick={() => startEditing(layoutName)}
                    >
                      <Edit3 size={14} />
                      <Tooltip>Rename</Tooltip>
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDuplicateLayout(layoutName)}
                    >
                      <Copy size={14} />
                      <Tooltip>Duplicate</Tooltip>
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleExportLayout(layoutName)}
                    >
                      <Download size={14} />
                      <Tooltip>Export</Tooltip>
                    </ActionButton>
                    <ActionButton
                      className="danger"
                      onClick={() => handleDeleteLayout(layoutName)}
                      disabled={isEditMode}
                    >
                      <Trash2 size={14} />
                      <Tooltip>Delete</Tooltip>
                    </ActionButton>
                  </LayoutItemActions>
                </LayoutItem>
              ))}
            </LayoutList>
          )}
        </div>

        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </ButtonGroup>
      </LayoutContainer>
    </Modal>
  );
};