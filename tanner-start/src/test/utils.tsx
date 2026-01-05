import { AuthProvider } from "@/contexts/AuthContext";
import { routeTree } from "@/routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Создание тестового QueryClient
 */
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
		logger: {
			log: () => {},
			warn: () => {},
			error: () => {},
		},
	});
}

/**
 * Создание тестового роутера
 */
export function createTestRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		context: {
			auth: undefined,
		},
	});
}

/**
 * Провайдеры для тестирования
 */
interface TestProvidersProps {
	children: ReactNode;
	queryClient?: QueryClient;
	router?: ReturnType<typeof createTestRouter>;
	initialAuth?: {
		user: any;
		isAuthenticated: boolean;
	};
}

export function TestProviders({
	children,
	queryClient = createTestQueryClient(),
	router = createTestRouter(),
	initialAuth,
}: TestProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider initialState={initialAuth}>
				<RouterProvider router={router}>{children}</RouterProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

/**
 * Кастомная функция render с провайдерами
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
	router?: ReturnType<typeof createTestRouter>;
	initialAuth?: {
		user: any;
		isAuthenticated: boolean;
	};
	withProviders?: boolean;
}

export function renderWithProviders(
	ui: ReactElement,
	{
		queryClient,
		router,
		initialAuth,
		withProviders = true,
		...renderOptions
	}: CustomRenderOptions = {},
) {
	if (!withProviders) {
		return render(ui, renderOptions);
	}

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<TestProviders
			queryClient={queryClient}
			router={router}
			initialAuth={initialAuth}
		>
			{children}
		</TestProviders>
	);

	return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Утилиты для тестирования хуков
 */
export { renderHook } from "@testing-library/react";

/**
 * Утилита для рендера хуков с провайдерами
 */
export function renderHookWithProviders<TProps, TResult>(
	hook: (props: TProps) => TResult,
	options: {
		initialProps?: TProps;
		queryClient?: QueryClient;
		router?: ReturnType<typeof createTestRouter>;
		initialAuth?: {
			user: any;
			isAuthenticated: boolean;
		};
	} = {},
) {
	const { queryClient, router, initialAuth, ...hookOptions } = options;

	const wrapper = ({ children }: { children: ReactNode }) => (
		<TestProviders
			queryClient={queryClient}
			router={router}
			initialAuth={initialAuth}
		>
			{children}
		</TestProviders>
	);

	return renderHook(hook, { wrapper, ...hookOptions });
}

/**
 * Мок данные для тестов
 */
export const mockUser = {
	id: "test-user-id",
	name: "Test User",
	email: "test@example.com",
	role: "user" as const,
	avatar: "https://example.com/avatar.jpg",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

export const mockAdmin = {
	...mockUser,
	id: "test-admin-id",
	name: "Test Admin",
	email: "admin@example.com",
	role: "admin" as const,
};

export const mockPost = {
	id: "test-post-id",
	title: "Test Post",
	content: "This is a test post content",
	excerpt: "This is a test post",
	authorId: mockUser.id,
	author: mockUser,
	tags: ["test", "example"],
	status: "published" as const,
	publishedAt: "2024-01-01T00:00:00Z",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	viewsCount: 100,
	likesCount: 10,
	commentsCount: 5,
};

export const mockComment = {
	id: "test-comment-id",
	content: "This is a test comment",
	postId: mockPost.id,
	authorId: mockUser.id,
	author: mockUser,
	parentId: undefined,
	replies: [],
	likesCount: 2,
	isLiked: false,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	isEdited: false,
};

/**
 * Утилиты для работы с формами в тестах
 */
export const formTestUtils = {
	// Заполнение поля формы
	fillField: async (field: HTMLElement, value: string) => {
		const { fireEvent } = await import("@testing-library/react");
		fireEvent.change(field, { target: { value } });
	},

	// Отправка формы
	submitForm: async (form: HTMLElement) => {
		const { fireEvent } = await import("@testing-library/react");
		fireEvent.submit(form);
	},

	// Клик по кнопке
	clickButton: async (button: HTMLElement) => {
		const { fireEvent } = await import("@testing-library/react");
		fireEvent.click(button);
	},

	// Ожидание появления элемента
	waitForElement: async (
		getElement: () => HTMLElement | null,
		timeout = 1000,
	) => {
		const { waitFor } = await import("@testing-library/react");
		return waitFor(
			() => {
				const element = getElement();
				if (!element) throw new Error("Element not found");
				return element;
			},
			{ timeout },
		);
	},
};

/**
 * Утилиты для тестирования API
 */
export const apiTestUtils = {
	// Мок успешного ответа
	mockSuccessResponse: <T,>(data: T) => ({
		ok: true,
		status: 200,
		json: async () => data,
		text: async () => JSON.stringify(data),
	}),

	// Мок ошибки
	mockErrorResponse: (status = 500, message = "Internal Server Error") => ({
		ok: false,
		status,
		statusText: message,
		json: async () => ({ error: message }),
		text: async () => JSON.stringify({ error: message }),
	}),

	// Мок fetch
	mockFetch: (response: any) => {
		global.fetch = vi.fn().mockResolvedValue(response);
		return global.fetch;
	},

	// Восстановление fetch
	restoreFetch: () => {
		vi.restoreAllMocks();
	},
};

/**
 * Утилиты для тестирования состояния
 */
export const stateTestUtils = {
	// Ожидание изменения состояния
	waitForStateChange: async <T,>(
		getCurrentState: () => T,
		expectedState: T,
		timeout = 1000,
	) => {
		const { waitFor } = await import("@testing-library/react");
		return waitFor(
			() => {
				const currentState = getCurrentState();
				if (currentState !== expectedState) {
					throw new Error(
						`Expected state ${expectedState}, got ${currentState}`,
					);
				}
				return currentState;
			},
			{ timeout },
		);
	},

	// Проверка изменения состояния
	expectStateChange: <T,>(
		getCurrentState: () => T,
		initialState: T,
		expectedState: T,
	) => {
		const currentState = getCurrentState();
		expect(currentState).not.toBe(initialState);
		expect(currentState).toBe(expectedState);
	},
};

// Переэкспорт всех утилит Testing Library
export * from "@testing-library/react";
export * from "@testing-library/user-event";
export {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	test,
	vi,
} from "vitest";
