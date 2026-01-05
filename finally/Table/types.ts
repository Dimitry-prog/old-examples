import { CSSProperties, ReactNode } from "react";

import { SxProps } from "@mui/material";

export type ColumnType<T> = {
	key: keyof T;
	label: string;
	group?: GroupType;
	renderCell?: (
		value: T[keyof T],
		row: T,
		props?: unknown,
	) => ReactNode | Element | string | number;
	isFixed?: boolean;
	className?: string;
	style?: CSSProperties;
	cellStyle?: (value: T[keyof T], row: T, props?: unknown) => CSSProperties;
	headerStyle?: CSSProperties;
	headerClassName?: string;
};

export type GroupType = {
	name: string;
	isExpanded?: boolean;
	className?: string;
	style?: CSSProperties;
};

export type TableProps<T> = {
	name: string;
	columns: ColumnType<T>[];
	rows: T[];
	totalRows?: number;
	stickyHeader?: boolean;
	isLoading?: boolean;
	perPage?: number;
	perPageOptions?: number[];
	maxHeight?: number | string;
	isTotal?: boolean;
	rowStyles?: CSSProperties;
	rowSeparators?: (row: T, index: number) => TableRowSeparatorType;
	getRowStyles?: (
		row: T,
		index: number,
	) => {
		row?: CSSProperties;
		cells?: CSSProperties;
	};
	headerRowStyle?: CSSProperties;
	headerGroupRowStyle?: CSSProperties;
	isLoadOnScroll?: boolean;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isResetScroll?: boolean;
	onScrollReset?: () => void;
};

export type RenderCellType<T> = {
	column: ColumnType<T>;
	index: number;
	sx: SxProps;
	children: ReactNode;
	isSticky?: boolean;
	isStickyCell?: boolean;
	cellStyles?: (value: T[keyof T], row: T, props?: unknown) => CSSProperties;
	isHeader?: boolean;
};

type TableRowSeparatorType = {
	height?: number;
	style?: CSSProperties;
};

export type TableDataType<T> = {
	count?: number;
	skip?: number;
	items: T[];
};

export type TablePaginationType = {
	skip: number;
	take: number;
};
