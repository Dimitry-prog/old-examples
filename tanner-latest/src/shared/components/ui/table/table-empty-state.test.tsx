import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableEmptyState } from "./table-empty-state";

describe("TableEmptyState - Loading State", () => {
	it("renders loading indicator when isLoading is true", () => {
		render(<TableEmptyState isLoading={true} isEmpty={false} />);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("does not render loading indicator when isLoading is false", () => {
		render(<TableEmptyState isLoading={false} isEmpty={true} />);

		expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
	});
});

describe("TableEmptyState - Empty State", () => {
	it("shows default message when isEmpty is true and not loading", () => {
		render(<TableEmptyState isLoading={false} isEmpty={true} />);

		expect(screen.getByText("No results found")).toBeInTheDocument();
	});

	it("shows custom message when provided", () => {
		render(
			<TableEmptyState
				isLoading={false}
				isEmpty={true}
				message="Custom empty message"
			/>,
		);

		expect(screen.getByText("Custom empty message")).toBeInTheDocument();
	});

	it("hides component when data exists (isEmpty is false and not loading)", () => {
		const { container } = render(
			<TableEmptyState isLoading={false} isEmpty={false} />,
		);

		expect(container.firstChild).toBeNull();
	});
});
