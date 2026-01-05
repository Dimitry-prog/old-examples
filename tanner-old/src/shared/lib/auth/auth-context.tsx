import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { router } from '@/shared/lib/router';
import type { User, AuthState, PermissionObject, Permission } from '@/types/permissions';
import { PermissionService } from '@/shared/services/permission.service';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionObject>({});

  // Загрузка разрешений пользователя
  const loadUserPermissions = async (userId: string) => {
    try {
      const userPermissions = await PermissionService.fetchUserPermissions(userId);
      setPermissions(userPermissions);
      localStorage.setItem('auth-permissions', JSON.stringify(userPermissions));
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      // Устанавливаем пустые разрешения при ошибке
      setPermissions({});
    }
  };

  // Восстанавливаем состояние аутентификации при загрузке приложения
  useEffect(() => {
    const userData = localStorage.getItem('auth-user');
    const storedPermissions = localStorage.getItem('auth-permissions');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Восстанавливаем разрешения из localStorage
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        } else {
          // Загружаем разрешения если их нет в localStorage
          loadUserPermissions(parsedUser.id);
        }
      } catch (error) {
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-permissions');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Простая имитация аутентификации
    if (username === 'admin' && password === 'password') {
      const userData: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: [],
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('auth-user', JSON.stringify(userData));
      
      // Загружаем разрешения после успешного входа
      await loadUserPermissions(userData.id);
    } else {
      throw new Error('Неверные учетные данные');
    }
  };

  const logout = () => {
    // Очищаем кэш разрешений перед выходом
    if (user?.id) {
      PermissionService.clearPermissionCache(user.id);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    setPermissions({});
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-permissions');
    // Перенаправляем на welcome с заменой истории для предотвращения возврата
    router.navigate({ to: '/welcome', replace: true });
  };

  // Методы проверки разрешений
  const hasPermission = (permission: Permission): boolean => {
    return PermissionService.hasPermission(permissions, permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return PermissionService.hasAnyPermission(permissions, requiredPermissions);
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return PermissionService.hasAllPermissions(permissions, requiredPermissions);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        permissions,
        login,
        logout,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}
