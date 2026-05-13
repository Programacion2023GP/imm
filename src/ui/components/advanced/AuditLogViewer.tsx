// src/ui/components/advanced/AuditLogViewer.tsx
import React from "react";
import {
   FiClock,
   FiUser,
   FiDatabase,
   FiTrash2,
   FiEdit2,
   FiPlus,
} from "react-icons/fi";
import type { AuditLog } from "../../../types/crud-advanced.types";

interface AuditLogViewerProps {
   logs: AuditLog[];
   loading?: boolean;
   onRefresh?: () => void;
   onViewResource?: (resourceId: string) => void;
}

const actionConfig: Record<
   string,
   { icon: React.ReactNode; color: string; label: string }
> = {
   CREATE: {
      icon: <FiPlus className="w-4 h-4" />,
      color: "text-green-600 bg-green-50",
      label: "Creación",
   },
   UPDATE: {
      icon: <FiEdit2 className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50",
      label: "Actualización",
   },
   DELETE: {
      icon: <FiTrash2 className="w-4 h-4" />,
      color: "text-red-600 bg-red-50",
      label: "Eliminación",
   },
   BULK_DELETE: {
      icon: <FiTrash2 className="w-4 h-4" />,
      color: "text-red-600 bg-red-50",
      label: "Eliminación masiva",
   },
   BULK_UPDATE: {
      icon: <FiEdit2 className="w-4 h-4" />,
      color: "text-purple-600 bg-purple-50",
      label: "Actualización masiva",
   },
   IMPORT: {
      icon: <FiDatabase className="w-4 h-4" />,
      color: "text-orange-600 bg-orange-50",
      label: "Importación",
   },
   EXPORT: {
      icon: <FiDatabase className="w-4 h-4" />,
      color: "text-teal-600 bg-teal-50",
      label: "Exportación",
   },
};

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
   logs,
   loading = false,
   onRefresh,
   onViewResource,
}) => {
   const formatDate = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleString("es-ES", {
         year: "numeric",
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
               Historial de Auditoría
            </h3>
            {onRefresh && (
               <button
                  onClick={onRefresh}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Actualizar
               </button>
            )}
         </div>

         <div className="overflow-y-auto divide-y divide-gray-100 max-h-96">
            {loading ? (
               <div className="p-8 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 mb-2 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600"></div>
                  <p className="text-sm">Cargando auditoría...</p>
               </div>
            ) : logs.length === 0 ? (
               <div className="p-8 text-center text-gray-500">
                  <FiClock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay registros de auditoría</p>
               </div>
            ) : (
               logs.map((log) => {
                  const config =
                     actionConfig[log.action] || actionConfig.CREATE;
                  return (
                     <div
                        key={log.id}
                        className="px-6 py-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                           <div className={`p-2 rounded-lg ${config.color}`}>
                              {config.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                 <p className="text-sm font-medium text-gray-900">
                                    {config.label}
                                    {log.resourceId && onViewResource && (
                                       <button
                                          onClick={() =>
                                             onViewResource(
                                                String(log.resourceId),
                                             )
                                          }
                                          className="ml-2 text-xs text-blue-600 hover:text-blue-800">
                                          #{log.resourceId}
                                       </button>
                                    )}
                                 </p>
                                 <span className="text-xs text-gray-500">
                                    {formatDate(log.timestamp)}
                                 </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                 {log.description}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                 <FiUser className="w-3 h-3 mr-1" />
                                 <span>{log.userName}</span>
                                 {log.resource && (
                                    <>
                                       <span className="mx-2">•</span>
                                       <FiDatabase className="w-3 h-3 mr-1" />
                                       <span>{log.resource}</span>
                                    </>
                                 )}
                              </div>
                              {log.changes && (
                                 <div className="p-3 mt-2 rounded-md bg-gray-50">
                                    <p className="mb-1 text-xs font-medium text-gray-700">
                                       Cambios:
                                    </p>
                                    {Object.entries(log.changes).map(
                                       ([key, value]: [string, any]) => (
                                          <div
                                             key={key}
                                             className="text-xs text-gray-600">
                                             <span className="font-medium">
                                                {key}:
                                             </span>{" "}
                                             <span className="text-red-600">
                                                {JSON.stringify(value.oldValue)}
                                             </span>
                                             {" → "}
                                             <span className="text-green-600">
                                                {JSON.stringify(value.newValue)}
                                             </span>
                                          </div>
                                       ),
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
};

export default AuditLogViewer;
