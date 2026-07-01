// models/interview.model.ts

import UseInterview from "../../ui/hooks/interview/interviewdata";

export interface Dependientes {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  id_vinculo: number;
  edad:number,
  esta_riesgo: boolean;
}
export interface RedApoyo {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  id_vinculo: number;
  cuenta_apoyo: boolean;
  telefono:number,
}

export interface InterviewForm {
  // Identificación
  id: number;
  curp: string;
  //2 hechos
  hechos: string;
  id_espacio_digital: number[];
  id_espacio_particular: number[];
  id_espacio_publico: number[];
  id_transporte_foraneo: number[];
  id_transporte_urbano: number[];
  id_transporte_privado: number[];
  ocurrio_domicilio_victima: boolean;
  especifica_domicilio: string;
  sector: string;
  ocurrio_extranjero: boolean;
  latitud: number;
  longitud: number;
  fecha_hecho: string;
  hora_hecho: string;
  dia_festivo: boolean;
  conoce_autoridad_asunto: boolean;
  canalizado_cabi: boolean;

  // clasificacion de violencia
  id_tipos_violencia: number[];

  especifique_tipo_violencia: string;
  id_ambitos_violencia: number[];
  especifique_ambito_violencia: string;
  victima_delicuencia_organizada: boolean;
  relacion_denuncia: boolean;
  relacionado_orientacion_indetidad_genero: boolean;

  // Efectos de la violencia
  id_efectos_fisicos: number[];
  especifique_efecto_fisico: string;
  id_consecuencias_sexuales: number[];
  especifique_consecuencia_sexual: string;

  id_efectos_psicologicos: number[];
  especifique_efecto_psicologico: string;

  id_efectos_economicos_patrimoniales: number[];
  especifique_economicos_patrimonial: string;

  id_agente_lesion: number[];
  especifique_agente_lesion: string;

  id_aerea_anatomica_lesionada: number[];
  especifique_aerea_anatomica_lesionada: string;

  // 5 DATOS DE LA VICTIMA
  nombre: string;
  vive_extrajero: boolean;
  fecha_nacimiento: string;
  edad: number;
  telefono: string;
  correo: string;
  id_orientacion_sexual: number;
  id_identidad_genero: number;
  id_estado_civil: number;
  id_ultimo_grado_estudios: number;
  id_ingreso_promedio_mensual: number;
  id_actividad: number;
  realiza_mas_actividades: boolean;
  id_servicio_medico: number;
  vive_extranjero: boolean;
  codigo_postal: number;
  colonia: string;
  estado: string;
  municipio: string;
  localidad: string;
  calle: string;
  num_ext: number;
  num_int: number;
  entre_calles: string;
  referencias: string;
  zona: string;
  // 5 DATOS DE LA VICTIMA - CONDICIONES ESPECIFICAS

  migrante: boolean;
  pertenece_pueblo_indigena: boolean;
  autoidentificacion_etnica: string;
  tiene_discapacidad: boolean;
  id_discapacidad: number;
  discapacidad_causada_violencia: boolean;
  enfermedad_cronica_degenerativa: boolean;
  trastorno_neurologico_mental: boolean;
  tratado_medicamente_actualmente: boolean;
  embarazo: boolean;
  semananas_embarazo: number;
  tiene_dependientes: boolean;
  // 5 DATOS DE LA VICTIMA - DEPENDIENTES
  dependientes: Dependientes[];
  // 5 DATOS DE LA VICTIMA - RED APOYO

  redapoyo: RedApoyo[];
  // 5 DATOS DE LA VICTIMA - OTRAS CONDICIONES

  vive_situacion_calle: boolean;
  tiene_adiccion: boolean;
  conducta: string;
  // 6 PERSONA AGRESORA
  conoce_agresor: boolean;
  nombre_agresor: string;

  edad_agresor: string;
  sexo_agresor: string;
  id_vinculo_agresor: number;
  id_identidad_genero_agresor: number;
  id_orientacion_sexual_agresor: number;
  vive_domicilio_victima: boolean;

  codigo_postal_agresor: number;
  colonia_agresor: string;
  estado_agresor: string;
  municipio_agresor: string;
  calle_agresor: string;
  num_ext_agresor: number;
  num_int_agresor: number;
  entre_calles_agresor: string;
  referencias_agresor: string;
  zona_agresor: string;
  id_ultimo_grado_estudios_agresor: number;
  id_ingreso_promedio_mensual_agresor: number;
  id_ocupacion_agresor: number;
  acceso_armas_agresor: boolean;
  id_armas_agresor: number;
  acceso_drogas_agresor: boolean;

  id_drogas_agresor: number[];
  //Ruta de antencion

  id_servicios_trabajo_social: number[];
  id_servicios_juridicos: number[];
  id_servicios_psicologicos: number[];
  comentarios_ruta_antencion: string;

  //CANALIZACION
  id_dependencia: number;
  especifica_dependencia: string;
  id_canalizacion: number;
  fecha_canalizacion: string;
  responsable: string;
  observaciones: string;
}
export interface InterviewTable extends InterviewForm {
  creado_por: string;
  created_at:string,
}

export interface CatalogoItem {
  id: number;
  nombre: string;
}

// Dependiente
export interface Dependiente {
  id?: number;
  entrevista_id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  id_vinculo: number;
  vinculo_nombre: string;
  esta_riesgo: boolean;
  esta_riesgo_texto: string;
  created_at?: string;
  updated_at?: string;
}

// Red de apoyo
export interface RedApoyo {
  id?: number;
  entrevista_id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  id_vinculo: number;
  vinculo_nombre: string;
  cuenta_apoyo: boolean;
  cuenta_apoyo_texto: string;
  created_at?: string;
  updated_at?: string;
}

// Entrevista completa (respuesta del show)
export interface EntrevistaShowResponse {
  // Campos básicos
  id: number;
  curp: string;
  especifica_domicilio: string | null;
  especifique_tipo_violencia: string | null;
  especifique_efecto_fisico: string | null;
  especifique_consecuencia_sexual: string | null;
  especifique_efecto_psicologico: string | null;
  especifique_economicos_patrimonial: string | null;
  especifique_agente_lesion: string | null;
  especifique_aerea_anatomica_lesionada: string | null;
  correo: string;
  localidad: string | null;
  calle: string;
  estado: string;
  municipio: string;
  zona: string;
  nombre_agresor: string | null;
  calle_agresor: string | null;
  estado_agresor: string | null;
  municipio_agresor: string | null;
  zona_agresor: string | null;
  responsable: string;
  especifica_dependencia: string | null;
  hora_hecho: string;
  hechos: string;
  entre_calles: string | null;
  referencias: string | null;
  observaciones: string | null;
  edad: number;
  telefono: number;
  codigo_postal: number;
  num_ext: string | null;
  num_int: string | null;
  semananas_embarazo: number | null;
  edad_agresor: number | null;
  codigo_postal_agresor: number | null;
  num_ext_agresor: string | null;
  num_int_agresor: string | null;

  // IDs (para referencia)
  id_espacio_digital: number[];
  id_espacio_particular: number[];
  id_espacio_publico: number[];
  id_transporte_foraneo: number[];
  id_transporte_privado: number[];
  id_transporte_urbano: number[];
  id_tipos_violencia: number[];
  id_ambitos_violencia: number[];
  id_efectos_fisicos: number[];
  id_consecuencias_sexuales: number[];
  id_efectos_psicologicos: number[];
  id_efectos_economicos_patrimoniales: number[];
  id_agente_lesion: number[];
  id_aerea_anatomica_lesionada: number[];
  id_orientacion_sexual: number;
  id_identidad_genero: number;
  id_estado_civil: number;
  id_ultimo_grado_estudios: number;
  id_ingreso_promedio_mensual: number;
  id_actividad: number;
  id_servicio_medico: number;
  id_discapacidad: number | null;
  id_vinculo_agresor: number | null;
  id_identidad_genero_agresor: number | null;
  id_orientacion_sexual_agresor: number | null;
  id_ultimo_grado_estudios_agresor: number | null;
  id_ingreso_promedio_mensual_agresor: number | null;
  id_ocupacion_agresor: number | null;
  id_armas_agresor: number | null;
  id_drogas_agresor: number[];
  id_servicios_trabajo_social: number[];
  id_servicios_juridicos: number[];
  id_servicios_psicologicos: number[];
  id_dependencia: number;
  id_canalizacion: number;

  // Nombres resueltos (campos simples)
  orientacion_sexual_nombre: string;
  identidad_genero_nombre: string;
  estado_civil_nombre: string;
  ultimo_grado_estudios_nombre: string;
  ingreso_promedio_mensual_nombre: string;
  actividad_nombre: string;
  servicio_medico_nombre: string;
  discapacidad_nombre?: string | null;
  vinculo_agresor_nombre?: string | null;
  identidad_genero_agresor_nombre?: string | null;
  orientacion_sexual_agresor_nombre?: string | null;
  ultimo_grado_estudios_agresor_nombre?: string | null;
  ingreso_promedio_mensual_agresor_nombre?: string | null;
  ocupacion_agresor_nombre?: string | null;
  arma_agresor_nombre?: string | null;
  drogas_agresor_nombres: string;
  dependencia_nombre: string;
  canalizacion_nombre: string;

  // Nombres resueltos (campos múltiples)
  espacio_digital_nombres: string;
  espacio_particular_nombres: string;
  espacio_publico_nombres: string;
  transporte_foraneo_nombres: string;
  transporte_privado_nombres: string;
  transporte_urbano_nombres: string;
  tipos_violencia_nombres: string;
  ambitos_violencia_nombres: string;
  efectos_fisicos_nombres: string;
  consecuencias_sexuales_nombres: string;
  efectos_psicologicos_nombres: string;
  efectos_economicos_nombres: string;
  agente_lesion_nombres: string;
  area_anatomica_nombres: string;
  servicios_trabajo_social_nombres: string;
  servicios_juridicos_nombres: string;
  servicios_psicologicos_nombres: string;

  // Colonias
  colonia: string | number | null;
  colonia_nombre: string;
  colonia_agresor: string | number | null;
  colonia_agresor_nombre: string;

  // Fechas
  fecha_hecho: string;
  fecha_nacimiento: string;
  fecha_canalizacion: string;

  // Arrays anidados
  dependientes: Dependiente[];
  redapoyo: RedApoyo[];

  // Toggles (booleanos)
  ocurrio_domicilio_victima: boolean;
  ocurrio_extranjero: boolean;
  dia_festivo: boolean;
  conoce_autoridad_asunto: boolean;
  canalizado_cabi: boolean;
  victima_delicuencia_organizada: boolean;
  relacion_denuncia: boolean;
  relacionado_orientacion_indetidad_genero: boolean;
  vive_extrajero: boolean;
  realiza_mas_actividades: boolean;
  migrante: boolean;
  pertenece_pueblo_indigena: boolean;
  tiene_discapacidad: boolean;
  discapacidad_causada_violencia: boolean;
  enfermedad_cronica_degenerativa: boolean;
  trastorno_neurologico_mental: boolean;
  tratado_medicamente_actualmente: boolean;
  embarazo: boolean;
  tiene_dependientes: boolean;
  vive_situacion_calle: boolean;
  tiene_adiccion: boolean;
  conoce_agresor: boolean;
  vive_domicilio_victima: boolean;
  acceso_armas_agresor: boolean;
  acceso_drogas_agresor: boolean;

  // Radio buttons
  sector: string;
  autoidentificacion_etnica: string;
  conducta: string | null;
  sexo_agresor: string | null;

  // Metadata
  id_user_created?: number;
  created_at?: string;
  updated_at?: string;
}

// domains/interfaces.ts

export interface AperturaForm {
  curp: string;
}
export interface HooksInterview {
  UseInterview: ReturnType<typeof UseInterview>;
}
export interface HechosForm {
  hechos: string;
  id_espacio_digital: number[];
  id_espacio_particular: number[];
  id_espacio_publico: number[];
  id_transporte_foraneo: number[];
  id_transporte_privado: number[];
  id_transporte_urbano: number[];
  sector: string;
  fecha_hecho: string;
  hora_hecho: string;
  ocurrio_extranjero: boolean;
  dia_festivo: boolean;
  conoce_autoridad_asunto: boolean;
  canalizado_cabi: boolean;
  ocurrio_domicilio_victima: boolean;
  especifica_domicilio: string;
}

export interface ViolenciaForm {
  id_tipos_violencia: number[];
  especifique_tipo_violencia: string;
  id_ambitos_violencia: number[];
  victima_delicuencia_organizada: boolean;
  relacion_denuncia: boolean;
  relacionado_orientacion_indetidad_genero: boolean;
}

export interface EfectosForm {
  id_efectos_fisicos: number[];
  especifique_efecto_fisico: string;
  id_consecuencias_sexuales: number[];
  especifique_consecuencia_sexual: string;
  id_efectos_psicologicos: number[];
  especifique_efecto_psicologico: string;
  id_efectos_economicos_patrimoniales: number[];
  especifique_economicos_patrimonial: string;
  id_agente_lesion: number[];
  especifique_agente_lesion: string;
  id_aerea_anatomica_lesionada: number[];
  especifique_aerea_anatomica_lesionada: string;
}

export interface VictimaForm {
  fecha_nacimiento: string;
  edad: number;
  telefono: string;
  correo: string;
  id_orientacion_sexual: number;
  id_identidad_genero: number;
  id_estado_civil: number;
  id_ultimo_grado_estudios: number;
  id_ingreso_promedio_mensual: number;
  id_actividad: number;
  realiza_mas_actividades: boolean;
  id_servicio_medico: number;
  vive_extranjero: boolean;
  codigo_postal: number;
  colonia: string;
  estado: string;
  municipio: string;
  localidad: string;
  calle: string;
  num_ext: number;
  num_int: number;
  entre_calles: string;
  referencias: string;
  zona: string;
  migrante: boolean;
  pertenece_pueblo_indigena: boolean;
  autoidentificacion_etnica: string;
  tiene_discapacidad: boolean;
  id_discapacidad: number;
  discapacidad_causada_violencia: boolean;
  enfermedad_cronica_degenerativa: boolean;
  trastorno_neurologico_mental: boolean;
  tratado_medicamente_actualmente: boolean;
  embarazo: boolean;
  semananas_embarazo: number;
  tiene_dependientes: boolean;
  dependientes: any[]; // se tipará más adelante
  redapoyo: any[];
  vive_situacion_calle: boolean;
  tiene_adiccion: boolean;
  conducta: string;
}

export interface AgresorForm {
  conoce_agresor: boolean;
  nombre_agresor: string;
  edad_agresor: string;
  sexo_agresor: string;
  id_vinculo_agresor: number;
  id_identidad_genero_agresor: number;
  id_orientacion_sexual_agresor: number;
  vive_domicilio_victima: boolean;
  codigo_postal_agresor: number;
  colonia_agresor: string;
  estado_agresor: string;
  municipio_agresor: string;
  calle_agresor: string;
  num_ext_agresor: number;
  num_int_agresor: number;
  entre_calles_agresor: string;
  referencias_agresor: string;
  zona_agresor: string;
  id_ultimo_grado_estudios_agresor: number;
  id_ingreso_promedio_mensual_agresor: number;
  id_ocupacion_agresor: number;
  acceso_armas_agresor: boolean;
  id_armas_agresor: number;
  acceso_drogas_agresor: boolean;
  id_drogas_agresor: number[];
}

export interface RutaAtencionForm {
  id_servicios_trabajo_social: number[];
  id_servicios_juridicos: number[];
  id_servicios_psicologicos: number[];
}

export interface CanalizacionForm {
  id_dependencia: number;
  especifica_dependencia: string;
  id_canalizacion: number;
  fecha_canalizacion: string;
  responsable: string;
  observaciones: string;
}