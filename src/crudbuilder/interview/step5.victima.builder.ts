
import UseSexualOrientationData from "../../ui/hooks/sexualorientation/usesexualorientationdata";
import UseGenderIndentityData from "../../ui/hooks/genderidentity/usegenderidentitydata";
import UseMaritalStatusData from "../../ui/hooks/maritalstatus/usemaritalstatusdata";
import UseEducationLevelData from "../../ui/hooks/educationlevel/useeducationleveldata";
import UseAverageIncomeData from "../../ui/hooks/averageincome/useaverageincomedata";
import UseMainActivityData from "../../ui/hooks/mainactivity/usemainactivitydata";
import UseHealtInsuranceData from "../../ui/hooks/healtinsurance/usehealtinsurancedata";
import UseDisabilitiesData from "../../ui/hooks/disabilities/usedisabilitiesdata";
import UseRelationShipData from "../../ui/hooks/relationship/userelationshipdata";
import UseInterview from "../../ui/hooks/interview/interviewdata";
import { defineDomain } from "../../models/crud-domain";
import { HooksInterview, InterviewTable, VictimaForm } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };
const ResponsiveToggle = { "2xl": 4, xl: 4, md: 6 };

export const victimaDomain = defineDomain<VictimaForm, InterviewTable, HooksInterview>({
  step: "Datos de la víctima",
  groups: {
    "Información General": [
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
    Domicilio: [
      "vive_extranjero",
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
    "Condiciones específicas": [
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
    "Hijas, hijos y dependientes": ["dependientes"],
    "Red de apoyo": ["redapoyo"],
    "Otras condiciones": ["vive_situacion_calle", "tiene_adiccion", "conducta"],
  },
  fieldsList: {
    number: [
      "edad",
      "telefono",
      "codigo_postal",
      "num_ext",
      "num_int",
      "semananas_embarazo",
    ],
    text: [
      "correo",
      "localidad",
      "calle",
      "estado",
      "municipio",
      "zona",
      "entre_calles",
      "referencias",
    ],
    select: [
      "id_orientacion_sexual",
      "id_identidad_genero",
      "id_estado_civil",
      "id_ultimo_grado_estudios",
      "id_ingreso_promedio_mensual",
      "id_actividad",
      "id_servicio_medico",
      "colonia",
      "id_discapacidad",
    ],
    toggle: [
      "vive_extranjero",
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
    ],
    radio: ["autoidentificacion_etnica", "conducta"],
    date: ["fecha_nacimiento"],
    array: ["dependientes", "redapoyo"],
  },
  configure: (builder) => {
    builder
      .number({
        edad: {
          label: "Edad",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.number().min(1, "Requerida").required("Requerida"),
        },
        telefono: {
          label: "Teléfono",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup
              .number()
              .required("Obligatorio")
              .typeError("Debe ser número")
              .test(
                "len",
                "10 dígitos",
                (val) => !val || val.toString().length === 10,
              ),
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
              .min(1, "Requerido")
              .required("Obligatorio")
              .typeError("Número")
              .test(
                "len",
                "5 dígitos",
                (val) => !val || val.toString().length === 5,
              ),
        },
        num_ext: {
          label: "Número exterior",
          responsive: ResponsiveSelectAndDate,
        },
        num_int: { label: "Número interior" },
        semananas_embarazo: {
          label: "Semanas de embarazo",
          hidden: (values) => !values.embarazo,
          validation: ({ yup }) =>
            yup.number().when("embarazo", {
              is: true,
              then: (schema) =>
                schema.typeError("Debe ser número").required("Requeridas"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      })
      .text({
        correo: {
          label: "Correo electrónico",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.string().required("Obligatorio").email("Inválido"),
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
          validation: ({ yup }) => yup.string().required("Obligatoria"),
        },
        estado: {
          label: "Estado",
          disabled: true,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) => yup.string().required("Obligatorio"),
        },
        municipio: {
          label: "Municipio",
          disabled: true,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) => yup.string().required("Obligatorio"),
        },
        zona: {
          label: "Zona",
          disabled: true,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) => yup.string().required("Obligatoria"),
        },
        entre_calles: { label: "Entre las calles", uppercase: true },
        referencias: { label: "Referencias", uppercase: true },
      })
      .select({
        id_orientacion_sexual: {
          label: "Orientación sexual",
          keyId: "id",
          keyLabel: "nombre",
          selectOptionsHook: () => UseSexualOrientationData().items,
          refreshActionHook: () => UseSexualOrientationData().refresh,
          loadingHook: () => UseSexualOrientationData().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.number().min(1, "Seleccione una opción").required(),
        },
        id_identidad_genero: {
          label: "Identidad de género",
          keyId: "id",
          keyLabel: "nombre",
          selectOptionsHook: () => UseGenderIndentityData().items,
          refreshActionHook: () => UseGenderIndentityData().refresh,
          loadingHook: () => UseGenderIndentityData().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.number().min(1, "Seleccione una opción").required(),
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
            yup.number().min(1, "Seleccione una opción").required(),
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
            yup.number().min(1, "Seleccione una opción").required(),
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
            yup.number().min(1, "Seleccione una opción").required(),
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
            yup.number().min(1, "Seleccione una opción").required(),
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
            yup.number().min(1, "Seleccione una opción").required(),
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
          validation: ({ yup }) =>
            yup.string().required("Seleccione una colonia"),
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
                schema.min(1, "Seleccione una opción").required(),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      })
      .toggle({
        vive_extranjero: {
          label: "¿Vive en el extranjero?",
          responsive: ResponsiveSelectAndDate,
        },
        realiza_mas_actividades: {
          label: "¿Realiza más de una actividad?",
          responsive: ResponsiveSelectAndDate,
        },
        migrante: { label: "¿Es migrante?", responsive: ResponsiveToggle },
        pertenece_pueblo_indigena: {
          label: "¿Pertenece a un pueblo indígena?",
          responsive: ResponsiveToggle,
        },
        tiene_discapacidad: {
          label: "¿Tiene discapacidad?",
          responsive: ResponsiveToggle,
        },
        discapacidad_causada_violencia: {
          label: "¿La discapacidad es a causa de la violencia?",
          responsive: ResponsiveToggle,
          hidden: (values) => !values.tiene_discapacidad,
        },
        enfermedad_cronica_degenerativa: {
          label: "¿Enfermedad crónico-degenerativa?",
          responsive: ResponsiveToggle,
        },
        trastorno_neurologico_mental: {
          label: "¿Trastorno neurológico o mental?",
          responsive: ResponsiveToggle,
        },
        tratado_medicamente_actualmente: {
          label: "¿Tratamiento médico actual?",
          responsive: ResponsiveToggle,
        },
        embarazo: { label: "¿Embarazo?", responsive: ResponsiveToggle },
        tiene_dependientes: {
          label: "¿Tiene hijas/hijos/personas dependientes?",
          responsive: ResponsiveToggle,
        },
        vive_situacion_calle: { label: "¿Vive en situación de calle?" },
        tiene_adiccion: { label: "¿Tiene adicción?" },
      })
      .radio({
        autoidentificacion_etnica: {
          label: "¿Se considera afroamexicana/negra/afrodescendiente?",
          optionIdKey: "nombre",
          optionLabelKey: "nombre",
          options: [
            { id: 1, nombre: "Sí" },
            { id: 2, nombre: "No" },
            { id: 3, nombre: "Se desconoce" },
          ],
          validation: ({ yup }) =>
            yup.string().required("Seleccione una opción"),
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
              then: (schema) =>
                schema.required("Seleccione el tipo de conducta"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      })
      .date({
        fecha_nacimiento: {
          label: "Fecha de nacimiento",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) => yup.date().required("La fecha es requerida"),
        },
      })
      .array({
        dependientes: {
          label: "Hijas, hijos y dependientes",
          fields: [
            { name: "nombre", label: "Nombre", type: "text" },
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
              label: "Vínculo",
              type: "select",
              selectIdKey: "id",
              selectLabelKey: "nombre",
              selectOptionsHook: () => UseRelationShipData().items,
              refreshActionHook: () => UseRelationShipData().refresh,
              loadingHook: () => UseRelationShipData().loading,
            },
            { name: "esta_riesgo", label: "¿Está en riesgo?", type: "toggle" },
          ],
        },
        redapoyo: {
          label: "Red de apoyo",
          fields: [
            { name: "nombre", label: "Nombre", type: "text" },
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
      });
  },
});
