import type React from 'react';
import { useRouter } from '@tanstack/react-router';
import type { Permission } from '@/types/permissions';

type PermissionGuardProps = {
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Компонент для условного отображения UI элементов на основе разрешений
 * @param permissions - массив требуемых разрешений
 * @param requireAll - требуются ли все разрешения (по умолчанию false - достаточно любого)
 * @param fallback - элемент для отображения при отсутствии доступа
 * @param children - дочерние элементы для отображения при наличии доступа
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const router = useRouter();
  const auth = router.options.context?.auth;

  // Если auth не доступен, не показываем контент
  if (!auth) {
    return <>{fallback}</>;
  }

  // Проверяем доступ
  const hasAccess = requireAll
    ? auth.hasAllPermissions(permissions)
    : auth.hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
