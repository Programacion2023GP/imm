// src/ui/components/advanced/FilterPanel.tsx
import React from "react";
import { FiFilter, FiX } from "react-icons/fi";
import { FilterField } from "../../types/crud-advanced.types";

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
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(filter.field as string, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {filter.options?.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map((opt) => (
              <label key={opt.id} className="flex items-center space-x-2">
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt.name}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(filter.field as string, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'date_range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="Desde"
              value={value?.start || ''}
              onChange={(e) =>
                onChange(filter.field as string, { ...value, start: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              placeholder="Hasta"
              value={value?.end || ''}
              onChange={(e) =>
                onChange(filter.field as string, { ...value, end: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        );

      case 'boolean':
        return (
          <select
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange(filter.field as string, e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
        className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium
          ${activeFilterCount > 0
            ? 'border-blue-500 text-blue-700 bg-blue-50'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } transition-colors`}
      >
        <FiFilter className="mr-2 h-4 w-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Filtros Avanzados</h3>
            <button
              onClick={onClear}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar todos
            </button>
          </div>

          {filters.map((filter) => (
            <div key={filter.field as string}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}

          <div className="pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={onToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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
