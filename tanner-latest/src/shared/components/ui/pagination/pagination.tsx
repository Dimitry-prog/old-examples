import { _PaginationPageSizeSelector } from "./ui/_pagination-page-size-selector";
import { _PaginationControls } from "./ui/_pagination-controls";
import { _usePaginationPages } from "./hooks/_use-pagination-pages";
import { _usePaginationState } from "./hooks/_use-pagination-state";

export type PaginationProps = {
	/** Unique name for URL params */
	name: string;
	/** Total number of items */
	totalItems: number;
	/** Items per page (default: 10) */
	pageSize?: number;
	/** Available page size options */
	pageSizeOptions?: number[];
	/** Whether to show page numbers with ellipsis (default: true) */
	showPageNumbers?: boolean;
	/** Route path for type-safe search params (optional) */
	from?: string;
	/** Callback when page changes */
	onPageChange?: (page: number, pageSize: number) => void;
};

/**
 * Universal Pagination component for any content (not just tables)
 * Features:
 * - First/Last page buttons
 * - Previous/Next buttons
 * - Page numbers with ellipsis
 * - Page size selector
 * - URL-based state management
 */
export const Pagination = ({
	name,
	totalItems,
	pageSize: defaultPageSize = 10,
	pageSizeOptions = [10, 20, 50, 100],
	showPageNumbers = true,
	from,
	onPageChange,
}: PaginationProps) => {
	const { currentPage, pageSize, totalPages, goToPage, changePageSize } =
		_usePaginationState({
			name,
			totalItems,
			pageSize: defaultPageSize,
			from,
			onPageChange,
		});

	const { pageNumbers, getDropdownPages } = _usePaginationPages({
		currentPage,
		totalPages,
	});

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<_PaginationPageSizeSelector
				pageSize={pageSize}
				pageSizeOptions={pageSizeOptions}
				onPageSizeChange={changePageSize}
			/>

			<_PaginationControls
				currentPage={currentPage}
				totalPages={totalPages}
				pageNumbers={pageNumbers}
				showPageNumbers={showPageNumbers}
				onPageChange={goToPage}
				getDropdownPages={getDropdownPages}
			/>
		</div>
	);
};
