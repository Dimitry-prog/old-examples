import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	RefreshCw,
	User,
} from "lucide-react";
import { useState } from "react";

/**
 * Пример API интеграции с TanStack Query и Ky
 * Демонстрирует:
 * - Использование useQuery для загрузки данных
 * - Использование useMutation для изменения данных
 * - Обработку состояний: загрузка, ошибка, успех
 * - Кеширование и инвалидацию данных
 * - Интеграцию Ky HTTP клиента с TanStack Query
 */
export function ApiIntegrationExample() {
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Запрос списка пользователей
	const {
		data: usersData,
		isLoading: isLoadingUsers,
		isError: isUsersError,
		error: usersError,
		refetch: refetchUsers,
		isFetching: isFetchingUsers,
	} = useQuery({
		queryKey: queryKeys.users.list({ page: 1, limit: 5 }),
		queryFn: () => usersApi.getUsers({ page: 1, limit: 5 }),
		staleTime: 1000 * 60, // 1 минута
	});

	// Запрос конкретного пользователя
	const {
		data: userData,
		isLoading: isLoadingUser,
		isError: isUserError,
		error: userError,
	} = useQuery({
		queryKey: queryKeys.users.detail(selectedUserId || ""),
		queryFn: () => {
			if (!selectedUserId) throw new Error("User ID is required");
			return usersApi.getUser(selectedUserId);
		},
		enabled: !!selectedUserId, // Запрос выполняется только если выбран пользователь
	});

	// Мутация для создания пользователя
	const createUserMutation = useMutation({
		mutationFn: (userData: {
			email: string;
			name: string;
			role: "user" | "admin" | "moderator";
		}) => usersApi.createUser(userData),
		onSuccess: () => {
			// Инвалидируем кеш списка пользователей
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});

	// Мутация для удаления пользователя
	const deleteUserMutation = useMutation({
		mutationFn: (userId: string) => usersApi.deleteUser(userId),
		onSuccess: () => {
			// Инвалидируем кеш
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
			setSelectedUserId(null);
		},
	});

	const handleCreateUser = async () => {
		try {
			await createUserMutation.mutateAsync({
				email: `newuser${Date.now()}@example.com`,
				name: `New User ${Date.now()}`,
				role: "user",
			});
		} catch (error) {
			console.error("Failed to create user:", error);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
			try {
				await deleteUserMutation.mutateAsync(userId);
			} catch (error) {
				console.error("Failed to delete user:", error);
			}
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">
					API интеграция с TanStack Query
				</h3>
				<p className="text-sm text-muted-foreground">
					Этот пример демонстрирует работу с API через Ky HTTP клиент и TanStack
					Query для управления состоянием сервера.
				</p>
			</div>

			{/* Список пользователей */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h4 className="font-semibold">Список пользователей</h4>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetchUsers()}
						disabled={isFetchingUsers}
					>
						{isFetchingUsers ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4" />
						)}
						<span className="ml-2">Обновить</span>
					</Button>
				</div>

				{isLoadingUsers && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2 text-muted-foreground">
							Загрузка пользователей...
						</span>
					</div>
				)}

				{isUsersError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Ошибка загрузки</AlertTitle>
						<AlertDescription>
							{usersError instanceof Error
								? usersError.message
								: "Не удалось загрузить список пользователей"}
						</AlertDescription>
					</Alert>
				)}

				{usersData && (
					<div className="space-y-2">
						{usersData.users.map((user) => (
							<div
								key={user.id}
								className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
									selectedUserId === user.id
										? "border-primary bg-primary/5"
										: "border-border hover:bg-muted/50"
								}`}
							>
								<div className="flex items-center space-x-3">
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.name}
											className="h-10 w-10 rounded-full"
										/>
									) : (
										<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
											<User className="h-5 w-5 text-primary" />
										</div>
									)}
									<div>
										<p className="font-medium">{user.name}</p>
										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>
								</div>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSelectedUserId(user.id)}
									>
										Детали
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDeleteUser(user.id)}
										disabled={deleteUserMutation.isPending}
									>
										Удалить
									</Button>
								</div>
							</div>
						))}
						<div className="text-sm text-muted-foreground text-center pt-2">
							Показано {usersData.users.length} из {usersData.total}{" "}
							пользователей
						</div>
					</div>
				)}
			</div>

			{/* Детали пользователя */}
			{selectedUserId && (
				<div className="space-y-4">
					<h4 className="font-semibold">Детали пользователя</h4>

					{isLoadingUser && (
						<div className="flex items-center justify-center py-4">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
							<span className="ml-2 text-muted-foreground">
								Загрузка деталей...
							</span>
						</div>
					)}

					{isUserError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Ошибка</AlertTitle>
							<AlertDescription>
								{userError instanceof Error
									? userError.message
									: "Не удалось загрузить данные пользователя"}
							</AlertDescription>
						</Alert>
					)}

					{userData && (
						<div className="rounded-lg border p-4 space-y-3">
							<div className="flex items-center space-x-3">
								{userData.avatar ? (
									<img
										src={userData.avatar}
										alt={userData.name}
										className="h-16 w-16 rounded-full"
									/>
								) : (
									<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
										<User className="h-8 w-8 text-primary" />
									</div>
								)}
								<div>
									<h5 className="font-semibold text-lg">{userData.name}</h5>
									<p className="text-sm text-muted-foreground">
										{userData.email}
									</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<span className="text-muted-foreground">ID:</span>
									<span className="ml-2 font-mono">{userData.id}</span>
								</div>
								<div>
									<span className="text-muted-foreground">Роль:</span>
									<span className="ml-2 capitalize">{userData.role}</span>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedUserId(null)}
								className="w-full"
							>
								Закрыть
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Создание пользователя */}
			<div className="space-y-4">
				<h4 className="font-semibold">Создание пользователя (Mutation)</h4>

				{createUserMutation.isSuccess && (
					<Alert className="border-green-500 bg-green-50 dark:bg-green-950">
						<CheckCircle2 className="h-4 w-4 text-green-600" />
						<AlertTitle className="text-green-600">Успешно!</AlertTitle>
						<AlertDescription className="text-green-600">
							Пользователь был успешно создан
						</AlertDescription>
					</Alert>
				)}

				{createUserMutation.isError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Ошибка создания</AlertTitle>
						<AlertDescription>
							{createUserMutation.error instanceof Error
								? createUserMutation.error.message
								: "Не удалось создать пользователя"}
						</AlertDescription>
					</Alert>
				)}

				<Button
					onClick={handleCreateUser}
					disabled={createUserMutation.isPending}
					className="w-full"
				>
					{createUserMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					{createUserMutation.isPending
						? "Создание..."
						: "Создать нового пользователя"}
				</Button>
			</div>

			{/* Технические детали */}
			<div className="rounded-lg bg-muted p-4 space-y-2">
				<h4 className="text-sm font-semibold">Технические детали:</h4>
				<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>HTTP клиент: Ky с настроенными interceptors</li>
					<li>Управление состоянием: TanStack Query (React Query)</li>
					<li>Кеширование: автоматическое с настраиваемым staleTime</li>
					<li>Инвалидация: автоматическая после мутаций</li>
					<li>Обработка ошибок: через error boundaries и состояния</li>
					<li>Оптимистичные обновления: поддерживаются</li>
					<li>Retry логика: настроена для разных типов ошибок</li>
					<li>Валидация данных: через Zod схемы</li>
				</ul>
			</div>
		</div>
	);
}
