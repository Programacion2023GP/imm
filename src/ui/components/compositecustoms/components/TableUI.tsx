// CompositeCrud/components/TableUI.tsx
import  { useState, useEffect } from "react";
import { theme } from "../../../../config/themes";

// ─── SearchBar ────────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(localValue), debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder || "Buscar..."}
      style={{
        width: "100%",
        padding: "6px 12px",
        border: `1px solid ${theme.colors.border.DEFAULT}`,
        borderRadius: theme.radius.md,
        fontSize: theme.typography.fontSize.sm,
      }}
    />
  );
};

// ─── FilterPanel ──────────────────────────────────────────────────────────────
interface FilterPanelProps {
  filters: Array<{ field: string; label: string; type?: string }>;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onClear: () => void;
  isOpen: boolean;
}

export const FilterPanel = ({
  filters,
  values,
  onChange,
  onClear,
  isOpen,
}: FilterPanelProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        padding: "12px",
        border: `1px solid ${theme.colors.border.DEFAULT}`,
        borderRadius: theme.radius.md,
        background: theme.colors.background.surface,
      }}
    >
      <div className="flex justify-between mb-2">
        <span
          className="font-medium"
          style={{ color: theme.colors.text.primary }}
        >
          Filtros
        </span>
        <button
          onClick={onClear}
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.status.error,
          }}
        >
          Limpiar
        </button>
      </div>
      {filters?.map((filter) => (
        <div key={filter.field} className="mb-2">
          <label
            className="block mb-1 text-xs"
            style={{ color: theme.colors.text.secondary }}
          >
            {filter.label}
          </label>
          <input
            type="text"
            value={values[filter.field] || ""}
            onChange={(e) => onChange(filter.field, e.target.value)}
            style={{
              width: "100%",
              padding: "4px 8px",
              fontSize: theme.typography.fontSize.sm,
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.sm,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── BulkActionsBar ───────────────────────────────────────────────────────────
interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  customActions?: Array<{ id: string; label: string }>;
  onCustomAction?: (actionId: string) => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  customActions,
  onCustomAction,
}: BulkActionsBarProps) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px",
      borderRadius: theme.radius.md,
      background: theme.colors.feedback.primaryLight,
    }}
  >
    <span
      style={{
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.primary,
      }}
    >
      {selectedCount} seleccionados
    </span>
    <button
      onClick={onClearSelection}
      style={{
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
      }}
    >
      Cancelar
    </button>
    <button
      onClick={onBulkDelete}
      style={{
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.status.error,
      }}
    >
      Eliminar
    </button>
    {customActions?.map((action) => (
      <button
        key={action.id}
        onClick={() => onCustomAction?.(action.id)}
        style={{ fontSize: theme.typography.fontSize.xs }}
      >
        {action.label}
      </button>
    ))}
  </div>
);

// ─── ViewSwitcher ─────────────────────────────────────────────────────────────
interface ViewSwitcherProps {
  currentView: string;
  onViewChange: (mode: string) => void;
  availableViews: string[];
}

export const ViewSwitcher = ({
  currentView,
  onViewChange,
  availableViews,
}: ViewSwitcherProps) => (
  <div
    style={{
      display: "flex",
      gap: "4px",
      padding: "4px",
      background: theme.colors.background.surface,
      borderRadius: theme.radius.md,
    }}
  >
    {availableViews.map((mode) => (
      <button
        key={mode}
        onClick={() => onViewChange(mode)}
        style={{
          padding: "4px 8px",
          fontSize: theme.typography.fontSize.xs,
          borderRadius: theme.radius.sm,
          background:
            currentView === mode ? theme.colors.background.card : "transparent",
          boxShadow: currentView === mode ? theme.shadows.sm : "none",
        }}
      >
        {mode === "table"
          ? "📋"
          : mode === "kanban"
            ? "📌"
            : mode === "calendar"
              ? "📅"
              : mode}
      </button>
    ))}
  </div>
);

// ─── DashboardStats ───────────────────────────────────────────────────────────
interface DashboardStatsProps {
  stats: { total: number; active: number; inactive: number };
  title: string;
  onRefresh: () => void;
}

export const DashboardStats = ({
  stats,
  title,
  onRefresh,
}: DashboardStatsProps) => (
  <div
    style={{
      padding: "16px",
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.DEFAULT}`,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.sm,
    }}
  >
    <div className="flex justify-between">
      <h3 style={{ fontWeight: 500, color: theme.colors.text.primary }}>
        {title}
      </h3>
      <button
        onClick={onRefresh}
        style={{ fontSize: theme.typography.fontSize.xs }}
      >
        ⟳
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4 mt-2 text-center">
      <div style={{ color: theme.colors.text.secondary }}>
        Total
        <br />
        <span style={{ fontWeight: 600 }}>{stats.total ?? 0}</span>
      </div>
      <div style={{ color: theme.colors.text.secondary }}>
        Activos
        <br />
        <span style={{ fontWeight: 600 }}>{stats.active ?? 0}</span>
      </div>
      <div style={{ color: theme.colors.text.secondary }}>
        Inactivos
        <br />
        <span style={{ fontWeight: 600 }}>{stats.inactive ?? 0}</span>
      </div>
    </div>
  </div>
);

// ─── AuditLogViewer ───────────────────────────────────────────────────────────
interface AuditLogViewerProps {
  logs: Array<{ message?: string; action?: string }>;
  loading: boolean;
  onRefresh: () => void;
}

export const AuditLogViewer = ({
  logs,
  loading,
  onRefresh,
}: AuditLogViewerProps) => (
  <div
    style={{
      padding: "12px",
      border: `1px solid ${theme.colors.border.DEFAULT}`,
      borderRadius: theme.radius.md,
    }}
  >
    <div className="flex justify-between">
      <h3 style={{ fontWeight: 500, color: theme.colors.text.primary }}>
        Auditoría
      </h3>
      <button
        onClick={onRefresh}
        style={{ fontSize: theme.typography.fontSize.xs }}
      >
        ⟳
      </button>
    </div>
    {loading ? (
      <p style={{ color: theme.colors.text.secondary }}>Cargando...</p>
    ) : logs.length === 0 ? (
      <p style={{ color: theme.colors.text.disabled }}>Sin registros</p>
    ) : (
      <ul className="mt-2 text-sm">
        {logs.slice(0, 5).map((log, idx) => (
          <li key={idx} style={{ color: theme.colors.text.secondary }}>
            📄 {log.message || log.action}
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ─── KanbanView (placeholder) ─────────────────────────────────────────────────
export const KanbanView = () => (
  <div
    style={{
      padding: "16px",
      textAlign: "center",
      color: theme.colors.text.disabled,
      border: `1px solid ${theme.colors.border.DEFAULT}`,
      borderRadius: theme.radius.md,
    }}
  >
    Kanban View (en construcción)
  </div>
);

// ─── CalendarView (placeholder) ───────────────────────────────────────────────
export const CalendarView = () => (
  <div
    style={{
      padding: "16px",
      textAlign: "center",
      color: theme.colors.text.disabled,
      border: `1px solid ${theme.colors.border.DEFAULT}`,
      borderRadius: theme.radius.md,
    }}
  >
    Calendar View (en construcción)
  </div>
);
