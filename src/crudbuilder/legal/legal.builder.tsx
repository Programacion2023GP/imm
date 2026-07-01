import { FaEye, FaFilePdf, FaTrash } from "react-icons/fa6";
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
import { FaEdit } from "react-icons/fa";
import { Loby } from "../../models/loby/loby.model";
import UsePsychologicalEvaluationModuleData from "../../ui/hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import Swal from "sweetalert2";
import CustomButton from "../../ui/components/button/custombuttom";
import Tooltip from "../../ui/components/toltip/Toltip";
const Resposive: ResponsiveSizes = {
  "2xl": 6,
  lg: 6,
  md: 12,
  sm: 12,
  xl: 12,
};
export const legalBuilderCrud = ConfigCrud<Legal, LegalTable, {}>()
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
    text: ["nombre_imputado", "carpeta_investigacion"],
    number: ["causa_penal"],
  })
  .text({
    nombre_imputado: {
      label: "Nombre de imputado",
      responsive: Resposive,
    },
    carpeta_investigacion: {
      label: "Numero de carpeta de investigación",
      responsive: Resposive,
    },
  })
  .date({
    fecha_apertura: {
      label: "Fecha apertura",
      responsive: Resposive,
      validation: ({ yup }) => yup.string().required("Fecha Requerida"),
    },
    fecha_asesoria: {
      label: "Fecha de asesoría",
      responsive: Resposive,
      validation: ({ yup }) => yup.string().required("Fecha Requerida"),
    },
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
      hidden: () => {
        const auth = JSON.parse(localStorage.getItem("auth-persist") || "{}");
        console.log(auth);
        return auth?.auth?.id_rol === 5;
      },
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "Responsable requerido")
          .required("Responsable requerido"),
    },
    id_tipo_asesoria: {
      label: "Tipo de asesoria / materia",
      keyLabel: "nombre",
      selectOptionsHook: () => UseTypeAdvisory().items,
      refreshActionHook: () => UseTypeAdvisory().refresh,
      loadingHook: () => UseTypeAdvisory().loading,
      keyId: "id",
      responsive: Resposive,
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "Tipo de asesoria o materia requerida")
          .required("Tipo de asesoria o materia requerida"),
    },
    id_estatus_caso: {
      label: "Estatus de caso",
      keyLabel: "nombre",
      selectOptionsHook: () => UseStatusData().items,
      refreshActionHook: () => UseStatusData().refresh,
      loadingHook: () => UseStatusData().loading,
      keyId: "id",
      validation: ({ yup }) =>
        yup
          .number()
          .min(1, "Estatus de caso requerido")
          .required("Estatus de caso requerido"),
    },
    id_casos_incidentes: {
      label: "Tipo de casos o incidentes",
      keyLabel: "nombre",
      multiple: true,
      selectOptionsHook: () => UseIncedentesTypeData().items,
      refreshActionHook: () => UseIncedentesTypeData().refresh,
      loadingHook: () => UseIncedentesTypeData().loading,
      addActionHook: () => UseIncedentesTypeData().setOpen,
      keyId: "id",
      validation: ({ yup }) =>
        yup.array().min(1, "Seleccione al menos una opción"),
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
  psychologicalEvaluationModuleData: ReturnType<
    typeof UsePsychologicalEvaluationModuleData
  >;
}
export const legalBuilderTable = ConfigCrud<Legal, LegalTable, {}>()
  .fields({})
  .tableColumns({
    folio: {
      label: "Folio",
    },
    entrevista_nombre: {
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
    responsable_nombre: {
      label: "Creado por",
    },
    nombre_agresor: {
      label: "Agresor",
    },
    relacion_victima: {
      label: "Relacion victima",
    },
    abogado:{
      label:"Abogado"
    }
  })
  .tableActions<hooks>({
    isEditing: false,
    isDelete: false,
    allowCreate: false,
    moreButtons: [
      {
        label: "",
        tooltip: "Detalles",
        actionHook: ({ hooks, row }) => {
          hooks.juridicProccessData.setField(
            "id_evaluaciones_juridicas",
            row.id,
          );
          hooks.UseLegalData.setExtra("selected", row);
          hooks.UseLegalData.setExtra("openModal", true);
        },
        icon: <FaEye />,
        color: "green",
      },
      {
        label: "",
        tooltip: "Editar Expediente",
        actionHook: ({ hooks, row }) => {
          hooks.UseLegalData.setExtra("legal", row as unknown as Loby);
          hooks.UseLegalData.handleChangeItem({
            ...hooks.UseLegalData.initialValues,
            ...row,
          });
          hooks.psychologicalEvaluationModuleData?.setExtra(
            "psychologicalEvaluation",
            {
              ...(row as unknown as any),
              id_entrevista: row.id,
            },
          );
          hooks.UseLegalData.setOpen(true, false);
        },
        icon: <FaEdit />,
        color: "yellow",
      },
      {
        label: "PDF",
        tooltip: "Pdf",
        actionHook: ({ hooks, row }) => {
          hooks.UseLegalData.setExtra("selected", row);
          hooks.UseLegalData.setExtra("openPdf", true);
        },
        icon: <FaFilePdf />,
        color: "yellow",
      },
    ],
  })
  .mobile<hooks>({
    enabled: true,
    activeViews: true,
    listTile: {
      title: (row, hooks) => (
        <div style={{ fontWeight: 600, color: "#1a1a24" }}>
          {row.entrevista_nombre || "Sin nombre"}
        </div>
      ),
      subtitle: (row, hooks) => (
        <div style={{ fontSize: 12, color: "#5a5a72", marginTop: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            📋 Folio: {row.folio || row.id}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            📅{" "}
            {row.fecha_apertura
              ? new Date(row.fecha_apertura).toLocaleDateString("es-MX")
              : "Sin fecha"}
          </span>
        </div>
      ),
      leading: (row, hooks) => (
        <>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: row.activo
                ? "linear-gradient(135deg, #9B2242, #b52a4f)"
                : "linear-gradient(135deg, #6B7280, #9CA3AF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {row.entrevista_nombre?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </>
      ),
      trailing: (row, hooks) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {/* Badge de estatus */}
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 12,
              backgroundColor: row.activo ? "#DCFCE7" : "#FEE2E2",
              color: row.activo ? "#166534" : "#991B1B",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {row.activo ? "Activo" : "Inactivo"}
          </span>

          {/* Botón Detalles */}
          <Tooltip content="Detalles">
            <CustomButton
              variant="icon"
              color="green"
              size="sm"

              onClick={() => {
                hooks.juridicProccessData.setField(
                  "id_evaluaciones_juridicas",
                  row.id,
                );
                hooks.UseLegalData.setExtra("selected", row);
                hooks.UseLegalData.setExtra("openModal", true);
              }}
            >
              <FaEye />
            </CustomButton>
          </Tooltip>
        </div>
      ),
    },
    swipeActions: {
      left: [
        {
          icon: <FaEdit size={18} color="#fff" />,
          color: "#3B82F6",
          label: "Editar",
          action: async (row, hooks) => {
            // Aquí tienes acceso a hooks
            hooks.UseLegalData.setExtra("legal", row as unknown as Loby);
            hooks.UseLegalData.handleChangeItem({
              ...hooks.UseLegalData.initialValues,
              ...row,
            });
            hooks.UseLegalData.setOpen(true, false);
          },
        },
      ],
      right: [
        {
          icon: <FaTrash size={18} color="#fff" />,
          color: "#EF4444",
          label: "Eliminar",
          action: async (row, hooks) => {
            const confirmed = await Swal.fire({
              title: "¿Eliminar?",
              text: `¿Estás seguro de eliminar el expediente ${row.folio || row.id}?`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#9B2242",
              cancelButtonColor: "#6B7280",
              confirmButtonText: "Sí, eliminar",
              cancelButtonText: "Cancelar",
            });
            if (confirmed.isConfirmed) {
              // hooks.UseLegalData.removeItemData(row);
              console.log("Eliminar:", row);
            }
          },
        },
      ],
    },
    // quickFilters y bottomSheet también pueden usar hooks si se definen
  })
  .build();
