// import { DateFormat, formatDatetime } from "../../utils/helpers";
// import { FaRegFilePdf } from "react-icons/fa6";
// import { aperturaDomain } from "./step1.apertura.builder";
// import { hechosDomain } from "./step2.hechos";
// import { violenciaDomain } from "./step3.violencia.domain";
// import { efectosDomain } from "./step4.efectos.builder";
// import { victimaDomain } from "./step5.victima.builder";
// import { agresorDomain } from "./step6.agresor.builder";
// import { rutaDomain } from "./step7.ruta.builder";
// import { canalizacionDomain } from "./step8.canalizacion.builder";
// import { buildCrudFromDomains } from "../../models/crud-domain";
// import { HooksInterview, InterviewTable } from "../../models/interview/interview.model";

// export const interviewBuilderCrud = buildCrudFromDomains<InterviewTable, HooksInterview>(
//   [
//     aperturaDomain,
//     hechosDomain,
//     violenciaDomain,
//     efectosDomain,
//     victimaDomain,
//     agresorDomain,
//     rutaDomain,
//     canalizacionDomain,
//   ],
//  { layoutMode: "stepper" } // 👈 Aquí especificas el modo

// )
//   .tableHeader({
//     icon: "",
//     title: "Entrevistas",
//     subtitle: "Módulo 1",
//   })
//   .tableColumns({
//     id: { label: "Folio" },
//     curp: { label: "CURP" },
//     fecha_nacimiento: {
//       label: "Fecha de nacimiento",
//       render: (value) =>
//         formatDatetime(value, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY),
//     },
//     telefono: { label: "Teléfono" },
//     calle: { label: "CALLE" },
//     colonia: { label: "Colonia" },
//     municipio: { label: "Municipio" },
//     estado: { label: "Estado" },
//     creado_por: { label: "Registrado" },
//   })
//   .tableActions<HooksInterview>({
//     isDelete: false,
//     moreButtons: [
//       {
//         label: "Pdf",
//         icon: <FaRegFilePdf />,
//         color: "red",
//         tooltip: "pdf",
//         actionHook: ({ row, hooks }) => {
//           hooks.UseInterview.getPdf(row.id);
//         },
//       },
//     ],
//   })
//   .mobile({
//     listTile: {
//       title: (row) => row.curp,
//     },
//   })
//   .build();
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
import UseInterview, {
  InterviewDataReturn,
} from "../../ui/hooks/interview/interviewdata";
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
import * as yup from "yup";
import { DateFormat, formatDatetime } from "../../utils/helpers";
import UseSubstancesData from "../../ui/hooks/substance/usesubstancesdata";
import { FaRegFilePdf } from "react-icons/fa6";
import CustomBadge from "../../ui/components/badge/custombadge";

// // 📱 Responsive presets
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

import { buildCrudFromDomains, defineDomain } from "../../models/crud-domain";
// ============================================================================
// VALIDACIONES GLOBALES
// ============================================================================
const curpRegex = /^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const telefonoRegex = /^\d{10}$/;
const codigoPostalRegex = /^\d{5}$/;

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
      "curp",
      "especifica_domicilio",
      "especifique_tipo_violencia",
      "especifique_ambito_violencia",
      "especifique_efecto_fisico",
      "especifique_consecuencia_sexual",
      "especifique_efecto_psicologico",
      "especifique_economicos_patrimonial",
      "especifique_agente_lesion",
      "especifique_aerea_anatomica_lesionada",
      "nombre",
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
      "hora_hecho",
    ],
    textarea: [
      "hechos",
      "entre_calles",
      "referencias",
      "observaciones",
      "comentarios_ruta_antencion",
    ],
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
    select: [
      "id_espacio_digital",
      "id_espacio_particular",
      "id_espacio_publico",
      "id_transporte_foraneo",
      "id_transporte_urbano",
      "id_transporte_privado",
      "id_tipos_violencia",
      "id_ambitos_violencia",
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
    toggle: [
      "ocurrio_domicilio_victima",
      "ocurrio_extranjero",
      "dia_festivo",
      "conoce_autoridad_asunto",
      "canalizado_cabi",
      "victima_delicuencia_organizada",
      "relacion_denuncia",
      "relacionado_orientacion_indetidad_genero",
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
    radio: ["sector", "autoidentificacion_etnica", "conducta", "sexo_agresor"],
    date: ["fecha_hecho", "fecha_nacimiento", "fecha_canalizacion"],
    array: ["dependientes", "redapoyo"],
  })

  // ==========================================================================
  // 2. CONFIGURACIÓN DE CAMPOS NÚMERO
  // ==========================================================================
  .number({
    edad: {
      label: "Edad",
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "La edad es requerida")
          .required("La edad es requerida"),
    },
    telefono: {
      label: "Teléfono",
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .required("El telefono es obligatorio")
          .typeError("El teléfono debe ser un número")
          .test("len", "El teléfono debe tener 10 dígitos", (val) => {
            if (!val) return true;
            return val.toString().length === 10;
          }),
    },
    codigo_postal: {
      label: "Código postal",
      onChange: async (val, formik, hook) => {
        if (val && val.toString().length === 5) {
          hook.UseInterview.getCp(val);
        }
      },
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "Codigo postal es requerido")
          .required("El codigo postal es obligatorio")
          .typeError("El código postal debe ser un número")
          .test("len", "El código postal debe tener 5 dígitos", (val) => {
            if (!val) return true;
            return val.toString().length === 5;
          }),
    },
    num_ext: {
      label: "Número exterior",
      responsive: ResponsiveSelectAndDate,
    },
    num_int: {
      label: "Número interior",
    },
    semananas_embarazo: {
      label: "Semanas de embarazo",
      hidden: (values) => !values.embarazo,
      validation: ({ yup }) =>
        yup.number().when("embarazo", {
          is: true,
          then: (schema) =>
            schema
              .typeError("Las semanas de embarazo deben ser un número")

              .required("Las semanas de embarazo son requeridas"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    edad_agresor: {
      label: "Edad del agresor",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.number().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema
              .typeError("La edad debe ser un número")
              .min(0, "La edad no puede ser negativa")
              .max(120, "Edad inválida")
              .required("La edad del agresor es requerida"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    codigo_postal_agresor: {
      label: "Código postal del agresor",
      onChange: async (val, formik, hook) => {
        if (val && val.toString().length === 5) {
          hook.UseInterview.getCpAgresor(val);
        }
      },
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    num_ext_agresor: {
      label: "Número exterior del agresor",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    num_int_agresor: {
      label: "Número interior del agresor",
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
  })

  // ==========================================================================
  // 3. CONFIGURACIÓN DE CAMPOS DE FECHA
  // ==========================================================================
  .date({
    fecha_hecho: {
      label: "Fecha del hecho",
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .date()
          .required("La fecha del hecho es obligatoria")
          .typeError("Fecha inválida")

          .required("La fecha del hecho es requerida"),
    },

    fecha_nacimiento: {
      label: "Fecha de nacimiento",
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .date()
          .required("La fecha es requerida")
          .typeError("Fecha inválida"),
    },
    fecha_canalizacion: {
      label: "Fecha de canalización",
      responsive: ResponsiveSelectAndDate,
    },
  })

  // ==========================================================================
  // 4. CONFIGURACIÓN DE CAMPOS DE TEXTO
  // ==========================================================================
  .text({
    curp: {
      label: "CURP",
      caseTransform: "uppercase",
      placeholder: "CURP (18 caracteres)",
      uppercase: true,
      validation: ({ yup, hooks }) => {
      // Cache para promesas pendientes y timer
      let timeoutId: NodeJS.Timeout | null = null;
      let lastPromise: Promise<boolean> | null = null;

      return yup
        .string()
        .length(18, "La CURP debe tener exactamente 18 caracteres")
        .matches(
          /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/,
          "Formato de CURP inválido. Ejemplo: HEAF880101HDFRRN09",
        )
        .test(
          "curp-unica",
          "Esta CURP ya está registrada en el sistema",
          async (value, context) => {
            if (!value) return true;
            const currentId = context.parent?.id || 0;
            if (currentId) {
                return true
            }
              // Si hay un timer anterior, lo cancelamos
            if (timeoutId) clearTimeout(timeoutId);

            // Devolvemos una promesa que se resolverá después del debounce
            return new Promise<boolean>((resolve, reject) => {
              timeoutId = setTimeout(async () => {
                try {
                  // Obtener todas las entrevistas (puedes usar un método específico)
                  const entrevistas = hooks.UseInterview.items || await hooks.UseInterview.DataNorepeat() ;
                  const existe = entrevistas.some(
                    (item: any) => item.curp === value && item.id !== currentId
                  );
                  resolve(!existe);
                } catch (error) {
                  console.error("Error verificando CURP:", error);
                  resolve(true); // En caso de error, permitir
                }
              }, 500); // Espera 500ms después de la última pulsación
            });
          },
        )
        .required("La CURP es requerida");
    },
  },
    hora_hecho: {
      label: "Hora del hecho",
      type: "time",
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) => yup.string().required("La hora es obligatoria"),
    },
    especifica_domicilio: {
      label: "Especifica domicilio",
      hidden: (values) => values.ocurrio_domicilio_victima,
      caseTransform: "uppercase",
      uppercase: true,
    },
    especifique_tipo_violencia: {
      label: "Especifique tipo de violencia",
      placeholder: "Describa el tipo de violencia...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_tipos_violencia?.includes(8),
      validation: ({ yup }) =>
        yup.string().when("id_tipos_violencia", {
          is: (val: number[]) => val?.includes(8),
          then: (schema) =>
            schema
              .required("Especifique el tipo de violencia")
              .min(3, "Debe describir el tipo de violencia"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_ambito_violencia: {
      label: "Especifique ambito de violencia",
      placeholder: "Describa el ambito de violencia...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_ambitos_violencia?.includes(9),
      validation: ({ yup }) =>
        yup.string().when("id_ambitos_violencia", {
          is: (val: number[]) => val?.includes(9),
          then: (schema) =>
            schema
              .required("Especifique el ambito de violencia")
              .min(3, "Debe describir el ambito de violencia"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_efecto_fisico: {
      label: "Especifique efecto físico",
      placeholder: "Describa el efecto físico...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_efectos_fisicos?.includes(14),
      validation: ({ yup }) =>
        yup.string().when("id_efectos_fisicos", {
          is: (val: number[]) => val?.includes(14),
          then: (schema) => schema.required("Especifique el efecto físico"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_consecuencia_sexual: {
      label: "Especifique consecuencia sexual",
      placeholder: "Describa la consecuencia sexual...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_consecuencias_sexuales?.includes(8),
      validation: ({ yup }) =>
        yup.string().when("id_consecuencias_sexuales", {
          is: (val: number[]) => val?.includes(8),
          then: (schema) =>
            schema.required("Especifique la consecuencia sexual"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_efecto_psicologico: {
      label: "Especifique efecto psicológico",
      placeholder: "Describa el efecto psicológico...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_efectos_psicologicos?.includes(14),
      validation: ({ yup }) =>
        yup.string().when("id_efectos_psicologicos", {
          is: (val: number[]) => val?.includes(14),
          then: (schema) =>
            schema.required("Especifique el efecto psicológico"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_economicos_patrimonial: {
      label: "Especifique efectos económicos y patrimoniales",
      placeholder: "Describe el efecto económico y patrimonial...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) =>
        !values.id_efectos_economicos_patrimoniales?.includes(8),
      validation: ({ yup }) =>
        yup.string().when("id_efectos_economicos_patrimoniales", {
          is: (val: number[]) => val?.includes(8),
          then: (schema) =>
            schema.required("Especifique los efectos económicos"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_agente_lesion: {
      label: "Especifique agente de lesión",
      placeholder: "Describe el agente de lesión...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_agente_lesion?.includes(8),
      validation: ({ yup }) =>
        yup.string().when("id_agente_lesion", {
          is: (val: number[]) => val?.includes(8),
          then: (schema) => schema.required("Especifique el agente de lesión"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    especifique_aerea_anatomica_lesionada: {
      label: "Especifique área anatómica lesionada",
      placeholder: "Describe el área anatómica lesionada...",
      caseTransform: "uppercase",
      uppercase: true,
      hidden: (values) => !values.id_aerea_anatomica_lesionada?.includes(16),
      validation: ({ yup }) =>
        yup.string().when("id_aerea_anatomica_lesionada", {
          is: (val: number[]) => val?.includes(16),
          then: (schema) =>
            schema.required("Especifique el área anatómica lesionada"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    correo: {
      label: "Correo electrónico",
      responsive: ResponsiveSelectAndDate,
    },
    localidad: {
      label: "Localidad",
      responsive: ResponsiveSelectAndDate,
      uppercase: true,
    },
    calle: {
      label: "Calle",
      responsive: ResponsiveSelectAndDate,
      uppercase: true,
      validation: ({ yup }) => yup.string().required("La calle es obligatoria"),
    },
    estado: {
      label: "Estado",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup.string().required("El estado es obligatorio"),
    },
    municipio: {
      label: "Municipio",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup.string().required("El Municipio es obligatorio"),
    },
    zona: {
      label: "Zona",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) => yup.string().required("Lazona es obligatoria"),
    },
    nombre_agresor: {
      label: "Nombre del agresor",
      responsive: ResponsiveSelectAndDate,
      uppercase: true,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.string().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema.required("El nombre del agresor es requerido"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    calle_agresor: {
      label: "Calle del agresor",
      responsive: ResponsiveSelectAndDate,
      uppercase: true,
      hidden: (values) => !values.conoce_agresor,
    },
    estado_agresor: {
      label: "Estado del agresor",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    municipio_agresor: {
      label: "Municipio del agresor",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    zona_agresor: {
      label: "Zona del agresor",
      disabled: true,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    responsable: {
      label: "Responsable",
      responsive: ResponsiveSelectAndDate,
      uppercase: true,
    },
    especifica_dependencia: {
      label: "Especifica la dependencia",
      uppercase: true,
      hidden: (values) => values.id_dependencia !== 8,
      validation: ({ yup }) =>
        yup.string().when("id_dependencia", {
          is: 8,
          then: (schema) => schema.required("Especifique la dependencia"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    nombre: {
      label: "Nombre Completo",
    },
  })

  // ==========================================================================
  // 5. CONFIGURACIÓN DE TEXTAREA
  // ==========================================================================
  .textarea({
    hechos: {
      label: "Narración de los hechos",
      validation: ({ yup }) =>
        yup.string().required("La narración de los hechos es requerida"),
    },
    entre_calles: {
      label: "Entre las calles",
      uppercase: true,
    },
    referencias: {
      label: "Referencias",
      uppercase: true,
    },
    observaciones: {
      label: "Observaciones",
      uppercase: true,
    },
    comentarios_ruta_antencion: {
      label: "Comentarios",
    },
  })

  // ==========================================================================
  // 6. CONFIGURACIÓN DE SELECTS
  // ==========================================================================
  .select({
    id_espacio_digital: {
      label: "Espacio Digital",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseDigitalSpace().items,
      refreshActionHook: () => UseDigitalSpace().refresh,
      loadingHook: () => UseDigitalSpace().loading,
      multiple: true,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
    },
    id_espacio_particular: {
      label: "Espacio Particular",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseParticleSpace().items,
      refreshActionHook: () => UseParticleSpace().refresh,
      loadingHook: () => UseParticleSpace().loading,
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_espacio_publico: {
      label: "Espacio Público",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UsePublicSpace().items,
      refreshActionHook: () => UsePublicSpace().refresh,
      loadingHook: () => UsePublicSpace().loading,
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_transporte_foraneo: {
      label: "Transporte Foráneo",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseForeignTransportation().items,
      refreshActionHook: () => UseForeignTransportation().refresh,
      loadingHook: () => UseForeignTransportation().loading,
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
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
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
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
      validation: ({ yup }) => {
        return yup
          .array()
          .test(
            "al-menos-un-campo",
            "Seleccione al menos una opción entre todos los espacios y transportes",
            function (value) {
              const { parent } = this; // valores actuales del formulario

              const todosLosCampos = [
                parent.id_espacio_digital,
                parent.id_espacio_particular,
                parent.id_espacio_publico,
                parent.id_transporte_foraneo,
                parent.id_transporte_privado,
                parent.id_transporte_urbano,
              ];

              // Verificar si al menos UNO de los seis tiene al menos un elemento
              const algunoConValor = todosLosCampos.some(
                (campo) => campo && campo.length > 0,
              );

              return algunoConValor;
            },
          );
      },
      multiple: true,
      responsive: ResponsiveSelectAndDate,
    },
    id_tipos_violencia: {
      label: "Tipos de violencia",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseViolenceType().items,
      refreshActionHook: () => UseViolenceType().refresh,
      loadingHook: () => UseViolenceType().loading,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
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
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_efectos_fisicos: {
      label: "Efectos físicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePhysicalEffects().items,
      refreshActionHook: () => UsePhysicalEffects().refresh,
      loadingHook: () => UsePhysicalEffects().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_consecuencias_sexuales: {
      label: "Consecuencias Sexuales",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseSexualConsequences().items,
      refreshActionHook: () => UseSexualConsequences().refresh,
      loadingHook: () => UseSexualConsequences().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_efectos_psicologicos: {
      label: "Efectos Psicológicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePsychologicalEffects().items,
      refreshActionHook: () => UsePsychologicalEffects().refresh,
      loadingHook: () => UsePsychologicalEffects().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_efectos_economicos_patrimoniales: {
      label: "Efectos Económicos Patrimoniales",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseEconomicProperyEffects().items,
      refreshActionHook: () => UseEconomicProperyEffects().refresh,
      loadingHook: () => UseEconomicProperyEffects().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_agente_lesion: {
      label: "Agente de lesión",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseInruringAgent().items,
      refreshActionHook: () => UseInruringAgent().refresh,
      loadingHook: () => UseInruringAgent().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_aerea_anatomica_lesionada: {
      label: "Área anatómica lesionada",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseInjuredAnatomicAlarea().items,
      refreshActionHook: () => UseInjuredAnatomicAlarea().refresh,
      loadingHook: () => UseInjuredAnatomicAlarea().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    colonia: {
      label: "Colonia",
      keyId: "nombre",
      keyLabel: "nombre",
      selectOptionsHook: () => UseInterview().colonias,
      onChange: async (val, formik, hook) => {
        const colonias = hook.UseInterview.colonias;
        const colonia = colonias.find((it) => it.nombre === val?.nombre);
        if (colonia) {
          formik.setFieldValue("estado", colonia.estado);
          formik.setFieldValue("municipio", colonia.municipio);
          formik.setFieldValue("zona", colonia.zona);
        }
      },
      loadingHook: () => UseInterview().loadingCp,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) => yup.string().required("Seleccione una colonia"),
    },
    id_orientacion_sexual: {
      label: "Orientación sexual",
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
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "seleccione una opción")
          .required("Seleccione un estado civil"),
    },
    id_ultimo_grado_estudios: {
      label: "Último grado de estudios",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseEducationLevelData().items,
      refreshActionHook: () => UseEducationLevelData().refresh,
      loadingHook: () => UseEducationLevelData().loading,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "seleccione una opción")
          .required("Seleccione un grado de estudios"),
    },
    id_ingreso_promedio_mensual: {
      label: "Ingresos promedios mensuales",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseAverageIncomeData().items,
      refreshActionHook: () => UseAverageIncomeData().refresh,
      loadingHook: () => UseAverageIncomeData().loading,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "seleccione una opción")
          .required("Seleccione un ingreso de promedios"),
    },
    id_actividad: {
      label: "Actividad principal",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseMainActivityData().items,
      refreshActionHook: () => UseMainActivityData().refresh,
      loadingHook: () => UseMainActivityData().loading,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "seleccione una opción")
          .required("Seleccione una actividad principal"),
    },
    id_servicio_medico: {
      label: "Servicio médico",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseHealtInsuranceData().items,
      refreshActionHook: () => UseHealtInsuranceData().refresh,
      loadingHook: () => UseHealtInsuranceData().loading,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "seleccione una opción")
          .required("Seleccione un servicio medico"),
    },
    id_discapacidad: {
      label: "Discapacidad",
      keyId: "id",
      keyLabel: "nombre",
      hidden: (values) => !values.tiene_discapacidad,
      selectOptionsHook: () => UseDisabilitiesData().items,
      refreshActionHook: () => UseDisabilitiesData().refresh,
      loadingHook: () => UseDisabilitiesData().loading,
      validation: ({ yup }) =>
        yup.number().when("tiene_discapacidad", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "seleccione una opción")
              .required("Seleccione el tipo de discapacidad"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_vinculo_agresor: {
      label: "Vínculo con el agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseRelationShipData().items,
      refreshActionHook: () => UseRelationShipData().refresh,
      loadingHook: () => UseRelationShipData().loading,
      hidden: (values) => !values.conoce_agresor,
      responsive: ResponsiveSelectAndDate,
      validation: ({ yup }) =>
        yup.number().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "seleccione una opción")
              .required("Seleccione el vínculo con el agresor"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_identidad_genero_agresor: {
      label: "Identidad de género del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseGenderIndentityData().items,
      refreshActionHook: () => UseGenderIndentityData().refresh,
      loadingHook: () => UseGenderIndentityData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_orientacion_sexual_agresor: {
      label: "Orientación sexual del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseSexualOrientationData().items,
      refreshActionHook: () => UseSexualOrientationData().refresh,
      loadingHook: () => UseSexualOrientationData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    colonia_agresor: {
      label: "Colonia del agresor",
      keyId: "nombre",
      keyLabel: "nombre",
      selectOptionsHook: () => UseInterview().colonias_agresor,
      onChange: async (val, formik, hook) => {
        const colonias = hook.UseInterview.colonias_agresor;
        const colonia = colonias.find((it) => it.nombre === val?.nombre);
        if (colonia) {
          formik.setFieldValue("estado_agresor", colonia.estado);
          formik.setFieldValue("municipio_agresor", colonia.municipio);
          formik.setFieldValue("zona_agresor", colonia.zona);
        }
      },
      loadingHook: () => UseInterview().loadingCp_agresor,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
    },
    id_ultimo_grado_estudios_agresor: {
      label: "Último grado de estudios del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseEducationLevelData().items,
      refreshActionHook: () => UseEducationLevelData().refresh,
      loadingHook: () => UseEducationLevelData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.number().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "seleccione una opción")
              .required("Seleccione el ultimo grado de estudios del agresor"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_ingreso_promedio_mensual_agresor: {
      label: "Ingresos promedios mensuales del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseAverageIncomeData().items,
      refreshActionHook: () => UseAverageIncomeData().refresh,
      loadingHook: () => UseAverageIncomeData().loading,
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.number().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "seleccione una opción")
              .required("Seleccione el ultimo grado de estudios del agresor"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_ocupacion_agresor: {
      label: "Ocupación del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseOcupationsData().items,
      refreshActionHook: () => UseOcupationsData().refresh,
      loadingHook: () => UseOcupationsData().loading,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.number().when("conoce_agresor", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "seleccione una opción")
              .required("Seleccione la ocupación del agresor"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_armas_agresor: {
      label: "Arma del agresor",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseWeapons().items,
      refreshActionHook: () => UseWeapons().refresh,
      loadingHook: () => UseWeapons().loading,
      hidden: (values) => !values.acceso_armas_agresor,
      validation: ({ yup }) =>
        yup.number().when("acceso_armas_agresor", {
          is: true,
          then: (schema) => schema.required("Seleccione el tipo de arma"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_drogas_agresor: {
      label: "Sustancias que consume el agresor",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseSubstancesData().items,
      refreshActionHook: () => UseSubstancesData().refresh,
      loadingHook: () => UseSubstancesData().loading,
      hidden: (values) => !values.acceso_drogas_agresor,
      validation: ({ yup }) =>
        yup.array().when("acceso_drogas_agresor", {
          is: true,
          then: (schema) => schema.min(1, "Seleccione al menos una sustancia"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    id_servicios_trabajo_social: {
      label: "Servicios de Trabajo Social",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseSocialWorkData().items,
      refreshActionHook: () => UseSocialWorkData().refresh,
      loadingHook: () => UseSocialWorkData().loading,
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
    },
    id_servicios_juridicos: {
      label: "Servicios Jurídicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseLegalServiceData().items,
      refreshActionHook: () => UseLegalServiceData().refresh,
      loadingHook: () => UseLegalServiceData().loading,
    },
    id_servicios_psicologicos: {
      label: "Servicios Psicológicos",
      keyId: "id",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UsePsYchologicalServicesData().items,
      refreshActionHook: () => UsePsYchologicalServicesData().refresh,
      loadingHook: () => UsePsYchologicalServicesData().loading,
    },
    id_dependencia: {
      label: "Dependencia / Institución",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseDependencesData().items,
      refreshActionHook: () => UseDependencesData().refresh,
      loadingHook: () => UseDependencesData().loading,
    },
    id_canalizacion: {
      label: "Tipo de Canalización",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCanalizationData().items,
      refreshActionHook: () => UseCanalizationData().refresh,
      loadingHook: () => UseCanalizationData().loading,
    },
  })

  // ==========================================================================
  // 7. CONFIGURACIÓN DE TOGGLES
  // ==========================================================================
  .toggle({
    ocurrio_domicilio_victima: {
      label: "¿Ocurrió en el domicilio de la víctima?",
      responsive: ResponsiveToogle,
    },
    conoce_autoridad_asunto: {
      label: "¿Conoce alguna autoridad del asunto?",
      responsive: ResponsiveToogle,
    },
    dia_festivo: {
      label: "¿Fue día festivo?",
      responsive: ResponsiveToogle,
    },
    ocurrio_extranjero: {
      label: "¿Ocurrió en el extranjero?",
      responsive: ResponsiveToogle,
    },
    canalizado_cabi: {
      label: "¿El caso fue canalizado por el CABI?",
      responsive: ResponsiveToogle,
    },
    relacion_denuncia: {
      label: "¿Relacionado con denuncia?",
    },
    victima_delicuencia_organizada: {
      label: "¿Víctima de delincuencia organizada?",
      responsive: ResponsiveToogle,
    },
    relacionado_orientacion_indetidad_genero: {
      label: "¿Relacionado con orientación sexual o identidad de género?",
      responsive: ResponsiveToogle,
    },
    vive_extrajero: {
      label: "¿Vive en el extranjero?",
      responsive: ResponsiveSelectAndDate,
    },
    realiza_mas_actividades: {
      label: "¿Realiza más de una actividad?",
      responsive: ResponsiveSelectAndDate,
    },
    migrante: {
      label: "¿Es migrante?",
      responsive: ResponsiveToogle,
    },
    pertenece_pueblo_indigena: {
      label: "¿Pertenece a un pueblo indígena?",
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
      label: "¿Enfermedad crónico-degenerativa?",
      responsive: ResponsiveToogle,
    },
    trastorno_neurologico_mental: {
      label: "¿Trastorno neurológico o de salud mental diagnosticado?",
      responsive: ResponsiveToogle,
    },
    tratado_medicamente_actualmente: {
      label: "¿Tratamiento médico actual?",
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
      label: "¿Vive en situación de calle?",
    },
    tiene_adiccion: {
      label: "¿Tiene adicción?",
    },
    conoce_agresor: {
      label: "¿Conoce al agresor?",
    },
    vive_domicilio_victima: {
      label: "¿Vive en el mismo domicilio que la víctima?",
      hidden: (values) => !values.conoce_agresor,
    },
    acceso_armas_agresor: {
      label: "¿Tiene acceso a armas?",
      hidden: (values) => !values.conoce_agresor,
    },
    acceso_drogas_agresor: {
      label: "¿Consume drogas?",
      hidden: (values) => !values.conoce_agresor,
    },
  })

  // ==========================================================================
  // 8. CONFIGURACIÓN DE RADIO BUTTONS
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
      validation: ({ yup }) => yup.string().required("Seleccione un sector"),
    },
    autoidentificacion_etnica: {
      label: "¿Se considera afroamexicana/negra/afrodescendiente?",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Sí" },
        { id: 2, nombre: "No" },
        { id: 3, nombre: "Se desconoce" },
      ],
      validation: ({ yup }) => yup.string().required("Seleccione una opción"),
    },
    conducta: {
      label: "Tipo de conducta",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Conducta" },
        { id: 2, nombre: "Ingestión - química" },
        { id: 3, nombre: "Ingestión - comida" },
      ],
      hidden: (values) => !values.tiene_adiccion,
      validation: ({ yup }) =>
        yup.string().when("tiene_adiccion", {
          is: true,
          then: (schema) => schema.required("Seleccione el tipo de conducta"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
    sexo_agresor: {
      label: "Sexo del agresor",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "Hombre" },
        { id: 2, nombre: "Mujer" },
        { id: 3, nombre: "No binario" },
      ],
      responsive: ResponsiveSelectAndDate,
      hidden: (values) => !values.conoce_agresor,
      validation: ({ yup }) =>
        yup.string().when("conoce_agresor", {
          is: true,
          then: (schema) => schema.required("Seleccione el sexo del agresor"),
          otherwise: (schema) => schema.notRequired(),
        }),
    },
  })

  // ==========================================================================
  // 9. CONFIGURACIÓN DE ARRAYS (DEPENDIENTES Y RED DE APOYO)
  // ==========================================================================
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
          name: "edad",
          label: "Edad",
          type: "number",
        },

        {
          name: "id_vinculo",
          label: "Vínculo",
          type: "select",
          selectIdKey: "id",
          selectLabelKey: "nombre",
          selectOptionsHook: () => UseRelationShipData().items,
          refreshActionHook: () => UseRelationShipData().refresh,
          loadingHook: () => UseRelationShipData().loading,
        },

        {
          name: "esta_riesgo",
          label: "¿Está en riesgo?",
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
          name: "telefono",
          label: "Telefono",
          type: "text",
        },
        {
          name: "id_vinculo",
          label: "Vínculo",
          type: "select",
          selectIdKey: "id",
          selectLabelKey: "nombre",
          selectOptionsHook: () => UseRelationShipData().items,
          refreshActionHook: () => UseRelationShipData().refresh,
          loadingHook: () => UseRelationShipData().loading,
        },
        {
          name: "cuenta_apoyo",
          label: "¿Cuenta con apoyo?",
          type: "toggle",
        },
      ],
    },
  })

  // ==========================================================================
  // 10. CONFIGURACIÓN DEL LAYOUT (STEPPER - MULTI-PASOS)
  // ==========================================================================
  .layout(
    "stepper",
    "Apertura del caso",
    "Datos de la víctima",
    "Narración de los hechos",
    "Clasificación de la violencia",
    "Efectos de la violencia",
    "Persona agresora",
    "Ruta de atención",
    "Canalización",
  )({
    "Apertura del caso": ["curp"],

    "Narración de los hechos": [
      {
        title: "Hechos",
        fields: ["hechos"],
      },
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

    "Clasificación de la violencia": [
      {
        title: "Datos de violencia",
        fields: [
          "id_tipos_violencia",
          "especifique_tipo_violencia",
          "id_ambitos_violencia",
          "especifique_ambito_violencia",
          "victima_delicuencia_organizada",
          "relacion_denuncia",
          "relacionado_orientacion_indetidad_genero",
        ],
      },
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

    "Datos de la víctima": [
      {
        title: "Información General",
        fields: [
          "nombre",
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
        ],
      },
      {
        title: "Condiciones específicas",
        fields: [
          "migrante",
          "pertenece_pueblo_indigena",
          "autoidentificacion_etnica",
          "tiene_discapacidad",
          "id_discapacidad",
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
        title: "Hijas, hijos y dependientes",
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
        title: "Domicilio del agresor",
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

    "Ruta de atención": [
      "id_servicios_trabajo_social",
      "id_servicios_juridicos",
      "id_servicios_psicologicos",
      "comentarios_ruta_antencion",
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
  .tableHeader({
    icon: "",
    title: "Entrevistas",
    subtitle: "Modulo 1",
  })
  .tableColumns({
    id: {
      label: "Folio",
    },
    nombre: {
      label: "Nombre",
    },
    curp: {
      label: "CURP",
    },
    fecha_nacimiento: {
      label: "Fecha de nacimiento",
      render: (value, record) => (
        <>{formatDatetime(value, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</>
      ),
    },
    telefono: {
      label: "Telefono",
    },

    calle: {
      label: "CALLE",
    },
    colonia: {
      label: "Colonia",
    },
    municipio: {
      label: "Municipio",
    },
    estado: {
      label: "Estado",
    },
    creado_por: {
      label: "Registrado",
    },
    created_at: {
      label: "Fecha de creación",
      filterType: "datetime-local",
      render: (v) => {
        return (
          <>{formatDatetime(v, true, DateFormat.DD_DE_MMMM_DE_YYYY_H_MM_a)}</>
        );
      },
    },
  })
  .tableActions<Hooks>({
    isDelete: false,
    moreButtons: [
      {
        label: "Pdf",
        icon: <FaRegFilePdf />,
        color: "red",
        tooltip: "pdf",
        actionHook: ({ row, hooks }) => {
          // ✅ hooks.UseRoles tiene el resultado real del hook
          hooks.UseInterview.getPdf(row.id);
        },
      },
    ],
  })
  .mobile({
    listTile: {
      title: (row) => row.curp,
    },
  })
  .build();
