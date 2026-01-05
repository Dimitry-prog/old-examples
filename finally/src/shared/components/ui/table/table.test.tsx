import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table } from "./table";
import type { ExtendedColumnDef } from "./types";

type TestData = {
	id: number;
	name: string;
	email: string;
};

const mockData: TestData[] = [
	{ id: 1, name: "John Doe", email: "john@example.com" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com" },
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
		accessorKey: "email",
		header: "Email",
	},
];

describe("Table - Basic Rendering", () => {
	it("renders table with minimal props", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Check if table is rendered
		const table = screen.getByRole("table");
		expect(table).toBeInTheDocument();
	});

	it("renders headers correctly", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Check if headers are rendered
		expect(screen.getByText("ID")).toBeInTheDocument();
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Email")).toBeInTheDocument();
	});

	it("renders data rows correctly", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Check if data is rendered
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("john@example.com")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("jane@example.com")).toBeInTheDocument();
	});

	it("renders empty table when no data provided", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={[]}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		// Table should still be rendered
		const table = screen.getByRole("table");
		expect(table).toBeInTheDocument();

		// Headers should be present
		expect(screen.getByText("ID")).toBeInTheDocument();

		// But no data rows
		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
	});
});

describe("Table - Custom Cell Rendering", () => {
	it("renders custom cell content", () => {
		const customColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ getValue }) => <strong>{getValue() as string}</strong>,
			},
		];

		render(
			<Table
				name="test-table"
				columns={customColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		const strongElement = screen.getByText("John Doe");
		expect(strongElement.tagName).toBe("STRONG");
	});

	it("applies custom className to cells", () => {
		const customColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "name",
				header: "Name",
				className: "custom-cell-class",
			},
		];

		render(
			<Table
				name="test-table"
				columns={customColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
			/>,
		);

		const cells = screen.getAllByRole("cell");
		const nameCell = cells.find((cell) => cell.textContent === "John Doe");
		expect(nameCell).toHaveClass("custom-cell-class");
	});
});

describe("Table - Row Styling", () => {
	it("applies rowClassName to all rows", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				rowClassName="custom-row-class"
			/>,
		);

		const rows = screen.getAllByRole("row");
		// Skip header row
		const dataRows = rows.slice(1);
		for (const row of dataRows) {
			expect(row).toHaveClass("custom-row-class");
		}
	});

	it("applies getRowClassName function to each row", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				getRowClassName={(rowData) =>
					rowData.id === 1 ? "highlighted-row" : "normal-row"
				}
			/>,
		);

		const rows = screen.getAllByRole("row");
		const dataRows = rows.slice(1);
		expect(dataRows[0]).toHaveClass("highlighted-row");
		expect(dataRows[1]).toHaveClass("normal-row");
	});

	it("combines rowClassName and getRowClassName", () => {
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				rowClassName="base-row-class"
				getRowClassName={(rowData) => (rowData.id === 1 ? "highlighted" : "")}
			/>,
		);

		const rows = screen.getAllByRole("row");
		const dataRows = rows.slice(1);
		expect(dataRows[0]).toHaveClass("base-row-class", "highlighted");
		expect(dataRows[1]).toHaveClass("base-row-class");
	});
});

describe("Table - Column Pinning", () => {
	it("applies sticky classes to pinned columns", () => {
		const pinnedColumns: ExtendedColumnDef<TestData>[] = [
			{
				id: "id",
				accessorKey: "id",
				header: "ID",
			},
			{
				id: "name",
				accessorKey: "name",
				header: "Name",
			},
		];

		render(
			<Table
				name="test-table"
				columns={pinnedColumns}
				data={mockData}
				columnPinning={{ left: ["id"], right: [] }}
			/>,
		);

		const table = screen.getByRole("table");
		expect(table).toBeInTheDocument();
	});
});

describe("Table - Sticky Header", () => {
	it("applies sticky classes when stickyHeader is true", () => {
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				stickyHeader={true}
			/>,
		);

		const thead = container.querySelector("thead");
		expect(thead).toHaveClass("sticky", "top-0", "z-10");
	});

	it("does not apply sticky classes when stickyHeader is false", () => {
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				stickyHeader={false}
			/>,
		);

		const thead = container.querySelector("thead");
		expect(thead).not.toHaveClass("sticky");
	});
});

describe("Table - Column Grouping", () => {
	it("renders group headers when columnGroups provided", () => {
		const groupedColumns: ExtendedColumnDef<TestData>[] = [
			{
				accessorKey: "id",
				header: "ID",
				group: { name: "Basic Info", collapsible: false },
			},
			{
				accessorKey: "name",
				header: "Name",
				group: { name: "Basic Info", collapsible: false },
			},
		];

		render(
			<Table
				name="test-table"
				columns={groupedColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				columnGroups={[{ name: "Basic Info", collapsible: false }]}
			/>,
		);

		expect(screen.getByText("Basic Info")).toBeInTheDocument();
	});
});

describe("Table - Row Separators", () => {
	it("renders separator row when rowSeparators returns object", () => {
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				rowSeparators={(row, index) =>
					index === 0 ? { height: 20, className: "separator-class" } : null
				}
			/>,
		);

		const rows = container.querySelectorAll("tr");
		// Should have header + 2 data rows + 1 separator
		expect(rows.length).toBeGreaterThan(3);
	});

	it("applies height and className to separator row", () => {
		const { container } = render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				rowSeparators={(row, index) =>
					index === 0
						? { height: 20, className: "custom-separator-class" }
						: null
				}
			/>,
		);

		const separatorCell = container.querySelector(".custom-separator-class");
		expect(separatorCell).toBeInTheDocument();
		expect(separatorCell).toHaveStyle({ height: "20px" });
	});

	it("calls rowSeparators function for each row", () => {
		let callCount = 0;
		render(
			<Table
				name="test-table"
				columns={mockColumns}
				data={mockData}
				columnPinning={{ left: [], right: [] }}
				rowSeparators={() => {
					callCount++;
					return null;
				}}
			/>,
		);

		// Should be called for each data row
		expect(callCount).toBe(mockData.length);
	});
});

describe("Table - Infinite Scroll", () => {
	it("wraps table in scrollable container when maxHeight is provided", () => {
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

		const scrollContainer = container.querySelector(".overflow-auto");
		expect(scrollContainer).toBeInTheDocument();
	});
});
