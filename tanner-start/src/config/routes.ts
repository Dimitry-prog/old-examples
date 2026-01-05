// Конфигурация маршрутов с правами доступа
// Используется для фильтрации навигации и проверки прав доступа
// Сами маршруты определяются в файловой системе TanStack Router

import type { RoutePermissions } from "@/types/permissions";
import type { RoutesConfig } from "@/types/routes";

/**
 * Централизованная конфигурация маршрутов приложения
 * Используется для:
 * - Фильтрации навигационного меню по правам доступа
 * - Определения прав доступа для каждого маршрута
 * - Отображения названий и иконок в меню
 * - Поддержки ленивой загрузки компонентов
 *
 * ВАЖНО: Пути должны совпадать с путями файлов в TanStack Router
 */
export const ROUTES_CONFIG: RoutesConfig = [
	{
		group: "dashboard",
		meta: {
			label: "Dashboard",
			icon: "dashboard",
			order: 1,
		},
		items: [
			{
				path: "dashboard",
				name: "Dashboard",
				permissions: [
					"/api.manager.dashboard.view",
					"/api.manager.dashboard.stats",
				],
				meta: {
					description: "Main dashboard with statistics",
					icon: "home",
					order: 1,
				},
			},
		],
	},
	{
		group: "users",
		meta: {
			label: "Users",
			icon: "users",
			order: 2,
		},
		items: [
			{
				path: "profile",
				name: "Profile",
				permissions: ["/api.manager.profile.view"],
				meta: {
					description: "User profile page",
					icon: "user",
					order: 1,
				},
			},
		],
	},
	{
		group: "examples",
		meta: {
			label: "Examples",
			icon: "code",
			order: 3,
		},
		items: [
			{
				path: "examples",
				name: "Examples",
				permissions: [], // Доступно всем аутентифицированным пользователям
				meta: {
					description: "Code examples and demos",
					icon: "code",
					order: 1,
				},
			},
		],
	},
	{
		group: "settings",
		meta: {
			label: "Settings",
			icon: "settings",
			order: 10,
		},
		items: [
			{
				path: "settings",
				name: "Settings",
				permissions: ["/api.manager.settings.view"],
				meta: {
					description: "Application settings",
					icon: "settings",
					order: 1,
				},
			},
			{
				path: "admin",
				name: "Admin Panel",
				permissions: ["/api.manager.admin.access"],
				meta: {
					description: "Administration panel",
					icon: "shield",
					order: 2,
				},
			},
		],
	},
];

/**
 * Получение конфигурации маршрута по пути
 */
export function getRouteConfig(path: string) {
	for (const group of ROUTES_CONFIG) {
		const route = group.items.find((item: any) => item.path === path);
		if (route) {
			return route;
		}
	}
	return null;
}

/**
 * Получение прав доступа для маршрута
 */
export function getRoutePermissions(path: string): RoutePermissions {
	const config = getRouteConfig(path);
	return config?.permissions || [];
}

/**
 * Получение всех путей маршрутов
 */
export function getAllRoutePaths(): string[] {
	return ROUTES_CONFIG.flatMap((group: any) =>
		group.items.map((item: any) => item.path),
	);
}

/**
 * Получение маршрутов по группе
 */
export function getRoutesByGroup(groupId: string) {
	const group = ROUTES_CONFIG.find((g: any) => g.group === groupId);
	return group?.items || [];
}

/**
 * Получение группы маршрутов по ID
 */
export function getRouteGroup(groupId: string) {
	return ROUTES_CONFIG.find((g: any) => g.group === groupId);
}

/**
 * Получение всех групп маршрутов
 */
export function getAllRouteGroups() {
	return ROUTES_CONFIG;
}
