// src/ui/components/advanced/CalendarView.tsx
import React, { useState, useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { theme } from "../../../config/themes";

interface CalendarItem {
  id: string | number;
  title: string;
  date: string;
  endDate?: string;
  type?: "event" | "task" | "reminder";
  color?: string;
  [key: string]: any;
}

interface CalendarViewProps<T = any> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  dateField?: string;
  titleField?: string;
  renderItem?: (item: T) => React.ReactNode;
}

const CalendarView = <T extends { id?: number }>({
  items,
  onEdit,
  onDelete,
  dateField = "date",
  titleField = "name",
  renderItem,
}: CalendarViewProps<T>) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getItemsForDate = (date: string) => {
    return (items as any[]).filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      return itemDate.startsWith(date);
    });
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;
      days.push({
        day: d,
        date,
        items: getItemsForDate(date),
      });
    }
    return days;
  }, [year, month, items]);

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : [];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="overflow-hidden rounded-xl shadow-sm"
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.DEFAULT}`,
        boxShadow: theme.shadows.sm,
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderBottomColor: theme.colors.border.DEFAULT }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 transition-colors rounded-lg"
            style={{ color: theme.colors.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme.colors.background.surface;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.colors.text.primary }}
          >
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 transition-colors rounded-lg"
            style={{ color: theme.colors.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme.colors.background.surface;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-px"
        style={{ background: theme.colors.border.light }}
      >
        {/* Day headers */}
        {days.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium"
            style={{
              background: theme.colors.background.surface,
              color: theme.colors.text.secondary,
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((dayObj, idx) => {
          const isToday = dayObj?.date === today;
          const isSelected = dayObj?.date === selectedDate;
          return (
            <div
              key={idx}
              className="p-2 min-h-[100px] transition-colors cursor-pointer"
              style={{
                background: isToday
                  ? theme.colors.feedback.primaryLight
                  : theme.colors.background.card,
                outline: isSelected
                  ? `2px solid ${theme.colors.primary.DEFAULT}`
                  : "none",
                outlineOffset: "-1px",
              }}
              onClick={() => dayObj && setSelectedDate(dayObj.date)}
            >
              {dayObj && (
                <>
                  <div
                    className={`text-sm font-medium mb-1 ${isToday ? "" : ""}`}
                    style={{
                      color: isToday
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.text.primary,
                    }}
                  >
                    {dayObj.day}
                  </div>
                  <div className="space-y-1">
                    {dayObj.items.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="text-xs p-1 rounded truncate cursor-pointer transition-colors"
                        style={{
                          background: theme.colors.feedback.primaryLight,
                          color: theme.colors.primary.DEFAULT,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            theme.colors.primary.DEFAULT;
                          e.currentTarget.style.color =
                            theme.colors.text.inverse;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            theme.colors.feedback.primaryLight;
                          e.currentTarget.style.color =
                            theme.colors.primary.DEFAULT;
                        }}
                      >
                        {item[titleField]}
                      </div>
                    ))}
                    {dayObj.items.length > 3 && (
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        +{dayObj.items.length - 3} más
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && selectedDateItems.length > 0 && (
        <div
          className="p-4 border-t"
          style={{
            borderTopColor: theme.colors.border.DEFAULT,
          }}
        >
          <h4
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.text.primary }}
          >
            Eventos para el {selectedDate}
          </h4>
          <div className="space-y-2">
            {selectedDateItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors"
                style={{
                  background: theme.colors.background.surface,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme.colors.background.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    theme.colors.background.surface;
                }}
              >
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {item[titleField]}
                      </p>
                      {item.description && (
                        <p
                          className="text-xs"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(item)}
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
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
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
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
