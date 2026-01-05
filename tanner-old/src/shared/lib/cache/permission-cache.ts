import type { PermissionObject, PermissionCache, CacheEntry } from '@/types/permissions';

/**
 * Создание кэша разрешений с типизированным интерфейсом
 * @param defaultTTL - время жизни кэша по умолчанию в миллисекундах (по умолчанию 5 минут)
 */
export const createPermissionCache = (defaultTTL = 300000): PermissionCache => {
  const cache = new Map<string, CacheEntry>();

  return {
    cache,

    /**
     * Получение разрешений из кэша
     * @param userId - ID пользователя
     * @returns Объект разрешений или null если кэш истек или отсутствует
     */
    get: (userId: string): PermissionObject | null => {
      const cached = cache.get(userId);
      
      if (!cached) {
        return null;
      }

      // Проверяем, не истек ли кэш
      if (cached.expiresAt <= Date.now()) {
        cache.delete(userId);
        return null;
      }

      return cached.permissions;
    },

    /**
     * Сохранение разрешений в кэш
     * @param userId - ID пользователя
     * @param permissions - Объект разрешений
     * @param ttl - время жизни кэша в миллисекундах (опционально)
     */
    set: (userId: string, permissions: PermissionObject, ttl?: number): void => {
      const timeToLive = ttl ?? defaultTTL;
      
      cache.set(userId, {
        permissions,
        expiresAt: Date.now() + timeToLive,
      });
    },

    /**
     * Очистка кэша для конкретного пользователя
     * @param userId - ID пользователя
     */
    clear: (userId: string): void => {
      cache.delete(userId);
    },
  };
};

/**
 * Глобальный экземпляр кэша разрешений
 */
export const permissionCache = createPermissionCache();
