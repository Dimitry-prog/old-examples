/**
 * Базовые типы для системы разрешений (RBAC)
 */

// Базовый тип разрешения - строка вида 'dashboards:read', 'users:write'
export type Permission = string;

// Объект разрешений в формате {'api-name': boolean}
export type PermissionObject = Record<string, boolean>;

// Расширенный тип пользователя с разрешениями
export type User = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: Permission[];
};

// Состояние аутентификации с поддержкой разрешений
export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  permissions: PermissionObject;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
};

// Конфигурация разрешений для маршрута на основе route ID
export type RoutePermissionConfig = {
  routeId: string; // например: '/_authenticated/dashboards/main-dashboard'
  permissions: Permission[];
  requireAll?: boolean; // по умолчанию false (требуется любое из разрешений)
};

// Метаданные маршрута для отображения в UI
export type RouteMetadata = {
  label: string;
  icon?: string;
  showInMenu?: boolean;
};

// Конфигурация маршрута с использованием route ID
export type RouteConfig = {
  routeId: string; // ID маршрута из TanStack Router
  permissions: Permission[];
  isGroup?: boolean;
  children?: RouteConfig[];
  metadata?: RouteMetadata; // Метаданные для отображения
};

// Конфигурация группы маршрутов
export type RouteGroupConfig = {
  groupName: string;
  routes: RouteConfig[];
};

// Ответ API для получения разрешений
export type PermissionsResponse = {
  userId: string;
  permissions: PermissionObject; // {'some-api': boolean}
  roles: string[];
  expiresAt: string;
};

// Запись кэша разрешений
export type CacheEntry = {
  permissions: PermissionObject;
  expiresAt: number;
};

// Интерфейс кэша разрешений
export type PermissionCache = {
  cache: Map<string, CacheEntry>;
  get: (userId: string) => PermissionObject | null;
  set: (userId: string, permissions: PermissionObject, ttl?: number) => void;
  clear: (userId: string) => void;
};
