export interface PermissionForm {
  id: number;
  nombre_permiso: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
}

// 2. Interfaz para la tabla (datos enriquecidos)
export interface PermissionsTable extends PermissionForm {
}
