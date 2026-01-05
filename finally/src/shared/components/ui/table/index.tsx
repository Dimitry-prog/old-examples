// Export shadcn/ui base components
export {
	Table as TableUI,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
} from "./ui";

// Export main table components
export { BaseTable } from "./base-table/base-table";
export { TableData } from "./table-data";
export { TableDataInfinite } from "./table-data-infinite";
export { TablePagination } from "./table-pagination";
export { TableEmptyState } from "./table-empty-state";
export { usePagination } from "./usePagination";

// Export types
export type {
	BaseTableProps,
	TableDataProps,
	TableDataInfiniteProps,
	TablePaginationProps,
	TableEmptyStateProps,
	ExtendedColumnDef,
	ColumnGroup,
	RowSeparator,
	FetchParams,
	UsePaginationProps,
	UsePaginationResult,
} from "./types";
