import { FaList } from "react-icons/fa";
import { ConfigCrud } from "../../models/genericmodels.model";
import type {
  PermissionForm,
  PermissionsTable,
} from "../../models/permissions/permission.models";

export const permissionBuilderCrud = ConfigCrud<PermissionForm, PermissionsTable>()
  .fields({
    text: ["nombre_permiso", "descripcion", "modulo"],
    toggle: ["activo"],
  })
  .text({
    nombre_permiso: {
      label: "Nombre del permiso",
      caseTransform: "uppercase",

      validation: ({ yup }) => yup.string().required("Permiso Requerido"),
    },
    descripcion: {
      label: "Descripcion del permiso",
      caseTransform: "uppercase",
    },
    modulo: { label: "Modulo del permiso", caseTransform: "uppercase" },
  })
  .tableHeader({
    title: "Catalogo de permisos",
    icon: <FaList />,
  })
  .tableColumns({
    nombre_permiso: {
      label: "Permiso",
    },
    descripcion: {
      label: "Descripción",
    },
    modulo: {
      label: "Modulo correspondiente",
    },
    activo: {
      label: "Estado",
      render: (value, record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
     
      filterType: "boolean",
    },
  })
  .build();
