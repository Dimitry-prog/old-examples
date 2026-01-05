import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, useParams } from "@tanstack/react-router";

interface DashboardData {
	stats: {
		totalUsers: number;
		activeUsers: number;
		totalRevenue: number;
		growthRate: number;
	};
}

async function loadDashboardData(): Promise<DashboardData> {
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		stats: {
			totalUsers: 1234,
			activeUsers: 89,
			totalRevenue: 45678,
			growthRate: 12.5,
		},
	};
}

function DashboardPage() {
	const { stats } = Route.useLoaderData();
	const { locale } = useParams({
		from: "/$locale/_layout/_authenticated/dashboard",
	});

	return (
		<DashboardLayout
			title={<Trans>Панель управления</Trans>}
			subtitle={<Trans>Добро пожаловать в защищенную область приложения</Trans>}
			actions={
				<>
					<Button variant="outline" size="sm">
						<Trans>Экспорт</Trans>
					</Button>
					<Button size="sm">
						<Trans>Создать отчет</Trans>
					</Button>
				</>
			}
		>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								<Trans>Всего пользователей</Trans>
							</p>
							<p className="mt-2 text-3xl font-bold">
								{stats.totalUsers.toLocaleString()}
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
							<span className="text-2xl">👥</span>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								<Trans>Активные пользователи</Trans>
							</p>
							<p className="mt-2 text-3xl font-bold">{stats.activeUsers}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
							<span className="text-2xl">🟢</span>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								<Trans>Доход</Trans>
							</p>
							<p className="mt-2 text-3xl font-bold">
								${stats.totalRevenue.toLocaleString()}
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
							<span className="text-2xl">💰</span>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								<Trans>Рост</Trans>
							</p>
							<p className="mt-2 text-3xl font-bold text-green-600">
								+{stats.growthRate}%
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
							<span className="text-2xl">📈</span>
						</div>
					</div>
				</Card>
			</div>
		</DashboardLayout>
	);
}

export const Route = createFileRoute(
	"/$locale/_layout/_authenticated/dashboard",
)({
	// Проверка прав доступа перед загрузкой маршрута
	beforeLoad: createPermissionGuard([
		"/api.manager.dashboard.view",
		"/api.manager.dashboard.stats",
	]),
	loader: loadDashboardData,
	component: DashboardPage,
});
