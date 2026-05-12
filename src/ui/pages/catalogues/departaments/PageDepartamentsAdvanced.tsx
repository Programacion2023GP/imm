// src/ui/pages/catalogues/departaments/PageDepartamentsAdvanced.tsx
// Página COMPLETA con TODAS las funcionalidades avanzadas integradas
import React from "react";
import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import { departamentBaseConfig, departamentAdvancedConfig } from "../../../hooks/departaments/departaments.advanced.model";
import useDepartamentsAdvanced from "../../../hooks/departaments/departaments.advanced.model";

const PageDepartamentsAdvanced = () => {
  const hook = useDepartamentsAdvanced();

  return (
    <div className="space-y-6 p-6">
      {/* Header de la página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Departamentos</h1>
          <p className="text-gray-600 mt-1">
            Sistema completo con: búsqueda, filtros, vistas múltiples, auditoría, dashboard y más
          </p>
        </div>
        
        {/* Indicador de conexión en tiempo real */}
        {hook.isRealtimeConnected && (
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Tiempo real activo</span>
          </div>
        )}
      </div>

      {/* Componente SuperCrud con TODAS las funcionalidades */}
      <SuperCrud
        hook={hook as any}
        titles={{
          modalTitleAdd: "Crear Nuevo Departamento",
          modalTitleUpdate: "Editar Departamento",
        }}
        crudConfig={departamentBaseConfig}
        advancedConfig={departamentAdvancedConfig}
      />

      {/* Información adicional para el usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🔍 Búsqueda y Filtros</h3>
          <p className="text-blue-700">
            Usa la barra de búsqueda y los filtros avanzados para encontrar departamentos rápidamente.
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📊 Vistas Múltiples</h3>
          <p className="text-green-700">
            Cambia entre vista de tabla, Kanban y calendario según tu preferencia.
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">📈 Dashboard y Auditoría</h3>
          <p className="text-purple-700">
            Monitorea estadísticas y revisa el historial de cambios en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageDepartamentsAdvanced;
