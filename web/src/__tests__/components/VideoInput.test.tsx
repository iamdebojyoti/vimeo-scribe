import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock component for testing video input functionality
const VideoInput = ({ 
  urls, 
  onAddUrl, 
  onRemoveUrl, 
  onUpdateUrl 
}: {
  urls: string[];
  onAddUrl: () => void;
  onRemoveUrl: (index: number) => void;
  onUpdateUrl: (index: number, value: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Vimeo URL"
            value={url}
            onChange={(e) => onUpdateUrl(index, e.target.value)}
            className="flex-1 px-4 py-2 border border-[#141414] bg-[#E4E3E0] rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]"
            data-testid={`url-input-${index}`}
          />
          {urls.length > 1 && (
            <button
              onClick={() => onRemoveUrl(index)}
              className="px-3 py-2 bg-[#141414] text-[#E4E3E0] rounded-sm hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
              data-testid={`remove-url-${index}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddUrl}
        className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
        data-testid="add-url-button"
      >
        <Plus className="w-3 h-3" />
        Add URL
      </button>
    </div>
  );
};

// Mock Trash2 and Plus icons
const Trash2 = ({ className }: { className: string }) => <div data-testid="trash-icon" className={className} />;
const Plus = ({ className }: { className: string }) => <div data-testid="plus-icon" className={className} />;

describe('VideoInput Component', () => {
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

  it('renders initial URL input', () => {
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    expect(screen.getByTestId('url-input-0')).toBeInTheDocument();
    expect(screen.getByTestId('add-url-button')).toBeInTheDocument();
    expect(screen.queryByTestId('remove-url-0')).not.toBeInTheDocument();
  });

  it('calls onAddUrl when Add URL button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    const addButton = screen.getByTestId('add-url-button');
    await user.click(addButton);
    
    expect(mockAddUrl).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdateUrl when input value changes', () => {
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    const input = screen.getByTestId('url-input-0');
    fireEvent.change(input, { target: { value: 'https://vimeo.com/123456789' } });
    
    expect(mockUpdateUrl).toHaveBeenCalledWith(0, 'https://vimeo.com/123456789');
  });

  it('shows remove button when multiple URLs exist', () => {
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['', '']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    expect(screen.getByTestId('url-input-0')).toBeInTheDocument();
    expect(screen.getByTestId('url-input-1')).toBeInTheDocument();
    expect(screen.getByTestId('remove-url-0')).toBeInTheDocument();
    expect(screen.getByTestId('remove-url-1')).toBeInTheDocument();
  });

  it('calls onRemoveUrl when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['', '']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    const removeButton = screen.getByTestId('remove-url-1');
    await user.click(removeButton);
    
    expect(mockRemoveUrl).toHaveBeenCalledWith(1);
  });

  it('renders correct number of inputs based on URLs array length', () => {
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['url1', 'url2', 'url3']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    expect(screen.getByTestId('url-input-0')).toHaveValue('url1');
    expect(screen.getByTestId('url-input-1')).toHaveValue('url2');
    expect(screen.getByTestId('url-input-2')).toHaveValue('url3');
  });

  it('displays correct placeholder text', () => {
    const mockAddUrl = vi.fn();
    const mockRemoveUrl = vi.fn();
    const mockUpdateUrl = vi.fn();
    
    render(
      <VideoInput
        urls={['']}
        onAddUrl={mockAddUrl}
        onRemoveUrl={mockRemoveUrl}
        onUpdateUrl={mockUpdateUrl}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter Vimeo URL');
    expect(input).toBeInTheDocument();
  });
});
