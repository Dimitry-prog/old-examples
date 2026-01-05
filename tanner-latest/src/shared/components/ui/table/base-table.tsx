import React, { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	useReactTable,
	type PaginationState,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/libs/utils";
import type { BaseTableProps, ExtendedColumnDef, ColumnGroup } from "./types";
import {
	Table as TableUI,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "./ui";
import { TablePagination } from "./table-pagination";

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
	// Helper to get group name from column definition
	const getGroupName = (colDef: ExtendedColumnDef<TData>): string | null => {
		if (!colDef.group) return null;
		return typeof colDef.group === "string" ? colDef.group : colDef.group.name;
	};

	// Extract unique column groups from column definitions
	const columnGroups = useMemo(() => {
		const groupMap = new Map<string, ColumnGroup>();

		for (const col of columns) {
			const colDef = col as ExtendedColumnDef<TData>;
			if (colDef.group) {
				// Normalize group: string -> ColumnGroup object
				const group: ColumnGroup =
					typeof colDef.group === "string"
						? { name: colDef.group, collapsible: true, defaultExpanded: true }
						: {
								name: colDef.group.name,
								className: colDef.group.className,
								collapsible: colDef.group.collapsible ?? true,
								defaultExpanded: colDef.group.defaultExpanded ?? true,
							};

				// Use the first occurrence of each group
				if (!groupMap.has(group.name)) {
					groupMap.set(group.name, group);
				}
			}
		}

		return Array.from(groupMap.values());
	}, [columns]);

	// Read pagination from URL
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const pageParam = search[name] as string | undefined;
	const [urlSkip, urlTake] = pageParam?.split("-").map(Number) ?? [0, pageSize];

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: Math.floor(urlSkip / urlTake),
		pageSize: urlTake,
	});

	// Sync pagination with URL changes
	useEffect(() => {
		const newPageIndex = Math.floor(urlSkip / urlTake);
		const newPageSize = urlTake;

		if (
			pagination.pageIndex !== newPageIndex ||
			pagination.pageSize !== newPageSize
		) {
			setPagination({
				pageIndex: newPageIndex,
				pageSize: newPageSize,
			});
		}
	}, [urlSkip, urlTake, pagination.pageIndex, pagination.pageSize]);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
		const initialExpanded = new Set<string>();
		if (columnGroups) {
			for (const group of columnGroups) {
				if (group.defaultExpanded !== false) {
					initialExpanded.add(group.name);
				}
			}
		}
		return initialExpanded;
	});

	// Initialize column visibility based on collapsed groups
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		() => {
			const initialVisibility: VisibilityState = {};

			if (columnGroups) {
				// Group columns by group name
				const columnsByGroup = new Map<string, string[]>();

				for (const col of columns) {
					const colDef = col as ExtendedColumnDef<TData>;
					const groupName = getGroupName(colDef);
					if (groupName) {
						if (!columnsByGroup.has(groupName)) {
							columnsByGroup.set(groupName, []);
						}
						// Use accessorKey or id as column identifier
						const colId =
							"accessorKey" in colDef
								? String(colDef.accessorKey)
								: "id" in colDef
									? String(colDef.id)
									: undefined;
						if (colId) {
							columnsByGroup.get(groupName)?.push(colId);
						}
					}
				}

				// Set visibility for collapsed groups (only first column visible)
				for (const group of columnGroups) {
					if (group.defaultExpanded === false) {
						const groupCols = columnsByGroup.get(group.name) || [];
						groupCols.forEach((colId, index) => {
							initialVisibility[colId] = index === 0;
						});
					}
				}
			}

			return initialVisibility;
		},
	);

	// Determine if we should use manual or automatic pagination
	const isManualPagination = manualPaginationProp ?? totalRows !== undefined;

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

	// Toggle group expansion
	const toggleGroup = (groupName: string) => {
		const newExpanded = new Set(expandedGroups);
		const newVisibility = { ...columnVisibility };

		// Get all columns in this group
		const groupColumns = table.getAllColumns().filter((col) => {
			const colDef = col.columnDef as ExtendedColumnDef<TData>;
			return getGroupName(colDef) === groupName;
		});

		if (newExpanded.has(groupName)) {
			// Collapse: hide all columns except the first one
			newExpanded.delete(groupName);
			groupColumns.forEach((col, index) => {
				// Keep first column visible, hide the rest
				newVisibility[col.id] = index === 0;
			});
		} else {
			// Expand: show all columns in this group
			newExpanded.add(groupName);
			groupColumns.forEach((col) => {
				newVisibility[col.id] = true;
			});
		}

		setColumnVisibility(newVisibility);
		setExpandedGroups(newExpanded);
	};

	// Calculate group headers if columnGroups is provided
	const renderGroupHeaders = () => {
		if (!columnGroups || columnGroups.length === 0) return null;

		// Build segments for all visible columns (including non-grouped ones)
		const visibleHeaders = table.getHeaderGroups()[0]?.headers || [];
		const segments: Array<{ groupName: string | null; colSpan: number }> = [];
		let currentGroup: string | null = null;
		let currentSpan = 0;

		for (const header of visibleHeaders) {
			const colDef = header.column.columnDef as ExtendedColumnDef<TData>;
			const groupName = getGroupName(colDef);

			if (groupName === currentGroup) {
				// Same group (or both null), increment span
				currentSpan++;
			} else {
				// Different group, save previous and start new
				if (currentSpan > 0) {
					segments.push({ groupName: currentGroup, colSpan: currentSpan });
				}
				currentGroup = groupName;
				currentSpan = 1;
			}
		}

		// Don't forget the last segment
		if (currentSpan > 0) {
			segments.push({ groupName: currentGroup, colSpan: currentSpan });
		}

		// Check if we have any grouped columns
		const hasGroups = segments.some((s) => s.groupName !== null);
		if (!hasGroups) return null;

		return (
			<TableRow className="hover:bg-transparent">
				{segments.map((segment, index) => {
					if (segment.groupName === null) {
						// Empty cell for non-grouped columns
						return (
							<TableHead
								key={`empty-${index}`}
								colSpan={segment.colSpan}
								className="border-b-2"
							/>
						);
					}

					const group = columnGroups.find((g) => g.name === segment.groupName);
					if (!group) return null;

					const isExpanded = expandedGroups.has(segment.groupName);
					const isCollapsible = group.collapsible !== false;

					return (
						<TableHead
							key={`${segment.groupName}-${index}`}
							colSpan={segment.colSpan}
							className={cn(
								"text-center font-bold border-b-2",
								isCollapsible && "cursor-pointer select-none hover:bg-gray-100",
								group.className,
							)}
							onClick={
								isCollapsible && segment.groupName
									? () => toggleGroup(segment.groupName as string)
									: undefined
							}
						>
							<div className="flex items-center justify-center gap-2">
								{isCollapsible &&
									(isExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									))}
								{segment.groupName}
							</div>
						</TableHead>
					);
				})}
			</TableRow>
		);
	};

	const tableContent = (
		<TableUI>
			<TableHeader className={stickyHeader ? "sticky top-0 z-10 bg-white" : ""}>
				{renderGroupHeaders()}
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							const isPinned = header.column.getIsPinned();
							const colDef = header.column
								.columnDef as ExtendedColumnDef<TData>;

							const pinnedStyles = isPinned
								? cn(
										"sticky z-10 bg-background",
										isPinned === "left" &&
											`left-[${header.column.getStart("left") ?? 0}px]`,
										isPinned === "right" &&
											`right-[${header.column.getAfter("right") ?? 0}px]`,
									)
								: "";

							const headerClassName = colDef.headerClassName || "";

							return (
								<TableHead
									key={header.id}
									className={cn(pinnedStyles, headerClassName)}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.map((row, rowIndex) => {
					const dynamicRowClassName = getRowClassName
						? getRowClassName(row.original, rowIndex)
						: "";

					const separator = rowSeparators
						? rowSeparators(row.original, rowIndex)
						: null;

					return (
						<React.Fragment key={row.id}>
							<TableRow className={cn(rowClassName, dynamicRowClassName)}>
								{row.getVisibleCells().map((cell) => {
									const isPinned = cell.column.getIsPinned();
									const colDef = cell.column
										.columnDef as ExtendedColumnDef<TData>;

									const pinnedStyles = isPinned
										? cn(
												"sticky z-10 bg-background",
												isPinned === "left" &&
													`left-[${cell.column.getStart("left") ?? 0}px]`,
												isPinned === "right" &&
													`right-[${cell.column.getAfter("right") ?? 0}px]`,
											)
										: "";

									const cellClassName = colDef.className || "";
									const dynamicCellClassName = colDef.getCellClassName
										? colDef.getCellClassName(cell.getValue(), row.original)
										: "";

									return (
										<TableCell
											key={cell.id}
											className={cn(
												pinnedStyles,
												cellClassName,
												dynamicCellClassName,
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									);
								})}
							</TableRow>
							{separator && (
								<TableRow
									key={`${row.id}-separator`}
									className={cn("border-0", separator.className)}
									style={{ height: separator.height }}
								>
									<TableCell colSpan={row.getVisibleCells().length} />
								</TableRow>
							)}
						</React.Fragment>
					);
				})}
			</TableBody>
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

	// Show pagination if we have more than one page
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
