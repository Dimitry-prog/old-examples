import { useGetUsersQuery } from "@/shared/api/users-api";
import {
	handleRtkError,
	handleCommonErrors,
	isErrorStatus,
	isErrorStatusIn,
	useErrorHandler,
	getErrorMessage,
} from "@/shared/utils/handle-rtk-error";

/**
 * Примеры использования утилит для обработки ошибок
 */

// ============================================
// Пример 1: Базовое использование handleRtkError
// ============================================
export function Example1_BasicHandling() {
	const { data, error, isLoading } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Простая обработка с любыми статусами
	if (error) {
		return handleRtkError(error, {
			403: () => <div className="text-red-600">Нет доступа</div>,
			404: () => <div className="text-yellow-600">Не найдено</div>,
			422: () => <div className="text-orange-600">Неверные данные</div>,
			500: () => <div className="text-red-800">Ошибка сервера</div>,
			default: () => <div className="text-red-600">Произошла ошибка</div>,
		});
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 2: Использование handleCommonErrors
// ============================================
export function Example2_CommonErrors() {
	const { data, error, isLoading } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Автоматическая обработка с дефолтными сообщениями
	if (error) {
		return handleCommonErrors(error);
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 3: handleCommonErrors с кастомными сообщениями
// ============================================
export function Example3_CustomMessages() {
	const { data, error, isLoading } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Переопределяем только нужные сообщения
	if (error) {
		return handleCommonErrors(error, {
			403: "Доступ запрещен. Обратитесь к администратору",
			404: "Пользователи не найдены",
		});
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 4: Проверка конкретного статуса
// ============================================
export function Example4_StatusCheck() {
	const { data, error, isLoading } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Проверяем конкретный статус
	if (isErrorStatus(error, 403)) {
		return (
			<div className="p-4 bg-red-100 border border-red-400 rounded">
				<h3 className="font-bold">Доступ запрещен</h3>
				<p>У вас нет прав для просмотра этой страницы</p>
				<button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
					Запросить доступ
				</button>
			</div>
		);
	}

	if (isErrorStatus(error, 404)) {
		return <div>Пользователи не найдены</div>;
	}

	if (error) {
		return <div>Ошибка: {getErrorMessage(error)}</div>;
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 5: Проверка нескольких статусов
// ============================================
export function Example5_MultipleStatuses() {
	const { data, error, isLoading } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Проверяем несколько статусов сразу
	if (isErrorStatusIn(error, [403, 404])) {
		return (
			<div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
				<p>Ресурс недоступен или не найден</p>
				<button
					onClick={() => window.history.back()}
					className="mt-2 px-4 py-2 bg-gray-500 text-white rounded"
				>
					Назад
				</button>
			</div>
		);
	}

	if (error) {
		return <div>Ошибка: {getErrorMessage(error)}</div>;
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 6: Использование useErrorHandler (рекомендуется!)
// ============================================
export function Example6_UseErrorHandler() {
	const { data, isLoading, error } = useGetUsersQuery();
	const errorHandler = useErrorHandler(error);

	if (isLoading) return <div>Загрузка...</div>;

	// Самый удобный способ!
	if (errorHandler.hasError) {
		return errorHandler.render({
			403: () => (
				<div className="p-4 bg-red-100 rounded">
					<h3 className="font-bold">Нет доступа</h3>
					<p>{errorHandler.message}</p>
				</div>
			),
			404: () => <div>Не найдено</div>,
			default: () => <div>Ошибка: {errorHandler.message}</div>,
		});
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 7: useErrorHandler с проверками
// ============================================
export function Example7_ErrorHandlerChecks() {
	const { data, isLoading, error } = useGetUsersQuery();
	const errorHandler = useErrorHandler(error);

	if (isLoading) return <div>Загрузка...</div>;

	// Используем методы проверки
	if (errorHandler.is(403)) {
		return <div>Доступ запрещен (статус: {errorHandler.status})</div>;
	}

	if (errorHandler.isIn([404, 410])) {
		return <div>Ресурс не найден или удален</div>;
	}

	if (errorHandler.hasError) {
		return <div>Ошибка: {errorHandler.message}</div>;
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 8: useErrorHandler с renderCommon
// ============================================
export function Example8_ErrorHandlerCommon() {
	const { data, isLoading, error } = useGetUsersQuery();
	const errorHandler = useErrorHandler(error);

	if (isLoading) return <div>Загрузка...</div>;

	// Используем готовые сообщения
	if (errorHandler.hasError) {
		return errorHandler.renderCommon({
			403: "Эта страница доступна только администраторам",
			404: "Список пользователей пуст",
		});
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 9: Комбинированная обработка
// ============================================
export function Example9_Combined() {
	const { data, isLoading, error } = useGetUsersQuery();
	const errorHandler = useErrorHandler(error);

	if (isLoading) return <div>Загрузка...</div>;

	// Специальная обработка для 403
	if (errorHandler.is(403)) {
		return (
			<div className="p-6 bg-red-50 rounded-lg">
				<h2 className="text-xl font-bold text-red-800 mb-2">Доступ запрещен</h2>
				<p className="text-red-600 mb-4">{errorHandler.message}</p>
				<div className="flex gap-2">
					<button className="px-4 py-2 bg-blue-500 text-white rounded">
						Запросить доступ
					</button>
					<button
						onClick={() => window.history.back()}
						className="px-4 py-2 bg-gray-500 text-white rounded"
					>
						Назад
					</button>
				</div>
			</div>
		);
	}

	// Для остальных ошибок используем общую обработку
	if (errorHandler.hasError) {
		return errorHandler.renderCommon();
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 10: Inline обработка (самый короткий вариант)
// ============================================
export function Example10_Inline() {
	const { data, isLoading, error } = useGetUsersQuery();

	if (isLoading) return <div>Загрузка...</div>;

	// Одна строка для обработки всех ошибок!
	if (error) return handleCommonErrors(error);

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}

// ============================================
// Пример 11: С компонентами
// ============================================

// Отдельные компоненты для ошибок
const AccessDenied = () => (
	<div className="p-6 bg-red-50 rounded-lg">
		<h2 className="text-xl font-bold text-red-800">Доступ запрещен</h2>
		<p className="text-red-600">У вас нет прав для просмотра этой страницы</p>
	</div>
);

const NotFound = () => (
	<div className="p-6 bg-yellow-50 rounded-lg">
		<h2 className="text-xl font-bold text-yellow-800">Не найдено</h2>
		<p className="text-yellow-600">Запрашиваемый ресурс не найден</p>
	</div>
);

export function Example11_WithComponents() {
	const { data, isLoading, error } = useGetUsersQuery();
	const errorHandler = useErrorHandler(error);

	if (isLoading) return <div>Загрузка...</div>;

	if (errorHandler.hasError) {
		return errorHandler.render({
			403: () => <AccessDenied />,
			404: () => <NotFound />,
			default: () => <div>Ошибка: {errorHandler.message}</div>,
		});
	}

	return (
		<div>
			{data?.map((user) => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}
