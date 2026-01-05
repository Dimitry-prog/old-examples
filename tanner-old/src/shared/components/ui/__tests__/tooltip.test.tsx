import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

describe('Tooltip Components', () => {
  it('renders TooltipProvider with children', () => {
    render(
      <TooltipProvider>
        <div data-testid="child">Content</div>
      </TooltipProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders Tooltip with children', () => {
    render(
      <Tooltip>
        <div data-testid="tooltip-child">Tooltip content</div>
      </Tooltip>
    );

    expect(screen.getByTestId('tooltip-child')).toBeInTheDocument();
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });

  it('renders TooltipTrigger with data-testid from component', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
      </Tooltip>
    );

    const trigger = screen.getByTestId('tooltip-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
    expect(trigger).toHaveTextContent('Hover me');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('renders complete tooltip structure with trigger', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Tooltip message</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByTestId('tooltip-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Trigger');
    expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
  });

  it('TooltipProvider accepts custom delayDuration', () => {
    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>Test</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByTestId('tooltip-trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('TooltipContent component can be rendered', () => {
    expect(typeof TooltipContent).toBe('function');

    render(
      <Tooltip>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent className="custom-tooltip">Custom content</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByTestId('tooltip-trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('exports all tooltip components as functions', () => {
    expect(typeof Tooltip).toBe('function');
    expect(typeof TooltipContent).toBe('function');
    expect(typeof TooltipProvider).toBe('function');
    expect(typeof TooltipTrigger).toBe('function');
  });
});
