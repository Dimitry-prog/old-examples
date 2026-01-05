import { axiosInstance } from '../api/instance';
import type {
  Permission,
  PermissionObject,
  PermissionsResponse,
} from '@/types/permissions';
import {
  getRoutePermissions as getRoutePermissionsFromConfig,
  routePermissions,
} from '@/config/routes-permissions.config';
import { permissionCache } from '@/shared/lib/cache/permission-cache';
import { PermissionValidator } from '@/shared/lib/validation/permission-validator';
import { PermissionErrorHandler } from '@/shared/lib/errors/permission-error-handler';

/**
 * Сервис для работы с разрешениями пользователей
 */
export class PermissionService {
  /**
   * Получение разрешений пользователя с API с поддержкой кэширования
   */
  static async fetchUserPermissions(userId: string): Promise<PermissionObject> {
    // Проверяем кэш перед запросом к API
    const cachedPermissions = permissionCache.get(userId);
    if (cachedPermissions) {
      console.log('Permissions loaded from cache for user:', userId);
      return cachedPermissions;
    }

    try {
      const response = await axiosInstance.get<PermissionsResponse>(
        `/users/${userId}/permissions`
      );
      
      // Валидируем полученные разрешения
      const permissions = PermissionValidator.validatePermissions(
        response.data.permissions
      );
      
      // Сохраняем разрешения в кэш
      permissionCache.set(userId, permissions);
      console.log('Permissions cached for user:', userId);
      
      return permissions;
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      
      // Обрабатываем ошибку и возвращаем fallback разрешения
      return PermissionErrorHandler.handleApiError(error, userId);
    }
  }

  /**
   * Проверка наличия конкретного разрешения
   */
  static hasPermission(
    permissions: PermissionObject,
    permission: Permission
  ): boolean {
    return permissions[permission] === true;
  }

  /**
   * Проверка наличия хотя бы одного из требуемых разрешений
   */
  static hasAnyPermission(
    permissions: PermissionObject,
    requiredPermissions: Permission[]
  ): boolean {
    if (requiredPermissions.length === 0) {
      return true;
    }
    return requiredPermissions.some((permission) =>
      this.hasPermission(permissions, permission)
    );
  }

  /**
   * Проверка наличия всех требуемых разрешений
   */
  static hasAllPermissions(
    permissions: PermissionObject,
    requiredPermissions: Permission[]
  ): boolean {
    if (requiredPermissions.length === 0) {
      return true;
    }
    return requiredPermissions.every((permission) =>
      this.hasPermission(permissions, permission)
    );
  }

  /**
   * Получение разрешений для конкретного route ID
   */
  static getRoutePermissions(routeId: string): Permission[] {
    return getRoutePermissionsFromConfig(routeId);
  }

  /**
   * Поиск route ID по пути в дереве маршрутов
   */
  static findRouteIdByPath(path: string, router: any): string {
    const findInTree = (node: any, targetPath: string): string | null => {
      if (node.fullPath === targetPath) {
        return node.id;
      }

      if (node.children) {
        for (const child of node.children) {
          const found = findInTree(child, targetPath);
          if (found) return found;
        }
      }

      return null;
    };

    return findInTree(router.routeTree, path) || '';
  }

  /**
   * Получение всех route IDs из дерева маршрутов
   */
  static getAllRouteIds(router: any): string[] {
    const routeIds: string[] = [];

    const traverse = (node: any) => {
      if (node.id) {
        routeIds.push(node.id);
      }

      if (node.children) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    traverse(router.routeTree);
    return routeIds;
  }

  /**
   * Получение первого доступного маршрута для пользователя
   */
  static getFirstAccessibleRoute(
    permissions: PermissionObject,
    router: any
  ): string | null {
    const allRouteIds = this.getAllRouteIds(router);

    for (const routeId of allRouteIds) {
      const requiredPermissions = this.getRoutePermissions(routeId);

      // Пропускаем маршруты без разрешений или служебные маршруты
      if (
        requiredPermissions.length === 0 ||
        routeId.includes('__root') ||
        routeId.includes('_public')
      ) {
        continue;
      }

      // Проверяем, есть ли доступ к маршруту
      if (this.hasAnyPermission(permissions, requiredPermissions)) {
        // Получаем полный путь маршрута
        const route = this.findRouteById(router.routeTree, routeId);
        if (route?.fullPath) {
          return route.fullPath;
        }
      }
    }

    return null;
  }

  /**
   * Поиск маршрута по ID в дереве
   */
  private static findRouteById(node: any, routeId: string): any {
    if (node.id === routeId) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.findRouteById(child, routeId);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Синхронизация конфигурации разрешений с текущими маршрутами
   */
  static syncRoutePermissions(router: any): void {
    const allRoutes = this.getAllRouteIds(router);

    allRoutes.forEach((routeId) => {
      if (!(routeId in routePermissions)) {
        console.warn(`Route ${routeId} не имеет настроенных разрешений`);
      }
    });
  }

  /**
   * Очистка кэша разрешений для пользователя
   */
  static clearPermissionCache(userId: string): void {
    permissionCache.clear(userId);
    console.log('Permission cache cleared for user:', userId);
  }
}
