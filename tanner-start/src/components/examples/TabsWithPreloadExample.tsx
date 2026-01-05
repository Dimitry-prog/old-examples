import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { preloadComponent } from "@/lib/lazyComponents";
import { useState } from "react";

/**
 * Пример использования предзагрузки в табах
 * Компоненты предзагружаются при наведении на таб
 */
export function TabsWithPreloadExample() {
	const [activeTab, setActiveTab] = useState<"forms" | "api" | "state">(
		"forms",
	);

	const tabs = [
		{
			value: "forms" as const,
			label: "Формы",
			description: "Примеры работы с формами",
			// Функция для предзагрузки компонента
			preload: () => import("@/components/examples/RegistrationFormExample"),
		},
		{
			value: "api" as const,
			label: "API",
			description: "Примеры API интеграции",
			preload: () => import("@/components/examples/ApiIntegrationExample"),
		},
		{
			value: "state" as const,
			label: "Состояние",
			description: "Управление состоянием",
			preload: () => import("@/components/examples/StateManagementExample"),
		},
	];

	const handleTabHover = (preloadFn: () => Promise<unknown>) => {
		// Предзагружаем компонент при наведении
		preloadComponent(preloadFn);
	};

	return (
		<Card>
			<CardContent className="p-6">
				<h3 className="text-lg font-semibold mb-4">Табы с предзагрузкой</h3>
				<p className="text-sm text-muted-foreground mb-6">
					Наведите на таб - компонент предзагрузится до клика!
				</p>

				{/* Табы */}
				<div className="flex gap-2 border-b mb-6">
					{tabs.map((tab) => (
						<Button
							key={tab.value}
							variant={activeTab === tab.value ? "default" : "ghost"}
							onClick={() => setActiveTab(tab.value)}
							onMouseEnter={() => handleTabHover(tab.preload)}
							onFocus={() => handleTabHover(tab.preload)}
							className="rounded-b-none"
						>
							{tab.label}
						</Button>
					))}
				</div>

				{/* Описание активного таба */}
				<div className="p-4 bg-muted rounded-lg">
					<p className="text-sm">
						{tabs.find((t) => t.value === activeTab)?.description}
					</p>
				</div>

				{/* Информация о предзагрузке */}
				<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
					<h4 className="text-sm font-semibold mb-2">💡 Как это работает:</h4>
					<ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
						<li>При наведении на таб компонент начинает загружаться</li>
						<li>При клике компонент уже готов к отображению</li>
						<li>Это улучшает воспринимаемую производительность</li>
						<li>Пользователь не видит задержки при переключении</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
