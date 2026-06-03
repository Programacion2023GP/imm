// domains/efectos.domain.ts

import UsePhysicalEffects from "../../ui/hooks/physicaleffects/usephysicaleffectsdata";
import UseSexualConsequences from "../../ui/hooks/sexualconsequences/usesexualconsequencesdata";
import UsePsychologicalEffects from "../../ui/hooks/psychologicaleffects/usepsychologicaldata";
import UseEconomicProperyEffects from "../../ui/hooks/economicproperyeffects/useeconomicproperyeffectsdata";
import UseInruringAgent from "../../ui/hooks/inruringagent/useinruringagentdata";
import UseInjuredAnatomicAlarea from "../../ui/hooks/injuredanatomicalarea/useinjuredanatomicalareadata";
import { defineDomain } from "../../models/crud-domain";
import { EfectosForm, HooksInterview, InterviewTable } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };

export const efectosDomain = defineDomain<EfectosForm, InterviewTable, HooksInterview>({
  step: "Efectos de la violencia",
  groups: {
    "Efectos físicos": ["id_efectos_fisicos", "especifique_efecto_fisico"],
    "Consecuencias sexuales": [
      "id_consecuencias_sexuales",
      "especifique_consecuencia_sexual",
    ],
    "Efectos psicológicos": [
      "id_efectos_psicologicos",
      "especifique_efecto_psicologico",
    ],
    "Efectos económicos y patrimoniales": [
      "id_efectos_economicos_patrimoniales",
      "especifique_economicos_patrimonial",
    ],
    "Agente de lesión": ["id_agente_lesion", "especifique_agente_lesion"],
    "Área anatómica lesionada": [
      "id_aerea_anatomica_lesionada",
      "especifique_aerea_anatomica_lesionada",
    ],
  },
  fieldsList: {
    select: [
      "id_efectos_fisicos",
      "id_consecuencias_sexuales",
      "id_efectos_psicologicos",
      "id_efectos_economicos_patrimoniales",
      "id_agente_lesion",
      "id_aerea_anatomica_lesionada",
    ],
    text: [
      "especifique_efecto_fisico",
      "especifique_consecuencia_sexual",
      "especifique_efecto_psicologico",
      "especifique_economicos_patrimonial",
      "especifique_agente_lesion",
      "especifique_aerea_anatomica_lesionada",
    ],
  },
  configure: (builder) => {
    builder
      .select({
        id_efectos_fisicos: {
          label: "Efectos físicos",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UsePhysicalEffects().items,
          refreshActionHook: () => UsePhysicalEffects().refresh,
          loadingHook: () => UsePhysicalEffects().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
        id_consecuencias_sexuales: {
          label: "Consecuencias sexuales",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UseSexualConsequences().items,
          refreshActionHook: () => UseSexualConsequences().refresh,
          loadingHook: () => UseSexualConsequences().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
        id_efectos_psicologicos: {
          label: "Efectos psicológicos",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UsePsychologicalEffects().items,
          refreshActionHook: () => UsePsychologicalEffects().refresh,
          loadingHook: () => UsePsychologicalEffects().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
        id_efectos_economicos_patrimoniales: {
          label: "Efectos económicos patrimoniales",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UseEconomicProperyEffects().items,
          refreshActionHook: () => UseEconomicProperyEffects().refresh,
          loadingHook: () => UseEconomicProperyEffects().loading,
          responsive: ResponsiveSelectAndDate,
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
          responsive: ResponsiveSelectAndDate,
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
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
      })
      .text({
        especifique_efecto_fisico: {
          label: "Especifique efecto físico",
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
          uppercase: true,
          hidden: (values) => !values.id_agente_lesion?.includes(8),
          validation: ({ yup }) =>
            yup.string().when("id_agente_lesion", {
              is: (val: number[]) => val?.includes(8),
              then: (schema) =>
                schema.required("Especifique el agente de lesión"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
        especifique_aerea_anatomica_lesionada: {
          label: "Especifique área anatómica lesionada",
          uppercase: true,
          hidden: (values) =>
            !values.id_aerea_anatomica_lesionada?.includes(16),
          validation: ({ yup }) =>
            yup.string().when("id_aerea_anatomica_lesionada", {
              is: (val: number[]) => val?.includes(16),
              then: (schema) =>
                schema.required("Especifique el área anatómica lesionada"),
              otherwise: (schema) => schema.notRequired(),
            }),
        },
      });
  },
});
