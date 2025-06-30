import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';

interface SaveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName?: string; // Optional: for pre-filling the input if renaming/editing
  title?: string; // Optional: to customize modal title
}

const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1; // Tailwind's slate-300
  margin-bottom: 8px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.4); // Tailwind's blue-500 with opacity
  border-radius: 8px;
  background-color: rgba(15, 23, 42, 0.8); // Tailwind's slate-900 with opacity
  color: #e2e8f0; // Tailwind's slate-200
  font-size: 0.875rem;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.7); // Brighter blue
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: #64748b; // Tailwind's slate-500
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export const SaveLayoutModal: React.FC<SaveLayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName = '',
  title = 'Save Layout'
}) => {
  const [layoutName, setLayoutName] = useState(currentName);

  useEffect(() => {
    // When the modal is opened, if a currentName is provided, set it
    if (isOpen) {
      setLayoutName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (layoutName.trim()) {
      onSave(layoutName.trim());
      onClose(); // Close modal after save
    } else {
      // Optionally, show an error or prevent saving if the name is empty
      alert('Layout name cannot be empty.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLayoutName(e.target.value);
  };

  // Handle Enter key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <InputLabel htmlFor="layoutName">Layout Name</InputLabel>
        <TextInput
          type="text"
          id="layoutName"
          value={layoutName}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter layout name"
          autoFocus
        />
      </div>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!layoutName.trim()}>
          Save
        </Button>
      </ModalActions>
    </Modal>
  );
};
