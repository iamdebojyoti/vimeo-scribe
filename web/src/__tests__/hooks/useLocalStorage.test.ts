import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

// Custom hook implementation for testing
const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const getValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const setValue = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [getValue(), setValue];
};

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('returns initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const [value] = useLocalStorage('test-key', 'initial-value');
    
    expect(value).toBe('initial-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('returns stored value from localStorage', () => {
    const storedValue = { name: 'test', count: 42 };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedValue));
    
    const [value] = useLocalStorage('test-key', { name: 'default', count: 0 });
    
    expect(value).toEqual(storedValue);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('saves value to localStorage when setter is called', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const [, setValue] = useLocalStorage('test-key', 'initial-value');
    const newValue = 'new-value';
    
    setValue(newValue);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(newValue));
  });

  it('handles JSON parsing errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const [value] = useLocalStorage('test-key', 'fallback-value');
    
    expect(value).toBe('fallback-value');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error reading localStorage key "test-key":'),
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('handles localStorage write errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const [, setValue] = useLocalStorage('test-key', 'initial-value');
    
    setValue('new-value');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error setting localStorage key "test-key":'),
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('works with different data types', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // String
    const [stringValue, setStringValue] = useLocalStorage('string-key', 'default');
    expect(stringValue).toBe('default');
    setStringValue('new string');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('string-key', JSON.stringify('new string'));
    
    // Number
    const [numberValue, setNumberValue] = useLocalStorage('number-key', 0);
    expect(numberValue).toBe(0);
    setNumberValue(42);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('number-key', JSON.stringify(42));
    
    // Boolean
    const [boolValue, setBoolValue] = useLocalStorage('bool-key', false);
    expect(boolValue).toBe(false);
    setBoolValue(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('bool-key', JSON.stringify(true));
    
    // Object
    const [objValue, setObjValue] = useLocalStorage('obj-key', { test: 'default' });
    expect(objValue).toEqual({ test: 'default' });
    setObjValue({ test: 'updated' });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('obj-key', JSON.stringify({ test: 'updated' }));
    
    // Array
    const [arrayValue, setArrayValue] = useLocalStorage('array-key', [1, 2, 3]);
    expect(arrayValue).toEqual([1, 2, 3]);
    setArrayValue([4, 5, 6]);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('array-key', JSON.stringify([4, 5, 6]));
  });

  it('handles null and undefined values', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const [nullValue] = useLocalStorage('null-key', null);
    expect(nullValue).toBeNull();
    
    const [undefinedValue] = useLocalStorage('undefined-key', undefined);
    expect(undefinedValue).toBeUndefined();
  });
});
