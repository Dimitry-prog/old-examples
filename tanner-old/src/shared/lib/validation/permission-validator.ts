import type { PermissionObject } from '@/types/permissions';

/**
 * Валидатор разрешений
 * Проверяет целостность и корректность данных разрешений
 */
export class PermissionValidator {
  /**
   * Валидация объекта разрешений
   * @param permissions - объект разрешений для валидации
   * @returns валидированный объект разрешений
   * @throws Error если данные некорректны
   */
  static validatePermissions(permissions: unknown): PermissionObject {
    // Проверка на null/undefined
    if (!permissions) {
      console.warn('Permissions object is null or undefined, returning empty object');
      return {};
    }

    // Проверка типа
    if (typeof permissions !== 'object') {
      throw new Error('Invalid permissions format: must be an object');
    }

    // Проверка на массив (не должен быть массивом)
    if (Array.isArray(permissions)) {
      throw new Error('Invalid permissions format: must be an object, not an array');
    }

    const validated: PermissionObject = {};

    // Валидация каждого ключа и значения
    for (const [key, value] of Object.entries(permissions)) {
      // Проверка ключа
      if (typeof key !== 'string' || key.trim() === '') {
        console.warn(`Invalid permission key: "${key}", skipping`);
        continue;
      }

      // Проверка значения
      if (typeof value !== 'boolean') {
        console.warn(
          `Invalid permission value for key "${key}": expected boolean, got ${typeof value}, skipping`
        );
        continue;
      }

      validated[key] = value;
    }

    return validated;
  }

  /**
   * Проверка формата ключа разрешения
   * @param permission - ключ разрешения для проверки
   * @returns true если формат корректен
   */
  static isValidPermissionKey(permission: string): boolean {
    // Проверка на пустую строку
    if (!permission || permission.trim() === '') {
      return false;
    }

    // Проверка формата (например: 'resource:action' или 'api-name')
    // Разрешаем буквы, цифры, дефисы, двоеточия и подчеркивания
    const validPattern = /^[a-zA-Z0-9_:-]+$/;
    return validPattern.test(permission);
  }

  /**
   * Санитизация объекта разрешений
   * Удаляет некорректные записи и возвращает чистый объект
   * @param permissions - объект разрешений для санитизации
   * @returns санитизированный объект разрешений
   */
  static sanitizePermissions(permissions: unknown): PermissionObject {
    try {
      return this.validatePermissions(permissions);
    } catch (error) {
      console.error('Failed to validate permissions:', error);
      return {}; // Возвращаем пустой объект при ошибке
    }
  }

  /**
   * Проверка наличия обязательных разрешений
   * @param permissions - объект разрешений пользователя
   * @param required - массив обязательных разрешений
   * @returns true если все обязательные разрешения присутствуют
   */
  static hasRequiredPermissions(
    permissions: PermissionObject,
    required: string[]
  ): boolean {
    return required.every((key) => {
      const hasPermission = permissions[key] === true;
      if (!hasPermission) {
        console.warn(`Missing required permission: ${key}`);
      }
      return hasPermission;
    });
  }

  /**
   * Слияние объектов разрешений с валидацией
   * @param base - базовый объект разрешений
   * @param override - объект разрешений для переопределения
   * @returns объединенный и валидированный объект
   */
  static mergePermissions(
    base: PermissionObject,
    override: PermissionObject
  ): PermissionObject {
    const validatedBase = this.sanitizePermissions(base);
    const validatedOverride = this.sanitizePermissions(override);

    return {
      ...validatedBase,
      ...validatedOverride,
    };
  }
}
