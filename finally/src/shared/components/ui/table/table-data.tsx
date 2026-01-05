import { useState, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import type { TableDataProps } from "./types";
import { BaseTable } from "./base-table/base-table";
import { TableEmptyState } from "./table-empty-state";

/**
 * TableData component for automatic data fetching with pagination
 * Wraps BaseTable with server-side pagination logic
 */
export function TableData<TData, TFilters = unknown, TResponse = unknown>({
	name,
	fetchData,
	transformData,
	getOrderedParamsForFetch,
	filters,
	refetchTrigger,
	pageSize = 10,
	...tableProps
}: TableDataProps<TData, TFilters, TResponse>) {
	const [data, setData] = useState<TData[]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const search = useSearch({ strict: false }) as Record<string, unknown>;

	// Get pagination params from URL
	const pageParam = search[name] as string | undefined;
	const [skip, take] = pageParam?.split("-").map(Number) ?? [0, pageSize];

	// Fetch data effect
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				// Use custom parameter order if provided, otherwise use default
				const params = getOrderedParamsForFetch
					? getOrderedParamsForFetch(filters, skip, take)
					: [{ skip, take, filters }];

				const response = await fetchData(...params);
				const transformed = transformData
					? transformData(response.data)
					: (response.data as { items: TData[]; count: number });

				setData(transformed.items);
				setTotalRows(transformed.count);
			} catch (error) {
				console.error("Failed to fetch table data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [
		skip,
		take,
		filters,
		fetchData,
		transformData,
		getOrderedParamsForFetch,
		refetchTrigger,
	]);

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<BaseTable
					{...tableProps}
					name={name}
					data={data}
					totalRows={totalRows}
					pageSize={take}
				/>
			</div>

			<TableEmptyState isLoading={isLoading} isEmpty={data.length === 0} />
		</div>
	);
}
