import type { Table } from "@tanstack/react-table";
import type { ExtendedColumnDef } from "../../types";

/**
 * Get group name from column definition
 */
export function getGroupName<TData>(
	colDef: ExtendedColumnDef<TData>,
): string | null {
	if (!colDef.group) return null;
	return typeof colDef.group === "string" ? colDef.group : colDef.group.name;
}

/**
 * Toggle group expansion and update column visibility
 */
export function toggleGroupExpansion<TData>(
	groupName: string,
	expandedGroups: Set<string>,
	columnVisibility: Record<string, boolean>,
	table: Table<TData>,
): {
	newExpandedGroups: Set<string>;
	newColumnVisibility: Record<string, boolean>;
} {
	const newExpanded = new Set(expandedGroups);
	const newVisibility = { ...columnVisibility };

	// Get all columns in this group
	const groupColumns = table.getAllColumns().filter((col) => {
		const colDef = col.columnDef as ExtendedColumnDef<TData>;
		return getGroupName(colDef) === groupName;
	});

	if (newExpanded.has(groupName)) {
		// Collapse: hide all columns except the first one
		newExpanded.delete(groupName);
		groupColumns.forEach((col, index) => {
			newVisibility[col.id] = index === 0;
		});
	} else {
		// Expand: show all columns in this group
		newExpanded.add(groupName);
		groupColumns.forEach((col) => {
			newVisibility[col.id] = true;
		});
	}

	return { newExpandedGroups: newExpanded, newColumnVisibility: newVisibility };
}
