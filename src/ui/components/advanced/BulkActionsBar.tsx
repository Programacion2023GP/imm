// src/ui/components/advanced/BulkActionsBar.tsx
import React from "react";
import { FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import type { BulkAction } from "../../../types/crud-advanced.types";
import { theme } from "../../../config/themes";

interface BulkActionsBarProps<T = any> {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkUpdate: (data: any) => void;
  customActions?: BulkAction<T>[];
  onCustomAction: (actionId: string) => void;
}

const BulkActionsBar = <T extends { id?: number }>({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  customActions = [],
  onCustomAction,
}: BulkActionsBarProps<T>) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg animate-slideDown"
      style={{
        border: `1px solid ${theme.colors.primary.DEFAULT}40`,
        background: theme.colors.feedback.primaryLight,
      }}
    >
      <div className="flex items-center space-x-4">
        <span
          className="text-sm font-medium"
          style={{ color: theme.colors.primary.DEFAULT }}
        >
          {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
          {selectedCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onClearSelection}
          className="flex items-center text-xs font-medium transition-colors"
          style={{ color: theme.colors.primary.DEFAULT }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.primary.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.primary.DEFAULT;
          }}
        >
          <FiX className="w-3 h-3 mr-1" />
          Limpiar selección
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {customActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onCustomAction(action.id)}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              color: theme.colors.text.secondary,
              background: theme.colors.background.card,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme.colors.background.surface;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.background.card;
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        <button
          onClick={onBulkDelete}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            border: `1px solid ${theme.colors.status.error}50`,
            color: theme.colors.status.error,
            background: theme.colors.background.card,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.feedback.errorLight;
            e.currentTarget.style.color = theme.colors.status.error;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.background.card;
            e.currentTarget.style.color = theme.colors.status.error;
          }}
        >
          <FiTrash2 className="w-3 h-3 mr-1" />
          Eliminar seleccionados
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
