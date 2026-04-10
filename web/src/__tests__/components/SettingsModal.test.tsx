import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock component for testing settings modal functionality
const SettingsModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialKeys 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { gemini: string }) => void;
  initialKeys: { gemini: string };
}) => {
  const [apiKeys, setApiKeys] = React.useState(initialKeys);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      data-testid="modal-overlay"
      onClick={onClose}
    >
      <div className="bg-[#E4E3E0] border border-[#141414] rounded-sm p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif italic text-xl mb-4">API Key Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-sm mb-2">Gemini API Key</label>
            <input
              type="password"
              placeholder="Enter Gemini API key"
              value={apiKeys.gemini}
              onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
              className="w-full px-4 py-2 border border-[#141414] bg-[#E4E3E0] rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]"
              data-testid="gemini-api-input"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onSave(apiKeys)}
            className="flex-1 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
            data-testid="save-button"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-transparent text-[#141414] rounded-sm font-mono text-[10px] uppercase tracking-widest border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

describe('SettingsModal Component', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.defineProperty(window, 'navigator', {
      value: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
      writable: true,
    });
  });

  it('does not render when isOpen is false', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByText('API Key Configuration')).toBeInTheDocument();
    expect(screen.getByTestId('gemini-api-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('displays initial API key value', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: 'initial-key' }}
      />
    );
    
    const input = screen.getByTestId('gemini-api-input');
    expect(input).toHaveValue('initial-key');
  });

  it('updates API key when typed', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const input = screen.getByTestId('gemini-api-input');
    await user.type(input, 'new-api-key');
    
    expect(input).toHaveValue('new-api-key');
  });

  it('calls onSave with updated API key when Save button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const input = screen.getByTestId('gemini-api-input');
    await user.type(input, 'test-api-key');
    
    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({ gemini: 'test-api-key' });
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has correct input type for password field', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const input = screen.getByTestId('gemini-api-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has correct placeholder text', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();
    
    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialKeys={{ gemini: '' }}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter Gemini API key');
    expect(input).toBeInTheDocument();
  });
});
