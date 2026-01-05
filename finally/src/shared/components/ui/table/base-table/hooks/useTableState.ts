import { useState } from "react";
import type {
	SortingState,
	ColumnFiltersState,
	VisibilityState,
} from "@tanstack/react-table";

export function useTableState() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	return {
		sorting,
		setSorting,
		columnFilters,
		setColumnFilters,
		columnVisibility,
		setColumnVisibility,
	};
}
