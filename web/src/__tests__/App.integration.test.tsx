import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock environment variables
vi.mock('../vite-env', () => ({}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
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

  it('renders the application header correctly', () => {
    render(<App />);
    expect(screen.getByText('vimeo-scribe')).toBeInTheDocument();
    expect(screen.getByText('Multi-Video Transcription & Summary')).toBeInTheDocument();
  });

  it('renders the main form elements', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter custom instructions for the AI\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Multi-Scribe/i })).toBeInTheDocument();
  });

  it('shows BYOK Configuration button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /BYOK Configuration/i })).toBeInTheDocument();
  });

  it('displays no API key warning when no keys are configured', () => {
    render(<App />);
    expect(screen.getByText(/No API key detected/i)).toBeInTheDocument();
  });

  it('allows adding URL fields', () => {
    render(<App />);
    const addButton = screen.getByRole('button', { name: /Add URL/i });
    fireEvent.click(addButton);
    
    const urlInputs = screen.getAllByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i);
    expect(urlInputs).toHaveLength(2);
  });

  it('allows updating summarize prompt', () => {
    render(<App />);
    const promptTextarea = screen.getByPlaceholderText(/Enter custom instructions for the AI\.\.\./i);
    fireEvent.change(promptTextarea, { target: { value: 'Custom prompt' } });
    
    expect(promptTextarea).toHaveValue('Custom prompt');
  });

  it('loads API keys from localStorage on mount', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'vimeo-scribe-keys') {
        return JSON.stringify({ gemini: 'test-key' });
      }
      return null;
    });
    
    render(<App />);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('vimeo-scribe-keys');
  });

  it('prevents form submission with empty URLs', () => {
    render(<App />);
    const processButton = screen.getByRole('button', { name: /Generate Multi-Scribe/i });
    const form = processButton.closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }
    
    // Should not show loading state
    expect(screen.queryByText(/Processing.../i)).not.toBeInTheDocument();
  });
});
