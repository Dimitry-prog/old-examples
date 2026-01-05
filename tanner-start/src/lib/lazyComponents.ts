import { lazy } from "react";

/**
 * Lazy-loaded компоненты для code splitting
 * Это уменьшает размер начального bundle и улучшает производительность
 */

// Примеры компонентов
export const RegistrationFormExample = lazy(() =>
	import("@/components/examples/RegistrationFormExample").then((module) => ({
		default: module.RegistrationFormExample,
	})),
);

export const ApiIntegrationExample = lazy(() =>
	import("@/components/examples/ApiIntegrationExample").then((module) => ({
		default: module.ApiIntegrationExample,
	})),
);

export const StateManagementExample = lazy(() =>
	import("@/components/examples/StateManagementExample").then((module) => ({
		default: module.StateManagementExample,
	})),
);

// Формы
export const FormsExample = lazy(() =>
	import("@/components/examples/FormsExample").then((module) => ({
		default: module.FormsExample,
	})),
);

// Тяжелые UI компоненты (если есть)
export const TanStackQueryDemo = lazy(() =>
	import("@/components/examples/TanStackQueryDemo").then((module) => ({
		default: module.TanStackQueryDemo,
	})),
);

/**
 * Утилита для предзагрузки компонентов
 * Используется для preloading при hover или других событиях
 */
export const preloadComponent = (componentLoader: () => Promise<unknown>) => {
	componentLoader();
};

/**
 * Хук для предзагрузки компонентов при hover
 */
export const usePreloadOnHover = (componentLoader: () => Promise<unknown>) => {
	return {
		onMouseEnter: () => preloadComponent(componentLoader),
		onFocus: () => preloadComponent(componentLoader),
	};
};
