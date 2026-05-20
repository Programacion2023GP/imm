import { FiDroplet, FiUser } from "react-icons/fi";
import type { DataDisplayConfig } from "../../components/movil/view/customviewmovil";
import type { UsersTable } from "../../../models/users/users.models";

export const userMovilView: DataDisplayConfig<UsersTable> = {
  title: (data) => data.nombre_completo || "",
  subtitle: (data) => `ID: ${data.usuario || "N/A"}`,


  fields: [
    {
      key: "nombre_completo",
      label: "Nombre completo",
      type: "text",
      icon: <FiUser className="text-purple-600 text-lg" />,
      color: "bg-purple-50 border border-purple-100",
      format: "capitalize",
    },
    {
      key: "usuario",
      label: "Usuario",
      type: "text",
      icon: <FiUser className="text-purple-600 text-lg" />,
      color: "bg-purple-50 border border-purple-100",
      format: "capitalize",
    },
  ],

  sections: [
    {
      title: "Información",
      icon: <FiUser className="text-gray-600" />,
      fields: ["nombre_completo", "usuario"],
    },
  ],
};
