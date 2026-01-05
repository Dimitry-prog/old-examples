import type { LinkProps } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/shared/lib/auth';

interface ProtectedLinkProps extends LinkProps {
  fallback?: React.ReactNode;
}

export function ProtectedLink({ fallback, children, ...props }: ProtectedLinkProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <Link {...props}>{children}</Link>;
}
