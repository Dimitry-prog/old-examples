export type PageItem = number | "ellipsis-start" | "ellipsis-end";

export type UsePaginationPagesProps = {
	currentPage: number;
	totalPages: number;
};

export type UsePaginationPagesReturn = {
	pageNumbers: PageItem[];
	getDropdownPages: (type: "start" | "end") => number[];
};

/**
 * Hook for generating page numbers with ellipsis logic
 * @internal - Do not import directly, use Pagination component
 */
export const _usePaginationPages = ({
	currentPage,
	totalPages,
}: UsePaginationPagesProps): UsePaginationPagesReturn => {
	const getPageNumbers = (): PageItem[] => {
		const pages: PageItem[] = [];
		const showPages = 5; // Number of page buttons to show

		if (totalPages <= showPages + 2) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis-start");
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("ellipsis-end");
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	const getDropdownPages = (type: "start" | "end"): number[] => {
		const pages: number[] = [];
		if (type === "start") {
			// Pages between 1 and current visible range
			const start = 2;
			const end = Math.max(2, currentPage - 2);
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
		} else {
			// Pages between current visible range and last
			const start = Math.min(totalPages - 1, currentPage + 2);
			const end = totalPages - 1;
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
		}
		return pages;
	};

	return {
		pageNumbers: getPageNumbers(),
		getDropdownPages,
	};
};
