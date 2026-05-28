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
import { theme } from "../../../config/themes";

interface AuditLogViewerProps {
  logs: AuditLog[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewResource?: (resourceId: string) => void;
}

const actionConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  CREATE: {
    icon: <FiPlus className="w-4 h-4" />,
    color: theme.colors.status.success,
    bgColor: theme.colors.feedback.successLight,
    label: "Creación",
  },
  UPDATE: {
    icon: <FiEdit2 className="w-4 h-4" />,
    color: theme.colors.status.info,
    bgColor: `${theme.colors.status.info}15`,
    label: "Actualización",
  },
  DELETE: {
    icon: <FiTrash2 className="w-4 h-4" />,
    color: theme.colors.status.error,
    bgColor: theme.colors.feedback.errorLight,
    label: "Eliminación",
  },
  BULK_DELETE: {
    icon: <FiTrash2 className="w-4 h-4" />,
    color: theme.colors.status.error,
    bgColor: theme.colors.feedback.errorLight,
    label: "Eliminación masiva",
  },
  BULK_UPDATE: {
    icon: <FiEdit2 className="w-4 h-4" />,
    color: theme.colors.primary.DEFAULT,
    bgColor: theme.colors.feedback.primaryLight,
    label: "Actualización masiva",
  },
  IMPORT: {
    icon: <FiDatabase className="w-4 h-4" />,
    color: theme.colors.status.warning,
    bgColor: `${theme.colors.status.warning}15`,
    label: "Importación",
  },
  EXPORT: {
    icon: <FiDatabase className="w-4 h-4" />,
    color: theme.colors.primary.light,
    bgColor: theme.colors.feedback.primaryLight,
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
    <div
      className="overflow-hidden rounded-xl shadow-sm"
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.DEFAULT}`,
        boxShadow: theme.shadows.sm,
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          borderBottomColor: theme.colors.border.DEFAULT,
        }}
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          Historial de Auditoría
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs font-medium transition-colors"
            style={{ color: theme.colors.primary.DEFAULT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.primary.dark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.primary.DEFAULT;
            }}
          >
            Actualizar
          </button>
        )}
      </div>

      <div
        className="overflow-y-auto max-h-96"
        style={{
          background: theme.colors.background.card,
        }}
      >
        {loading ? (
          <div
            className="p-8 text-center"
            style={{ color: theme.colors.text.secondary }}
          >
            <div
              className="inline-block w-6 h-6 mb-2 border-2 rounded-full animate-spin"
              style={{
                borderColor: theme.colors.border.DEFAULT,
                borderTopColor: theme.colors.primary.DEFAULT,
              }}
            ></div>
            <p className="text-sm">Cargando auditoría...</p>
          </div>
        ) : logs.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ color: theme.colors.text.disabled }}
          >
            <FiClock
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: theme.colors.text.disabled }}
            />
            <p className="text-sm">No hay registros de auditoría</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const config = actionConfig[log.action] || actionConfig.CREATE;
            return (
              <div
                key={log.id}
                className="px-6 py-4 transition-colors"
                style={{
                  background: theme.colors.background.card,
                  borderBottom:
                    index < logs.length - 1
                      ? `1px solid ${theme.colors.border.light}`
                      : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme.colors.background.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    theme.colors.background.card;
                }}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: config.bgColor,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {config.label}
                        {log.resourceId && onViewResource && (
                          <button
                            onClick={() =>
                              onViewResource(String(log.resourceId))
                            }
                            className="ml-2 text-xs transition-colors"
                            style={{ color: theme.colors.primary.DEFAULT }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.primary.dark;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.primary.DEFAULT;
                            }}
                          >
                            #{log.resourceId}
                          </button>
                        )}
                      </p>
                      <span
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {log.description}
                    </p>
                    <div
                      className="flex items-center mt-2 text-xs"
                      style={{ color: theme.colors.text.disabled }}
                    >
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
                      <div
                        className="p-3 mt-2 rounded-md"
                        style={{
                          background: theme.colors.background.surface,
                        }}
                      >
                        <p
                          className="mb-1 text-xs font-medium"
                          style={{ color: theme.colors.text.primary }}
                        >
                          Cambios:
                        </p>
                        {Object.entries(log.changes).map(
                          ([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="text-xs"
                              style={{ color: theme.colors.text.secondary }}
                            >
                              <span className="font-medium">{key}:</span>{" "}
                              <span
                                style={{ color: theme.colors.status.error }}
                              >
                                {JSON.stringify(value.oldValue)}
                              </span>
                              {" → "}
                              <span
                                style={{ color: theme.colors.status.success }}
                              >
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
