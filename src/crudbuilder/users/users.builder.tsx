import { FaList } from "react-icons/fa";
import { ConfigCrud } from "../../models/genericmodels.model";

import type { RolesForm, RolesTable } from "../../models/roles/roles.models";
import UseRoles from "../../ui/hooks/roles/userolesdata";
import { VscEditSparkle } from "react-icons/vsc";
import type { UsersForm, UsersTable } from "../../models/users/users.models";
import CustomDataDisplay from "../../ui/components/movil/view/customviewmovil";
import { userMovilView } from "../../ui/movilviews/users/users.movil";

export const usersBuilderCrud = ConfigCrud<UsersForm, UsersTable>()
  .fields({
    text: ["nombre_completo", "usuario"],
    // password:["password"],
    select: ["id_rol"],
  })
  .text({
    nombre_completo: {
      label: "Nombre Completo",
      caseTransform: "uppercase",
      placeholder: "INGE",
      onChange: (value, formik) => {
        // Limpiar y normalizar el nombre completo
        const nombreLimpio = value
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        const partes = nombreLimpio.split(" ");
        let usuarioBase = "";

        if (partes.length === 1) {
          usuarioBase = partes[0];
        } else if (partes.length === 2) {
          usuarioBase = `${partes[0][0]}${partes[1]}`;
        } else if (partes.length >= 3) {
          usuarioBase = `${partes[0][0]}${partes[1][0]}${partes[partes.length - 1]}`;
        }

        const añoActual = new Date().getFullYear().toString().slice(-2);
        let usuarioGenerado = `${usuarioBase}${añoActual}`.toLowerCase();

        // Aplicar caseTransform con un switch o if-else
        const transform = "uppercase"; // o el valor que viene de la configuración
        if (transform === "uppercase") {
          usuarioGenerado = usuarioGenerado.toUpperCase();
        } else if (transform === "lowercase") {
          usuarioGenerado = usuarioGenerado.toLowerCase();
        }
        // si es "none", se queda como está

        formik.setFieldValue("usuario", usuarioGenerado);
        formik.setFieldValue("password", usuarioGenerado);
      },
    },
    usuario: {
      label: "Usuario",
      disabled: true,
      placeholder: "INGE",
    },
 
  })
  .select({
    id_rol: {
      label: "Selecciona el rol",
      keyId: "id",
      keyLabel: "nombre_rol",
      selectOptionsHook: () => UseRoles().items,
    },
  })
  .tableHeader({
    title: "Usuarios",
    icon: <></>,
  })
  .tableColumns({
    nombre_completo: {
      label: "Nombre",
    },
    usuario: {
      label: "Usuario",
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
  .mobile({
    enabled: true,
    listTile: {
      title: (row) => row.nombre_completo,
      subtitle: (row) => row.usuario,
      leading: (row) => (
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
          {row.nombre_completo?.charAt(0) || "U"}
        </div>
      ),
    },
    bottomSheet: {
      height: 500,
      showCloseButton: true,
      builder: (row, onClose) => (
        
        <CustomDataDisplay
          data={row}
          config={userMovilView}
          // Si tu componente tiene un botón interno para cerrar, puedes llamar a onClose allí
        />
      ),
    },
  })

  .build();

