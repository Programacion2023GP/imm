// src/ui/components/advanced/ViewSwitcher.tsx
import React from "react";
import { FiGrid, FiList, FiCalendar, FiMap, FiBarChart2 } from "react-icons/fi";
import type { ViewMode } from "../../../types/crud-advanced.types";
import { theme } from "../../../config/themes";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
}

const viewConfig: Record<ViewMode, { icon: React.ReactNode; label: string }> = {
  table: { icon: <FiList className="w-4 h-4" />, label: "Tabla" },
  kanban: { icon: <FiBarChart2 className="w-4 h-4" />, label: "Kanban" },
  calendar: { icon: <FiCalendar className="w-4 h-4" />, label: "Calendario" },
  grid: { icon: <FiGrid className="w-4 h-4" />, label: "Cuadrícula" },
  map: { icon: <FiMap className="w-4 h-4" />, label: "Mapa" },
};

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  availableViews = ["table", "kanban", "calendar", "grid", "map"],
}) => {
  return (
    <div
      className="inline-flex items-center p-1 space-x-1 rounded-lg"
      style={{
        background: theme.colors.background.surface,
      }}
    >
      {availableViews.map((view) => {
        const config = viewConfig[view];
        if (!config) return null;

        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200`}
            style={{
              background: isActive
                ? theme.colors.background.card
                : "transparent",
              color: isActive
                ? theme.colors.primary.DEFAULT
                : theme.colors.text.secondary,
              boxShadow: isActive ? theme.shadows.sm : "none",
            }}
            title={config.label}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background =
                  theme.colors.background.surfaceHover;
                e.currentTarget.style.color = theme.colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = theme.colors.text.secondary;
              }
            }}
          >
            <span className="mr-1.5" style={{ color: "inherit" }}>
              {config.icon}
            </span>
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
