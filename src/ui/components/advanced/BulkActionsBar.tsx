// src/ui/components/advanced/BulkActionsBar.tsx
import React from "react";
import { FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import { BulkAction } from "../../types/crud-advanced.types";

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
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between animate-slideDown">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} elemento{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onClearSelection}
          className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center"
        >
          <FiX className="mr-1 h-3 w-3" />
          Limpiar selección
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {customActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onCustomAction(action.id)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        <button
          onClick={onBulkDelete}
          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50"
        >
          <FiTrash2 className="mr-1 h-3 w-3" />
          Eliminar seleccionados
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
