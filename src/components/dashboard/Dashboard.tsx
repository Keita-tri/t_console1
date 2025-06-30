import React, { useState } from 'react';
import styled from 'styled-components';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Plus, Settings, Edit, FolderOpen, Save, X, AlertTriangle, Copy, Trash2, Edit3 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Panel } from './Panel';
import { GraphPanel } from './GraphPanel';
import { TrainerPanel } from './TrainerPanel';
import { PanelEditModal } from './PanelEditModal';
import { DashboardSettingsModal } from './DashboardSettingsModal';
import { LayoutManager } from './LayoutManager';
import { Button } from '../common/Button';
import { PanelLayout } from '../../types';
import toast from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardContainer = styled.div<{ $isTrainingMode: boolean }>`
  padding: ${({ $isTrainingMode }) => $isTrainingMode ? '20px' : '20px'};
  min-height: 400px;
  overflow: visible;
  ${({ $isTrainingMode }) => $isTrainingMode && `
    background: transparent;
    min-height: calc(100vh - 120px);
  `}
`;

const DashboardHeader = styled.div<{ $isTrainingMode: boolean }>`
  display: ${({ $isTrainingMode }) => $isTrainingMode ? 'none' : 'flex'};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DashboardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CurrentLayoutName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LayoutNameDisplay = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const LayoutNameInput = styled.input`
  font-size: 0.875rem;
  font-weight: 400;
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.8);
  padding: 4px 8px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  outline: none;
  min-width: 120px;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const LayoutEditButton = styled.button`
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
  }
`;

const EditModeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
`;

const UnsavedChangesIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(220, 38, 38, 0.3);
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const EditModeControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const BlankState = styled.div<{ $isTrainingMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: ${({ $isTrainingMode }) => $isTrainingMode ? '#ffffff' : '#94a3b8'};
  background: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(30, 41, 59, 0.3)'
  };
  border: 2px dashed ${({ $isTrainingMode }) => $isTrainingMode ? '#ffffff40' : 'rgba(59, 130, 246, 0.3)'};
  border-radius: 12px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
`;

const PanelWrapper = styled.div<{ $isEditMode: boolean; $isTrainingMode: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
`;

const PanelEditButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(59, 130, 246, 0.7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? '0.75' : '0'};
  pointer-events: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? 'auto' : 'none'};
  
  &:hover {
    background: rgba(59, 130, 246, 0.85);
    transform: scale(1.05);
    opacity: 0.9;
    box-shadow: 0 3px 12px rgba(59, 130, 246, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const PanelDuplicateButton = styled.button`
  position: absolute;
  top: 12px;
  right: 52px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(16, 185, 129, 0.7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? '0.75' : '0'};
  pointer-events: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? 'auto' : 'none'};
  
  &:hover {
    background: rgba(16, 185, 129, 0.85);
    transform: scale(1.05);
    opacity: 0.9;
    box-shadow: 0 3px 12px rgba(16, 185, 129, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const PanelDeleteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 92px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.7);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? '0.75' : '0'};
  pointer-events: ${({ $isEditMode, $isTrainingMode }) => ($isEditMode && !$isTrainingMode) ? 'auto' : 'none'};
  
  &:hover {
    background: rgba(239, 68, 68, 0.85);
    transform: scale(1.05);
    opacity: 0.9;
    box-shadow: 0 3px 12px rgba(239, 68, 68, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const GridOverlay = styled.div<{ $isEditMode: boolean; $isTrainingMode: boolean }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  
  ${({ $isEditMode, $isTrainingMode }) => $isEditMode && !$isTrainingMode && `
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  `}
`;

const EditModeBlankState = styled.div<{ $isTrainingMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: ${({ $isTrainingMode }) => $isTrainingMode ? '#ffffff' : '#94a3b8'};
  background: ${({ $isTrainingMode }) => 
    $isTrainingMode 
      ? 'rgba(59, 130, 246, 0.1)' 
      : 'rgba(59, 130, 246, 0.1)'
  };
  border: 2px dashed ${({ $isTrainingMode }) => $isTrainingMode ? '#ffffff60' : 'rgba(59, 130, 246, 0.5)'};
  border-radius: 12px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
`;

const GridLayoutContainer = styled.div`
  position: relative;
  overflow: visible;
  min-height: 400px;
`;

interface DashboardProps {
  onOpenSensorModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenSensorModal }) => {
  const { 
    layouts, 
    currentLayoutName, 
    isEditMode, 
    editingLayoutName, 
    hasUnsavedChanges,
    isTrainingMode,
    actions 
  } = useAppStore();
  
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [editingPanel, setEditingPanel] = useState<PanelLayout | null>(null);
  const [editingLayoutNameState, setEditingLayoutNameState] = useState(false);
  const [layoutNameValue, setLayoutNameValue] = useState('');

  const displayLayoutName = isEditMode ? editingLayoutName! : currentLayoutName;
  const currentLayout = layouts[displayLayoutName] || [];

  const handleLayoutChange = (layout: Layout[]) => {
    if (!isEditMode) return;
    
    const updatedPanels = currentLayout.map(panel => {
      const layoutItem = layout.find(l => l.i === panel.i);
      if (layoutItem) {
        return {
          ...panel,
          ...layoutItem
        };
      }
      return panel;
    });
    actions.updatePanelLayout(updatedPanels);
  };

  const handleSavePanel = (panel: PanelLayout) => {
    if (editingPanel) {
      actions.updatePanel(panel.i, panel);
    } else {
      actions.addPanel(panel);
    }
    setEditingPanel(null);
  };

  const handleDeletePanel = (panelId: string) => {
    actions.removePanel(panelId);
    setEditingPanel(null);
  };

  const handleEditPanel = (panel: PanelLayout) => {
    setEditingPanel(panel);
  };

  const handleDuplicatePanel = (panel: PanelLayout) => {
    const duplicatedPanel: PanelLayout = {
      ...panel,
      i: `panel-${Date.now()}`,
      x: panel.x + panel.w,
      y: panel.y
    };
    
    actions.addPanel(duplicatedPanel);
    toast.success('Panel duplicated');
  };

  const handleQuickDeletePanel = (panel: PanelLayout) => {
    if (window.confirm(`Delete panel "${panel.displayName || panel.dataType}"?`)) {
      actions.removePanel(panel.i);
      toast.success('Panel deleted');
    }
  };

  const handleEnterEditMode = () => {
    actions.enterEditMode();
    toast.success('Edit mode enabled');
  };

  const handleExitEditMode = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Discard changes and exit edit mode?'
      );
      if (!shouldDiscard) return;
      
      actions.discardChanges();
      toast.success('Changes discarded and edit mode exited');
    } else {
      actions.exitEditMode();
      toast.success('Edit mode exited');
    }
  };

  const handleSaveChanges = () => {
    if (!editingLayoutName) return;
    
    actions.saveLayout(editingLayoutName, currentLayout);
    toast.success(`Layout "${editingLayoutName}" saved`);
  };

  const handleDiscardChanges = () => {
    const shouldDiscard = window.confirm(
      'Discard unsaved changes? This action cannot be undone.'
    );
    if (shouldDiscard) {
      actions.discardChanges();
      toast.success('Changes discarded');
    }
  };

  const handleStartEditingLayoutName = () => {
    if (!isEditMode) return;
    setEditingLayoutNameState(true);
    setLayoutNameValue(editingLayoutName || '');
  };

  const handleSaveLayoutName = () => {
    if (!layoutNameValue.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    if (layouts[layoutNameValue] && layoutNameValue !== editingLayoutName) {
      toast.error('A layout with this name already exists');
      return;
    }

    if (editingLayoutName && layoutNameValue !== editingLayoutName) {
      actions.renameLayout(editingLayoutName, layoutNameValue);
      toast.success(`Layout renamed to "${layoutNameValue}"`);
    }

    setEditingLayoutNameState(false);
  };

  const handleCancelEditingLayoutName = () => {
    setEditingLayoutNameState(false);
    setLayoutNameValue('');
  };

  const handleOpenSensorModalFromSettings = () => {
    console.log('handleOpenSensorModalFromSettings called in Dashboard');
    setShowSettings(false); // Settings画面を閉じる
    if (onOpenSensorModal) {
      console.log('Calling onOpenSensorModal from Dashboard');
      onOpenSensorModal(); // App.tsxのhandleOpenSensorModalを呼び出す
    } else {
      console.error('onOpenSensorModal prop is not provided to Dashboard');
    }
  };

  const renderPanel = (panel: PanelLayout) => {
    let content;
    
    if (panel.panelType === 'graph') {
      content = <GraphPanel panel={panel} />;
    } else if (panel.panelType === 'trainer') {
      content = <TrainerPanel panel={panel} />;
    } else {
      content = <Panel panel={panel} />;
    }

    return (
      <PanelWrapper 
        $isEditMode={isEditMode} 
        $isTrainingMode={isTrainingMode}
      >
        {/* TypeScriptのpropsを正しく渡すために、styled-componentsのpropsを追加 */}
        <div style={{ display: 'none' }}>{isEditMode ? 'edit' : 'view'}</div>
        
        {isEditMode && !isTrainingMode && (
          <>
            <PanelDeleteButton
              $isEditMode={isEditMode}
              $isTrainingMode={isTrainingMode}
              className="panel-action-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickDeletePanel(panel);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              title="Delete panel"
            >
              <Trash2 size={14} />
            </PanelDeleteButton>
            <PanelDuplicateButton
              $isEditMode={isEditMode}
              $isTrainingMode={isTrainingMode}
              className="panel-action-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDuplicatePanel(panel);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              title="Duplicate panel"
            >
              <Copy size={14} />
            </PanelDuplicateButton>
            <PanelEditButton
              $isEditMode={isEditMode}
              $isTrainingMode={isTrainingMode}
              className="panel-action-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditPanel(panel);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              title="Edit panel"
            >
              <Edit size={14} />
            </PanelEditButton>
          </>
        )}
        
        {content}
      </PanelWrapper>
    );
  };

  if (currentLayout.length === 0) {
    return (
      <DashboardContainer $isTrainingMode={isTrainingMode}>
        <DashboardHeader $isTrainingMode={isTrainingMode}>
          <DashboardTitle>
            Dashboard
            <CurrentLayoutName>
              {editingLayoutNameState ? (
                <LayoutNameInput
                  value={layoutNameValue}
                  onChange={(e) => setLayoutNameValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveLayoutName();
                    } else if (e.key === 'Escape') {
                      handleCancelEditingLayoutName();
                    }
                  }}
                  onBlur={handleSaveLayoutName}
                  autoFocus
                />
              ) : (
                <>
                  <LayoutNameDisplay>
                    {displayLayoutName === 'default' ? 'Default' : displayLayoutName}
                  </LayoutNameDisplay>
                  {isEditMode && editingLayoutName !== 'default' && (
                    <LayoutEditButton
                      onClick={handleStartEditingLayoutName}
                      title="Edit layout name"
                    >
                      <Edit3 size={12} />
                    </LayoutEditButton>
                  )}
                </>
              )}
            </CurrentLayoutName>
            {isEditMode && (
              <EditModeIndicator>
                <Edit size={16} />
                Edit Mode
                {hasUnsavedChanges && (
                  <UnsavedChangesIndicator>
                    <AlertTriangle size={12} />
                    Unsaved
                  </UnsavedChangesIndicator>
                )}
              </EditModeIndicator>
            )}
          </DashboardTitle>
          
          <ControlButtons>
            {isEditMode ? (
              <EditModeControls>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowAddPanel(true)}
                  icon={<Plus size={14} />}
                >
                  Add Panel
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={handleDiscardChanges}
                  icon={<X size={14} />}
                  disabled={!hasUnsavedChanges}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSaveChanges}
                  icon={<Save size={14} />}
                  disabled={!hasUnsavedChanges}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleExitEditMode}
                >
                  Exit Edit
                </Button>
              </EditModeControls>
            ) : (
              <>
                <Button
                  variant="secondary"
                  icon={<FolderOpen size={16} />}
                  onClick={() => setShowLayoutManager(true)}
                >
                  Layouts
                </Button>
                <Button
                  variant="secondary"
                  icon={<Edit size={16} />}
                  onClick={handleEnterEditMode}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  icon={<Settings size={16} />}
                  onClick={() => setShowSettings(true)}
                >
                  Settings
                </Button>
              </>
            )}
          </ControlButtons>
        </DashboardHeader>
        
        {isEditMode ? (
          <EditModeBlankState $isTrainingMode={isTrainingMode}>
            <h3>Edit Mode - Add panels to create your layout</h3>
            <p>Click "Add Panel" to add data display panels.</p>
            <p>You can freely arrange and resize panels.</p>
          </EditModeBlankState>
        ) : (
          <BlankState $isTrainingMode={isTrainingMode}>
            <h3>Customize your dashboard by adding panels</h3>
            <p>Click "Edit" to enter edit mode and add panels.</p>
            <p>Display sensor data, calculated data, session info and more.</p>
          </BlankState>
        )}

        <PanelEditModal
          isOpen={showAddPanel || !!editingPanel}
          onClose={() => {
            setShowAddPanel(false);
            setEditingPanel(null);
          }}
          panel={editingPanel || undefined}
          onSave={handleSavePanel}
          onDelete={handleDeletePanel}
        />

        <DashboardSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onOpenSensorModal={handleOpenSensorModalFromSettings}
        />

        <LayoutManager
          isOpen={showLayoutManager}
          onClose={() => setShowLayoutManager(false)}
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer $isTrainingMode={isTrainingMode}>
      <DashboardHeader $isTrainingMode={isTrainingMode}>
        <DashboardTitle>
          Dashboard
          <CurrentLayoutName>
            {editingLayoutNameState ? (
              <LayoutNameInput
                value={layoutNameValue}
                onChange={(e) => setLayoutNameValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveLayoutName();
                  } else if (e.key === 'Escape') {
                    handleCancelEditingLayoutName();
                  }
                }}
                onBlur={handleSaveLayoutName}
                autoFocus
              />
            ) : (
              <>
                <LayoutNameDisplay>
                  {displayLayoutName === 'default' ? 'Default' : displayLayoutName}
                </LayoutNameDisplay>
                {isEditMode && editingLayoutName !== 'default' && (
                  <LayoutEditButton
                    onClick={handleStartEditingLayoutName}
                    title="Edit layout name"
                  >
                    <Edit3 size={12} />
                  </LayoutEditButton>
                )}
              </>
            )}
          </CurrentLayoutName>
          {isEditMode && (
            <EditModeIndicator>
              <Edit size={16} />
              Edit Mode
              {hasUnsavedChanges && (
                <UnsavedChangesIndicator>
                  <AlertTriangle size={12} />
                  Unsaved
                </UnsavedChangesIndicator>
              )}
            </EditModeIndicator>
          )}
        </DashboardTitle>
        
        <ControlButtons>
          {isEditMode ? (
            <EditModeControls>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddPanel(true)}
                icon={<Plus size={14} />}
              >
                Add Panel
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleDiscardChanges}
                icon={<X size={14} />}
                disabled={!hasUnsavedChanges}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSaveChanges}
                icon={<Save size={14} />}
                disabled={!hasUnsavedChanges}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleExitEditMode}
              >
                Exit Edit
              </Button>
            </EditModeControls>
          ) : (
            <>
              <Button
                variant="secondary"
                icon={<FolderOpen size={16} />}
                onClick={() => setShowLayoutManager(true)}
              >
                Layouts
              </Button>
              <Button
                variant="secondary"
                icon={<Edit size={16} />}
                onClick={handleEnterEditMode}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                icon={<Settings size={16} />}
                onClick={() => setShowSettings(true)}
              >
                Settings
              </Button>
            </>
          )}
        </ControlButtons>
      </DashboardHeader>

      <GridLayoutContainer>
        <GridOverlay $isEditMode={isEditMode} $isTrainingMode={isTrainingMode} />
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: currentLayout }}
          draggableCancel=".panel-action-button"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode && !isTrainingMode}
          isResizable={isEditMode && !isTrainingMode}
          margin={[16, 16]}
          useCSSTransforms={true}
        >
          {currentLayout.map((panel) => (
            <div key={panel.i}>
              {renderPanel(panel)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </GridLayoutContainer>

      <PanelEditModal
        isOpen={showAddPanel || !!editingPanel}
        onClose={() => {
          setShowAddPanel(false);
          setEditingPanel(null);
        }}
        panel={editingPanel || undefined}
        onSave={handleSavePanel}
        onDelete={handleDeletePanel}
      />

      <DashboardSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenSensorModal={handleOpenSensorModalFromSettings}
      />

      <LayoutManager
        isOpen={showLayoutManager}
        onClose={() => setShowLayoutManager(false)}
      />
    </DashboardContainer>
  );
};