import { useGetUserByIdQuery } from "@/shared/api/users-api";
import { Navigate } from "@tanstack/react-router";

/**
 * Пример компонента с обработкой различных статусов ошибок
 */
export function UserProfileExample({ userId }: { userId: number }) {
	const { data: user, error, isLoading } = useGetUserByIdQuery(userId);

	if (isLoading) {
		return <div className="p-4">Загрузка профиля...</div>;
	}

	// Обработка ошибок
	if (error && "status" in error) {
		const status = error.status;

		// 401 - обрабатывается в middleware (автоматический редирект)
		// Но можем показать сообщение перед редиректом
		if (status === 401) {
			return (
				<div className="p-4 text-yellow-600">
					Требуется авторизация. Перенаправление...
				</div>
			);
		}

		// 403 - нет доступа
		if (status === 403) {
			return (
				<div className="p-4">
					<div className="text-red-600 mb-4">
						У вас нет доступа к этому профилю
					</div>
					<Navigate to="/" />
				</div>
			);
		}

		// 404 - не найден
		if (status === 404) {
			return (
				<div className="p-4">
					<div className="text-yellow-600 mb-4">Пользователь не найден</div>
					<button
						onClick={() => window.history.back()}
						className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
					>
						Назад
					</button>
				</div>
			);
		}

		// Остальные ошибки (500+) обработаны в middleware
		return (
			<div className="p-4 text-red-600">
				Произошла ошибка при загрузке профиля
			</div>
		);
	}

	// Отображение данных
	if (!user) {
		return <div className="p-4">Данные отсутствуют</div>;
	}

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Профиль пользователя</h2>
			<div className="space-y-2">
				<div>
					<span className="font-semibold">ID:</span> {user.id}
				</div>
				<div>
					<span className="font-semibold">Имя:</span> {user.name}
				</div>
				<div>
					<span className="font-semibold">Email:</span> {user.email}
				</div>
			</div>
		</div>
	);
}
