import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { useCounterStore } from "@/stores/counterStore";
import {
	Bell,
	CheckCircle2,
	Minus,
	Plus,
	RotateCcw,
	Trash2,
	Undo,
} from "lucide-react";
import { useState } from "react";

/**
 * Пример управления состоянием с Zustand
 * Демонстрирует:
 * - Создание и использование Zustand store
 * - Селекторы для оптимизации рендеринга
 * - Middleware: devtools и persist
 * - Взаимодействие между компонентами через глобальное состояние
 * - Персистентность состояния в localStorage
 */
export function StateManagementExample() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">
					Управление состоянием с Zustand
				</h3>
				<p className="text-sm text-muted-foreground">
					Этот пример демонстрирует работу с глобальным состоянием через Zustand
					store. Состояние счетчика сохраняется в localStorage.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Компонент счетчика */}
				<CounterComponent />

				{/* Компонент истории */}
				<HistoryComponent />
			</div>

			{/* Компонент уведомлений */}
			<NotificationsComponent />

			{/* Технические детали */}
			<div className="rounded-lg bg-muted p-4 space-y-2">
				<h4 className="text-sm font-semibold">Технические детали:</h4>
				<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>Store: Zustand с TypeScript типизацией</li>
					<li>Middleware: devtools для отладки в Redux DevTools</li>
					<li>Middleware: persist для сохранения в localStorage</li>
					<li>Селекторы: оптимизация рендеринга через shallow compare</li>
					<li>Разделение состояния: отдельные stores для разных доменов</li>
					<li>История изменений: отслеживание предыдущих значений</li>
					<li>Автоматическое удаление: уведомления удаляются через 5 секунд</li>
				</ul>
			</div>
		</div>
	);
}

/**
 * Компонент счетчика
 * Демонстрирует базовые операции со store
 */
function CounterComponent() {
	const [customAmount, setCustomAmount] = useState(5);

	// Используем селекторы для оптимизации
	const count = useCounterStore((state) => state.count);
	const lastUpdated = useCounterStore((state) => state.lastUpdated);
	const increment = useCounterStore((state) => state.increment);
	const decrement = useCounterStore((state) => state.decrement);
	const incrementBy = useCounterStore((state) => state.incrementBy);
	const reset = useCounterStore((state) => state.reset);
	const undo = useCounterStore((state) => state.undo);
	const historyLength = useCounterStore((state) => state.history.length);

	// Добавляем уведомление при изменении
	const addNotification = useAppStore((state) => state.addNotification);

	const handleIncrement = () => {
		increment();
		addNotification({
			type: "success",
			title: "Счетчик увеличен",
			message: `Новое значение: ${count + 1}`,
		});
	};

	const handleDecrement = () => {
		decrement();
		addNotification({
			type: "info",
			title: "Счетчик уменьшен",
			message: `Новое значение: ${count - 1}`,
		});
	};

	const handleIncrementBy = () => {
		incrementBy(customAmount);
		addNotification({
			type: "success",
			title: "Счетчик изменен",
			message: `Добавлено ${customAmount}, новое значение: ${count + customAmount}`,
		});
	};

	const handleReset = () => {
		reset();
		addNotification({
			type: "warning",
			title: "Счетчик сброшен",
			message: "Значение установлено в 0",
		});
	};

	return (
		<div className="rounded-lg border p-6 space-y-4">
			<h4 className="font-semibold">Счетчик</h4>

			{/* Отображение значения */}
			<div className="text-center py-8">
				<div className="text-6xl font-bold text-primary">{count}</div>
				{lastUpdated && (
					<div className="text-sm text-muted-foreground mt-2">
						Обновлено: {lastUpdated.toLocaleTimeString()}
					</div>
				)}
			</div>

			{/* Кнопки управления */}
			<div className="grid grid-cols-2 gap-2">
				<Button onClick={handleIncrement} className="w-full">
					<Plus className="h-4 w-4 mr-2" />
					+1
				</Button>
				<Button onClick={handleDecrement} variant="outline" className="w-full">
					<Minus className="h-4 w-4 mr-2" />
					-1
				</Button>
			</div>

			{/* Кастомное увеличение */}
			<div className="flex gap-2">
				<input
					type="number"
					value={customAmount}
					onChange={(e) => setCustomAmount(Number(e.target.value))}
					className="flex-1 px-3 py-2 border rounded-md"
					min="1"
				/>
				<Button onClick={handleIncrementBy} variant="secondary">
					Добавить
				</Button>
			</div>

			{/* Дополнительные действия */}
			<div className="grid grid-cols-2 gap-2">
				<Button
					onClick={undo}
					variant="outline"
					disabled={historyLength === 0}
					className="w-full"
				>
					<Undo className="h-4 w-4 mr-2" />
					Отменить
				</Button>
				<Button onClick={handleReset} variant="destructive" className="w-full">
					<RotateCcw className="h-4 w-4 mr-2" />
					Сбросить
				</Button>
			</div>

			<div className="text-xs text-muted-foreground text-center">
				История: {historyLength}{" "}
				{historyLength === 1 ? "изменение" : "изменений"}
			</div>
		</div>
	);
}

/**
 * Компонент истории
 * Демонстрирует работу с массивами в store
 */
function HistoryComponent() {
	const history = useCounterStore((state) => state.history);
	const clearHistory = useCounterStore((state) => state.clearHistory);

	return (
		<div className="rounded-lg border p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold">История изменений</h4>
				{history.length > 0 && (
					<Button onClick={clearHistory} variant="ghost" size="sm">
						<Trash2 className="h-4 w-4 mr-2" />
						Очистить
					</Button>
				)}
			</div>

			{history.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					История пуста
				</div>
			) : (
				<div className="space-y-2 max-h-64 overflow-y-auto">
					{history.map((value, index) => (
						<div
							key={`history-${index}-${value}`}
							className="flex items-center justify-between p-2 rounded bg-muted"
						>
							<span className="text-sm text-muted-foreground">
								Шаг {index + 1}
							</span>
							<span className="font-mono font-semibold">{value}</span>
						</div>
					))}
				</div>
			)}

			<div className="text-xs text-muted-foreground">
				Всего записей: {history.length}
			</div>
		</div>
	);
}

/**
 * Компонент уведомлений
 * Демонстрирует работу с другим store и автоматическое удаление
 */
function NotificationsComponent() {
	const notifications = useAppStore((state) => state.notifications);
	const removeNotification = useAppStore((state) => state.removeNotification);
	const clearNotifications = useAppStore((state) => state.clearNotifications);

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold flex items-center">
					<Bell className="h-4 w-4 mr-2" />
					Уведомления ({notifications.length})
				</h4>
				<Button onClick={clearNotifications} variant="ghost" size="sm">
					Очистить все
				</Button>
			</div>

			<div className="space-y-2">
				{notifications.map((notification) => (
					<Alert
						key={notification.id}
						className={
							notification.type === "success"
								? "border-green-500 bg-green-50 dark:bg-green-950"
								: notification.type === "warning"
									? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
									: notification.type === "error"
										? "border-red-500 bg-red-50 dark:bg-red-950"
										: ""
						}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-start space-x-2">
								{notification.type === "success" && (
									<CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
								)}
								<div>
									<AlertTitle
										className={
											notification.type === "success"
												? "text-green-600"
												: notification.type === "warning"
													? "text-yellow-600"
													: notification.type === "error"
														? "text-red-600"
														: ""
										}
									>
										{notification.title}
									</AlertTitle>
									<AlertDescription
										className={
											notification.type === "success"
												? "text-green-600"
												: notification.type === "warning"
													? "text-yellow-600"
													: notification.type === "error"
														? "text-red-600"
														: ""
										}
									>
										{notification.message}
									</AlertDescription>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => removeNotification(notification.id)}
							>
								×
							</Button>
						</div>
					</Alert>
				))}
			</div>
		</div>
	);
}
