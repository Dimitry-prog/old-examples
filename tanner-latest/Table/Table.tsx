import React, { useCallback } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
	Box,
	IconButton,
	Paper,
	Table as MuiTable,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";

import EmptyTableState from "@/shared/ui/Table/components/EmptyTableState";
import TablePagination from "@/shared/ui/Table/components/TablePagination";
import {
	bodyCell,
	groupCell,
	groupHeader,
	groupHeaderCell,
	headerCell,
	table,
} from "@/shared/ui/Table/table.styles.ts";
import { debounce } from "@/shared/utils";

import { ColumnType, GroupType, RenderCellType, TableProps } from "./types";

const SCROLL_THRESHOLD = 50;

export const Table = <T,>({
	name,
	columns,
	rows,
	totalRows,
	stickyHeader = false,
	isLoading = false,
	perPage = 10,
	perPageOptions = [10, 20, 50],
	maxHeight = "100%",
	isTotal = false,
	rowStyles,
	rowSeparators,
	getRowStyles,
	headerRowStyle,
	headerGroupRowStyle,
	isLoadOnScroll = false,
	onLoadMore,
	hasMore = false,
	isResetScroll = false,
	onScrollReset,
}: TableProps<T>) => {
	const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
	const [fixedColumnWidths, setFixedColumnWidths] = useState<number[]>([]);
	const tableRef = useRef<HTMLTableElement>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const groups = useMemo(() => {
		const groupMap: Record<string, GroupType> = {};
		columns.forEach((column) => {
			if (column.group) {
				groupMap[column.group.name] = column.group;
			} else {
				groupMap[column.key] = { name: "Empty", isExpanded: true };
			}
		});
		return Object.values(groupMap);
	}, [columns]);
	const groupedColumns = useMemo(() => {
		return groups.reduce(
			(acc, group) => {
				acc[group.name] = columns.filter(
					(col) => col.group?.name === group.name,
				);
				return acc;
			},
			{} as Record<string, ColumnType<T>[]>,
		);
	}, [groups, columns]);

	const toggleGroup = useCallback(
		(groupName: string) => {
			if (
				groupName === "Empty" ||
				groupedColumns[groupName].every((item) => item.group?.isExpanded)
			)
				return;

			setExpandedGroups((prev) =>
				prev.includes(groupName)
					? prev.filter((g) => g !== groupName)
					: [...prev, groupName],
			);
		},
		[groupedColumns],
	);
	const isGroupExpanded = useCallback(
		(groupName: string) => {
			return expandedGroups.includes(groupName);
		},
		[expandedGroups],
	);
	const getVisibleGroupColumns = useCallback(
		(group: GroupType) => {
			const groupCols = groupedColumns[group.name];
			return !groupCols?.length
				? []
				: isGroupExpanded(group.name)
					? groupCols
					: groupCols.filter((g) => g.group?.isExpanded);
		},
		[groupedColumns, isGroupExpanded],
	);
	const isColumnVisible = useCallback(
		(column: ColumnType<T>) => {
			const group = column.group;
			if (!group) return true;

			const groupCols = groupedColumns[group.name];
			return !isGroupExpanded(group.name)
				? groupCols.some(
						(col) => col.group?.isExpanded && col.key === column.key,
					)
				: true;
		},
		[groupedColumns, isGroupExpanded],
	);

	const visibleColumns = useMemo(
		() => columns.filter(isColumnVisible),
		[columns, isColumnVisible],
	);
	const fixedColumns = useMemo(
		() => visibleColumns.filter((col) => col.isFixed),
		[visibleColumns],
	);
	const scrollableColumns = useMemo(
		() => visibleColumns.filter((col) => !col.isFixed),
		[visibleColumns],
	);

	const getStickyStyles = useCallback(
		(index: number, isCell = false) => {
			const leftPositions = fixedColumns.reduce((acc, _, idx) => {
				const previousColumns = fixedColumns.slice(0, idx);
				const left = previousColumns.reduce(
					(sum, col, colIndex) => sum + (fixedColumnWidths[colIndex] || 0),
					0,
				);
				return [...acc, left];
			}, [] as number[]);

			const leftPosition = leftPositions[index] || 0;

			return {
				position: "sticky",
				left: `${leftPosition}px`,
				zIndex: isCell ? 1 : 3,
			};
		},
		[fixedColumns, fixedColumnWidths],
	);

	const renderCell = useCallback(
		({
			column,
			index,
			children,
			sx,
			isSticky = false,
			isStickyCell = false,
			cellStyles,
			isHeader = false,
		}: RenderCellType<T>) => (
			<TableCell
				key={`${column.key}-${index}`}
				align="left"
				sx={{
					...(isSticky && !isHeader
						? getStickyStyles(index, isStickyCell)
						: {}),
					...(isSticky && isHeader
						? {
								...getStickyStyles(index, false),
								top: stickyHeader ? 0 : "auto",
							}
						: {}),
					...sx,
				}}
				className={
					isHeader && column.headerClassName
						? column.headerClassName
						: column.className
				}
				style={{
					...column?.style,
					...cellStyles,
					...(isHeader ? column.headerStyle : {}),
				}}
			>
				{children}
			</TableCell>
		),
		[getStickyStyles, stickyHeader],
	);

	useEffect(() => {
		if (tableRef.current && fixedColumns.length > 0) {
			const newWidths = fixedColumns.map((_, index) => {
				const cell = tableRef.current?.querySelector(
					`td:nth-child(${index + 1})`,
				);
				return cell?.clientWidth || 0;
			});

			if (JSON.stringify(newWidths) !== JSON.stringify(fixedColumnWidths)) {
				setFixedColumnWidths(newWidths);
			}
		}
	}, [tableRef.current, rows, fixedColumns, fixedColumnWidths]);

	const renderGroupHeaders = useMemo(
		() => (
			<TableRow
				sx={{
					...(headerGroupRowStyle && {
						"& > th": {
							...headerGroupRowStyle,
						},
					}),
				}}
			>
				{groups.map((group, index) => {
					const visibleGroupCols = getVisibleGroupColumns(group);
					const expanded = isGroupExpanded(group.name);
					const cursor =
						group.name === "Empty" ||
						groupedColumns[group.name].every((item) => item.group?.isExpanded)
							? "initial"
							: "pointer";
					const isSticky = groupedColumns[group.name].some(
						(item) => item.isFixed,
					);

					return (
						<TableCell
							key={`${group.name}-${index}`}
							colSpan={visibleGroupCols.length || 1}
							align="left"
							onClick={() => toggleGroup(group.name)}
							sx={groupCell}
							className={group?.className}
							style={{
								cursor,
								left: isSticky ? 0 : undefined,
								zIndex: isSticky ? 3 : undefined,
								...group?.style,
							}}
						>
							{group.name !== "Empty" && (
								<Box
									sx={{
										...groupHeader,
										"&::before, &::after": {
											height: "1px",
											content: '""',
											flexGrow: 1,
											backgroundColor: group?.style?.color || "var(--gray-700)",
										},
									}}
									style={group?.style}
								>
									{group.name}
									{groupedColumns[group.name].some(
										(item) => !item.group?.isExpanded,
									) && (
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												toggleGroup(group.name);
											}}
											style={group?.style}
										>
											{expanded ? (
												<KeyboardArrowLeft />
											) : (
												<KeyboardArrowRight />
											)}
										</IconButton>
									)}
								</Box>
							)}
						</TableCell>
					);
				})}
			</TableRow>
		),
		[
			groups,
			getVisibleGroupColumns,
			isGroupExpanded,
			groupedColumns,
			toggleGroup,
		],
	);
	const renderColumnHeaders = useMemo(
		() => (
			<TableRow
				sx={{
					...(headerRowStyle && {
						"& > th": {
							...headerRowStyle,
						},
					}),
				}}
			>
				{fixedColumns.map((column, index) =>
					renderCell({
						column,
						index,
						sx: {
							...(columns.some((c) => c.group) ? groupHeaderCell : headerCell),
							...column?.headerStyle,
						},
						isSticky: true,
						children: column.label,
						isHeader: true,
					}),
				)}
				{scrollableColumns.map((column, index) =>
					renderCell({
						column,
						index,
						sx: {
							...(columns.some((c) => c.group) ? groupHeaderCell : headerCell),
							...column?.headerStyle,
						},
						children: column.label,
						isHeader: true,
					}),
				)}
			</TableRow>
		),
		[fixedColumns, scrollableColumns, renderCell, columns],
	);
	const renderBodyRows = useMemo(() => {
		const result: JSX.Element[] = [];

		rows?.forEach((row, rowIndex) => {
			const customRowStyles = getRowStyles?.(row, rowIndex);
			result.push(
				<TableRow
					key={`${rowIndex}`}
					sx={{
						"&:hover > td": {
							backgroundColor: "var(--light) !important",
						},
						...(rowStyles && {
							"& > td": {
								...rowStyles,
							},
						}),
						...(customRowStyles?.row && {
							...customRowStyles.row,
						}),
						...(customRowStyles?.cells && {
							"& > td": {
								...customRowStyles.cells,
							},
						}),
						...(isTotal && {
							"&:last-of-type": {
								position: "sticky",
								bottom: "0",
								zIndex: "25",
							},
						}),
					}}
				>
					{fixedColumns.map((column, index) =>
						renderCell({
							column,
							index,
							sx: bodyCell,
							isSticky: true,
							isStickyCell: true,
							children: column.renderCell
								? column.renderCell(row[column.key], row)
								: row[column.key],
							cellStyles: column.cellStyle
								? column.cellStyle(row[column.key], row)
								: {},
						}),
					)}
					{scrollableColumns.map((column, index) =>
						renderCell({
							column,
							index,
							sx: bodyCell,
							children: column.renderCell
								? column.renderCell(row[column.key], row)
								: row[column.key],
							cellStyles: column.cellStyle
								? column.cellStyle(row[column.key], row)
								: {},
						}),
					)}
				</TableRow>,
			);

			const isSeparator = rowSeparators?.(row, rowIndex);
			if (isSeparator) {
				result.push(
					<TableRow key={`separator-${rowIndex}`}>
						<TableCell
							colSpan={visibleColumns.length}
							sx={{
								height: isSeparator.height || 10,
								padding: 0,
								backgroundColor: "transparent",
								...isSeparator.style,
							}}
						/>
					</TableRow>,
				);
			}
		});

		return result;
	}, [
		rows,
		fixedColumns,
		scrollableColumns,
		renderCell,
		rowSeparators,
		visibleColumns,
	]);

	const handleScroll = useCallback(() => {
		const container = tableContainerRef?.current;
		if (!container) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		if (
			scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD &&
			hasMore &&
			!isLoading
		) {
			onLoadMore?.();
		}
	}, [tableContainerRef, hasMore, isLoading, onLoadMore]);

	const handleScrollDebounced = useMemo(
		() => debounce(handleScroll, 200),
		[handleScroll],
	);

	useEffect(() => {
		if (!isLoadOnScroll || !onLoadMore || !hasMore || isLoading) return;

		const container = tableContainerRef?.current;
		if (!container) return;

		container.addEventListener("scroll", handleScrollDebounced);
		return () => container.removeEventListener("scroll", handleScrollDebounced);
	}, [
		isLoadOnScroll,
		onLoadMore,
		hasMore,
		isLoading,
		handleScrollDebounced,
		tableContainerRef,
	]);

	useEffect(() => {
		const container = tableContainerRef?.current;
		if (!container) return;

		if (isResetScroll && container) {
			container.scrollTop = 0;
			onScrollReset?.();
		}
	}, [isResetScroll, tableContainerRef, onScrollReset]);

	return (
		<Paper elevation={0} sx={{ width: "100%", overflow: "hidden" }}>
			<TableContainer
				ref={tableContainerRef}
				sx={{
					maxHeight,
					overflowX: "auto",
					overflowY: "auto",
					position: "relative",
				}}
			>
				<MuiTable
					ref={tableRef}
					stickyHeader={stickyHeader}
					sx={{
						tableLayout: "auto",
						...table,
						"& thead": {
							position: stickyHeader ? "sticky" : "relative",
							top: 0,
							zIndex: 10,
						},
					}}
				>
					<TableHead>
						{columns.some((item) => item.group) ? (
							<>
								{renderGroupHeaders}
								{renderColumnHeaders}
							</>
						) : (
							renderColumnHeaders
						)}
					</TableHead>
					<TableBody>{renderBodyRows}</TableBody>
				</MuiTable>
			</TableContainer>

			<EmptyTableState length={rows?.length} isLoading={isLoading} />

			{!isLoadOnScroll && totalRows > perPage && (
				<TablePagination
					name={name}
					perPage={perPage}
					total={totalRows as number}
					perPageOptions={perPageOptions}
					isLoading={isLoading}
				/>
			)}
		</Paper>
	);
};
