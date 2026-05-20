// utils/guards.ts
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Permission } from "../models/routes/routes.model";
import { hasAccess } from "../models/builders/builders.models";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

/**
 * Hook/helper para obtener los permisos del usuario logueado.
 * ✅ Memoizado para evitar renders innecesarios
 */
export const getUserPermissions = (): Permission[] => {
  try {
    const raw = localStorage.getItem("permissions");
    return raw ? (JSON.parse(raw) as Permission[]) : [];
  } catch {
    return [];
  }
};

// ─── Guards ───────────────────────────────────────────────────────────────────

/**
 * Ruta protegida: redirige a /login si no hay token.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

/**
 * Ruta pública: redirige a /home si ya hay sesión activa.
 */
export const PublicRoute = ({
  children,
  redirectTo = "/",
}: {
  children: ReactNode;
  redirectTo?: string;
}) => {
  const token = getToken();

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};

/**
 * Guard de permisos: muestra 403 si el usuario no tiene acceso.
 */
export const PermissionGuard = ({
  permissions,
  children,
  fallback,
}: {
  permissions: Permission[] | null;
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const userPerms = getUserPermissions();
  const hasAccessToRoute = hasAccess(permissions, userPerms);

  if (!hasAccessToRoute) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
          <span className="text-5xl">🔒</span>
          <p className="text-lg font-medium">Sin acceso</p>
          <p className="text-sm">No tienes permisos para ver esta página.</p>
        </div>
      )
    );
  }
  return <>{children}</>;
};
