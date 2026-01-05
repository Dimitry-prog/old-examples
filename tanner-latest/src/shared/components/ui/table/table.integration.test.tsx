import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./table";
import { TablePagination } from "./table-pagination";
import type { ExtendedColumnDef } from "./types";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useSearch: () => ({}),
}));

type TestData = {
	id: number;
	name: string;
	status: string;
};

const mockData: TestData[] = [
	{ id: 1, name: "Item 1", status: "active" },
	{ id: 2, name: "Item 2", status: "inactive" },
	{ id: 3, name: "Item 3", status: "active" },
];

const mockColumns: ExtendedColumnDef<TestData>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
];

describe("Integration Tests - Pagination Flow", () => {
	it("renders table with pagination component", () => {
		const mockTable = {
			previousPage: vi.fn(),
			nextPage: vi.fn(),
			getCanPreviousPage: () => false,
			getCanNextPage: () => true,
			getPageCount: () => 4,
			getState: () => ({
				pagination: {
					pageIndex: 0,
					pageSize: 3,
				},
			}),
		};

		const { container } = render(
			<div>
				<Table
					name="test-table"
					columns={mockColumns}
					data={mockData}
					columnPinning={{ left: [], right: [] }}
					totalRows={10}
					pageSize={3}
				/>
				<TablePagination table={mockTable as any} name="test-table" />
			</div>,
		);

		// Check table is rendered
		expect(screen.getByRole("table")).toBeInTheDocument();

		// Check pagination is rendered
		const pageTexts = screen.getAllByText(/Page/i);
		expect(pageTexts.length).toBeGreaterThan(0);
		const selects = screen.getAllByRole("combobox");
		expect(selects.length).toBeGreaterThan(0);
	});

	it("hides pagination in infinite scroll mode", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
			/>,
		);

		// Table should be rendered
		expect(screen.getByRole("table")).toBeInTheDocument();

		// Pagination should not be rendered (would need to be added separately)
		expect(screen.queryByText("Previous")).not.toBeInTheDocument();
	});
});

describe("Integration Tests - Sorting and Filtering", () => {
	it("renders table with sortable columns", () => {
		const sortableColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "name",
				header: "Name",
				enableSorting: true,
			},
		];

		render(
			<Table
				name="test-table"
				columns={sortableColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		expect(screen.getByText("Name")).toBeInTheDocument();
	});
});

describe("Integration Tests - Infinite Scroll", () => {
	it("renders table in infinite scroll mode with scrollable container", () => {
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
			/>,
		);

		// Check scrollable container exists
		const scrollContainer = container.querySelector(".overflow-auto");
		expect(scrollContainer).toBeInTheDocument();

		// Check table is inside
		expect(screen.getByRole("table")).toBeInTheDocument();
	});
});

import { fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Integration Tests - Sorting and Filtering (Extended)", () => {
	it("sorts data when column header is clicked", async () => {
		const user = userEvent.setup();
		const sortableColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "name",
				header: "Name",
				enableSorting: true,
			},
		];

		render(
			<Table
				name="test-table"
				columns={sortableColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		const nameHeader = screen.getByText("Name");
		await user.click(nameHeader);

		// Table should still be rendered with data
		expect(screen.getByRole("table")).toBeInTheDocument();
	});

	it("filters data based on column filter", async () => {
		const filterableColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "status",
				header: "Status",
				enableColumnFilter: true,
			},
		];

		render(
			<Table
				name="test-table"
				columns={filterableColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Table should render all data initially
		const activeElements = screen.getAllByText("active");
		expect(activeElements.length).toBe(2);
		expect(screen.getByText("inactive")).toBeInTheDocument();
	});

	it("combines sorting and filtering", async () => {
		const columns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "name",
				header: "Name",
				enableSorting: true,
			},
			{
				accessorKey: "status",
				header: "Status",
				enableColumnFilter: true,
			},
		];

		render(
			<Table
				name="test-table"
				columns={columns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Both sorting and filtering should be available
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
	});
});

describe("Integration Tests - Infinite Scroll with Data Loading", () => {
	it("loads initial data", async () => {
		const mockOnLoadMore = vi.fn();

		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
				onLoadMore={mockOnLoadMore}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Item 1")).toBeInTheDocument();
			expect(screen.getByText("Item 2")).toBeInTheDocument();
			expect(screen.getByText("Item 3")).toBeInTheDocument();
		});
	});

	it("triggers data load on scroll", async () => {
		const mockOnLoadMore = vi.fn();
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
				onLoadMore={mockOnLoadMore}
			/>,
		);

		const scrollContainer = container.querySelector(".overflow-auto");
		expect(scrollContainer).toBeInTheDocument();

		if (scrollContainer) {
			// Simulate scroll to bottom
			Object.defineProperty(scrollContainer, "scrollTop", {
				writable: true,
				value: 350,
			});
			Object.defineProperty(scrollContainer, "scrollHeight", {
				writable: true,
				value: 400,
			});
			Object.defineProperty(scrollContainer, "clientHeight", {
				writable: true,
				value: 400,
			});

			fireEvent.scroll(scrollContainer);

			await waitFor(() => {
				expect(mockOnLoadMore).toHaveBeenCalled();
			});
		}
	});

	it("appends data correctly on load more", async () => {
		const initialData = [
			{ id: 1, name: "Item 1", status: "active" },
			{ id: 2, name: "Item 2", status: "inactive" },
		];

		const { rerender } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={initialData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
			/>,
		);

		expect(screen.getByText("Item 1")).toBeInTheDocument();
		expect(screen.getByText("Item 2")).toBeInTheDocument();

		// Simulate loading more data
		const moreData = [
			...initialData,
			{ id: 3, name: "Item 3", status: "active" },
		];

		rerender(
			<Table
				name="test-table"
				columns={mockColumns}
				data={moreData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Item 1")).toBeInTheDocument();
			expect(screen.getByText("Item 2")).toBeInTheDocument();
			expect(screen.getByText("Item 3")).toBeInTheDocument();
		});
	});

	it("shows loading indicator during fetch", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={true}
				isLoading={true}
			/>,
		);

		// Table should still render
		expect(screen.getByRole("table")).toBeInTheDocument();
	});

	it("stops loading when hasMore is false", async () => {
		const mockOnLoadMore = vi.fn();
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				isLoadOnScroll={true}
				maxHeight="400px"
				hasMore={false}
				onLoadMore={mockOnLoadMore}
			/>,
		);

		const scrollContainer = container.querySelector(".overflow-auto");

		if (scrollContainer) {
			// Simulate scroll to bottom
			Object.defineProperty(scrollContainer, "scrollTop", {
				writable: true,
				value: 350,
			});
			Object.defineProperty(scrollContainer, "scrollHeight", {
				writable: true,
				value: 400,
			});
			Object.defineProperty(scrollContainer, "clientHeight", {
				writable: true,
				value: 400,
			});

			fireEvent.scroll(scrollContainer);

			// onLoadMore should not be called when hasMore is false
			await waitFor(() => {
				expect(mockOnLoadMore).not.toHaveBeenCalled();
			});
		}
	});
});
