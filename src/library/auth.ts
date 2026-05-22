// services/auth.service.ts
import axios from "axios";

export interface AuthData {
  auth: {
    id: number;
    usuario: string;
    nombre_completo: string;
    id_rol: number;
    activo: number;
  };
  token: string;
  permisos: string[];
}

const AUTH_KEY = "auth-persist";

class AuthService {
  // Guardar datos de autenticación
  setAuthData(data: AuthData): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    localStorage.setItem("token", data.token);
  }

  // Obtener todos los datos de autenticación
  getAuthData(): AuthData | null {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthData;
    } catch {
      return null;
    }
  }

  // Obtener solo el token
  getToken(): string | null {
    const authData = this.getAuthData();
    return authData?.token || localStorage.getItem("token");
  }

  // Obtener el usuario
  getUser() {
    return this.getAuthData()?.auth || null;
  }

  // Obtener los permisos
  getPermissions(): string[] {
    return this.getAuthData()?.permisos || [];
  }

  // Verificar si tiene un permiso específico
  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("token");
  }
}

export const authService = new AuthService();
