// domains/canalizacion.domain.ts

import UseDependencesData from "../../ui/hooks/dependences/usedependencesdata";
import UseCanalizationData from "../../ui/hooks/canalization/usecanalizationdata";
import { defineDomain } from "../../models/crud-domain";
import { CanalizacionForm, HooksInterview, InterviewTable } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };

export const canalizacionDomain = defineDomain<
  CanalizacionForm,
  InterviewTable,
  HooksInterview
>({
  step: "Canalización",
  groups: {
    Canalización: [
      "id_dependencia",
      "especifica_dependencia",
      "id_canalizacion",
      "fecha_canalizacion",
      "responsable",
      "observaciones",
    ],
  },
  fieldsList: {
    select: ["id_dependencia", "id_canalizacion"],
    text: ["especifica_dependencia", "responsable"],
    textarea: ["observaciones"],
    date: ["fecha_canalizacion"],
  },
  configure: (builder) => {
    builder
      .select({
        id_dependencia: {
          label: "Dependencia / Institución",
          keyId: "id",
          keyLabel: "nombre",
          selectOptionsHook: () => UseDependencesData().items,
          refreshActionHook: () => UseDependencesData().refresh,
          loadingHook: () => UseDependencesData().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.number().min(1, "Seleccione una dependencia").required(),
        },
        id_canalizacion: {
          label: "Tipo de Canalización",
          keyId: "id",
          keyLabel: "nombre",
          selectOptionsHook: () => UseCanalizationData().items,
          refreshActionHook: () => UseCanalizationData().refresh,
          loadingHook: () => UseCanalizationData().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup
              .number()
              .min(1, "Seleccione un tipo de canalización")
              .required(),
        },
      })
      .text({
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
        responsable: {
          label: "Responsable",
          uppercase: true,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.string().required("Es necesario el responsable"),
        },
      })
      .textarea({
        observaciones: {
          label: "Observaciones",
          uppercase: true,
        },
      })
      .date({
        fecha_canalizacion: {
          label: "Fecha de canalización",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) => yup.date().required("La fecha es requerida"),
        },
      });
  },
});
