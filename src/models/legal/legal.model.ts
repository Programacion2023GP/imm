export interface Legal {
  id?: number;
  id_entrevista: number; // Vinculación con Módulo I
  fecha_apertura: Date | string; // Fecha de apertura del expediente
  id_responsable: number; // Abogada/o responsable
  fecha_asesoria: Date | string; // Fecha de asesoría inicial
  id_asesoria: number; // Tipo de asesoría / materia (ID del catálogo)
  hechos: string; 
  activo: boolean; // Estatus del caso (true = Activo, false = Cerrado)
}
