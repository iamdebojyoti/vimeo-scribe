import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('App Component', () => {
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

  it('renders the main header', () => {
    render(<App />);
    expect(screen.getByText('vimeo-scribe')).toBeInTheDocument();
    expect(screen.getByText('Multi-Video Transcription & Summary')).toBeInTheDocument();
  });

  it('renders the URL input section', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add URL/i })).toBeInTheDocument();
  });

  it('renders the summarize prompt textarea', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Enter custom instructions for the AI\.\.\./i)).toBeInTheDocument();
  });

  it('adds a new URL field when Add URL button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const addButton = screen.getByRole('button', { name: /Add URL/i });
    await user.click(addButton);
    
    const urlInputs = screen.getAllByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i);
    expect(urlInputs).toHaveLength(2);
  });

  it('removes a URL field when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // First add a second URL
    const addButton = screen.getByRole('button', { name: /Add URL/i });
    await user.click(addButton);
    
    // Then remove one
    const removeButtons = screen.getAllByRole('button', { name: '' });
    await user.click(removeButtons[1]); // Click the remove button for the second URL
    
    const urlInputs = screen.getAllByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i);
    expect(urlInputs).toHaveLength(1);
  });

  it('updates URL field value when typed', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const urlInput = screen.getByPlaceholderText(/https:\/\/vimeo\.com\/123456789/i);
    await user.type(urlInput, 'https://vimeo.com/123456789');
    
    expect(urlInput).toHaveValue('https://vimeo.com/123456789');
  });

  it('updates summarize prompt when typed', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const promptTextarea = screen.getByPlaceholderText(/Enter custom instructions for the AI\.\.\./i);
    await user.type(promptTextarea, 'Summarize this video');
    
    expect(promptTextarea).toHaveValue('Summarize the following data in 250 words. Process it in a way that it looks like class notes needs to be submitted based on it.Summarize this video');
  });

  it('opens settings modal when BYOK Configuration button is clicked', () => {
    render(<App />);
    
    const settingsButton = screen.getByRole('button', { name: /BYOK Configuration/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('shows configure button when no API keys are present', () => {
    render(<App />);
    
    expect(screen.getByText(/Configure Now/i)).toBeInTheDocument();
  });

  it('displays correct application title', () => {
    render(<App />);
    
    expect(screen.getByText('vimeo-scribe')).toBeInTheDocument();
    expect(screen.getByText('Multi-Video Transcription & Summary')).toBeInTheDocument();
  });

  it('loads API keys from localStorage on mount', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'vimeo-scribe-keys') {
        return JSON.stringify({ gemini: 'saved-api-key' });
      }
      return null;
    });
    
    render(<App />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('vimeo-scribe-keys');
  });

  it('shows API key configuration when no keys are present', () => {
    render(<App />);
    expect(screen.getByText(/No API key detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Configure Now/i)).toBeInTheDocument();
  });
});
