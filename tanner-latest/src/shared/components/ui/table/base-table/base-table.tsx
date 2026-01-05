import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { BaseTableProps } from "../types";
import {
	Table as TableUI,
	TableHeader as TableHeaderUI,
	TableBody as TableBodyUI,
} from "../ui";
import { TablePagination } from "../table-pagination";
import { useTablePagination } from "./hooks/useTablePagination";
import { useTableState } from "./hooks/useTableState";
import { useTableGroups } from "./hooks/useTableGroups";
import { TableHeaderGroups } from "./components/table-header-groups";
import { TableHeader } from "./components/table-header";
import { TableBody } from "./components/table-body";
import { toggleGroupExpansion } from "./utils/table-helpers";

/**
 * BaseTable component - pure table rendering with pagination
 * This is the foundation for TableData and TableDataInfinite
 */
export function BaseTable<TData>({
	name,
	columns,
	data,
	totalRows,
	pageSize = 10,
	pageSizeOptions,
	showPageNumbers = true,
	manualPagination: manualPaginationProp,
	columnPinning,
	onColumnPinningChange,
	stickyHeader = false,
	rowClassName,
	getRowClassName,
	rowSeparators,
	maxHeight,
}: BaseTableProps<TData>) {
	// Hooks for state management
	const { pagination, setPagination } = useTablePagination(name, pageSize);
	const {
		sorting,
		setSorting,
		columnFilters,
		setColumnFilters,
		columnVisibility,
		setColumnVisibility,
	} = useTableState();
	const {
		columnGroups,
		expandedGroups,
		setExpandedGroups,
		initialColumnVisibility,
	} = useTableGroups(columns);

	// Initialize column visibility with group defaults
	if (
		Object.keys(columnVisibility).length === 0 &&
		Object.keys(initialColumnVisibility).length > 0
	) {
		setColumnVisibility(initialColumnVisibility);
	}

	// Determine pagination mode
	const isManualPagination = manualPaginationProp ?? totalRows !== undefined;

	// Create table instance
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnPinningChange,
		manualPagination: isManualPagination,
		pageCount: isManualPagination
			? Math.max(
					1,
					Math.ceil((totalRows ?? 0) / Math.max(1, pagination.pageSize)),
				)
			: Math.max(1, Math.ceil(data.length / Math.max(1, pagination.pageSize))),
		state: {
			pagination,
			sorting,
			columnFilters,
			columnVisibility,
			columnPinning: columnPinning || { left: [], right: [] },
		},
	});

	// Handle group toggle
	const handleToggleGroup = (groupName: string) => {
		const { newExpandedGroups, newColumnVisibility } = toggleGroupExpansion(
			groupName,
			expandedGroups,
			columnVisibility,
			table,
		);
		setExpandedGroups(newExpandedGroups);
		setColumnVisibility(newColumnVisibility);
	};

	// Render table content
	const tableContent = (
		<TableUI>
			<TableHeaderUI
				className={stickyHeader ? "sticky top-0 z-10 bg-background" : ""}
			>
				<TableHeaderGroups
					table={table}
					columnGroups={columnGroups}
					expandedGroups={expandedGroups}
					onToggleGroup={handleToggleGroup}
				/>
				<TableHeader table={table} />
			</TableHeaderUI>
			<TableBodyUI>
				<TableBody
					table={table}
					rowClassName={rowClassName}
					getRowClassName={getRowClassName}
					rowSeparators={rowSeparators}
				/>
			</TableBodyUI>
		</TableUI>
	);

	// Wrap in scrollable container if maxHeight is provided
	const wrappedContent = maxHeight ? (
		<div className="overflow-auto" style={{ maxHeight }}>
			{tableContent}
		</div>
	) : (
		tableContent
	);

	// Show pagination if needed
	const shouldShowPagination = isManualPagination
		? totalRows && totalRows > pagination.pageSize
		: data.length > pagination.pageSize;

	return (
		<>
			{wrappedContent}
			{shouldShowPagination && (
				<TablePagination
					table={table as any}
					name={name}
					pageSizeOptions={pageSizeOptions}
					showPageNumbers={showPageNumbers}
				/>
			)}
		</>
	);
}
