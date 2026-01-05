import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";

export type UsePaginationProps = {
	/** Unique name for URL params */
	name: string;
	/** Default page size */
	pageSize?: number;
};

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

/**
 * Hook to read pagination state from URL
 * Use this to get current page/skip/take values for your data fetching
 */
export function usePagination({
	name,
	pageSize: defaultPageSize = 10,
}: UsePaginationProps): UsePaginationResult {
	const search = useSearch({ strict: false }) as Record<string, unknown>;

	return useMemo(() => {
		const pageParam = search[name] as string | undefined;
		const [skip, take] = pageParam?.split("-").map(Number) ?? [
			0,
			defaultPageSize,
		];
		const currentPage = Math.floor(skip / take) + 1;

		return {
			currentPage,
			pageSize: take,
			skip,
			take,
		};
	}, [search, name, defaultPageSize]);
}
