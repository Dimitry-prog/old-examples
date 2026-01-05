import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { User } from "@/types/users";
import { Trans } from "@lingui/react/macro";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { createUsersTableColumns } from "./UsersTableColumns";

type UsersTableProps = {
	data: User[];
	isLoading: boolean;
	error: Error | null;
	pagination: PaginationState;
	sorting: SortingState;
	onPaginationChange: OnChangeFn<PaginationState>;
	onSortingChange: OnChangeFn<SortingState>;
	locale: string;
	totalRows: number;
};

export function UsersTable({
	data,
	isLoading,
	error,
	pagination,
	sorting,
	onPaginationChange,
	onSortingChange,
	locale,
	totalRows,
}: UsersTableProps) {
	const columns = createUsersTableColumns(locale);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true,
		manualSorting: true,
		pageCount: Math.ceil(totalRows / pagination.pageSize),
		state: {
			pagination,
			sorting,
		},
		onPaginationChange,
		onSortingChange,
	});

	// Loading state
	if (isLoading) {
		return (
			<div className="flex justify-center items-center p-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>
					<Trans>Ошибка загрузки данных</Trans>
				</AlertTitle>
				<AlertDescription>{error.message}</AlertDescription>
			</Alert>
		);
	}

	// Empty state
	if (data.length === 0) {
		return (
			<div className="text-center p-8 text-muted-foreground">
				<Trans>Пользователи не найдены</Trans>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
