// DataTransfer.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiChevronsRight,
  FiChevronsLeft,
  FiSearch,
  FiX,
  FiGrid,
  FiList,
  FiCheck,
  FiFolder,
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";

// ============================================================
// Tipos principales (genéricos)
// ============================================================
export interface DataTransferProps<T> {
  /** Lista completa de elementos (cualquier tipo de objeto) */
  items: T[];
  /** IDs de los elementos actualmente seleccionados */
  selectedIds?: (string | number)[];
  /** Función para obtener el ID único de un elemento */
  getId: (item: T) => string | number;
  /** Función para obtener el nombre mostrado de un elemento */
  getName: (item: T) => string;
  /** Función para obtener el grupo al que pertenece (opcional). Si no se provee, no hay agrupación. */
  getGroup?: (item: T) => string;
  /** Función para obtener la descripción (opcional) */
  getDescription?: (item: T) => string;
  /** Función para determinar si un elemento está deshabilitado (opcional) */
  isDisabled?: (item: T) => boolean;
  /** Función para renderizar un icono personalizado (opcional) */
  renderIcon?: (item: T) => React.ReactNode;
  // Textos y configuración UI
  leftTitle?: string;
  rightTitle?: string;
  searchPlaceholder?: string;
  onSave?: (selectedIds: (string | number)[]) => void;
  maxHeight?: string;
  enableDragDrop?: boolean;
  showSaveButton?: boolean;
  saveButtonText?: string;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  selectableGroups?: boolean;
  onGroupSelect?: (group: string, selected: boolean) => void;
}

// ============================================================
// Componente principal
// ============================================================
export function DataTransfer<T>({
  items,
  selectedIds = [],
  getId,
  getName,
  getGroup,
  getDescription,
  isDisabled = () => false,
  renderIcon,
  leftTitle = "Disponibles",
  rightTitle = "Seleccionados",
  searchPlaceholder = "Buscar...",
  onSave,
  maxHeight = "480px",
  enableDragDrop = true,
  showSaveButton = true,
  saveButtonText = "Guardar cambios",
  loading = false,
  emptyMessage = "No hay elementos",
  searchable = true,
  selectableGroups = false,
}: DataTransferProps<T>) {
  // Estados internos
  const [available, setAvailable] = useState<T[]>([]);
  const [selected, setSelected] = useState<T[]>([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedGroupLeft, setSelectedGroupLeft] = useState<Set<string>>(
    new Set(),
  );
  const [selectedGroupRight, setSelectedGroupRight] = useState<Set<string>>(
    new Set(),
  );

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Inicializar basado en selectedIds
  useEffect(() => {
    const selectedIdSet = new Set(selectedIds.map((id) => String(id)));
    const availableItems = items.filter(
      (item) => !selectedIdSet.has(String(getId(item))),
    );
    const selectedItems = items.filter((item) =>
      selectedIdSet.has(String(getId(item))),
    );
    setAvailable(availableItems);
    setSelected(selectedItems);
  }, [items, selectedIds, getId]);

  // Filtrado (búsqueda)
  const filterItems = useCallback(
    (list: T[], search: string): T[] => {
      if (!search) return list;
      const lower = search.toLowerCase();
      return list.filter((item) => {
        const nameMatch = getName(item).toLowerCase().includes(lower);
        const descMatch = getDescription
          ? getDescription(item).toLowerCase().includes(lower)
          : false;
        const groupMatch = getGroup
          ? getGroup(item).toLowerCase().includes(lower)
          : false;
        return nameMatch || descMatch || groupMatch;
      });
    },
    [getName, getDescription, getGroup],
  );

  // Agrupación (si getGroup está definida)
  const groupItems = useCallback(
    (list: T[]): Record<string, T[]> => {
      if (!getGroup) return { Todos: list };
      const groups: Record<string, T[]> = {};
      list.forEach((item) => {
        const group = getGroup(item) || "Sin grupo";
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
      });
      return groups;
    },
    [getGroup],
  );

  // Movimiento (evita duplicados mediante ID)
  const moveToRight = useCallback(
    (itemsToMove: T[]) => {
      const idsToMove = new Set(itemsToMove.map((item) => String(getId(item))));
      setAvailable((prev) =>
        prev.filter((item) => !idsToMove.has(String(getId(item)))),
      );
      setSelected((prev) => {
        const newItems = itemsToMove.filter(
          (item) => !prev.some((p) => String(getId(p)) === String(getId(item))),
        );
        return [...prev, ...newItems];
      });
    },
    [getId],
  );

  const moveToLeft = useCallback(
    (itemsToMove: T[]) => {
      const idsToMove = new Set(itemsToMove.map((item) => String(getId(item))));
      setSelected((prev) =>
        prev.filter((item) => !idsToMove.has(String(getId(item)))),
      );
      setAvailable((prev) => {
        const newItems = itemsToMove.filter(
          (item) => !prev.some((p) => String(getId(p)) === String(getId(item))),
        );
        return [...prev, ...newItems];
      });
    },
    [getId],
  );

  const moveAllToRight = useCallback(() => {
    setSelected((prev) => [...prev, ...available]);
    setAvailable([]);
  }, [available]);

  const moveAllToLeft = useCallback(() => {
    setAvailable((prev) => [...prev, ...selected]);
    setSelected([]);
  }, [selected]);

  // Manejo de grupos
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const selectGroup = (
    group: string,
    groupItems: T[],
    isRightSide: boolean,
  ) => {
    if (isRightSide) {
      if (selectedGroupRight.has(group)) {
        setSelectedGroupRight((prev) => {
          const s = new Set(prev);
          s.delete(group);
          return s;
        });
        moveToLeft(groupItems);
      } else {
        setSelectedGroupRight((prev) => new Set(prev).add(group));
        moveToRight(groupItems);
      }
    } else {
      if (selectedGroupLeft.has(group)) {
        setSelectedGroupLeft((prev) => {
          const s = new Set(prev);
          s.delete(group);
          return s;
        });
        moveToLeft(groupItems);
      } else {
        setSelectedGroupLeft((prev) => new Set(prev).add(group));
        moveToRight(groupItems);
      }
    }
  };

  const handleSave = () => {
    const ids = selected.map((item) => getId(item));
    onSave?.(ids);
  };

  // Drag & drop
  const handleDragStart = (e: React.DragEvent, item: T, fromRight: boolean) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ item, fromRight }),
    );
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDrop = (e: React.DragEvent, targetSide: "left" | "right") => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const { item, fromRight } = data;
      if (fromRight && targetSide === "left") moveToLeft([item]);
      else if (!fromRight && targetSide === "right") moveToRight([item]);
    } catch (err) {
      console.error(err);
    }
  };

  // Render de un item individual
  const renderItem = (
    item: T,
    isRightSide: boolean,
    onMove: () => void,
    index: number,
  ) => {
    const isGrid = viewMode === "grid";
    const disabled = isDisabled(item);
    const draggable = enableDragDrop && !disabled;

    return (
      <motion.div
        key={String(getId(item))}
        layout
        initial={{ opacity: 0, x: isRightSide ? 20 : -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: isRightSide ? -20 : 20, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          delay: index * 0.02,
        }}
        whileHover={{ scale: isGrid ? 1.02 : 1.01 }}
        className={`group relative ${isGrid ? "col-span-1" : ""}`}
      >
        <div
          draggable={draggable}
          onDragStart={(e) => handleDragStart(e, item, isRightSide)}
          onDragEnd={handleDragEnd}
          className={`
            relative flex items-center justify-between p-3 rounded-xl transition-all duration-200
            ${draggable ? "cursor-move" : "cursor-default"}
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white hover:shadow-md hover:border-[#9B2242]/30"}
            ${isGrid ? "flex-col text-center border border-gray-200" : "border-b border-gray-100 last:border-0"}
          `}
        >
          <div
            className={`flex items-center gap-3 ${isGrid ? "flex-col" : "flex-1 min-w-0"}`}
          >
            {renderIcon ? (
              <div className="text-[#9B2242] text-xl">{renderIcon(item)}</div>
            ) : (
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#9B2242]/10 to-[#9B2242]/20 flex items-center justify-center text-[#9B2242] font-semibold text-sm ${isGrid ? "mb-1" : ""}`}
              >
                {getName(item).charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`${isGrid ? "w-full" : "flex-1 min-w-0"}`}>
              <div className="text-sm font-semibold text-gray-800 truncate">
                {getName(item)}
              </div>
              {getDescription && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {getDescription(item)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {draggable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 cursor-grab active:cursor-grabbing">
                <MdDragIndicator size={18} />
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMove}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#9B2242] hover:text-white transition-colors"
            >
              <FiChevronRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render de una lista (con o sin grupos)
  const renderList = (
    itemsList: T[],
    isRightSide: boolean,
    onMove: (items: T[]) => void,
    search: string,
    setSearch: (s: string) => void,
  ) => {
    const filtered = filterItems(itemsList, search);
    const groups = groupItems(filtered);
    const groupNames = Object.keys(groups).sort();

    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 p-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-t-xl">
          {searchable && (
            <div className="relative mb-3">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B2242]/30 focus:border-[#9B2242] transition-all bg-gray-50/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-gray-500">
              {filtered.length} / {itemsList.length} elementos
            </div>
            <button
              onClick={() =>
                setViewMode((prev) => (prev === "list" ? "grid" : "list"))
              }
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {viewMode === "list" ? (
                <FiGrid size={16} />
              ) : (
                <FiList size={16} />
              )}
            </button>
          </div>
        </div>

        <div
          ref={isRightSide ? rightRef : leftRef}
          className="flex-1 overflow-y-auto p-2 space-y-3"
          style={{ maxHeight }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, isRightSide ? "right" : "left")}
        >
          {groupNames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <FiSearch size={48} className="mb-3 opacity-50" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            groupNames.map((group) => {
              const groupItemsList = groups[group];
              const isExpanded = expandedGroups.has(group);
              const isSelected = isRightSide
                ? selectedGroupRight.has(group)
                : selectedGroupLeft.has(group);

              return (
                <div
                  key={group}
                  className="rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <div
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleGroup(group)}
                  >
                    <div className="flex items-center gap-2">
                      <FiFolder
                        className="text-[#9B2242] opacity-70"
                        size={16}
                      />
                      <span className="font-semibold text-gray-800 text-sm">
                        {group}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {groupItemsList.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectableGroups && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectGroup(group, groupItemsList, isRightSide);
                          }}
                          className={`px-2 py-1 text-xs rounded-md transition-all ${isSelected ? "bg-[#9B2242] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {isSelected
                            ? "Deseleccionar grupo"
                            : "Seleccionar grupo"}
                        </button>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        <FiChevronRight size={16} />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`p-2 ${viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-1"}`}
                        >
                          {groupItemsList.map((item, idx) =>
                            renderItem(
                              item,
                              isRightSide,
                              () => onMove([item]),
                              idx,
                            ),
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // Render principal
  // ============================================================
  return (
    <div className="w-full bg-white rounded-2xl border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna izquierda */}
          <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#9B2242] animate-pulse" />
                  <span className="font-semibold text-gray-700">
                    {leftTitle}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {available.length}
                  </span>
                </div>
                {available.length > 0 && (
                  <button
                    onClick={moveAllToRight}
                    className="text-xs text-[#9B2242] hover:text-[#7A1B35] font-medium transition-colors"
                  >
                    Mover todos
                  </button>
                )}
              </div>
            </div>
            {renderList(
              available,
              false,
              moveToRight,
              searchLeft,
              setSearchLeft,
            )}
          </div>

          {/* Botones centrales */}
          <div className="flex flex-row lg:flex-col justify-center items-center gap-3 py-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={moveAllToRight}
              disabled={available.length === 0}
              className="p-3 rounded-xl bg-[#9B2242] text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Mover todos a la derecha"
            >
              <FiChevronsRight size={22} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => moveToRight(filterItems(available, searchLeft))}
              disabled={filterItems(available, searchLeft).length === 0}
              className="p-3 rounded-xl bg-[#9B2242] text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Mover seleccionados a la derecha"
            >
              <FiChevronRight size={22} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => moveToLeft(filterItems(selected, searchRight))}
              disabled={filterItems(selected, searchRight).length === 0}
              className="p-3 rounded-xl bg-gray-500 text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Mover seleccionados a la izquierda"
            >
              <FiChevronLeft size={22} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={moveAllToLeft}
              disabled={selected.length === 0}
              className="p-3 rounded-xl bg-gray-500 text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Mover todos a la izquierda"
            >
              <FiChevronsLeft size={22} />
            </motion.button>
          </div>

          {/* Columna derecha */}
          <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold text-gray-700">
                    {rightTitle}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {selected.length}
                  </span>
                </div>
                {selected.length > 0 && (
                  <button
                    onClick={moveAllToLeft}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Mover todos
                  </button>
                )}
              </div>
            </div>
            {renderList(
              selected,
              true,
              moveToLeft,
              searchRight,
              setSearchRight,
            )}
          </div>
        </div>

        {showSaveButton && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-2.5 bg-[#9B2242] text-white rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiCheck size={18} />
                  {saveButtonText}
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
