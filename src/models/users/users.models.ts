export interface UsersForm {
  id: number;
  usuario: string;
  password: string;
  nombre_completo: string;
  activo: boolean;
  id_rol:number,
}

// 2. Interfaz para la tabla (datos enriquecidos)
export interface UsersTable extends UsersForm {}
