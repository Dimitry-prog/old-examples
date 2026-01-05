import { useNavigate, useSearch } from "@tanstack/react-router";

export type UsePaginationStateProps = {
	/** Unique name for URL params */
	name: string;
	/** Total number of items */
	totalItems: number;
	/** Items per page (default: 10) */
	pageSize?: number;
	/** Route path for type-safe search params (optional) */
	from?: string;
	/** Callback when page changes */
	onPageChange?: (page: number, pageSize: number) => void;
};

export type UsePaginationStateReturn = {
	currentPage: number;
	pageSize: number;
	totalPages: number;
	goToPage: (page: number) => void;
	changePageSize: (newSize: number) => void;
};

/**
 * Hook for managing pagination state in URL
 * @internal - Do not import directly, use Pagination component
 */
export const _usePaginationState = ({
	name,
	totalItems,
	pageSize: defaultPageSize = 10,
	from,
	onPageChange,
}: UsePaginationStateProps): UsePaginationStateReturn => {
	const navigate = useNavigate();
	const search = useSearch({
		strict: false,
		...(from && { from: from as any }),
	});

	// Read current state from URL
	const pageParam = (search as any)[name] as string | undefined;
	const [skip, take] = pageParam?.split("-").map(Number) ?? [
		0,
		defaultPageSize,
	];
	const currentPage = Math.floor(skip / take) + 1;
	const pageSize = take;
	const totalPages = Math.ceil(totalItems / pageSize);

	const goToPage = (page: number) => {
		const newSkip = (page - 1) * pageSize;

		navigate({
			search: (prev: Record<string, unknown>) => ({
				...prev,
				[name]: `${newSkip}-${pageSize}`,
			}),
			resetScroll: false,
		} as never);

		onPageChange?.(page, pageSize);
	};

	const changePageSize = (newSize: number) => {
		navigate({
			search: (prev: Record<string, unknown>) => ({
				...prev,
				[name]: `0-${newSize}`,
			}),
			resetScroll: false,
		} as never);

		onPageChange?.(1, newSize);
	};

	return {
		currentPage,
		pageSize,
		totalPages,
		goToPage,
		changePageSize,
	};
};
