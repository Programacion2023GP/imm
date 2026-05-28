
import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { theme } from "../../../config/themes";

type PaginationControlledProps<T> = {
  data: T[];
  itemsPerPage?: number;
  direction?: "row" | "col";
  animationDirection?: "vertical" | "horizontal";
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  searchFields?: (keyof T)[];
  onPageChange?: (info: {
    currentPage: number;
    totalPages: number;
    from: number;
    to: number;
    currentItems: T[];
  }) => void;
};

export function CustomPaginate<T>({
  data,
  itemsPerPage = 5,
  direction = "col",
  animationDirection = "horizontal",
  loading = false,
  renderItem,
  searchFields = [],
  onPageChange,
}: PaginationControlledProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayItems, setDisplayItems] = useState<T[]>([]);
  const [animating, setAnimating] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<T[]>(data);

  // Filtrado por buscador
  useEffect(() => {
    if (!search) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const filtered = data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value
          ? String(value).toLowerCase().includes(search.toLowerCase())
          : false;
      })
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const updatePage = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;

    setAnimating(true);
    setTimeout(() => {
      const start = (page - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, filteredData.length);
      setDisplayItems(filteredData.slice(start, end));
      setCurrentPage(page);
      setAnimating(false);

      onPageChange &&
        onPageChange({
          currentPage: page,
          totalPages,
          from: start + 1,
          to: end,
          currentItems: filteredData.slice(start, end),
        });
    }, 200);
  };

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredData.length);
    setDisplayItems(filteredData.slice(start, end));

    onPageChange &&
      onPageChange({
        currentPage,
        totalPages,
        from: filteredData.length === 0 ? 0 : start + 1,
        to: end,
        currentItems: filteredData.slice(start, end),
      });
  }, [filteredData, currentPage]);

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage > 2) pages.push(1);
    if (currentPage > 3) pages.push("...");
    const startPage = Math.max(currentPage - 1, 1);
    const endPage = Math.min(currentPage + 1, totalPages);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (currentPage < totalPages - 1) pages.push(totalPages);
    return pages;
  };

  const isLoading = loading || animating;

  return (
    <div className="flex flex-col gap-4 relative w-full">
      {/* Buscador */}
      <div 
        className="flex items-center w-full border transition-all duration-200"
        style={{
          background: theme.colors.background.surface,
          borderColor: theme.colors.border.DEFAULT,
          borderRadius: theme.radius.md,
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          boxShadow: theme.shadows.sm,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.focus;
          e.currentTarget.style.boxShadow = theme.shadows.focus;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
          e.currentTarget.style.boxShadow = theme.shadows.sm;
        }}
      >
        <FiSearch style={{ color: theme.colors.text.placeholder, marginRight: theme.spacing[2] }} size={18} />
        <input
          type="text"
          placeholder="Buscador general..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full outline-none bg-transparent text-sm"
          style={{ 
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamilySecondary
          }}
        />
        {search && (
          <FiX 
            className="cursor-pointer transition-colors" 
            style={{ color: theme.colors.text.placeholder }}
            onClick={() => setSearch("")} 
          />
        )}
      </div>

      {/* Contenido paginado */}
      <div
        className={`grid gap-4 w-full ${direction === "row"
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-flow-row"
          }`}
      >
        {displayItems.map((item, i) => (
          <div
            key={i}
            className={`transition-all duration-300 ease-in-out transform ${animating
                ? animationDirection === "vertical"
                  ? "opacity-0 translate-y-4"
                  : "opacity-0 translate-x-4"
                : "opacity-100 translate-y-0 translate-x-0"
              }`}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {/* Overlay de Carga (Spinner) */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ 
            background: theme.colors.background.card, 
            opacity: 0.75,
            borderRadius: theme.radius["2xl"]
          }}
        >
          <div 
            className="w-10 h-10 border-4 border-dashed rounded-full animate-spin"
            style={{ borderTopColor: theme.colors.primary.DEFAULT }}
          ></div>
        </div>
      )}

      {/* Contador de registros */}
      <div 
        className="text-sm text-center"
        style={{ 
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamilySecondary 
        }}
      >
        {filteredData.length > 0 ? (
          `Mostrando ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
            currentPage * itemsPerPage,
            filteredData.length
          )} de ${filteredData.length}`
        ) : (
          "No se encontraron resultados"
        )}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2 flex-wrap items-center">
          {/* Botón Anterior */}
          <button
            onClick={() => updatePage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 flex items-center justify-center border transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderRadius: theme.radius.full,
              borderColor: theme.colors.border.DEFAULT,
              background: theme.colors.background.card,
              color: currentPage === 1 ? theme.colors.text.disabled : theme.colors.text.primary,
              opacity: currentPage === 1 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) e.currentTarget.style.background = theme.colors.background.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.background.card;
            }}
          >
            <MdOutlineKeyboardArrowLeft size={20} />
          </button>

          {/* Números de Página */}
          {getVisiblePages().map((p, i) =>
            p === "..." ? (
              <span 
                key={i} 
                className="px-2 py-1 text-sm select-none"
                style={{ 
                  color: theme.colors.text.placeholder,
                  fontFamily: theme.typography.fontFamilySecondary
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={i}
                onClick={() => updatePage(p as number)}
                className="px-3 py-1 text-sm font-medium transition-all duration-150 cursor-pointer"
                style={{
                  borderRadius: theme.radius.full,
                  fontFamily: theme.typography.fontFamilySecondary,
                  border: `1px solid ${currentPage === p ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT}`,
                  background: currentPage === p ? theme.colors.primary.DEFAULT : theme.colors.background.card,
                  color: currentPage === p ? theme.colors.text.inverse : theme.colors.text.primary,
                  boxShadow: currentPage === p ? theme.shadows.sm : "none",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== p) e.currentTarget.style.background = theme.colors.background.surface;
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== p) e.currentTarget.style.background = theme.colors.background.card;
                }}
              >
                {p}
              </button>
            )
          )}

          {/* Botón Siguiente */}
          <button
            onClick={() => updatePage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 flex items-center justify-center border transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderRadius: theme.radius.full,
              borderColor: theme.colors.border.DEFAULT,
              background: theme.colors.background.card,
              color: currentPage === totalPages ? theme.colors.text.disabled : theme.colors.text.primary,
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) e.currentTarget.style.background = theme.colors.background.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.background.card;
            }}
          >
            <MdOutlineKeyboardArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
