/**
 * Demo page showcasing all table features with mock data
 */

import { useState } from "react";
import { TableData } from "./table-data";
import { TableDataInfinite } from "./table-data-infinite";
import { BaseTable } from "./base-table";
import type { ExtendedColumnDef, FetchParams } from "./types";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "../pagination";
import { ThemeSwitcher } from "../theme-switcher";

// Mock data types
type Product = {
	id: number;
	name: string;
	category: string;
	price: number;
	stock: number;
	status: "available" | "low-stock" | "out-of-stock";
	supplier: string;
	lastUpdated: string;
	rating: number;
};

// Mock data generator
const generateMockProducts = (count: number, offset = 0): Product[] => {
	const categories = ["Electronics", "Clothing", "Food", "Books", "Toys"];
	const suppliers = ["Supplier A", "Supplier B", "Supplier C", "Supplier D"];

	return Array.from({ length: count }, (_, i) => {
		const id = offset + i + 1;
		const stock = Math.floor(Math.random() * 200);
		const status: Product["status"] =
			stock === 0 ? "out-of-stock" : stock < 20 ? "low-stock" : "available";

		return {
			id,
			name: `Product ${id}`,
			category: categories[Math.floor(Math.random() * categories.length)],
			price: Number.parseFloat((Math.random() * 1000 + 10).toFixed(2)),
			stock,
			status,
			supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
			lastUpdated: new Date(
				Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
			).toISOString(),
			rating: Number.parseFloat((Math.random() * 5).toFixed(1)),
		};
	});
};

// Mock API response
const mockProducts = generateMockProducts(100);

// Mock fetch function with delay
const fetchProducts = async (
	params: FetchParams,
): Promise<{ data: { items: Product[]; count: number } }> => {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const { skip, take } = params;
	const items = mockProducts.slice(skip, skip + take);
	const count = mockProducts.length;

	return {
		data: {
			items,
			count,
		},
	};
};

export function TableDemoPage() {
	const [refetchTrigger, setRefetchTrigger] = useState(0);

	// Column definitions with all features
	const columns: ExtendedColumnDef<Product>[] = [
		{
			accessorKey: "id",
			header: "ID",
			className: "w-20 text-center font-mono",
			headerClassName: "text-center",
		},
		{
			accessorKey: "name",
			header: "Product Name",
			headerClassName: "font-bold",
			className: "font-medium",
		},
		{
			accessorKey: "category",
			header: "Category",
			group: "Product Info", // Упрощенный формат!
			cell: ({ getValue }) => {
				const category = getValue() as string;
				const colors: Record<string, string> = {
					Electronics: "bg-purple-100 text-purple-800",
					Clothing: "bg-pink-100 text-pink-800",
					Food: "bg-green-100 text-green-800",
					Books: "bg-blue-100 text-blue-800",
					Toys: "bg-yellow-100 text-yellow-800",
				};
				return (
					<span
						className={`px-2 py-1 rounded-full text-xs ${colors[category]}`}
					>
						{category}
					</span>
				);
			},
		},
		{
			accessorKey: "price",
			header: "Price",
			group: "Product Info", // Та же группа
			cell: ({ getValue }) => {
				const price = getValue() as number;
				return `$${price.toFixed(2)}`;
			},
			className: "text-right font-mono",
			headerClassName: "text-right",
			getCellClassName: (value) => {
				const price = value as number;
				if (price > 500) return "text-red-600 font-bold";
				if (price > 200) return "text-orange-600";
				return "text-green-600";
			},
		},
		{
			accessorKey: "stock",
			header: "Stock",
			group: "Inventory",
			cell: ({ getValue }) => {
				const stock = getValue() as number;
				return stock.toLocaleString();
			},
			className: "text-right font-mono",
			headerClassName: "text-right",
		},
		{
			accessorKey: "status",
			header: "Status",
			group: "Inventory",
			cell: ({ getValue }) => {
				const status = getValue() as Product["status"];
				const statusConfig = {
					available: { label: "Available", color: "bg-green-500" },
					"low-stock": { label: "Low Stock", color: "bg-yellow-500" },
					"out-of-stock": { label: "Out of Stock", color: "bg-red-500" },
				};
				const config = statusConfig[status];
				return (
					<div className="flex items-center gap-2">
						<div className={`w-2 h-2 rounded-full ${config.color}`} />
						<span className="text-sm">{config.label}</span>
					</div>
				);
			},
			getCellClassName: (value) => {
				const status = value as Product["status"];
				if (status === "out-of-stock") return "bg-red-50";
				if (status === "low-stock") return "bg-yellow-50";
				return "";
			},
		},
		{
			accessorKey: "supplier",
			header: "Supplier",
			group: { name: "Additional Info", defaultExpanded: false }, // Свернута по умолчанию
		},
		{
			accessorKey: "rating",
			header: "Rating",
			group: { name: "Additional Info", defaultExpanded: false },
			cell: ({ getValue }) => {
				const rating = getValue() as number;
				return (
					<div className="flex items-center gap-1">
						<span className="text-yellow-500">★</span>
						<span>{rating.toFixed(1)}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "lastUpdated",
			header: "Last Updated",
			group: { name: "Additional Info", defaultExpanded: false },
			cell: ({ getValue }) => {
				const date = new Date(getValue() as string);
				return date.toLocaleDateString();
			},
			className: "text-sm text-gray-600",
		},
	];

	// Simple columns without groups
	const simpleColumns: ExtendedColumnDef<Product>[] = [
		{
			accessorKey: "id",
			header: "ID",
			className: "w-20 text-center font-mono",
		},
		{
			accessorKey: "name",
			header: "Product Name",
			className: "font-medium",
		},
		{
			accessorKey: "category",
			header: "Category",
		},
		{
			accessorKey: "price",
			header: "Price",
			cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
			className: "text-right",
		},
		{
			accessorKey: "stock",
			header: "Stock",
			cell: ({ getValue }) => (getValue() as number).toLocaleString(),
			className: "text-right",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ getValue }) => {
				const status = getValue() as Product["status"];
				const statusConfig = {
					available: { label: "Available", color: "bg-green-500" },
					"low-stock": { label: "Low Stock", color: "bg-yellow-500" },
					"out-of-stock": { label: "Out of Stock", color: "bg-red-500" },
				};
				const config = statusConfig[status];
				return (
					<div className="flex items-center gap-2">
						<div className={`w-2 h-2 rounded-full ${config.color}`} />
						<span className="text-sm">{config.label}</span>
					</div>
				);
			},
		},
	];

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Table Demo</h1>
					<p className="text-muted-foreground">
						Демонстрация всех возможностей таблицы с моковыми данными
					</p>
				</div>
				<ThemeSwitcher />
			</div>

			<div className="bg-card rounded-lg shadow p-4 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Features:</h2>
					<Button onClick={() => setRefetchTrigger((prev) => prev + 1)}>
						Refresh Data
					</Button>
				</div>
				<ul className="grid grid-cols-2 gap-2 text-sm text-card-foreground">
					<li>✓ Pagination with URL sync</li>
					<li>✓ Sorting</li>
					<li>✓ Column grouping (collapsible)</li>
					<li>✓ Dynamic cell styling</li>
					<li>✓ Sticky header</li>
					<li>✓ Custom cell renderers</li>
					<li>✓ Row separators</li>
					<li>✓ Loading states</li>
				</ul>
			</div>

			{/* Table 1: With column groups and pagination */}
			<div className="space-y-3">
				<div className="space-y-1">
					<h2 className="text-2xl font-bold">Table 1: With Column Groups</h2>
					<p className="text-sm text-muted-foreground">
						Таблица с группировкой колонок и пагинацией
					</p>
				</div>
				<div className="bg-card rounded-lg shadow">
					<TableData
						name="products"
						columns={columns}
						fetchData={fetchProducts}
						pageSize={10}
						pageSizeOptions={[5, 10, 20, 50]}
						stickyHeader
						maxHeight="600px"
						refetchTrigger={refetchTrigger}
						getRowClassName={(row, index) => {
							if (row.status === "out-of-stock") return "opacity-60";
							if (index % 2 === 0) return "bg-muted/50";
							return "";
						}}
						rowSeparators={(_row, index) => {
							// Add separator after every 5 rows
							if ((index + 1) % 5 === 0) {
								return {
									height: 8,
									className: "bg-border",
								};
							}
							return null;
						}}
					/>
				</div>
			</div>
			<Pagination
				name="test"
				totalItems={mockProducts.length}
				from="/demo/table"
			/>
			{/* Table 2: Simple without groups */}
			<div className="space-y-3">
				<div className="space-y-1">
					<h2 className="text-2xl font-bold">Table 2: Simple Without Groups</h2>
					<p className="text-sm text-muted-foreground">
						Простая таблица без группировки колонок с клиентской пагинацией
					</p>
				</div>
				<div className="bg-card rounded-lg shadow">
					<BaseTable
						name="simple-products"
						columns={simpleColumns}
						data={mockProducts.slice(0, 50)}
						pageSize={10}
						pageSizeOptions={[10, 20, 50]}
						stickyHeader
						maxHeight="500px"
					/>
				</div>
			</div>

			{/* Table 3: Infinite scroll */}
			<div className="space-y-3">
				<div className="space-y-1">
					<h2 className="text-2xl font-bold">Table 3: Infinite Scroll</h2>
					<p className="text-sm text-muted-foreground">
						Таблица с бесконечной прокруткой (загрузка данных при скролле)
					</p>
				</div>
				<div className="bg-card rounded-lg shadow">
					<TableDataInfinite
						name="infinite-products"
						columns={simpleColumns}
						fetchData={fetchProducts}
						pageSize={20}
						maxHeight="500px"
						stickyHeader
					/>
				</div>
			</div>
		</div>
	);
}
