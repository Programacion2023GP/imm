// src/ui/components/advanced/BulkActionsBar.tsx
import React from "react";
import { FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import type { BulkAction } from "../../../types/crud-advanced.types";

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
      <div className="flex items-center justify-between px-4 py-3 border border-blue-200 rounded-lg bg-blue-50 animate-slideDown">
         <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
               {selectedCount} elemento{selectedCount !== 1 ? "s" : ""}{" "}
               seleccionado{selectedCount !== 1 ? "s" : ""}
            </span>
            <button
               onClick={onClearSelection}
               className="flex items-center text-xs font-medium text-blue-700 hover:text-blue-900">
               <FiX className="w-3 h-3 mr-1" />
               Limpiar selección
            </button>
         </div>

         <div className="flex items-center space-x-2">
            {customActions.map((action) => (
               <button
                  key={action.id}
                  onClick={() => onCustomAction(action.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                  {action.icon}
                  {action.label}
               </button>
            ))}

            <button
               onClick={onBulkDelete}
               className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50">
               <FiTrash2 className="w-3 h-3 mr-1" />
               Eliminar seleccionados
            </button>
         </div>
      </div>
   );
};

export default BulkActionsBar;
