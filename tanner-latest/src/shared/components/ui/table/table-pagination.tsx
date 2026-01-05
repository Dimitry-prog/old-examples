import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { TablePaginationProps } from "./types";

/**
 * TablePagination component for advanced pagination controls
 * Features:
 * - First/Last page buttons
 * - Previous/Next buttons
 * - Page numbers with ellipsis
 * - Page size selector
 * - URL-based state management
 * - Can work with or without TanStack Table
 */
export function TablePagination({
	table,
	name,
	totalItems,
	pageSizeOptions = [10, 20, 50, 100],
	showPageNumbers = true,
	onPageChange,
}: TablePaginationProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const [openDropdown, setOpenDropdown] = useState<"start" | "end" | null>(
		null,
	);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Read current state from URL
	const pageParam = search[name] as string | undefined;
	const [skip, take] = pageParam?.split("-").map(Number) ?? [
		0,
		pageSizeOptions[0],
	];
	const currentPage = Math.floor(skip / take) + 1;
	const pageSize = take;

	// Calculate total pages from table or totalItems
	const totalPages = table
		? table.getPageCount()
		: totalItems
			? Math.ceil(totalItems / pageSize)
			: 0;

	// Don't render if no pages or invalid state
	if (totalPages <= 1 || totalPages === Infinity || Number.isNaN(totalPages)) {
		return null;
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpenDropdown(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const goToPage = (page: number) => {
		const newSkip = (page - 1) * pageSize;

		navigate({
			search: (prev: Record<string, unknown>) => ({
				...prev,
				[name]: `${newSkip}-${pageSize}`,
			}),
			resetScroll: false,
		} as never);

		onPageChange?.(page, pageSize);
	};

	const changePageSize = (newSize: number) => {
		navigate({
			search: (prev: Record<string, unknown>) => ({
				...prev,
				[name]: `0-${newSize}`,
			}),
			resetScroll: false,
		} as never);

		onPageChange?.(1, newSize);
	};

	// Generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
		const showPages = 5; // Number of page buttons to show

		// Safety check
		if (totalPages <= 0 || !Number.isFinite(totalPages)) {
			return pages;
		}

		if (totalPages <= showPages + 2) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis-start");
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("ellipsis-end");
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	// Get pages for dropdown
	const getDropdownPages = (type: "start" | "end") => {
		const pages: number[] = [];

		// Safety check
		if (totalPages <= 0) return pages;

		if (type === "start") {
			// Pages between 1 and current visible range
			const start = 2;
			const end = Math.max(1, currentPage - 2);
			if (end >= start && end <= totalPages) {
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
			}
		} else {
			// Pages between current visible range and last
			const start = Math.min(totalPages, currentPage + 2);
			const end = totalPages - 1;
			if (end >= start && start > 0 && end <= totalPages) {
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
			}
		}
		return pages;
	};

	return (
		<div className="flex items-center justify-between px-2 py-4">
			{/* Left side - Page size selector */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Rows per page:</span>
				<select
					value={pageSize}
					onChange={(e) => changePageSize(Number(e.target.value))}
					className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				>
					{pageSizeOptions.map((size) => (
						<option key={size} value={size}>
							{size}
						</option>
					))}
				</select>
			</div>

			{/* Right side - Navigation */}
			<div className="flex items-center gap-2">
				{/* Page info */}
				<span className="text-sm text-foreground mr-4">
					Page {currentPage} of {totalPages}
				</span>

				{/* First page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => goToPage(1)}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				{/* Previous page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Page numbers */}
				{showPageNumbers && (
					<div className="flex items-center gap-1" ref={dropdownRef}>
						{getPageNumbers().map((page) => {
							if (page === "ellipsis-start" || page === "ellipsis-end") {
								const type = page === "ellipsis-start" ? "start" : "end";
								const dropdownPages = getDropdownPages(type);
								const isOpen = openDropdown === type;

								return (
									<div key={`ellipsis-${type}`} className="relative">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											onClick={() => setOpenDropdown(isOpen ? null : type)}
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>

										{isOpen && dropdownPages.length > 0 && (
											<div className="absolute top-full mt-1 z-50 min-w-[80px] rounded-md border border-border bg-popover shadow-lg">
												<div className="max-h-[200px] overflow-y-auto py-1">
													{dropdownPages.map((p) => (
														<button
															key={p}
															type="button"
															onClick={() => {
																goToPage(p);
																setOpenDropdown(null);
															}}
															className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent focus:bg-accent focus:outline-none"
														>
															Page {p}
														</button>
													))}
												</div>
											</div>
										)}
									</div>
								);
							}

							return (
								<Button
									key={page}
									variant={currentPage === page ? "default" : "outline"}
									size="sm"
									onClick={() => goToPage(page as number)}
									className="h-8 w-8 p-0"
								>
									{page}
								</Button>
							);
						})}
					</div>
				)}

				{/* Next page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => goToPage(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				{/* Last page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => goToPage(totalPages)}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
