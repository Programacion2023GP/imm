
import UseViolenceType from "../../ui/hooks/violencetype/useviolencetypedata";
import UseViolenceAerea from "../../ui/hooks/violenceaerea/useviolenceaeradata";
import { defineDomain } from "../../models/crud-domain";
import { HooksInterview, InterviewTable, ViolenciaForm } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };
const ResponsiveToggle = { "2xl": 4, xl: 4, md: 6 };

export const violenciaDomain = defineDomain<
  ViolenciaForm,
  InterviewTable,
  HooksInterview
>({
  step: "Clasificación de la violencia",
  groups: {
    "Datos de violencia": [
      "id_tipos_violencia",
      "especifique_tipo_violencia",
      "id_ambitos_violencia",
      "victima_delicuencia_organizada",
      "relacion_denuncia",
      "relacionado_orientacion_indetidad_genero",
    ],
  },
  fieldsList: {
    select: ["id_tipos_violencia", "id_ambitos_violencia"],
    text: ["especifique_tipo_violencia"],
    toggle: [
      "victima_delicuencia_organizada",
      "relacion_denuncia",
      "relacionado_orientacion_indetidad_genero",
    ],
  },
  configure: (builder) => {
    builder
      .select({
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
      })
      .text({
        especifique_tipo_violencia: {
          label: "Especifique tipo de violencia",
          placeholder: "Describa el tipo de violencia...",
          uppercase: true,
          hidden: (values) => !values.id_tipos_violencia?.includes(8),
          validation: ({ yup }) =>
            yup.string().when("id_tipos_violencia", {
              is: (val: number[]) => val?.includes(8),
              then: (schema) =>
                schema
                  .required("Especifique el tipo de violencia")
                  .min(3, "Describa el tipo"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      })
      .toggle({
        victima_delicuencia_organizada: {
          label: "¿Víctima de delincuencia organizada?",
          responsive: ResponsiveToggle,
        },
        relacion_denuncia: {
          label: "¿Relacionado con denuncia?",
        },
        relacionado_orientacion_indetidad_genero: {
          label: "¿Relacionado con orientación sexual o identidad de género?",
          responsive: ResponsiveToggle,
        },
      });
  },
});
