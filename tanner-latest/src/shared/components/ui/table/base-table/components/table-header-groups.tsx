import type { Table } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/libs/utils";
import { TableRow, TableHead } from "../../ui";
import type { ExtendedColumnDef, ColumnGroup } from "../../types";
import { getGroupName } from "../utils/table-helpers";

type TableHeaderGroupsProps<TData> = {
	table: Table<TData>;
	columnGroups: ColumnGroup[];
	expandedGroups: Set<string>;
	onToggleGroup: (groupName: string) => void;
};

export function TableHeaderGroups<TData>({
	table,
	columnGroups,
	expandedGroups,
	onToggleGroup,
}: TableHeaderGroupsProps<TData>) {
	if (!columnGroups || columnGroups.length === 0) return null;

	// Build segments for all visible columns (including non-grouped ones)
	const visibleHeaders = table.getHeaderGroups()[0]?.headers || [];
	const segments: Array<{ groupName: string | null; colSpan: number }> = [];
	let currentGroup: string | null = null;
	let currentSpan = 0;

	for (const header of visibleHeaders) {
		const colDef = header.column.columnDef as ExtendedColumnDef<TData>;
		const groupName = getGroupName(colDef);

		if (groupName === currentGroup) {
			currentSpan++;
		} else {
			if (currentSpan > 0) {
				segments.push({ groupName: currentGroup, colSpan: currentSpan });
			}
			currentGroup = groupName;
			currentSpan = 1;
		}
	}

	if (currentSpan > 0) {
		segments.push({ groupName: currentGroup, colSpan: currentSpan });
	}

	// Check if we have any grouped columns
	const hasGroups = segments.some((s) => s.groupName !== null);
	if (!hasGroups) return null;

	return (
		<TableRow className="hover:bg-transparent">
			{segments.map((segment, index) => {
				if (segment.groupName === null) {
					return (
						<TableHead
							key={`empty-${index}`}
							colSpan={segment.colSpan}
							className="border-b-2"
						/>
					);
				}

				const group = columnGroups.find((g) => g.name === segment.groupName);
				if (!group) return null;

				const isExpanded = expandedGroups.has(segment.groupName);
				const isCollapsible = group.collapsible !== false;

				return (
					<TableHead
						key={`${segment.groupName}-${index}`}
						colSpan={segment.colSpan}
						className={cn(
							"text-center font-bold border-b-2",
							isCollapsible && "cursor-pointer select-none hover:bg-gray-100",
							group.className,
						)}
						onClick={
							isCollapsible && segment.groupName
								? () => onToggleGroup(segment.groupName as string)
								: undefined
						}
					>
						<div className="flex items-center justify-center gap-2">
							{isCollapsible &&
								(isExpanded ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								))}
							{segment.groupName}
						</div>
					</TableHead>
				);
			})}
		</TableRow>
	);
}
