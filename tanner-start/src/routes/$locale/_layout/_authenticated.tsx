import { AuthGuard } from "@/components/guards/RouteGuard";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { useAuthStore } from "@/stores/authStore";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/_layout/_authenticated")({
	beforeLoad: ({ location, params }) => {
		const { isAuthenticated } = useAuthStore.getState();
		const { locale } = params;

		if (!isAuthenticated) {
			throw redirect({
				to: "/$locale/_layout/login",
				params: { locale },
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: () => (
		<AuthGuard>
			<AuthenticatedLayout>
				<Outlet />
			</AuthenticatedLayout>
		</AuthGuard>
	),
});
