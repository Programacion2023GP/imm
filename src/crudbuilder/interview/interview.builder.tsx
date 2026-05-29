import { FaList } from "react-icons/fa";
import { ConfigCrud } from "../../models/genericmodels.model";
import type {
  InterviewForm,
  InterviewTable,
} from "../../models/interview/interview.model";
import UseDigitalSpace from "../../ui/hooks/digitalspace/usedigitalspacedata";
import UseParticleSpace from "../../ui/hooks/particlespace/useparticlespacedata";
import UsePublicSpace from "../../ui/hooks/publicspace/usepublicspacedata";
import UseForeignTransportation from "../../ui/hooks/foreigntransportation/useforeigntransportationdata";
import UsePrivateTransportation from "../../ui/hooks/privatetransportation/useprivatetransportationdata";
import UseUrbanTransportation from "../../ui/hooks/urbantransport/useurbantransportdata";
import UseViolenceType from "../../ui/hooks/violencetype/useviolencetypedata";
import UseViolenceAerea from "../../ui/hooks/violenceaerea/useviolenceaeradata";
import UsePhysicalEffects from "../../ui/hooks/physicaleffects/usephysicaleffectsdata";
import UseSexualConsequences from "../../ui/hooks/sexualconsequences/usesexualconsequencesdata";
import UsePsychologicalEffects from "../../ui/hooks/psychologicaleffects/usepsychologicaldata";
import UseEconomicProperyEffects from "../../ui/hooks/economicproperyeffects/useeconomicproperyeffectsdata";
import UseInruringAgent from "../../ui/hooks/inruringagent/useinruringagentdata";
import UseInjuredAnatomicAlarea from "../../ui/hooks/injuredanatomicalarea/useinjuredanatomicalareadata";
import { GenericDataReturn } from "../../library/reactztore/hook/usegenericdata";
import UseInterview, { InterviewDataReturn } from "../../ui/hooks/interview/interviewdata";
import UseSexualOrientationData from "../../ui/hooks/sexualorientation/usesexualorientationdata";
import UseGenderIndentityData from "../../ui/hooks/genderidentity/usegenderidentitydata";
import UseMaritalStatusData from "../../ui/hooks/maritalstatus/usemaritalstatusdata";
import UseEducationLevelData from "../../ui/hooks/educationlevel/useeducationleveldata";
import UseAverageIncomeData from "../../ui/hooks/averageincome/useaverageincomedata";
import UseMainActivityData from "../../ui/hooks/mainactivity/usemainactivitydata";
import UseHealtInsuranceData from "../../ui/hooks/healtinsurance/usehealtinsurancedata";
import UseDisabilitiesData from "../../ui/hooks/disabilities/usedisabilitiesdata";
import UseRelationShipData from "../../ui/hooks/relationship/userelationshipdata";
import UseOcupationsData from "../../ui/hooks/ocupations/useocupationsdata";
import UseWeapons from "../../ui/hooks/weapons/useweaponsdata";
import UseSocialWorkData from "../../ui/hooks/socialwork/usesocialworkdata";
import UseLegalServiceData from "../../ui/hooks/legalservices/uselegalservicedata";
import UsePsYchologicalServicesData from "../../ui/hooks/psychologicalservices/usepsychologicalservicesdata";
import UseDependencesData from "../../ui/hooks/dependences/usedependencesdata";
import UseCanalizationData from "../../ui/hooks/canalization/usecanalizationdata";

// 📱 Responsive presets
const ResponsiveToogle = {
  "2xl": 4,
  xl: 4,
  md: 6,
};

const ResponsiveSelectAndDate = {
  "2xl": 6,
  xl: 6,
  lg: 12,
  md: 12,
  sm: 12,
};
interface Hooks {
  UseInterview: ReturnType<typeof UseInterview>;
}

// ============================================================================
// CONFIGURACIÓN PRINCIPAL DEL CRUD
// ============================================================================
export const interviewBuilderCrud = ConfigCrud<InterviewForm, InterviewTable, Hooks>()
  // ==========================================================================
  // 1. DECLARACIÓN DE CAMPOS POR TIPO
  // ==========================================================================
  .fields({
    // 📝 Campos de texto
    text: [
      "curp", // CURP del usuario
      "hechos", // Narración de los hechos
      "especifica_domicilio", // Especificación del domicilio
      "especifique_tipo_violencia", // Especificación de tipo de violencia
      "especifique_efecto_fisico",
      "especifique_consecuencia_sexual",
      "especifique_efecto_psicologico",
      "especifique_economicos_patrimonial",
      "especifique_agente_lesion",
      "especifique_aerea_anatomica_lesionada",
      "correo",

      "localidad",
      "calle",
      "estado",
      "municipio",
      "zona",

      "nombre_agresor",

      "calle_agresor",
      "estado_agresor",
      "municipio_agresor",
      "zona_agresor",
      "responsable",
      "especifica_dependencia",
    ],
    textarea: ["entre_calles", "referencias", "observaciones"],
    number: [
      "edad",
      "telefono",
      "codigo_postal",
      "num_ext",
      "num_int",
      "semananas_embarazo",
      "edad_agresor",
      "codigo_postal_agresor",
      "num_ext_agresor",
      "num_int_agresor",
    ],
    // 🔽 Campos de selección (dropdowns)
    select: [
      "id_espacio_digital", // Espacio digital (redes sociales, internet)
      "id_espacio_particular", // Espacio particular (casa particular)
      "id_espacio_publico", // Espacio público (calle, parque)
      "id_transporte_foraneo", // Transporte foráneo (autobús, avión)
      "id_transporte_urbano", // Transporte urbano (metro, camión)
      "id_transporte_privado", // Transporte privado (auto particular)
      "id_tipos_violencia", // Tipos de violencia ejercida
      "id_ambitos_violencia", // Ámbitos donde ocurrió la violencia
      "id_efectos_fisicos",
      "id_consecuencias_sexuales",
      "id_efectos_psicologicos",
      "id_efectos_economicos_patrimoniales",
      "id_agente_lesion",
      "id_aerea_anatomica_lesionada",
      "colonia",
      "id_orientacion_sexual",
      "id_identidad_genero",
      "id_estado_civil",
      "id_ultimo_grado_estudios",
      "id_ingreso_promedio_mensual",
      "id_actividad",
      "id_servicio_medico",
      "id_discapacidad",
      "id_vinculo_agresor",
      "id_identidad_genero_agresor",
      "id_orientacion_sexual_agresor",
      "colonia_agresor",
      "id_ultimo_grado_estudios_agresor",
      "id_ingreso_promedio_mensual_agresor",
      "id_ocupacion_agresor",
      "id_armas_agresor",
      "id_drogas_agresor",
      "id_servicios_trabajo_social",
      "id_servicios_juridicos",
      "id_servicios_psicologicos",
      "id_dependencia",
      "id_canalizacion",
    ],

    // 🔘 Campos toggle (switch on/off)
    toggle: [
      "ocurrio_domicilio_victima", // ¿Ocurrió en domicilio de la víctima?
      "ocurrio_extranjero", // ¿Ocurrió en el extranjero?
      "dia_festivo", // ¿Fue día festivo?
      "conoce_autoridad_asunto", // ¿Conoce alguna autoridad del asunto?
      "canalizado_cabi", // ¿El caso fue canalizado por CABI?
      "victima_delicuencia_organizada", // ¿Víctima de delincuencia organizada?
      "relacion_denuncia", // ¿Está relacionado con alguna denuncia?
      "relacionado_orientacion_indetidad_genero", // ¿Relacionado con orientación sexual o identidad de género?
      "vive_extrajero",
      "realiza_mas_actividades",
      "migrante",
      "pertenece_pueblo_indigena",
      "tiene_discapacidad",
      "discapacidad_causada_violencia",
      "enfermedad_cronica_degenerativa",
      "trastorno_neurologico_mental",
      "tratado_medicamente_actualmente",
      "embarazo",
      "tiene_dependientes",
      "vive_situacion_calle",
      "tiene_adiccion",
      "conoce_agresor",
      "vive_domicilio_victima",
      "acceso_armas_agresor",
      "acceso_drogas_agresor",
    ],
    // ⭕ Campos radio (selección única)
    radio: ["sector", "autoidentificacion_etnica", "conducta", "sexo_agresor"], // Sector: Rural / Urbano
    // 📅 Campos de fecha
    date: [
      "fecha_hecho", // Fecha en que ocurrió el hecho
      "hora_hecho", // Hora en que ocurrió el hecho
      "fecha_nacimiento",
      "fecha_canalizacion",
    ],
    array: ["dependientes", "redapoyo"],
  })
  .number({
    edad: {
      label: "Edad",
      responsive: ResponsiveSelectAndDate,
    },
    codigo_postal: {
      label: "codigo postal",
      onChange: async (val, formik, hook) => {
        hook.UseInterview.getCp(val);
      },
      responsive: ResponsiveSelectAndDate,
    },
    num_ext: {
      label: "Número exterior",
      responsive: ResponsiveSelectAndDate,
    },
    num_int: {
      label: "Número interior",
    },
    telefono: {
      label: "Telefono",
      responsive: ResponsiveSelectAndDate,
    },
    semananas_embarazo: {
      label: "Semanas de embarazo",
      hidden: (values) => !values.embarazo,
    },
    edad_agresor: {
      label: "Edad",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    codigo_postal_agresor: {
      label: "codigo postal",
      onChange: async (val, formik, hook) => {
        hook.UseInterview.getCpAgresor(val);
      },
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    num_ext_agresor: {
      label: "Número exterior",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    num_int_agresor: {
      label: "Número interior",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
  })

  // ==========================================================================
  // 2. CONFIGURACIÓN DE CAMPOS DE FECHA
  // ==========================================================================
  .date({
    fecha_hecho: {
      label: "Fecha del hecho",
      responsive: ResponsiveSelectAndDate,
    },
    hora_hecho: {
      label: "Hora del Hecho",
      type: "time", // Usa input tipo "time"
      responsive: ResponsiveSelectAndDate,
    },
    // 🟢 Datos de la victima
    fecha_nacimiento: {
      label: "Fecha de Nacimiento",
      responsive: ResponsiveSelectAndDate,
    },
    fecha_canalizacion: {
      label: "Fecha de canalización",
      responsive: ResponsiveSelectAndDate,
    },
  })

  // ==========================================================================
  // 3. CONFIGURACIÓN DE CAMPOS DE TEXTO
  // ==========================================================================
  .text({
    // 🟢 Apertura del caso
    curp: {
      label: "CURP",
      caseTransform: "uppercase", // Convertir a mayúsculas automáticamente
      placeholder: "CURP (18 caracteres)",
    },
    // 🟡 Narración de los hechos - Hechos
    hechos: {
      label: "Narración de los hechos",
      // caseTransform: "lowercase",       // Opcional: convertir a minúsculas
    },
    // 🟡 Narración de los hechos - Lugar de hechos
    especifica_domicilio: {
      label: "Especifica domicilio",
      hidden: (values) => values.ocurrio_domicilio_victima,

      caseTransform: "uppercase",
    },
    especifique_tipo_violencia: {
      label: "Especifique tipo de violencia",
      placeholder: "Describa el tipo de violencia...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_tipos_violencia?.includes(8), // Se muestra SOLO si NO ocurrió en domicilio de la víctima
    },
    // 🟡EFECTOS DE LA VIOLENCIA

    especifique_efecto_fisico: {
      label: "Especifique efecto físico",
      placeholder: "Describa el efecto físico...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_efectos_fisicos?.includes(14),
    },
    especifique_consecuencia_sexual: {
      label: "Especifique consecuencia sexual",
      placeholder: "Describa el consecuencia sexual...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_consecuencias_sexuales?.includes(8),
    },
    especifique_efecto_psicologico: {
      label: "Especifique efecto psicologico",
      placeholder: "Describa el efecto psicologico...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_efectos_psicologicos?.includes(14),
    },
    especifique_economicos_patrimonial: {
      label: "Especifique Efectos económicos y patrimoniales",
      placeholder: "Describe el efecto economico y patrimoniales...",
      caseTransform: "uppercase",
      hidden: (values) =>
        !values.id_efectos_economicos_patrimoniales?.includes(8),
    },
    especifique_agente_lesion: {
      label: "Especifique Agente de lesión",
      placeholder: "Describe el Agente de lesión...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_agente_lesion?.includes(8),
    },
    especifique_aerea_anatomica_lesionada: {
      label: "Especifique Aerea anatómica lesionada",
      placeholder: "Describe el Aerea anatómica lesionada...",
      caseTransform: "uppercase",
      hidden: (values) => !values.id_aerea_anatomica_lesionada?.includes(16),
    },
    municipio: {
      label: "Municipio",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
    },
    estado: {
      label: "Estado",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
    },
    zona: {
      label: "Zona",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
    },
    calle: {
      label: "Calle",
      responsive: ResponsiveSelectAndDate,
    },
    localidad: {
      label: "Localidad",
      responsive: ResponsiveSelectAndDate,
    },
    correo: {
      label: "Correo",
      responsive: ResponsiveSelectAndDate,
    },
    nombre_agresor: {
      label: "Nombre del agresor",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    estado_agresor: {
      label: "Estado",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    zona_agresor: {
      label: "Zona",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    calle_agresor: {
      label: "Calle",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },

    municipio_agresor: {
      label: "Municipio",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    responsable: {
      label: "Responsable",
      responsive: ResponsiveSelectAndDate,
    },
    especifica_dependencia: {
      label: "Especifica la dependencia",
      hidden: (values) => values.id_dependencia!=8,
    },
 
  })

  // ==========================================================================
  // 4. CONFIGURACIÓN DE CAMPOS DE SELECCIÓN (SELECTS)
  // ==========================================================================
  .select({
    // 🟡 Narración de los hechos - Lugar de hechos (Espacios)
    id_espacio_digital: {
      label: "Espacio Digital",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseDigitalSpace().items,
      refreshActionHook: () => UseDigitalSpace().refresh,
      loadingHook: () => UseDigitalSpace().loading,
      multiple: true, // Permite selección múltiple
      responsive: ResponsiveSelectAndDate,
    },
    id_espacio_particular: {
      label: "Espacio Particular",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseParticleSpace().items,
      refreshActionHook: () => UseParticleSpace().refresh,
      loadingHook: () => UseParticleSpace().loading,

      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_espacio_publico: {
      label: "Espacio Publico",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UsePublicSpace().items,
      refreshActionHook: () => UsePublicSpace().refresh,
      loadingHook: () => UsePublicSpace().loading,

      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },

    // 🟡 Narración de los hechos - Lugar de hechos (Transportes)
    id_transporte_foraneo: {
      label: "Transporte Foraneo",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseForeignTransportation().items,
      refreshActionHook: () => UseForeignTransportation().refresh,
      loadingHook: () => UseForeignTransportation().loading,

      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_transporte_privado: {
      label: "Transporte Privado",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UsePrivateTransportation().items,
      refreshActionHook: () => UsePrivateTransportation().refresh,
      loadingHook: () => UsePrivateTransportation().loading,

      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_transporte_urbano: {
      label: "Transporte Urbano",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseUrbanTransportation().items,
      refreshActionHook: () => UseUrbanTransportation().refresh,
      loadingHook: () => UseUrbanTransportation().loading,

      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },

    // 🟣 Clasificación de la violencia
    id_tipos_violencia: {
      label: "Tipos de violencia",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseViolenceType().items,
      refreshActionHook: () => UseViolenceType().refresh,
      loadingHook: () => UseViolenceType().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_ambitos_violencia: {
      label: "Ámbitos de violencia",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseViolenceAerea().items,
      refreshActionHook: () => UseViolenceAerea().refresh,
      loadingHook: () => UseViolenceAerea().loading,
      responsive: ResponsiveSelectAndDate,
    },
    // 🟣 EFECTOS DE LA VIOLENCIA
    id_efectos_fisicos: {
      label: "Efectos fisicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePhysicalEffects().items,
      refreshActionHook: () => UsePhysicalEffects().refresh,
      loadingHook: () => UsePhysicalEffects().loading,
    },
    id_consecuencias_sexuales: {
      label: "Consecuencias Sexuales",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseSexualConsequences().items,
      refreshActionHook: () => UseSexualConsequences().refresh,
      loadingHook: () => UseSexualConsequences().loading,
    },
    id_efectos_psicologicos: {
      label: "Efectos Psicologicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePsychologicalEffects().items,
      refreshActionHook: () => UsePsychologicalEffects().refresh,
      loadingHook: () => UsePsychologicalEffects().loading,
    },
    id_efectos_economicos_patrimoniales: {
      label: "Efectos Economicos Patrimoniales",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseEconomicProperyEffects().items,
      refreshActionHook: () => UseEconomicProperyEffects().refresh,
      loadingHook: () => UseEconomicProperyEffects().loading,
    },
    id_agente_lesion: {
      label: "Agente de lesión",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseInruringAgent().items,
      refreshActionHook: () => UseInruringAgent().refresh,
      loadingHook: () => UseInruringAgent().loading,
    },
    id_aerea_anatomica_lesionada: {
      label: "Áerea anatómica lesionada",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseInjuredAnatomicAlarea().items,
      refreshActionHook: () => UseInjuredAnatomicAlarea().refresh,
      loadingHook: () => UseInjuredAnatomicAlarea().loading,
    },
    colonia: {
      label: "Colonia",
      keyId: "nombre",
      keyLabel: "nombre",
      // multiple: true,
      selectOptionsHook: () => UseInterview().colonias,
      onChange: async (val, formik, hook) => {
        const colonias = hook.UseInterview.colonias;

        formik.setFieldValue(
          "estado",
          colonias.find((it) => it.nombre == val?.nombre).estado,
        );
        formik.setFieldValue(
          "municipio",
          colonias.find((it) => it.nombre == val?.nombre).municipio,
        );
        formik.setFieldValue(
          "zona",
          colonias.find((it) => it.nombre == val?.nombre).zona,
        );
      },
      loadingHook: () => UseInterview().loadingCp,
      responsive: ResponsiveSelectAndDate,
    },
    id_orientacion_sexual: {
      label: "Orientaciòn sexual",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseSexualOrientationData().items,
      refreshActionHook: () => UseSexualOrientationData().refresh,
      loadingHook: () => UseSexualOrientationData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_identidad_genero: {
      label: "Identidad de género",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseGenderIndentityData().items,
      refreshActionHook: () => UseGenderIndentityData().refresh,
      loadingHook: () => UseGenderIndentityData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_estado_civil: {
      label: "Estado civil",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseMaritalStatusData().items,
      refreshActionHook: () => UseMaritalStatusData().refresh,
      loadingHook: () => UseMaritalStatusData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_ultimo_grado_estudios: {
      label: "Ultimo grado de estudios",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseEducationLevelData().items,
      refreshActionHook: () => UseEducationLevelData().refresh,
      loadingHook: () => UseEducationLevelData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_ingreso_promedio_mensual: {
      label: "Ingresos promedios mensuales",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseAverageIncomeData().items,
      refreshActionHook: () => UseAverageIncomeData().refresh,
      loadingHook: () => UseAverageIncomeData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_actividad: {
      label: "Actividad principal",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseMainActivityData().items,
      refreshActionHook: () => UseMainActivityData().refresh,
      loadingHook: () => UseMainActivityData().loading,
      responsive: ResponsiveSelectAndDate,
    },
    id_servicio_medico: {
      label: "Servicio medico",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseHealtInsuranceData().items,
      refreshActionHook: () => UseHealtInsuranceData().refresh,
      loadingHook: () => UseHealtInsuranceData().loading,
      responsive: ResponsiveSelectAndDate,
    },

    id_discapacidad: {
      label: "Discapacidad",
      keyId: "id",
      keyLabel: "nombre",
      hidden: (values) => !values.tiene_discapacidad,

      selectOptionsHook: () => UseDisabilitiesData().items,
      refreshActionHook: () => UseDisabilitiesData().refresh,
      loadingHook: () => UseDisabilitiesData().loading,
      // responsive: ResponsiveSelectAndDate,
    },
    id_vinculo_agresor: {
      label: "Vinculo",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseRelationShipData().items,
      refreshActionHook: () => UseRelationShipData().refresh,
      loadingHook: () => UseRelationShipData().loading,
      hidden: (values) => !values.conoce_agresor,
      responsive: ResponsiveSelectAndDate,
    },
    id_identidad_genero_agresor: {
      label: "Identidad de género",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseGenderIndentityData().items,
      refreshActionHook: () => UseGenderIndentityData().refresh,
      loadingHook: () => UseGenderIndentityData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_orientacion_sexual_agresor: {
      label: "Orientaciòn sexual",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseSexualOrientationData().items,
      refreshActionHook: () => UseSexualOrientationData().refresh,
      loadingHook: () => UseSexualOrientationData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    colonia_agresor: {
      label: "Colonia",
      keyId: "nombre",
      keyLabel: "nombre",
      // multiple: true,
      selectOptionsHook: () => UseInterview().colonias_agresor,
      onChange: async (val, formik, hook) => {
        const colonias = hook.UseInterview.colonias_agresor;

        formik.setFieldValue(
          "estado_agresor",
          colonias.find((it) => it.nombre == val?.nombre).estado,
        );
        formik.setFieldValue(
          "municipio_agresor",
          colonias.find((it) => it.nombre == val?.nombre).municipio,
        );
        formik.setFieldValue(
          "zona_agresor",
          colonias.find((it) => it.nombre == val?.nombre).zona,
        );
      },
      loadingHook: () => UseInterview().loadingCp_agresor,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_ultimo_grado_estudios_agresor: {
      label: "Ultimo grado de estudios",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseEducationLevelData().items,
      refreshActionHook: () => UseEducationLevelData().refresh,
      loadingHook: () => UseEducationLevelData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_ingreso_promedio_mensual_agresor: {
      label: "Ingresos promedios mensuales",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseAverageIncomeData().items,
      refreshActionHook: () => UseAverageIncomeData().refresh,
      loadingHook: () => UseAverageIncomeData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_ocupacion_agresor: {
      label: "Ocupación",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseOcupationsData().items,
      refreshActionHook: () => UseOcupationsData().refresh,
      loadingHook: () => UseOcupationsData().loading,
      hidden: (values) => !values.conoce_agresor,
    },
    id_armas_agresor: {
      label: "Arma",
      keyId: "id",
      keyLabel: "nombre",

      selectOptionsHook: () => UseWeapons().items,
      refreshActionHook: () => UseWeapons().refresh,
      loadingHook: () => UseWeapons().loading,
      hidden: (values) => !values.acceso_armas_agresor,
    },
    id_drogas_agresor: {
      label: "Sustancias",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseAverageIncomeData().items,
      refreshActionHook: () => UseAverageIncomeData().refresh,
      loadingHook: () => UseAverageIncomeData().loading,
      hidden: (values) => !values.acceso_drogas_agresor,
    },
    id_servicios_trabajo_social: {
      label: "Trabajo social",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseSocialWorkData().items,
      refreshActionHook: () => UseSocialWorkData().refresh,
      loadingHook: () => UseSocialWorkData().loading,
    },
    id_servicios_juridicos: {
      label: "Servicio Juridico",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseLegalServiceData().items,
      refreshActionHook: () => UseLegalServiceData().refresh,
      loadingHook: () => UseLegalServiceData().loading,
    },
    id_servicios_psicologicos: {
      label: "Servicios Piscológicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePsYchologicalServicesData().items,
      refreshActionHook: () => UsePsYchologicalServicesData().refresh,
      loadingHook: () => UsePsYchologicalServicesData().loading,
    },
    id_dependencia: {
      label: "Dependencia / Institucion",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseDependencesData().items,
      refreshActionHook: () => UseDependencesData().refresh,
      loadingHook: () => UseDependencesData().loading,
    },
    id_canalizacion: {
      label: "Canalización",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCanalizationData().items,
      refreshActionHook: () => UseCanalizationData().refresh,
      loadingHook: () => UseCanalizationData().loading,
    },
  })

  // ==========================================================================
  // 5. CONFIGURACIÓN DE TOGGLES (SWITCHES)
  // ==========================================================================
  .toggle({
    // 🟡 Narración de los hechos - Lugar de hechos
    ocurrio_domicilio_victima: {
      label: "¿Ocurrio en el domicilio de la victima?",
      responsive: ResponsiveToogle,
    },
    conoce_autoridad_asunto: {
      label: "¿Conoce alguna autoridad del asunto?",
      responsive: ResponsiveToogle,
    },
    dia_festivo: {
      label: "¿Fue dia festivo?",
      responsive: ResponsiveToogle,
    },
    ocurrio_extranjero: {
      label: "¿Ocurrio en el extranjero?",
      responsive: ResponsiveToogle,
    },
    canalizado_cabi: {
      label: "¿El dia fue canalizado por el CABI?",
      responsive: ResponsiveToogle,
    },

    // 🟣 Clasificación de la violencia
    relacion_denuncia: {
      label: "¿Relacionado con denuncia?",
    },
    victima_delicuencia_organizada: {
      label: "¿Victima de delicuencia organizada?",
      responsive: ResponsiveToogle,
    },
    relacionado_orientacion_indetidad_genero: {
      label: "¿Relacionado con orientación sexual o indentidad de genero?",
      responsive: ResponsiveToogle,
    },
    vive_extrajero: {
      label: "¿Vive en el extranjero?",
      responsive: ResponsiveSelectAndDate,
    },
    realiza_mas_actividades: {
      label: "¿Realiza mas de una actividad?",
      responsive: ResponsiveSelectAndDate,
    },
    migrante: {
      label: "¿Es migrante?",
      responsive: ResponsiveToogle,
    },
    pertenece_pueblo_indigena: {
      label: "¿Pertenece a un pueblo indigena?",
      responsive: ResponsiveToogle,
    },
    tiene_discapacidad: {
      label: "¿Tiene discapacidad?",
      responsive: ResponsiveToogle,
    },
    discapacidad_causada_violencia: {
      label: "¿La discapacidad es a causa de la violencia sufrida?",
      responsive: ResponsiveToogle,
      hidden: (values) => !values.tiene_discapacidad,
    },
    enfermedad_cronica_degenerativa: {
      label: "¿Enfermedad cronico-degenerativa?",
      responsive: ResponsiveToogle,
    },
    trastorno_neurologico_mental: {
      label: "¿Trastorno neurologíco o de salud mental diagnosticado?",
      responsive: ResponsiveToogle,
    },
    tratado_medicamente_actualmente: {
      label: "¿Tratamiento medico actual?",
      responsive: ResponsiveToogle,
    },
    embarazo: {
      label: "¿Embarazo?",
      responsive: ResponsiveToogle,
    },
    tiene_dependientes: {
      label: "¿Tiene hijas/hijos/personas dependientes?",
      responsive: ResponsiveToogle,
    },
    vive_situacion_calle: {
      label: "¿Situación de la calle?",
    },
    tiene_adiccion: {
      label: "¿Adiccion?",
    },
    conoce_agresor: {
      label: "¿Conoce al agresor?",
    },
    vive_domicilio_victima: {
      label: "¿Vive en el mismo domicilio que la victima?",
      hidden: (values) => !values.conoce_agresor,
    },
    acceso_armas_agresor: {
      label: "Tiene accesso a armas",
      hidden: (values) => !values.conoce_agresor,
    },
    acceso_drogas_agresor: {
      label: "¿Consume drogas?",
      hidden: (values) => !values.conoce_agresor,
    },
  })

  // ==========================================================================
  // 6. CONFIGURACIÓN DE RADIO BUTTONS
  // ==========================================================================
  .radio({
    sector: {
      label: "Sector",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Rural" },
        { id: 2, nombre: "Urbano" },
      ],
    },
    autoidentificacion_etnica: {
      label: "¿Se considera afroamexicana/negra/afrodescendiente?",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Si" },
        { id: 2, nombre: "No" },
        { id: 3, nombre: "Se desconoce" },
      ],
    },
    conducta: {
      label: "Tipo",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Conducta" },
        { id: 2, nombre: "Ingestión - quimica" },
        { id: 3, nombre: "Ingestión - comida" },
      ],
      hidden: (values) => !values.tiene_adiccion,
    },
    sexo_agresor: {
      label: "Sexo",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Hombre" },
        { id: 2, nombre: "Mujer" },
        { id: 3, nombre: "No binario" },
      ],
      responsive: ResponsiveSelectAndDate,

      hidden: (values) => !values.conoce_agresor,
    },
  })

  // ==========================================================================
  // 7. CONFIGURACIÓN DEL LAYOUT (STEpper - MULTI-PASOS)
  // ==========================================================================

  .textarea({
    entre_calles: {
      label: "Entre las calles",
    },
    referencias: {
      label: "Referencias",
    },
  })
  .array({
    dependientes: {
      label: "Hijas, hijos y dependientes",
      fields: [
        {
          name: "nombre",
          label: "Nombre",
          type: "text",
        },
        {
          name: "apellido_paterno",
          label: "Apellido Paterno",
          type: "text",
        },
        {
          name: "apellido_materno",
          label: "Apellido Materno",
          type: "text",
        },
        {
          name: "id_vinculo",
          label: "Vinculo",
          type: "select",
          selectIdKey: "id",
          selectLabelKey: "nombre",
          selectOptionsHook: () => UseRelationShipData().items,
          refreshActionHook: () => UseRelationShipData().refresh,
          loadingHook: () => UseRelationShipData().loading,
        },
        {
          name: "esta_riesgo",
          label: "¿Esta en riesgo?",
          type: "toggle",
        },
      ],
    },
    redapoyo: {
      label: "Red de apoyo",
      fields: [
        {
          name: "nombre",
          label: "Nombre",
          type: "text",
        },
        {
          name: "apellido_paterno",
          label: "Apellido Paterno",
          type: "text",
        },
        {
          name: "apellido_materno",
          label: "Apellido Materno",
          type: "text",
        },
        {
          name: "id_vinculo",
          label: "Vinculo",
          type: "select",
          selectIdKey: "id",
          selectLabelKey: "nombre",
          selectOptionsHook: () => UseRelationShipData().items,
          refreshActionHook: () => UseRelationShipData().refresh,
          loadingHook: () => UseRelationShipData().loading,
        },
        {
          name: "cuenta_apoyo",
          label: "¿Cuenta con red de apoyo?",
          type: "toggle",
        },
      ],
    },
  })
  .layout(
    "stepper", // Modo: stepper (pasos) o box (cajas)
    "Apertura del caso", // Paso 1
    "Narración de los hechos", // Paso 2
    "Clasificación de la violencia", // Paso 3
    "Efectos de la violencia", // Paso 4
    "Datos de la victima", // paso 5
    "Persona agresora",
    "Ruta de antencion",
    "Canalización",
  )({
    // 📌 PASO 1: APERTURA DEL CASO
    "Apertura del caso": ["curp"],

    // 📌 PASO 2: NARRACIÓN DE LOS HECHOS
    "Narración de los hechos": [
      // Box 1: Hechos
      {
        title: "Hechos",
        fields: ["hechos"],
      },
      // Box 2: Lugar de hechos
      {
        title: "Lugar de hechos",
        fields: [
          "id_espacio_digital",
          "id_espacio_particular",
          "id_espacio_publico",
          "id_transporte_foraneo",
          "id_transporte_privado",
          "id_transporte_urbano",
          "sector",
          "fecha_hecho",
          "hora_hecho",
          "ocurrio_extranjero",
          "dia_festivo",
          "conoce_autoridad_asunto",
          "canalizado_cabi",
          "ocurrio_domicilio_victima",
          "especifica_domicilio",
        ],
      },
    ],

    // 📌 PASO 3: CLASIFICACIÓN DE LA VIOLENCIA
    "Clasificación de la violencia": [
      // Box 1: Datos de violencia
      {
        title: "Datos de violencia",
        fields: [
          "id_tipos_violencia",
          "especifique_tipo_violencia",
          "id_ambitos_violencia",
          "victima_delicuencia_organizada",
          "relacion_denuncia",
          "relacionado_orientacion_indetidad_genero",
        ],
      },
      // Box 2: Tipos de violencia (pendiente)
    ],
    "Efectos de la violencia": [
      {
        title: "Efectos físicos",
        fields: ["id_efectos_fisicos", "especifique_efecto_fisico"],
      },
      {
        title: "Consecuencias sexuales",
        fields: [
          "id_consecuencias_sexuales",
          "especifique_consecuencia_sexual",
        ],
      },
      {
        title: "Efectos psicológicos",
        fields: ["id_efectos_psicologicos", "especifique_efecto_psicologico"],
      },
      {
        title: "Efectos económicos y patrimoniales",
        fields: [
          "id_efectos_economicos_patrimoniales",
          "especifique_economicos_patrimonial",
        ],
      },
      {
        title: "Agente de lesión",
        fields: ["id_agente_lesion", "especifique_agente_lesion"],
      },
      {
        title: "Área anatómica lesionada",
        fields: [
          "id_aerea_anatomica_lesionada",
          "especifique_aerea_anatomica_lesionada",
        ],
      },
    ],
    "Datos de la victima": [
      {
        title: "Informacion General",
        fields: [
          "fecha_nacimiento",
          "edad",
          "telefono",
          "correo",

          "id_orientacion_sexual",
          "id_identidad_genero",
          "id_estado_civil",
          "id_ultimo_grado_estudios",
          "id_ingreso_promedio_mensual",
          "id_actividad",
          "id_servicio_medico",
          "realiza_mas_actividades",
        ],
      },
      {
        title: "Domicilio",
        fields: [
          "vive_extrajero",
          "codigo_postal",
          "colonia",
          "estado",
          "municipio",
          "zona",
          "calle",
          "num_ext",
          "num_int",
          "entre_calles",
          "referencias",
          "entre_calles_agresor",
          "referencias_agresor",
        ],
      },
      {
        title: "Condiciones especificas",
        fields: [
          "migrante",
          "pertenece_pueblo_indigena",
          "tiene_discapacidad",
          "id_discapacidad",
          "discapacidad_causada_violencia",
          "autoidentificacion_etnica",
          "discapacidad_causada_violencia",
          "enfermedad_cronica_degenerativa",
          "trastorno_neurologico_mental",
          "tratado_medicamente_actualmente",
          "embarazo",
          "semananas_embarazo",
          "tiene_dependientes",
        ],
      },
      {
        title: "Hijas,hijos y dependientes",
        fields: ["dependientes"],
      },
      {
        title: "Red de apoyo",
        fields: ["redapoyo"],
      },
      {
        title: "Otras condiciones",
        fields: ["vive_situacion_calle", "tiene_adiccion", "conducta"],
      },
    ],
    "Persona agresora": [
      {
        title: "Información",
        fields: [
          "conoce_agresor",
          "nombre_agresor",
          "edad_agresor",
          "sexo_agresor",
          "id_vinculo_agresor",
          "id_identidad_genero_agresor",
          "id_orientacion_sexual_agresor",
          "id_ultimo_grado_estudios_agresor",
          "id_ingreso_promedio_mensual_agresor",
          "id_ocupacion_agresor",
          "acceso_armas_agresor",
          "id_armas_agresor",
          "acceso_drogas_agresor",
          "id_drogas_agresor",
          "vive_domicilio_victima",
        ],
      },
      {
        title: "Domicilio",
        fields: [
          "codigo_postal_agresor",
          "colonia_agresor",
          "estado_agresor",
          "municipio_agresor",
          "calle_agresor",
          "num_ext_agresor",
          "num_int_agresor",
          "entre_calles_agresor",
          "referencias_agresor",
          "zona_agresor",
        ],
      },
    ],
    "Ruta de antencion": [
      "id_servicios_trabajo_social",
      "id_servicios_juridicos",
      "id_servicios_psicologicos",
    ],
    Canalización: [
      "id_dependencia",
      "especifica_dependencia",
      "id_canalizacion",
      "fecha_canalizacion",
      "responsable",
      "observaciones",
    ],
  })
  .build();
