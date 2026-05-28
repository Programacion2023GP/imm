// // config/users.crud.ts
// import { env } from "../../../constant";
// import { ConfigCrud } from "../../../models/genericmodels.model";
// import { formatDatetime } from "../../../utils/helpers";
// import PhotoZoom from "../../components/images/images";
// import useOrganizationsData from "../organization/useOrganizationsData";
// import icons from "./../../../constant/icons";

// // 1. Interfaz del formulario (lo que se guarda en BD)
// export interface DepartmentForm {
//    id: number;
//    uuid: string;
//    organization_id: number | null;
//    code: string | null;
//    name: string | null;
//    seal_image: string | null;
//    start_date: Date | null;
//    end_date: Date | null;
//    active: boolean;

//    //  metadata: {
//    //     department_id?: number;
//    //     position?: string;
//    //     hire_date?: string;
//    //  } | null;
//    created_at?: string;
//    updated_at?: string;
//    deleted_at?: string | null;
// }

// // 2. Interfaz para la tabla (datos enriquecidos)
// export interface DepartmentTableRow extends DepartmentForm {
//    organization: string;
// }

// // 3. Configuración CORREGIDA
// export const departmentCrudConfig = ConfigCrud<DepartmentForm, DepartmentTableRow>()
//   .fields({
//     text: ["uuid", "code", "name", "start_date", "end_date"],
//     select: ["organization_id"],
//     file: ["seal_image"],
//     toggle: ["active"],
//   })
//   .text({
//     uuid: {
//       label: "UUID",
//       placeholder: "9X9999XX9X9XX9",
//       disabled: true,
//       validation: ({ yup }) => yup.string().notRequired(),
//     },
//     code: {
//       label: "Código",
//       placeholder: "AD",
//       validation: ({ yup }) => yup.string().required("Código Requerido"),
//     },
//     name: {
//       label: "Departamento",
//       placeholder: "Nombre del departamento",
//       validation: ({ yup }) => yup.string().required("Departamento requerido"),
//     },
//     start_date: {
//       label: "Fecha Inicial",
//       placeholder: "DD/MM/AAAA",
//       type: "date",

//       validation: ({ yup }) => yup.string().required("Fecha Inicial Requerido"),
//     },
//     end_date: {
//       label: "Fecha Final",
//       placeholder: "DD/MM/AAAA",
//       type: "date",

//       validation: ({ yup }) => yup.string().notRequired(),
//     },
//   })
//   .select({
//     organization_id: {
//       label: "Organización",
//       keyId: "id",
//       keyLabel: "name",
//       // options: [],
//       selectOptionsHook: () => useOrganizationsData().items,
//       validation: ({ yup }) => yup.string().required("Rol requerido"),
//     },
//   })
//   .file({
//     seal_image: {
//       label: "Sello",
//       showPreviews: true,
//     },
//   })
//   .toggle({
//     active: {
//       label: "Departamento Activo",
//     },
//   })
//   // .layout({
//   //    mode: "box",
//   //    sections: ["Información General", "Estado y Manager"],
//   //    fieldsPerSection: {
//   //       "Información General": ["uuid", "name"],
//   //       "Estado y Manager": ["active", "organization_id"],
//   //    },
//   // })
//   .tableColumns({
//     seal_image: {
//       label: "Sello",
//       render: (value, row) => (
//         <div className="flex items-center justify-center gap-2">
//           <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
//             <PhotoZoom src={value} alt="Sello" title="Sello del departamento" />
//           </div>
//           <span className="font-medium text-gray-900">{value}</span>
//         </div>
//       ),
//     },
//     uuid: {
//       label: "UUIDFFFFFFFFFFFFFFFFF",
//     },
//     created_at: {
//       label: "UUIDFFFFFFFFFFFFFFFFFFF",
//     },
//     deleted_at: {
//       label: "otroooFFFFFFFFFFFFFFF",
//     },
//     id: {
//       label: "otroooDDDDDDDDDDDDDDDDD",
//     },

//     code: {
//       label: "Codigo",
//       render: (value) => (
//         <a
//           href={`mailto:${value}`}
//           className="text-blue-600 hover:text-blue-700"
//         >
//           {value}
//         </a>
//       ),
//     },
//     name: {
//       label: "Departamento",
//       render: (value, _row) => `${value}`,
//     },
//     organization: {
//       label: "Rol",
//       render: (value) => {
//         const colors: Record<string, string> = {
//           PRESIDENCIA: "bg-primary-100 text-primary-800",
//           SIDEAPA: "bg-blue-100 text-blue-800",
//           SIDEAPAAR: "bg-gray-100 text-gray-800",
//           DIF: "bg-purple-100 text-purple-800",
//         };
//         return (
//           <span
//             className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[value?.toUpperCase()] || "bg-gray-100 text-gray-800"}`}
//           >
//             {value}
//           </span>
//         );
//       },
//     },
//     start_date: {
//       label: "Fecha Inicio",
//       render: (value, _row) => `${formatDatetime(value, false)}`,
//       getFilterValue: (value) => `${formatDatetime(value, false)}`,
//     },
//     end_date: {
//       label: "Fecha Fin",
//       render: (value, _row) => `${formatDatetime(value, false)}`,
//       getFilterValue: (value) => `${formatDatetime(value, false)}`,
//     },
//     active: {
//       label: "Estado",
//       render: (value) => {
//         const statusConfig: Record<
//           string,
//           { bg: string; text: string; dot: string; label: string }
//         > = {
//           true: {
//             bg: "bg-green-100",
//             text: "text-green-800",
//             dot: "bg-green-500",
//             label: "Activo",
//           },
//           false: {
//             bg: "bg-gray-100",
//             text: "text-gray-800",
//             dot: "bg-gray-500",
//             label: "Inactivo",
//           },
//           suspended: {
//             bg: "bg-red-100",
//             text: "text-red-800",
//             dot: "bg-red-500",
//             label: "Suspendido",
//           },
//           pending: {
//             bg: "bg-yellow-100",
//             text: "text-yellow-800",
//             dot: "bg-yellow-500",
//             label: "Pendiente",
//           },
//         };
//         const config = statusConfig[value] || statusConfig.false;
//         return (
//           <span
//             className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
//           >
//             <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
//             {config.label}
//           </span>
//         );
//       },
//     },
//   })
//   .tableHeader({
//     title: "probando titulo",
//     subtitle: "aqwq",
//     icon: <icons.Gi.Gi3dStairs size={30} />,
//   })
//   .tableActions({
//     isEditing: true,
//     isDelete: true,
//     moreButtons: [
//       {
//         label: "Ver perfil",
//         icon: <icons.Hi.HiUser />,

//         handleOnClick: (row) => console.log(row),
//         color: "blue",
//         permission: true,
//       },
//       {
//         label: "Ver perfil",
//         icon: <icons.Pi.PiAcorn />,
//         handleOnClick: (row) => console.log(row),
//         color: "red",
//         permission: true,
//       },
//     ],
//   })
//   .mobile({
//     enabled: true,
//     activeViews: true,
//     listTile: {
//       title: (row) => row.name,
//       subtitle: (row) => `${row.code} | ${row.organization || "Sin org"}`,
//       leading: (row) => (
//         <div className="w-10 h-10 rounded-full bg-[#9B2242] text-white flex items-center justify-center font-bold">
//           {row.name?.charAt(0)?.toUpperCase() || "D"}
//         </div>
//       ),
//       trailing: (row) => (
//         <span
//           className={`w-2.5 h-2.5 rounded-full ${row.active ? "bg-green-500" : "bg-gray-400"}`}
//         />
//       ),
//     },
//     quickFilters: {
//       enabled: true,
//       filters: [
//         { dataField: "name", label: "Nombre", type: "text" },
//         { dataField: "code", label: "Código", type: "text" },
//         {
//           dataField: "active",
//           label: "Estado",
//           type: "select",
//           options: [
//             { label: "Activo", value: "true" },
//             { label: "Inactivo", value: "false" },
//           ],
//         },
//       ],
//     },
//   })
//   // .override({
//   //   text: ({ label, value, onChange, error, placeholder }) => (
//   //     <div className="mb-4">
//   //       <label className="block mb-1 text-sm font-medium text-gray-700">
//   //         {label}
//   //       </label>
//   //       <input
//   //         className={`
//   //           w-full px-3 py-2 rounded-lg border transition-all duration-200
//   //           ${
//   //             error
//   //               ? "border-red-400 focus:border-red-500 focus:ring-red-500"
//   //               : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//   //           }
//   //           focus:outline-none focus:ring-2 focus:ring-opacity-50
//   //         `}
//   //         placeholder={placeholder}
//   //         value={value || ""}
//   //         onChange={(e) => onChange(e.target.value)}
//   //       />
//   //       {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//   //     </div>
//   //   ),
//   //   select: ({ label, value, onChange, error, options, keyId, keyLabel }) => (
//   //     <div className="mb-4">
//   //       <label className="block mb-1 text-sm font-medium text-gray-700">
//   //         {label}
//   //       </label>
//   //       <select
//   //         className={`
//   //           w-full px-3 py-2 rounded-lg border transition-all duration-200
//   //           ${
//   //             error
//   //               ? "border-red-400 focus:border-red-500 focus:ring-red-500"
//   //               : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//   //           }
//   //           focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white
//   //         `}
//   //         value={value || ""}
//   //         onChange={(e) => onChange(e.target.value)}
//   //       >
//   //         <option value="">Seleccione...</option>
//   //         {options?.map((opt: any) => (
//   //           <option key={opt[keyId]} value={opt[keyId]}>
//   //             {opt[keyLabel]}
//   //           </option>
//   //         ))}
//   //       </select>
//   //       {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//   //     </div>
//   //   ),
//   //   table: ({ columns, data, onEdit, onDelete }) => (
//   //     <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
//   //       <div className="overflow-x-auto">
//   //         <table className="min-w-full divide-y divide-gray-200">
//   //           <thead className="bg-gray-50">
//   //             <tr>
//   //               {columns.map((col) => (
//   //                 <th
//   //                   key={col.field}
//   //                   className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
//   //                 >
//   //                   {col.label}
//   //                 </th>
//   //               ))}
//   //               <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
//   //                 Acciones
//   //               </th>
//   //             </tr>
//   //           </thead>
//   //           <tbody className="bg-white divide-y divide-gray-200">
//   //             {data.map((row) => (
//   //               <tr
//   //                 key={row.id}
//   //                 className="transition-colors duration-150 hover:bg-gray-50"
//   //               >
//   //                 {columns.map((col) => (
//   //                   <td
//   //                     key={col.field}
//   //                     className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
//   //                   >
//   //                     {col.render
//   //                       ? col.render(row[col.field], row)
//   //                       : row[col.field]}
//   //                   </td>
//   //                 ))}
//   //                 <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
//   //                   <button
//   //                     onClick={() => onEdit(row)}
//   //                     className="mr-3 text-blue-600 transition-colors hover:text-blue-900"
//   //                     title="Editar"
//   //                   >
//   //                     <svg
//   //                       className="inline w-5 h-5"
//   //                       fill="none"
//   //                       stroke="currentColor"
//   //                       viewBox="0 0 24 24"
//   //                     >
//   //                       <path
//   //                         strokeLinecap="round"
//   //                         strokeLinejoin="round"
//   //                         strokeWidth={2}
//   //                         d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//   //                       />
//   //                     </svg>
//   //                   </button>
//   //                   <button
//   //                     onClick={() => onDelete(row)}
//   //                     className="text-red-600 transition-colors hover:text-red-900"
//   //                     title="Eliminar"
//   //                   >
//   //                     <svg
//   //                       className="inline w-5 h-5"
//   //                       fill="none"
//   //                       stroke="currentColor"
//   //                       viewBox="0 0 24 24"
//   //                     >
//   //                       <path
//   //                         strokeLinecap="round"
//   //                         strokeLinejoin="round"
//   //                         strokeWidth={2}
//   //                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//   //                       />
//   //                     </svg>
//   //                   </button>
//   //                 </td>
//   //               </tr>
//   //             ))}
//   //           </tbody>
//   //         </table>
//   //       </div>
//   //     </div>
//   //   ),
//   // })
//   // ✅ CORREGIDO: Ahora usa Formik en lugar de Form
//   // .render(({ Formik, Table, overrides, hook, modal, }) => {
//   //   return (
//   //     <div className="min-h-screen p-8 bg-gray-50">
//   //       {/* Header */}
//   //       <div className="mb-8">
//   //         <div className="flex items-center justify-between">
//   //           <div>
//   //             <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
//   //             <p className="mt-1 text-gray-600">
//   //               Gestiona los usuarios del sistema
//   //             </p>
//   //           </div>
//   //           <button
//   //             onClick={() => modal.openWith()}
//   //             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
//   //           >
//   //             <svg
//   //               className="w-5 h-5"
//   //               fill="none"
//   //               stroke="currentColor"
//   //               viewBox="0 0 24 24"
//   //             >
//   //               <path
//   //                 strokeLinecap="round"
//   //                 strokeLinejoin="round"
//   //                 strokeWidth={2}
//   //                 d="M12 4v16m8-8H4"
//   //               />
//   //             </svg>
//   //             Nuevo usuario
//   //           </button>
//   //         </div>
//   //       </div>

//   //       {/* Tabla */}
//   //       <Table />

//   //       {/* Modal */}
//   //       {modal.open && (
//   //         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
//   //           <div className="w-full max-w-md transition-all transform bg-white shadow-2xl rounded-2xl">
//   //             {/* Modal Header */}
//   //             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//   //               <h2 className="text-xl font-bold text-gray-900">
//   //                 {hook.formData?.id ? "Editar usuario" : "Crear nuevo usuario"}
//   //               </h2>
//   //               <button
//   //                 onClick={() => modal.close()}
//   //                 className="text-gray-400 transition-colors hover:text-gray-600"
//   //               >
//   //                 <svg
//   //                   className="w-6 h-6"
//   //                   fill="none"
//   //                   stroke="currentColor"
//   //                   viewBox="0 0 24 24"
//   //                 >
//   //                   <path
//   //                     strokeLinecap="round"
//   //                     strokeLinejoin="round"
//   //                     strokeWidth={2}
//   //                     d="M6 18L18 6M6 6l12 12"
//   //                   />
//   //                 </svg>
//   //               </button>
//   //             </div>

//   //             {/* Modal Body - ✅ AHORA USA FORMIK */}
//   //             <div className="px-6 py-4">
//   //               <Formik >
//   //                 {({ values, errors, isSubmitting, handleSubmit }) => (
//   //                   <form onSubmit={handleSubmit}>
//   //                     <overrides.text name="username" />
//   //                     <overrides.text name="email" />
//   //                     <div className="grid grid-cols-2 gap-3">
//   //                       <overrides.text name="first_name" />
//   //                       <overrides.text name="last_name" />
//   //                     </div>
//   //                     <overrides.select name="role_id" />
//   //                     <overrides.select name="status_id" />

//   //                     {/* Modal Footer */}
//   //                     <div className="flex justify-end gap-3 mt-6">
//   //                       <button
//   //                         type="button"
//   //                         onClick={() => modal.close()}
//   //                         className="px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
//   //                       >
//   //                         Cancelar
//   //                       </button>
//   //                       <button
//   //                         type="submit"
//   //                         disabled={isSubmitting}
//   //                         className={`
//   //                           px-4 py-2 rounded-lg font-medium text-white transition-all duration-200
//   //                           ${
//   //                             isSubmitting
//   //                               ? "bg-gray-400 cursor-not-allowed"
//   //                               : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md"
//   //                           }
//   //                         `}
//   //                       >
//   //                         {isSubmitting ? (
//   //                           <span className="flex items-center gap-2">
//   //                             <svg
//   //                               className="w-4 h-4 animate-spin"
//   //                               fill="none"
//   //                               viewBox="0 0 24 24"
//   //                             >
//   //                               <circle
//   //                                 className="opacity-25"
//   //                                 cx="12"
//   //                                 cy="12"
//   //                                 r="10"
//   //                                 stroke="currentColor"
//   //                                 strokeWidth="4"
//   //                               ></circle>
//   //                               <path
//   //                                 className="opacity-75"
//   //                                 fill="currentColor"
//   //                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//   //                               ></path>
//   //                             </svg>
//   //                             Guardando...
//   //                           </span>
//   //                         ) : (
//   //                           "Guardar cambios"
//   //                         )}
//   //                       </button>
//   //                     </div>
//   //                   </form>
//   //                 )}
//   //               </Formik>
//   //             </div>
//   //           </div>
//   //         </div>
//   //       )}
//   //     </div>
//   //   );
//   // })
//   .build();
