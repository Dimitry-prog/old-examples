import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TablePagination } from "./table-pagination";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useSearch: () => ({}),
}));

// Create a mock table object
const createMockTable = (canPrevious = true, canNext = true) => ({
	previousPage: vi.fn(),
	nextPage: vi.fn(),
	getCanPreviousPage: () => canPrevious,
	getCanNextPage: () => canNext,
	getPageCount: () => 10,
	getState: () => ({
		pagination: {
			pageIndex: 0,
			pageSize: 10,
		},
	}),
});

describe("TablePagination - Pagination Controls", () => {
	it("renders pagination controls", () => {
		const mockTable = createMockTable();
		const { container } = render(
			<TablePagination table={mockTable as any} name="test-table" />,
		);

		// Check that pagination container is rendered
		expect(container.querySelector(".flex.items-center")).toBeInTheDocument();
	});

	it("renders page size selector", () => {
		const mockTable = createMockTable();
		render(<TablePagination table={mockTable as any} name="test-table" />);

		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();
	});

	it("displays current page information", () => {
		const mockTable = createMockTable();
		render(<TablePagination table={mockTable as any} name="test-table" />);

		const pageTexts = screen.getAllByText(/Page/i);
		expect(pageTexts.length).toBeGreaterThan(0);
		expect(screen.getByText(/of/i)).toBeInTheDocument();
	});
});

describe("TablePagination - URL Parameter Updates", () => {
	it("renders with correct page size options", () => {
		const mockTable = createMockTable();
		render(<TablePagination table={mockTable as any} name="test-table" />);

		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();

		// Check that options are present in the select
		const options = screen.getAllByRole("option");
		expect(options.length).toBeGreaterThanOrEqual(4);
	});
});
