import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";

describe("Button Component", () => {
	it("should render button with text", () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: /click me/i }),
		).toBeInTheDocument();
	});

	it("should handle click events", async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Click me</Button>);

		await user.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled Button</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("should not trigger click when disabled", async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Button disabled onClick={handleClick}>
				Disabled
			</Button>,
		);

		await user.click(screen.getByRole("button"));
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("should apply variant classes", () => {
		const { rerender } = render(<Button variant="default">Default</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-primary");

		rerender(<Button variant="destructive">Destructive</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-destructive");

		rerender(<Button variant="outline">Outline</Button>);
		expect(screen.getByRole("button")).toHaveClass("border");

		rerender(<Button variant="ghost">Ghost</Button>);
		expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");
	});

	it("should apply size classes", () => {
		const { rerender } = render(<Button size="default">Default</Button>);
		expect(screen.getByRole("button")).toHaveClass("h-9");

		rerender(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button")).toHaveClass("h-8");

		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button")).toHaveClass("h-10");
	});

	it("should render as child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>,
		);

		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/test");
	});

	it("should merge custom className with default classes", () => {
		render(<Button className="custom-class">Custom</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("custom-class");
		expect(button).toHaveClass("inline-flex"); // default class
	});

	it("should support different button types", () => {
		const { rerender } = render(<Button type="button">Button</Button>);
		expect(screen.getByRole("button")).toHaveAttribute("type", "button");

		rerender(<Button type="submit">Submit</Button>);
		expect(screen.getByRole("button")).toHaveAttribute("type", "submit");

		rerender(<Button type="reset">Reset</Button>);
		expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
	});
});
