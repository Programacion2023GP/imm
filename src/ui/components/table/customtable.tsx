import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiAlertCircle,
  FiInbox,
  FiEye,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiColumns,
  FiMaximize2,
  FiMinimize2,
  FiCheck,
  FiBookmark,
  FiPrinter,
  FiLock,
  FiUnlock,
  FiBarChart2,
  FiGrid,
  FiSun,
  FiMoon,
  FiLayout,
  FiCheckSquare,
  FiMenu,
  FiList,
  FiFilter,
  FiSettings,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { RiFileExcelFill, RiFileTextLine } from "react-icons/ri";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";

// ==================== DEEP FIELD UTILITY ====================
const getNestedValue = (obj: any, path: string): any => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc === null || acc === undefined) return "";
    return acc[key];
  }, obj);
};

const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split(".");
  const result = { ...obj };
  let cursor: any = result;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor[keys[i]] = { ...cursor[keys[i]] };
    cursor = cursor[keys[i]];
  }
  cursor[keys[keys.length - 1]] = value;
  return result;
};

// ==================== TYPES ====================
export interface Column<T extends object> {
  field: string;
  headerName: string;
  renderField?: (value: any, row: T) => React.ReactNode;
  getFilterValue?: (value: any, row?: T) => string;
  visibility?: "always" | "desktop" | "expanded" | "hidden" | "mobile";
  priority?: number;
  filterType?:
    | "text"
    | "number"
    | "date"
    | "date-range"
    | "select"
    | "boolean"
    | "number-range"
    | "multi-select"
    | "time"
    | "datetime-local"
    | "autocomplete";
  filterOptions?: Array<{ value: any; label: string }>;
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  pinned?: "left" | "right";
  sortable?: boolean;
  resizable?: boolean;
  groupable?: boolean;
  aggregation?: "sum" | "avg" | "min" | "max" | "count";
  format?: "currency" | "percent" | "number" | "date" | "text";
  editable?: boolean;
  tooltip?: (row: T) => string;
  conditionalStyle?: (row: T) => React.CSSProperties;
  frozen?: boolean;
}

type ViewMode = "table" | "cards" | "compact";
type Theme = "light" | "dark";
type DensityMode = "comfortable" | "compact" | "spacious";
type MobileViewMode =
  | "list"
  | "compact-list"
  | "cards"
  | "mini-cards"
  | "timeline"
  | "detailed-list";
type MobileDensity = "compact" | "comfortable" | "spacious";

interface SavedFilter {
  id: string;
  name: string;
  globalFilter: string;
  columnFilters: Record<string, string>;
  sortConfig: { field: string | null; direction: "asc" | "desc" | null };
  createdAt: string;
}

interface GroupConfig {
  field: string;
  direction: "asc" | "desc";
}

interface MobileConfig<T> {
  activeViews?: boolean;
  listTile?: {
    leading?: (row: T) => React.ReactNode;
    title: (row: T) => React.ReactNode;
    subtitle?: (row: T) => React.ReactNode;
    trailing?: (row: T) => React.ReactNode;
  };
  onTileTap?: (row: T) => void;
  dismissible?: boolean;
  swipeActions?: {
    left?: {
      icon: React.ReactNode;
      color: string;
      action: (row: T) => void;
      label?: string;
      hasPermission?: string | string[];
    }[];
    right?: {
      icon: React.ReactNode;
      color: string;
      action: (row: T) => void;
      label?: string;
      hasPermission?: string | string[];
    }[];
  };
  bottomSheet?: {
    builder: (row: T, onClose: () => void) => React.ReactNode;
    height?: number;
    showCloseButton?: boolean;
  };
  quickFilters?: {
    enabled?: boolean;
    filters?: {
      dataField: keyof T;
      field?: keyof T;
      type?:
        | "text"
        | "date"
        | "time"
        | "datetime"
        | "date-range"
        | "select"
        | "number"
        | "range"
        | "checkbox";
      label?: string;
      placeholder?: string;
      options?: { label: string; value: any }[];
      defaultValue?: any;
      defaultRange?: { start?: string | Date; end?: string | Date };
      minDate?: string | Date;
      maxDate?: string | Date;
      timeFormat?: "12h" | "24h";
      showTodayButton?: boolean;
      showClearButton?: boolean;
      presets?: { label: string; start: string | Date; end: string | Date }[];
    }[];
    onApply?: (filters: Record<string, any>) => void;
  };
}

export interface CustomTableHandle<T extends object = any> {
  clearAllFilters: () => void;
  clearColumnFilters: () => void;
  clearGlobalFilter: () => void;
  clearSelection: () => void;
  selectAllRows: (onlyFiltered?: boolean) => void;
  deselectAllRows: () => void;
  getSelectedRows: () => T[];
  getFilteredRows: () => T[];
  setTheme: (theme: Theme) => void;
  setDensity: (density: DensityMode) => void;
  setViewMode: (mode: ViewMode) => void;
  goToPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  exportExcel: (onlySelected?: boolean) => void;
  exportCSV: (onlySelected?: boolean) => void;
  exportJSON: (onlySelected?: boolean) => void;
  toggleFullscreen: () => void;
  refresh: () => void;
}

export interface PropsTable<T extends object> {
  data: T[];
  paginate: number[];
  columns: Column<T>[];
  headerActions?: (rows: T[]) => React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  error?: string;
  striped?: boolean;
  hoverable?: boolean;
  cardTitleField?: string;
  conditionExcel?: string | Array<string>;
  defaultView?: ViewMode;
  enableViewToggle?: boolean;
  title?: string;
  subtitle?: string;
  childrenField?: string;
  rowIdField?: string;
  indentSize?: number;
  enableGroupSelection?: boolean;
  enableColumnReorder?: boolean;
  enableColumnResize?: boolean;
  enableRowSelection?: boolean;
  enableGroupBy?: boolean;
  enableAggregations?: boolean;
  enableSavedFilters?: boolean;
  enableFullscreen?: boolean;
  enableThemeToggle?: boolean;
  enableExportOptions?: boolean;
  enableColumnVisibility?: boolean;
  enableDensityControl?: boolean;
  enableInlineEdit?: boolean;
  enableRowPinning?: boolean;
  enableSelectAllRows?: boolean;
  onRowSelect?: (rows: T[]) => void;
  onSelectAllRows?: (allSelected: boolean, rows: T[]) => void;
  onCellEdit?: (row: T, field: string, value: any) => void;
  defaultTheme?: Theme;
  defaultDensity?: DensityMode;
  storageKey?: string;
  refreshData?: () => void;
  mobileConfig?: MobileConfig<T>;
}

// ==================== DESIGN TOKENS ====================
const makeTokens = (theme: Theme) => ({
  pageBg: theme === "dark" ? "#0f0f14" : "#f5f5f8",
  white: theme === "dark" ? "#1a1a24" : "#ffffff",
  surface: theme === "dark" ? "#151520" : "#fafafa",
  surfaceElevated: theme === "dark" ? "#1e1e2e" : "#ffffff",
  hover: theme === "dark" ? "#22223a" : "#fdf4f6",
  border: theme === "dark" ? "#2a2a40" : "#e8e8ed",
  borderMd: theme === "dark" ? "#36364f" : "#d8d8df",
  thead: theme === "dark" ? "#13131e" : "#f2f2f6",
  theadBorder: theme === "dark" ? "#2a2a40" : "#e2e2ea",
  ruby: "#9B2242",
  rubyMid: "#b52a4f",
  rubyLight: theme === "dark" ? "rgba(155,34,66,0.18)" : "#fceef2",
  rubyGlow: "rgba(155,34,66,0.15)",
  gold: "#c9920a",
  goldLight: theme === "dark" ? "rgba(201,146,10,0.15)" : "#fef9ec",
  green: "#16a34a",
  greenLight: theme === "dark" ? "rgba(22,163,74,0.15)" : "#f0fdf4",
  blue: "#2563eb",
  blueLight: theme === "dark" ? "rgba(37,99,235,0.15)" : "#eff6ff",
  orange: "#ea580c",
  orangeLight: theme === "dark" ? "rgba(234,88,12,0.15)" : "#fff7ed",
  red: "#dc2626",
  redLight: theme === "dark" ? "rgba(220,38,38,0.15)" : "#fef2f2",
  text1: theme === "dark" ? "#e8e8f0" : "#1a1a24",
  text2: theme === "dark" ? "#9898b8" : "#5a5a72",
  text3: theme === "dark" ? "#55556a" : "#9898b0",
  r4: "6px",
  r6: "10px",
  r8: "14px",
  r12: "18px",
  shadow:
    theme === "dark"
      ? "0 1px 4px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
      : "0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)",
  shadowMd:
    theme === "dark"
      ? "0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
      : "0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
  shadowHover: "0 8px 32px rgba(155,34,66,0.18), 0 2px 8px rgba(0,0,0,0.1)",
});

// ==================== FILTER HELPERS ====================
const DateFilterInput = ({
  field,
  value,
  setColFilter,
  C,
}: {
  field: string;
  value: string;
  setColFilter: (f: string, v: string) => void;
  C: ReturnType<typeof makeTokens>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value === "" && inputRef.current) inputRef.current.value = "";
  }, [value]);
  const commit = (val: string) => setColFilter(field, val);
  return (
    <input
      ref={inputRef}
      type="date"
      defaultValue={value}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        (e.target as HTMLInputElement).blur();
      }}
      style={{
        background: "transparent",
        border: "none",
        outline: "none",
        color: C.text1,
        fontSize: 12,
        width: "100%",
        fontFamily: "inherit",
      }}
    />
  );
};

// ==================== DEBOUNCED INPUTS (FUERA DEL COMPONENTE para evitar pérdida de focus) ====================
const DebouncedSearchInput = ({
  value,
  onChange,
  placeholder,
  C,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  C: ReturnType<typeof makeTokens>;
}) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<any>(null);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocal(newVal);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(newVal), 300);
  };
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={local}
      onChange={handleChange}
      style={{
        background: "none",
        border: "none",
        outline: "none",
        color: C.text1,
        fontSize: 13,
        flex: 1,
        minWidth: 0,
        fontFamily: "inherit",
      }}
    />
  );
};

// ⚠️ CRÍTICO: DebouncedTextInput DEBE estar FUERA del componente principal
// Si se define adentro, React lo destruye y recrea en cada render → pierde el focus
const DebouncedTextInput = ({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<any>(null);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(e.target.value), 300);
      }}
      style={style}
    />
  );
};

const DateRangeFilterInput = ({
  field,
  value,
  setColFilter,
  C,
}: {
  field: string;
  value: string;
  setColFilter: (f: string, v: string) => void;
  C: ReturnType<typeof makeTokens>;
}) => {
  const [start, end] = value.split("|");
  const [localStart, setLocalStart] = useState(start || "");
  const [localEnd, setLocalEnd] = useState(end || "");
  useEffect(() => {
    setLocalStart(start || "");
    setLocalEnd(end || "");
  }, [start, end]);
  const applyRange = () => setColFilter(field, `${localStart}|${localEnd}`);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <input
        type="date"
        value={localStart}
        onChange={(e) => setLocalStart(e.target.value)}
        onBlur={applyRange}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: C.text1,
          fontSize: 12,
          width: "100%",
          fontFamily: "inherit",
        }}
      />
      <div style={{ height: 1, background: C.border }} />
      <input
        type="date"
        value={localEnd}
        onChange={(e) => setLocalEnd(e.target.value)}
        onBlur={applyRange}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: C.text1,
          fontSize: 12,
          width: "100%",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
};

// ==================== AUXILIARY COMPONENTS ====================
const IconBtn = ({
  children,
  onClick,
  title,
  active = false,
  C,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
  C: ReturnType<typeof makeTokens>;
}) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    title={title}
    style={{
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: C.r4,
      border: `1px solid ${active ? C.ruby : C.border}`,
      background: active ? C.rubyLight : C.surface,
      cursor: "pointer",
      color: active ? C.ruby : C.text2,
      transition: "all 0.15s",
      position: "relative",
    }}
  >
    {children}
  </motion.button>
);

const PgBtn = ({
  children,
  onClick,
  disabled = false,
  active = false,
  C,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  C: ReturnType<typeof makeTokens>;
}) => (
  <motion.button
    whileTap={!disabled ? { scale: 0.9 } : {}}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 28,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: C.r4,
      border: `1px solid ${active ? C.ruby : C.border}`,
      background: active ? C.ruby : C.surface,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 12,
      fontWeight: active ? 700 : 500,
      color: active ? "#fff" : C.text2,
      opacity: disabled ? 0.4 : 1,
      boxShadow: active ? `0 2px 8px rgba(155,34,66,0.15)` : "none",
      transition: "all 0.15s",
      fontFamily: "inherit",
    }}
  >
    {children}
  </motion.button>
);

const ExportBtn = ({
  icon,
  label,
  action,
  color,
  C,
}: {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color: string;
  C: ReturnType<typeof makeTokens>;
}) => (
  <button
    onClick={action}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 12px",
      borderRadius: C.r4,
      border: "none",
      background: "none",
      cursor: "pointer",
      color,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "inherit",
      transition: "background 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
  >
    {icon} {label}
  </button>
);

// ==================== MAIN COMPONENT ====================
const CustomTableInner = <T extends object>(
  props: PropsTable<T>,
  ref: React.Ref<CustomTableHandle<T>>,
) => {
  const {
    data,
    columns: initialColumns,
    paginate,
    actions,
    loading,
    error,
    headerActions,
    striped = true,
    hoverable = true,
    cardTitleField,
    conditionExcel,
    defaultView = "table",
    enableViewToggle = true,
    title,
    subtitle,
    childrenField,
    indentSize = 20,
    rowIdField,
    enableColumnReorder = true,
    enableColumnResize = true,
    enableRowSelection = false,
    enableGroupBy = true,
    enableAggregations = true,
    enableSavedFilters = true,
    enableFullscreen = true,
    enableThemeToggle = true,
    enableExportOptions = true,
    enableColumnVisibility = true,
    enableDensityControl = true,
    enableInlineEdit = false,
    enableRowPinning = false,
    enableSelectAllRows = false,
    onRowSelect,
    onSelectAllRows,
    onCellEdit,
    enableGroupSelection = false,
    defaultTheme = "light",
    defaultDensity = "comfortable",
    storageKey,
    refreshData,
    mobileConfig,
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(paginate[0]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [sortConfig, setSortConfig] = useState<{
    field: string | null;
    direction: "asc" | "desc" | null;
  }>({ field: null, direction: null });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [density, setDensity] = useState<DensityMode>(defaultDensity);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [columns, setColumns] = useState(initialColumns);
  const prevColumnsRef = useRef(initialColumns);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pinnedRows, setPinnedRows] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<GroupConfig | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    field: string;
  } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterLibrary, setShowFilterLibrary] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [flashRow, setFlashRow] = useState<string | null>(null);
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [allDataSelected, setAllDataSelected] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [rowExpanded, setRowExpanded] = useState<Set<string>>(new Set());
  const [dragCol, setDragCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const resizeRef = useRef<{
    col: string;
    startX: number;
    startW: number;
  } | null>(null);
  const columnManagerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterLibraryRef = useRef<HTMLDivElement>(null);

  // ---------- Mobile state ----------
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md">("md");
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>("list");
  const [mobileDensity, setMobileDensity] =
    useState<MobileDensity>("comfortable");
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedRowForSheet, setSelectedRowForSheet] = useState<T | null>(
    null,
  );
  const [activeDetails, setActiveDetails] = useState<number | null>(null);
  const [swipeData, setSwipeData] = useState({
    index: null as number | null,
    offset: 0,
    isSwiping: false,
  });
  const filterTimeoutRef = useRef<any>(null);

  const C = makeTokens(theme);
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const getRowId = useCallback(
    (row: Record<string, any>, index: number): string => {
      if (rowIdField) {
        const v = getNestedValue(row, rowIdField);
        if (v !== undefined && v !== null && v !== "") return String(v);
      }
      const id = getNestedValue(row, "id");
      if (id !== undefined && id !== null && id !== "") return String(id);
      return `__row_${index}`;
    },
    [rowIdField],
  );

  const allVisibleColumns = useMemo(
    () =>
      columns.filter(
        (col) => !hiddenColumns.has(col.field) && col.visibility !== "hidden",
      ),
    [columns, hiddenColumns],
  );
  const normalColumns = useMemo(
    () => allVisibleColumns.filter((col) => col.visibility !== "expanded"),
    [allVisibleColumns],
  );
  const expandedColumns = useMemo(
    () => allVisibleColumns.filter((col) => col.visibility === "expanded"),
    [allVisibleColumns],
  );

  const showExpandCol = Boolean(childrenField) || enableRowSelection;
  const showActionsCol = Boolean(actions) || enableRowPinning;

  const filteredData = useMemo(() => {
    if (!globalFilter && Object.keys(columnFilters).length === 0)
      return safeData;
    return safeData.filter((row) => {
      if (globalFilter) {
        const matches = allVisibleColumns.some((col) =>
          (col.getFilterValue
            ? col.getFilterValue(getNestedValue(row, col.field))
            : String(getNestedValue(row, col.field) ?? "")
          )
            .toLowerCase()
            .includes(globalFilter.toLowerCase()),
        );
        if (!matches) return false;
      }
      for (const [field, filterValue] of Object.entries(columnFilters)) {
        if (!filterValue) continue;
        const col = columns.find((c) => c.field === field);
        if (!col) continue;
        const rowValue = getNestedValue(row, field);
        const raw = String(rowValue ?? "");
        switch (col.filterType) {
          case "number":
            if (!raw.includes(filterValue)) return false;
            break;
          case "select":
          case "boolean":
            if (raw !== filterValue) return false;
            break;
          case "date-range": {
            const [start, end] = filterValue.split("|");
            const date = new Date(rowValue);
            if (start && !isNaN(date.getTime()) && date < new Date(start))
              return false;
            if (end && !isNaN(date.getTime()) && date > new Date(end))
              return false;
            break;
          }
          case "number-range": {
            const [minStr, maxStr] = filterValue.split("|");
            const num = Number(rowValue);
            const min = Number(minStr);
            const max = Number(maxStr);
            if (minStr !== "" && !isNaN(min) && num < min) return false;
            if (maxStr !== "" && !isNaN(max) && num > max) return false;
            break;
          }
          case "multi-select": {
            const selected = filterValue.split(",").filter(Boolean);
            if (selected.length > 0 && !selected.includes(raw)) return false;
            break;
          }
          default:
            if (!raw.toLowerCase().includes(filterValue.toLowerCase()))
              return false;
        }
      }
      return true;
    });
  }, [safeData, globalFilter, columnFilters, allVisibleColumns, columns]);

  const sortedData = useMemo(
    () =>
      [...filteredData].sort((a, b) => {
        if (!sortConfig.field || !sortConfig.direction) return 0;
        const va = getNestedValue(a, sortConfig.field);
        const vb = getNestedValue(b, sortConfig.field);
        if (va == null) return -1;
        if (vb == null) return 1;
        const c = String(va).localeCompare(String(vb), undefined, {
          numeric: true,
        });
        return sortConfig.direction === "asc" ? c : -c;
      }),
    [filteredData, sortConfig],
  );

  const groupedData = useMemo(() => {
    if (!groupBy || !enableGroupBy) return null;
    const map = new Map<string, T[]>();
    sortedData.forEach((row) => {
      const key = String(getNestedValue(row, groupBy.field) ?? "Sin grupo");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    const entries = [...map.entries()];
    if (groupBy.direction === "desc") entries.reverse();
    return entries;
  }, [sortedData, groupBy, enableGroupBy]);

  const aggregations = useMemo(() => {
    if (!enableAggregations) return {};
    const agg: Record<string, any> = {};
    normalColumns.forEach((col) => {
      if (!col.aggregation) return;
      const vals = filteredData
        .map((r) => Number(getNestedValue(r, col.field)))
        .filter((v) => !isNaN(v));
      if (vals.length === 0) {
        agg[col.field] = "—";
        return;
      }
      switch (col.aggregation) {
        case "sum":
          agg[col.field] = vals.reduce((a, b) => a + b, 0).toLocaleString();
          break;
        case "avg":
          agg[col.field] = (
            vals.reduce((a, b) => a + b, 0) / vals.length
          ).toFixed(2);
          break;
        case "min":
          agg[col.field] = Math.min(...vals).toLocaleString();
          break;
        case "max":
          agg[col.field] = Math.max(...vals).toLocaleString();
          break;
        case "count":
          agg[col.field] = vals.length.toLocaleString();
          break;
      }
    });
    return agg;
  }, [filteredData, normalColumns, enableAggregations]);

  const flatData = sortedData;
  const totalRows = flatData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = flatData.slice(startIndex, startIndex + rowsPerPage);
  const pinnedRowsData = useMemo(
    () =>
      sortedData.filter((row, i) => pinnedRows.has(getRowId(row as any, i))),
    [sortedData, pinnedRows, getRowId],
  );
  const selectedData = useMemo(
    () =>
      safeData.filter((row, i) => selectedRows.has(getRowId(row as any, i))),
    [safeData, selectedRows, getRowId],
  );

  // ---------- Mobile active filter count ----------
  const mobileActiveFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter((v) => {
      if (!v) return false;
      if (typeof v === "object")
        return Object.keys(v).length > 0 && (v.start || v.end);
      return v !== "";
    }).length;
  }, [activeFilters]);

  const getExportData = useCallback(
    (onlySelected: boolean, dataSource: T[]) => {
      let base = onlySelected ? selectedData : dataSource;
      if (conditionExcel) {
        const fields = Array.isArray(conditionExcel)
          ? conditionExcel
          : [conditionExcel];
        base = base.filter((row) =>
          fields.every((f) => {
            const v = getNestedValue(row, f);
            return v !== null && v !== undefined && v !== "" && v !== false;
          }),
        );
      }
      return base;
    },
    [selectedData, conditionExcel],
  );

  const getExportRows = (dataToExport: T[]) =>
    dataToExport.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        try {
          const rawVal = getNestedValue(row, col.field);
          const rv = col.renderField ? col.renderField(rawVal, row) : null;
          obj[col.headerName] =
            rv && (typeof rv === "string" || typeof rv === "number")
              ? String(rv)
              : col.getFilterValue
                ? col.getFilterValue(rawVal)
                : rawVal;
        } catch {
          obj[col.headerName] = getNestedValue(row, col.field);
        }
      });
      return obj;
    });

  const exportExcel = (dataToExport: T[]) => {
    const rows = getExportRows(dataToExport);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${title || "export"}.xlsx`);
    setShowExportMenu(false);
  };

  const exportCSV = (dataToExport: T[]) => {
    const headers = columns.map((c) => `"${c.headerName}"`).join(",");
    const rows = dataToExport
      .map((row) =>
        columns
          .map(
            (col) =>
              `"${String(getNestedValue(row, col.field) ?? "").replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${headers}\n${rows}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportJSON = (dataToExport: T[]) => {
    const rows = dataToExport.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach(
        (col) => (obj[col.field] = getNestedValue(row, col.field)),
      );
      return obj;
    });
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const printTable = () => {
    window.print();
    setShowExportMenu(false);
  };

  const resetSelection = useCallback(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
    setAllDataSelected(false);
  }, []);

  useEffect(() => {
    resetSelection();
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    if (selectedRows.size === 0) {
      setSelectAll(false);
      setAllDataSelected(false);
    } else if (
      currentRows.length > 0 &&
      currentRows.every((r, i) =>
        selectedRows.has(getRowId(r as any, startIndex + i)),
      )
    )
      setSelectAll(true);
    else setSelectAll(false);
    if (
      safeData.length > 0 &&
      safeData.every((r, i) => selectedRows.has(getRowId(r as any, i)))
    )
      setAllDataSelected(true);
    else setAllDataSelected(false);
  }, [selectedRows, currentRows, safeData, getRowId, startIndex]);

  useEffect(() => {
    if (onRowSelect) onRowSelect(selectedData);
  }, [selectedRows]);

  const handleSort = (field: string) =>
    setSortConfig((p) => {
      if (p.field === field) {
        if (p.direction === "asc") return { field, direction: "desc" };
        if (p.direction === "desc") return { field: null, direction: null };
      }
      return { field, direction: "asc" };
    });

  const setColFilter = (f: string, v: string) => {
    setColumnFilters((prev) => ({ ...prev, [f]: v }));
    setCurrentPage(1);
  };
  const clearColFilter = (f: string) => setColFilter(f, "");
  const clearAll = () => {
    setGlobalFilter("");
    setColumnFilters({});
    setCurrentPage(1);
    setSortConfig({ field: null, direction: null });
    resetSelection();
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows((prev) => {
        const n = new Set(prev);
        currentRows.forEach((r, i) =>
          n.delete(getRowId(r as any, startIndex + i)),
        );
        return n;
      });
    } else {
      setSelectedRows((prev) => {
        const n = new Set(prev);
        currentRows.forEach((r, i) =>
          n.add(getRowId(r as any, startIndex + i)),
        );
        return n;
      });
    }
  };
  const handleSelectAllRows = (onlyFiltered = false) => {
    const source = onlyFiltered ? flatData : safeData;
    if (allDataSelected) {
      resetSelection();
      onSelectAllRows?.(false, []);
    } else {
      const ids = new Set(source.map((r, i) => getRowId(r as any, i)));
      setSelectedRows(ids);
      setSelectAll(true);
      setAllDataSelected(true);
      onSelectAllRows?.(true, source);
    }
  };
  const toggleRow = (rowId: string) =>
    setSelectedRows((prev) => {
      const n = new Set(prev);
      n.has(rowId) ? n.delete(rowId) : n.add(rowId);
      return n;
    });
  const toggleColumnVisibility = (field: string) =>
    setHiddenColumns((prev) => {
      const n = new Set(prev);
      n.has(field) ? n.delete(field) : n.add(field);
      return n;
    });
  const togglePinRow = (rowId: string) =>
    setPinnedRows((prev) => {
      const n = new Set(prev);
      n.has(rowId) ? n.delete(rowId) : n.add(rowId);
      return n;
    });
  const toggleExpand = (nodeId: string) =>
    setExpandedNodes((prev) => {
      const n = new Set(prev);
      n.has(nodeId) ? n.delete(nodeId) : n.add(nodeId);
      return n;
    });
  const toggleRowExpanded = (rowId: string) =>
    setRowExpanded((prev) => {
      const n = new Set(prev);
      n.has(rowId) ? n.delete(rowId) : n.add(rowId);
      return n;
    });

  const startResize = (col: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const w =
      columnWidths[col] ||
      normalColumns.find((c) => c.field === col)?.width ||
      140;
    resizeRef.current = { col, startX: e.clientX, startW: w };
    setResizingCol(col);
  };

  const getColumnStats = (col: Column<T>) => {
    const vals = filteredData
      .map((r) => Number(getNestedValue(r, col.field)))
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return null;
    return {
      sum: vals.reduce((a, b) => a + b, 0),
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      count: vals.length,
    };
  };

  const dp = {
    comfortable: {
      cell: "13px 16px",
      header: "14px 16px 0",
      filterMargin: "8px 10px 10px",
    },
    compact: {
      cell: "7px 12px",
      header: "10px 12px 0",
      filterMargin: "5px 8px 7px",
    },
    spacious: {
      cell: "18px 20px",
      header: "18px 20px 0",
      filterMargin: "10px 12px 12px",
    },
  }[density];

  const highlight = (text: string) => {
    if (!globalFilter || !text) return text;
    const escaped = globalFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "gi");
    return (
      <>
        {text.split(re).map((p, i) =>
          re.test(p) ? (
            <mark
              key={i}
              style={{
                background: "rgba(155,34,66,0.18)",
                color: C.ruby,
                borderRadius: 2,
                padding: "0 1px",
                fontWeight: 700,
              }}
            >
              {p}
            </mark>
          ) : (
            p
          ),
        )}
      </>
    );
  };

  const getCardTitle = (row: T): string => {
    if (cardTitleField) {
      const v = getNestedValue(row, cardTitleField);
      if (v) return String(v);
    }
    const tf = columns.find(
      (c) => c.priority === 1 || c.headerName.toLowerCase().includes("nombre"),
    );
    return tf ? String(getNestedValue(row, tf.field) || "") : "—";
  };
  const getCardSubtitle = (row: T): string => {
    const sf = columns.find((c) => c.priority === 2);
    return sf ? String(getNestedValue(row, sf.field) || "") : "";
  };

  const startEdit = (rowId: string, field: string, value: string) => {
    if (!enableInlineEdit) return;
    setEditingCell({ rowId, field });
    setEditingValue(value);
  };
  const commitEdit = (row: T, rowIndex: number) => {
    if (!editingCell || !onCellEdit) {
      setEditingCell(null);
      return;
    }
    onCellEdit(row, editingCell.field, editingValue);
    setEditingCell(null);
  };
  const copyCellValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedCell(key);
    setTimeout(() => setCopiedCell(null), 1500);
  };
  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, "…", totalPages];
    if (currentPage >= totalPages - 2)
      return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [
      1,
      "…",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "…",
      totalPages,
    ];
  };

  const handleDragStart = (field: string) => setDragCol(field);
  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragOverCol(field);
  };
  const handleDrop = (targetField: string) => {
    if (!dragCol || dragCol === targetField) {
      setDragCol(null);
      setDragOverCol(null);
      return;
    }
    setColumns((prev) => {
      const cols = [...prev];
      const fromIdx = cols.findIndex((c) => c.field === dragCol);
      const toIdx = cols.findIndex((c) => c.field === targetField);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [removed] = cols.splice(fromIdx, 1);
      cols.splice(toIdx, 0, removed);
      return cols;
    });
    setDragCol(null);
    setDragOverCol(null);
  };
  const handleDragEnd = () => {
    setDragCol(null);
    setDragOverCol(null);
  };

  const saveCurrentFilter = () => {
    if (!saveFilterName.trim()) return;
    const f: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName.trim(),
      globalFilter,
      columnFilters,
      sortConfig,
      createdAt: new Date().toLocaleDateString(),
    };
    setSavedFilters((prev) => [...prev, f]);
    setSaveFilterName("");
    setShowSaveFilterModal(false);
  };
  const applyFilter = (f: SavedFilter) => {
    setGlobalFilter(f.globalFilter);
    setColumnFilters(f.columnFilters);
    setSortConfig(f.sortConfig);
    setCurrentPage(1);
    resetSelection();
    setShowFilterLibrary(false);
  };
  const deleteSavedFilter = (id: string) =>
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      setScreenSize(width < 375 ? "xs" : width < 430 ? "sm" : "md");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (mobileConfig?.quickFilters?.filters) {
      const initial: Record<string, any> = {};
      const initialActive: Record<string, any> = {};
      mobileConfig.quickFilters.filters.forEach((filter) => {
        const field = String(filter.field);
        let defaultValue = filter.defaultValue;
        if (filter.type === "date" && filter.defaultValue === "today")
          defaultValue = new Date().toISOString().split("T")[0];
        if (filter.type === "date-range" && filter.defaultRange) {
          const start = filter.defaultRange.start
            ? new Date(filter.defaultRange.start).toISOString().split("T")[0]
            : "";
          const end = filter.defaultRange.end
            ? new Date(filter.defaultRange.end).toISOString().split("T")[0]
            : "";
          if (start || end) defaultValue = { start, end };
        }
        initial[field] = defaultValue || "";
        if (
          defaultValue &&
          (typeof defaultValue !== "object" ||
            Object.keys(defaultValue).length > 0)
        )
          initialActive[field] = defaultValue;
      });
      setTempFilters(initial);
      setActiveFilters(initialActive);
      if (
        Object.keys(initialActive).length > 0 &&
        mobileConfig.quickFilters.onApply
      )
        mobileConfig.quickFilters.onApply(initialActive);
    }
  }, [mobileConfig]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(`ultratbl_${storageKey}`);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.hiddenColumns) setHiddenColumns(new Set(p.hiddenColumns));
        if (p.columnWidths) setColumnWidths(p.columnWidths);
        if (p.theme) setTheme(p.theme);
        if (p.density) setDensity(p.density);
        if (p.savedFilters) setSavedFilters(p.savedFilters);
        if (p.rowsPerPage) setRowsPerPage(p.rowsPerPage);
        if (p.globalFilter !== undefined) setGlobalFilter(p.globalFilter);
        if (p.columnFilters) setColumnFilters(p.columnFilters);
        if (p.sortConfig) setSortConfig(p.sortConfig);
        if (p.currentPage) setCurrentPage(p.currentPage);
        if (p.viewMode) setViewMode(p.viewMode);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        `ultratbl_${storageKey}`,
        JSON.stringify({
          hiddenColumns: [...hiddenColumns],
          columnWidths,
          theme,
          density,
          savedFilters,
          rowsPerPage,
          globalFilter,
          columnFilters,
          sortConfig,
          currentPage,
          viewMode,
        }),
      );
    } catch {}
  }, [
    hiddenColumns,
    columnWidths,
    theme,
    density,
    savedFilters,
    rowsPerPage,
    globalFilter,
    columnFilters,
    sortConfig,
    currentPage,
    viewMode,
  ]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "f" &&
        containerRef.current?.contains(document.activeElement)
      ) {
        e.preventDefault();
        setIsFullscreen((f) => !f);
      }
      if (e.key === "Escape") {
        setShowColumnManager(false);
        setShowExportMenu(false);
        setShowFilterLibrary(false);
        setShowGroupPanel(false);
        setShowStats(false);
        setEditingCell(null);
        if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isFullscreen]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!showColumnManager && !showExportMenu && !showFilterLibrary) return;
      const target = e.target as Node;
      const inside =
        (showColumnManager && columnManagerRef.current?.contains(target)) ||
        (showExportMenu && exportMenuRef.current?.contains(target)) ||
        (showFilterLibrary && filterLibraryRef.current?.contains(target));
      if (!inside) {
        setShowColumnManager(false);
        setShowExportMenu(false);
        setShowFilterLibrary(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showColumnManager, showExportMenu, showFilterLibrary]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      containerRef.current.style.position = "fixed";
      containerRef.current.style.inset = "0";
      containerRef.current.style.zIndex = "9999";
      containerRef.current.style.borderRadius = "0";
    } else {
      document.body.style.overflow = "";
      containerRef.current.style.position = "";
      containerRef.current.style.inset = "";
      containerRef.current.style.zIndex = "";
      containerRef.current.style.borderRadius = C.r12;
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = e.clientX - resizeRef.current.startX;
      const newW = Math.max(60, resizeRef.current.startW + delta);
      setColumnWidths((p) => ({ ...p, [resizeRef.current!.col]: newW }));
    };
    const onUp = () => {
      resizeRef.current = null;
      setResizingCol(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ---------- Mobile handlers ----------
  const handleSwipeStart = (idx: number) =>
    setSwipeData({ index: idx, offset: 0, isSwiping: true });
  const handleSwipeMove = (deltaX: number) => {
    setSwipeData((prev) => ({
      ...prev,
      offset: Math.max(-120, Math.min(120, deltaX * 0.7)),
    }));
  };
  const handleSwipeEnd = (
    row: T,
    idx: number,
    hasPerm: (p: string | string[]) => boolean,
  ) => {
    if (swipeData.index !== idx) return;
    const threshold = 60;
    const leftAction = mobileConfig?.swipeActions?.left?.[0];
    const rightAction = mobileConfig?.swipeActions?.right?.[0];
    if (swipeData.offset > threshold && leftAction) {
      if (
        !leftAction.hasPermission ||
        (Array.isArray(leftAction.hasPermission)
          ? leftAction.hasPermission.some((p) => hasPerm(p))
          : hasPerm(leftAction.hasPermission))
      )
        leftAction.action(row);
      setSwipeData({ index: null, offset: 0, isSwiping: false });
    } else if (swipeData.offset < -threshold && rightAction) {
      if (
        !rightAction.hasPermission ||
        (Array.isArray(rightAction.hasPermission)
          ? rightAction.hasPermission.some((p) => hasPerm(p))
          : hasPerm(rightAction.hasPermission))
      )
        rightAction.action(row);
      setSwipeData({ index: null, offset: 0, isSwiping: false });
    } else setSwipeData((prev) => ({ ...prev, offset: 0 }));
  };

  const handleApplyFilters = () => {
    const cleaned: Record<string, any> = {};
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value === "" || value == null) return;
      if (typeof value === "object" && value !== null) {
        if (Object.keys(value).length === 0) return;
        if (value.start || value.end) cleaned[key] = value;
      } else cleaned[key] = value;
    });
    setActiveFilters(cleaned);
    setShowFilterModal(false);
    mobileConfig?.quickFilters?.onApply?.(cleaned);
  };

  const handleClearFilters = () => {
    const empty: Record<string, any> = {};
    mobileConfig?.quickFilters?.filters?.forEach((f) => {
      empty[String(f.field)] = "";
    });
    setTempFilters(empty);
    setActiveFilters({});
    setShowFilterModal(false);
    mobileConfig?.quickFilters?.onApply?.({});
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedRowForSheet(null);
  };

  const formatDateForInput = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
      return value;
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const getDensityPadding = () =>
    ({
      xs: { compact: "p-2", comfortable: "p-3", spacious: "p-4" },
      sm: { compact: "p-2.5", comfortable: "p-3.5", spacious: "p-5" },
      md: { compact: "p-3", comfortable: "p-4", spacious: "p-6" },
    })[screenSize][mobileDensity];
  const getDensityTextSize = () =>
    ({
      xs: {
        compact: { title: "text-sm", subtitle: "text-xs" },
        comfortable: { title: "text-base", subtitle: "text-sm" },
        spacious: { title: "text-lg", subtitle: "text-base" },
      },
      sm: {
        compact: { title: "text-sm", subtitle: "text-xs" },
        comfortable: { title: "text-base", subtitle: "text-sm" },
        spacious: { title: "text-lg", subtitle: "text-base" },
      },
      md: {
        compact: { title: "text-base", subtitle: "text-sm" },
        comfortable: { title: "text-lg", subtitle: "text-base" },
        spacious: { title: "text-xl", subtitle: "text-lg" },
      },
    })[screenSize][mobileDensity];

  const renderColumnFilterInput = (col: Column<T>) => {
    const field = col.field;
    const value = columnFilters[field] || "";
    const baseStyle: React.CSSProperties = {
      border: "none",
      padding: 0,
      fontSize: 12,
      outline: "none",
      background: "transparent",
      width: "100%",
      color: C.text1,
      fontFamily: "inherit",
    };
    switch (col.filterType) {
      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setColFilter(field, e.target.value)}
            style={baseStyle}
          />
        );
      case "time":
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => setColFilter(field, e.target.value)}
            style={baseStyle}
          />
        );
      case "date-range": {
        const [startVal = "", endVal = ""] = value.split("|");
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <input
              type="date"
              value={startVal}
              onChange={(e) =>
                setColFilter(field, `${e.target.value}|${endVal}`)
              }
              style={baseStyle}
            />
            <input
              type="date"
              value={endVal}
              onChange={(e) =>
                setColFilter(field, `${startVal}|${e.target.value}`)
              }
              style={baseStyle}
            />
          </div>
        );
      }
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => setColFilter(field, e.target.value)}
            style={{ ...baseStyle, cursor: "pointer" }}
          >
            <option value="">Todos</option>
            {col.filterOptions?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "boolean":
        return (
          <select
            value={value}
            onChange={(e) => setColFilter(field, e.target.value)}
            style={{ ...baseStyle, cursor: "pointer" }}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        );
      case "number-range": {
        const [minVal = "", maxVal = ""] = value.split("|");
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              width: "100%",
            }}
          >
            <input
              type="number"
              placeholder="Min"
              value={minVal}
              onChange={(e) =>
                setColFilter(field, `${e.target.value}|${maxVal}`)
              }
              style={{ ...baseStyle, width: 56 }}
            />
            <span style={{ color: C.text3, fontSize: 10 }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxVal}
              onChange={(e) =>
                setColFilter(field, `${minVal}|${e.target.value}`)
              }
              style={{ ...baseStyle, width: 56 }}
            />
          </div>
        );
      }
      case "multi-select": {
        const selected = value ? value.split(",").filter(Boolean) : [];
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {col.filterOptions?.map((opt) => {
              const active = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const next = active
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value];
                    setColFilter(field, next.join(","));
                  }}
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 100,
                    border: `1px solid ${active ? C.ruby : C.border}`,
                    background: active ? C.ruby : C.white,
                    color: active ? "#fff" : C.text2,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
      }
      default:
        // ✅ Usa el DebouncedTextInput definido FUERA del componente
        return (
          <DebouncedTextInput
            value={value}
            onChange={(val) => setColFilter(field, val)}
            placeholder="Filtrar..."
            style={{
              ...baseStyle,
              minWidth: 80,
            }}
          />
        );
    }
  };

  // ---------- Render table rows (desktop) ----------
  const renderRows = (
    rows: T[],
    level = 0,
    indexOffset = 0,
  ): React.ReactNode[] =>
    rows.flatMap((row, idx) => {
      const globalIdx = indexOffset + idx;
      const rowId = getRowId(row as any, globalIdx);
      const hasChildren =
        childrenField &&
        Array.isArray(getNestedValue(row, childrenField)) &&
        (getNestedValue(row, childrenField) as T[]).length > 0;
      const isExpanded = hasChildren ? expandedNodes.has(rowId) : false;
      const isSelected = selectedRows.has(rowId);
      const isPinned = pinnedRows.has(rowId);
      const isFlashing = flashRow === rowId;
      const isHovered = hoveredRow === rowId;
      const isRowExpanded = rowExpanded.has(rowId);
      let bgColor = C.white;
      if (isFlashing) bgColor = C.rubyLight;
      else if (isPinned) bgColor = C.goldLight;
      else if (isSelected) bgColor = `rgba(155,34,66,0.06)`;
      else if (isExpanded) bgColor = `rgba(155,34,66,0.04)`;
      else if (isHovered && hoverable) bgColor = C.hover;
      else if (striped && idx % 2 === 1) bgColor = C.surface;

      return (
        <React.Fragment key={rowId}>
          <motion.tr
            onMouseEnter={() => setHoveredRow(rowId)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={() => hasChildren && toggleExpand(rowId)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: Math.min(idx * 0.01, 0.15) }}
            style={{
              background: bgColor,
              cursor: hasChildren ? "pointer" : "default",
              transition: "background 0.1s",
            }}
          >
            {showExpandCol && (
              <td
                style={{
                  width: 52,
                  padding: "0 4px 0 12px",
                  background: C.thead,
                  borderBottom: `2px solid ${C.theadBorder}`,
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 30,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {enableRowSelection && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(rowId)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        accentColor: C.ruby,
                        cursor: "pointer",
                        width: 14,
                        height: 14,
                      }}
                    />
                  )}
                  {hasChildren ? (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 400,
                      }}
                      style={{
                        display: "flex",
                        color: isExpanded ? C.ruby : C.text3,
                      }}
                    >
                      <FiChevronRight size={13} />
                    </motion.div>
                  ) : (
                    <div style={{ width: 13 }} />
                  )}
                </div>
              </td>
            )}
            {normalColumns.map((col) => {
              const cellKey = `${rowId}-${col.field}`;
              const isEditing =
                editingCell?.rowId === rowId &&
                editingCell?.field === col.field;
              const rawVal = getNestedValue(row, col.field);
              const rawStr = String(rawVal ?? "");
              const customStyle = col.conditionalStyle
                ? col.conditionalStyle(row)
                : {};
              return (
                <td
                  key={col.field}
                  onDoubleClick={() =>
                    col.editable !== false &&
                    startEdit(rowId, col.field, rawStr)
                  }
                  title={col.tooltip ? col.tooltip(row) : rawStr}
                  style={{
                    padding: dp.cell,
                    borderBottom: `1px solid ${C.border}`,
                    fontSize: density === "compact" ? 12 : 13,
                    color: C.text1,
                    textAlign: col.align || "left",
                    verticalAlign: "middle",
                    ...(columnWidths[col.field] || col.width
                      ? { width: columnWidths[col.field] || col.width }
                      : {}),
                    minWidth: col.minWidth || 80,
                    ...customStyle,
                  }}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey) {
                      e.stopPropagation();
                      copyCellValue(rawStr, cellKey);
                    }
                  }}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => commitEdit(row, globalIdx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(row, globalIdx);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      style={{
                        background: C.rubyLight,
                        border: `1.5px solid ${C.ruby}`,
                        borderRadius: 4,
                        color: C.text1,
                        fontSize: 12,
                        padding: "3px 7px",
                        width: "100%",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {col.renderField
                        ? col.renderField(rawVal, row)
                        : highlight(rawStr)}
                      <AnimatePresence>
                        {copiedCell === cellKey && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              color: C.green,
                              fontSize: 10,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            <FiCheck size={10} /> Copiado
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </td>
              );
            })}
            {showActionsCol && (
              <td
                style={{
                  padding: "8px 14px",
                  borderBottom: `1px solid ${C.border}`,
                  textAlign: "right",
                  position: "sticky",
                  right: 0,
                  background: "inherit",
                  zIndex: 1,
                  boxShadow: `-2px 0 8px rgba(0,0,0,0.05)`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {expandedColumns.length > 0 && (
                    <IconBtn
                      onClick={() => toggleRowExpanded(rowId)}
                      title={
                        isRowExpanded
                          ? "Ocultar columnas adicionales"
                          : "Mostrar columnas adicionales"
                      }
                      active={isRowExpanded}
                      C={C}
                    >
                      <FiEye size={12} />
                    </IconBtn>
                  )}
                  {enableRowPinning && (
                    <IconBtn
                      onClick={() => togglePinRow(rowId)}
                      title={isPinned ? "Desanclar" : "Anclar"}
                      active={isPinned}
                      C={C}
                    >
                      {isPinned ? <FiLock size={12} /> : <FiUnlock size={12} />}
                    </IconBtn>
                  )}
                  {actions && actions(row)}
                </div>
              </td>
            )}
          </motion.tr>
          <AnimatePresence>
            {isRowExpanded && expandedColumns.length > 0 && (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ background: C.surface }}
              >
                <td
                  colSpan={
                    (showExpandCol ? 1 : 0) +
                    normalColumns.length +
                    (showActionsCol ? 1 : 0)
                  }
                  style={{
                    padding: "10px 16px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                      paddingLeft: level * indentSize,
                    }}
                  >
                    {expandedColumns.map((col) => {
                      const rawVal = getNestedValue(row, col.field);
                      return (
                        <div key={col.field} style={{ minWidth: 160 }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: C.text2,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginBottom: 2,
                            }}
                          >
                            {col.headerName}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: C.text1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.renderField
                              ? col.renderField(rawVal, row)
                              : String(rawVal ?? "—")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </motion.tr>
            )}
          </AnimatePresence>
          {isExpanded &&
            childrenField &&
            renderRows(
              getNestedValue(row, childrenField) as T[],
              level + 1,
              globalIdx * 10000,
            )}
        </React.Fragment>
      );
    });

  const renderDesktopTable = () => {
    const hasAgg = normalColumns.some((c) => c.aggregation);
    const totalColumns =
      (showExpandCol ? 1 : 0) + normalColumns.length + (showActionsCol ? 1 : 0);
    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            {showExpandCol && (
              <th
                style={{
                  padding: "0 4px 0 12px",
                  borderBottom: `1px solid ${C.border}`,
                  width: 52,
                  position: "sticky",
                  left: 0,
                  background: "inherit",
                  zIndex: 1,
                }}
              >
                {enableRowSelection && (
                  <input
                    type="checkbox"
                    checked={selectAll}
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          selectedRows.size > 0 &&
                          !selectAll &&
                          !allDataSelected;
                    }}
                    onChange={handleSelectAll}
                    style={{
                      accentColor: C.ruby,
                      cursor: "pointer",
                      width: 14,
                      height: 14,
                    }}
                  />
                )}
              </th>
            )}
            {normalColumns.map((col) => {
              const isSorted = sortConfig.field === col.field;
              const hasFilter = !!columnFilters[col.field];
              const hasFixedWidth = columnWidths[col.field] || col.width;
              const isDragTarget = dragOverCol === col.field;
              const isDragging = dragCol === col.field;
              return (
                <th
                  key={col.field}
                  draggable={enableColumnReorder}
                  onDragStart={() => handleDragStart(col.field)}
                  onDragOver={(e) => handleDragOver(e, col.field)}
                  onDrop={() => handleDrop(col.field)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: 0,
                    textAlign: col.align || "left",
                    background: isDragTarget ? C.rubyLight : C.thead,
                    borderBottom: `2px solid ${isSorted ? C.ruby : C.theadBorder}`,
                    borderLeft: isDragTarget ? `2px solid ${C.ruby}` : "none",
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    ...(hasFixedWidth ? { width: hasFixedWidth } : {}),
                    minWidth: col.minWidth || 80,
                    transition: "all 0.2s",
                    opacity: isDragging ? 0.5 : 1,
                    cursor: enableColumnReorder ? "grab" : "default",
                  }}
                >
                  <div
                    style={{
                      padding: dp.header,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingRight: 28,
                      gap: 4,
                    }}
                  >
                    <button
                      onClick={() =>
                        col.sortable !== false && handleSort(col.field)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        background: "none",
                        border: "none",
                        cursor: col.sortable !== false ? "pointer" : "default",
                        padding: 0,
                        color: isSorted ? C.ruby : C.text2,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        fontFamily: "inherit",
                      }}
                    >
                      {col.headerName}
                      {col.sortable !== false && (
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            opacity: isSorted ? 1 : 0.35,
                          }}
                        >
                          <FiChevronUp
                            size={9}
                            style={{
                              color:
                                isSorted && sortConfig.direction === "asc"
                                  ? C.ruby
                                  : C.text3,
                            }}
                          />
                          <FiChevronDown
                            size={9}
                            style={{
                              color:
                                isSorted && sortConfig.direction === "desc"
                                  ? C.ruby
                                  : C.text3,
                            }}
                          />
                        </span>
                      )}
                    </button>
                    {enableGroupBy && col.groupable && (
                      <button
                        onClick={() =>
                          setGroupBy(
                            groupBy?.field === col.field
                              ? null
                              : { field: col.field, direction: "asc" },
                          )
                        }
                        title="Agrupar por esta columna"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color:
                            groupBy?.field === col.field ? C.ruby : C.text3,
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        <FiLayout size={11} />
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      margin: dp.filterMargin,
                      background: hasFilter ? C.rubyLight : C.white,
                      border: `1px solid ${hasFilter ? "rgba(155,34,66,0.25)" : C.border}`,
                      borderRadius: C.r4,
                      padding: "5px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    {col.filterType !== "date-range" &&
                      col.filterType !== "multi-select" && (
                        <FiSearch
                          size={10}
                          style={{
                            color: hasFilter ? C.ruby : C.text3,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {renderColumnFilterInput(col)}
                    </div>
                    {hasFilter && (
                      <button
                        onClick={() => clearColFilter(col.field)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          color: C.text3,
                        }}
                      >
                        <FiX size={10} />
                      </button>
                    )}
                  </div>
                  {enableColumnResize && col.resizable !== false && (
                    <div
                      onMouseDown={(e) => startResize(col.field, e)}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        cursor: "col-resize",
                        background:
                          resizingCol === col.field ? C.ruby : "transparent",
                        transition: "background 0.15s",
                        zIndex: 1,
                      }}
                    />
                  )}
                </th>
              );
            })}
            {showActionsCol && (
              <th
                style={{
                  padding: `${dp.header} 14px`,
                  textAlign: "right",
                  background: C.thead,
                  borderBottom: `2px solid ${C.theadBorder}`,
                  position: "sticky",
                  top: 0,
                  right: 0,
                  zIndex: 30,
                  boxShadow: `-2px 0 8px rgba(0,0,0,0.06)`,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.text2,
                  width: "auto",
                }}
              >
                Acciones
                <div style={{ height: 32 }} />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {enableRowPinning && pinnedRowsData.length > 0 && (
            <>
              {renderRows(pinnedRowsData, 0, 0)}
              <tr>
                <td
                  colSpan={totalColumns}
                  style={{
                    padding: "2px 16px",
                    background: C.goldLight,
                    borderBottom: `2px dashed ${C.gold}`,
                    fontSize: 10,
                    color: C.gold,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  ↑ Filas ancladas — filas normales ↓
                </td>
              </tr>
            </>
          )}
          {groupedData
            ? groupedData.map(([groupKey, groupRows]) => {
                const gPaged = groupRows.slice(0, rowsPerPage);
                const groupRowIds = groupRows.map((r, i) =>
                  getRowId(r as any, i),
                );
                const allGroupSelected = groupRowIds.every((id) =>
                  selectedRows.has(id),
                );
                const someGroupSelected = groupRowIds.some((id) =>
                  selectedRows.has(id),
                );
                const toggleGroupSel = () =>
                  setSelectedRows((prev) => {
                    const next = new Set(prev);
                    if (allGroupSelected)
                      groupRowIds.forEach((id) => next.delete(id));
                    else groupRowIds.forEach((id) => next.add(id));
                    return next;
                  });
                return (
                  <React.Fragment key={groupKey}>
                    <tr>
                      <td
                        colSpan={totalColumns}
                        style={{
                          padding: "8px 16px",
                          background: C.rubyLight,
                          borderBottom: `1px solid ${C.border}`,
                          borderTop: `2px solid rgba(155,34,66,0.15)`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {enableGroupSelection && (
                            <input
                              type="checkbox"
                              checked={allGroupSelected}
                              ref={(el) => {
                                if (el)
                                  el.indeterminate =
                                    someGroupSelected && !allGroupSelected;
                              }}
                              onChange={toggleGroupSel}
                              style={{
                                accentColor: C.ruby,
                                cursor: "pointer",
                                width: 14,
                                height: 14,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              color: C.ruby,
                            }}
                          >
                            {columns.find((c) => c.field === groupBy?.field)
                              ?.headerName || groupBy?.field}
                            :
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: C.text1,
                            }}
                          >
                            {groupKey}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: C.text3,
                              marginLeft: 4,
                            }}
                          >
                            ({groupRows.length} registros
                            {someGroupSelected && (
                              <span style={{ color: C.ruby, fontWeight: 700 }}>
                                {" "}
                                ·{" "}
                                {
                                  groupRowIds.filter((id) =>
                                    selectedRows.has(id),
                                  ).length
                                }{" "}
                                sel.
                              </span>
                            )}
                            )
                          </span>
                        </div>
                      </td>
                    </tr>
                    {renderRows(gPaged, 0, 0)}
                  </React.Fragment>
                );
              })
            : renderRows(currentRows, 0, startIndex)}
        </tbody>
        {hasAgg && enableAggregations && (
          <tfoot>
            <tr style={{ background: C.thead }}>
              {showExpandCol && (
                <td style={{ borderTop: `2px solid ${C.theadBorder}` }} />
              )}
              {normalColumns.map((col) => {
                const agg = aggregations[col.field];
                return (
                  <td
                    key={col.field}
                    style={{
                      padding: "10px 16px",
                      borderTop: `2px solid ${C.theadBorder}`,
                      fontSize: 12,
                      fontWeight: 700,
                      color: agg ? C.ruby : C.text3,
                      textAlign: col.align || "left",
                      ...(columnWidths[col.field] || col.width
                        ? { width: columnWidths[col.field] || col.width }
                        : {}),
                      minWidth: col.minWidth || 80,
                    }}
                  >
                    {agg ? (
                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: C.text3,
                            marginBottom: 2,
                          }}
                        >
                          {col.aggregation}
                        </div>
                        {agg}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                );
              })}
              {showActionsCol && (
                <td style={{ borderTop: `2px solid ${C.theadBorder}` }} />
              )}
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  const renderDesktopCards = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        gap: 16,
        padding: 24,
        background: C.pageBg,
      }}
    >
      {currentRows.map((row, idx) => {
        const rowId = getRowId(row as any, startIndex + idx);
        const isSelected = selectedRows.has(rowId);
        return (
          <motion.div
            key={rowId}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: Math.min(idx * 0.04, 0.3),
              type: "spring",
              stiffness: 280,
              damping: 22,
            }}
            whileHover={{ y: -4, boxShadow: C.shadowHover }}
            onClick={() => enableRowSelection && toggleRow(rowId)}
            style={{
              background: C.white,
              borderRadius: C.r8,
              border: `2px solid ${isSelected ? C.ruby : C.border}`,
              overflow: "hidden",
              boxShadow: C.shadow,
              cursor: enableRowSelection ? "pointer" : "default",
              transition: "border-color 0.2s",
            }}
          >
            <div
              style={{
                height: 3,
                background: `linear-gradient(90deg, ${C.ruby}, ${C.rubyMid})`,
              }}
            />
            <div
              style={{
                padding: "15px 17px 13px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}
                >
                  {getCardTitle(row)}
                </div>
                {getCardSubtitle(row) && (
                  <div style={{ fontSize: 12, color: C.text2 }}>
                    {getCardSubtitle(row)}
                  </div>
                )}
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isSelected ? C.ruby : C.rubyLight,
                  border: `1.5px solid rgba(155,34,66,0.18)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: isSelected ? "#fff" : C.ruby,
                  transition: "all 0.2s",
                }}
              >
                {isSelected ? (
                  <FiCheck size={14} />
                ) : (
                  String(getCardTitle(row)).charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div style={{ padding: "11px 17px 13px" }}>
              {normalColumns.slice(0, 5).map((col, ci) => (
                <div
                  key={col.field}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    gap: 10,
                    borderBottom:
                      ci < Math.min(normalColumns.length - 1, 4)
                        ? `1px solid ${C.border}`
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.text3,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                    }}
                  >
                    {col.headerName}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.text2,
                      fontWeight: 500,
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "55%",
                    }}
                  >
                    {col.renderField
                      ? col.renderField(getNestedValue(row, col.field), row)
                      : String(getNestedValue(row, col.field) ?? "—")}
                  </span>
                </div>
              ))}
            </div>
            {actions && (
              <div
                style={{
                  padding: "9px 13px 11px",
                  borderTop: `1px solid ${C.border}`,
                  display: "flex",
                  justifyContent: "flex-end",
                  background: C.surface,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", gap: 5 }}>{actions(row)}</div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  const renderDesktopCompact = () => (
    <div style={{ padding: "8px 16px" }}>
      {currentRows.map((row, idx) => {
        const rowId = getRowId(row as any, startIndex + idx);
        const isSelected = selectedRows.has(rowId);
        const isHovered = hoveredRow === rowId;
        return (
          <motion.div
            key={rowId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(idx * 0.01, 0.1) }}
            onMouseEnter={() => setHoveredRow(rowId)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={() => enableRowSelection && toggleRow(rowId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 10px",
              borderRadius: C.r6,
              background: isSelected
                ? C.rubyLight
                : isHovered
                  ? C.hover
                  : "transparent",
              border: `1px solid ${isSelected ? "rgba(155,34,66,0.2)" : "transparent"}`,
              cursor: "pointer",
              transition: "all 0.12s",
              marginBottom: 2,
            }}
          >
            {enableRowSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleRow(rowId)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  accentColor: C.ruby,
                  cursor: "pointer",
                  width: 13,
                  height: 13,
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: C.rubyLight,
                border: `1.5px solid rgba(155,34,66,0.18)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: C.ruby,
                flexShrink: 0,
              }}
            >
              {String(getCardTitle(row)).charAt(0).toUpperCase()}
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(normalColumns.length, 4)}, 1fr)`,
                gap: 8,
              }}
            >
              {normalColumns.slice(0, 4).map((col) => (
                <div key={col.field} style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.text3,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {col.headerName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.text1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.renderField
                      ? col.renderField(getNestedValue(row, col.field), row)
                      : String(getNestedValue(row, col.field) ?? "—")}
                  </div>
                </div>
              ))}
            </div>
            {actions && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ flexShrink: 0, display: "flex", gap: 4 }}
              >
                {actions(row)}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // ---------- Mobile views ----------
  const renderMobileListView = () => {
    // Acciones por defecto si no se pasan: editar (izq, naranja) y eliminar (der, rojo)
    const defaultLeftAction = {
      icon: <FiEdit2 size={20} color="#fff" />,
      color: "#ea580c",
      label: "Editar",
      action: (_row: T) => {},
    };
    const defaultRightAction = {
      icon: <FiTrash2 size={20} color="#fff" />,
      color: "#dc2626",
      label: "Eliminar",
      action: (_row: T) => {},
    };

    const leftAction =
      mobileConfig?.swipeActions?.left?.[0] ?? defaultLeftAction;
    const rightAction =
      mobileConfig?.swipeActions?.right?.[0] ?? defaultRightAction;
    const hasSwipeActions =
      mobileConfig?.swipeActions?.left?.length ||
      mobileConfig?.swipeActions?.right?.length ||
      true; // always show hints

    const padding = getDensityPadding();
    const textSize = getDensityTextSize();
    return (
      <motion.div
        style={{
          padding: screenSize === "xs" ? 8 : 12,
          background: "#f5f5f8",
          minHeight: "fit-content",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="popLayout">
          {currentRows.map((row, idx) => {
            const isBeingSwiped = swipeData.index === idx;
            const swipeOffset = isBeingSwiped ? swipeData.offset : 0;
            const showLeft = swipeOffset > 20;
            const showRight = swipeOffset < -20;

            return (
              <motion.div
                key={idx}
                style={{ position: "relative", marginBottom: 10 }}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -100 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  delay: idx * 0.04,
                }}
              >
                {/* === FONDO IZQUIERDO (editar) === */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    background: leftAction.color,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 20,
                    opacity: showLeft ? Math.min(swipeOffset / 80, 1) : 0,
                    transition: "opacity 0.1s",
                    zIndex: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {leftAction.icon}
                    {leftAction.label && (
                      <span
                        style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}
                      >
                        {leftAction.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* === FONDO DERECHO (eliminar) === */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    background: rightAction.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 20,
                    opacity: showRight ? Math.min(-swipeOffset / 80, 1) : 0,
                    transition: "opacity 0.1s",
                    zIndex: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {rightAction.icon}
                    {rightAction.label && (
                      <span
                        style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}
                      >
                        {rightAction.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* === TARJETA PRINCIPAL (deslizable) === */}
                <motion.div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    background: "#ffffff",
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid #e8e8ed",
                    boxShadow: isBeingSwiped
                      ? "0 10px 30px rgba(0,0,0,0.15)"
                      : "0 1px 4px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)",
                    x: swipeOffset,
                    cursor: "grab",
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragStart={() => handleSwipeStart(idx)}
                  onDrag={(_, info) => handleSwipeMove(info.offset.x)}
                  onDragEnd={() => handleSwipeEnd(row, idx, () => true)}
                  whileTap={{ cursor: "grabbing" }}
                >
                  {/* Barra superior ruby */}
                  <div
                    style={{
                      height: 3,
                      background: "linear-gradient(90deg, #9B2242, #b52a4f)",
                    }}
                  />

                  <div
                    style={{
                      padding:
                        mobileDensity === "compact"
                          ? "10px 14px"
                          : mobileDensity === "spacious"
                            ? "18px 20px"
                            : "14px 16px",
                    }}
                    onClick={() => {
                      if (mobileConfig?.onTileTap) mobileConfig.onTileTap(row);
                      else if (mobileConfig?.bottomSheet) {
                        setSelectedRowForSheet(row);
                        setShowBottomSheet(true);
                      }
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      {mobileConfig?.listTile?.leading && (
                        <div style={{ flexShrink: 0 }}>
                          {mobileConfig.listTile.leading(row)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 3,
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                mobileDensity === "compact"
                                  ? 14
                                  : mobileDensity === "spacious"
                                    ? 18
                                    : 16,
                              fontWeight: 700,
                              color: "#1a1a24",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {mobileConfig?.listTile?.title
                              ? mobileConfig.listTile.title(row)
                              : getCardTitle(row)}
                          </div>
                          {mobileConfig?.listTile?.trailing && (
                            <div style={{ flexShrink: 0, marginLeft: 10 }}>
                              {mobileConfig.listTile.trailing(row)}
                            </div>
                          )}
                        </div>
                        {mobileConfig?.listTile?.subtitle && (
                          <div
                            style={{
                              fontSize: mobileDensity === "compact" ? 12 : 14,
                              color: "#5a5a72",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {mobileConfig.listTile.subtitle(row)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Swipe hint strip al fondo */}
                  {!isBeingSwiped && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 12px 6px",
                        borderTop: "1px solid #f0f0f4",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            background: leftAction.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiEdit2 size={10} color="#fff" />
                        </div>
                        <span style={{ fontSize: 10, color: "#9898b0" }}>
                          desliza →
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#9898b0" }}>
                          ← desliza
                        </span>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            background: rightAction.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiTrash2 size={10} color="#fff" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderMobileCompactListView = () => (
    <motion.div
      style={{ padding: screenSize === "xs" ? 8 : 12, background: "#f5f5f8" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #e8e8ed",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        <AnimatePresence>
          {currentRows.map((row, idx) => (
            <motion.div
              key={idx}
              style={{
                borderBottom:
                  idx < currentRows.length - 1 ? "1px solid #f0f0f4" : "none",
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, type: "spring", stiffness: 400 }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fdf4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => {
                  if (mobileConfig?.onTileTap) mobileConfig.onTileTap(row);
                  else if (mobileConfig?.bottomSheet) {
                    setSelectedRowForSheet(row);
                    setShowBottomSheet(true);
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {mobileConfig?.listTile?.leading && (
                      <div style={{ flexShrink: 0, opacity: 0.8 }}>
                        {mobileConfig.listTile.leading(row)}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a24",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {mobileConfig?.listTile?.title
                        ? mobileConfig.listTile.title(row)
                        : getCardTitle(row)}
                    </div>
                  </div>
                  {mobileConfig?.listTile?.trailing && (
                    <div style={{ flexShrink: 0 }}>
                      {mobileConfig.listTile.trailing(row)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderMobileCardsView = () => (
    <motion.div
      style={{
        display: "grid",
        gridTemplateColumns: screenSize === "xs" ? "1fr" : "1fr 1fr",
        gap: 14,
        padding: screenSize === "xs" ? 8 : 14,
        background: "#f5f5f8",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {currentRows.map((row, idx) => (
        <motion.div
          key={idx}
          style={{
            background: "#fff",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid #e8e8ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: idx * 0.06,
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          whileHover={{
            y: -6,
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (mobileConfig?.onTileTap) mobileConfig.onTileTap(row);
            else if (mobileConfig?.bottomSheet) {
              setSelectedRowForSheet(row);
              setShowBottomSheet(true);
            }
          }}
        >
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, #9B2242, #b52a4f)",
            }}
          />
          <div
            style={{ padding: getDensityPadding().replace("p-", "") + "px" }}
          >
            {mobileConfig?.listTile?.leading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                  paddingTop: 6,
                }}
              >
                <div
                  style={{
                    background: "#f5f5f8",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  {mobileConfig.listTile.leading(row)}
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1a1a24",
                textAlign: "center",
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {mobileConfig?.listTile?.title
                ? mobileConfig.listTile.title(row)
                : getCardTitle(row)}
            </div>
            {mobileConfig?.listTile?.subtitle && (
              <div
                style={{
                  fontSize: 13,
                  color: "#5a5a72",
                  textAlign: "center",
                  marginBottom: 10,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {mobileConfig.listTile.subtitle(row)}
              </div>
            )}
            {mobileConfig?.listTile?.trailing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 10,
                  borderTop: "1px solid #f0f0f4",
                }}
              >
                {mobileConfig.listTile.trailing(row)}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderMobileMiniCardsView = () => (
    <motion.div
      style={{
        display: "grid",
        gridTemplateColumns: screenSize === "xs" ? "1fr 1fr" : "1fr 1fr 1fr",
        gap: 10,
        padding: screenSize === "xs" ? 8 : 12,
        background: "#f5f5f8",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {currentRows.map((row, idx) => (
        <motion.div
          key={idx}
          style={{
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #e8e8ed",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: idx * 0.04,
            type: "spring",
            damping: 20,
            stiffness: 400,
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (mobileConfig?.onTileTap) mobileConfig.onTileTap(row);
            else if (mobileConfig?.bottomSheet) {
              setSelectedRowForSheet(row);
              setShowBottomSheet(true);
            }
          }}
        >
          <div style={{ height: 2, background: "#9B2242" }} />
          <div style={{ padding: 12 }}>
            {mobileConfig?.listTile?.leading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 8,
                  background: "#f5f5f8",
                  borderRadius: 10,
                  padding: 8,
                }}
              >
                {mobileConfig.listTile.leading(row)}
              </div>
            )}
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1a1a24",
                textAlign: "center",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 32,
              }}
            >
              {mobileConfig?.listTile?.title
                ? mobileConfig.listTile.title(row)
                : getCardTitle(row)}
            </div>
            {mobileConfig?.listTile?.trailing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f4",
                }}
              >
                {mobileConfig.listTile.trailing(row)}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderMobileTimelineView = () => (
    <motion.div
      style={{ padding: screenSize === "xs" ? 12 : 16, background: "#f5f5f8" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 2,
            left: 27,
            background:
              "linear-gradient(to bottom, #9B2242, rgba(155,34,66,0.1))",
            borderRadius: 2,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {currentRows.map((row, idx) => (
            <motion.div
              key={idx}
              style={{ display: "flex", gap: 14 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, type: "spring", stiffness: 300 }}
              onClick={() => {
                if (mobileConfig?.onTileTap) mobileConfig.onTileTap(row);
                else if (mobileConfig?.bottomSheet) {
                  setSelectedRowForSheet(row);
                  setShowBottomSheet(true);
                }
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 28,
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#9B2242",
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 2px rgba(155,34,66,0.3)",
                  }}
                />
              </div>
              <motion.div
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid #e8e8ed",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                }}
                whileHover={{ x: 4, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {mobileConfig?.listTile?.leading && (
                    <div style={{ flexShrink: 0 }}>
                      {mobileConfig.listTile.leading(row)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a1a24",
                        marginBottom: 3,
                      }}
                    >
                      {mobileConfig?.listTile?.title
                        ? mobileConfig.listTile.title(row)
                        : getCardTitle(row)}
                    </div>
                    {mobileConfig?.listTile?.subtitle && (
                      <div style={{ fontSize: 13, color: "#5a5a72" }}>
                        {mobileConfig.listTile.subtitle(row)}
                      </div>
                    )}
                    {mobileConfig?.listTile?.trailing && (
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: "1px solid #f0f0f4",
                        }}
                      >
                        {mobileConfig.listTile.trailing(row)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderMobileDetailedListView = () => (
    <motion.div
      style={{ padding: screenSize === "xs" ? 12 : 16, background: "#f5f5f8" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {currentRows.map((row, idx) => {
          const isExpanded = activeDetails === idx;
          return (
            <motion.div
              key={idx}
              style={{ position: "relative", marginBottom: 14 }}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                delay: idx * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <motion.div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid #e8e8ed",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                }}
                layout
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    background: "#9B2242",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveDetails(isExpanded ? null : idx)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {mobileConfig?.listTile?.leading ? (
                          <div style={{ color: "#fff" }}>
                            {mobileConfig.listTile.leading(row)}
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 17,
                            }}
                          >
                            {String(
                              mobileConfig?.listTile?.title
                                ? mobileConfig.listTile.title(row)
                                : getCardTitle(row),
                            ).charAt(0)}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {mobileConfig?.listTile?.title
                            ? mobileConfig.listTile.title(row)
                            : getCardTitle(row)}
                        </div>
                        {mobileConfig?.listTile?.subtitle && (
                          <div
                            style={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.75)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {mobileConfig.listTile.subtitle(row)}
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      style={{ color: "#fff", flexShrink: 0 }}
                    >
                      <FiChevronDown size={22} />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid #f0f0f4",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          {columns.slice(0, 2).map((col) => (
                            <div
                              key={String(col.field)}
                              style={{
                                background: "#f5f5f8",
                                borderRadius: 12,
                                padding: 12,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#9898b0",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  marginBottom: 4,
                                }}
                              >
                                {col.headerName}
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#1a1a24",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {col.renderField
                                  ? col.renderField(
                                      getNestedValue(row, col.field),
                                      row,
                                    )
                                  : String(
                                      getNestedValue(row, col.field) ?? "-",
                                    )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                          }}
                        >
                          {columns.slice(2, 6).map((col, i, arr) => (
                            <div
                              key={String(col.field)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom:
                                  i < arr.length - 1
                                    ? "1px solid #f0f0f4"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#5a5a72",
                                  fontWeight: 500,
                                }}
                              >
                                {col.headerName}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#1a1a24",
                                  fontWeight: 600,
                                  textAlign: "right",
                                  maxWidth: "55%",
                                }}
                              >
                                {col.renderField
                                  ? col.renderField(
                                      getNestedValue(row, col.field),
                                      row,
                                    )
                                  : String(
                                      getNestedValue(row, col.field) ?? "-",
                                    )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => {
                            if (mobileConfig?.onTileTap)
                              mobileConfig.onTileTap(row);
                            else if (mobileConfig?.bottomSheet) {
                              setSelectedRowForSheet(row);
                              setShowBottomSheet(true);
                            }
                          }}
                          style={{
                            width: "100%",
                            background: "#9B2242",
                            color: "#fff",
                            fontWeight: 700,
                            padding: "12px 0",
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <FiEye size={16} /> Ver completo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isExpanded && (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderTop: "1px solid #f0f0f4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: 14 }}>
                      {columns
                        .slice(0, 2)
                        .filter((col) => getNestedValue(row, col.field) != null)
                        .map((col, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: 4,
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#9898b0" }}>
                              {col.headerName}:
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#1a1a24",
                                fontWeight: 600,
                                maxWidth: 80,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col.renderField
                                ? col.renderField(
                                    getNestedValue(row, col.field),
                                    row,
                                  )
                                : String(
                                    getNestedValue(row, col.field),
                                  ).substring(0, 15)}
                            </span>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => {
                        if (mobileConfig?.onTileTap)
                          mobileConfig.onTileTap(row);
                        else if (mobileConfig?.bottomSheet) {
                          setSelectedRowForSheet(row);
                          setShowBottomSheet(true);
                        }
                      }}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#9B2242",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Ver →
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );

  // ---------- Dropdowns (desktop) ----------
  const renderColumnManager = () => (
    <AnimatePresence>
      {showColumnManager && (
        <motion.div
          ref={columnManagerRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          style={{
            position: "absolute",
            top: 50,
            right: 16,
            zIndex: 100,
            background: C.surfaceElevated,
            border: `1px solid ${C.border}`,
            borderRadius: C.r8,
            padding: 16,
            width: 240,
            boxShadow: C.shadowMd,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.text1,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Columnas visibles
            <button
              onClick={() => setHiddenColumns(new Set())}
              style={{
                fontSize: 10,
                color: C.ruby,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Mostrar todas
            </button>
          </div>
          {columns.map((col) => (
            <label
              key={col.field}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                cursor: "pointer",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <input
                type="checkbox"
                checked={!hiddenColumns.has(col.field)}
                onChange={() => toggleColumnVisibility(col.field)}
                style={{ accentColor: C.ruby, width: 13, height: 13 }}
              />
              <span style={{ fontSize: 12, color: C.text1, fontWeight: 500 }}>
                {col.headerName}
              </span>
            </label>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderExportMenu = () => (
    <AnimatePresence>
      {showExportMenu && (
        <motion.div
          ref={exportMenuRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          style={{
            position: "absolute",
            top: 50,
            right: 16,
            zIndex: 100,
            background: C.surfaceElevated,
            border: `1px solid ${C.border}`,
            borderRadius: C.r8,
            padding: 8,
            width: 220,
            boxShadow: C.shadowMd,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.text3,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              padding: "4px 12px",
            }}
          >
            Todos los datos ({sortedData.length})
          </div>
          {[
            {
              icon: <RiFileExcelFill size={14} />,
              label: "Excel (.xlsx)",
              action: () => exportExcel(getExportData(false, sortedData)),
              color: C.green,
            },
            {
              icon: <RiFileExcelFill size={14} />,
              label: "CSV (.csv)",
              action: () => exportCSV(getExportData(false, sortedData)),
              color: C.blue,
            },
            {
              icon: <RiFileTextLine size={14} />,
              label: "JSON (.json)",
              action: () => exportJSON(getExportData(false, sortedData)),
              color: C.gold,
            },
            {
              icon: <FiPrinter size={14} />,
              label: "Imprimir",
              action: printTable,
              color: C.text2,
            },
          ].map((opt) => (
            <ExportBtn key={opt.label} {...opt} C={C} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderFilterLibrary = () => (
    <AnimatePresence>
      {showFilterLibrary && (
        <motion.div
          ref={filterLibraryRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          style={{
            position: "absolute",
            top: 50,
            right: 16,
            zIndex: 100,
            background: C.surfaceElevated,
            border: `1px solid ${C.border}`,
            borderRadius: C.r8,
            padding: 16,
            width: 280,
            boxShadow: C.shadowMd,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.text1,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Filtros guardados
            <button
              onClick={() => setShowSaveFilterModal((p) => !p)}
              style={{
                background: C.rubyLight,
                border: "none",
                borderRadius: C.r4,
                color: C.ruby,
                fontSize: 10,
                fontWeight: 700,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              + Guardar actual
            </button>
          </div>
          <AnimatePresence>
            {showSaveFilterModal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden", marginBottom: 12 }}
              >
                <div
                  style={{
                    padding: 10,
                    background: C.rubyLight,
                    borderRadius: C.r6,
                    border: `1px solid rgba(155,34,66,0.2)`,
                  }}
                >
                  <input
                    autoFocus
                    placeholder="Nombre del filtro…"
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCurrentFilter()}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: C.text1,
                      fontSize: 12,
                      fontFamily: "inherit",
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={saveCurrentFilter}
                      style={{
                        flex: 1,
                        background: C.ruby,
                        border: "none",
                        borderRadius: C.r4,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "5px 0",
                        cursor: "pointer",
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setShowSaveFilterModal(false)}
                      style={{
                        flex: 1,
                        background: C.border,
                        border: "none",
                        borderRadius: C.r4,
                        color: C.text2,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 0",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {savedFilters.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
                color: C.text3,
                fontSize: 12,
              }}
            >
              No hay filtros guardados
            </div>
          ) : (
            savedFilters.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 700, color: C.text1 }}
                  >
                    {f.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.text3 }}>
                    {f.createdAt}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => applyFilter(f)}
                    style={{
                      background: C.rubyLight,
                      border: "none",
                      borderRadius: C.r4,
                      color: C.ruby,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => deleteSavedFilter(f.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.text3,
                      padding: 2,
                      display: "flex",
                    }}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderStats = () => (
    <AnimatePresence>
      {showStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{ overflow: "hidden", borderBottom: `1px solid ${C.border}` }}
        >
          <div
            style={{
              padding: "12px 20px",
              background: C.pageBg,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {normalColumns
              .filter((col) => getColumnStats(col) !== null)
              .map((col) => {
                const stats = getColumnStats(col);
                if (!stats) return null;
                return (
                  <div
                    key={col.field}
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: C.r6,
                      padding: "10px 14px",
                      minWidth: 140,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.ruby,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 6,
                      }}
                    >
                      {col.headerName}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 4,
                      }}
                    >
                      {[
                        ["Suma", stats.sum.toLocaleString()],
                        ["Promedio", stats.avg.toFixed(1)],
                        ["Min", stats.min.toLocaleString()],
                        ["Max", stats.max.toLocaleString()],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.text3,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: C.text1,
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ---------- Mobile overlays ----------
  const renderFilterModalMobile = () => {
    if (!showFilterModal || !mobileConfig?.quickFilters?.filters) return null;
    return (
      <AnimatePresence>
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setShowFilterModal(false)}
          />
          <motion.div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "18px 18px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
              width: "100%",
              maxWidth: 520,
              maxHeight: "85vh",
              overflow: "hidden",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 4,
                  background: "#e8e8ed",
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #f0f0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 16, fontWeight: 800, color: "#1a1a24" }}
                >
                  Filtros
                </div>
                {mobileActiveFilterCount > 0 && (
                  <div
                    style={{ fontSize: 12, color: "#9B2242", fontWeight: 600 }}
                  >
                    {mobileActiveFilterCount} activo
                    {mobileActiveFilterCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "#f5f5f8",
                  border: "none",
                  cursor: "pointer",
                  color: "#5a5a72",
                }}
              >
                <FiX size={16} />
              </button>
            </div>
            <div
              style={{
                padding: "16px 20px",
                overflowY: "auto",
                maxHeight: "calc(85vh - 160px)",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {mobileConfig.quickFilters.filters.map((filter) => {
                  const field = String(filter.field);
                  const col = columns.find((c) => c.field === field);
                  let defaultValue = filter.defaultValue;
                  if (filter.type === "date" && filter.defaultValue === "today")
                    defaultValue = new Date().toISOString().split("T")[0];
                  const currentValue =
                    tempFilters[field] !== undefined
                      ? tempFilters[field]
                      : defaultValue;
                  return (
                    <div
                      key={field}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a1a24",
                          }}
                        >
                          {filter.label || col?.headerName || field}
                        </label>
                        <div style={{ display: "flex", gap: 6 }}>
                          {filter.showTodayButton && filter.type === "date" && (
                            <button
                              type="button"
                              onClick={() =>
                                setTempFilters((prev) => ({
                                  ...prev,
                                  [field]: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                }))
                              }
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              Hoy
                            </button>
                          )}
                          {currentValue && (
                            <button
                              type="button"
                              onClick={() =>
                                setTempFilters((prev) => ({
                                  ...prev,
                                  [field]: "",
                                }))
                              }
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                background: "#f5f5f8",
                                color: "#5a5a72",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FiX size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                      {renderFilterInputMobile(filter, field, currentValue)}
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #f0f0f4",
                display: "flex",
                gap: 10,
                background: "#fff",
              }}
            >
              <button
                onClick={handleClearFilters}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "#f5f5f8",
                  color: "#5a5a72",
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Limpiar
              </button>
              <button
                onClick={handleApplyFilters}
                style={{
                  flex: 2,
                  padding: "12px 0",
                  background: "#9B2242",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderFilterInputMobile = (
    filterConfig: any,
    field: string,
    currentValue: any,
  ) => {
    const inputStyle: React.CSSProperties = {
      width: "100%",
      border: "1.5px solid #e8e8ed",
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 14,
      outline: "none",
      background: "#f5f5f8",
      color: "#1a1a24",
      fontFamily: "inherit",
      boxSizing: "border-box",
    };
    switch (filterConfig.type) {
      case "date":
        return (
          <input
            type="date"
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={inputStyle}
          />
        );
      case "time":
        return (
          <input
            type="time"
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={inputStyle}
          />
        );
      case "datetime":
        return (
          <input
            type="datetime-local"
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={inputStyle}
          />
        );
      case "date-range": {
        const range = currentValue || { start: "", end: "" };
        const presets = filterConfig.presets || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {presets.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {presets.map((preset: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        [field]: {
                          start: formatDateForInput(preset.start),
                          end: formatDateForInput(preset.end),
                        },
                      }))
                    }
                    style={{
                      padding: "5px 10px",
                      fontSize: 12,
                      background: "#f5f5f8",
                      color: "#5a5a72",
                      borderRadius: 8,
                      border: "1px solid #e8e8ed",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 11, color: "#9898b0", fontWeight: 600 }}
                >
                  Desde
                </label>
                <input
                  type="date"
                  value={range.start || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      [field]: { ...range, start: e.target.value },
                    }))
                  }
                  style={{ ...inputStyle, padding: "10px 12px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 11, color: "#9898b0", fontWeight: 600 }}
                >
                  Hasta
                </label>
                <input
                  type="date"
                  value={range.end || ""}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      [field]: { ...range, end: e.target.value },
                    }))
                  }
                  style={{ ...inputStyle, padding: "10px 12px" }}
                />
              </div>
            </div>
          </div>
        );
      }
      case "select":
        return (
          <select
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Todos</option>
            {filterConfig.options?.map((opt: any, i: number) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  [field]: e.target.checked,
                }))
              }
              style={{ width: 20, height: 20, accentColor: "#9B2242" }}
            />
            <span style={{ fontSize: 14, color: "#1a1a24" }}>
              {filterConfig.placeholder || "Activar filtro"}
            </span>
          </label>
        );
      case "number":
        return (
          <input
            type="number"
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={inputStyle}
            placeholder={filterConfig.placeholder}
          />
        );
      default:
        return (
          <input
            type="text"
            value={currentValue || ""}
            onChange={(e) =>
              setTempFilters((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={inputStyle}
            placeholder={
              filterConfig.placeholder ||
              `Buscar por ${filterConfig.label || field}...`
            }
          />
        );
    }
  };

  const renderActiveFiltersChips = () => {
    if (
      !mobileConfig?.quickFilters?.filters ||
      Object.keys(activeFilters).length === 0
    )
      return null;
    const chips = mobileConfig.quickFilters.filters
      .map((filter) => {
        const field = String(filter.field);
        const value = activeFilters[field];
        if (
          !value ||
          (typeof value === "object" && Object.keys(value).length === 0)
        )
          return null;
        const col = columns.find((c) => c.field === field);
        let displayValue = value;
        if (filter.type === "date-range") {
          if (!value?.start || !value?.end) return null;
          const startDate = new Date(value.start);
          const endDate = new Date(value.end);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
            return null;
          displayValue = `${startDate.toLocaleDateString("es-ES", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}`;
        } else if (filter.type === "date") {
          const date = new Date(value);
          if (!isNaN(date.getTime()))
            displayValue = date.toLocaleDateString("es-ES", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            });
        } else if (filter.type === "select") {
          const opt = filter.options?.find(
            (o) => String(o.value) === String(value),
          );
          if (opt) displayValue = opt.label;
        }
        const chipLabel = filter.label || col?.headerName || field;
        return (
          <div
            key={field}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#9B2242",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 0.8 }}>{chipLabel}:</span>
            <span
              style={{
                maxWidth: 80,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {String(displayValue)}
            </span>
            <button
              onClick={() => {
                const newTemp = { ...tempFilters, [field]: "" };
                setTempFilters(newTemp);
                const newActive = { ...activeFilters };
                delete newActive[field];
                setActiveFilters(newActive);
                mobileConfig?.quickFilters?.onApply?.(newActive);
              }}
              style={{
                marginLeft: 2,
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.8)",
                padding: 0,
              }}
            >
              <FiX size={11} />
            </button>
          </div>
        );
      })
      .filter(Boolean);

    if (chips.length === 0) return null;
    return (
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          marginTop: 8,
          scrollbarWidth: "none",
        }}
      >
        {chips}
        {chips.length > 1 && (
          <button
            onClick={handleClearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "5px 10px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              border: "1px solid #e8e8ed",
              background: "#fff",
              color: "#5a5a72",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <FiX size={10} /> Limpiar
          </button>
        )}
      </div>
    );
  };

  const renderBottomSheet = () => {
    if (!showBottomSheet || !selectedRowForSheet || !mobileConfig?.bottomSheet)
      return null;
    return (
      <AnimatePresence>
        <motion.div
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
            }}
            onClick={closeBottomSheet}
          />
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              maxHeight: mobileConfig.bottomSheet.height || "80vh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 6,
                  background: "#e8e8ed",
                  borderRadius: 3,
                }}
              />
            </div>
            {(mobileConfig.bottomSheet.showCloseButton ?? true) && (
              <button
                onClick={closeBottomSheet}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 12,
                  padding: 8,
                  background: "#f5f5f8",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiX size={20} />
              </button>
            )}
            <div style={{ padding: "0 16px 24px" }}>
              {mobileConfig.bottomSheet.builder(
                selectedRowForSheet,
                closeBottomSheet,
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ==================== MOBILE SETTINGS PANEL ====================
  const MOBILE_VIEW_OPTIONS: {
    value: MobileViewMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    // { value: "list", label: "Lista", icon: <FiList size={18} /> },
    // { value: "compact-list", label: "Compacta", icon: <FiMenu size={18} /> },
    // { value: "cards", label: "Tarjetas", icon: <FiGrid size={18} /> },
    // { value: "mini-cards", label: "Cuadrícula", icon: <FiGrid size={14} /> },
    // { value: "timeline", label: "Timeline", icon: <FiList size={18} /> },
    // { value: "detailed-list", label: "Detalles", icon: <FiEye size={18} /> },
  ];

  const renderMobileSettings = () => {
    if (!showMobileSettings) return null;
    return (
      <AnimatePresence>
        <motion.div
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
            }}
            onClick={() => setShowMobileSettings(false)}
          />
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div style={{ padding: "0 20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 12,
                  paddingBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 4,
                    background: "#e8e8ed",
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{ fontSize: 17, fontWeight: 800, color: "#1a1a24" }}
                >
                  Vista de tabla
                </div>
                <button
                  onClick={() => setShowMobileSettings(false)}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#f5f5f8",
                    border: "none",
                    cursor: "pointer",
                    color: "#5a5a72",
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Tipo de vista */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#9898b0",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 12,
                  }}
                >
                  Tipo de vista
                </div>
                <div style={{ overflowX: "auto", paddingBottom: 6 }}>
                  <div
                    style={{ display: "flex", gap: 8, minWidth: "max-content" }}
                  >
                    {MOBILE_VIEW_OPTIONS.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => setMobileViewMode(v.value)}
                        style={{
                          flexShrink: 0,
                          width: 88,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          padding: "12px 8px",
                          borderRadius: 12,
                          border: `2px solid ${mobileViewMode === v.value ? "#9B2242" : "#e8e8ed"}`,
                          background:
                            mobileViewMode === v.value ? "#fceef2" : "#fff",
                          color:
                            mobileViewMode === v.value ? "#9B2242" : "#5a5a72",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                          transition: "all 0.15s",
                        }}
                      >
                        {v.icon}
                        <span>{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Densidad */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#9898b0",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 12,
                  }}
                >
                  Densidad
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    { value: "compact" as MobileDensity, label: "Compacta" },
                    { value: "comfortable" as MobileDensity, label: "Cómoda" },
                    { value: "spacious" as MobileDensity, label: "Amplia" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setMobileDensity(d.value)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 12,
                        border: `2px solid ${mobileDensity === d.value ? "#9B2242" : "#e8e8ed"}`,
                        background:
                          mobileDensity === d.value ? "#fceef2" : "#fff",
                        color:
                          mobileDensity === d.value ? "#9B2242" : "#5a5a72",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        transition: "all 0.15s",
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileSettings(false)}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: "#9B2242",
                  color: "#fff",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ---------- States ----------
  const renderLoadingState = () => (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          color: C.text2,
        }}
      >
        <motion.div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `3px solid ${C.ruby}`,
            borderTopColor: "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        Cargando datos...
      </div>
    </div>
  );
  const renderErrorState = () => (
    <div style={{ textAlign: "center", padding: "32px 0", color: "#dc2626" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FiAlertCircle size={18} />
        {error}
      </div>
    </div>
  );
  const renderEmptyState = () => (
    <div style={{ textAlign: "center", padding: "48px 0", color: C.text3 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: C.surface,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiInbox size={24} style={{ color: C.text3 }} />
        </div>
        <span style={{ fontSize: 14, color: C.text2, fontWeight: 500 }}>
          No se encontraron resultados
        </span>
        {(globalFilter || Object.values(columnFilters).some(Boolean)) && (
          <button
            onClick={clearAll}
            style={{
              color: C.ruby,
              background: C.rubyLight,
              border: `1px solid rgba(155,34,66,0.2)`,
              borderRadius: C.r6,
              cursor: "pointer",
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );

  useImperativeHandle(
    ref,
    () => ({
      clearAllFilters: clearAll,
      clearColumnFilters: () => {
        setColumnFilters({});
        setCurrentPage(1);
      },
      clearGlobalFilter: () => {
        setGlobalFilter("");
        setCurrentPage(1);
      },
      clearSelection: resetSelection,
      selectAllRows: (onlyFiltered = false) => {
        const source = onlyFiltered ? flatData : safeData;
        const ids = new Set(source.map((r, i) => getRowId(r as any, i)));
        setSelectedRows(ids);
        setSelectAll(true);
        setAllDataSelected(true);
        onSelectAllRows?.(true, source);
      },
      deselectAllRows: () => {
        resetSelection();
        onSelectAllRows?.(false, []);
      },
      getSelectedRows: () => selectedData,
      getFilteredRows: () => sortedData,
      setTheme,
      setDensity,
      setViewMode,
      goToPage: (page) =>
        setCurrentPage(Math.max(1, Math.min(page, totalPages))),
      goToFirstPage: () => setCurrentPage(1),
      goToLastPage: () => setCurrentPage(totalPages),
      exportExcel: (onlySelected = false) =>
        exportExcel(getExportData(onlySelected, sortedData)),
      exportCSV: (onlySelected = false) =>
        exportCSV(getExportData(onlySelected, sortedData)),
      exportJSON: (onlySelected = false) =>
        exportJSON(getExportData(onlySelected, sortedData)),
      toggleFullscreen: () => setIsFullscreen((f) => !f),
      refresh: () => setColumns((c) => [...c]),
    }),
    [selectedData, sortedData, totalPages, safeData, flatData, getRowId],
  );

  const activeCount = [globalFilter, ...Object.values(columnFilters)].filter(
    Boolean,
  ).length;
  const totalSelected = selectedRows.size;

  // ==================== MAIN RENDER ====================
  return (
    <div
      ref={containerRef}
      style={{
        background: C.white,
        borderRadius: isFullscreen ? 0 : C.r12,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: C.shadowMd,
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "100%",
        width: "100%",
      }}
    >
      {/* ==================== MOBILE HEADER ==================== */}
      {isMobile ? (
        <div
          style={{
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 14px 10px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.surface,
                border: `1.5px solid ${globalFilter ? "rgba(155,34,66,0.4)" : C.border}`,
                borderRadius: C.r6,
                padding: "9px 12px",
                boxShadow: globalFilter ? `0 0 0 3px ${C.rubyGlow}` : "none",
                transition: "all 0.2s",
                minWidth: 0,
              }}
            >
              <FiSearch
                size={14}
                style={{
                  color: globalFilter ? C.ruby : C.text3,
                  flexShrink: 0,
                }}
              />
              <DebouncedSearchInput
                value={globalFilter}
                onChange={(val) => {
                  setGlobalFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Buscar…"
                C={C}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    color: C.text3,
                  }}
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {mobileConfig?.quickFilters?.enabled && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setTempFilters({ ...activeFilters });
                  setShowFilterModal(true);
                }}
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: C.r6,
                  border: `1.5px solid ${mobileActiveFilterCount > 0 ? C.ruby : C.border}`,
                  background:
                    mobileActiveFilterCount > 0 ? C.rubyLight : C.surface,
                  cursor: "pointer",
                  color: mobileActiveFilterCount > 0 ? C.ruby : C.text2,
                  flexShrink: 0,
                }}
              >
                <FiFilter size={16} />
                {mobileActiveFilterCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: C.ruby,
                      color: "#fff",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      border: `2px solid ${C.white}`,
                    }}
                  >
                    {mobileActiveFilterCount}
                  </span>
                )}
              </motion.button>
            )}

            {mobileConfig?.activeViews && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowMobileSettings(true)}
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: C.r6,
                  border: `1.5px solid ${C.border}`,
                  background: C.surface,
                  cursor: "pointer",
                  color: C.text2,
                  flexShrink: 0,
                }}
              >
                <FiSettings size={16} />
              </motion.button>
            )}

            {refreshData && (
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={refreshData}
                style={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: C.r6,
                  border: `1.5px solid ${C.border}`,
                  background: C.surface,
                  cursor: "pointer",
                  color: C.text2,
                  flexShrink: 0,
                }}
              >
                <FiRefreshCw size={15} />
              </motion.button>
            )}
          </div>

          {renderActiveFiltersChips()}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 11, color: C.text3 }}>
              <strong style={{ color: C.text2, fontWeight: 700 }}>
                {totalRows.toLocaleString()}
              </strong>{" "}
              registros
              {activeCount > 0 && (
                <span style={{ color: C.ruby }}>
                  {" "}
                  · {safeData.length - totalRows} ocultos
                </span>
              )}
            </span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  fontSize: 11,
                  color: C.ruby,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <FiX size={10} /> Limpiar
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ==================== DESKTOP HEADER ==================== */
        <div
          style={{
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            padding: "16px 20px 14px",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {(title || (headerActions && headerActions(selectedData))) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {title && (
                <div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: C.text1,
                      margin: 0,
                      letterSpacing: "-0.02em",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {title}
                    {groupBy && (
                      <span
                        style={{
                          fontSize: 11,
                          background: C.rubyLight,
                          color: C.ruby,
                          borderRadius: 100,
                          padding: "2px 8px",
                          fontWeight: 700,
                        }}
                      >
                        Agrupado:{" "}
                        {
                          columns.find((c) => c.field === groupBy.field)
                            ?.headerName
                        }
                      </span>
                    )}
                  </h2>
                  {subtitle && (
                    <p
                      style={{
                        fontSize: 12,
                        color: C.text3,
                        margin: "3px 0 0",
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {headerActions && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {headerActions(selectedData)}
                </div>
              )}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {refreshData && (
              <IconBtn onClick={refreshData} title="Refrescar" C={C}>
                <FiRefreshCw size={14} />
              </IconBtn>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                flex: "1 1 220px",
                minWidth: 0,
                background: C.surface,
                border: `1.5px solid ${globalFilter ? "rgba(155,34,66,0.35)" : C.border}`,
                borderRadius: C.r6,
                padding: "8px 13px",
                boxShadow: globalFilter ? `0 0 0 3px ${C.rubyGlow}` : "none",
                transition: "all 0.2s",
              }}
            >
              <FiSearch
                size={14}
                style={{
                  color: globalFilter ? C.ruby : C.text3,
                  flexShrink: 0,
                }}
              />
              <DebouncedSearchInput
                value={globalFilter}
                onChange={(val) => {
                  setGlobalFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Buscar…"
                C={C}
              />
              <AnimatePresence>
                {globalFilter && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => setGlobalFilter("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      color: C.text3,
                    }}
                  >
                    <FiX size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginLeft: "auto",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {enableDensityControl && (
                <div
                  style={{
                    display: "flex",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: C.r6,
                    padding: 3,
                    gap: 2,
                  }}
                >
                  {(
                    ["compact", "comfortable", "spacious"] as DensityMode[]
                  ).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDensity(d)}
                      title={d}
                      style={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: density === d ? C.ruby : "transparent",
                        color: density === d ? "#fff" : C.text3,
                        transition: "all 0.15s",
                      }}
                    >
                      <FiGrid
                        size={
                          d === "compact" ? 9 : d === "comfortable" ? 11 : 13
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
              <IconBtn
                onClick={() => setShowStats((s) => !s)}
                title="Estadísticas numéricas"
                active={showStats}
                C={C}
              >
                <FiBarChart2 size={14} />
              </IconBtn>
              {enableGroupBy && (
                <IconBtn
                  onClick={() => setShowGroupPanel((p) => !p)}
                  title="Agrupar filas"
                  active={!!groupBy}
                  C={C}
                >
                  <FiLayout size={14} />
                </IconBtn>
              )}
              {enableSavedFilters && (
                <IconBtn
                  onClick={() => {
                    setShowFilterLibrary((p) => !p);
                    setShowColumnManager(false);
                    setShowExportMenu(false);
                  }}
                  title="Filtros guardados"
                  active={showFilterLibrary}
                  C={C}
                >
                  <FiBookmark size={14} />
                </IconBtn>
              )}
              {enableColumnVisibility && (
                <IconBtn
                  onClick={() => {
                    setShowColumnManager((p) => !p);
                    setShowFilterLibrary(false);
                    setShowExportMenu(false);
                  }}
                  title="Gestionar columnas"
                  active={showColumnManager || hiddenColumns.size > 0}
                  C={C}
                >
                  <FiColumns size={14} />
                </IconBtn>
              )}
              {enableThemeToggle && (
                <IconBtn
                  onClick={() =>
                    setTheme((t) => (t === "light" ? "dark" : "light"))
                  }
                  title={`Modo ${theme === "light" ? "oscuro" : "claro"}`}
                  C={C}
                >
                  {theme === "light" ? (
                    <FiMoon size={14} />
                  ) : (
                    <FiSun size={14} />
                  )}
                </IconBtn>
              )}
              {enableFullscreen && (
                <IconBtn
                  onClick={() => setIsFullscreen((f) => !f)}
                  title="Pantalla completa"
                  C={C}
                >
                  {isFullscreen ? (
                    <FiMinimize2 size={14} />
                  ) : (
                    <FiMaximize2 size={14} />
                  )}
                </IconBtn>
              )}
              {enableRowSelection && enableSelectAllRows && (
                <button
                  onClick={() => handleSelectAllRows(false)}
                  title={
                    allDataSelected
                      ? "Deseleccionar todos"
                      : `Seleccionar los ${safeData.length} registros`
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 12px",
                    borderRadius: C.r6,
                    background: allDataSelected ? C.rubyLight : C.surface,
                    border: `1px solid ${allDataSelected ? C.ruby : C.border}`,
                    color: allDataSelected ? C.ruby : C.text2,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FiCheckSquare size={13} />
                  {allDataSelected
                    ? "Desel. todo"
                    : `Sel. todo (${safeData.length})`}
                </button>
              )}
              {enableExportOptions && (
                <button
                  onClick={() => {
                    setShowExportMenu((p) => !p);
                    setShowColumnManager(false);
                    setShowFilterLibrary(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 12px",
                    borderRadius: C.r6,
                    background: showExportMenu
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    color: C.green,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <FiDownload size={13} /> Exportar
                  {enableRowSelection && selectedData.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        background: C.ruby,
                        color: "white",
                        borderRadius: 100,
                        padding: "2px 5px",
                        fontSize: 9,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {selectedData.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 11, color: C.text3 }}>
              <strong style={{ color: C.text2, fontWeight: 700 }}>
                {totalRows.toLocaleString()}
              </strong>{" "}
              registros
              {activeCount > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span style={{ color: C.ruby }}>
                    {safeData.length - totalRows} ocultos
                  </span>
                </>
              )}
            </span>
            <AnimatePresence>
              {totalSelected > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: C.rubyLight,
                    color: C.ruby,
                    borderRadius: 100,
                    padding: "2px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiCheck size={10} />
                  {allDataSelected
                    ? `Todos (${totalSelected}) seleccionados`
                    : `${totalSelected} seleccionado${totalSelected !== 1 ? "s" : ""}`}
                  <button
                    onClick={resetSelection}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: C.ruby,
                      display: "flex",
                      marginLeft: 2,
                    }}
                  >
                    <FiX size={10} />
                  </button>
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {groupBy && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: C.blueLight,
                    color: C.blue,
                    borderRadius: 100,
                    padding: "2px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiLayout size={10} /> Agrupado
                  <button
                    onClick={() => setGroupBy(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: C.blue,
                      display: "flex",
                      marginLeft: 2,
                    }}
                  >
                    <FiX size={10} />
                  </button>
                </motion.span>
              )}
            </AnimatePresence>
            {sortConfig.field && (
              <span
                style={{
                  fontSize: 11,
                  color: C.text3,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Orden:{" "}
                <strong style={{ color: C.text2 }}>
                  {
                    columns.find((c) => c.field === sortConfig.field)
                      ?.headerName
                  }
                </strong>
                ({sortConfig.direction === "asc" ? "A→Z" : "Z→A"})
              </span>
            )}
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: C.r6,
                  background: C.rubyLight,
                  border: `1px solid rgba(155,34,66,0.2)`,
                  color: C.ruby,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FiX size={10} /> Limpiar ({activeCount})
              </button>
            )}
          </div>
          {renderColumnManager()}
          {renderExportMenu()}
          {renderFilterLibrary()}
        </div>
      )}

      {/* ==================== MOBILE VIEW MODE SWITCHER (barra de tabs) ==================== */}
      {isMobile && mobileConfig?.activeViews && (
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            overflowX: "auto",
            flexShrink: 0,
            scrollbarWidth: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              whiteSpace: "nowrap",
            }}
          >
            {MOBILE_VIEW_OPTIONS.map((v) => (
              <button
                key={v.value}
                onClick={() => setMobileViewMode(v.value)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 100,
                  border: `1.5px solid ${mobileViewMode === v.value ? C.ruby : C.borderMd}`,
                  background: mobileViewMode === v.value ? C.ruby : C.white,
                  color: mobileViewMode === v.value ? "#fff" : C.text2,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== DESKTOP GROUP PANEL ==================== */}
      {!isMobile && (
        <AnimatePresence>
          {showGroupPanel && enableGroupBy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                borderBottom: `1px solid ${C.border}`,
                background: C.pageBg,
              }}
            >
              <div
                style={{
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.text2,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Agrupar por:
                </span>
                {columns
                  .filter((c) => c.groupable)
                  .map((col) => (
                    <button
                      key={col.field}
                      onClick={() =>
                        setGroupBy(
                          groupBy?.field === col.field
                            ? null
                            : { field: col.field, direction: "asc" },
                        )
                      }
                      style={{
                        padding: "4px 12px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background:
                          groupBy?.field === col.field ? C.rubyLight : C.white,
                        color: groupBy?.field === col.field ? C.ruby : C.text2,
                        transition: "all 0.15s",
                      }}
                    >
                      {col.headerName}
                    </button>
                  ))}
                {columns.filter((c) => c.groupable).length === 0 && (
                  <span style={{ fontSize: 11, color: C.text3 }}>
                    Marca columnas con groupable: true para habilitarlas
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {renderStats()}

      {/* ==================== TABLE CONTENT ==================== */}
      <div
        style={{
          overflow: "auto",
          flex: 1,
          background: !isMobile && viewMode === "cards" ? C.pageBg : C.white,
        }}
      >
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        )  : isMobile ? (
          <>
            {mobileViewMode === "list" && renderMobileListView()}
            {mobileViewMode === "compact-list" && renderMobileCompactListView()}
            {mobileViewMode === "cards" && renderMobileCardsView()}
            {mobileViewMode === "mini-cards" && renderMobileMiniCardsView()}
            {mobileViewMode === "timeline" && renderMobileTimelineView()}
            {mobileViewMode === "detailed-list" &&
              renderMobileDetailedListView()}
          </>
        ) : viewMode === "table" ? (
          renderDesktopTable()
        ) : viewMode === "cards" ? (
          renderDesktopCards()
        ) : (
          renderDesktopCompact()
        )}
      </div>

      {/* ==================== PAGINATION ==================== */}
      {currentRows.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: isMobile ? "10px 14px" : "10px 18px",
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.text3 }}>Por página</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                background: C.white,
                border: `1px solid ${C.borderMd}`,
                borderRadius: C.r4,
                color: C.text1,
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 8px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {paginate.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: 11, color: C.text3, order: 3 }}>
            <strong style={{ color: C.text1 }}>
              {(startIndex + 1).toLocaleString()}–
              {Math.min(startIndex + rowsPerPage, totalRows).toLocaleString()}
            </strong>{" "}
            de{" "}
            <strong style={{ color: C.text1 }}>
              {totalRows.toLocaleString()}
            </strong>
          </span>
          <div
            style={{ display: "flex", alignItems: "center", gap: 3, order: 2 }}
          >
            <PgBtn
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              C={C}
            >
              <span style={{ fontSize: 10 }}>«</span>
            </PgBtn>
            <PgBtn
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              C={C}
            >
              <FiChevronLeft size={13} />
            </PgBtn>
            {!isMobile &&
              getPages().map((p, i) =>
                p === "…" ? (
                  <span
                    key={i}
                    style={{
                      width: 28,
                      textAlign: "center",
                      fontSize: 12,
                      color: C.text3,
                    }}
                  >
                    …
                  </span>
                ) : (
                  <PgBtn
                    key={i}
                    active={currentPage === p}
                    onClick={() => setCurrentPage(p as number)}
                    C={C}
                  >
                    {p}
                  </PgBtn>
                ),
              )}
            {isMobile && (
              <span
                style={{
                  fontSize: 12,
                  color: C.text2,
                  fontWeight: 600,
                  padding: "0 8px",
                }}
              >
                {currentPage} / {totalPages}
              </span>
            )}
            <PgBtn
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              C={C}
            >
              <FiChevronRight size={13} />
            </PgBtn>
            <PgBtn
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              C={C}
            >
              <span style={{ fontSize: 10 }}>»</span>
            </PgBtn>
          </div>
        </div>
      )}

      {/* ==================== MOBILE OVERLAYS ==================== */}
      {renderFilterModalMobile()}
      {renderBottomSheet()}
      {renderMobileSettings()}
    </div>
  );
};

const CustomTable = forwardRef(CustomTableInner) as <T extends object>(
  props: PropsTable<T> & { ref?: React.Ref<CustomTableHandle<T>> },
) => React.ReactElement;

export default CustomTable;
