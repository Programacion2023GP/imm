import React, { useState, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  Clock,
  Filter,
  MapPin,
  Users,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Loader,
  Columns,
  Calendar as CalendarIcon,
  X,
  Navigation,
  Eye,
  EyeOff,
  Layers,
  CalendarDays,
  Download,
  Printer,
} from "lucide-react";
import { formatDatetime, DateFormat } from "../../../utils/helpers";
import { theme } from "../../../config/themes";

type ViewMode = "day" | "week" | "month" | "year";

export interface ModuleConfig {
  name: string;
  color: string;
  description?: string;
  icon?: string;
}

export interface EventItem {
  id: number;
  module: string;
  datetime: Date;
  title?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  data?: {};
  tags?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  duration?: number;
  customAction?: () => void;
  metadata?: {
    source?: string;
    assignedTo?: string;
    department?: string;
    project?: string;
  };
}

interface CalendarProps {
  events: EventItem[];
  modules: ModuleConfig[];
  onEventClick?: (event: EventItem) => void;
  showTime?: boolean;
  initialView?: ViewMode;
  loading?: boolean;
  onDateNavigate?: (date: Date) => void;
  onModuleFilterChange?: (module: string | null) => void;
  showExportControls?: boolean;
  onExport?: (format: "pdf" | "excel" | "print") => void;
}

export const CustomCalendar: React.FC<CalendarProps> = ({
  events,
  modules,
  onEventClick,
  showTime = true,
  initialView = "month",
  loading = false,
  onDateNavigate,
  onModuleFilterChange,
  showExportControls = false,
  onExport,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [showStats, setShowStats] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedHour, setExpandedHour] = useState<number | null>(null);
  const [hourHeight, setHourHeight] = useState(80);
  const [customDate, setCustomDate] = useState<string>("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [weekZoom, setWeekZoom] = useState(100);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [showYearModal, setShowYearModal] = useState(false);
  const [highlightedEvent, setHighlightedEvent] = useState<number | null>(null);
  const [showAllDayEvents, setShowAllDayEvents] = useState(true);
  const [activeViewFilters, setActiveViewFilters] = useState({
    urgent: true,
    high: true,
    medium: true,
    low: true,
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  const getModuleColor = (moduleName: string) => {
    return (
      modules.find((m) => m.name === moduleName)?.color ||
      theme.colors.neutral[500]
    );
  };

  const getModuleIcon = (moduleName: string) => {
    const module = modules.find((m) => m.name === moduleName);
    return module?.icon || "📅";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "year":
        newDate.setFullYear(
          newDate.getFullYear() + (direction === "next" ? 1 : -1),
        );
        setSelectedYear(newDate.getFullYear());
        break;
    }
    setCurrentDate(newDate);
    onDateNavigate?.(newDate);
  };

  const goToDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      setCurrentDate(date);
      setCustomDate("");
      setShowDateModal(false);
      onDateNavigate?.(date);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedYear(today.getFullYear());
    onDateNavigate?.(today);
  };

  const goToYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setSelectedYear(year);
    setShowYearModal(false);
    if (viewMode !== "year") {
      setViewMode("year");
    }
    onDateNavigate?.(newDate);
  };

  const jumpToEventDate = (event: EventItem) => {
    setCurrentDate(event.datetime);
    setViewMode("day");
    setHighlightedEvent(event.id);
    onDateNavigate?.(event.datetime);

    setTimeout(() => {
      setHighlightedEvent(null);
    }, 3000);
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === today.toDateString(),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedModule) {
      filtered = filtered.filter((e) => e.module === selectedModule);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          e.attendees?.some((attendee) =>
            attendee.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    filtered = filtered.filter((event) => {
      if (!event.priority) return true;
      return activeViewFilters[event.priority];
    });

    return filtered;
  }, [events, selectedModule, searchTerm, activeViewFilters]);

  const getEventsForDay = (date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return filteredEvents
      .filter(
        (e) =>
          e.datetime &&
          e.datetime instanceof Date &&
          !isNaN(e.datetime.getTime()),
      )
      .filter((e) => {
        const eventDate = new Date(e.datetime);
        return eventDate >= targetDate && eventDate < nextDay;
      })
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  const getEventsForHour = (date: Date, hour: number) => {
    const hourStart = new Date(date);
    hourStart.setHours(hour, 0, 0, 0);

    const hourEnd = new Date(date);
    hourEnd.setHours(hour, 59, 59, 999);

    return filteredEvents
      .filter((e) => e.datetime && e.datetime instanceof Date)
      .filter((e) => {
        const eventTime = new Date(e.datetime);
        return eventTime >= hourStart && eventTime <= hourEnd;
      })
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  const getAllDayEvents = (date: Date) => {
    return filteredEvents.filter((e) => {
      if (!e.datetime) return false;
      const eventDate = new Date(e.datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const stats = useMemo(() => {
    const byModule = modules.map((m) => ({
      name: m.name,
      color: m.color,
      count: filteredEvents.filter((e) => e.module === m.name).length,
      urgent: filteredEvents.filter(
        (e) => e.module === m.name && e.priority === "urgent",
      ).length,
      high: filteredEvents.filter(
        (e) => e.module === m.name && e.priority === "high",
      ).length,
    }));

    const total = filteredEvents.length;
    const todayEvents = getEventsForDay(new Date()).length;
    const upcoming = filteredEvents.filter(
      (e) => e.datetime > new Date(),
    ).length;
    const urgent = filteredEvents.filter((e) => e.priority === "urgent").length;
    const past = filteredEvents.filter((e) => e.datetime < new Date()).length;

    return {
      byModule,
      total,
      todayEvents,
      upcoming,
      urgent,
      past,
    };
  }, [filteredEvents, modules]);

  const getPeriodTitle = () => {
    switch (viewMode) {
      case "day":
        return currentDate.toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      case "week":
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        weekStart.setDate(weekStart.getDate() - day);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        return currentDate.toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        });
      case "year":
        return currentDate.getFullYear().toString();
    }
  };

  const handleModuleFilter = (moduleName: string | null) => {
    const newModule = moduleName === selectedModule ? null : moduleName;
    setSelectedModule(newModule);
    onModuleFilterChange?.(newModule);
  };

  // Estilos reutilizables
  const headerGradient = {
    background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark})`,
  };

  const cardBorder = {
    border: `1px solid ${theme.colors.border.DEFAULT}`,
    background: theme.colors.background.card,
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isToday = currentDate.toDateString() === now.toDateString();

    return (
      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ background: theme.colors.background.card, ...cardBorder }}
      >
        <div className="text-white p-6" style={headerGradient}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {currentDate.toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  {dayEvents.length} eventos •{" "}
                  {isToday ? "Hoy" : formatDate(currentDate)}
                  {highlightedEvent && (
                    <span className="ml-2 text-yellow-300 animate-pulse">
                      • Evento resaltado
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-2 rounded-lg">
                <div className="text-xs text-slate-300">Altura</div>
                <div className="font-bold flex items-center gap-2">
                  {hourHeight}px
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setHourHeight(Math.max(60, hourHeight - 20))
                      }
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        setHourHeight(Math.min(150, hourHeight + 20))
                      }
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAllDayEvents(!showAllDayEvents)}
                className={`p-2 rounded-lg transition-all ${
                  showAllDayEvents
                    ? "bg-white/20"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                title={
                  showAllDayEvents
                    ? "Ocultar eventos de todo el día"
                    : "Mostrar eventos de todo el día"
                }
              >
                {showAllDayEvents ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: theme.colors.feedback.primaryLight,
              border: `1px solid ${theme.colors.primary.DEFAULT}40`,
              boxShadow: theme.shadows.sm,
            }}
          >
            <div
              className="text-sm font-medium mb-1"
              style={{ color: theme.colors.primary.DEFAULT }}
            >
              Total de eventos del día
            </div>
            <div
              className="text-3xl font-bold"
              style={{ color: theme.colors.primary.DEFAULT }}
            >
              {dayEvents.length}
            </div>
          </div>

          {showAllDayEvents && getAllDayEvents(currentDate).length > 0 && (
            <div className="mb-6">
              <h4
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: theme.colors.text.primary }}
              >
                <CalendarDays className="w-5 h-5" />
                Eventos de todo el día
              </h4>
            </div>
          )}

          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}
          >
            <div
              className="grid grid-cols-12 border-b"
              style={{
                background: theme.colors.background.surface,
                borderBottomColor: theme.colors.border.DEFAULT,
              }}
            >
              <div
                className="col-span-2 p-3 text-sm font-semibold border-r"
                style={{
                  color: theme.colors.text.secondary,
                  borderRightColor: theme.colors.border.DEFAULT,
                }}
              >
                HORA
              </div>
              <div
                className="col-span-10 p-3 text-sm font-semibold"
                style={{ color: theme.colors.text.secondary }}
              >
                Eventos
              </div>
            </div>

            <div
              className="divide-y max-h-[600px] overflow-y-auto"
            >
              {Array.from({ length: 24 }, (_, hour: any) => {
                const hourEvents = getEventsForHour(currentDate, hour);
                const isCurrentHour = isToday && hour === currentHour;

                return (
                  <div
                    key={hour}
                    className={`grid grid-cols-12 transition-colors ${
                      isCurrentHour ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    style={{
                      background: isCurrentHour
                        ? theme.colors.feedback.primaryLight
                        : undefined,
                    }}
                  >
                    <div
                      className="col-span-2 p-3 border-r"
                      style={{ borderRightColor: theme.colors.border.DEFAULT }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`text-lg font-bold ${
                            isCurrentHour ? "text-blue-600" : "text-gray-800"
                          }`}
                          style={{
                            color: isCurrentHour
                              ? theme.colors.primary.DEFAULT
                              : theme.colors.text.primary,
                          }}
                        >
                          {formatDatetime(
                            `2025-12-12 ${hour}`,
                            true,
                            DateFormat.H_MM_A,
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDatetime(
                            `2025-12-12 ${hour}`,
                            true,
                            DateFormat.H_MM_A,
                          )}
                        </div>
                        {isCurrentHour && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Actual:{" "}
                            {formatDatetime(
                              new Date(),
                              true,
                              DateFormat.H_MM_A,
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-10 p-3">
                      {hourEvents.length === 0 ? (
                        <div className="text-gray-400 text-sm italic py-4">
                          Sin eventos
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hourEvents.map((event, idx) => {
                            const eventHour = event.datetime.getHours();
                            const eventMinute = event.datetime.getMinutes();
                            const isPast = event.datetime < now;
                            const isHighlighted = highlightedEvent === event.id;

                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  onEventClick?.(event);
                                  event.customAction?.();
                                }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                  isPast ? "opacity-90" : ""
                                } ${isHighlighted ? "ring-2 ring-yellow-400 ring-offset-2 animate-pulse" : ""}`}
                                style={{
                                  borderLeftColor: getModuleColor(event.module),
                                  borderLeftWidth: "4px",
                                  backgroundColor: `${getModuleColor(event.module)}08`,
                                  borderColor: getModuleColor(event.module),
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor: getModuleColor(
                                              event.module,
                                            ),
                                          }}
                                        />
                                        <span
                                          className="text-sm font-semibold"
                                          style={{
                                            color: theme.colors.text.secondary,
                                          }}
                                        >
                                          {event.module}
                                        </span>
                                        {event.priority === "urgent" && (
                                          <span
                                            className="px-2 py-0.5 text-xs rounded-full font-bold"
                                            style={{
                                              background:
                                                theme.colors.feedback
                                                  .errorLight,
                                              color: theme.colors.status.error,
                                            }}
                                          >
                                            URGENTE
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          jumpToEventDate(event);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Ir al evento"
                                      >
                                        <Navigation className="w-4 h-4 text-gray-500" />
                                      </button>
                                    </div>

                                    <h4
                                      className="font-bold mb-2"
                                      style={{
                                        color: theme.colors.text.primary,
                                      }}
                                    >
                                      {event.title || `Evento #${event.id}`}
                                    </h4>

                                    <div
                                      className="flex flex-wrap gap-3 text-sm mb-2"
                                      style={{
                                        color: theme.colors.text.secondary,
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {eventHour.toString().padStart(2, "0")}:
                                        {eventMinute
                                          .toString()
                                          .padStart(2, "0")}
                                        {formatDatetime(
                                          event.datetime,
                                          true,
                                          DateFormat.HH_MM_SS_A,
                                        )}
                                      </div>

                                      {event.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {event.location}
                                        </div>
                                      )}
                                    </div>

                                    {event.description && (
                                      <p
                                        className="text-sm line-clamp-2"
                                        style={{
                                          color: theme.colors.text.secondary,
                                        }}
                                      >
                                        {event.description}
                                      </p>
                                    )}

                                    {(event.tags || event.attendees) && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {event.tags?.map((tag, i) => (
                                          <span
                                            key={i}
                                            className="text-xs px-2 py-1 rounded"
                                            style={{
                                              background:
                                                theme.colors.background.surface,
                                              border: `1px solid ${theme.colors.border.DEFAULT}`,
                                              color:
                                                theme.colors.text.secondary,
                                            }}
                                          >
                                            {tag}
                                          </span>
                                        ))}

                                        {event.attendees &&
                                          event.attendees.length > 0 && (
                                            <span
                                              className="text-xs px-2 py-1 rounded flex items-center gap-1"
                                              style={{
                                                background:
                                                  theme.colors.feedback
                                                    .primaryLight,
                                                color:
                                                  theme.colors.primary.DEFAULT,
                                              }}
                                            >
                                              <Users className="w-3 h-3" />
                                              {event.attendees.length}{" "}
                                              asistentes
                                            </span>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {dayEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: theme.colors.text.disabled }}
              >
                No hay eventos
              </h3>
              <p className="text-gray-500">
                No se encontraron eventos para {formatDate(currentDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - day);

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return {
        date,
        name: date.toLocaleDateString("es-MX", { weekday: "short" }),
        fullName: date.toLocaleDateString("es-MX", { weekday: "long" }),
        isToday: date.toDateString() === new Date().toDateString(),
        events: getEventsForDay(date),
      };
    });

    return (
      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ background: theme.colors.background.card, ...cardBorder }}
      >
        <div className="text-white p-6" style={headerGradient}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Columns className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Semana {weekStart.getDate()}-{days[6].date.getDate()} de{" "}
                  {weekStart.toLocaleDateString("es-MX", { month: "long" })}
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  {days.reduce((sum, day) => sum + day.events.length, 0)}{" "}
                  eventos en total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-2 rounded-lg">
                <div className="text-xs text-slate-300">Zoom</div>
                <div className="font-bold flex items-center gap-2">
                  {weekZoom}%
                  <div className="flex gap-1">
                    <button
                      onClick={() => setWeekZoom(Math.max(80, weekZoom - 10))}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setWeekZoom(Math.min(150, weekZoom + 10))}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1200px]" style={{ zoom: `${weekZoom}%` }}>
            <div
              className="grid grid-cols-8 border-b"
              style={{ borderBottomColor: theme.colors.border.DEFAULT }}
            >
              <div
                className="p-3 border-r"
                style={{
                  background: theme.colors.background.surface,
                  borderRightColor: theme.colors.border.DEFAULT,
                }}
              ></div>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`p-3 text-center border-r cursor-pointer hover:bg-gray-50 ${
                    day.isToday ? "bg-blue-50" : "bg-white"
                  }`}
                  style={{
                    borderRightColor: theme.colors.border.DEFAULT,
                    background: day.isToday
                      ? theme.colors.feedback.primaryLight
                      : theme.colors.background.card,
                  }}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setViewMode("day");
                    onDateNavigate?.(day.date);
                  }}
                >
                  <div
                    className={`text-sm font-medium uppercase ${day.isToday ? "text-blue-600" : "text-gray-500"}`}
                    style={{
                      color: day.isToday
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.text.disabled,
                    }}
                  >
                    {day.name}
                  </div>
                  <div
                    className={`text-xl font-bold mt-1 ${day.isToday ? "text-blue-600" : "text-gray-800"}`}
                    style={{
                      color: day.isToday
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.text.primary,
                    }}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {day.events.length} eventos
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-8">
              <div
                className="border-r"
                style={{
                  background: theme.colors.background.surface,
                  borderRightColor: theme.colors.border.DEFAULT,
                }}
              >
                {Array.from({ length: 24 }, (_, hour: any) => (
                  <div
                    key={hour}
                    className="h-20 border-b flex items-center justify-end pr-3"
                    style={{ borderBottomColor: theme.colors.border.DEFAULT }}
                  >
                    <div className="text-right">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formatDatetime(
                          `2025-11-22 ${hour}`,
                          true,
                          DateFormat.H_MM_A,
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDatetime(
                          `2025-11-22 ${hour}`,
                          true,
                          DateFormat.H_MM_A,
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {days.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="border-r relative"
                  style={{ borderRightColor: theme.colors.border.DEFAULT }}
                >
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourEvents = getEventsForHour(day.date, hour);
                    const maxVisibleEvents = 4;

                    return (
                      <div
                        key={hour}
                        className="h-20 border-b p-1 hover:bg-gray-50 relative"
                        style={{
                          borderBottomColor: theme.colors.border.DEFAULT,
                          minHeight:
                            hourEvents.length > 0
                              ? `${Math.min(hourEvents.length, maxVisibleEvents) * 2.5}rem`
                              : "5rem",
                        }}
                      >
                        <div className="absolute inset-1 overflow-y-auto scrollbar-thin">
                          <div className="space-y-1 pr-1">
                            {hourEvents
                              .slice(0, maxVisibleEvents)
                              .map((event, idx) => (
                                <div
                                  key={`${dayIdx}-${hour}-${idx}`}
                                  onClick={() => {
                                    onEventClick?.(event);
                                    event.customAction?.();
                                  }}
                                  className="text-xs p-1.5 rounded cursor-pointer hover:shadow-sm truncate border border-white/30 transition-all duration-200 hover:scale-[1.02]"
                                  style={{
                                    backgroundColor: getModuleColor(
                                      event.module,
                                    ),
                                    color: "white",
                                    borderLeft: `3px solid ${getModuleColor(event.module)}`,
                                    minHeight: "2rem",
                                    maxHeight: "2.5rem",
                                    overflow: "hidden",
                                  }}
                                  title={`${event.title || event.id} - ${formatTime(event.datetime)}`}
                                >
                                  <div className="font-bold truncate leading-tight">
                                    {event.title || event.id}
                                  </div>
                                  <div className="text-xs opacity-90 truncate leading-tight">
                                    {formatDatetime(
                                      event.datetime,
                                      true,
                                      DateFormat.HH_MM_SS_A,
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {hourEvents.length > maxVisibleEvents && (
                          <div
                            onClick={() => {
                              setCurrentDate(day.date);
                              setViewMode("day");
                              onDateNavigate?.(day.date);
                            }}
                            className="absolute bottom-1 left-1 right-1 text-xs font-medium p-1.5 rounded cursor-pointer text-center bg-white border shadow-sm z-10"
                            style={{
                              color: theme.colors.primary.DEFAULT,
                              borderColor: theme.colors.primary.DEFAULT,
                              background: theme.colors.background.card,
                            }}
                          >
                            +{hourEvents.length - maxVisibleEvents} más
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t p-6"
          style={{
            borderTopColor: theme.colors.border.DEFAULT,
            background: theme.colors.background.surface,
          }}
        >
          <h4
            className="font-bold text-lg mb-4 flex items-center gap-2"
            style={{ color: theme.colors.text.primary }}
          >
            <Layers className="w-5 h-5" />
            Resumen de la semana
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {days.map((day, idx) => {
              const urgentCount = day.events.filter(
                (e) => e.priority === "urgent",
              ).length;
              const highCount = day.events.filter(
                (e) => e.priority === "high",
              ).length;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setViewMode("day");
                    onDateNavigate?.(day.date);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    day.isToday ? "border-2" : "border"
                  }`}
                  style={{
                    background: day.isToday
                      ? theme.colors.feedback.primaryLight
                      : theme.colors.background.card,
                    borderColor: day.isToday
                      ? theme.colors.primary.DEFAULT
                      : theme.colors.border.DEFAULT,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div
                        className={`text-sm font-semibold ${day.isToday ? "text-blue-700" : "text-gray-600"}`}
                        style={{
                          color: day.isToday
                            ? theme.colors.primary.DEFAULT
                            : theme.colors.text.secondary,
                        }}
                      >
                        {day.fullName}
                      </div>
                      <div
                        className={`text-xl font-bold ${day.isToday ? "text-blue-800" : "text-gray-800"}`}
                        style={{
                          color: day.isToday
                            ? theme.colors.primary.dark
                            : theme.colors.text.primary,
                        }}
                      >
                        {day.date.getDate()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        {day.events.length}
                      </div>
                      <div className="text-xs text-gray-500">eventos</div>
                    </div>
                  </div>

                  {(urgentCount > 0 || highCount > 0) && (
                    <div className="flex gap-2 mt-2">
                      {urgentCount > 0 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: theme.colors.feedback.errorLight,
                            color: theme.colors.status.error,
                          }}
                        >
                          {urgentCount} urgente{urgentCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {highCount > 0 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: `${theme.colors.status.warning}15`,
                            color: theme.colors.status.warning,
                          }}
                        >
                          {highCount} alta
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className="text-xs mt-2 font-medium hover:underline"
                    style={{ color: theme.colors.primary.DEFAULT }}
                  >
                    Ver día →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    const today = new Date();
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    return (
      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ background: theme.colors.background.card, ...cardBorder }}
      >
        <div className="grid grid-cols-7 text-white" style={headerGradient}>
          {weekDays.map((day, i) => (
            <div key={i} className="py-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 divide-x divide-y"
        >
          {monthDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day.date);
            const isToday = day.date.toDateString() === today.toDateString();
            const isWeekend =
              day.date.getDay() === 0 || day.date.getDay() === 6;
            const urgentCount = dayEvents.filter(
              (e) => e.priority === "urgent",
            ).length;
            const highCount = dayEvents.filter(
              (e) => e.priority === "high",
            ).length;

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentDate(day.date);
                  setViewMode("day");
                  onDateNavigate?.(day.date);
                }}
                className={`min-h-36 p-2 cursor-pointer transition-all hover:shadow-inner ${
                  !day.isCurrentMonth ? "opacity-50" : ""
                }`}
                style={{
                  background: isWeekend
                    ? theme.colors.background.surface
                    : theme.colors.background.card,
                
                }}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-semibold mb-2 flex items-center justify-between ${
                      !day.isCurrentMonth ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          isToday
                            ? "w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                            : ""
                        }`}
                        style={
                          isToday
                            ? {
                                background: theme.colors.primary.DEFAULT,
                                color: theme.colors.text.inverse,
                              }
                            : undefined
                        }
                      >
                        {day.date.getDate()}
                      </span>
                      {isToday && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: theme.colors.primary.DEFAULT }}
                        >
                          Hoy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {urgentCount > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                          style={{
                            background: theme.colors.feedback.errorLight,
                            color: theme.colors.status.error,
                          }}
                        >
                          {urgentCount}
                        </span>
                      )}
                      {dayEvents.length > 0 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: theme.colors.feedback.primaryLight,
                            color: theme.colors.primary.DEFAULT,
                          }}
                        >
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayEvents.slice(0, 4).map((event, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                          event.customAction?.();
                        }}
                        className="text-xs p-2 rounded font-medium cursor-pointer hover:shadow-sm transition-all border"
                        style={{
                          backgroundColor: `${getModuleColor(event.module)}15`,
                          borderLeftColor: getModuleColor(event.module),
                          borderLeftWidth: "3px",
                          borderColor: theme.colors.border.light,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: getModuleColor(event.module),
                              }}
                            />
                            <span
                              className="font-semibold truncate"
                              style={{ color: theme.colors.text.primary }}
                            >
                              {event.title || event.id}
                            </span>
                          </div>
                          {event.priority === "urgent" && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: theme.colors.status.error }}
                            ></div>
                          )}
                          {event.priority === "high" && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: theme.colors.status.warning,
                              }}
                            ></div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          {showTime && (
                            <span className="text-gray-600 text-xs">
                              {formatDatetime(
                                event.datetime,
                                true,
                                DateFormat.HH_MM_SS_A,
                              )}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">
                            {event.module.substring(0, 3)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {dayEvents.length > 4 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(day.date);
                          setViewMode("day");
                          onDateNavigate?.(day.date);
                        }}
                        className="text-xs font-medium px-2 py-1 rounded cursor-pointer text-center"
                        style={{ color: theme.colors.primary.DEFAULT }}
                      >
                        +{dayEvents.length - 4} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = [
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

    return (
      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ background: theme.colors.background.card, ...cardBorder }}
      >
        <div className="text-white p-6" style={headerGradient}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Año {selectedYear}</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Vista anual - Haz clic en cualquier mes para ver detalles
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowYearModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all border border-white/20 flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Cambiar año
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((month, idx) => {
              const monthEvents = filteredEvents.filter(
                (e) =>
                  e.datetime.getFullYear() === selectedYear &&
                  e.datetime.getMonth() === idx,
              );
              const urgentCount = monthEvents.filter(
                (e) => e.priority === "urgent",
              ).length;
              const today = new Date();
              const isCurrentMonth =
                today.getFullYear() === selectedYear &&
                today.getMonth() === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    const date = new Date(selectedYear, idx, 1);
                    setCurrentDate(date);
                    setViewMode("month");
                    onDateNavigate?.(date);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                    isCurrentMonth ? "bg-gradient-to-br" : "bg-white"
                  }`}
                  style={{
                    borderColor: isCurrentMonth
                      ? theme.colors.primary.DEFAULT
                      : theme.colors.border.DEFAULT,
                    background: isCurrentMonth
                      ? `linear-gradient(to bottom right, ${theme.colors.feedback.primaryLight}, ${theme.colors.background.card})`
                      : theme.colors.background.card,
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div
                      className={`text-lg font-bold ${isCurrentMonth ? "text-blue-700" : "text-gray-800"}`}
                      style={{
                        color: isCurrentMonth
                          ? theme.colors.primary.DEFAULT
                          : theme.colors.text.primary,
                      }}
                    >
                      {month}
                    </div>
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color:
                            monthEvents.length > 0
                              ? theme.colors.primary.DEFAULT
                              : theme.colors.text.disabled,
                        }}
                      >
                        {monthEvents.length}
                      </div>
                      {urgentCount > 0 && (
                        <div
                          className="text-xs font-semibold mt-1"
                          style={{ color: theme.colors.status.error }}
                        >
                          {urgentCount} urgente{urgentCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-sm mb-4"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {monthEvents.length === 0
                      ? "Sin eventos"
                      : `${monthEvents.length} evento${monthEvents.length !== 1 ? "s" : ""}`}
                  </div>

                  <div className="h-20 grid grid-cols-7 gap-0.5">
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(selectedYear, idx, i + 1);
                      const hasEvents = getEventsForDay(date).length > 0;
                      const hasUrgentEvents =
                        getEventsForDay(date).filter(
                          (e) => e.priority === "urgent",
                        ).length > 0;

                      return (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            background: hasUrgentEvents
                              ? theme.colors.status.error
                              : hasEvents
                                ? theme.colors.primary.DEFAULT
                                : theme.colors.border.light,
                            opacity: date.getMonth() !== idx ? 0.3 : 1,
                          }}
                          title={`${date.getDate()}: ${getEventsForDay(date).length} eventos`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDatePickerModal = () => {
    if (!showDateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div
          className="rounded-xl shadow-xl w-full max-w-md"
          style={{ background: theme.colors.background.card, ...cardBorder }}
        >
          <div
            className="p-6 border-b"
            style={{ borderBottomColor: theme.colors.border.DEFAULT }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-bold"
                style={{ color: theme.colors.text.primary }}
              >
                Ir a fecha específica
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.text.secondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const today = new Date();
                  const todayStr = today.toISOString().split("T")[0];
                  setCustomDate(todayStr);
                  goToDate(todayStr);
                }}
                className="p-3 rounded-lg transition-colors font-medium"
                style={{
                  background: theme.colors.feedback.primaryLight,
                  color: theme.colors.primary.DEFAULT,
                }}
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  const tomorrowStr = tomorrow.toISOString().split("T")[0];
                  setCustomDate(tomorrowStr);
                  goToDate(tomorrowStr);
                }}
                className="p-3 rounded-lg transition-colors font-medium"
                style={{
                  background: theme.colors.background.surface,
                  color: theme.colors.text.secondary,
                }}
              >
                Mañana
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderYearPickerModal = () => {
    if (!showYearModal) return null;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div
          className="rounded-xl shadow-xl w-full max-w-lg"
          style={{ background: theme.colors.background.card, ...cardBorder }}
        >
          <div
            className="p-6 border-b"
            style={{ borderBottomColor: theme.colors.border.DEFAULT }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-bold"
                style={{ color: theme.colors.text.primary }}
              >
                Seleccionar año
              </h3>
              <button
                onClick={() => setShowYearModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.text.secondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => goToYear(year)}
                  className={`p-4 rounded-lg border transition-all`}
                  style={{
                    background:
                      year === selectedYear
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.background.card,
                    color:
                      year === selectedYear
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary,
                    borderColor:
                      year === selectedYear
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.border.DEFAULT,
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{year}</div>
                    {year === currentYear && (
                      <div className="text-xs mt-1 opacity-75">Actual</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-b-xl"
            style={{ background: theme.colors.background.surface }}
          >
            <div className="flex gap-3">
              <button
                onClick={() => setShowYearModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  color: theme.colors.text.secondary,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={goToToday}
                className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium"
                style={{
                  background: theme.colors.primary.DEFAULT,
                  color: theme.colors.text.inverse,
                }}
              >
                Ir al año actual
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPriorityFilters = () => <></>;

  return (
    <div className="w-full mx-auto relative">
      {loading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <div className="text-center">
            <Loader
              className="w-8 h-8 animate-spin mx-auto mb-2"
              style={{ color: theme.colors.primary.DEFAULT }}
            />
            <p style={{ color: theme.colors.text.secondary }}>
              Cargando eventos...
            </p>
          </div>
        </div>
      )}

      <div
        className="rounded-xl shadow-lg overflow-hidden border"
        style={{ background: theme.colors.background.card, ...cardBorder }}
      >
        {/* Header */}
        <div className="text-white p-6" style={headerGradient}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold capitalize">
                  {getPeriodTitle()}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  {filteredEvents.length} eventos
                  {selectedModule && ` en ${selectedModule}`}
                  {stats.urgent > 0 && ` • ${stats.urgent} urgentes`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {showExportControls && onExport && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onExport("pdf")}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                    title="Exportar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExport("print")}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                    title="Imprimir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={goToToday}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
              >
                Hoy
              </button>

              <div className="flex items-center bg-white/10 rounded-lg border border-white/20">
                <button
                  onClick={() => navigate("prev")}
                  className="p-2 hover:bg-white/10 rounded-l-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/20" />
                <button
                  onClick={() => navigate("next")}
                  className="p-2 hover:bg-white/10 rounded-r-lg transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="px-3 py-2 rounded-lg cursor-pointer text-sm font-medium border bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option className="text-slate-800 bg-white" value="day">
                  Día
                </option>
                <option className="text-slate-800 bg-white" value="week">
                  Semana
                </option>
                <option className="text-slate-800 bg-white" value="month">
                  Mes
                </option>
                <option className="text-slate-800 bg-white" value="year">
                  Año
                </option>
              </select>

              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg transition-all border border-white/20 ${
                  showStats ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
                }`}
                title="Mostrar estadísticas"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleModuleFilter(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all`}
              style={{
                background: !selectedModule
                  ? theme.colors.background.card
                  : theme.colors.background.surface,
                color: !selectedModule
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary,
                borderColor: !selectedModule
                  ? theme.colors.border.DEFAULT
                  : "transparent",
              }}
            >
              <Filter className="w-3 h-3" />
              <span>Todos</span>
            </button>

            {modules.map((mod, idx) => {
              const moduleStats = stats.byModule.find(
                (m) => m.name === mod.name,
              );
              const count = moduleStats?.count || 0;
              const urgentCount = moduleStats?.urgent || 0;

              return (
                <button
                  key={idx}
                  onClick={() => handleModuleFilter(mod.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all`}
                  style={{
                    background:
                      selectedModule === mod.name
                        ? theme.colors.background.card
                        : theme.colors.background.surface,
                    color:
                      selectedModule === mod.name
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    borderColor:
                      selectedModule === mod.name
                        ? theme.colors.border.DEFAULT
                        : "transparent",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: mod.color }}
                  />
                  <span>{mod.name}</span>
                  {urgentCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px]"
                      style={{
                        background: theme.colors.status.error,
                        color: theme.colors.text.inverse,
                      }}
                    >
                      {urgentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === "day" && renderDayView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
          {viewMode === "year" && renderYearView()}

          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-12">
              <div
                className="text-2xl font-bold mb-3"
                style={{ color: theme.colors.text.disabled }}
              >
                No hay eventos
              </div>
              <p className="text-gray-500">
                {searchTerm || selectedModule
                  ? "Intenta con otros términos de búsqueda o módulos"
                  : "No se encontraron eventos para mostrar"}
              </p>
              {(searchTerm || selectedModule) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedModule(null);
                  }}
                  className="mt-4 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: theme.colors.primary.DEFAULT,
                    color: theme.colors.text.inverse,
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {renderDatePickerModal()}
      {renderYearPickerModal()}
    </div>
  );
};
