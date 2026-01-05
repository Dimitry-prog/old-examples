import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toaster } from '../sonner';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' })),
}));

describe('Toaster', () => {
  it('renders toaster component with aria-label from real Sonner', () => {
    render(<Toaster />);
    const toaster = screen.getByLabelText(/notifications/i);
    expect(toaster).toBeInTheDocument();
    expect(toaster.tagName).toBe('SECTION');
  });

  it('applies correct theme from useTheme hook to real component', () => {
    render(<Toaster />);
    const toaster = screen.getByLabelText(/notifications/i);
    expect(toaster).toBeInTheDocument();
  });

  it('applies correct className to real component', () => {
    render(<Toaster />);
    const toaster = screen.getByLabelText(/notifications/i);
    expect(toaster).toBeInTheDocument();
  });

  it('renders with correct aria attributes from real Sonner', () => {
    render(<Toaster />);
    const toaster = screen.getByLabelText(/notifications/i);

    expect(toaster).toHaveAttribute('aria-live', 'polite');
    expect(toaster).toHaveAttribute('aria-atomic', 'false');
    expect(toaster).toHaveAttribute('aria-relevant', 'additions text');
    expect(toaster).toHaveAttribute('tabindex', '-1');
  });

  it('forwards additional props to real Sonner component', () => {
    render(<Toaster position="top-right" />);
    const toaster = screen.getByLabelText(/notifications/i);
    expect(toaster).toBeInTheDocument();
  });
});
