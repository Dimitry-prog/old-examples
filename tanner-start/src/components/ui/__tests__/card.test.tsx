import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../card";

describe("Card Components", () => {
	describe("Card", () => {
		it("should render card with children", () => {
			render(<Card>Card content</Card>);
			expect(screen.getByText("Card content")).toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = render(
				<Card className="custom-card">Content</Card>,
			);
			const card = container.querySelector('[data-slot="card"]');
			expect(card).toHaveClass("custom-card");
			expect(card).toHaveClass("rounded-xl"); // default class
		});
	});

	describe("CardHeader", () => {
		it("should render card header", () => {
			render(<CardHeader>Header content</CardHeader>);
			expect(screen.getByText("Header content")).toBeInTheDocument();
		});

		it("should have correct spacing classes", () => {
			render(<CardHeader>Header</CardHeader>);
			const header = screen.getByText("Header");
			expect(header).toHaveClass("grid", "gap-1.5");
		});
	});

	describe("CardTitle", () => {
		it("should render card title", () => {
			render(<CardTitle>Title</CardTitle>);
			expect(screen.getByText("Title")).toBeInTheDocument();
		});

		it("should have correct typography classes", () => {
			render(<CardTitle>Title</CardTitle>);
			const title = screen.getByText("Title");
			expect(title).toHaveClass("leading-none", "font-semibold");
		});
	});

	describe("CardDescription", () => {
		it("should render card description", () => {
			render(<CardDescription>Description text</CardDescription>);
			expect(screen.getByText("Description text")).toBeInTheDocument();
		});

		it("should have muted text color", () => {
			render(<CardDescription>Description</CardDescription>);
			const description = screen.getByText("Description");
			expect(description).toHaveClass("text-muted-foreground");
		});
	});

	describe("CardContent", () => {
		it("should render card content", () => {
			render(<CardContent>Main content</CardContent>);
			expect(screen.getByText("Main content")).toBeInTheDocument();
		});

		it("should have padding", () => {
			render(<CardContent>Content</CardContent>);
			const content = screen.getByText("Content");
			expect(content).toHaveClass("px-6");
		});
	});

	describe("CardFooter", () => {
		it("should render card footer", () => {
			render(<CardFooter>Footer content</CardFooter>);
			expect(screen.getByText("Footer content")).toBeInTheDocument();
		});

		it("should have flex layout", () => {
			render(<CardFooter>Footer</CardFooter>);
			const footer = screen.getByText("Footer");
			expect(footer).toHaveClass("flex", "items-center");
		});
	});

	describe("Complete Card", () => {
		it("should render complete card with all sections", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Card Title</CardTitle>
						<CardDescription>Card Description</CardDescription>
					</CardHeader>
					<CardContent>Card Content</CardContent>
					<CardFooter>Card Footer</CardFooter>
				</Card>,
			);

			expect(screen.getByText("Card Title")).toBeInTheDocument();
			expect(screen.getByText("Card Description")).toBeInTheDocument();
			expect(screen.getByText("Card Content")).toBeInTheDocument();
			expect(screen.getByText("Card Footer")).toBeInTheDocument();
		});
	});
});
