import { useState, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import type { PaginationState } from "@tanstack/react-table";

export function useTablePagination(name: string, defaultPageSize: number) {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const pageParam = search[name] as string | undefined;
	const [urlSkip, urlTake] = pageParam?.split("-").map(Number) ?? [
		0,
		defaultPageSize,
	];

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

	return { pagination, setPagination };
}
