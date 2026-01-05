import "@testing-library/jest-dom";

// Глобальная настройка для React 19
// @ts-expect-error - React 19 feature
global.IS_REACT_ACT_ENVIRONMENT = true;

// Мокирование ResizeObserver для тестов
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Мокирование IntersectionObserver для тестов
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Мокирование matchMedia для тестов
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

// Мокирование localStorage для тестов
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

global.localStorage = createStorageMock() as Storage;
global.sessionStorage = createStorageMock() as Storage;
