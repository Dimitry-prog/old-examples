import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ApiIntegrationExample,
	RegistrationFormExample,
	StateManagementExample,
} from "@/lib/lazyComponents";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";

export const Route = createFileRoute("/$locale/_layout/_authenticated/examples")({
	component: ExamplesPage,
});

type TabValue = "forms" | "api" | "state";

function ExamplesPage() {
	const [activeTab, setActiveTab] = useState<TabValue>("forms");

	const tabs = [
		{ value: "forms" as const, label: "Формы с валидацией" },
		{ value: "api" as const, label: "API интеграция" },
		{ value: "state" as const, label: "Управление состоянием" },
	]

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Примеры использования
				</h1>
				<p className="text-muted-foreground mt-2">
					Демонстрация ключевых возможностей стека: формы с валидацией, API
					интеграция и управление состоянием
				</p>
			</div>

			<div className="flex gap-2 border-b">
				{tabs.map((tab) => (
					<Button
						key={tab.value}
						variant={activeTab === tab.value ? "default" : "ghost"}
						onClick={() => setActiveTab(tab.value)}
						className="rounded-b-none"
					>
						{tab.label}
					</Button>
				))}
			</div>

			<div className="space-y-4">
				<Suspense fallback={<Loading message="Загрузка примера..." />}>
					{activeTab === "forms" && (
						<Card>
							<CardHeader>
								<CardTitle>Формы с Zod валидацией</CardTitle>
								<CardDescription>
									Пример использования React Hook Form с Zod схемами и shadcn/ui
									компонентами
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RegistrationFormExample />
							</CardContent>
						</Card>
					)}

					{activeTab === "api" && (
						<Card>
							<CardHeader>
								<CardTitle>API интеграция</CardTitle>
								<CardDescription>
									Пример использования TanStack Query с Ky для работы с API
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ApiIntegrationExample />
							</CardContent>
						</Card>
					)}

					{activeTab === "state" && (
						<Card>
							<CardHeader>
								<CardTitle>Управление состоянием</CardTitle>
								<CardDescription>
									Пример использования Zustand для глобального состояния
								</CardDescription>
							</CardHeader>
							<CardContent>
								<StateManagementExample />
							</CardContent>
						</Card>
					)}
				</Suspense>
			</div>
		</div>
	)
}
