// models/interview.model.ts


export interface Dependientes{
  nombre:string,
  apellido_paterno:string,
  apellido_materno:string,
  id_vinculo:number,
  esta_riesgo:boolean,
}
export interface RedApoyo {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  id_vinculo: number;
  cuenta_apoyo: boolean;
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

  fecha_hecho: string;
  hora_hecho: string;
  dia_festivo: boolean;
  conoce_autoridad_asunto: boolean;
  canalizado_cabi: boolean;

  // clasificacion de violencia
  id_tipos_violencia: number[];
  especifique_tipo_violencia: string;
  id_ambitos_violencia: number[];
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
  id_identidad_genero_agresor: number;
  id_orientacion_sexual_agresor: number;
  vive_domicilio_victima: boolean;
  codigo_postal_agresor: number;
  colonia_agresor: string;
  estado_agresor: string;
  municipio_agresor: string;
  localidad_agresor: string;
  calle_agresor: string;
  num_ext_agresor: number;
  num_int_agresor: number;
  entre_calles_agresor: string;
  referencias_agresor: string;
  zona_agresor: string;
}
export interface InterviewTable extends InterviewForm {}