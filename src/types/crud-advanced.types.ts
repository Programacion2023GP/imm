// src/types/crud-advanced.types.ts
import * as yup from "yup";
import React, { ReactNode } from "react";

// ==================== PERMISOS Y RBAC ====================
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'bulk_delete' | 'bulk_update';

export interface Permission {
  resource: string;
  action: PermissionAction;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
}

// ==================== AUDITORÍA ====================
export interface AuditLog {
  [x: string]: any;
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_DELETE' | 'BULK_UPDATE' | 'IMPORT' | 'EXPORT';
  resource: string;
  resourceId?: number | string;
  userId: string;
  userName: string;
  timestamp: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  metadata?: Record<string, any>;
}

// ==================== BÚSQUEDA Y FILTROS ====================
export interface SearchConfig<T = any> {
  fields: (keyof T)[];
  placeholder?: string;
  debounceMs?: number;
}

export interface FilterField<T = any> {
  field: keyof T;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'date_range' | 'number_range' | 'boolean';
  options?: Array<{ id: string | number; name: string }>;
  defaultValue?: any;
}

export interface AdvancedFilters<T = any> {
  search?: string;
  filters: Partial<Record<keyof T, any>>;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  dateRange?: { start: string; end: string };
}

// ==================== OPERACIONES EN LOTE ====================
export interface BulkAction<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (selectedItems: T[]) => Promise<void>;
  confirmMessage?: string;
  permission?: PermissionAction;
}

// ==================== VISTAS PERSONALIZABLES ====================
export type ViewMode = 'table' | 'kanban' | 'calendar' | 'grid' | 'map';

export interface ViewConfig<T = any> {
  mode: ViewMode;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType<ViewComponentProps<T>>;
}

export interface ViewComponentProps<T = any> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  selectedItems: T[];
  onToggleSelect: (item: T) => void;
  hook: any;
}

// ==================== IMPORTACIÓN/EXPORTACIÓN ====================
export interface ExportConfig {
  enabled: boolean;
  formats: ('csv' | 'xlsx' | 'pdf')[];
  columns?: string[];
  filename?: string;
}

export interface ImportConfig {
  enabled: boolean;
  acceptedFormats: string[];
  maxFileSizeMB?: number;
  templateUrl?: string;
  onImport: (data: any[]) => Promise<void>;
}

// ==================== TIEMPO REAL ====================
export interface RealtimeConfig {
  enabled: boolean;
  endpoint?: string;
  events: ('create' | 'update' | 'delete')[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// ==================== AUTO-GUARDADO ====================
export interface AutosaveConfig {
  enabled: boolean;
  intervalMs?: number;
  onSave: (values: any) => Promise<void>;
  showIndicator?: boolean;
}

// ==================== RELACIONES ====================
export interface RelationConfig<T = any> {
  field: keyof T;
  type: 'belongs_to' | 'has_many' | 'many_to_many';
  resource: string;
  displayField: string;
  valueField?: string;
  endpoint?: string;
  cascadeDelete?: boolean;
}

// ==================== DASHBOARD ====================
export interface DashboardStats<T = any> {
  total: number;
  active: number;
  inactive: number;
  recentActivity: ActivityItem[];
  groupBy?: Record<string, number>;
  trends?: { date: string; count: number }[];
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user?: string;
  icon?: React.ReactNode;
}

export interface DashboardWidget<T = any> {
  id: string;
  type: 'stat' | 'chart' | 'table' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  component: React.ComponentType<DashboardWidgetProps<T>>;
}

export interface DashboardWidgetProps<T = any> {
  data: T[];
  stats: DashboardStats<T>;
  loading: boolean;
}

// ==================== CONFIGURACIÓN COMPLETA ====================
export interface AdvancedCrudConfig<TForm = any, TTable = any> {
  // Permisos
  permissions?: {
    resource: string;
    create?: PermissionAction;
    read?: PermissionAction;
    update?: PermissionAction;
    delete?: PermissionAction;
  };
  
  // Búsqueda
  search?: SearchConfig<TForm>;
  
  // Filtros
  filters?: FilterField<TForm>[];
  
  // Vistas
  views?: ViewConfig<TTable>[];
  defaultView?: ViewMode;
  
  // Bulk actions
  bulkActions?: BulkAction<TTable>[];
  enableSelection?: boolean;
  
  // Import/Export
  export?: ExportConfig;
  import?: ImportConfig;
  
  // Tiempo real
  realtime?: RealtimeConfig;
  
  // Autoguardado
  autosave?: AutosaveConfig;
  
  // Relaciones
  relations?: RelationConfig<TForm>[];
  
  // Dashboard
  dashboard?: {
    enabled: boolean;
    widgets: DashboardWidget<TTable>[];
    stats?: (items: TTable[]) => DashboardStats<TTable>;
  };
  
  // Auditoría
  audit?: {
    enabled: boolean;
    fetchLogs?: (resourceId?: string) => Promise<AuditLog[]>;
  };
}
