export interface ProccessJuridic {
  id: number;
  id_evaluaciones_juridicas: number;
  id_tipo_caso_incidente: number;

  actor: string;
  expediente: string;
  juzgado: string;
  fecha_presentacion: string;
  evidencias_presentacion: string[];
  comentarios_presentacion: string;
  fecha_radicacion: string;
  comentarios_radicacion: string;
  evidencias_radicacion: string[];
  fecha_audiencia: string;
  comentarios_audiencia: string;
  evidencias_audiencia: string[];

  fecha_exhorto: string;
  comentarios_exhorto: string;
  evidencias_exhorto: string[];

  fecha_oficios: string;
  comentarios_oficio: string;
  evidencias_oficio: string[];

  tipo_promocion: string;
  comentarios_promocion: string;
  evidencias_promocion: string[];

  fecha_setencia: string;
  comentarios_setencia: string;
  evidencias_setencia: string[];
}


