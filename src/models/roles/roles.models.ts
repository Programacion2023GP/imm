export interface RolesForm {
  id: number;
  nombre_rol: string;
  descripcion: string;
  // modulo: string;
  activo: boolean;
  permissions:number[]
}

// 2. Interfaz para la tabla (datos enriquecidos)
export interface RolesTable extends RolesForm {}
