import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { _useDropdown } from "../hooks/_use-dropdown";
import type { PageItem } from "../hooks/_use-pagination-pages";

export type PaginationControlsProps = {
	currentPage: number;
	totalPages: number;
	pageNumbers: PageItem[];
	showPageNumbers: boolean;
	onPageChange: (page: number) => void;
	getDropdownPages: (type: "start" | "end") => number[];
};

/**
 * Component for rendering pagination navigation controls
 * @internal - Do not import directly, use Pagination component
 */
export const _PaginationControls = ({
	currentPage,
	totalPages,
	pageNumbers,
	showPageNumbers,
	onPageChange,
	getDropdownPages,
}: PaginationControlsProps) => {
	const { isOpen, toggle, close, dropdownRef } = _useDropdown<
		"start" | "end"
	>();

	return (
		<div className="flex items-center gap-2">
			{/* Page info */}
			<span className="text-sm text-gray-700 mr-4">
				Page {currentPage} of {totalPages}
			</span>

			{/* First page */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(1)}
				disabled={currentPage === 1}
				className="h-8 w-8 p-0"
			>
				<ChevronsLeft className="h-4 w-4" />
			</Button>

			{/* Previous page */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="h-8 w-8 p-0"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{/* Page numbers */}
			{showPageNumbers && (
				<div className="flex items-center gap-1" ref={dropdownRef}>
					{pageNumbers.map((page) => {
						if (page === "ellipsis-start" || page === "ellipsis-end") {
							const type = page === "ellipsis-start" ? "start" : "end";
							const dropdownPages = getDropdownPages(type);
							const dropdownOpen = isOpen(type);

							return (
								<div key={`ellipsis-${type}`} className="relative">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										onClick={() => toggle(type)}
									>
										<MoreHorizontal className="h-4 w-4" />
									</Button>

									{dropdownOpen && dropdownPages.length > 0 && (
										<div className="absolute top-full mt-1 z-50 min-w-[80px] rounded-md border border-gray-200 bg-white shadow-lg">
											<div className="max-h-[200px] overflow-y-auto py-1">
												{dropdownPages.map((p) => (
													<button
														key={p}
														type="button"
														onClick={() => {
															onPageChange(p);
															close();
														}}
														className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
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
								onClick={() => onPageChange(page as number)}
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
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="h-8 w-8 p-0"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			{/* Last page */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(totalPages)}
				disabled={currentPage === totalPages}
				className="h-8 w-8 p-0"
			>
				<ChevronsRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
