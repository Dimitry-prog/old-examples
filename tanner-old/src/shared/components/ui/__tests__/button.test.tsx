import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renders button with text and data-testid from component', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button.tagName).toBe('BUTTON');
  });

  it('applies default variant and size classes from component', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-9');
  });

  it('applies destructive variant classes from component', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-destructive', 'text-white');
  });

  it('applies small size classes from component', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('h-8');
  });

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('renders as child component when asChild is true with data-testid', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByTestId('button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(link).toHaveTextContent('Link Button');
  });

  it('has correct data attributes from component implementation', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-testid', 'button');
  });
});
