import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import UseCatalogueData from "../../hooks/catalogues/usecatalogues";
import UseEventData from "../../hooks/events/useevents";
import CustomButton from "../../components/button/custombuttom";
import Tooltip from "../../components/toltip/Toltip";

// ======================== TIPOS ========================
export interface CalEvent {
  id: string;
  title: string;
  time?: string;
  description?: string;
  location?: string;
  categoryId?: number;
  categoryLabel?: string;
  numeroAsistentes?: number;
  fechaProxima?: string;
  ponente?: string;
  seguimiento?: { estado: string; responsable: string; observaciones?: string };
}
export interface EventsMap {
  [dateKey: string]: CalEvent[];
}
interface CategoryStyle {
  label: string;
  color: string;
  icon: string;
}
type ViewMode = "month" | "week";

// ======================== UTILS ========================
const MONTHS = [
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
const MONTHS_S = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const DAYS_S = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_F = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const EMPTY: CalEvent[] = [];

const fmt = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const todayStr = () => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth(), t.getDate());
};
function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  return `${parseInt(m.slice(0, 2), 16)}, ${parseInt(m.slice(2, 4), 16)}, ${parseInt(m.slice(4, 6), 16)}`;
}
const COLOR_PALETTE = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
];

// ======================== SKELETON ========================
const CalendarSkeleton: React.FC = () => (
  <div className="flex h-screen bg-slate-50 font-sans overflow-hidden animate-pulse">
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-100 p-4 flex flex-col gap-5">
      <div className="h-4 w-20 bg-slate-200 rounded" />
      <div className="h-9 w-full bg-slate-100 rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-7 w-full bg-slate-100 rounded-lg" />
      ))}
      <div className="h-32 w-full bg-slate-100 rounded-xl" />
      <div className="h-24 w-full bg-slate-100 rounded-xl mt-auto" />
    </aside>
    <div className="flex-1 flex flex-col min-w-0">
      <div className="bg-white border-b border-slate-100 px-5 py-3 h-14" />
      <div className="flex-1 p-3 grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[80px] bg-white border border-slate-100 rounded-xl"
          />
        ))}
      </div>
    </div>
    <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-100 hidden md:block p-4">
      <div className="h-14 w-14 bg-slate-200 rounded-xl mb-3" />
      <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-32 bg-slate-100 rounded" />
    </aside>
  </div>
);

// ======================== SPINNER ========================
const Spinner: React.FC = () => (
  <svg
    className="animate-spin w-3.5 h-3.5 text-indigo-400"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

// ======================== CATEGORY PILL ========================
const CategoryPill: React.FC<{ cat: CategoryStyle; small?: boolean }> = memo(
  ({ cat, small }) => {
    const rgb = hexToRgb(cat.color);
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border font-medium ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}
        style={{
          color: cat.color,
          borderColor: `rgba(${rgb},0.25)`,
          backgroundColor: `rgba(${rgb},0.1)`,
        }}
      >
        {cat.icon} {cat.label}
      </span>
    );
  },
);
CategoryPill.displayName = "CategoryPill";

// ======================== MINICAL ========================
const MiniCal: React.FC<{
  year: number;
  month: number;
  selected: string;
  onSelect: (k: string) => void;
  onPrev: () => void;
  onNext: () => void;
}> = memo(({ year, month, selected, onSelect, onPrev, onNext }) => {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const today = todayStr();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrev}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-slate-600">
          {MONTHS_S[month]} {year}
        </span>
        <button
          onClick={onNext}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px text-center">
        {DAYS_S.map((d) => (
          <div key={d} className="text-[9px] text-slate-400 pb-1">
            {d[0]}
          </div>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const k = fmt(year, month, d);
          const isSel = k === selected;
          const isTd = k === today;
          return (
            <div
              key={d}
              onClick={() => onSelect(k)}
              className={`text-[10px] py-0.5 rounded cursor-pointer transition-colors ${isSel ? "bg-indigo-600 text-white font-medium" : isTd ? "text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
});
MiniCal.displayName = "MiniCal";

// ======================== YEAR / MONTH PICKER ========================
const YearPicker: React.FC<{
  year: number;
  onSelect: (y: number) => void;
  onClose: () => void;
}> = memo(({ year, onSelect, onClose }) => {
  const [base, setBase] = useState(Math.floor(year / 12) * 12);
  return (
    <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-48">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setBase((b) => b - 12)}
          className="text-slate-400 hover:text-slate-600 px-1"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-slate-600">
          {base}–{base + 11}
        </span>
        <button
          onClick={() => setBase((b) => b + 12)}
          className="text-slate-400 hover:text-slate-600 px-1"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 12 }, (_, i) => base + i).map((y) => (
          <button
            key={y}
            onClick={() => {
              onSelect(y);
              onClose();
            }}
            className={`py-1 text-xs rounded-lg transition-colors ${y === year ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
});
YearPicker.displayName = "YearPicker";

const MonthPicker: React.FC<{
  year: number;
  month: number;
  onSelect: (m: number) => void;
  onClose: () => void;
}> = memo(({ year, month, onSelect, onClose }) => (
  <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-48">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-slate-600">{year}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 text-xs"
      >
        ✕
      </button>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {MONTHS_S.map((m, i) => (
        <button
          key={m}
          onClick={() => {
            onSelect(i);
            onClose();
          }}
          className={`py-1 text-xs rounded-lg transition-colors ${i === month ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          {m}
        </button>
      ))}
    </div>
  </div>
));
MonthPicker.displayName = "MonthPicker";

// ======================== MOBILE DATE PICKER (bottom sheet) ========================
const MobileYearPicker: React.FC<{
  year: number;
  onSelect: (y: number) => void;
}> = memo(({ year, onSelect }) => {
  const [base, setBase] = useState(Math.floor(year / 12) * 12);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setBase((b) => b - 12)}
          className="min-w-11 min-h-11 rounded-lg hover:bg-slate-100 active:bg-slate-100 text-slate-500 flex items-center justify-center text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {base}–{base + 11}
        </span>
        <button
          onClick={() => setBase((b) => b + 12)}
          className="min-w-11 min-h-11 rounded-lg hover:bg-slate-100 active:bg-slate-100 text-slate-500 flex items-center justify-center text-lg"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => base + i).map((y) => (
          <button
            key={y}
            onClick={() => onSelect(y)}
            className={`py-3 rounded-xl text-sm font-medium transition-colors ${y === year ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 active:bg-slate-100"}`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
});
MobileYearPicker.displayName = "MobileYearPicker";

const MobileMonthPicker: React.FC<{
  year: number;
  month: number;
  onSelect: (m: number) => void;
}> = memo(({ year, month, onSelect }) => (
  <div>
    <div className="mb-3 text-sm font-semibold text-slate-700 text-center">
      {year}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {MONTHS_S.map((m, i) => (
        <button
          key={m}
          onClick={() => onSelect(i)}
          className={`py-3 rounded-xl text-sm font-medium transition-colors ${i === month ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 active:bg-slate-100"}`}
        >
          {m}
        </button>
      ))}
    </div>
  </div>
));
MobileMonthPicker.displayName = "MobileMonthPicker";

// ======================== SEARCH BAR ========================
const SearchBar: React.FC<{
  events: EventsMap;
  activeCategories: Set<string>;
  categoryConfig: Record<string, CategoryStyle>;
  onSelect: (key: string) => void;
}> = memo(({ events, activeCategories, categoryConfig, onSelect }) => {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const hits: { key: string; ev: CalEvent }[] = [];
    outer: for (const [key, evs] of Object.entries(events)) {
      for (const ev of evs) {
        if (!activeCategories.has(String(ev.categoryId || ""))) continue;
        if (
          ev.title.toLowerCase().includes(query) ||
          (ev.description || "").toLowerCase().includes(query) ||
          (ev.location || "").toLowerCase().includes(query)
        ) {
          hits.push({ key, ev });
          if (hits.length >= 6) break outer;
        }
      }
    }
    return hits;
  }, [q, events, activeCategories]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar evento…"
          className="flex-1 min-w-0 text-xs bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-slate-300 hover:text-slate-500 text-xs"
          >
            ✕
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="flex flex-col gap-1">
          {results.map(({ key, ev }) => {
            const d = parseKey(key);
            const cat = ev.categoryId
              ? categoryConfig[String(ev.categoryId)]
              : null;
            return (
              <div
                key={ev.id}
                onClick={() => {
                  onSelect(key);
                  setQ("");
                }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer border-l-2 bg-white border border-slate-100 hover:shadow-sm transition-all"
                style={{ borderLeftColor: cat?.color || "#94a3b8" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {ev.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {d.getDate()} {MONTHS_S[d.getMonth()]} ·{" "}
                    {ev.time || "Todo el día"}
                  </div>
                </div>
                {cat && <CategoryPill cat={cat} small />}
              </div>
            );
          })}
        </div>
      )}
      {q.trim() && results.length === 0 && (
        <p className="text-[11px] text-slate-400 px-1">Sin resultados</p>
      )}
    </div>
  );
});
SearchBar.displayName = "SearchBar";

// ======================== EVENT CARD ========================
const EventCard: React.FC<{
  ev: CalEvent;
  categoryConfig: Record<string, CategoryStyle>;
  onEdit?: () => void;
}> = memo(({ ev, categoryConfig, onEdit }) => {
  const cat = ev.categoryId ? categoryConfig[String(ev.categoryId)] : null;
  return (
    <div
      className="rounded-xl border border-slate-100 bg-white border-l-[3px] p-3 hover:shadow-md transition-shadow group"
      style={{ borderLeftColor: cat?.color || "#94a3b8" }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-xs font-semibold text-slate-800">
              {ev.title}
            </span>
            {cat && <CategoryPill cat={cat} small />}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            {ev.time && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>⏱</span>
                <span>{ev.time}</span>
              </div>
            )}
            {ev.location && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>📍</span>
                <span className="truncate max-w-[140px]">{ev.location}</span>
              </div>
            )}
            {ev.ponente && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>🎤</span>
                <span className="truncate max-w-[140px]">{ev.ponente}</span>
              </div>
            )}
          </div>

          {ev.numeroAsistentes != null && ev.numeroAsistentes > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {Array.from({ length: Math.min(ev.numeroAsistentes, 4) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold"
                      style={{
                        backgroundColor: cat?.color || "#94a3b8",
                        opacity: 1 - i * 0.15,
                      }}
                    >
                      {i === 3 && ev.numeroAsistentes! > 4
                        ? `+${ev.numeroAsistentes! - 3}`
                        : ""}
                    </div>
                  ),
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: cat?.color || "#64748b" }}
              >
                {ev.numeroAsistentes} asistente
                {ev.numeroAsistentes !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {ev.description && (
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-50 pt-2">
              {ev.description}
            </p>
          )}

          {ev.seguimiento?.estado &&
            ev.seguimiento.estado !== "Sin seguimiento" && (
              <div className="mt-2 pt-2 border-t border-slate-50 space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-500">Seguimiento</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-medium ${ev.seguimiento.estado === "En curso" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                  >
                    {ev.seguimiento.estado}
                  </span>
                </div>
                {ev.seguimiento.observaciones && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {ev.seguimiento.observaciones}
                  </p>
                )}
              </div>
            )}

          {ev.fechaProxima && (
            <div
              className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-[10px]"
              style={{ color: cat?.color || "#64748b" }}
            >
              <span>📅</span>
              <span>Próx. seguimiento: {ev.fechaProxima}</span>
            </div>
          )}
        </div>

        {/* Botón editar — solo visible en hover */}
        <Tooltip content="Editar">
          <CustomButton
            variant="icon"
            color="yellow"
            onClick={() => {
              onEdit();
            }}
          >
            ✏️
          </CustomButton>
        </Tooltip>
      </div>
    </div>
  );
});
EventCard.displayName = "EventCard";

// ======================== DETAIL PANEL ========================
interface DetailPanelProps {
  selected: string;
  selectedEvs: CalEvent[];
  categoryConfig: Record<string, CategoryStyle>;
  onNewClick?: (dateKey: string) => void; // 👈 solo para crear
  onEditClick?: (eventId: string) => void; // 👈 solo para editar
}
const DetailPanel: React.FC<DetailPanelProps> = memo(
  ({ selected, selectedEvs, categoryConfig, onNewClick, onEditClick }) => {
    const selectedDate = parseKey(selected);
    const totalAsistentes = selectedEvs.reduce(
      (s, e) => s + (e.numeroAsistentes || 0),
      0,
    );
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-end gap-3">
            <div>
              <div className="text-5xl font-bold text-slate-800 leading-none tabular-nums">
                {String(selectedDate.getDate()).padStart(2, "0")}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">
                {DAYS_F[selectedDate.getDay()]}
              </div>
            </div>
            <div className="pb-1">
              <div className="text-sm font-medium text-slate-600">
                {MONTHS[selectedDate.getMonth()]}
              </div>
              <div className="text-xs text-slate-400">
                {selectedDate.getFullYear()}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div
              className={`w-1.5 h-1.5 rounded-full ${selectedEvs.length ? "bg-indigo-500" : "bg-slate-300"}`}
            />
            <span className="text-xs text-slate-400">
              {selectedEvs.length
                ? `${selectedEvs.length} evento${selectedEvs.length !== 1 ? "s" : ""}`
                : "Sin eventos"}
            </span>
            {totalAsistentes > 0 && (
              <>
                <span className="text-slate-200">·</span>
                <span className="text-xs text-slate-400">
                  {totalAsistentes} asistentes
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {selectedEvs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                📅
              </div>
              <span className="text-xs">Día sin actividades</span>
              {onNewClick && (
                <button
                  onClick={() => onNewClick(selected)}
                  className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium mt-1"
                >
                  + Agregar actividad
                </button>
              )}
            </div>
          ) : (
            selectedEvs.map((ev) => (
              <EventCard
                key={ev.id}
                ev={ev}
                categoryConfig={categoryConfig}
                onEdit={onEditClick ? () => onEditClick(ev.id) : undefined}
              />
            ))
          )}
        </div>

        {/* Botón nueva actividad (solo cuando hay eventos, si no lo mostramos arriba) */}
        {onNewClick  && (
          <button
            onClick={() => onNewClick(selected)}
            className="mx-3 mb-3 py-2.5 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Nueva actividad
          </button>
        )}
      </div>
    );
  },
);
DetailPanel.displayName = "DetailPanel";

// ======================== STATS PANEL ========================
const StatsPanel: React.FC<{
  eventsMap: EventsMap;
  year: number;
  month: number;
  categoryConfig: Record<string, CategoryStyle>;
}> = memo(({ eventsMap, year, month, categoryConfig }) => {
  const stats = useMemo(() => {
    let totalEvents = 0,
      totalAsistentes = 0;
    const byCat: Record<string, { count: number; asistentes: number }> = {};
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    for (const [key, evs] of Object.entries(eventsMap)) {
      if (!key.startsWith(prefix)) continue;
      for (const ev of evs) {
        totalEvents++;
        totalAsistentes += ev.numeroAsistentes || 0;
        const catId = String(ev.categoryId || "sin");
        if (!byCat[catId]) byCat[catId] = { count: 0, asistentes: 0 };
        byCat[catId].count++;
        byCat[catId].asistentes += ev.numeroAsistentes || 0;
      }
    }
    return { totalEvents, totalAsistentes, byCat };
  }, [eventsMap, year, month]);

  if (stats.totalEvents === 0)
    return (
      <p className="text-[11px] text-slate-400">Sin actividades este mes</p>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-indigo-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-indigo-700 tabular-nums">
            {stats.totalEvents}
          </div>
          <div className="text-[10px] text-indigo-500 mt-0.5">actividades</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.totalAsistentes}
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5">asistentes</div>
        </div>
      </div>
      {Object.entries(stats.byCat).map(([catId, s]) => {
        const cat = categoryConfig[catId];
        if (!cat) return null;
        const pct =
          stats.totalEvents > 0
            ? Math.round((s.count / stats.totalEvents) * 100)
            : 0;
        return (
          <div key={catId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600 font-medium truncate max-w-[120px]">
                {cat.label}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums">
                {s.count} · {s.asistentes} asist.
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});
StatsPanel.displayName = "StatsPanel";

// ======================== TOOLTIP ========================
const EventTooltip: React.FC<{
  ev: CalEvent;
  cat: CategoryStyle | null;
  anchorRect: DOMRect;
}> = ({ ev, cat, anchorRect }) => (
  <div
    style={{
      position: "fixed",
      top: anchorRect.bottom + 6,
      left: Math.min(anchorRect.left, window.innerWidth - 220),
      zIndex: 9999,
      width: 200,
    }}
    className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 pointer-events-none"
  >
    <div className="text-xs font-semibold text-slate-800 mb-1">{ev.title}</div>
    {cat && <CategoryPill cat={cat} small />}
    {ev.location && (
      <div className="text-[10px] text-slate-500 mt-1.5">📍 {ev.location}</div>
    )}
    {ev.numeroAsistentes ? (
      <div className="text-[10px] text-slate-500 mt-0.5">
        👥 {ev.numeroAsistentes} asistentes
      </div>
    ) : null}
    {ev.time && (
      <div className="text-[10px] text-slate-500 mt-0.5">⏱ {ev.time}</div>
    )}
  </div>
);

// ======================== DAY CELL ========================
interface DayCellProps {
  dateKey: string;
  day: number;
  other: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalEvent[];
  hasSeguimiento: boolean; // fecha_proxima de otro evento apunta acá
  categoryConfig: Record<string, CategoryStyle>;
  onSelect: (key: string) => void;
}
const DayCell: React.FC<DayCellProps> = memo(
  ({
    dateKey,
    day,
    other,
    isToday,
    isSelected,
    events,
    hasSeguimiento,
    categoryConfig,
    onSelect,
  }) => {
    const [tooltip, setTooltip] = useState<{
      ev: CalEvent;
      rect: DOMRect;
    } | null>(null);
    const handleClick = useCallback(
      () => onSelect(dateKey),
      [onSelect, dateKey],
    );

    return (
      <>
        <div
          onClick={handleClick}
          className={`min-h-[60px] sm:min-h-[80px] rounded-lg sm:rounded-xl p-1 sm:p-1.5 cursor-pointer flex flex-col gap-0.5 transition-all select-none ${other ? "opacity-30" : ""} ${
            isSelected
              ? "bg-indigo-50 ring-2 ring-indigo-400 ring-offset-1"
              : isToday
                ? "bg-slate-50"
                : "bg-white hover:bg-slate-50"
          } border ${isSelected ? "border-indigo-300" : "border-slate-100 hover:border-slate-200"}`}
        >
          {/* Número del día + indicador seguimiento */}
          <div className="flex items-start justify-between mb-0.5">
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] flex-shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white font-bold"
                  : isToday
                    ? "bg-indigo-100 text-indigo-700 font-bold"
                    : "text-slate-500"
              }`}
            >
              {day}
            </div>
            {hasSeguimiento && !other && (
              <div
                className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 mr-0.5 flex-shrink-0"
                title="Tiene seguimiento pendiente"
              />
            )}
          </div>

          {/* Compacto: pantallas muy angostas (<380px) — 1 chip + contador */}
          {events.length > 0 && (
            <div className="hidden max-[380px]:flex items-center gap-1">
              {(() => {
                const ev = events[0];
                const cat = ev.categoryId
                  ? categoryConfig[String(ev.categoryId)]
                  : null;
                return (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="text-[8px] px-1 py-px rounded border-l-2 truncate font-medium leading-tight cursor-default flex-1 min-w-0"
                    style={{
                      borderLeftColor: cat?.color || "#94a3b8",
                      backgroundColor: cat
                        ? `rgba(${hexToRgb(cat.color)},0.1)`
                        : "#f8fafc",
                      color: cat?.color || "#64748b",
                    }}
                  >
                    {ev.title}
                  </div>
                );
              })()}
              {events.length > 1 && (
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[7px] font-bold flex items-center justify-center">
                  {events.length}
                </span>
              )}
            </div>
          )}

          {/* Normal: sm en adelante (y 381-639px) */}
          <div className="max-[380px]:hidden flex flex-col gap-0.5">
            {events.slice(0, 3).map((ev) => {
              const cat = ev.categoryId
                ? categoryConfig[String(ev.categoryId)]
                : null;
              return (
                <div
                  key={ev.id}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setTooltip({
                      ev,
                      rect: (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect(),
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-px rounded border-l-2 truncate font-medium leading-tight cursor-default"
                  style={{
                    borderLeftColor: cat?.color || "#94a3b8",
                    backgroundColor: cat
                      ? `rgba(${hexToRgb(cat.color)},0.1)`
                      : "#f8fafc",
                    color: cat?.color || "#64748b",
                  }}
                >
                  {ev.title}
                </div>
              );
            })}
            {events.length > 3 && (
              <span className="text-[8px] sm:text-[9px] text-slate-400 pl-1 font-medium">
                +{events.length - 3} más
              </span>
            )}
          </div>
        </div>
        {tooltip && (
          <EventTooltip
            ev={tooltip.ev}
            cat={
              tooltip.ev.categoryId
                ? categoryConfig[String(tooltip.ev.categoryId)]
                : null
            }
            anchorRect={tooltip.rect}
          />
        )}
      </>
    );
  },
  (prev, next) =>
    prev.dateKey === next.dateKey &&
    prev.isSelected === next.isSelected &&
    prev.isToday === next.isToday &&
    prev.events === next.events &&
    prev.hasSeguimiento === next.hasSeguimiento &&
    prev.categoryConfig === next.categoryConfig,
);
DayCell.displayName = "DayCell";

// ======================== WEEK VIEW ========================
const WeekView: React.FC<{
  selected: string;
  filteredEvents: EventsMap;
  categoryConfig: Record<string, CategoryStyle>;
  onSelect: (k: string) => void;
  onEditClick?: (eventId: string) => void;
}> = memo(
  ({ selected, filteredEvents, categoryConfig, onSelect, onEditClick }) => {
    const today = todayStr();
    const selDate = parseKey(selected);
    const weekStart = new Date(selDate);
    weekStart.setDate(selDate.getDate() - selDate.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return { date: d, key: fmt(d.getFullYear(), d.getMonth(), d.getDate()) };
    });

    return (
      <div className="flex-1 overflow-auto p-2 sm:p-3">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-7 gap-2 min-h-full min-w-[640px] sm:min-w-0">
            {days.map(({ date, key }) => {
              const isTd = key === today;
              const isSel = key === selected;
              const evs = filteredEvents[key] || EMPTY;
              return (
                <div key={key} className="flex flex-col gap-1.5 min-h-[400px]">
                  <div
                    onClick={() => onSelect(key)}
                    className={`flex flex-col items-center py-2 rounded-xl cursor-pointer transition-all ${isSel ? "bg-indigo-600" : isTd ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                  >
                    <span
                      className={`text-[10px] uppercase tracking-wide font-semibold ${isSel ? "text-indigo-200" : isTd ? "text-indigo-400" : "text-slate-400"}`}
                    >
                      {DAYS_S[date.getDay()]}
                    </span>
                    <span
                      className={`text-xl font-bold tabular-nums ${isSel ? "text-white" : isTd ? "text-indigo-600" : "text-slate-700"}`}
                    >
                      {date.getDate()}
                    </span>
                    {evs.length > 0 && (
                      <span
                        className={`text-[9px] mt-0.5 font-medium ${isSel ? "text-indigo-200" : "text-slate-400"}`}
                      >
                        {evs.length} ev.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    {evs.length === 0 ? (
                      <div className="flex-1 border border-dashed border-slate-100 rounded-xl" />
                    ) : (
                      evs.map((ev) => {
                        const cat = ev.categoryId
                          ? categoryConfig[String(ev.categoryId)]
                          : null;
                        return (
                          <div
                            key={ev.id}
                            className="rounded-lg p-2 border-l-2 text-[10px] leading-snug group relative"
                            style={{
                              borderLeftColor: cat?.color || "#94a3b8",
                              backgroundColor: cat
                                ? `rgba(${hexToRgb(cat.color)},0.07)`
                                : "#f8fafc",
                            }}
                          >
                            <div className="font-semibold text-slate-700 truncate pr-5">
                              {ev.title}
                            </div>
                            {ev.location && (
                              <div className="text-slate-400 truncate mt-0.5">
                                📍 {ev.location}
                              </div>
                            )}
                            {ev.numeroAsistentes ? (
                              <div className="text-slate-400 mt-0.5">
                                👥 {ev.numeroAsistentes}
                              </div>
                            ) : null}
                            {cat && (
                              <div className="mt-1">
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{
                                    color: cat.color,
                                    backgroundColor: `rgba(${hexToRgb(cat.color)},0.15)`,
                                  }}
                                >
                                  {cat.icon} {cat.label}
                                </span>
                              </div>
                            )}
                            {onEditClick && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(ev.id);
                                }}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-5 h-5 rounded bg-white/80 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center text-[10px]"
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
WeekView.displayName = "WeekView";

// ======================== COMPONENTE PRINCIPAL ========================
export interface CalendaryEventsProps {
  initialDate?: Date;
  // Solo para crear — recibe la fecha seleccionada
  onNewEvent?: (dateKey: string) => void;
  // Solo para editar — recibe el item RAW del hook para cargar en el form
  onEditEvent?: (rawItem: any) => void;
}

const CalendaryEvents: React.FC<CalendaryEventsProps> = ({
  initialDate = new Date(),
  onNewEvent,
  onEditEvent,
}) => {
  const cataloguesData = UseCatalogueData("tipo_actividad");
  const eventsData = UseEventData();
  console.log("CalendaryEvents render, onNewEvent:", typeof onNewEvent);

  const hasItems = Boolean(
    eventsData?.items?.length || cataloguesData?.items?.length,
  );
  const isLoading = Boolean(eventsData?.loading || cataloguesData?.loading);
  const isFirstLoad = isLoading && !hasItems;
  const isRefreshing = isLoading && hasItems;

  const categorias = useMemo(
    () => cataloguesData?.items || [],
    [cataloguesData?.items],
  );

  const categoryConfig = useMemo(() => {
    const config: Record<string, CategoryStyle> = {};
    categorias.forEach((cat: any, i: number) => {
      config[String(cat.id)] = {
        label: cat.nombre,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
        icon: "📌",
      };
    });
    return config;
  }, [categorias]);

  const eventsMap = useMemo<EventsMap>(() => {
    const map: EventsMap = {};
    for (const ev of eventsData?.items || []) {
      const dateKey = ev.fecha_realizacion;
      if (!dateKey) continue;
      (map[dateKey] ||= []).push({
        id: String(ev.id),
        title: ev.tema_central || "Sin título",
        time: ev.duracion_estimada || undefined,
        description: ev.comentarios || undefined,
        location: ev.lugar || undefined,
        ponente: ev.ponente_facilitador || undefined,
        categoryId: ev.id_tipo_actividad,
        categoryLabel: "",
        numeroAsistentes: ev.numero_asistentes || 0,
        fechaProxima: ev.fecha_proxima || undefined,
        seguimiento: {
          estado: ev.acciones_programadas ? "En curso" : "Sin seguimiento",
          responsable: String(ev.id_responsable_seguimiento || ""),
          observaciones: ev.acciones_programadas || "",
        },
      });
    }
    return map;
  }, [eventsData?.items]);

  // Mapa de fechas que son fecha_proxima de algún evento → para el punto ámbar en DayCell
  const seguimientoMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const evs of Object.values(eventsMap))
      for (const ev of evs) if (ev.fechaProxima) map[ev.fechaProxima] = true;
    return map;
  }, [eventsMap]);

  const today = todayStr();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(),
  );
  const [pickerMode, setPickerMode] = useState<"year" | "month" | null>(null);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const mobilePickerRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setActiveCategories(new Set(Object.keys(categoryConfig)));
  }, [categoryConfig]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !(
          mobilePickerRef.current &&
          mobilePickerRef.current.contains(e.target as Node)
        )
      )
        setPickerMode(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Teclado: flechas navegan días, Escape cierra
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      const d = parseKey(selected);
      let next: Date | null = null;
      if (e.key === "ArrowRight") {
        next = new Date(d);
        next.setDate(d.getDate() + 1);
      } else if (e.key === "ArrowLeft") {
        next = new Date(d);
        next.setDate(d.getDate() - 1);
      } else if (e.key === "ArrowDown") {
        next = new Date(d);
        next.setDate(d.getDate() + 7);
      } else if (e.key === "ArrowUp") {
        next = new Date(d);
        next.setDate(d.getDate() - 7);
      } else if (e.key === "Escape") {
        setPickerMode(null);
        setMobileSheet(false);
        setMobileSidebar(false);
      }
      if (next) {
        e.preventDefault();
        const k = fmt(next.getFullYear(), next.getMonth(), next.getDate());
        setYear(next.getFullYear());
        setMonth(next.getMonth());
        setSelected(k);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected]);

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const evs of Object.values(eventsMap))
      for (const ev of evs) {
        const k = String(ev.categoryId || "");
        c[k] = (c[k] || 0) + 1;
      }
    return c;
  }, [eventsMap]);

  const filteredEvents = useMemo<EventsMap>(() => {
    const out: EventsMap = {};
    for (const [k, evs] of Object.entries(eventsMap)) {
      const f = evs.filter((e) =>
        activeCategories.has(String(e.categoryId || "")),
      );
      if (f.length) out[k] = f;
    }
    return out;
  }, [eventsMap, activeCategories]);

  const toggleCat = useCallback((id: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else next.add(id);
      return next;
    });
  }, []);

  const prevMonth = useCallback(
    () =>
      setMonth((m) => {
        if (m === 0) {
          setYear((y) => y - 1);
          return 11;
        }
        return m - 1;
      }),
    [],
  );
  const nextMonth = useCallback(
    () =>
      setMonth((m) => {
        if (m === 11) {
          setYear((y) => y + 1);
          return 0;
        }
        return m + 1;
      }),
    [],
  );
  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setSelected(today);
  }, [today]);

  // Navegar al día — NO abre el form, solo selecciona
  const selectDate = useCallback((key: string) => {
    const d = parseKey(key);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(key);
    setMobileSheet(true);
    setMobileSidebar(false);
  }, []);

  // Crear: buscar rawItem del día (fecha pre-llenada)
  const handleNewEvent = useCallback(
    (dateKey: string) => {
      console.log("CalendaryEvents → handleNewEvent", dateKey);
      onNewEvent?.(dateKey);
    },
    [onNewEvent],
  );

  // Editar: buscar rawItem por id en los items del hook y pasarlo completo
  const handleEditEvent = useCallback(
    (eventId: string) => {
      const rawItem = (eventsData?.items || []).find(
        (e: any) => String(e.id) === eventId,
      );
      if (rawItem) onEditEvent?.(rawItem);
    },
    [eventsData?.items, onEditEvent],
  );

  // Mover la semana seleccionada ±7 días (usado por swipe en vista semana)
  const shiftWeek = useCallback((dir: 1 | -1) => {
    setSelected((sel) => {
      const d = parseKey(sel);
      d.setDate(d.getDate() + dir * 7);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      return fmt(d.getFullYear(), d.getMonth(), d.getDate());
    });
  }, []);

  // Swipe horizontal: mes anterior/siguiente (vista mes) o semana anterior/siguiente (vista semana)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchRef.current;
      touchRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (viewMode === "month") {
        if (dx < 0) nextMonth();
        else prevMonth();
      } else {
        shiftWeek(dx < 0 ? 1 : -1);
      }
    },
    [viewMode, nextMonth, prevMonth, shiftWeek],
  );

  // Resumen compacto del mes para la barra móvil
  const monthStats = useMemo(() => {
    let totalEvents = 0;
    let totalAsistentes = 0;
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    for (const [key, evs] of Object.entries(filteredEvents)) {
      if (!key.startsWith(prefix)) continue;
      totalEvents += evs.length;
      for (const ev of evs) totalAsistentes += ev.numeroAsistentes || 0;
    }
    return { totalEvents, totalAsistentes };
  }, [filteredEvents, year, month]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const curr = new Date(year, month + 1, 0).getDate();
    const prev = new Date(year, month, 0).getDate();
    const arr: { y: number; m: number; d: number; other: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--)
      arr.push({
        y: month === 0 ? year - 1 : year,
        m: month === 0 ? 11 : month - 1,
        d: prev - i,
        other: true,
      });
    for (let d = 1; d <= curr; d++)
      arr.push({ y: year, m: month, d, other: false });
    const rem = 42 - arr.length;
    for (let d = 1; d <= rem; d++)
      arr.push({
        y: month === 11 ? year + 1 : year,
        m: month === 11 ? 0 : month + 1,
        d,
        other: true,
      });
    return arr;
  }, [year, month]);

  const selectedEvs = filteredEvents[selected] || EMPTY;

  if (isFirstLoad) return <CalendarSkeleton />;

  const sidebarContent = (
    <>
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-800">Calendario</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {MONTHS[month]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRefreshing && <Spinner />}
          <button
            onClick={() => setMobileSidebar(false)}
            className="md:hidden min-w-11 min-h-11 rounded-lg hover:bg-slate-100 active:bg-slate-100 text-slate-400 flex items-center justify-center text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Buscar
          </p>
          <SearchBar
            events={eventsMap}
            activeCategories={activeCategories}
            categoryConfig={categoryConfig}
            onSelect={selectDate}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Tipo actividad
            </p>
            {activeCategories.size < Object.keys(categoryConfig).length && (
              <button
                onClick={() =>
                  setActiveCategories(new Set(Object.keys(categoryConfig)))
                }
                className="text-[10px] text-indigo-500 hover:text-indigo-700"
              >
                Ver todas
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {Object.entries(categoryConfig).map(([id, cat]) => {
              const active = activeCategories.has(id);
              const rgb = hexToRgb(cat.color);
              return (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${active ? "bg-slate-50 border border-slate-100" : "opacity-40 hover:opacity-70"}`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-slate-700 flex-1 truncate">
                    {cat.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums"
                    style={
                      active
                        ? {
                            backgroundColor: `rgba(${rgb},0.1)`,
                            color: cat.color,
                            border: `1px solid rgba(${rgb},0.25)`,
                          }
                        : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                    }
                  >
                    {catCounts[id] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Navegar
          </p>
          <MiniCal
            year={year}
            month={month}
            selected={selected}
            onSelect={selectDate}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Resumen · {MONTHS_S[month]}
          </p>
          <StatsPanel
            eventsMap={filteredEvents}
            year={year}
            month={month}
            categoryConfig={categoryConfig}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-slate-100 flex-col overflow-hidden">
        {sidebarContent}
      </aside>

      {/* ── GRID / SEMANA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b border-slate-100 px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-1 sm:gap-3 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setMobileSidebar(true)}
            className="md:hidden min-w-11 min-h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-500 transition-colors flex items-center justify-center flex-shrink-0"
          >
            <span className="text-sm leading-none">☰</span>
          </button>
          <button
            onClick={prevMonth}
            className="min-w-11 min-h-11 sm:w-7 sm:h-7 sm:min-w-0 sm:min-h-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-500 text-sm transition-colors flex items-center justify-center flex-shrink-0"
          >
            ‹
          </button>
          <div ref={pickerRef} className="relative">
            <button
              onClick={() =>
                setPickerMode((m) =>
                  m === null ? "year" : m === "year" ? "month" : null,
                )
              }
              className="text-sm sm:text-base font-semibold text-slate-800 hover:text-indigo-600 transition-colors px-1 min-w-28 sm:min-w-44 text-left flex items-center gap-2 min-h-11 sm:min-h-0"
            >
              <span className="truncate">
                {MONTHS[month]} {year}
              </span>
              {isRefreshing && <Spinner />}
            </button>
            {/* Desktop: popover flotante */}
            {pickerMode === "year" && (
              <div className="hidden md:block">
                <YearPicker
                  year={year}
                  onSelect={(y) => {
                    setYear(y);
                    setPickerMode("month");
                  }}
                  onClose={() => setPickerMode(null)}
                />
              </div>
            )}
            {pickerMode === "month" && (
              <div className="hidden md:block">
                <MonthPicker
                  year={year}
                  month={month}
                  onSelect={(m) => {
                    setMonth(m);
                    setPickerMode(null);
                  }}
                  onClose={() => setPickerMode(null)}
                />
              </div>
            )}
          </div>
          <button
            onClick={nextMonth}
            className="min-w-11 min-h-11 sm:w-7 sm:h-7 sm:min-w-0 sm:min-h-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-500 text-sm transition-colors flex items-center justify-center flex-shrink-0"
          >
            ›
          </button>
          <button
            onClick={goToday}
            className="text-xs px-2.5 sm:px-3 min-h-11 sm:min-h-0 sm:py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-all flex-shrink-0 flex items-center justify-center"
          >
            Hoy
          </button>
          <div className="ml-auto flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
            {(["month", "week"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-2.5 sm:px-3 min-h-11 sm:min-h-0 sm:py-1 rounded-md text-xs font-medium transition-all flex items-center justify-center ${viewMode === v ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {v === "month" ? "Mes" : "Semana"}
              </button>
            ))}
          </div>
          <span className="hidden xl:block text-[10px] text-slate-300 ml-2">
            ← → ↑ ↓
          </span>
        </div>

        {/* Barra de resumen compacta — solo móvil */}
        <div className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-white border-b border-slate-100 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-[11px] text-slate-500">
            {monthStats.totalEvents} actividad
            {monthStats.totalEvents !== 1 ? "es" : ""}
          </span>
          {monthStats.totalAsistentes > 0 && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-[11px] text-slate-500">
                {monthStats.totalAsistentes} asistentes
              </span>
            </>
          )}
        </div>

        <div
          className="flex-1 flex flex-col overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {viewMode === "month" && (
            <div className="flex-1 overflow-auto p-2 sm:p-3">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
                {DAYS_S.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1"
                  >
                    <span className="sm:hidden">{d[0]}</span>
                    <span className="hidden sm:inline">{d}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {cells.map(({ y, m, d, other }) => {
                  const key = fmt(y, m, d);
                  return (
                    <DayCell
                      key={key}
                      dateKey={key}
                      day={d}
                      other={other}
                      isToday={key === today}
                      isSelected={key === selected}
                      events={filteredEvents[key] || EMPTY}
                      hasSeguimiento={!!seguimientoMap[key]}
                      categoryConfig={categoryConfig}
                      onSelect={selectDate}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "week" && (
            <WeekView
              selected={selected}
              filteredEvents={filteredEvents}
              categoryConfig={categoryConfig}
              onSelect={selectDate}
              onEditClick={onEditEvent ? handleEditEvent : undefined}
            />
          )}
        </div>
      </div>

      {/* ── DETAIL PANEL (desktop) ── */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-100 hidden md:flex flex-col overflow-hidden">
        <DetailPanel
          selected={selected}
          selectedEvs={selectedEvs}
          categoryConfig={categoryConfig}
          onNewClick={onNewEvent ? handleNewEvent : undefined}
          onEditClick={onEditEvent ? handleEditEvent : undefined}
        />
      </aside>

      {/* ── MOBILE: selector de mes/año como bottom sheet ── */}
      {pickerMode && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setPickerMode(null)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            ref={mobilePickerRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2 cursor-pointer"
              onClick={() => setPickerMode(null)}
            />
            <div className="px-4 pb-5">
              {pickerMode === "year" ? (
                <MobileYearPicker
                  year={year}
                  onSelect={(y) => {
                    setYear(y);
                    setPickerMode("month");
                  }}
                />
              ) : (
                <MobileMonthPicker
                  year={year}
                  month={month}
                  onSelect={(m) => {
                    setMonth(m);
                    setPickerMode(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE FAB ── */}
      {!mobileSidebar && !mobileSheet && (
        <button
          onClick={() => setMobileSheet(true)}
          className="md:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform"
        >
          📅
        </button>
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebar && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setMobileSidebar(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── MOBILE DETAIL SHEET ── */}
      {mobileSheet && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setMobileSheet(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 cursor-pointer"
              onClick={() => setMobileSheet(false)}
            />
            <div className="flex-1 overflow-y-auto">
              <DetailPanel
                selected={selected}
                selectedEvs={selectedEvs}
                categoryConfig={categoryConfig}
                onNewClick={onNewEvent ? handleNewEvent : undefined}
                onEditClick={onEditEvent ? handleEditEvent : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendaryEvents;
