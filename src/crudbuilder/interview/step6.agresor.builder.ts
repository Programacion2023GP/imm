
import UseRelationShipData from "../../ui/hooks/relationship/userelationshipdata";
import UseGenderIndentityData from "../../ui/hooks/genderidentity/usegenderidentitydata";
import UseSexualOrientationData from "../../ui/hooks/sexualorientation/usesexualorientationdata";
import UseEducationLevelData from "../../ui/hooks/educationlevel/useeducationleveldata";
import UseAverageIncomeData from "../../ui/hooks/averageincome/useaverageincomedata";
import UseOcupationsData from "../../ui/hooks/ocupations/useocupationsdata";
import UseWeapons from "../../ui/hooks/weapons/useweaponsdata";
import UseSubstancesData from "../../ui/hooks/substance/usesubstancesdata";
import UseInterview from "../../ui/hooks/interview/interviewdata";
import { defineDomain } from "../../models/crud-domain";
import { AgresorForm, HooksInterview, InterviewTable } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };
const ResponsiveToggle = { "2xl": 4, xl: 4, md: 6 };

export const agresorDomain = defineDomain<AgresorForm, InterviewTable, HooksInterview>({
  step: "Persona agresora",
  groups: {
    Información: [
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
    "Domicilio del agresor": [
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
  fieldsList: {
    toggle: [
      "conoce_agresor",
      "acceso_armas_agresor",
      "acceso_drogas_agresor",
      "vive_domicilio_victima",
    ],
    text: [
      "nombre_agresor",
      "calle_agresor",
      "estado_agresor",
      "municipio_agresor",
      "zona_agresor",
      "entre_calles_agresor",
      "referencias_agresor",
    ],
    number: [
      "edad_agresor",
      "codigo_postal_agresor",
      "num_ext_agresor",
      "num_int_agresor",
    ],
    select: [
      "id_vinculo_agresor",
      "id_identidad_genero_agresor",
      "id_orientacion_sexual_agresor",
      "colonia_agresor",
      "id_ultimo_grado_estudios_agresor",
      "id_ingreso_promedio_mensual_agresor",
      "id_ocupacion_agresor",
      "id_armas_agresor",
      "id_drogas_agresor",
    ],
    radio: ["sexo_agresor"],
  },
  configure: (builder) => {
    builder
      .toggle({
        conoce_agresor: { label: "¿Conoce al agresor?" },
        acceso_armas_agresor: {
          label: "¿Tiene acceso a armas?",
          hidden: (values) => !values.conoce_agresor,
        },
        acceso_drogas_agresor: {
          label: "¿Consume drogas?",
          hidden: (values) => !values.conoce_agresor,
        },
        vive_domicilio_victima: {
          label: "¿Vive en el mismo domicilio que la víctima?",
          hidden: (values) => !values.conoce_agresor,
        },
      })
      .text({
        nombre_agresor: {
          label: "Nombre del agresor",
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
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
          validation: ({ yup }) =>
            yup.string().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema.required("La calle del agresor es requerida"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
        estado_agresor: {
          label: "Estado del agresor",
          disabled: true,
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
          validation: ({ yup }) =>
            yup.string().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema.required("El estado del agresor es requerido"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
        municipio_agresor: {
          label: "Municipio del agresor",
          disabled: true,
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
          validation: ({ yup }) =>
            yup.string().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema.required("El municipio del agresor es requerido"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
        zona_agresor: {
          label: "Zona del agresor",
          disabled: true,
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
        },
        entre_calles_agresor: {
          label: "Entre las calles",
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
        },
        referencias_agresor: {
          label: "Referencias",
          uppercase: true,
          hidden: (values) => !values.conoce_agresor,
        },
      })
      .number({
        edad_agresor: {
          label: "Edad del agresor",
          responsive: ResponsiveSelectAndDate,
          hidden: (values) => !values.conoce_agresor,
          validation: ({ yup }) =>
            yup.number().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema
                  .typeError("Debe ser número")
                  .min(0, "No negativa")
                  .max(120, "Inválida")
                  .required("Requerida"),
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
          validation: ({ yup }) =>
            yup.number().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema
                  .required("Obligatorio")
                  .typeError("Número")
                  .test(
                    "len",
                    "5 dígitos",
                    (val) => !val || val.toString().length === 5,
                  ),
              otherwise: (schema) => schema.notRequired(),
            }),
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
      .select({
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
                schema.min(1, "Seleccione una opción").required(),
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
          validation: ({ yup }) =>
            yup.number().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema.min(1, "Seleccione una opción").required(),
              otherwise: (schema) => schema.notRequired(),
            }),
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
          validation: ({ yup }) =>
            yup.number().when("conoce_agresor", {
              is: true,
              then: (schema) =>
                schema.min(1, "Seleccione una opción").required(),
              otherwise: (schema) => schema.notRequired(),
            }),
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
                schema.min(1, "Seleccione una opción").required(),
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
                schema.min(1, "Seleccione una opción").required(),
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
                schema.min(1, "Seleccione una opción").required(),
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
              then: (schema) =>
                schema.min(1, "Seleccione al menos una sustancia"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      })
      .radio({
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
              then: (schema) =>
                schema.required("Seleccione el sexo del agresor"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      });
  },
});
