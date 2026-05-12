// src/ui/components/advanced/ViewSwitcher.tsx
import React from "react";
import { FiGrid, FiList, FiCalendar, FiMap, FiBarChart2 } from "react-icons/fi";
import { ViewMode } from "../../types/crud-advanced.types";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
}

const viewConfig: Record<ViewMode, { icon: React.ReactNode; label: string }> = {
  table: { icon: <FiList className="h-4 w-4" />, label: "Tabla" },
  kanban: { icon: <FiBarChart2 className="h-4 w-4" />, label: "Kanban" },
  calendar: { icon: <FiCalendar className="h-4 w-4" />, label: "Calendario" },
  grid: { icon: <FiGrid className="h-4 w-4" />, label: "Cuadrícula" },
  map: { icon: <FiMap className="h-4 w-4" />, label: "Mapa" },
};

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  availableViews = ['table', 'kanban', 'calendar', 'grid', 'map'],
}) => {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
      {availableViews.map((view) => {
        const config = viewConfig[view];
        if (!config) return null;

        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            title={config.label}
          >
            <span className="mr-1.5">{config.icon}</span>
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
