import { FaEye } from "react-icons/fa6";
import { ConfigCrud, ResponsiveSizes } from "../../models/genericmodels.model";
import { Legal, LegalTable } from "../../models/legal/legal.model";
import UseIncedentesTypeData from "../../ui/hooks/incedentstypes/useincedentstypedata";
import UseStatusData from "../../ui/hooks/status/usestatusdata";
import UseTypeAdvisory from "../../ui/hooks/typeadvisory/usetypeadvisorydata";
import useUsersData from "../../ui/hooks/users/useUsersData";
import {
  ContactInfoCard,
  LegalPatientInfoCard,
  PatientInfoSection,
} from "../../ui/pages/legal/components/info.folio";
import UseLegalData from "../../ui/hooks/legal/uselegal";
import UseJuridicProccessData from "../../ui/hooks/juridicproccess/useproccessjuridic";
import UseCatalogueData from "../../ui/hooks/catalogues/usecatalogues";
 const Resposive:ResponsiveSizes ={
  "2xl":6,
  lg:6,
  md:12,
  sm:12,
  xl:12
 }
export const legalBuilderCrud = ConfigCrud<Legal, {}, {}>()
  .fields({
    date: [
      "fecha_apertura",
      "fecha_asesoria",
      "fecha_acompanamiento",
      "fecha_denuncia",
      "fecha_solicitud",
      "fecha_audiencia",
      "fecha_medida",
      "fecha_cierre",
    ],
    select: [
      "id_responsable",
      "id_tipo_asesoria",
      "id_estatus_caso",
      "id_casos_incidentes",
      "id_autoridad_emisora",
      "id_tipo_medida",
      "id_motivo_cierre",
    ],
    textarea: [
      "hechos",
      "comentarios_procesales",
      "descripcion_medida",
      "observaciones",
    ],
    text: ["nombre_imputado"],
    number: ["carpeta_investigacion", "causa_penal"],
  })
  .text({
    nombre_imputado: {
      label: "Nombre de imputado",
      responsive: Resposive,
    },
  })
  .date({
    fecha_apertura: { label: "Fecha apertura", responsive: Resposive },
    fecha_asesoria: { label: "Fecha de asesoría", responsive: Resposive },
    fecha_acompanamiento: {
      label: "Fecha de acompañamiento",
      responsive: Resposive,
    },
    fecha_denuncia: { label: "Fecha de denuncia", responsive: Resposive },
    fecha_solicitud: { label: "Fecha de solicitud", responsive: Resposive },
    fecha_audiencia: { label: "Fecha de audiencia", responsive: Resposive },
    fecha_medida: { label: "Fecha de medida", responsive: Resposive },
    fecha_cierre: { label: "Fecha de cierre" },
  })
  .textarea({
    hechos: { label: "Hechos" },
    comentarios_procesales: {
      label: "Comentarios Procesales",
    },
    descripcion_medida: {
      label: "Descripción de medida",
    },
    observaciones: {
      label: "Observaciones",
    },
  })
  .number({
    carpeta_investigacion: {
      label: "Numero de carpeta de investigación",
      responsive: Resposive,
    },
    causa_penal: {
      label: "Numero Causa Penal",
    },
  })
  .select({
    id_responsable: {
      label: "Responsable",
      selectOptionsHook: () =>
        useUsersData().items.filter((it) => it.id_rol == 5),
      keyLabel: "nombre_completo",
      keyId: "id",
      responsive: Resposive,
    },
    id_tipo_asesoria: {
      label: "Tipo de asesoria / materia",
      keyLabel: "nombre",
      selectOptionsHook: () => UseTypeAdvisory().items,
      refreshActionHook: () => UseTypeAdvisory().refresh,
      loadingHook: () => UseTypeAdvisory().loading,
      keyId: "id",
      responsive: Resposive,
    },
    id_estatus_caso: {
      label: "Estatus de caso",
      keyLabel: "nombre",
      selectOptionsHook: () => UseStatusData().items,
      refreshActionHook: () => UseStatusData().refresh,
      loadingHook: () => UseStatusData().loading,
      keyId: "id",
    },
    id_casos_incidentes: {
      label: "Tipo de casos o incidente",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseIncedentesTypeData().items,
      refreshActionHook: () => UseIncedentesTypeData().refresh,
      loadingHook: () => UseIncedentesTypeData().loading,
      addActionHook: () => UseIncedentesTypeData().setOpen,
      keyId: "id",
    },
    id_autoridad_emisora: {
      label: "Autoridad emisora",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCatalogueData("autoridad_emisora").items,
      refreshActionHook: () => UseCatalogueData("autoridad_emisora").refresh,
      loadingHook: () => UseCatalogueData("autoridad_emisora").loading,
      keyId: "id",
      responsive: Resposive,
    },
    id_tipo_medida: {
      label: "Típo de medida",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCatalogueData("tipo_medida").items,
      refreshActionHook: () => UseCatalogueData("tipo_medida").refresh,
      loadingHook: () => UseCatalogueData("tipo_medida").loading,
      keyId: "id",
    },
    id_motivo_cierre: {
      label: "Motivo de cierre",
      keyLabel: "nombre",
      selectOptionsHook: () => UseCatalogueData("motivo_cierre_juzgados").items,
      refreshActionHook: () =>
        UseCatalogueData("motivo_cierre_juzgados").refresh,
      loadingHook: () => UseCatalogueData("motivo_cierre_juzgados").loading,
      keyId: "id",
    },
  })
  .registerComponent("legal", {
    node: <PatientInfoSection />, // ✅ registrado como "legal"
  })

  .layout(
    "box",
    "Apertura de expediente",
    "Tipo de caso o incidente",
    "Proceso Penal",
    "Medidas y órdenes de protección",
    "Cierre de caso",
  )({
    "Apertura de expediente": [
      { component: "legal" }, // ✅ usa el nombre registrado

      "fecha_apertura",
      "fecha_asesoria",
      "id_responsable",
      "id_tipo_asesoria",
      "id_estatus_caso",
      "hechos",
    ],
    "Tipo de caso o incidente": ["id_casos_incidentes"],
    "Proceso Penal": [
      "fecha_acompanamiento",
      "fecha_denuncia",
      "nombre_imputado",
      "carpeta_investigacion",
      "causa_penal",
      "comentarios_procesales",
    ],
    "Medidas y órdenes de protección": [
      "id_autoridad_emisora",
      "fecha_solicitud",
      "fecha_audiencia",
      "fecha_medida",
      "id_tipo_medida",
      "descripcion_medida",
    ],
    "Cierre de caso": ["fecha_cierre", "id_motivo_cierre", "observaciones"],
  })

  // UI personalizada

  .build();
interface hooks {
  UseLegalData: ReturnType<typeof UseLegalData>;
  juridicProccessData: ReturnType<typeof UseJuridicProccessData>;
}
export const legalBuilderTable = ConfigCrud<Legal, LegalTable, {}>()
  .fields({})
  .tableColumns({
    folio: {
      label: "Folio",
    },
    nombre: {
      label: "Nombre",
    },
    edad: {
      label: "edad",
    },
    telefono: {
      label: "Telefono",
    },
    calle: {
      label: "Calle",
    },
    colonia: {
      label: "Colonia",
    },
    estado: {
      label: "Estado",
    },
    municipio: {
      label: "Municipio",
    },
  })
  .tableActions<hooks>({
    isEditing: false,
    isDelete: false,
    moreButtons: [
      {
        label: "",
        tooltip: "Detalles",
        actionHook: ({hooks,row}) => {
          hooks.juridicProccessData.setField('id_evaluaciones_juridicas',row.id)
          hooks.UseLegalData.setExtra('selected',row)
          hooks.UseLegalData.setExtra('openModal',true)

        },
        icon: <FaEye />,
        color: "green",
      },
    ],
  })

  .build();
