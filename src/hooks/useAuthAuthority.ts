import { useMemo } from "react";
import { usePermissions } from "react-admin";

/**
 * RBAC：依後端 JwtResponse.roles / authorities 做前端授權控制。
 * 提供 hasAuthority(authority) 與 hasAnyAuthority(authorities)，與後端 @PreAuthorize 對齊。
 */
export function useAuthAuthority() {
  const { permissions, isLoading } = usePermissions();
  const roles = useMemo(() => {
    if (permissions == null) return [];
    return Array.isArray(permissions) ? permissions : [permissions];
  }, [permissions]);

  const hasAuthority = (authority: string): boolean => {
    if (!authority || isLoading) return false;
    const want = authority.trim();
    return roles.some((r) => String(r).trim() === want);
  };

  const hasAnyAuthority = (authorities: string[]): boolean => {
    if (!Array.isArray(authorities) || authorities.length === 0 || isLoading) return false;
    return authorities.some((a) => hasAuthority(a));
  };

  const hasAllAuthorities = (authorities: string[]): boolean => {
    if (!Array.isArray(authorities) || authorities.length === 0 || isLoading) return false;
    return authorities.every((a) => hasAuthority(a));
  };

  return {
    permissions: roles,
    isLoading,
    hasAuthority,
    hasAnyAuthority,
    hasAllAuthorities,
  };
}
