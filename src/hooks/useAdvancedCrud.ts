// src/hooks/useAdvancedCrud.ts
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useGenericData, GenericDataConfig, GenericDataReturn } from "./usegenericdata";
import { AdvancedCrudConfig, AuditLog, DashboardStats, ViewMode } from "../types/crud-advanced.types";
import * as XLSX from "xlsx";

// ==================== HOOK AVANZADO ====================
export interface AdvancedCrudReturn<TForm = any, TTable = any> extends GenericDataReturn<TForm> {
  // Búsqueda y filtros
  search: string;
  setSearch: (search: string) => void;
  filters: Record<string, any>;
  setFilter: (field: string, value: any) => void;
  clearFilters: () => void;
  filteredItems: TTable[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSort: (field: string, order?: 'asc' | 'desc') => void;

  // Selección múltiple (bulk)
  selectedIds: (string | number)[];
  toggleSelect: (id: string | number) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  selectAll: () => void;
  isAllSelected: boolean;
  selectedItems: TTable[];

  // Acciones en lote
  bulkDelete: (ids?: (string | number)[]) => Promise<void>;
  bulkUpdate: (data: Partial<TForm>, ids?: (string | number)[]) => Promise<void>;
  bulkAction: (actionId: string) => Promise<void>;

  // Vistas
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Tiempo real
  isRealtimeConnected: boolean;
  realtimeStatus: 'connected' | 'disconnected' | 'connecting' | 'error';

  // Autoguardado
  autosaveEnabled: boolean;
  toggleAutosave: () => void;

  // Importación/Exportación
  exportToCSV: (customData?: TTable[]) => void;
  exportToExcel: (customData?: TTable[]) => void;
  importFromFile: (file: File) => Promise<any[]>;
  isImporting: boolean;
  importProgress: number;

  // Auditoría
  auditLogs: AuditLog[];
  fetchAuditLogs: (resourceId?: string) => Promise<void>;
  isLoadingAudit: boolean;

  // Dashboard
  dashboardStats: DashboardStats<TTable>;
  refreshStats: () => void;

  // Relaciones
  relationData: Record<string, any[]>;
  fetchRelation: (field: string) => Promise<void>;
  loadRelationOptions: (field: string) => Promise<any[]>;
}

export const useAdvancedCrud = <
  TForm extends { id?: number },
  TTable extends { id?: number } = TForm,
  E = {},
  P extends Record<string, any> = {},
  S extends Record<string, any> = {}
>(
  config: GenericDataConfig<TForm, E, P, S>,
  advancedConfig?: AdvancedCrudConfig<TForm, TTable>
): AdvancedCrudReturn<TForm, TTable> => {
  // Hook base
  const baseHook = useGenericData<TForm, E, P, S>(config);

  // ============== ESTADOS LOCALES ==============
  
  // Búsqueda y filtros
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  
  // Vistas
  const [viewMode, setViewMode] = useState<ViewMode>(
    advancedConfig?.defaultView || 'table'
  );
  
  // Tiempo real
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  // Autoguardado
  const [autosaveEnabled, setAutosaveEnabled] = useState(
    advancedConfig?.autosave?.enabled || false
  );
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Importación
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // Auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  
  // Relaciones
  const [relationData, setRelationData] = useState<Record<string, any[]>>({});
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats<TTable>>({
    total: 0,
    active: 0,
    inactive: 0,
    recentActivity: [],
    groupBy: {},
    trends: []
  });

  // ============== BÚSQUEDA Y FILTROS ==============
  
  const setFilter = useCallback((field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch("");
    setSortBy("");
  }, []);

  const setSort = useCallback((field: string, order?: 'asc' | 'desc') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(order || 'asc');
    }
  }, [sortBy]);

  // Filtrar y ordenar items
  const filteredItems = useMemo(() => {
    let result = [...(baseHook.items || [])] as any[];

    // Búsqueda
    if (search && advancedConfig?.search?.fields) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => {
        return advancedConfig.search!.fields.some((field: any) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Filtros
    Object.entries(filters).forEach(([field, value]) => {
      if (value == null || value === '' || value === 'all') return;
      result = result.filter(item => {
        if (Array.isArray(value)) {
          return value.includes(item[field]);
        }
        return item[field] === value;
      });
    });

    // Ordenamiento
    if (sortBy) {
      result.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result as TTable[];
  }, [baseHook.items, search, filters, sortBy, sortOrder, advancedConfig]);

  // ============== SELECCIÓN MÚLTIPLE ==============

  const toggleSelect = useCallback((id: string | number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id!));
    }
  }, [filteredItems, selectedIds.length]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);
  const selectAll = useCallback(() => {
    setSelectedIds(filteredItems.map(item => item.id!));
  }, [filteredItems]);

  const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  
  const selectedItems = useMemo(() => 
    filteredItems.filter(item => selectedIds.includes(item.id!))
  , [filteredItems, selectedIds]);

  // ============== ACCIONES EN LOTE ==============

  const bulkDelete = useCallback(async (ids?: (string | number)[]) => {
    const idsToDelete = ids || selectedIds;
    if (!idsToDelete.length) return;
    
    if (!confirm(`¿Eliminar ${idsToDelete.length} elementos?`)) return;

    setSelectedIds([]);
    const itemsToDelete = baseHook.items.filter(item => 
      idsToDelete.includes(item.id!)
    ) as TForm[];

    for (const item of itemsToDelete) {
      await baseHook.removeItemData(item);
    }

    // Auditoría
    if (advancedConfig?.audit?.enabled) {
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'BULK_DELETE',
        resource: config.prefix,
        userId: localStorage.getItem('userId') || 'unknown',
        userName: localStorage.getItem('name') || 'Unknown',
        timestamp: new Date().toISOString(),
        metadata: { count: idsToDelete.length }
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  }, [selectedIds, baseHook.items, baseHook.removeItemData, config.prefix, advancedConfig]);

  const bulkUpdate = useCallback(async (data: Partial<TForm>, ids?: (string | number)[]) => {
    const idsToUpdate = ids || selectedIds;
    if (!idsToUpdate.length) return;

    const itemsToUpdate = baseHook.items.filter(item => 
      idsToUpdate.includes(item.id!)
    ) as TForm[];

    for (const item of itemsToUpdate) {
      await baseHook.postItem({ ...item, ...data } as TForm);
    }

    setSelectedIds([]);

    // Auditoría
    if (advancedConfig?.audit?.enabled) {
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'BULK_UPDATE',
        resource: config.prefix,
        userId: localStorage.getItem('userId') || 'unknown',
        userName: localStorage.getItem('name') || 'Unknown',
        timestamp: new Date().toISOString(),
        metadata: { count: idsToUpdate.length, changes: data }
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  }, [selectedIds, baseHook.items, baseHook.postItem, config.prefix, advancedConfig]);

  const bulkAction = useCallback(async (actionId: string) => {
    const action = advancedConfig?.bulkActions?.find(a => a.id === actionId);
    if (!action) return;

    await action.action(selectedItems);
    setSelectedIds([]);
  }, [selectedItems, advancedConfig]);

  // ============== TIEMPO REAL (WEBSOCKET) ==============

  useEffect(() => {
    if (!advancedConfig?.realtime?.enabled) return;

    const connectWebSocket = () => {
      setRealtimeStatus('connecting');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = advancedConfig.realtime.endpoint || 
        `${protocol}//${window.location.host}/ws/${config.prefix}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRealtimeConnected(true);
        setRealtimeStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          if (type === 'CREATE' && advancedConfig.realtime.events.includes('create')) {
            baseHook.setItems(prev => [...prev, payload]);
          } else if (type === 'UPDATE' && advancedConfig.realtime.events.includes('update')) {
            baseHook.setItems(prev => 
              prev.map(item => (item as any).id === payload.id ? payload : item)
            );
          } else if (type === 'DELETE' && advancedConfig.realtime.events.includes('delete')) {
            baseHook.setItems(prev => 
              prev.filter(item => (item as any).id !== payload.id)
            );
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onclose = () => {
        setIsRealtimeConnected(false);
        setRealtimeStatus('disconnected');
        
        // Reconexión automática
        const maxAttempts = advancedConfig.realtime.maxReconnectAttempts || 5;
        if (reconnectAttemptsRef.current < maxAttempts) {
          reconnectAttemptsRef.current++;
          const interval = advancedConfig.realtime.reconnectInterval || 3000;
          setTimeout(connectWebSocket, interval);
        }
      };

      ws.onerror = () => {
        setRealtimeStatus('error');
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [advancedConfig?.realtime?.enabled, config.prefix]);

  // ============== AUTOGUARDADO ==============

  useEffect(() => {
    if (!autosaveEnabled || !advancedConfig?.autosave) return;

    const checkAndSave = () => {
      if (baseHook.isDirty && !baseHook.loading) {
        advancedConfig.autosave.onSave(baseHook.formData || {} as TForm);
      }
    };

    const interval = setInterval(
      checkAndSave, 
      advancedConfig.autosave.intervalMs || 5000
    );

    return () => clearInterval(interval);
  }, [autosaveEnabled, baseHook.isDirty, baseHook.loading, advancedConfig]);

  const toggleAutosave = useCallback(() => {
    setAutosaveEnabled(prev => !prev);
  }, []);

  // ============== IMPORTACIÓN/EXPORTACIÓN ==============

  const exportToCSV = useCallback((customData?: TTable[]) => {
    const data = customData || filteredItems;
    if (!data.length) return;

    const headers = Object.keys(data[0] as object);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = (row as any)[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${config.prefix}_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredItems, config.prefix]);

  const exportToExcel = useCallback((customData?: TTable[]) => {
    const data = customData || filteredItems;
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(data as any[]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    XLSX.writeFile(workbook, `${config.prefix}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredItems, config.prefix]);

  const importFromFile = useCallback(async (file: File): Promise<any[]> => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      const data = await new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target?.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsBinaryString(file);
        setImportProgress(50);
      });

      setImportProgress(100);
      
      if (advancedConfig?.import?.onImport) {
        await advancedConfig.import.onImport(data);
      }

      return data;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [advancedConfig]);

  // ============== AUDITORÍA ==============

  const fetchAuditLogs = useCallback(async (resourceId?: string) => {
    if (!advancedConfig?.audit?.fetchLogs) return;
    
    setIsLoadingAudit(true);
    try {
      const logs = await advancedConfig.audit.fetchLogs(resourceId);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoadingAudit(false);
    }
  }, [advancedConfig]);

  // ============== DASHBOARD STATS ==============

  const refreshStats = useCallback(() => {
    const items = baseHook.items as any[];
    if (!items.length) return;

    const stats: DashboardStats<TTable> = {
      total: items.length,
      active: items.filter(item => (item as any).status === 'active').length,
      inactive: items.filter(item => (item as any).status === 'inactive').length,
      recentActivity: [],
      groupBy: {},
      trends: []
    };

    // Group by logic
    if (advancedConfig?.dashboard?.stats) {
      const customStats = advancedConfig.dashboard.stats(items as TTable[]);
      Object.assign(stats, customStats);
    }

    setDashboardStats(stats);
  }, [baseHook.items, advancedConfig]);

  useEffect(() => {
    if (baseHook.items.length > 0) {
      refreshStats();
    }
  }, [baseHook.items, refreshStats]);

  // ============== RELACIONES ==============

  const fetchRelation = useCallback(async (field: string) => {
    const relation = advancedConfig?.relations?.find(r => r.field === field);
    if (!relation) return;

    try {
      const response = await fetch(
        relation.endpoint || `http://127.0.0.1:8000/api/${relation.resource}`
      );
      const data = await response.json();
      setRelationData(prev => ({ 
        ...prev, 
        [field]: data.result || data || [] 
      }));
    } catch (error) {
      console.error(`Error fetching relation ${field}:`, error);
    }
  }, [advancedConfig]);

  const loadRelationOptions = useCallback(async (field: string): Promise<any[]> => {
    if (relationData[field]) return relationData[field];
    await fetchRelation(field);
    return relationData[field] || [];
  }, [relationData, fetchRelation]);

  // ============== RETORNAR TODO ==============

  return {
    ...baseHook,
    
    // Búsqueda y filtros
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    filteredItems,
    sortBy,
    sortOrder,
    setSort,

    // Selección múltiple
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    selectAll,
    isAllSelected,
    selectedItems,

    // Acciones en lote
    bulkDelete,
    bulkUpdate,
    bulkAction,

    // Vistas
    viewMode,
    setViewMode,

    // Tiempo real
    isRealtimeConnected,
    realtimeStatus,

    // Autoguardado
    autosaveEnabled,
    toggleAutosave,

    // Importación/Exportación
    exportToCSV,
    exportToExcel,
    importFromFile,
    isImporting,
    importProgress,

    // Auditoría
    auditLogs,
    fetchAuditLogs,
    isLoadingAudit,

    // Dashboard
    dashboardStats,
    refreshStats,

    // Relaciones
    relationData,
    fetchRelation,
    loadRelationOptions,
  } as AdvancedCrudReturn<TForm, TTable>;
};
