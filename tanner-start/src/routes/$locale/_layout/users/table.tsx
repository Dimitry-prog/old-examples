import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersTableFilters } from "@/components/users/UsersTableFilters";
import { UsersTablePagination } from "@/components/users/UsersTablePagination";
import { useUsers } from "@/hooks/api/useUsers";
import { usersSearchSchema } from "@/lib/schemas/usersSchema";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";

function UsersTablePage() {
	const { locale } = useParams({ from: "/$locale/_layout/users/table" });
	const searchParams = Route.useSearch();

	// Pagination state
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: (searchParams.page || 1) - 1,
		pageSize: searchParams.pageSize || 10,
	});

	// Sorting state
	const [sorting, setSorting] = useState<SortingState>(
		searchParams.sortBy
			? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === "desc" }]
			: [],
	);

	// Prepare filters
	const filters: Record<string, string> = {};
	if (searchParams.phone) filters["phone"] = searchParams.phone;
	if (searchParams.id) filters["id"] = searchParams.id;
	if (searchParams.email) filters["email"] = searchParams.email;
	if (searchParams.firstName) filters["firstName"] = searchParams.firstName;
	if (searchParams.lastName) filters["lastName"] = searchParams.lastName;
	if (searchParams.registrationDateFrom) {
		filters["registrationDateFrom"] = searchParams.registrationDateFrom;
	}
	if (searchParams.registrationDateTo) {
		filters["registrationDateTo"] = searchParams.registrationDateTo;
	}
	if (searchParams.isInsider) filters["isInsider"] = searchParams.isInsider;
	if (searchParams.country) filters["country"] = searchParams.country;
	if (searchParams.domain) filters["domain"] = searchParams.domain;
	if (searchParams.isRealAccountCreated) {
		filters["isRealAccountCreated"] = searchParams.isRealAccountCreated;
	}
	if (searchParams.isDemoAccountCreated) {
		filters["isDemoAccountCreated"] = searchParams.isDemoAccountCreated;
	}

	// Fetch users data
	const { data, isLoading, error } = useUsers({
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		...(sorting[0]?.id && {
			sortBy: sorting[0].id,
			sortOrder: sorting[0].desc ? "desc" : "asc",
		}),
		...(Object.keys(filters).length > 0 && { filters }),
	});

	return (
		<div className="space-y-4">
			{/* Tab Navigation */}
			<div className="border-b">
				<nav className="flex space-x-4">
					<Link
						to="/$locale/users/table"
						params={{ locale }}
						search={searchParams}
						className={cn("px-4 py-2 border-b-2 border-primary")}
					>
						<Trans>Таблица пользователей</Trans>
					</Link>
					<Link
						to="/$locale/users/placeholder"
						params={{ locale }}
						className={cn("px-4 py-2 border-b-2 border-transparent")}
					>
						<Trans>В разработке</Trans>
					</Link>
				</nav>
			</div>

			{/* CREATE Button */}
			<div className="flex justify-end">
				<Button>
					<Trans>Создать</Trans>
				</Button>
			</div>

			{/* Filters */}
			<UsersTableFilters
				locale={locale}
				initialValues={{
					phone: searchParams.phone,
					id: searchParams.id,
					email: searchParams.email,
					firstName: searchParams.firstName,
					lastName: searchParams.lastName,
					registrationDateFrom: searchParams.registrationDateFrom,
					registrationDateTo: searchParams.registrationDateTo,
					isInsider: searchParams.isInsider,
					country: searchParams.country,
					domain: searchParams.domain,
					isRealAccountCreated: searchParams.isRealAccountCreated,
					isDemoAccountCreated: searchParams.isDemoAccountCreated,
				}}
			/>

			{/* Table */}
			<UsersTable
				data={data?.data || []}
				isLoading={isLoading}
				error={error}
				pagination={pagination}
				sorting={sorting}
				onPaginationChange={setPagination}
				onSortingChange={setSorting}
				locale={locale}
				totalRows={data?.total || 0}
			/>

			{/* Pagination */}
			{data && (
				<UsersTablePagination
					page={pagination.pageIndex + 1}
					pageSize={pagination.pageSize}
					total={data.total}
					locale={locale}
				/>
			)}
		</div>
	);
}

export const Route = createFileRoute("/$locale/_layout/users/table")({
	validateSearch: usersSearchSchema,
	component: UsersTablePage,
});
