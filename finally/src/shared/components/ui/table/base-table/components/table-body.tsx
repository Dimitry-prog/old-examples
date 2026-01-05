import React from "react";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "@/shared/libs/utils";
import { TableRow, TableCell } from "../../ui";
import type { ExtendedColumnDef, RowSeparator } from "../../types";

type TableBodyProps<TData> = {
	table: Table<TData>;
	rowClassName?: string;
	getRowClassName?: (row: TData, index: number) => string;
	rowSeparators?: (row: TData, index: number) => RowSeparator | null;
};

export function TableBody<TData>({
	table,
	rowClassName,
	getRowClassName,
	rowSeparators,
}: TableBodyProps<TData>) {
	return (
		<>
			{table.getRowModel().rows.map((row, rowIndex) => {
				const dynamicRowClassName = getRowClassName
					? getRowClassName(row.original, rowIndex)
					: "";

				const separator = rowSeparators
					? rowSeparators(row.original, rowIndex)
					: null;

				return (
					<React.Fragment key={row.id}>
						<TableRow className={cn(rowClassName, dynamicRowClassName)}>
							{row.getVisibleCells().map((cell) => {
								const isPinned = cell.column.getIsPinned();
								const colDef = cell.column
									.columnDef as ExtendedColumnDef<TData>;

								const pinnedStyles = isPinned
									? cn(
											"sticky z-10 bg-background",
											isPinned === "left" &&
												`left-[${cell.column.getStart("left") ?? 0}px]`,
											isPinned === "right" &&
												`right-[${cell.column.getAfter("right") ?? 0}px]`,
										)
									: "";

								const cellClassName = colDef.className || "";
								const dynamicCellClassName = colDef.getCellClassName
									? colDef.getCellClassName(cell.getValue(), row.original)
									: "";

								return (
									<TableCell
										key={cell.id}
										className={cn(
											pinnedStyles,
											cellClassName,
											dynamicCellClassName,
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								);
							})}
						</TableRow>
						{separator && (
							<TableRow
								key={`${row.id}-separator`}
								className={cn("border-0", separator.className)}
								style={{ height: separator.height }}
							>
								<TableCell colSpan={row.getVisibleCells().length} />
							</TableRow>
						)}
					</React.Fragment>
				);
			})}
		</>
	);
}
