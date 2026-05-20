import { FaList } from "react-icons/fa";
import { ConfigCrud } from "../../models/genericmodels.model";

import type { RolesForm, RolesTable } from "../../models/roles/roles.models";
import UseRoles from "../../ui/hooks/roles/userolesdata";
import { VscEditSparkle } from "react-icons/vsc";
type RolesDispatch = {
  UseRoles: ReturnType<typeof UseRoles>;
};
export const rolBuilderCrud = ConfigCrud<RolesForm, RolesTable, RolesDispatch>()
  .fields({
    text: ["nombre_rol", "descripcion"],
    toggle: ["activo"],
  })
  .text({
    nombre_rol: {
      label: "Nombre del rol",
      validation: ({ yup }) => yup.string().required("Rol Requerido"),
      caseTransform: "uppercase",
    },
    descripcion: {
      label: "Descripcion del rol",
      caseTransform: "uppercase",

      onChange: (value, formik, hooks) => {
        // hooks tiene tipo MyHooks | undefined
      },
    },
  })

  .tableHeader({
    title: "Catalogo de roles",
    subtitle: "ssss",
    icon: <FaList />,
  })
  .tableColumns({
    nombre_rol: {
      label: "Rol",
    },
    descripcion: {
      label: "Descripción",
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
  // roles.builder.tsx
  .tableActions<RolesDispatch>({
    isEditing: true,
    isDelete: true,
    moreButtons: [
      {
        label: "Permisos",
        icon: <VscEditSparkle />,
        color: "yellow",
        tooltip: "Asignar permisos",
        actionHook: ({ row, hooks }) => {
          // ✅ hooks.UseRoles tiene el resultado real del hook
          hooks.UseRoles.unChangeRol(row);
          hooks.UseRoles.toggleOpenRolPermission();
        },
      },
    ],
  })
  .build();

