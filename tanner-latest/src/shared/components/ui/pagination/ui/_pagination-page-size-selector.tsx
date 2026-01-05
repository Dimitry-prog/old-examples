export type PaginationPageSizeSelectorProps = {
	pageSize: number;
	pageSizeOptions: number[];
	onPageSizeChange: (size: number) => void;
};

/**
 * Component for selecting pagination page size
 * @internal - Do not import directly, use Pagination component
 */
export const _PaginationPageSizeSelector = ({
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
}: PaginationPageSizeSelectorProps) => {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-gray-700">Items per page:</span>
			<select
				value={pageSize}
				onChange={(e) => onPageSizeChange(Number(e.target.value))}
				className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{pageSizeOptions.map((size) => (
					<option key={size} value={size}>
						{size}
					</option>
				))}
			</select>
		</div>
	);
};
