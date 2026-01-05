/**
 * Example usage of the Table component
 * This file demonstrates how to use the new shadcn/ui + @tanstack/react-table component
 */

import { Table, type ExtendedColumnDef } from "./index";

type User = {
	id: number;
	name: string;
	email: string;
	role: string;
	status: "active" | "inactive";
};

const sampleData: User[] = [
	{
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		role: "Admin",
		status: "active",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane@example.com",
		role: "User",
		status: "active",
	},
	{
		id: 3,
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "User",
		status: "inactive",
	},
];

export function TableExample() {
	const columns: ExtendedColumnDef<User>[] = [
		{
			accessorKey: "id",
			header: "ID",
			className: "w-20",
		},
		{
			accessorKey: "name",
			header: "Name",
			headerClassName: "font-bold",
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "role",
			header: "Role",
			group: {
				name: "User Info",
				collapsible: true,
				defaultExpanded: true,
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ getValue }) => {
				const status = getValue() as string;
				return (
					<span
						className={
							status === "active"
								? "text-green-600 font-semibold"
								: "text-red-600 font-semibold"
						}
					>
						{status}
					</span>
				);
			},
			getCellClassName: (value) => {
				return value === "active" ? "bg-green-50" : "bg-red-50";
			},
		},
	];

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Table Example</h1>
			<Table
				name="users"
				columns={columns}
				data={sampleData}
				stickyHeader
				maxHeight="400px"
				rowClassName="hover:bg-gray-50"
				getRowClassName={(row) => {
					return row.status === "inactive" ? "opacity-50" : "";
				}}
			/>
		</div>
	);
}
