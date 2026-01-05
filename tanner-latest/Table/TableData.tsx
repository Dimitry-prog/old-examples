import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ColumnType, Table, TableProps } from "@/shared/ui/Table";
import { TableDataType, TablePaginationType } from "@/shared/ui/Table/types.ts";

type DataTableProps<
	T,
	TParams = Record<string, unknown> | string,
	TData = TableDataType<T>,
> = Omit<TableProps<T>, "rows" | "totalRows"> & {
	columns: ColumnType<T>[];
	fetchData: (...args: unknown[]) => Promise<{ data: TData }>;
	getOrderedParamsForFetch?: (
		filters?: TParams,
		skip?: number,
		take?: number,
	) => unknown[];
	transformData?: (
		data: TData,
		pagination?: TablePaginationType,
	) => TableDataType<T>;
	filters?: TParams;
	isPagination?: boolean;
	refetchTrigger?: number;
};

export const TableData = <
	T,
	TParams = Record<string, unknown> | string,
	TData = TableDataType<T>,
>(
	props: DataTableProps<T, TParams, TData>,
) => {
	const {
		columns,
		fetchData,
		transformData,
		filters,
		name,
		isPagination = false,
		isLoadOnScroll = false,
		getOrderedParamsForFetch,
		refetchTrigger,
		...rest
	} = props;

	const [searchParams] = useSearchParams();
	const searchParamsCustom = searchParams?.get(name)?.split("-") || [0, 10];
	const skip = Number(searchParamsCustom[0]);
	const take = Number(searchParamsCustom[1]);

	const [rows, setRows] = useState<TableDataType<T>>({
		skip,
		count: 0,
		items: [],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [isResetScroll, setIsResetScroll] = useState(false);
	const [page, setPage] = useState(0);
	const prevFiltersRef = useRef(filters);
	const prevRefetchTriggerRef = useRef(refetchTrigger);

	const getData = useCallback(
		async (resetPage = false) => {
			setIsLoading(true);
			if (resetPage) {
				setIsResetScroll(true);
			}
			const currentPage = resetPage ? 0 : page;
			const currentSkip = isLoadOnScroll ? currentPage * take : skip;
			const params = getOrderedParamsForFetch
				? getOrderedParamsForFetch(filters, currentSkip, take)
				: [currentSkip, take, filters];

			const response = await fetchData(...params);
			const data = response.data;
			const transformed = transformData
				? transformData(data, { skip: currentSkip, take })
				: (data as TableDataType<T>);

			if (isLoadOnScroll) {
				setRows((prev) => ({
					...transformed,
					items:
						resetPage || currentPage === 0
							? transformed.items
							: [...prev.items, ...transformed.items],
				}));
				setHasMore(transformed.items.length === take);
				setPage(resetPage ? 1 : currentPage + 1);
			} else {
				setRows(transformed);
			}

			setIsLoading(false);
		},
		[
			filters,
			skip,
			take,
			isLoadOnScroll,
			page,
			fetchData,
			transformData,
			getOrderedParamsForFetch,
		],
	);

	const handleLoadMore = useCallback(() => {
		if (isLoadOnScroll && hasMore && !isLoading) {
			getData(false);
		}
	}, [isLoadOnScroll, hasMore, isLoading, getData]);

	const handleScrollReset = useCallback(() => {
		setIsResetScroll(false);
	}, []);

	useEffect(() => {
		const isFiltersChanged =
			JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
		const isRefetchTriggered = prevRefetchTriggerRef.current !== refetchTrigger;

		if ((isFiltersChanged || isRefetchTriggered) && isLoadOnScroll) {
			setPage(0);
			setHasMore(true);
			prevFiltersRef.current = filters;
			prevRefetchTriggerRef.current = refetchTrigger;
			getData(true);
		} else {
			getData(false);
		}
	}, [filters, skip, take, refetchTrigger]);

	return (
		<Table
			{...rest}
			name={name}
			columns={columns}
			rows={rows?.items}
			isLoading={isLoading}
			totalRows={
				isLoadOnScroll ? undefined : isPagination ? rows?.count : undefined
			}
			isLoadOnScroll={isLoadOnScroll}
			onLoadMore={handleLoadMore}
			hasMore={hasMore}
			isResetScroll={isResetScroll}
			onScrollReset={handleScrollReset}
		/>
	);
};
