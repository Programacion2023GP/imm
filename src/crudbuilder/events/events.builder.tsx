import { Event, EventsTable } from "../../models/events/event.model";
import { ConfigCrud, ResponsiveSizes } from "../../models/genericmodels.model";
import UseCatalogueData from "../../ui/hooks/catalogues/usecatalogues";
import UseEventData from "../../ui/hooks/events/useevents";
import useUsersData from "../../ui/hooks/users/useUsersData";
const Responsive: ResponsiveSizes = {
  "2xl": 6,
  lg: 6,
  md: 12,
  sm: 12,
  xl: 12,
};
const ResponsiveToogle: ResponsiveSizes = {
  "2xl": 3,
  lg: 3,
  md: 6,
  sm: 12,
  xl: 12,
};
export const eventBuilder = ConfigCrud<Event, EventsTable, null>()
  .fields({
    date: ["fecha_realizacion", "fecha_proxima"],
    select: [
      "id_aerea_organizadora",
      "id_tipo_actividad",
      "id_seguimiento_control",
      "id_responsable_seguimiento",
    ],
    textarea: ["tema_central", "ponente_facilitador", "lugar", "comentarios"],
    text: ["duracion_estimada", "especifique", "acciones_programadas"],
    number: ["numero_asistentes"],
    radio: ["sexo"],
    toggle: [
      "persona_discapacidad",
      "poblacion_migrante",
      "poblacion_indigena",
      "poblacion_afrodescediente",
      "comunidad_lgbtq",
      "otro",
    ],
    array: ["asistentes"],
    file: ["evidencias"],
  })
  .file({
    evidencias: {
      label: "Evidencias",
      maxFiles: 5,
    },
  })
  .radio({
    sexo: {
      label: "Sexo",
      optionIdKey: "nombre",
      optionLabelKey: "nombre",
      options: [
        { id: 1, nombre: "HOMBRE" },
        { id: 2, nombre: "MUJER" },
        { id: 3, nombre: "NO BINARIO" },
      ],
      responsive: Responsive,
    },
  })
  .toggle({
    persona_discapacidad: {
      label: "¿Tiene alguna discapacidad?",
      responsive: ResponsiveToogle,
    },
    poblacion_migrante: {
      label: "¿Es migrante?",
      responsive: ResponsiveToogle,
    },
    poblacion_indigena: {
      label: "¿Es indigena?",
      responsive: ResponsiveToogle,
    },
    poblacion_afrodescediente: {
      label: "¿Es afrodescediente?",
      responsive: ResponsiveToogle,
    },

    comunidad_lgbtq: {
      label: "¿Pertenece a la comunidad lgbtq?",
      responsive: ResponsiveToogle,
    },
    otro: {
      label: "Otro especifique",
      responsive: ResponsiveToogle,
    },
  })
  .date({
    fecha_realizacion: {
      label: "Fecha de realización",
      responsive: Responsive,
    },
    fecha_proxima: {
      label: "Fecha de proxima acción",
    },
  })
  .number({
    numero_asistentes: {
      label: "Numero de asistentes",
      responsive: Responsive,
    },
  })
  .select({
    id_aerea_organizadora: {
      label: "Aerea organizadora",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCatalogueData(`area_organizadora`).items,
      refreshActionHook: () => UseCatalogueData(`area_organizadora`).refresh,
      loadingHook: () => UseCatalogueData(`area_organizadora`).loading,
      addActionHook: () => UseCatalogueData("area_organizadora").setOpen,

      keyId: "id",
      responsive: Responsive,
    },
    id_tipo_actividad: {
      label: "Tipo de actividad",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCatalogueData(`tipo_actividad`).items,
      refreshActionHook: () => UseCatalogueData(`tipo_actividad`).refresh,
      loadingHook: () => UseCatalogueData(`tipo_actividad`).loading,
      keyId: "id",
      responsive: Responsive,
    },
    id_seguimiento_control: {
      label: "Añadir al seguimiento de control",
      keyLabel: "tema_central",
      selectOptionsHook: () => UseEventData().items,
      refreshActionHook: () => UseEventData().refresh,
      loadingHook: () => UseEventData().loading,
      keyId: "id",
      //   responsive: Responsive,
    },
    id_responsable_seguimiento: {
      label: "Responsable del seguimiento",
      keyLabel: "nombre_completo",
      selectOptionsHook: () => useUsersData().items,
      refreshActionHook: () => useUsersData().refresh,
      loadingHook: () => useUsersData().loading,
      keyId: "id",
      //   responsive: Responsive,
    },
  })
  .textarea({
    tema_central: {
      label: "Tema central",
    },
    ponente_facilitador: {
      label: "Ponente o facilitador",
    },
    lugar: {
      label: "Lugar de la realización",
    },
    comentarios: {
      label: "Comentarios de seguimiento",
    },
  })
  .text({
    duracion_estimada: {
      label: "Duración estimada",
      type: "time",
      responsive: Responsive,
    },
    especifique: {
      label: "Especifique",
      hidden: (values) => !values.otro,
    },
    acciones_programadas: {
      label: "Acciones posteriores programadas",
    },
  })
  .array({
    asistentes: {
      label: "Asistentes",
      fields: [
        {
          name: "nombre",
          label: "Nombre",
          type: "text",
        },
        {
          name: "sexo",
          label: "Sexo",
          type: "select",
          options: [
            { id: 1, label: "HOMBRE" },
            { id: 2, label: "MUJER" },
            { id: 3, label: "NO BINARIO" },
          ],
        },
        {
          name: "colonia",
          label: "Colonia",
          type: "select",
          selectIdKey: "nombre",
          selectLabelKey: "nombre",
          selectOptionsHook: () => UseCatalogueData(`colonias`, false).colonias,
          loadingHook: () => UseCatalogueData(`colonias`, false).loading,
        },
        {
          name: "edad",
          label: "Edad",
          type: "number",
        },
        {
          name: "dependencia",
          label: "Dependencia procedencia",
          type: "text",
        },
      ],
    },
  })
  .layout(
    "stepper",
    "Alta de actividad preventiva",
    "Población beneficiada",
    "Seguimiento y control",
  )({
    "Alta de actividad preventiva": [
      "fecha_realizacion",
      "id_aerea_organizadora",
      "id_tipo_actividad",
      "duracion_estimada",
      "tema_central",
      "ponente_facilitador",
      "lugar",
    ],
    "Población beneficiada": [
      {
        title: "Poblacion beneficiada",
        fields: ["numero_asistentes", "sexo", "edad"],
      },
      {
        title: "Otros grupos de interes",
        fields: [
          "persona_discapacidad",
          "poblacion_migrante",
          "poblacion_indigena",
          "poblacion_afrodescediente",
          "comunidad_lgbtq",
          "otro",
          "especifique",
        ],
      },
      {
        title: "Asistentes",
        fields: ["asistentes"],
      },

      "evidencias",
      "comentarios",
    ],
    "Seguimiento y control": [
      "id_seguimiento_control",
      "id_responsable_seguimiento",
      "acciones_programadas",
      "fecha_proxima",
    ],
  })

  .build();
