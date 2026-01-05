import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

function PlaceholderPage() {
	return (
		<div className="flex items-center justify-center p-12">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-2">
					<Trans>Страница в разработке</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>Эта функция скоро будет доступна</Trans>
				</p>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/$locale/_layout/users/placeholder")({
	component: PlaceholderPage,
});
