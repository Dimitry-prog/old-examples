import type {
	ColumnDef,
	ColumnPinningState,
	Table as TanstackTable,
} from "@tanstack/react-table";

/**
 * Column group definition for grouping related columns with a common header
 * This is defined inline in column definitions, not as a separate prop
 *
 * Simplified usage:
 * - group: "Group Name" - collapsible, expanded by default
 * - group: { name: "Group Name" } - same as above
 * - group: { name: "Group Name", defaultExpanded: false } - collapsible, collapsed by default
 * - group: { name: "Group Name", collapsible: false } - not collapsible, always expanded
 */
export type ColumnGroup = {
	/** Group name displayed in the header */
	name: string;
	/** Tailwind classes for styling the group header */
	className?: string;
	/** Whether the group can be collapsed/expanded (default: true) */
	collapsible?: boolean;
	/** Whether the group is expanded by default (default: true) */
	defaultExpanded?: boolean;
};

/**
 * Row separator definition for visual separation between rows
 */
export type RowSeparator = {
	/** Height of the separator in pixels */
	height?: number;
	/** Tailwind classes for styling the separator */
	className?: string;
};

/**
 * Extended column definition with additional features
 */
export type ExtendedColumnDef<TData> = ColumnDef<TData> & {
	/**
	 * Column group for grouping related columns
	 * Can be a string (group name) or full ColumnGroup object
	 * Examples:
	 * - group: "Product Info" - simple, collapsible, expanded
	 * - group: { name: "Info", defaultExpanded: false } - collapsed by default
	 * - group: { name: "Info", collapsible: false } - not collapsible
	 */
	group?: string | ColumnGroup;
	/** Tailwind classes for cell styling */
	className?: string;
	/** Tailwind classes for header styling */
	headerClassName?: string;
	/** Function to dynamically generate cell classes */
	getCellClassName?: (value: unknown, row: TData) => string;
};

/**
 * Props for the BaseTable component (pure rendering)
 */
export type BaseTableProps<TData> = {
	/** Unique name for the table (used for URL params) */
	name: string;
	/** Column definitions */
	columns: ExtendedColumnDef<TData>[];
	/** Table data */
	data: TData[];

	// Pagination
	/** Total number of rows (for server-side pagination) */
	totalRows?: number;
	/** Number of rows per page */
	pageSize?: number;
	/** Available page size options */
	pageSizeOptions?: number[];
	/** Whether to show page numbers in pagination (default: true) */
	showPageNumbers?: boolean;
	/** Manual pagination mode (default: auto-detected based on totalRows) */
	manualPagination?: boolean;

	// Pinning
	/** Whether to make the header sticky */
	stickyHeader?: boolean;
	/** Column pinning state */
	columnPinning?: ColumnPinningState;
	/** Callback when column pinning changes */
	onColumnPinningChange?: (
		updater:
			| ColumnPinningState
			| ((old: ColumnPinningState) => ColumnPinningState),
	) => void;

	// Styling
	/** Maximum height of the table container */
	maxHeight?: string | number;
	/** Tailwind classes for all rows */
	rowClassName?: string;
	/** Function to dynamically generate row classes */
	getRowClassName?: (row: TData, index: number) => string;

	// Separators
	/** Function to generate row separators */
	rowSeparators?: (row: TData, index: number) => RowSeparator | null;
};

/**
 * Fetch parameters for data loading
 */
export type FetchParams<TFilters = unknown> = {
	/** Number of rows to skip */
	skip: number;
	/** Number of rows to take */
	take: number;
	/** Filter parameters */
	filters?: TFilters;
};

/**
 * Props for the TableData component (with pagination)
 */
export type TableDataProps<
	TData,
	TFilters = unknown,
	TResponse = unknown,
> = Omit<BaseTableProps<TData>, "data" | "totalRows"> & {
	/** Function to fetch data */
	fetchData: (...args: unknown[]) => Promise<{ data: TResponse }>;
	/** Function to transform response data */
	transformData?: (response: TResponse) => { items: TData[]; count: number };
	/** Function to customize parameter order for API calls */
	getOrderedParamsForFetch?: (
		filters?: TFilters,
		skip?: number,
		take?: number,
	) => unknown[];
	/** Filter parameters */
	filters?: TFilters;
	/** Trigger to refetch data */
	refetchTrigger?: number;
};

/**
 * Props for the TableDataInfinite component (with infinite scroll)
 */
export type TableDataInfiniteProps<
	TData,
	TFilters = unknown,
	TResponse = unknown,
> = Omit<
	BaseTableProps<TData>,
	"data" | "totalRows" | "pageSize" | "pageSizeOptions" | "showPageNumbers"
> & {
	/** Function to fetch data */
	fetchData: (...args: unknown[]) => Promise<{ data: TResponse }>;
	/** Function to transform response data */
	transformData?: (response: TResponse) => { items: TData[]; count: number };
	/** Function to customize parameter order for API calls */
	getOrderedParamsForFetch?: (
		filters?: TFilters,
		skip?: number,
		take?: number,
	) => unknown[];
	/** Filter parameters */
	filters?: TFilters;
	/** Trigger to refetch data */
	refetchTrigger?: number;
	/** Number of items to load per request (default: 20) */
	pageSize?: number;
	/** Maximum height of the scrollable container (default: "600px") */
	maxHeight?: string | number;
};

/**
 * Props for the TablePagination component
 */
export type TablePaginationProps = {
	/** TanStack Table instance (optional if totalItems is provided) */
	table?: TanstackTable<unknown>;
	/** Table name for URL params */
	name: string;
	/** Total number of items (alternative to table prop) */
	totalItems?: number;
	/** Available page size options (default: [10, 20, 50, 100]) */
	pageSizeOptions?: number[];
	/** Whether to show page numbers with ellipsis (default: true) */
	showPageNumbers?: boolean;
	/** Callback when page changes (useful without table prop) */
	onPageChange?: (page: number, pageSize: number) => void;
};

/**
 * Props for the TableEmptyState component
 */
export type TableEmptyStateProps = {
	/** Loading state */
	isLoading: boolean;
	/** Whether the table is empty */
	isEmpty: boolean;
	/** Custom empty message */
	message?: string;
};

/**
 * Props for usePagination hook
 */
export type UsePaginationProps = {
	/** Unique name for URL params */
	name: string;
	/** Default page size */
	pageSize?: number;
};

/**
 * Result from usePagination hook
 */
export type UsePaginationResult = {
	/** Current page (1-indexed) */
	currentPage: number;
	/** Current page size */
	pageSize: number;
	/** Skip value for queries (0-indexed) */
	skip: number;
	/** Take value for queries */
	take: number;
};
