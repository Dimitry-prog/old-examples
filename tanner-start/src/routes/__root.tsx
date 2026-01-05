import { detectLocale } from "@/i18n/utils";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	// Редирект на локализованный URL при заходе на корень
	beforeLoad: ({ location }) => {
		if (location.pathname === "/") {
			const locale = detectLocale();
			throw redirect({ to: "/$locale", params: { locale } });
		}
	},
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
