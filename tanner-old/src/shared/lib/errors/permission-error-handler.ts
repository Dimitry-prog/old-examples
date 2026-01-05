import type { Permission, PermissionObject } from '@/types/permissions';

/**
 * Обработчик ошибок разрешений
 * Предоставляет методы для обработки ошибок загрузки разрешений и доступа к маршрутам
 */
export class PermissionErrorHandler {
  /**
   * Обработка ошибки загрузки разрешений
   * @param error - объект ошибки
   * @param userId - ID пользователя
   * @returns минимальный набор разрешений для fallback
   */
  static handlePermissionLoadError(
    error: Error,
    userId: string
  ): PermissionObject {
    console.error('Failed to load permissions for user:', userId, error);

    // Логируем ошибку для мониторинга
    this.logError('PERMISSION_LOAD_ERROR', {
      userId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Возвращаем минимальные разрешения для базового доступа
    return {
      'basic:read': true,
    };
  }

  /**
   * Обработка ошибки доступа к маршруту
   * @param route - путь маршрута
   * @param requiredPermissions - требуемые разрешения
   * @param userId - ID пользователя (опционально)
   */
  static handleRouteAccessError(
    route: string,
    requiredPermissions: Permission[],
    userId?: string
  ): void {
    console.warn(
      'Access denied to route:',
      route,
      'Required permissions:',
      requiredPermissions
    );

    // Логируем попытку доступа для аудита
    this.logAccessAttempt(route, requiredPermissions, userId);
  }

  /**
   * Логирование попытки доступа для аудита
   * @param route - путь маршрута
   * @param permissions - требуемые разрешения
   * @param userId - ID пользователя (опционально)
   */
  private static logAccessAttempt(
    route: string,
    permissions: Permission[],
    userId?: string
  ): void {
    const auditLog = {
      type: 'ROUTE_ACCESS_DENIED',
      route,
      requiredPermissions: permissions,
      userId: userId || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // В продакшене здесь должна быть отправка в систему аудита
    console.log('[AUDIT]', JSON.stringify(auditLog));

    // Можно добавить отправку в внешний сервис логирования
    // this.sendToAuditService(auditLog);
  }

  /**
   * Общее логирование ошибок
   * @param errorType - тип ошибки
   * @param details - детали ошибки
   */
  private static logError(errorType: string, details: Record<string, any>): void {
    const errorLog = {
      type: errorType,
      ...details,
    };

    // В продакшене здесь должна быть отправка в систему мониторинга
    console.error('[ERROR]', JSON.stringify(errorLog));

    // Можно добавить отправку в Sentry, LogRocket и т.д.
    // this.sendToErrorTracking(errorLog);
  }

  /**
   * Обработка ошибки API при получении разрешений
   * @param error - объект ошибки
   * @param userId - ID пользователя
   * @returns fallback разрешения или выброс ошибки
   */
  static handleApiError(error: any, userId: string): PermissionObject {
    // Проверяем тип ошибки
    if (error.response) {
      // Ошибка от сервера
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Неавторизован или нет доступа
        console.warn('User not authorized to fetch permissions:', userId);
        return {}; // Возвращаем пустые разрешения
      }

      if (status >= 500) {
        // Ошибка сервера - используем fallback
        console.error('Server error while fetching permissions:', error);
        return this.handlePermissionLoadError(error, userId);
      }
    }

    // Сетевая ошибка или другая проблема
    if (error.request) {
      console.error('Network error while fetching permissions:', error);
      return this.handlePermissionLoadError(error, userId);
    }

    // Неизвестная ошибка
    throw error;
  }
}
