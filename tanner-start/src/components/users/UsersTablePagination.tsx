import { Button } from "@/components/ui/button";
import { Trans, useLingui } from "@lingui/react/macro";
import { useNavigate } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

type UsersTablePaginationProps = {
	page: number;
	pageSize: number;
	total: number;
	locale: string;
};

export function UsersTablePagination({
	page,
	pageSize,
	total,
	locale,
}: UsersTablePaginationProps) {
	const { t } = useLingui();
	const navigate = useNavigate();

	const totalPages = Math.ceil(total / pageSize);
	const startRow = (page - 1) * pageSize + 1;
	const endRow = Math.min(page * pageSize, total);

	const handlePageSizeChange = (newPageSize: number) => {
		navigate({
			to: "/$locale/users/table",
			params: { locale },
			search: (prev) => ({ ...prev, pageSize: newPageSize, page: 1 }),
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/$locale/users/table",
			params: { locale },
			search: (prev) => ({ ...prev, page: newPage }),
		});
	};

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">
					<Trans>Строк на странице:</Trans>
				</span>
				<select
					value={pageSize}
					onChange={(e) => handlePageSizeChange(Number(e.target.value))}
					className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">
					{startRow}-{endRow} <Trans>из</Trans> {total}
				</span>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(1)}
						disabled={page === 1}
						aria-label={t`Первая страница`}
					>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page - 1)}
						disabled={page === 1}
						aria-label={t`Предыдущая страница`}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(page + 1)}
						disabled={page === totalPages}
						aria-label={t`Следующая страница`}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handlePageChange(totalPages)}
						disabled={page === totalPages}
						aria-label={t`Последняя страница`}
					>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
