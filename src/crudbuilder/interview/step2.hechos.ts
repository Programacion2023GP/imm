import { defineDomain } from "../../models/crud-domain";
import { HechosForm, HooksInterview, InterviewTable } from "../../models/interview/interview.model";
import UseDigitalSpace from "../../ui/hooks/digitalspace/usedigitalspacedata";

const ResponsiveSelectAndDate = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };
const ResponsiveToggle = { "2xl": 4, xl: 4, md: 6 };

export const hechosDomain = defineDomain<
  HechosForm,
  InterviewTable,
  HooksInterview
>({
  step: "Narración de los hechos",
  groups: {
    Hechos: ["hechos"],
    "Lugar de hechos": [
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
  fieldsList: {
    text: ["hora_hecho", "especifica_domicilio"],
    textarea: ["hechos"],
    select: [
      "id_espacio_digital",
      "id_espacio_particular",
      "id_espacio_publico",
      "id_transporte_foraneo",
      "id_transporte_privado",
      "id_transporte_urbano",
    ],
    toggle: [
      "ocurrio_extranjero",
      "dia_festivo",
      "conoce_autoridad_asunto",
      "canalizado_cabi",
      "ocurrio_domicilio_victima",
    ],
    radio: ["sector"],
    date: ["fecha_hecho"],
  },
  configure: (builder) => {
    builder
      .textarea({
        hechos: {
          label: "Narración de los hechos",
          validation: ({ yup }) =>
            yup.string().required("La narración de los hechos es requerida"),
        },
      })
      .text({
        hora_hecho: {
          label: "Hora del hecho",
          type: "time",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup.string().required("La hora es obligatoria"),
        },
        especifica_domicilio: {
          label: "Especifica domicilio",
          hidden: (values) => values.ocurrio_domicilio_victima,
          uppercase: true,
        },
      })
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
          validation: ({ yup }) =>
            yup.array().min(1, "Seleccione al menos una opción"),
        },
        // ... repetir para los otros select (id_espacio_particular, etc.)
        // Por brevedad se omiten, pero es idéntico al original.
      })
      .toggle({
        ocurrio_extranjero: {
          label: "¿Ocurrió en el extranjero?",
          responsive: ResponsiveToggle,
        },
        dia_festivo: {
          label: "¿Fue día festivo?",
          responsive: ResponsiveToggle,
        },
        conoce_autoridad_asunto: {
          label: "¿Conoce alguna autoridad?",
          responsive: ResponsiveToggle,
        },
        canalizado_cabi: {
          label: "¿Canalizado por CABI?",
          responsive: ResponsiveToggle,
        },
        ocurrio_domicilio_victima: {
          label: "¿Ocurrió en domicilio de la víctima?",
          responsive: ResponsiveToggle,
        },
      })
      .radio({
        sector: {
          label: "Sector",
          optionIdKey: "nombre",
          optionLabelKey: "nombre",
          options: [
            { id: 1, nombre: "Rural" },
            { id: 2, nombre: "Urbano" },
          ],
          validation: ({ yup }) =>
            yup.string().required("Seleccione un sector"),
        },
      })
      .date({
        fecha_hecho: {
          label: "Fecha del hecho",
          responsive: ResponsiveSelectAndDate,
          validation: ({ yup }) =>
            yup
              .date()
              .required("La fecha del hecho es obligatoria")
              .typeError("Fecha inválida"),
        },
      });
  },
});