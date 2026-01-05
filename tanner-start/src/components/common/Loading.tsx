import { Trans } from "@lingui/react/macro";

interface LoadingProps {
	message?: string;
	size?: "sm" | "md" | "lg";
	fullScreen?: boolean;
}

export function Loading({
	message,
	size = "md",
	fullScreen = false,
}: LoadingProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	const containerClasses = fullScreen
		? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
		: "flex items-center justify-center p-8";

	return (
		<div className={containerClasses}>
			<div className="text-center">
				<div
					className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-2 ${sizeClasses[size]}`}
				/>
				<p className="text-muted-foreground text-sm">
					{message || <Trans>Загрузка...</Trans>}
				</p>
			</div>
		</div>
	);
}
