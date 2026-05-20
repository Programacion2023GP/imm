import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import type {
  RouteItem,
  GroupItem,
  Permission,
  NavItem,
} from "../routes/routes.model";

// ─────────────────────────────────────────────
//  Builders
// ─────────────────────────────────────────────

type RouteOptions = Omit<RouteItem, "type">;

/**
 * Define una ruta del sistema.
 *
 * @example
 * route({
 *   to: "/usuarios",
 *   name: "Usuarios",
 *   icon: <FaUserTie />,
 *   permissions: null,                      // sin restricción
 *   page: lazy(() => import("./PageUsuarios")),
 * })
 *
 * @example
 * route({
 *   to: "/admin/logs",
 *   name: "Logs",
 *   icon: <FaCode />,
 *   permissions: ["admin", "superuser"],    // necesita al menos uno
 *   page: lazy(() => import("./PageLogs")),
 * })
 */
export const route = (options: RouteOptions): RouteItem => ({
  type: "route",
  inMenu: true,
  ...options,
});

/**
 * Define un grupo colapsable en el menú lateral.
 *
 * @example
 * group("Catálogos", <FaBuildingColumns />, [
 *   route({ to: "/catalogos/departamentos", name: "Departamentos", ... }),
 * ])
 */
export const group = (
  name: string,
  icon: ReactNode,
  children: RouteItem[],
): GroupItem => ({
  type: "group",
  name,
  icon,
  children,
});

// ─────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────

/** Aplana todos los RouteItems de la configuración (incluyendo dentro de grupos) */
export const flattenRoutes = (items: NavItem[]): RouteItem[] =>
  items.flatMap((item) =>
    item.type === "group" ? flattenRoutes(item.children) : [item],
  );

/** Comprueba si el usuario tiene acceso a una ruta dado su array de permisos */
export const hasAccess = (
  routePermissions: Permission[] | null,
  userPermissions: Permission[],
): boolean => {
  if (routePermissions === null) return true;
  return routePermissions.some((p) => userPermissions.includes(p));
};
