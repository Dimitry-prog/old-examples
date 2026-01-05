import { Loading } from "@/components/common/Loading";
import { Navigation } from "@/components/common/Navigation";
import { i18n, loadCatalog } from "@/i18n";
import { detectLocale, isValidLocale, saveLocale } from "@/i18n/utils";
import { I18nProvider } from "@lingui/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/_layout")({
	// Валидация и загрузка локали
	beforeLoad: async ({ params }) => {
		const { locale } = params;

		if (!isValidLocale(locale)) {
			const defaultLocale = detectLocale();
			throw redirect({ to: "/$locale", params: { locale: defaultLocale } });
		}

		await loadCatalog(locale);
		saveLocale(locale);

		return { locale };
	},
	component: LayoutComponent,
	pendingComponent: () => <Loading message="Загрузка..." fullScreen />,
});

function LayoutComponent() {
	return (
		<I18nProvider i18n={i18n}>
			<div className="min-h-screen bg-background font-sans antialiased">
				<Navigation />
				<main>
					<Outlet />
				</main>
			</div>
		</I18nProvider>
	);
}
