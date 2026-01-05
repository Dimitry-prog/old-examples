import { describe, expect, it } from 'vitest';
import { cn } from '../index';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('handles falsy values', () => {
    const result = cn('base-class', false, null, undefined, '');
    expect(result).toBe('base-class');
  });

  it('merges tailwind classes with conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with conditional classes', () => {
    const result = cn({
      'base-class': true,
      'conditional-class': false,
      'another-class': true,
    });
    expect(result).toBe('base-class another-class');
  });
});
