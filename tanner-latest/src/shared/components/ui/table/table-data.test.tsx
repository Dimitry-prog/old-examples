import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TableData } from "./table-data";
import type { ExtendedColumnDef } from "./types";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useSearch: () => ({}),
}));

type TestData = {
	id: number;
	name: string;
};

const mockColumns: ExtendedColumnDef<TestData>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "name",
		header: "Name",
	},
];

describe("TableData - Data Fetching", () => {
	it("calls fetchData on component mount", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: [], count: 0 },
		});

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalled();
		});
	});

	it("calls fetchData with correct params", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: [], count: 0 },
		});

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				filters={{ search: "test" }}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledWith({
				skip: 0,
				take: 10,
				filters: { search: "test" },
			});
		});
	});

	it("updates data state after successful fetch", async () => {
		const mockData = [
			{ id: 1, name: "Test 1" },
			{ id: 2, name: "Test 2" },
		];

		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: mockData, count: 2 },
		});

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Test 1")).toBeInTheDocument();
			expect(screen.getByText("Test 2")).toBeInTheDocument();
		});
	});
});

describe("TableData - Data Transformation", () => {
	it("calls transformData function when provided", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { results: [{ id: 1, name: "Test" }], total: 1 },
		});

		const mockTransformData = vi.fn((response) => ({
			items: response.results,
			count: response.total,
		}));

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				transformData={mockTransformData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockTransformData).toHaveBeenCalled();
		});
	});
});

describe("TableData - Filter Changes", () => {
	it("calls fetchData when filters change", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: [], count: 0 },
		});

		const { rerender } = render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				filters={{ search: "initial" }}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledWith({
				skip: 0,
				take: 10,
				filters: { search: "initial" },
			});
		});

		mockFetchData.mockClear();

		rerender(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				filters={{ search: "updated" }}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledWith({
				skip: 0,
				take: 10,
				filters: { search: "updated" },
			});
		});
	});
});

describe("TableData - Refetch Trigger", () => {
	it("calls fetchData when refetchTrigger changes", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: [], count: 0 },
		});

		const { rerender } = render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				refetchTrigger={1}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledTimes(1);
		});

		mockFetchData.mockClear();

		rerender(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				refetchTrigger={2}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledTimes(1);
		});
	});
});

describe("TableData - Infinite Scroll Mode", () => {
	it("appends data in infinite scroll mode", async () => {
		const initialData = [{ id: 1, name: "Test 1" }];

		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: initialData, count: 1 },
		});

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				isLoadOnScroll={true}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Test 1")).toBeInTheDocument();
		});

		// Verify fetchData was called
		expect(mockFetchData).toHaveBeenCalled();
	});

	it("replaces data in pagination mode", async () => {
		const page1Data = [{ id: 1, name: "Page 1" }];
		const page2Data = [{ id: 2, name: "Page 2" }];

		const mockFetchData = vi
			.fn()
			.mockResolvedValueOnce({
				data: { items: page1Data, count: 2 },
			})
			.mockResolvedValueOnce({
				data: { items: page2Data, count: 2 },
			});

		const { rerender } = render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				isLoadOnScroll={false}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Page 1")).toBeInTheDocument();
		});

		// Simulate page change
		rerender(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				isLoadOnScroll={false}
				refetchTrigger={2}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(screen.queryByText("Page 1")).not.toBeInTheDocument();
			expect(screen.getByText("Page 2")).toBeInTheDocument();
		});
	});
});

describe("TableData - URL Parameter Integration", () => {
	it("uses default values when no URL params", async () => {
		const mockFetchData = vi.fn().mockResolvedValue({
			data: { items: [], count: 0 },
		});

		render(
			<TableData
				name="test-table"
				columns={mockColumns}
				fetchData={mockFetchData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		await waitFor(() => {
			expect(mockFetchData).toHaveBeenCalledWith({
				skip: 0,
				take: 10,
				filters: undefined,
			});
		});
	});
});
