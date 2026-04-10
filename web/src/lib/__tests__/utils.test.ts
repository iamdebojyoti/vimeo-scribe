import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle undefined and null values', () => {
    expect(cn('bg-red-500', undefined, null, 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle empty strings', () => {
    expect(cn('bg-red-500', '', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['bg-red-500', 'text-white'])).toBe('bg-red-500 text-white');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({
      'bg-red-500': true,
      'hidden': false,
      'text-white': true
    })).toBe('bg-red-500 text-white');
  });

  it('should handle mixed input types', () => {
    expect(cn(
      'bg-red-500',
      { 'text-white': true, 'hidden': false },
      ['p-4', 'm-2']
    )).toBe('bg-red-500 text-white p-4 m-2');
  });

  it('should handle conflicting Tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should return empty string when no classes provided', () => {
    expect(cn()).toBe('');
  });

  it('should handle complex Tailwind conflicts', () => {
    expect(cn('p-4', 'px-8', 'py-2')).toBe('p-4 px-8 py-2');
  });
});
