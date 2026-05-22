import { useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";

export interface User {
  id: number;
  usuario: string;
  password: string;
  nombre_completo: string;
  id_rol: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export interface Auth {
  id: number;
  usuario: string;
  password: string;
  nombre_completo?: string;
  id_rol?: number;
  activo?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  permisos: string[];
  token_type: string;
}

export interface AuthPersistState {
  auth: Auth | null;
  token: string;
  permisos: string[];
  
}

export interface AuthExtension {
  login: (
    usuario: string,
    password: string,
    navigate?: (path: string) => void,
  ) => Promise<void>; // ✅ Añadir navigate como parámetro opcional
  logout: () => Promise<void>;
  hasPermission: (permiso: string) => boolean;
  hasAnyPermission: (permisos: string[]) => boolean;
  hasPermissionPrefix: (prefix: string) => boolean; // ✅ NUEVO: verifica si existe algún permiso que empiece con el prefijo
  getFirstPermissionByPrefix: (prefix: string) => string | null; // ✅ Obtiene el primer permiso que coincide
  getRedirectRouteByPrefix: (
    routes: Record<string, string>,
    defaultRoute?: string,
  ) => string; // ✅ Redirige según prefijo
}

export interface AuthExtraState {}

export type AuthDataReturn = GenericDataReturn<
  Auth,
  AuthExtension,
  AuthPersistState,
  AuthExtraState
>;

const useAuthData = (): AuthDataReturn => {
  const defaultData = useMemo<Auth>(
    () => ({ id: 0, usuario: "", password: "" }),
    [],
  );

  return useGenericData<Auth, AuthExtension, AuthPersistState, AuthExtraState>({
    initialState: defaultData,
    prefix: "auth",
    autoFetch: false,
    persistKey: "auth-persist",

    extension: (set, get, persist) => ({
      // useAuthData.ts (solo la parte del login)
      login: async (usuario, password, navigate) => {
        try {
          const res = await get().request({
            url: `${get().prefix}/login`,
            method: "POST",
            data: { usuario, password },
            getData: false,
          });
          const response = res as unknown as AuthResponse;

          if (response?.user) {
            // Guardar en persistencia
            persist?.set("auth", {
              id: response.user.id,
              usuario: response.user.usuario,
              password: response.user.password,
              nombre_completo: response.user.nombre_completo,
              id_rol: response.user.id_rol,
              activo: response.user.activo,
            });
            console.log("respuesta", response);
            persist?.set("token", response.token);
            persist?.set("permisos", response.permisos);
            //   localStorage.setItem
            // ✅ Redirigir usando los permisos de la respuesta (no los del persist)
            if (navigate) {
              const routesByPrefix = {
                EXPEDIENTE_1: "/expedienteuno",
                USUARIOS_: "/catalogos/usuarios",
                EXPEDIENTE_2: "/expedientedos",
                EXPEDIENTE_3: "/expedientetres",
              };
              let redirectUrl = "/dashboard";
              for (const permiso of response.permisos) {
                for (const [prefix, route] of Object.entries(routesByPrefix)) {
                  if (permiso.startsWith(prefix)) {
                    redirectUrl = route;
                    break;
                  }
                }
                if (redirectUrl !== "/dashboard") break;
              }
              navigate(redirectUrl);
            }
          }
        } catch (error) {
          console.error("Error en login:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await get().request({
            url: `${get().prefix}/logout`,
            method: "GET",
            getData: false,
          });
          persist?.set("auth", null);
          persist?.set("token", "");
          persist?.set("permisos", []);
        } catch (error) {
          console.error("Error en logout:", error);
          throw error;
        }
      },

      hasPermission: (permiso: string): boolean => {
        return (persist?.get("permisos") || []).includes(permiso);
      },

      hasAnyPermission: (permisosList: string[]): boolean => {
        const userPermisos = persist?.get("permisos") || [];
        return permisosList.some((p) => userPermisos.includes(p));
      },

      // ✅ Verifica si existe algún permiso que empiece con el prefijo
      hasPermissionPrefix: (prefix: string): boolean => {
        const userPermisos = persist?.get("permisos") || [];
        return userPermisos.some((p) => p.startsWith(prefix));
      },

      // ✅ Obtiene el primer permiso que coincide con el prefijo
      getFirstPermissionByPrefix: (prefix: string): string | null => {
        const userPermisos = persist?.get("permisos") || [];
        return userPermisos.find((p) => p.startsWith(prefix)) || null;
      },

      // ✅ Redirige según el prefijo del permiso
      getRedirectRouteByPrefix: (
        routes: Record<string, string>,
        defaultRoute: string = "/dashboard",
      ): string => {
        const userPermisos = persist?.get("permisos") || [];

        // Buscar el primer permiso que coincida con alguna clave de routes
        for (const permiso of userPermisos) {
          for (const [prefix, route] of Object.entries(routes)) {
            if (permiso.startsWith(prefix)) {
              return route;
            }
          }
        }
        return defaultRoute;
      },
    }),
  });
};

export default useAuthData;
