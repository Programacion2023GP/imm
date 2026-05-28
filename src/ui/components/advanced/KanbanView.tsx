// src/ui/components/advanced/KanbanView.tsx
import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../../../config/themes";

interface KanbanCard {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority?: "low" | "medium" | "high";
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

const priorityColorsRecord: Record<string, { bg: string; text: string }> = {
  low: {
    bg: theme.colors.feedback.successLight,
    text: theme.colors.status.success,
  },
  medium: {
    bg: `${theme.colors.status.warning}15`,
    text: theme.colors.status.warning,
  },
  high: {
    bg: theme.colors.feedback.errorLight,
    text: theme.colors.status.error,
  },
};

const defaultStatuses = [
  { id: "pending", name: "Pendiente", color: theme.colors.background.surface },
  {
    id: "in_progress",
    name: "En Progreso",
    color: `${theme.colors.primary.DEFAULT}15`,
  },
  {
    id: "completed",
    name: "Completado",
    color: `${theme.colors.status.success}15`,
  },
];

const KanbanView = <T extends { id?: number }>({
  items,
  onEdit,
  onDelete,
  statusField = "status",
  statusOptions = defaultStatuses,
  titleField = "name",
  descriptionField = "description",
  renderCard,
}: KanbanViewProps<T>) => {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);

  const getStatusName = (statusId: string) => {
    return statusOptions.find((s) => s.id === statusId)?.name || statusId;
  };

  const getStatusColor = (statusId: string) => {
    return (
      statusOptions.find((s) => s.id === statusId)?.color ||
      theme.colors.background.surface
    );
  };

  const groupedItems = statusOptions.map((status) => ({
    ...status,
    items: (items as any[]).filter((item) => item[statusField] === status.id),
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
          <div
            className="rounded-t-lg p-3 border-b-2"
            style={{
              background: column.color,
              borderBottomColor: theme.colors.border.DEFAULT,
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="font-semibold"
                style={{ color: theme.colors.text.primary }}
              >
                {column.name}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: theme.colors.background.card,
                  color: theme.colors.text.secondary,
                }}
              >
                {column.items.length}
              </span>
            </div>
          </div>

          <div
            className="rounded-b-lg p-3 space-y-3 min-h-[200px]"
            style={{ background: theme.colors.background.surface }}
          >
            <AnimatePresence>
              {column.items.map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-lg p-4 shadow-sm transition-all cursor-pointer"
                  style={{
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.DEFAULT}`,
                    boxShadow: theme.shadows.sm,
                  }}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  whileHover={{
                    boxShadow: theme.shadows.md,
                  }}
                >
                  {renderCard ? (
                    renderCard(item)
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h5
                          className="font-medium text-sm"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {item[titleField]}
                        </h5>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="p-1 transition-colors rounded"
                            style={{ color: theme.colors.text.disabled }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.primary.DEFAULT;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.text.disabled;
                            }}
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="p-1 transition-colors rounded"
                            style={{ color: theme.colors.text.disabled }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.status.error;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color =
                                theme.colors.text.disabled;
                            }}
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {item[descriptionField] && (
                        <p
                          className="text-xs mb-2 line-clamp-2"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          {item[descriptionField]}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        {item.priority && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                priorityColorsRecord[item.priority]?.bg,
                              color: priorityColorsRecord[item.priority]?.text,
                            }}
                          >
                            {item.priority}
                          </span>
                        )}
                        {item.dueDate && (
                          <span
                            className="text-xs flex items-center"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            <FiClock className="h-3 w-3 mr-1" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {item.assignee && (
                        <div
                          className="mt-2 text-xs"
                          style={{ color: theme.colors.text.disabled }}
                        >
                          Asignado a: {item.assignee}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              className="w-full py-2 border-2 border-dashed rounded-lg text-xs transition-colors"
              style={{
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.disabled,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.hover;
                e.currentTarget.style.color = theme.colors.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
                e.currentTarget.style.color = theme.colors.text.disabled;
              }}
            >
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
