import { useState, useMemo, useEffect, useRef } from "react";
import UseLegalData from "../../../hooks/legal/uselegal";

// ─── tipos ────────────────────────────────────────────────────────────────────

interface Proceso {
  id: number;
  actor?: string;
  expediente?: string;
  juzgado?: string;
  fecha_presentacion?: string | null;
  comentarios_presentacion?: string | null;
  fecha_radicacion?: string | null;
  comentarios_radicacion?: string | null;
  fecha_audiencia?: string | null;
  comentarios_audiencia?: string | null;
  fecha_exhorto?: string | null;
  comentarios_exhorto?: string | null;
  fecha_oficios?: string | null;
  comentarios_oficio?: string | null;
  tipo_promocion?: string | null;
  comentarios_promocion?: string | null;
  fecha_sentencia?: string | null;
  comentarios_sentencia?: string | null;
  // Evidencias
  evidencias_presentacion?: string[];
  evidencias_radicacion?: string[];
  evidencias_audiencia?: string[];
  evidencias_exhorto?: string[];
  evidencias_oficio?: string[];
  evidencias_promocion?: string[];
  evidencias_sentencia?: string[];
}

interface Incidente {
  id: number;
  nombre: string;
  proceso?: Proceso | null;
}

interface LegalCase {
  folio?: number;
  id: number;
  entrevista_nombre?: string;
  nombre_imputado?: string;
  nombre_agresor?: string;
  relacion_victima?: string;
  estatus_caso_nombre?: string;
  tipo_asesoria_nombre?: string;
  tipo_medida_nombre?: string;
  autoridad_emisora_nombre?: string;
  motivo_cierre_nombre?: string;
  abogado?: string;
  responsable_nombre?: string;
  telefono?: string;
  curp?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  edad?: number;
  carpeta_investigacion?: string | null;
  causa_penal?: number | null;
  comentarios_procesales?: string | null;
  observaciones?: string | null;
  hechos?: string;
  fecha_apertura?: string | null;
  fecha_asesoria?: string | null;
  fecha_acompanamiento?: string | null;
  fecha_denuncia?: string | null;
  fecha_solicitud?: string | null;
  fecha_audiencia?: string | null;
  fecha_medida?: string | null;
  fecha_termino_medida?: string | null;
  fecha_cierre?: string | null;
  incidentes?: Incidente[];
  id_nombres_incidentes?: string[];
}

// ─── paleta de eventos ──────────────────────────────────────────────────────

interface EventDef {
  key: keyof LegalCase;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  icon: string;
  bgLight: string;
}

const CASE_EVENTS: EventDef[] = [
  {
    key: "fecha_apertura",
    label: "Apertura",
    color: "#3B82F6",
    borderColor: "#DBEAFE",
    textColor: "#1E40AF",
    icon: "📂",
    bgLight: "#EFF6FF",
  },
  {
    key: "fecha_solicitud",
    label: "Solicitud",
    color: "#8B5CF6",
    borderColor: "#EDE9FE",
    textColor: "#5B21B6",
    icon: "📋",
    bgLight: "#F5F3FF",
  },
  {
    key: "fecha_acompanamiento",
    label: "Acompañamiento",
    color: "#EC4899",
    borderColor: "#FCE7F3",
    textColor: "#9D174D",
    icon: "🤝",
    bgLight: "#FDF2F8",
  },
  {
    key: "fecha_asesoria",
    label: "Asesoría",
    color: "#14B8A6",
    borderColor: "#CCFBF1",
    textColor: "#0F766E",
    icon: "⚖️",
    bgLight: "#F0FDFA",
  },
  {
    key: "fecha_denuncia",
    label: "Denuncia",
    color: "#EF4444",
    borderColor: "#FEE2E2",
    textColor: "#991B1B",
    icon: "📢",
    bgLight: "#FEF2F2",
  },
  {
    key: "fecha_audiencia",
    label: "Audiencia",
    color: "#F59E0B",
    borderColor: "#FEF3C7",
    textColor: "#92400E",
    icon: "🏛️",
    bgLight: "#FFFBEB",
  },
  {
    key: "fecha_medida",
    label: "Inicio medida",
    color: "#F97316",
    borderColor: "#FFEDD5",
    textColor: "#9A3412",
    icon: "🛡️",
    bgLight: "#FFF7ED",
  },
  {
    key: "fecha_termino_medida",
    label: "Término medida",
    color: "#FB923C",
    borderColor: "#FED7AA",
    textColor: "#9A3412",
    icon: "✅",
    bgLight: "#FFF7ED",
  },
  {
    key: "fecha_cierre",
    label: "Cierre",
    color: "#9CA3AF",
    borderColor: "#F3F4F6",
    textColor: "#4B5563",
    icon: "🔒",
    bgLight: "#F9FAFB",
  },
];

const PROCESO_EVENT_DEFS: {
  key: keyof Proceso;
  label: string;
  commentKey?: keyof Proceso;
  icon?: string;
  evidenceKey?: keyof Proceso;
}[] = [
  {
    key: "fecha_presentacion",
    label: "Presentación",
    commentKey: "comentarios_presentacion",
    icon: "📄",
    evidenceKey: "evidencias_presentacion",
  },
  {
    key: "fecha_radicacion",
    label: "Radicación",
    commentKey: "comentarios_radicacion",
    icon: "📌",
    evidenceKey: "evidencias_radicacion",
  },
  {
    key: "fecha_audiencia",
    label: "Audiencia",
    commentKey: "comentarios_audiencia",
    icon: "🏛️",
    evidenceKey: "evidencias_audiencia",
  },
  {
    key: "fecha_exhorto",
    label: "Exhorto",
    commentKey: "comentarios_exhorto",
    icon: "📨",
    evidenceKey: "evidencias_exhorto",
  },
  {
    key: "fecha_oficios",
    label: "Oficios",
    commentKey: "comentarios_oficio",
    icon: "📑",
    evidenceKey: "evidencias_oficio",
  },
  {
    key: "tipo_promocion",
    label: "Promoción",
    commentKey: "comentarios_promocion",
    icon: "📢",
    evidenceKey: "evidencias_promocion",
  },
  {
    key: "fecha_sentencia",
    label: "Sentencia",
    commentKey: "comentarios_sentencia",
    icon: "⚖️",
    evidenceKey: "evidencias_sentencia",
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function toYMD(d?: string | null): string | null {
  if (!d) return null;
  return d.split("T")[0].split(" ")[0];
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function fmtDateFull(d?: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const meses = [
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
  return `${day} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatTimeFromDate(d?: string | null): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getFileExtension(url: string): string {
  const parts = url.split(".");
  return parts[parts.length - 1]?.toLowerCase() || "";
}

function isImage(url: string): boolean {
  const ext = getFileExtension(url);
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
}

function isPDF(url: string): boolean {
  return getFileExtension(url) === "pdf";
}

function getFileName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] || "archivo";
}

interface CalEvent {
  ymd: string;
  label: string;
  caseId: number;
  caseName: string;
  folio?: number;
  color: string;
  borderColor: string;
  textColor: string;
  icon?: string;
  comment?: string | null;
  incidentName?: string;
  estatus?: string;
  time?: string;
  eventKey?: string;
  bgLight?: string;
  procesoLabel?: string;
  evidencias?: string[];
}

function buildAllEvents(cases: LegalCase[]): CalEvent[] {
  const events: CalEvent[] = [];

  cases.forEach((c) => {
    const name = c.entrevista_nombre ?? "Sin nombre";
    const folio = c.folio;

    // Eventos del caso (fechas directas) - sin evidencias
    CASE_EVENTS.forEach(
      ({ key, label, color, borderColor, textColor, icon, bgLight }) => {
        const val = c[key] as string | null | undefined;
        const ymd = toYMD(val);
        if (!ymd) return;
        const time = formatTimeFromDate(val);
        events.push({
          ymd,
          label,
          caseId: c.id,
          caseName: name,
          folio,
          color,
          borderColor,
          textColor,
          icon,
          estatus: c.estatus_caso_nombre,
          time,
          eventKey: `case-${key}-${c.id}`,
          bgLight,
        });
      },
    );

    // Eventos de incidentes/procesos con evidencias
    c.incidentes?.forEach((inc) => {
      if (!inc.proceso) return;
      const proceso = inc.proceso;
      PROCESO_EVENT_DEFS.forEach(
        ({ key, label, commentKey, icon, evidenceKey }) => {
          const val = proceso[key] as string | null | undefined;
          const ymd = toYMD(val);
          if (!ymd) return;
          const comment = commentKey
            ? (proceso[commentKey] as string | null | undefined)
            : undefined;
          const time = formatTimeFromDate(val);
          // Obtener evidencias si existen
          let evidencias: string[] = [];
          if (evidenceKey && proceso[evidenceKey]) {
            const ev = proceso[evidenceKey] as string[] | undefined;
            if (ev && ev.length > 0) {
              evidencias = ev;
            }
          }
          events.push({
            ymd,
            label: "Incidente",
            caseId: c.id,
            caseName: name,
            folio,
            color: "#22C55E",
            borderColor: "#DCFCE7",
            textColor: "#166534",
            icon: icon ?? "📎",
            comment,
            incidentName: inc.nombre,
            estatus: c.estatus_caso_nombre,
            time,
            eventKey: `proceso-${key}-${inc.id}-${c.id}`,
            bgLight: "#F0FDF4",
            procesoLabel: label,
            evidencias: evidencias.length > 0 ? evidencias : undefined,
          });
        },
      );
    });
  });

  return events;
}

const MESES = [
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
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function EstatusBadge({ estatus }: { estatus?: string }) {
  const isActive = estatus === "ACTIVO";
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
        isActive
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
          : "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
    >
      {estatus ?? "N/A"}
    </span>
  );
}

function EventTypeFilter({
  selectedTypes,
  onChange,
}: {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}) {
  const allTypes = useMemo(() => {
    const set = new Set<string>();
    CASE_EVENTS.forEach((e) => set.add(e.label));
    set.add("Incidente");
    return Array.from(set);
  }, []);

  const toggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {allTypes.map((type) => {
        const isSelected = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all ${
              isSelected
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

// ─── Mini calendario mejorado ───────────────────────────────────────────────

function MiniCalendar({
  mode,
  selectedDate,
  rangeStart,
  rangeEnd,
  onSelectDate,
  onSelectRange,
  onClear,
  onGoToday,
}: {
  mode: "single" | "range";
  selectedDate: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
  onSelectDate: (ymd: string) => void;
  onSelectRange: (start: string, end: string) => void;
  onClear: () => void;
  onGoToday: () => void;
}) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [tempStart, setTempStart] = useState<string | null>(rangeStart);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const todayYmd = new Date().toISOString().split("T")[0];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function navMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function handleDayClick(day: number) {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (mode === "single") {
      onSelectDate(ymd);
      return;
    }

    if (!tempStart) {
      setTempStart(ymd);
      onSelectRange(ymd, ymd);
    } else {
      const start = tempStart;
      const end = ymd;
      const [s, e] = start < end ? [start, end] : [end, start];
      onSelectRange(s, e);
      setTempStart(null);
    }
  }

  function isInRange(ymd: string): boolean {
    if (!rangeStart || !rangeEnd) return false;
    return ymd >= rangeStart && ymd <= rangeEnd;
  }

  function isStartOrEnd(ymd: string): boolean {
    return ymd === rangeStart || ymd === rangeEnd;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navMonth(-1)}
          className="text-xl text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          ‹
        </button>
        <span className="text-base font-bold text-gray-800">
          {MESES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => navMonth(1)}
          className="text-xl text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DIAS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold text-gray-400 uppercase py-1"
          >
            {d.slice(0, 2)}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-9" />;
          const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = mode === "single" ? ymd === selectedDate : false;
          const inRange = isInRange(ymd);
          const isToday = ymd === todayYmd;
          const isEdge = isStartOrEnd(ymd);
          return (
            <button
              key={ymd}
              onClick={() => handleDayClick(day)}
              className={`
                h-9 w-full flex items-center justify-center rounded-full text-sm font-medium transition-all
                ${isSelected ? "bg-blue-600 text-white shadow-md" : ""}
                ${inRange && mode === "range" ? "bg-blue-100 text-blue-800" : ""}
                ${isEdge && mode === "range" ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" : ""}
                ${isToday && !isSelected && !isEdge ? "border-2 border-blue-300" : ""}
                hover:bg-blue-50 hover:scale-105
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={onGoToday}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
          >
            📍 Hoy
          </button>
        </div>
        <span className="text-xs text-gray-400">
          {mode === "single" ? "Un día" : "Rango"}
        </span>
      </div>
      {(selectedDate || rangeStart) && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
          {mode === "single" &&
            selectedDate &&
            `📌 ${fmtDateFull(selectedDate)}`}
          {mode === "range" &&
            rangeStart &&
            rangeEnd &&
            `📅 ${fmtDate(rangeStart)} → ${fmtDate(rangeEnd)}`}
        </div>
      )}
    </div>
  );
}

// ─── Modal de vista previa de evidencia ─────────────────────────────────────

function EvidencePreviewModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const isImageFile = isImage(url);
  const isPDFFile = isPDF(url);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            📎 {getFileName(url)}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
          {isImageFile ? (
            <img
              src={url}
              alt={getFileName(url)}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
              }}
            />
          ) : isPDFFile ? (
            <div className="text-center">
              <div className="text-8xl mb-4">📄</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md"
              >
                📥 Ver PDF
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Haz clic para abrir el PDF en una nueva pestaña
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-8xl mb-4">📎</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                📥 Descargar archivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Panel de eventos del día ───────────────────────────────────────────────

function DayEventsPanel({
  ymd,
  events,
  onClose,
  cases,
  isMobile = false,
}: {
  ymd: string;
  events: CalEvent[];
  onClose: () => void;
  cases: LegalCase[];
  isMobile?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const byCaso = useMemo(() => {
    const map = new Map<
      number,
      {
        caseData?: LegalCase;
        caseName: string;
        folio?: number;
        estatus?: string;
        events: CalEvent[];
      }
    >();
    events.forEach((ev) => {
      if (!map.has(ev.caseId)) {
        const caseData = cases.find((c) => c.id === ev.caseId);
        map.set(ev.caseId, {
          caseData,
          caseName: ev.caseName,
          folio: ev.folio,
          estatus: ev.estatus,
          events: [],
        });
      }
      map.get(ev.caseId)!.events.push(ev);
    });
    return Array.from(map.values());
  }, [events, cases]);

  if (events.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <span className="text-5xl mb-4">📭</span>
        <p className="text-base font-medium">Sin eventos</p>
        <p className="text-sm">No hay actividades registradas para este día</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
              Eventos del día
            </p>
            <p className="text-lg font-bold text-gray-900">
              {fmtDateFull(ymd)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {byCaso.map((grupo, gi) => (
            <div
              key={gi}
              className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100/80 hover:border-gray-200 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0 shadow-sm">
                  {getInitials(grupo.caseName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {grupo.caseName}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      #{grupo.folio ?? grupo.events[0].caseId}
                    </span>
                    <EstatusBadge estatus={grupo.estatus} />
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 pl-1">
                {grupo.events.map((ev, ei) => (
                  <div
                    key={ei}
                    className="flex flex-col bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100/80 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                        style={{
                          backgroundColor: ev.bgLight || "#F3F4F6",
                          color: ev.color,
                        }}
                      >
                        {ev.icon ?? "📌"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: ev.color }}
                          >
                            {ev.label}
                          </span>
                          {ev.procesoLabel && (
                            <>
                              <span className="text-xs text-gray-500">
                                {ev.procesoLabel}
                              </span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {ev.incidentName}
                              </span>
                            </>
                          )}
                          {!ev.procesoLabel && ev.incidentName && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {ev.incidentName}
                            </span>
                          )}
                          {ev.time && (
                            <span className="text-xs text-gray-400">
                              {ev.time}
                            </span>
                          )}
                          {ev.evidencias && ev.evidencias.length > 0 && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              📎 {ev.evidencias.length}{" "}
                              {ev.evidencias.length === 1
                                ? "evidencia"
                                : "evidencias"}
                            </span>
                          )}
                        </div>
                        {ev.comment && (
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {ev.comment}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Evidencias */}
                    {ev.evidencias && ev.evidencias.length > 0 && (
                      <div className="mt-3 pl-[52px] flex flex-wrap gap-2">
                        {ev.evidencias.map((url, idx) => {
                          const isImageFile = isImage(url);
                          const isPDFFile = isPDF(url);
                          return (
                            <button
                              key={idx}
                              onClick={() => setPreviewUrl(url)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                isImageFile
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  : isPDFFile
                                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              }`}
                              title={getFileName(url)}
                            >
                              {isImageFile ? "🖼️" : isPDFFile ? "📄" : "📎"}
                              <span className="truncate max-w-[120px]">
                                {getFileName(url).slice(0, 20)}
                              </span>
                              <span className="text-[9px] opacity-60">
                                {isImageFile
                                  ? "imagen"
                                  : isPDFFile
                                    ? "PDF"
                                    : "archivo"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de vista previa */}
      {previewUrl && (
        <EvidencePreviewModal
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}

// ─── Hook para detectar móvil ──────────────────────────────────────────────

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalendarioCasos() {
  const legalData = UseLegalData();
  const cases = (legalData.items ?? []) as LegalCase[];
  const isMobile = useMediaQuery("(max-width: 768px)");

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null);

  // Filtros - separados
  const [personSearch, setPersonSearch] = useState("");
  const [incidentSearch, setIncidentSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [datePickerMode, setDatePickerMode] = useState<"single" | "range">(
    "single",
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [showNoProgress, setShowNoProgress] = useState(false);

  const [personSuggestions, setPersonSuggestions] = useState<string[]>([]);
  const [incidentSuggestions, setIncidentSuggestions] = useState<string[]>([]);
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false);
  const [showIncidentSuggestions, setShowIncidentSuggestions] = useState(false);
  const personSearchRef = useRef<HTMLDivElement>(null);
  const incidentSearchRef = useRef<HTMLDivElement>(null);

  // Todos los eventos
  const allEvents = useMemo(() => buildAllEvents(cases), [cases]);

  // Índice ymd → eventos (sin filtros)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    allEvents.forEach((ev) => {
      if (!map.has(ev.ymd)) map.set(ev.ymd, []);
      map.get(ev.ymd)!.push(ev);
    });
    return map;
  }, [allEvents]);

  // Obtener lista de nombres de personas
  const personNames = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.entrevista_nombre) set.add(c.entrevista_nombre);
    });
    return Array.from(set).sort();
  }, [cases]);

  // Obtener lista de nombres de incidentes
  const incidentNames = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      c.incidentes?.forEach((inc) => {
        if (inc.nombre) set.add(inc.nombre);
      });
    });
    return Array.from(set).sort();
  }, [cases]);

  // Actualizar sugerencias de personas
  useEffect(() => {
    if (personSearch.trim().length > 0) {
      const q = personSearch.trim().toLowerCase();
      const filtered = personNames.filter((name) =>
        name.toLowerCase().includes(q),
      );
      setPersonSuggestions(filtered.slice(0, 10));
      setShowPersonSuggestions(true);
    } else {
      setPersonSuggestions([]);
      setShowPersonSuggestions(false);
    }
  }, [personSearch, personNames]);

  // Actualizar sugerencias de incidentes
  useEffect(() => {
    if (incidentSearch.trim().length > 0) {
      const q = incidentSearch.trim().toLowerCase();
      const filtered = incidentNames.filter((name) =>
        name.toLowerCase().includes(q),
      );
      setIncidentSuggestions(filtered.slice(0, 10));
      setShowIncidentSuggestions(true);
    } else {
      setIncidentSuggestions([]);
      setShowIncidentSuggestions(false);
    }
  }, [incidentSearch, incidentNames]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        personSearchRef.current &&
        !personSearchRef.current.contains(e.target as Node)
      ) {
        setShowPersonSuggestions(false);
      }
      if (
        incidentSearchRef.current &&
        !incidentSearchRef.current.contains(e.target as Node)
      ) {
        setShowIncidentSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    let result = allEvents;

    // Filtro por persona
    if (personSearch.trim()) {
      const q = personSearch.trim().toLowerCase();
      result = result.filter(
        (ev) =>
          ev.caseName.toLowerCase().includes(q) ||
          (ev.folio && ev.folio.toString().includes(q)),
      );
    }

    // Filtro por incidente
    if (incidentSearch.trim()) {
      const q = incidentSearch.trim().toLowerCase();
      result = result.filter(
        (ev) => ev.incidentName && ev.incidentName.toLowerCase().includes(q),
      );
    }

    // Filtro por estatus del caso
    if (selectedStatuses.length > 0) {
      result = result.filter(
        (ev) => ev.estatus && selectedStatuses.includes(ev.estatus),
      );
    }

    // Filtro por tipo de evento
    if (selectedEventTypes.length > 0) {
      result = result.filter((ev) => {
        const isIncidente = !!ev.incidentName;
        const label = isIncidente ? "Incidente" : ev.label;
        return selectedEventTypes.includes(label);
      });
    }

    // Filtro "Sin avance": casos que no tienen eventos en los últimos 30 días
    if (showNoProgress) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffYmd = toYMD(thirtyDaysAgo.toISOString());
      const caseLastEvent = new Map<number, string>();
      result.forEach((ev) => {
        const existing = caseLastEvent.get(ev.caseId);
        if (!existing || ev.ymd > existing) {
          caseLastEvent.set(ev.caseId, ev.ymd);
        }
      });
      const casesWithoutProgress = new Set<number>();
      caseLastEvent.forEach((lastYmd, caseId) => {
        if (lastYmd < cutoffYmd!) {
          casesWithoutProgress.add(caseId);
        }
      });
      result = result.filter((ev) => casesWithoutProgress.has(ev.caseId));
    }

    // Filtro por fecha seleccionada o rango
    if (datePickerMode === "single" && selectedDate) {
      result = result.filter((ev) => ev.ymd === selectedDate);
    } else if (datePickerMode === "range" && rangeStart && rangeEnd) {
      result = result.filter(
        (ev) => ev.ymd >= rangeStart && ev.ymd <= rangeEnd,
      );
    }

    return result;
  }, [
    allEvents,
    personSearch,
    incidentSearch,
    selectedStatuses,
    selectedEventTypes,
    showNoProgress,
    datePickerMode,
    selectedDate,
    rangeStart,
    rangeEnd,
  ]);

  // Reconstruir el mapa de eventos por día con los filtros
  const filteredEventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    filteredEvents.forEach((ev) => {
      if (!map.has(ev.ymd)) map.set(ev.ymd, []);
      map.get(ev.ymd)!.push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Días del mes
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Stats
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEvents = filteredEvents.filter((e) =>
    e.ymd.startsWith(monthPrefix),
  );
  const uniqueCasesThisMonth = new Set(monthEvents.map((e) => e.caseId)).size;
  const daysWithEvents = new Set(monthEvents.map((e) => e.ymd)).size;

  // Eventos del día seleccionado (filtrados)
  const selectedEvents = selectedYmd
    ? (filteredEventsByDay.get(selectedYmd) ?? [])
    : [];

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.estatus_caso_nombre) set.add(c.estatus_caso_nombre);
    });
    return Array.from(set);
  }, [cases]);

  function navMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setMonth(m);
    setYear(y);
  }

  function goToToday() {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  }

  function clearFilters() {
    setPersonSearch("");
    setIncidentSearch("");
    setSelectedStatuses([]);
    setSelectedEventTypes([]);
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
    setShowNoProgress(false);
    setPersonSuggestions([]);
    setIncidentSuggestions([]);
    setShowPersonSuggestions(false);
    setShowIncidentSuggestions(false);
  }

  // Cerrar el panel de día al cambiar de mes
  useEffect(() => {
    setSelectedYmd(null);
  }, [year, month]);

  // Función para obtener los tags de un día
  function getDayTags(
    ymd: string,
    maxTags = isMobile ? 2 : 4,
  ): {
    name: string;
    color: string;
    label: string;
    id: string;
    incidentName?: string;
    hasEvidence?: boolean;
  }[] {
    const evs = filteredEventsByDay.get(ymd) ?? [];
    const tags: {
      name: string;
      color: string;
      label: string;
      id: string;
      incidentName?: string;
      hasEvidence?: boolean;
    }[] = [];
    const seen = new Set<string>();
    evs.forEach((ev) => {
      const label = ev.procesoLabel ? "Incidente" : ev.label;
      const key = `${ev.caseId}-${label}-${ev.incidentName || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        tags.push({
          name: ev.caseName,
          color: ev.color,
          label: label,
          id: `${ev.caseId}-${ev.eventKey}`,
          incidentName: ev.incidentName,
          hasEvidence: ev.evidencias && ev.evidencias.length > 0,
        });
      }
    });
    return tags.slice(0, maxTags);
  }

  // Para móvil, mostrar modal de eventos
  const [showMobileModal, setShowMobileModal] = useState(false);

  function handleDayClick(ymd: string) {
    if (
      filteredEventsByDay.has(ymd) &&
      filteredEventsByDay.get(ymd)!.length > 0
    ) {
      if (isMobile) {
        setSelectedYmd(ymd);
        setShowMobileModal(true);
      } else {
        setSelectedYmd(ymd);
      }
    }
  }

  // Calcular número de filtros activos
  const activeFiltersCount =
    (personSearch ? 1 : 0) +
    (incidentSearch ? 1 : 0) +
    selectedStatuses.length +
    selectedEventTypes.length +
    (selectedDate || rangeStart ? 1 : 0) +
    (showNoProgress ? 1 : 0);

  // Resumen de filtros para web
  const filterSummary = useMemo(() => {
    const parts = [];
    if (personSearch) parts.push(`👤 ${personSearch}`);
    if (incidentSearch) parts.push(`📌 ${incidentSearch}`);
    if (selectedStatuses.length > 0)
      parts.push(`🏷️ ${selectedStatuses.join(", ")}`);
    if (selectedEventTypes.length > 0)
      parts.push(`📌 ${selectedEventTypes.join(", ")}`);
    if (showNoProgress) parts.push(`⏳ Sin avance`);
    if (selectedDate) parts.push(`📅 ${fmtDate(selectedDate)}`);
    else if (rangeStart && rangeEnd)
      parts.push(`📅 ${fmtDate(rangeStart)} → ${fmtDate(rangeEnd)}`);
    return parts.length > 0 ? parts.join(" · ") : "Sin filtros";
  }, [
    personSearch,
    incidentSearch,
    selectedStatuses,
    selectedEventTypes,
    showNoProgress,
    selectedDate,
    rangeStart,
    rangeEnd,
  ]);

  // Contenido de filtros (reutilizable para web y móvil)
  const FilterContent = () => (
    <>
      {/* Botón Limpiar filtros - aparece SOLO si hay filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <button
            onClick={clearFilters}
            className="w-full py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border-2 border-red-200 transition-all"
          >
            🗑️ Limpiar todos los filtros ({activeFiltersCount})
          </button>
        </div>
      )}

      {/* Búsqueda por persona */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          👤 Buscar persona
        </label>
        <div ref={personSearchRef} className="relative">
          <input
            type="text"
            value={personSearch}
            onChange={(e) => setPersonSearch(e.target.value)}
            onFocus={() => {
              if (
                personSearch.trim().length > 0 &&
                personSuggestions.length > 0
              )
                setShowPersonSuggestions(true);
            }}
            placeholder="Nombre de la persona o folio..."
            className="w-full pl-4 pr-4 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50/80 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            autoComplete="off"
          />
          {showPersonSuggestions && personSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {personSuggestions.map((name, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 text-base hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                  onClick={() => {
                    setPersonSearch(name);
                    setShowPersonSuggestions(false);
                  }}
                >
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {getInitials(name)}
                  </span>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Búsqueda por incidente */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          📌 Buscar incidente
        </label>
        <div ref={incidentSearchRef} className="relative">
          <input
            type="text"
            value={incidentSearch}
            onChange={(e) => setIncidentSearch(e.target.value)}
            onFocus={() => {
              if (
                incidentSearch.trim().length > 0 &&
                incidentSuggestions.length > 0
              )
                setShowIncidentSuggestions(true);
            }}
            placeholder="Nombre del incidente..."
            className="w-full pl-4 pr-4 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50/80 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            autoComplete="off"
          />
          {showIncidentSuggestions && incidentSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {incidentSuggestions.map((name, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 text-base hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                  onClick={() => {
                    setIncidentSearch(name);
                    setShowIncidentSuggestions(false);
                  }}
                >
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                    📌
                  </span>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Selector de fecha: mini calendario */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            📅 Fecha
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDatePickerMode("single")}
              className={`text-sm px-4 py-1.5 rounded-full border-2 font-medium transition-all ${
                datePickerMode === "single"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setDatePickerMode("range")}
              className={`text-sm px-4 py-1.5 rounded-full border-2 font-medium transition-all ${
                datePickerMode === "range"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              Rango
            </button>
          </div>
        </div>
        <MiniCalendar
          mode={datePickerMode}
          selectedDate={selectedDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onSelectDate={(ymd) => {
            setSelectedDate(ymd);
            setRangeStart(null);
            setRangeEnd(null);
          }}
          onSelectRange={(start, end) => {
            setRangeStart(start);
            setRangeEnd(end);
            setSelectedDate(null);
          }}
          onClear={() => {
            setSelectedDate(null);
            setRangeStart(null);
            setRangeEnd(null);
          }}
          onGoToday={goToToday}
        />
      </div>

      {/* Estatus */}
      {availableStatuses.length > 0 && (
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            🏷️ Estatus
          </label>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((st) => {
              const isActive = selectedStatuses.includes(st);
              return (
                <button
                  key={st}
                  onClick={() => {
                    if (isActive)
                      setSelectedStatuses(
                        selectedStatuses.filter((s) => s !== st),
                      );
                    else setSelectedStatuses([...selectedStatuses, st]);
                  }}
                  className={`text-sm px-4 py-1.5 rounded-full border-2 font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtro "Sin avance" */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          ⏳ Sin avance (últimos 30 días)
        </label>
        <button
          onClick={() => setShowNoProgress(!showNoProgress)}
          className={`text-sm px-4 py-2 rounded-xl border-2 font-medium transition-all ${
            showNoProgress
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
          }`}
        >
          {showNoProgress ? "✅ Activo" : "🔘 Mostrar inactivos"}
        </button>
      </div>

      {/* Tipo de evento (opcional) */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          📌 Tipo evento (avanzado)
        </label>
        <EventTypeFilter
          selectedTypes={selectedEventTypes}
          onChange={setSelectedEventTypes}
        />
      </div>

      {/* Resumen */}
      <div className="pt-4 border-t-2 border-gray-200/60 flex justify-between text-sm text-gray-500 font-medium">
        <span>{filteredEvents.length} eventos</span>
        <span>{new Set(filteredEvents.map((e) => e.caseId)).size} casos</span>
      </div>

      {/* Leyenda */}
      <div className="pt-4 border-t-2 border-gray-200/60">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
          🎨 Leyenda
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {CASE_EVENTS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#22C55E" }}
            />
            <span className="text-sm text-gray-600">Incidente</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 mt-1">
            <span className="text-sm">📎</span>
            <span className="text-sm text-gray-500">
              Con evidencias (imagen/PDF)
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100/50 w-full overflow-hidden">
      {/* ─── BARRA SUPERIOR ─── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 py-2 flex-shrink-0 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-200">
            📅
          </div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            Calendario
          </h1>
          {!isMobile && activeFiltersCount > 0 && (
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isMobile ? (
            <button
              onClick={() => setShowFilters(true)}
              className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-300 transition-all font-medium relative"
            >
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          ) : (
            <>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-gray-500 truncate max-w-[250px]">
                  {filterSummary}
                </span>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`text-sm px-4 py-2 rounded-xl border-2 transition-all font-medium ${
                  showFilters
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                {showFilters ? "🔽 Filtros" : "🔼 Filtros"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── CUERPO PRINCIPAL ─── */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* ─── COLUMNA IZQUIERDA: FILTROS (solo escritorio) ─── */}
        {!isMobile && (
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } w-96 flex-shrink-0 bg-white/80 backdrop-blur-sm border-r border-gray-200/60 overflow-y-auto transition-all duration-300 p-5 space-y-6`}
          >
            <FilterContent />
          </div>
        )}

        {/* ─── COLUMNA CENTRAL: CALENDARIO ─── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* navegación del mes */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex-shrink-0">
            <button
              onClick={() => navMonth(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-2xl transition-colors"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-base font-bold text-gray-800">
                {MESES[month]}{" "}
                <span className="text-gray-400 font-normal">{year}</span>
              </p>
              {!isMobile && (
                <p className="text-sm text-gray-400">
                  {monthEvents.length} eventos · {daysWithEvents} días ·{" "}
                  {uniqueCasesThisMonth} casos
                </p>
              )}
            </div>
            <button
              onClick={() => navMonth(1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-2xl transition-colors"
            >
              ›
            </button>
          </div>

          {/* grid del calendario */}
          <div className="flex-1 overflow-auto p-2">
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-200/30 overflow-hidden w-full h-full flex flex-col">
              {/* cabecera días */}
              <div className="grid grid-cols-7 border-b border-gray-100/80 bg-gray-50/50 flex-shrink-0">
                {DIAS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {isMobile ? d.slice(0, 2) : d}
                  </div>
                ))}
              </div>

              {/* celdas */}
              <div className="flex-1 grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${i}`}
                        className="h-full bg-gray-50/30 border-b border-r border-gray-100/60 last:border-r-0"
                      />
                    );
                  }

                  const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = filteredEventsByDay.get(ymd) ?? [];
                  const isToday = ymd === todayYmd;
                  const isSelected = ymd === selectedYmd;
                  const hasEvents = dayEvents.length > 0;
                  const maxTags = isMobile ? 2 : 4;
                  const tags = getDayTags(ymd, maxTags);
                  const hasEvidence = dayEvents.some(
                    (ev) => ev.evidencias && ev.evidencias.length > 0,
                  );

                  return (
                    <button
                      key={ymd}
                      onClick={() => handleDayClick(ymd)}
                      className={`
                        relative h-full flex flex-col items-start p-1.5 border-b border-r border-gray-100/60
                        last:border-r-0 transition-all group
                        ${hasEvents ? "cursor-pointer" : "cursor-default"}
                        ${isSelected ? "bg-blue-50/80 shadow-inner ring-2 ring-blue-300 ring-inset" : ""}
                        ${(i + 1) % 7 === 0 ? "border-r-0" : ""}
                        hover:bg-gray-50/70
                      `}
                    >
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                          isToday
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-gray-700"
                        } ${
                          isSelected && !isToday
                            ? "bg-blue-100 text-blue-700"
                            : ""
                        }`}
                      >
                        {day}
                      </span>

                      {/* Indicador de evidencias */}
                      {hasEvidence && (
                        <span className="absolute top-0.5 right-1 text-[10px]">
                          📎
                        </span>
                      )}

                      {tags.length > 0 && (
                        <div className="mt-0.5 w-full overflow-hidden space-y-0.5">
                          {tags.map((tag, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] font-semibold truncate rounded-sm px-1.5 py-0.5 leading-tight flex items-center gap-1 shadow-sm"
                              style={{
                                backgroundColor: tag.color + "25",
                                color: tag.color,
                                border: `1px solid ${tag.color}40`,
                              }}
                            >
                              <span className="truncate">{tag.name}</span>
                              {tag.incidentName && !isMobile && (
                                <span className="text-[8px] opacity-70 ml-0.5">
                                  ({tag.incidentName})
                                </span>
                              )}
                              {!isMobile && (
                                <>
                                  <span className="text-[8px] opacity-60">
                                    ·
                                  </span>
                                  <span className="text-[8px] opacity-80">
                                    {tag.label}
                                  </span>
                                </>
                              )}
                              {tag.hasEvidence && (
                                <span className="text-[8px] ml-0.5">📎</span>
                              )}
                            </div>
                          ))}
                          {dayEvents.length > tags.length && (
                            <span className="text-[8px] text-gray-400 font-medium">
                              +{dayEvents.length - tags.length} más
                            </span>
                          )}
                        </div>
                      )}

                      {hasEvents && !isSelected && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-gray-800 text-white text-[8px] px-2 py-0.5 rounded-full shadow-lg">
                          {dayEvents.length} evento
                          {dayEvents.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMNA DERECHA: EVENTOS DEL DÍA (solo escritorio) ─── */}
        {!isMobile && (
          <div className="w-96 flex-shrink-0 bg-white/80 backdrop-blur-sm border-l border-gray-200/60 overflow-hidden flex flex-col">
            {selectedYmd ? (
              <DayEventsPanel
                ymd={selectedYmd}
                events={selectedEvents}
                onClose={() => setSelectedYmd(null)}
                cases={cases}
                isMobile={false}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                <span className="text-6xl mb-4">📅</span>
                <p className="text-lg font-medium text-gray-500">
                  Selecciona un día
                </p>
                <p className="text-sm text-center mt-2 max-w-[200px]">
                  Haz clic en una fecha con eventos para ver los detalles aquí
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── DRAWER DE FILTROS (móvil) ─── */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ${
            showFilters ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-5 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <FilterContent />
            <button
              onClick={() => setShowFilters(false)}
              className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL MÓVIL PARA EVENTOS DEL DÍA ─── */}
      {isMobile && showMobileModal && selectedYmd && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center p-4"
          onClick={() => setShowMobileModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <DayEventsPanel
              ymd={selectedYmd}
              events={selectedEvents}
              onClose={() => setShowMobileModal(false)}
              cases={cases}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
