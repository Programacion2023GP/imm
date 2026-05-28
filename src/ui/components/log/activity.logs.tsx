import React, { useEffect, useState } from "react";
import { Clock, User, Edit, Trash2, Plus, Eye } from "lucide-react";
import { theme } from "../../../config/themes";

interface Log {
  id: number;
  event: "created" | "updated" | "deleted";
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  user_name: string;
  created_at: string;
  ip_address: string;
  user_agent: string;
}

interface Props {
  modelType: string; // 'user', 'post', etc.
  modelId: number;
}

export default function ActivityLogs({ modelType, modelId }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [modelType, modelId]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/logs/${modelType}/${modelId}`);
      const data = await res.json();
      setLogs(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case "created":
        return (
          <Plus
            className="w-4 h-4"
            style={{ color: theme.colors.status.success }}
          />
        );
      case "updated":
        return (
          <Edit
            className="w-4 h-4"
            style={{ color: theme.colors.primary.DEFAULT }}
          />
        );
      case "deleted":
        return (
          <Trash2
            className="w-4 h-4"
            style={{ color: theme.colors.status.error }}
          />
        );
      default:
        return (
          <Eye
            className="w-4 h-4"
            style={{ color: theme.colors.text.disabled }}
          />
        );
    }
  };

  const getEventText = (event: string) => {
    return (
      {
        created: "Creación",
        updated: "Actualización",
        deleted: "Eliminación",
      }[event] || event
    );
  };

  if (loading)
    return (
      <div
        className="text-center py-4"
        style={{ color: theme.colors.text.secondary }}
      >
        Cargando logs...
      </div>
    );

  if (logs.length === 0)
    return (
      <div
        className="text-center py-4"
        style={{ color: theme.colors.text.disabled }}
      >
        No hay actividades registradas.
      </div>
    );

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto p-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
          style={{
            border: `1px solid ${theme.colors.border.DEFAULT}`,
            background: theme.colors.background.card,
          }}
        >
          <div
            className="flex items-center justify-between p-3 cursor-pointer"
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
          >
            <div className="flex items-center gap-2">
              {getEventIcon(log.event)}
              <span
                className="font-medium text-sm"
                style={{ color: theme.colors.text.primary }}
              >
                {getEventText(log.event)}
              </span>
              <span
                className="text-xs ml-2 flex items-center gap-1"
                style={{ color: theme.colors.text.disabled }}
              >
                <Clock className="w-3 h-3" />
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {log.user_name}
              </span>
              <span style={{ color: theme.colors.border.DEFAULT }}>|</span>
              <span>{log.ip_address}</span>
            </div>
          </div>

          {expandedId === log.id && (
            <div
              className="border-t p-3 text-xs space-y-2"
              style={{
                borderTopColor: theme.colors.border.light,
                background: theme.colors.background.surface,
              }}
            >
              {log.event === "updated" && log.old_values && log.new_values && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div
                      className="font-semibold mb-1"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Antes
                    </div>
                    <pre
                      className="p-2 rounded border overflow-x-auto text-xs"
                      style={{
                        background: theme.colors.background.card,
                        borderColor: theme.colors.border.DEFAULT,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div
                      className="font-semibold mb-1"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Después
                    </div>
                    <pre
                      className="p-2 rounded border overflow-x-auto text-xs"
                      style={{
                        background: theme.colors.background.card,
                        borderColor: theme.colors.border.DEFAULT,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {(log.event === "created" || log.event === "deleted") && (
                <div>
                  <div
                    className="font-semibold mb-1"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {log.event === "created"
                      ? "Datos creados"
                      : "Datos eliminados"}
                  </div>
                  <pre
                    className="p-2 rounded border overflow-x-auto text-xs"
                    style={{
                      background: theme.colors.background.card,
                      borderColor: theme.colors.border.DEFAULT,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {JSON.stringify(
                      log.event === "created" ? log.new_values : log.old_values,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
              <div
                className="text-[10px] break-all"
                style={{ color: theme.colors.text.disabled }}
              >
                User-Agent: {log.user_agent}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
