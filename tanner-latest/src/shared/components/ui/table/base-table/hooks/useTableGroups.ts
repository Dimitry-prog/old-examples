import { useState, useMemo } from "react";
import type { ExtendedColumnDef, ColumnGroup } from "../../types";

export function useTableGroups<TData>(columns: ExtendedColumnDef<TData>[]) {
	// Helper to get group name from column definition
	const getGroupName = (colDef: ExtendedColumnDef<TData>): string | null => {
		if (!colDef.group) return null;
		return typeof colDef.group === "string" ? colDef.group : colDef.group.name;
	};

	// Extract unique column groups from column definitions
	const columnGroups = useMemo(() => {
		const groupMap = new Map<string, ColumnGroup>();

		for (const col of columns) {
			const colDef = col as ExtendedColumnDef<TData>;
			if (colDef.group) {
				// Normalize group: string -> ColumnGroup object
				const group: ColumnGroup =
					typeof colDef.group === "string"
						? { name: colDef.group, collapsible: true, defaultExpanded: true }
						: {
								name: colDef.group.name,
								className: colDef.group.className,
								collapsible: colDef.group.collapsible ?? true,
								defaultExpanded: colDef.group.defaultExpanded ?? true,
							};

				// Use the first occurrence of each group
				if (!groupMap.has(group.name)) {
					groupMap.set(group.name, group);
				}
			}
		}

		return Array.from(groupMap.values());
	}, [columns]);

	// Track expanded groups
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
		const initialExpanded = new Set<string>();
		if (columnGroups) {
			for (const group of columnGroups) {
				if (group.defaultExpanded !== false) {
					initialExpanded.add(group.name);
				}
			}
		}
		return initialExpanded;
	});

	// Initialize column visibility based on collapsed groups
	const initialColumnVisibility = useMemo(() => {
		const initialVisibility: Record<string, boolean> = {};

		if (columnGroups) {
			// Group columns by group name
			const columnsByGroup = new Map<string, string[]>();

			for (const col of columns) {
				const colDef = col as ExtendedColumnDef<TData>;
				const groupName = getGroupName(colDef);
				if (groupName) {
					if (!columnsByGroup.has(groupName)) {
						columnsByGroup.set(groupName, []);
					}
					// Use accessorKey or id as column identifier
					const colId =
						"accessorKey" in colDef
							? String(colDef.accessorKey)
							: "id" in colDef
								? String(colDef.id)
								: undefined;
					if (colId) {
						columnsByGroup.get(groupName)?.push(colId);
					}
				}
			}

			// Set visibility for collapsed groups (only first column visible)
			for (const group of columnGroups) {
				if (group.defaultExpanded === false) {
					const groupCols = columnsByGroup.get(group.name) || [];
					groupCols.forEach((colId, index) => {
						initialVisibility[colId] = index === 0;
					});
				}
			}
		}

		return initialVisibility;
	}, [columns, columnGroups]);

	return {
		columnGroups,
		expandedGroups,
		setExpandedGroups,
		initialColumnVisibility,
		getGroupName,
	};
}
