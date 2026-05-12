// src/ui/components/advanced/KanbanView.tsx
import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface KanbanCard {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  [key: string]: any;
}

interface KanbanViewProps<T = any> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  statusField?: string;
  statusOptions?: { id: string; name: string; color?: string }[];
  titleField?: string;
  descriptionField?: string;
  renderCard?: (item: T) => React.ReactNode;
}

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const defaultStatuses = [
  { id: 'pending', name: 'Pendiente', color: 'bg-gray-100' },
  { id: 'in_progress', name: 'En Progreso', color: 'bg-blue-100' },
  { id: 'completed', name: 'Completado', color: 'bg-green-100' },
];

const KanbanView = <T extends { id?: number }>({
  items,
  onEdit,
  onDelete,
  statusField = 'status',
  statusOptions = defaultStatuses,
  titleField = 'name',
  descriptionField = 'description',
  renderCard,
}: KanbanViewProps<T>) => {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);

  const getStatusName = (statusId: string) => {
    return statusOptions.find(s => s.id === statusId)?.name || statusId;
  };

  const getStatusColor = (statusId: string) => {
    return statusOptions.find(s => s.id === statusId)?.color || 'bg-gray-100';
  };

  const groupedItems = statusOptions.map(status => ({
    ...status,
    items: (items as any[]).filter(item => item[statusField] === status.id),
  }));

  const handleDragStart = (item: T) => {
    setDraggedItem(item);
  };

  const handleDrop = (statusId: string) => {
    if (draggedItem) {
      // Here you would update the item's status
      console.log(`Move item ${draggedItem.id} to ${statusId}`);
      setDraggedItem(null);
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {groupedItems.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <div className={`rounded-t-lg p-3 ${column.color} border-b-2 border-gray-300`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">{column.name}</h4>
              <span className="text-xs bg-white px-2 py-1 rounded-full font-medium">
                {column.items.length}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[200px]">
            <AnimatePresence>
              {column.items.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  {renderCard ? (
                    renderCard(item)
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {item[titleField]}
                        </h5>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {item[descriptionField] && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item[descriptionField]}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {item.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.priority] || 'bg-gray-100'}`}>
                            {item.priority}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <FiClock className="h-3 w-3 mr-1" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {item.assignee && (
                        <div className="mt-2 text-xs text-gray-500">
                          Asignado a: {item.assignee}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
              <FiPlus className="inline mr-1" />
              Agregar tarjeta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
