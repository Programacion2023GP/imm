// src/ui/components/advanced/FilterPanel.tsx
import React from "react";
import { FiFilter, FiX } from "react-icons/fi";
import type { FilterField } from "../../../types/crud-advanced.types";
import { theme } from "../../../config/themes";

interface FilterPanelProps<T = any> {
  filters: FilterField<T>[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
}

const FilterPanel = <T extends { id?: number }>({
  filters,
  values,
  onChange,
  onClear,
  isOpen,
  onToggle,
  activeFilterCount,
}: FilterPanelProps<T>) => {
  const renderFilterInput = (filter: FilterField<T>) => {
    const value = values[filter.field as string];

    switch (filter.type) {
      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(filter.field as string, e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md transition-colors focus:outline-none"
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              background: theme.colors.background.card,
              color: theme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
              e.currentTarget.style.boxShadow =
                theme.colors.feedback.primaryGlow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="">Todos</option>
            {filter.options?.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {filter.options?.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.id)}
                  onChange={(e) => {
                    const current = value || [];
                    const newVal = e.target.checked
                      ? [...current, opt.id]
                      : current.filter((v: any) => v !== opt.id);
                    onChange(filter.field as string, newVal);
                  }}
                  className="rounded transition-colors"
                  style={{
                    borderColor: theme.colors.border.DEFAULT,
                    color: theme.colors.primary.DEFAULT,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = `2px solid ${theme.colors.primary.DEFAULT}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: theme.colors.text.primary }}
                >
                  {opt.name}
                </span>
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(filter.field as string, e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md transition-colors focus:outline-none"
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              background: theme.colors.background.card,
              color: theme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
              e.currentTarget.style.boxShadow =
                theme.colors.feedback.primaryGlow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        );

      case "date_range":
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="Desde"
              value={value?.start || ""}
              onChange={(e) =>
                onChange(filter.field as string, {
                  ...value,
                  start: e.target.value,
                })
              }
              className="px-3 py-2 text-sm rounded-md transition-colors focus:outline-none"
              style={{
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                background: theme.colors.background.card,
                color: theme.colors.text.primary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  theme.colors.primary.DEFAULT;
                e.currentTarget.style.boxShadow =
                  theme.colors.feedback.primaryGlow;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <input
              type="date"
              placeholder="Hasta"
              value={value?.end || ""}
              onChange={(e) =>
                onChange(filter.field as string, {
                  ...value,
                  end: e.target.value,
                })
              }
              className="px-3 py-2 text-sm rounded-md transition-colors focus:outline-none"
              style={{
                border: `1px solid ${theme.colors.border.DEFAULT}`,
                background: theme.colors.background.card,
                color: theme.colors.text.primary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  theme.colors.primary.DEFAULT;
                e.currentTarget.style.boxShadow =
                  theme.colors.feedback.primaryGlow;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        );

      case "boolean":
        return (
          <select
            value={value !== undefined ? String(value) : ""}
            onChange={(e) =>
              onChange(
                filter.field as string,
                e.target.value === "" ? undefined : e.target.value === "true",
              )
            }
            className="w-full px-3 py-2 text-sm rounded-md transition-colors focus:outline-none"
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              background: theme.colors.background.card,
              color: theme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
              e.currentTarget.style.boxShadow =
                theme.colors.feedback.primaryGlow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          borderColor:
            activeFilterCount > 0
              ? theme.colors.primary.DEFAULT
              : theme.colors.border.DEFAULT,
          background:
            activeFilterCount > 0
              ? theme.colors.feedback.primaryLight
              : theme.colors.background.card,
          color:
            activeFilterCount > 0
              ? theme.colors.primary.DEFAULT
              : theme.colors.text.secondary,
        }}
        onMouseEnter={(e) => {
          if (activeFilterCount === 0) {
            e.currentTarget.style.background = theme.colors.background.surface;
          }
        }}
        onMouseLeave={(e) => {
          if (activeFilterCount === 0) {
            e.currentTarget.style.background = theme.colors.background.card;
          }
        }}
      >
        <FiFilter className="w-4 h-4 mr-2" />
        Filtros
        {activeFilterCount > 0 && (
          <span
            className="ml-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: theme.colors.primary.DEFAULT }}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute z-10 p-4 mt-2 space-y-4 rounded-lg shadow-xl w-96"
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.DEFAULT}`,
            boxShadow: theme.shadows.dropdown,
          }}
        >
          <div
            className="flex items-center justify-between pb-3 border-b"
            style={{ borderBottomColor: theme.colors.border.DEFAULT }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              Filtros Avanzados
            </h3>
            <button
              onClick={onClear}
              className="text-xs font-medium transition-colors"
              style={{ color: theme.colors.primary.DEFAULT }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.primary.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.primary.DEFAULT;
              }}
            >
              Limpiar todos
            </button>
          </div>

          {filters.map((filter) => (
            <div key={filter.field as string}>
              <label
                className="block mb-1 text-xs font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}

          <div
            className="flex justify-end pt-3 border-t"
            style={{ borderTopColor: theme.colors.border.DEFAULT }}
          >
            <button
              onClick={onToggle}
              className="px-4 py-2 text-sm font-medium transition-colors rounded-md"
              style={{
                background: theme.colors.primary.DEFAULT,
                color: theme.colors.text.inverse,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.primary.DEFAULT;
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
