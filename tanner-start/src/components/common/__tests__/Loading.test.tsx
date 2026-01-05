import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "../Loading";

describe("Loading Component", () => {
	it("should render loading spinner", () => {
		render(<Loading />);
		// Проверяем наличие элемента с role="status" или aria-label
		const loader = screen.getByRole("status", { hidden: true });
		expect(loader).toBeInTheDocument();
	});

	it("should display custom message", () => {
		render(<Loading message="Loading data..." />);
		expect(screen.getByText("Loading data...")).toBeInTheDocument();
	});

	it("should display default message when no message provided", () => {
		render(<Loading />);
		expect(screen.getByText("Загрузка...")).toBeInTheDocument();
	});

	it("should render fullscreen when fullScreen prop is true", () => {
		const { container } = render(<Loading fullScreen />);
		const wrapper = container.firstChild;
		expect(wrapper).toHaveClass("fixed", "inset-0");
	});

	it("should not render fullscreen by default", () => {
		const { container } = render(<Loading />);
		const wrapper = container.firstChild;
		expect(wrapper).not.toHaveClass("fixed");
	});

	it("should have spinner animation", () => {
		render(<Loading />);
		const spinner = screen.getByRole("status", { hidden: true });
		expect(spinner).toHaveClass("animate-spin");
	});

	it("should support different sizes", () => {
		const { rerender } = render(<Loading size="sm" />);
		let spinner = screen.getByRole("status", { hidden: true });
		expect(spinner).toHaveClass("h-4", "w-4");

		rerender(<Loading size="md" />);
		spinner = screen.getByRole("status", { hidden: true });
		expect(spinner).toHaveClass("h-8", "w-8");

		rerender(<Loading size="lg" />);
		spinner = screen.getByRole("status", { hidden: true });
		expect(spinner).toHaveClass("h-12", "w-12");
	});
});
