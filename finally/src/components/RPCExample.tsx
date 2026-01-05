import {
	useGetUsersQuery,
	useCreateUserMutation,
} from "@/shared/api/rpc-api.example";
import {
	handleRtkError,
	getErrorMessage,
} from "@/shared/utils/handle-rtk-error";

/**
 * Пример компонента, использующего RPC-style API
 * Все запросы идут на один POST endpoint
 */
export function RPCExample() {
	const { data: users, error, isLoading } = useGetUsersQuery();
	const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

	const handleCreateUser = async () => {
		try {
			await createUser({
				name: "Новый пользователь",
				email: "user@example.com",
			}).unwrap();

			console.log("Пользователь создан!");
		} catch (err) {
			// Обработка специфичных ошибок
			if (err && typeof err === "object" && "status" in err) {
				if (err.status === 403) {
					console.error("Нет прав для создания пользователя");
				} else if (err.status === 422) {
					console.error("Неверные данные");
				}
			}
		}
	};

	if (isLoading) {
		return <div className="p-4">Загрузка...</div>;
	}

	if (error) {
		return (
			<div className="p-4">
				{handleRtkError(error, {
					403: () => (
						<div className="text-red-600">
							У вас нет доступа к списку пользователей
						</div>
					),
					404: () => <div className="text-yellow-600">Метод не найден</div>,
					default: () => (
						<div className="text-red-600">Ошибка: {getErrorMessage(error)}</div>
					),
				})}
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">RPC API - Список пользователей</h2>
				<button
					onClick={handleCreateUser}
					disabled={isCreating}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
				>
					{isCreating ? "Создание..." : "Создать пользователя"}
				</button>
			</div>

			<div className="text-sm text-gray-600 mb-4">
				Все запросы отправляются на единый POST endpoint: <code>/api/rpc</code>
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
