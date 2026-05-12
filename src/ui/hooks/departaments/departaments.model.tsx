// config/users.crud.ts
import { ConfigCrud } from "../../../models/genericmodels.model";

// 1. Interfaz del formulario (lo que se guarda en BD)
export interface UserForm {
  id: number;
  uuid: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  role_id: "admin" | "user" | "manager" | "viewer";
  status_id: "active" | "inactive" | "suspended" | "pending";
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  preferences: Record<string, any> | null;
  metadata: {
    department_id?: number;
    position?: string;
    hire_date?: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// 2. Interfaz para la tabla (datos enriquecidos)
export interface UserTableRow extends UserForm {
  role_name: string;
  status_name: string;
  department_name: string;
  full_name: string;
}

// 3. Configuración CORREGIDA
export const user2CrudConfig = ConfigCrud<UserForm, UserTableRow>()
  .fields({
    text: ["username", "email", "first_name", "last_name"],
    select: ["role_id", "status_id"],
  })
  .select({
    role_id: {
      keyId: "id",
      keyLabel: "name",
      options: [
        { id: "admin", name: "Administrador" },
        { id: "user", name: "Usuario" },
        { id: "manager", name: "Manager" },
        { id: "viewer", name: "Espectador" },
      ],
      label: "Rol",
      validation: ({ yup }) => yup.string().required("Rol requerido"),
    },
    status_id: {
      keyId: "id",
      keyLabel: "name",
      options: [
        { id: "active", name: "Activo" },
        { id: "inactive", name: "Inactivo" },
        { id: "suspended", name: "Suspendido" },
        { id: "pending", name: "Pendiente" },
      ],
      label: "Estado",
    },
  })
  .text({
    username: {
      label: "Usuario",
      placeholder: "juan.perez",
      validation: ({ yup }) =>
        yup
          .string()
          .min(3, "Mínimo 3 caracteres")
          .required("Usuario requerido"),
    },
    email: {
      label: "Correo electrónico",
      placeholder: "juan@empresa.com",
      validation: ({ yup }) =>
        yup.string().email("Correo inválido").required("Correo requerido"),
    },
    first_name: {
      label: "Nombre",
      placeholder: "Juan",
      validation: ({ yup }) => yup.string().required("Nombre requerido"),
    },
    last_name: {
      label: "Apellido",
      placeholder: "Pérez",
      validation: ({ yup }) => yup.string().required("Apellido requerido"),
    },
  })
  .table({
    username: {
      label: "Usuario",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            {row.first_name?.charAt(0)}
            {row.last_name?.charAt(0)}
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    email: {
      label: "Correo",
      render: (value) => (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-700"
        >
          {value}
        </a>
      ),
    },
    full_name: {
      label: "Nombre completo",
      render: (_, row) => `${row.first_name} ${row.last_name}`,
    },
    role_name: {
      label: "Rol",
      render: (value) => {
        const colors: Record<string, string> = {
          admin: "bg-purple-100 text-purple-800",
          user: "bg-blue-100 text-blue-800",
          manager: "bg-green-100 text-green-800",
          viewer: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[value?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}
          >
            {value}
          </span>
        );
      },
    },
    status_name: {
      label: "Estado",
      render: (value) => {
        const statusConfig: Record<
          string,
          { bg: string; text: string; dot: string; label: string }
        > = {
          active: {
            bg: "bg-green-100",
            text: "text-green-800",
            dot: "bg-green-500",
            label: "Activo",
          },
          inactive: {
            bg: "bg-gray-100",
            text: "text-gray-800",
            dot: "bg-gray-500",
            label: "Inactivo",
          },
          suspended: {
            bg: "bg-red-100",
            text: "text-red-800",
            dot: "bg-red-500",
            label: "Suspendido",
          },
          pending: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            dot: "bg-yellow-500",
            label: "Pendiente",
          },
        };
        const config =
          statusConfig[value?.toLowerCase()] || statusConfig.inactive;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
          </span>
        );
      },
    },
  })
  .override({
    text: ({ label, value, onChange, error, placeholder }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          className={`
            w-full px-3 py-2 rounded-lg border transition-all duration-200
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    ),
    select: ({ label, value, onChange, error, options, keyId, keyLabel }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          className={`
            w-full px-3 py-2 rounded-lg border transition-all duration-200
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white
          `}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {options?.map((opt: any) => (
            <option key={opt[keyId]} value={opt[keyId]}>
              {opt[keyLabel]}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    ),
    table: ({ columns, data, onEdit, onDelete }) => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {col.render
                        ? col.render(row[col.field], row)
                        : row[col.field]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                      title="Editar"
                    >
                      <svg
                        className="w-5 h-5 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar"
                    >
                      <svg
                        className="w-5 h-5 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  })
  // ✅ CORREGIDO: Ahora usa Formik en lugar de Form
  .render(({ Formik, Table, overrides, hook, modal, }) => {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los usuarios del sistema
              </p>
            </div>
            <button
              onClick={() => modal.openWith()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo usuario
            </button>
          </div>
        </div>

        {/* Tabla */}
        <Table />

        {/* Modal */}
        {modal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {hook.formData?.id ? "Editar usuario" : "Crear nuevo usuario"}
                </h2>
                <button
                  onClick={() => modal.close()}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body - ✅ AHORA USA FORMIK */}
              <div className="px-6 py-4">
                <Formik >
                  {({ values, errors, isSubmitting, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <overrides.text name="username" />
                      <overrides.text name="email" />
                      <div className="grid grid-cols-2 gap-3">
                        <overrides.text name="first_name" />
                        <overrides.text name="last_name" />
                      </div>
                      <overrides.select name="role_id" />
                      <overrides.select name="status_id" />

                      {/* Modal Footer */}
                      <div className="mt-6 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => modal.close()}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`
                            px-4 py-2 rounded-lg font-medium text-white transition-all duration-200
                            ${
                              isSubmitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md"
                            }
                          `}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Guardando...
                            </span>
                          ) : (
                            "Guardar cambios"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  })
  .build();
