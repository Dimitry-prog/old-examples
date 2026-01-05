import { Button } from "@/components/ui/button";
import type { User } from "@/types/users";
import { Trans } from "@lingui/react/macro";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { UsersTableActions } from "./UsersTableActions";

/**
 * Функция для форматирования даты с учетом локали
 */
export function formatDate(dateString: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(dateString));
}

/**
 * Создание определений колонок таблицы пользователей
 */
export function createUsersTableColumns(locale: string): ColumnDef<User>[] {
	return [
		{
			accessorKey: "phone",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Телефон</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("phone")}</div>,
		},
		{
			accessorKey: "id",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>ID</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("id")}</div>,
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Email</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<a
					href={`mailto:${row.getValue("email")}`}
					className="text-blue-600 hover:underline"
				>
					{row.getValue("email")}
				</a>
			),
		},
		{
			accessorKey: "firstName",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Имя</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
		},
		{
			accessorKey: "lastName",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Фамилия</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
		},
		{
			accessorKey: "registrationDate",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Дата регистрации</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div>{formatDate(row.getValue("registrationDate"), locale)}</div>
			),
		},
		{
			accessorKey: "isInsider",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Инсайдер</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("isInsider")}</div>,
		},
		{
			accessorKey: "country",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Страна</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("country")}</div>,
		},
		{
			accessorKey: "domain",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Домен</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("domain")}</div>,
		},
		{
			accessorKey: "isRealAccountCreated",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Реальный аккаунт</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("isRealAccountCreated")}</div>,
		},
		{
			accessorKey: "isDemoAccountCreated",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<Trans>Демо аккаунт</Trans>
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("isDemoAccountCreated")}</div>,
		},
		{
			id: "actions",
			header: () => <Trans>Действия</Trans>,
			cell: ({ row }) => {
				return <UsersTableActions user={row.original} />;
			},
		},
	];
}
