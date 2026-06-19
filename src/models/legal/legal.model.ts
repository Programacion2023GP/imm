import { ProccessJuridic } from "../proccessjuridic/processjuridic";

export interface Legal {
  id?: number;
  id_entrevista: number; // Vinculación con Módulo I
  fecha_apertura: Date | string; // Fecha de apertura del expediente
  id_responsable: number; // Abogada/o responsable
  fecha_asesoria: Date | string; // Fecha de asesoría inicial
  hechos: string;
  id_tipo_asesoria: number;
  id_estatus_caso: number;
  id_casos_incidentes: number[];
  fecha_acompanamiento: string;
  fecha_denuncia: string;
  nombre_imputado: string;
  carpeta_investigacion: number;
  causa_penal: number;
  comentarios_procesales: string;
  id_autoridad_emisora: number;
  fecha_solicitud: string;
  fecha_audiencia: string;
  fecha_medida: string;
  fecha_termino_medida: string;
  id_tipo_medida: number;
  descripcion_medida:string,
  fecha_cierre:string,
  id_motivo_cierre:string,
  observaciones:string,
}
export interface LegalTable extends Legal {
  folio: number;
  edad: number;
  nombre: string;
  telefono: string;
  colonia: string;
  estado: string;
  municipio: string;
  calle: string;
  nombre_agresor:string,
  relacion_victima:string,
  incidentes: {
    id: number;
    nombre: string;
    proceso: ProccessJuridic | null; // ✅ Así se pone
  }[];
}

