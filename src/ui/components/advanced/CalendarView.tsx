// src/ui/components/advanced/CalendarView.tsx
import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface CalendarItem {
  id: string | number;
  title: string;
  date: string;
  endDate?: string;
  type?: 'event' | 'task' | 'reminder';
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
  dateField = 'date',
  titleField = 'name',
  renderItem,
}: CalendarViewProps<T>) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getItemsForDate = (date: string) => {
    return (items as any[]).filter(item => {
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
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        date,
        items: getItemsForDate(date),
      });
    }
    return days;
  }, [year, month, items]);

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {days.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-600">
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => (
          <div
            key={idx}
            className={`bg-white p-2 min-h-[100px] ${
              dayObj?.date === selectedDate ? 'ring-2 ring-blue-500' : ''
            } ${dayObj?.date === new Date().toISOString().split('T')[0] ? 'bg-blue-50' : ''}`}
            onClick={() => dayObj && setSelectedDate(dayObj.date)}
          >
            {dayObj && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                  dayObj.date === new Date().toISOString().split('T')[0]
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}>
                  {dayObj.day}
                </div>
                <div className="space-y-1">
                  {dayObj.items.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      {item[titleField]}
                    </div>
                  ))}
                  {dayObj.items.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayObj.items.length - 3} más
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedDate && selectedDateItems.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Eventos para el {selectedDate}
          </h4>
          <div className="space-y-2">
            {selectedDateItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item[titleField]}</p>
                      {item.description && (
                        <p className="text-xs text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 text-gray-400 hover:text-red-600"
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
