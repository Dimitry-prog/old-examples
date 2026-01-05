import type { TableEmptyStateProps } from "./types";

/**
 * TableEmptyState component for displaying loading and empty states
 */
export function TableEmptyState({
	isLoading,
	isEmpty,
	message = "No results found",
}: TableEmptyStateProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="flex flex-col items-center gap-2">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (isEmpty) {
		return (
			<div className="flex items-center justify-center p-8">
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
		);
	}

	return null;
}
