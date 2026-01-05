import { useState, useEffect, useCallback } from "react";
import type { TableDataInfiniteProps } from "./types";
import { BaseTable } from "./base-table/base-table";
import { TableEmptyState } from "./table-empty-state";

/**
 * TableDataInfinite component for automatic data fetching with infinite scroll
 * Wraps BaseTable with infinite scroll logic
 */
export function TableDataInfinite<
	TData,
	TFilters = unknown,
	TResponse = unknown,
>({
	name,
	fetchData,
	transformData,
	getOrderedParamsForFetch,
	filters,
	refetchTrigger,
	pageSize = 20,
	maxHeight = "600px",
	...tableProps
}: TableDataInfiniteProps<TData, TFilters, TResponse>) {
	const [data, setData] = useState<TData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [skip, setSkip] = useState(0);

	// Reset data when filters or refetchTrigger changes
	useEffect(() => {
		setData([]);
		setSkip(0);
		setHasMore(true);
	}, [filters, refetchTrigger]);

	// Load initial data
	useEffect(() => {
		if (data.length === 0 && hasMore && !isLoading) {
			loadMore();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.length, hasMore]);

	const loadMore = useCallback(async () => {
		if (isLoading || !hasMore) return;

		setIsLoading(true);
		try {
			// Use custom parameter order if provided, otherwise use default
			const params = getOrderedParamsForFetch
				? getOrderedParamsForFetch(filters, skip, pageSize)
				: [{ skip, take: pageSize, filters }];

			const response = await fetchData(...params);
			const transformed = transformData
				? transformData(response.data)
				: (response.data as { items: TData[]; count: number });

			setData((prev) => [...prev, ...transformed.items]);
			setSkip((prev) => prev + pageSize);

			// Check if we have more data
			if (transformed.items.length < pageSize) {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Failed to fetch table data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [
		skip,
		pageSize,
		filters,
		fetchData,
		transformData,
		getOrderedParamsForFetch,
		isLoading,
		hasMore,
	]);

	// Handle scroll event
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			if (!hasMore || isLoading) return;

			const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
			const threshold = 50;

			if (scrollHeight - scrollTop - clientHeight < threshold) {
				loadMore();
			}
		},
		[hasMore, isLoading, loadMore],
	);

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<div className="relative">
					<div
						className="overflow-auto"
						style={{ maxHeight }}
						onScroll={handleScroll}
					>
						<BaseTable
							{...tableProps}
							name={name}
							data={data}
							pageSize={data.length}
							manualPagination={false}
						/>
					</div>

					{isLoading && data.length > 0 && (
						<div className="flex items-center justify-center py-4 border-t">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
								<span>Loading more...</span>
							</div>
						</div>
					)}

					{!hasMore && data.length > 0 && (
						<div className="flex items-center justify-center py-4 border-t text-sm text-gray-500">
							No more data to load
						</div>
					)}
				</div>
			</div>

			{/* Show empty state only when no data and initial load */}
			{data.length === 0 && (
				<TableEmptyState isLoading={isLoading} isEmpty={true} />
			)}
		</div>
	);
}
