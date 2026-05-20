/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │               CONFIGURACIÓN CENTRAL DE RUTAS                │
 * │  Solo toca las secciones de abajo:                          │
 * │    - HOME_ROUTE (ruta por defecto si tiene acceso)          │
 *    - publicRoutes (páginas sin login)                         │
 *    - nav (menú lateral + rutas protegidas)                    │
 * └─────────────────────────────────────────────────────────────┘
 */

import { lazy } from "react";
import { FaUserTie, FaBuildingColumns, FaUserDoctor } from "react-icons/fa6";
import { FaChartLine, FaCode } from "react-icons/fa";
import { RiFileList3Line } from "react-icons/ri";
import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

// ============================================================================
// 1. TIPOS (no los toques, solo úsalos)
// ============================================================================

export type Permission = string;

export interface RouteItem {
  type: "route";
  to: string;
  name: string;
  icon?: ReactNode;
  permissions: Permission[] | null;
  page: LazyExoticComponent<ComponentType<any>>;
  inMenu?: boolean;
}

export interface GroupItem {
  type: "group";
  name: string;
  icon?: ReactNode;
  children: RouteItem[];
}

export interface PublicRouteItem {
  type: "public";
  to: string;
  page: LazyExoticComponent<ComponentType<any>>;
}

export type NavItem = RouteItem | GroupItem;

// ============================================================================
// 2. CONSTRUCTORES (helpers para escribir menos)
// ============================================================================

/**
 * Ruta protegida (aparece en el menú lateral)
 */
export const route = (options: Omit<RouteItem, "type">): RouteItem => ({
  type: "route",
  inMenu: true,
  ...options,
});

/**
 * Ruta pública (sin autenticación, no aparece en el menú)
 */
export const publicRoute = (
  options: Omit<PublicRouteItem, "type">,
): PublicRouteItem => ({
  type: "public",
  ...options,
});

/**
 * Grupo colapsable en el menú lateral
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

// ============================================================================
// 3. UTILIDADES INTERNAS (no las toques)
// ============================================================================

/** Aplana todas las rutas (saca las de dentro de grupos) */
export const flattenRoutes = (items: NavItem[]): RouteItem[] =>
  items.flatMap((item) =>
    item.type === "group" ? flattenRoutes(item.children) : [item],
  );

/** Comprueba si el usuario tiene acceso a una ruta */
export const hasAccess = (
  routePermissions: Permission[] | null,
  userPermissions: Permission[],
): boolean => {
  if (routePermissions === null) return true;
  return routePermissions.some((p) => userPermissions.includes(p));
};

// ============================================================================
// 4. ───────────  A PARTIR DE AQUÍ SOLO TOCAS ESTO  ───────────
// ============================================================================

// ─── Ruta de inicio por defecto (si el usuario tiene acceso) ────────────────
export const HOME_ROUTE = "/usuarios";

// ─── Rutas públicas (acceso libre, sin login) ────────────────────────────────
export const publicRoutes: PublicRouteItem[] = [
//   publicRoute({
//     to: "/login",
//     page: lazy(() => import("../ui/pages/auth/PageLogin")),
//   }),
];

export const nav: NavItem[] = [
  //   route({
  //     to: "/usuarios",
  //     name: "Usuarios",
  //     icon: <FaUserTie />,
  //     permissions: null,
  //     page: lazy(() => import("../ui/pages/usuarios/PageUsuarios")),
  //   }),

  //   route({
  //     to: "/tramite",
  //     name: "Trámites",
  //     icon: <RiFileList3Line />,
  //     permissions: null,
  //     page: lazy(() => import("../ui/pages/tramites/PageTramites")),
  //   }),

  //   route({
  //     to: "/logs",
  //     name: "Logs",
  //     icon: <FaCode />,
  //     permissions: ["admin", "superuser"],
  //     page: lazy(() => import("../ui/pages/logs/PageLogs")),
  //   }),

  group("Catálogos", <FaBuildingColumns />, [
    route({
      to: "/catalogos/departamentos",
      name: "Departamentos",
      icon: <FaUserDoctor />,
      permissions: null,
      page: lazy(
        () => import("../ui/pages/catalogues/departaments/PageDepartments"),
      ),
    }),
    route({
      to: "/catalogos/usuarios",
      name: "Usuarios",
      icon: <FaUserDoctor />,
      permissions: null,
      page: lazy(
        () => import("../ui/pages/catalogues/departaments/PageDepartments"),
      ),
    }),
  ]),

  group("Reportes", <FaChartLine />, [
    // Ejemplo: route({ to: "/reportes/ventas", name: "Ventas", permissions: null, page: lazy(() => import("...")) }),
  ]),
];

// ============================================================================
// 5. HELPERS PARA REDIRECCIÓN AUTOMÁTICA (ya no tocas nada aquí)
// ============================================================================

/** Obtiene todas las rutas protegidas (aplanadas) */
export const getAllRoutes = (): RouteItem[] => flattenRoutes(nav);

/** Filtra las rutas a las que el usuario tiene acceso */
export const getAccessibleRoutes = (
  userPermissions: Permission[],
): RouteItem[] =>
  getAllRoutes().filter((route) =>
    hasAccess(route.permissions, userPermissions),
  );

/** Primera ruta accesible (para redirigir si HOME_ROUTE no es accesible) */
export const getFirstAccessibleRoute = (
  userPermissions: Permission[],
): string | null => {
  const accessible = getAccessibleRoutes(userPermissions);
  return accessible.length ? accessible[0].to : null;
};

/** Redirección por defecto: intenta HOME_ROUTE, si no la primera accesible, si no "/unauthorized" */
export const getDefaultRedirect = (userPermissions: Permission[]): string => {
  const homeRoute = getAllRoutes().find((r) => r.to === HOME_ROUTE);
  if (homeRoute && hasAccess(homeRoute.permissions, userPermissions))
    return HOME_ROUTE;
  const first = getFirstAccessibleRoute(userPermissions);
  return first ?? "/unauthorized";
};
