import * as React from "react";
import { usePermissions } from "react-admin";

export type RoleName = "ROLE_ADMIN" | "ROLE_USER";

export interface PermissionsWrapperProps {
  /** 允許看到此區塊的角色（任一符合即顯示） */
  allowedRoles?: RoleName[];
  /** 若未傳 allowedRoles，僅 ROLE_ADMIN 可見 */
  children: React.ReactNode;
}

/**
 * 依 getPermissions() 回傳的 role（RBAC）動態渲染子元件。
 * 用於選單或頁面區塊：例如 ROLE_USER 不顯示「使用者管理」。
 */
export const PermissionsWrapper: React.FC<PermissionsWrapperProps> = ({
  allowedRoles = ["ROLE_ADMIN"],
  children,
}) => {
  const { permissions, isLoading } = usePermissions();
  const roles = Array.isArray(permissions)
    ? (permissions as string[])
    : typeof permissions === "string"
      ? [permissions]
      : [];

  if (isLoading) return null;
  const allowed =
    roles.length > 0 &&
    roles.some((role) => allowedRoles.includes(role as RoleName));
  if (!allowed) return null;

  return <>{children}</>;
};

PermissionsWrapper.displayName = "PermissionsWrapper";
