import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "@/shared/libs/utils";
import { TableRow, TableHead } from "../../ui";
import type { ExtendedColumnDef } from "../../types";

type TableHeaderProps<TData> = {
	table: Table<TData>;
};

export function TableHeader<TData>({ table }: TableHeaderProps<TData>) {
	return (
		<>
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						const isPinned = header.column.getIsPinned();
						const colDef = header.column.columnDef as ExtendedColumnDef<TData>;

						const pinnedStyles = isPinned
							? cn(
									"sticky z-10 bg-background",
									isPinned === "left" &&
										`left-[${header.column.getStart("left") ?? 0}px]`,
									isPinned === "right" &&
										`right-[${header.column.getAfter("right") ?? 0}px]`,
								)
							: "";

						const headerClassName = colDef.headerClassName || "";

						return (
							<TableHead
								key={header.id}
								className={cn(pinnedStyles, headerClassName)}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</TableHead>
						);
					})}
				</TableRow>
			))}
		</>
	);
}
