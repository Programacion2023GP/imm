import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

export type Permission = string;

/**
 * Una ruta navegable con página asociada.
 */
export interface RouteItem {
  type: "route";
  /** Ruta completa, ej: "/catalogos/departamentos" */
  to: string;
  /** Nombre que aparece en el menú */
  name: string;
  icon?: ReactNode;
  /**
   * Permisos necesarios para ver esta ruta.
   * - `null`  → acceso libre (solo requiere estar autenticado)
   * - string[] → necesita al menos UNO de esos permisos
   */
  permissions: Permission[] | null;
  /** Componente lazy que se renderiza */
  page: LazyExoticComponent<ComponentType<any>>;
  /** Mostrar en el menú lateral (default: true) */
  inMenu?: boolean;
}

/**
 * Un grupo colapsable en el menú con rutas hijo.
 */
export interface GroupItem {
  type: "group";
  name: string;
  icon?: ReactNode;
  children: RouteItem[];
}

export type NavItem = RouteItem | GroupItem;
