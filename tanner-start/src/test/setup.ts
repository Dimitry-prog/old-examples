import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Очистка после каждого теста
afterEach(() => {
	cleanup();
});

// Настройка глобальных моков
beforeAll(() => {
	// Мок для matchMedia (нужен для некоторых компонентов)
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // deprecated
			removeListener: vi.fn(), // deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	// Мок для ResizeObserver
	global.ResizeObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));

	// Мок для IntersectionObserver
	global.IntersectionObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));

	// Мок для scrollTo
	window.scrollTo = vi.fn();

	// Мок для localStorage с реальным хранилищем
	const createStorageMock = () => {
		let store: Record<string, string> = {};

		return {
			getItem: (key: string) => store[key] || null,
			setItem: (key: string, value: string) => {
				store[key] = value.toString();
			},
			removeItem: (key: string) => {
				delete store[key];
			},
			clear: () => {
				store = {};
			},
			get length() {
				return Object.keys(store).length;
			},
			key: (index: number) => {
				const keys = Object.keys(store);
				return keys[index] || null;
			},
		};
	};

	Object.defineProperty(window, "localStorage", {
		value: createStorageMock(),
		writable: true,
	});

	Object.defineProperty(window, "sessionStorage", {
		value: createStorageMock(),
		writable: true,
	});

	// Мок для URL.createObjectURL
	global.URL.createObjectURL = vi.fn(() => "mocked-url");
	global.URL.revokeObjectURL = vi.fn();

	// Мок для fetch (если не используется MSW)
	global.fetch = vi.fn() as any;

	// Подавление console.error для ожидаемых ошибок в тестах
	const originalError = console.error;
	console.error = (...args: any[]) => {
		// Игнорируем известные предупреждения React
		if (
			typeof args[0] === "string" &&
			(args[0].includes("Warning: ReactDOM.render is no longer supported") ||
				args[0].includes("Warning: validateDOMNesting"))
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	// Восстановление оригинальных функций
	vi.restoreAllMocks();
});

// Глобальные утилиты для тестов
declare global {
	var testUtils: typeof testUtils;
}

// Экспорт утилит для использования в тестах
export const testUtils = {
	// Утилита для мокирования localStorage
	mockLocalStorage: (items: Record<string, string> = {}) => {
		const mock = {
			getItem: vi.fn((key: string) => items[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				items[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete items[key];
			}),
			clear: vi.fn(() => {
				Object.keys(items).forEach((key) => delete items[key]);
			}),
			length: Object.keys(items).length,
			key: vi.fn((index: number) => Object.keys(items)[index] || null),
		};

		Object.defineProperty(window, "localStorage", { value: mock });
		return mock;
	},

	// Утилита для мокирования sessionStorage
	mockSessionStorage: (items: Record<string, string> = {}) => {
		const mock = {
			getItem: vi.fn((key: string) => items[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				items[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete items[key];
			}),
			clear: vi.fn(() => {
				Object.keys(items).forEach((key) => delete items[key]);
			}),
			length: Object.keys(items).length,
			key: vi.fn((index: number) => Object.keys(items)[index] || null),
		};

		Object.defineProperty(window, "sessionStorage", { value: mock });
		return mock;
	},

	// Утилита для ожидания следующего тика
	waitForNextTick: () => new Promise((resolve) => setTimeout(resolve, 0)),

	// Утилита для ожидания определенного времени
	wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	// Утилита для создания мок функции с типизацией
	createMockFn: <T extends (...args: any[]) => any>(implementation?: T) => {
		return vi.fn(implementation) as any;
	},
};

// Делаем утилиты доступными глобально
globalThis.testUtils = testUtils;
