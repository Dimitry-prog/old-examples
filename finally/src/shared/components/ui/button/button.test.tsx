import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./index";

describe("Button", () => {
	it("renders button with text and data-slot attribute", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Click me");
		expect(button.tagName).toBe("BUTTON");
		expect(button).toHaveAttribute("data-slot", "button");
	});

	it("applies default variant and size classes", () => {
		render(<Button>Default Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-primary", "text-primary-foreground", "h-9");
	});

	it("applies destructive variant classes", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("bg-destructive", "text-white");
	});

	it("applies small size classes", () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("h-8");
	});

	it("handles disabled state correctly", () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveClass(
			"disabled:pointer-events-none",
			"disabled:opacity-50",
		);
	});

	it("renders as child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>,
		);
		const link = screen.getByRole("link");
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/test");
		expect(link).toHaveAttribute("data-slot", "button");
		expect(link).toHaveTextContent("Link Button");
	});

	it("has correct data-slot attribute", () => {
		render(<Button>Test Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("data-slot", "button");
	});
});
