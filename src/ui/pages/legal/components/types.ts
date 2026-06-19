// types/casos.ts


// types/casos.ts

export type Caso = {
  id: string;
  nombre: string;
  tipo: string;
  id_evaluaciones_juridicas?: number;  // ← Hacer opcional
  id_tipo_caso_incidente?: number;     // ← Hacer opcional
  fecha_presentacion?: string;
  comentarios_presentacion?: string;
  evidencias_presentacion?: any[];
  fecha_radicacion?: string;
  comentarios_radicacion?: string;
  evidencias_radicacion?: any[];
  fecha_audiencia?: string;
  comentarios_audiencia?: string;
  evidencias_audiencia?: any[];
  fecha_exhorto?: string;
  comentarios_exhorto?: string;
  evidencias_exhorto?: any[];
  fecha_oficios?: string;
  comentarios_oficio?: string;
  evidencias_oficio?: any[];
  tipo_promocion?: string;
  comentarios_promocion?: string;
  evidencias_promocion?: any[];
  fecha_sentencia?: string;
  comentarios_sentencia?: string;
  evidencias_sentencia?: any[];
  // ... otras propiedades que puedan venir de inc.proceso
  [key: string]: any; // ← Opcional: para propiedades adicionales
};
