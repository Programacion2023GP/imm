
import UseSocialWorkData from "../../ui/hooks/socialwork/usesocialworkdata";
import UseLegalServiceData from "../../ui/hooks/legalservices/uselegalservicedata";
import UsePsYchologicalServicesData from "../../ui/hooks/psychologicalservices/usepsychologicalservicesdata";
import { defineDomain } from "../../models/crud-domain";
import { HooksInterview, InterviewTable, RutaAtencionForm } from "../../models/interview/interview.model";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };

export const rutaDomain = defineDomain<RutaAtencionForm, InterviewTable, HooksInterview>(
  {
    step: "Ruta de atención",
    groups: {
      "Servicios de atención": [
        "id_servicios_trabajo_social",
        "id_servicios_juridicos",
        "id_servicios_psicologicos",
      ],
    },
    fieldsList: {
      select: [
        "id_servicios_trabajo_social",
        "id_servicios_juridicos",
        "id_servicios_psicologicos",
      ],
    },
    configure: (builder) => {
      builder.select({
        id_servicios_trabajo_social: {
          label: "Servicios de Trabajo Social",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UseSocialWorkData().items,
          refreshActionHook: () => UseSocialWorkData().refresh,
          loadingHook: () => UseSocialWorkData().loading,
          responsive: ResponsiveSelectAndDate,
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
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
        id_servicios_psicologicos: {
          label: "Servicios Psicológicos",
          keyId: "id",
          keyLabel: "nombre",
          multiple: true,
          selectOptionsHook: () => UsePsYchologicalServicesData().items,
          refreshActionHook: () => UsePsYchologicalServicesData().refresh,
          loadingHook: () => UsePsYchologicalServicesData().loading,
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
      });
    },
  },
);
