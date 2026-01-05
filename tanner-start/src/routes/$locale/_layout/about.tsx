import { MainLayout } from "@/components/layouts";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

function AboutPage() {
	return (
		<MainLayout>
			<section className="bg-gradient-to-b from-background to-muted/20 py-20">
				<div className="container">
					<div className="mx-auto max-w-3xl text-center">
						<h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
							<Trans>О проекте</Trans>
						</h1>
						<p className="text-xl text-muted-foreground">
							<Trans>
								Современный React стартовый шаблон с лучшими практиками
								разработки, полной типобезопасностью и готовой инфраструктурой
							</Trans>
						</p>
					</div>
				</div>
			</section>
		</MainLayout>
	);
}

export const Route = createFileRoute("/$locale/_layout/about")({
	component: AboutPage,
});
