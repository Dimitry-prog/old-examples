import {
	useGetUsersQuery,
	useCreateUserMutation,
} from "@/shared/api/users-api";
import {
	handleRtkError,
	getErrorMessage,
} from "@/shared/utils/handle-rtk-error";

/**
 * Пример компонента с обработкой ошибок RTK Query
 *
 * Демонстрирует:
 * - Обработку специфичных статусов (403, 404) в компоненте
 * - Глобальную обработку 401 и 500+ в middleware
 * - Использование утилит для работы с ошибками
 */
export function UsersListExample() {
	const { data: users, error, isLoading } = useGetUsersQuery();
	const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

	// Обработка создания пользователя
	const handleCreateUser = async () => {
		try {
			await createUser({
				name: "Новый пользователь",
				email: "user@example.com",
			}).unwrap();

			// Успех - можно показать уведомление
			console.log("Пользователь создан!");
		} catch (err) {
			// Обрабатываем специфичные ошибки
			if (err && typeof err === "object" && "status" in err) {
				if (err.status === 403) {
					console.error("У вас нет прав для создания пользователя");
				} else if (err.status === 422) {
					console.error("Неверные данные формы");
				}
				// Остальные ошибки (401, 500+) обработаны в middleware
			}
		}
	};

	// Загрузка
	if (isLoading) {
		return <div className="p-4">Загрузка пользователей...</div>;
	}

	// Обработка ошибок с помощью утилиты
	if (error) {
		return (
			<div className="p-4">
				{handleRtkError(error, {
					403: () => (
						<div className="text-red-600">
							У вас нет доступа к списку пользователей
						</div>
					),
					404: () => (
						<div className="text-yellow-600">
							Список пользователей не найден
						</div>
					),
					default: () => (
						<div className="text-red-600">Ошибка: {getErrorMessage(error)}</div>
					),
				})}
			</div>
		);
	}

	// Отображение данных
	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Список пользователей</h2>
				<button
					onClick={handleCreateUser}
					disabled={isCreating}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
				>
					{isCreating ? "Создание..." : "Создать пользователя"}
				</button>
			</div>

			<div className="space-y-2">
				{users?.map((user) => (
					<div key={user.id} className="p-3 border rounded">
						<div className="font-semibold">{user.name}</div>
						<div className="text-sm text-gray-600">{user.email}</div>
					</div>
				))}
			</div>
		</div>
	);
}
