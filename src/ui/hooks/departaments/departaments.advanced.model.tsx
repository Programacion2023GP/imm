// src/ui/hooks/departaments/departaments.advanced.model.tsx
// Ejemplo COMPLETO con TODAS las funcionalidades avanzadas
import { ConfigCrud } from "../../../models/genericmodels.model";
import type {
   AdvancedCrudConfig,
   ViewMode,
} from "../../../types/crud-advanced.types";
import {
   FiUsers,
   FiMapPin,
   FiCalendar,
   FiList,
   FiCheck,
   FiDownload,
} from "react-icons/fi";

// 1. Interfaz para el formulario
export interface DepartamentForm {
   id?: number;
   name: string;
   description: string;
   status: "active" | "inactive";
   manager_id?: number;
   created_at?: string;
}

// 2. Interfaz para la tabla (enriquecida)
export interface DepartamentTable extends DepartamentForm {
   manager_name?: string;
   employees_count?: number;
}

// 3. Configuración Base del CRUD
export const departamentBaseConfig = ConfigCrud<
   DepartamentForm,
   DepartamentTable
>()
   .fields({
      text: ["name", "description"],
      select: ["status", "manager_id"],
   })
   .text({
      name: {
         label: "Nombre del Departamento",
         placeholder: "Ej: Recursos Humanos",
         validation: ({ yup }) =>
            yup
               .string()
               .required("El nombre es requerido")
               .min(3, "Mínimo 3 caracteres"),
      },
      description: {
         label: "Descripción",
         placeholder: "Descripción del departamento",
         validation: ({ yup }) =>
            yup.string().required("La descripción es requerida"),
      },
   })
   .select({
      status: {
         keyId: "id",
         keyLabel: "name",
         options: [
            { id: "active", name: "Activo" },
            { id: "inactive", name: "Inactivo" },
         ],
         label: "Estado",
         validation: ({ yup }) =>
            yup.string().required("El estado es requerido"),
      },
      manager_id: {
         keyId: "id",
         keyLabel: "name",
         options: [], // Se cargará via relación
         label: "Manager",
      },
   })
   .table({
      name: {
         label: "Nombre",
         render: (value, row) => (
            <div className="flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  🏢
               </div>
               <span className="font-medium">{value}</span>
            </div>
         ),
      },
      description: { label: "Descripción" },
      status: {
         label: "Estado",
         render: (value) => (
            <span
               className={`px-2 py-1 rounded-full text-xs ${
                  value === "active"
                     ? "bg-green-100 text-green-800"
                     : "bg-red-100 text-red-800"
               }`}>
               {value === "active" ? "Activo" : "Inactivo"}
            </span>
         ),
      },
      manager_name: { label: "Manager" },
      employees_count: {
         label: "Empleados",
         render: (value) => (
            <span className="inline-flex items-center gap-1">
               <FiUsers className="w-3 h-3" />
               {value || 0}
            </span>
         ),
      },
   })
   .layout({
      mode: "stepper",
      sections: ["Información General", "Estado y Manager"],
      fieldsPerSection: {
         "Información General": ["name", "description"],
         "Estado y Manager": ["status", "manager_id"],
      },
   })
   .build();

// 4. Configuración AVANZADA completa
export const departamentAdvancedConfig: AdvancedCrudConfig<
   DepartamentForm,
   DepartamentTable
> = {
   // Permisos (RBAC)
   permissions: {
      resource: "departaments",
      create: "create",
      read: "read",
      update: "update",
      delete: "delete",
   },

   // Búsqueda
   search: {
      fields: ["name", "description"],
      placeholder: "Buscar departamentos...",
      debounceMs: 300,
   },

   // Filtros avanzados
   filters: [
      {
         field: "status",
         label: "Estado",
         type: "select",
         options: [
            { id: "active", name: "Activo" },
            { id: "inactive", name: "Inactivo" },
         ],
      },
      {
         field: "created_at",
         label: "Fecha de creación",
         type: "date_range",
      },
      // {
      //    field: "employees_count",
      //    label: "Cantidad de empleados",
      //    type: "number_range",
      // },
   ],

   // Vistas personalizables
   views: [
      {
         mode: "table",
         label: "Tabla",
         icon: <FiList />,
         component: null as any, // Usa CustomTable por defecto
      },
      {
         mode: "kanban",
         label: "Kanban",
         icon: <FiMapPin />,
         component: null as any, // Usa KanbanView
      },
      {
         mode: "calendar",
         label: "Calendario",
         icon: <FiCalendar />,
         component: null as any, // Usa CalendarView
      },
   ],
   defaultView: "table",

   // Acciones en lote
   bulkActions: [
      {
         id: "activate",
         label: "Activar seleccionados",
         icon: <FiCheck />,
         action: async (items) => {
            console.log("Activating:", items);
            // Aquí iría la lógica
         },
         permission: "bulk_update",
      },
      {
         id: "export_selected",
         label: "Exportar seleccionados",
         icon: <FiDownload />,
         action: async (items) => {
            console.log("Exporting:", items);
         },
      },
   ],
   enableSelection: true,

   // Importación/Exportación
   export: {
      enabled: true,
      formats: ["csv", "xlsx"],
      filename: "departamentos",
   },
   import: {
      enabled: true,
      acceptedFormats: [".csv", ".xlsx", ".xls"],
      maxFileSizeMB: 5,
      onImport: async (data) => {
         console.log("Importing:", data);
         // Aquí iría la lógica de importación
      },
   },

   // Tiempo real (WebSocket)
   realtime: {
      enabled: true,
      endpoint: "ws://localhost:8080/ws/departaments",
      events: ["create", "update", "delete"],
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
   },

   // Autoguardado
   autosave: {
      enabled: false,
      intervalMs: 5000,
      onSave: async (values) => {
         console.log("Autosaving:", values);
         // Aquí iría la lógica de guardado
      },
      showIndicator: true,
   },

   // Relaciones
   relations: [
      {
         field: "manager_id",
         type: "belongs_to",
         resource: "managers",
         displayField: "name",
         valueField: "id",
         endpoint: "/api/managers",
      },
   ],

   // Dashboard
   dashboard: {
      enabled: true,
      widgets: [
         {
            id: "stats",
            type: "stat",
            title: "Estadísticas Generales",
            size: "full",
            component: null as any, // Usa DashboardStats
         },
         {
            id: "activity",
            type: "activity",
            title: "Actividad Reciente",
            size: "full",
            component: null as any, // Usa AuditLogViewer
         },
      ],
      stats: (items) => {
         const now = new Date();
         const lastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
         );

         return {
            total: items.length,
            active: items.filter((i) => i.status === "active").length,
            inactive: items.filter((i) => i.status === "inactive").length,
            recentActivity: [
               {
                  id: "1",
                  action: "CREATE",
                  description: `Se creó el departamento ${(items[0] as any)?.name || ""}`,
                  timestamp: new Date().toISOString(),
                  user: "Admin",
               },
            ],
            groupBy: {
               Activos: items.filter((i) => i.status === "active").length,
               Inactivos: items.filter((i) => i.status === "inactive").length,
            },
            trends: [
               { date: "Semana 1", count: 5 },
               { date: "Semana 2", count: 8 },
               { date: "Semana 3", count: 12 },
               { date: "Semana 4", count: 15 },
            ],
         };
      },
   },

   // Auditoría
   audit: {
      enabled: true,
      fetchLogs: async (resourceId) => {
         // Simulación - aquí iría la llamada real a la API
         return [
            {
               id: "1",
               action: "CREATE" as any,
               resource: "departaments",
               resourceId: resourceId,
               userId: "user1",
               userName: "Admin",
               timestamp: new Date().toISOString(),
               changes: {
                  name: { oldValue: null, newValue: "Nuevo Departamento" },
               },
            },
         ];
      },
   },
};

// 5. Hook personalizado con TODAS las funcionalidades
import { useAdvancedCrud } from "../../../hooks/useAdvancedCrud";
import {
   useGenericData,
   type GenericDataConfig,
} from "../../../hooks/usegenericdata";

const useDepartamentsAdvanced = () => {
   const baseConfig: GenericDataConfig<DepartamentForm> = {
      initialState: {
         id: undefined,
         name: "",
         description: "",
         status: "active",
         manager_id: undefined,
      },
      prefix: "departaments",
      autoFetch: true,
   };

   const advancedHook = useAdvancedCrud<DepartamentForm, DepartamentTable>(
      baseConfig,
      departamentAdvancedConfig,
   );

   return advancedHook;
};

export default useDepartamentsAdvanced;
