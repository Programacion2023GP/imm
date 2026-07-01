import React, { useState, useEffect } from "react";
import AdvancedAnalyticsDashboard from "../../../components/dashboard/dashboard";
import UseLegalData from "../../../hooks/legal/uselegal";

// ─── Transformación de datos ─────────────────────────────────────────────
const transformDataForDashboard = (evaluaciones: any[]) => {
  const flatData: any[] = [];

  evaluaciones.forEach((evalItem) => {
    // Si tiene incidentes, expandimos
    if (evalItem.incidentes && evalItem.incidentes.length > 0) {
      evalItem.incidentes.forEach((inc: any) => {
        const proceso = inc.proceso || {};
        flatData.push({
          // Campos de evaluación
          folio: evalItem.folio,
          fecha_apertura: evalItem.fecha_apertura,
          fecha_asesoria: evalItem.fecha_asesoria,
          fecha_cierre: evalItem.fecha_cierre,
          estatus_caso: evalItem.estatus_caso_nombre || "N/A",
          tipo_asesoria: evalItem.tipo_asesoria_nombre || "N/A",
          tipo_medida: evalItem.tipo_medida_nombre || "N/A",
          motivo_cierre: evalItem.motivo_cierre_nombre || "N/A",
          responsable: evalItem.responsable_nombre || "N/A",
          autoridad_emisora: evalItem.autoridad_emisora_nombre || "N/A",
          // Datos de entrevista
          entrevista_nombre: evalItem.entrevista_nombre || "N/A",
          edad: evalItem.edad ?? 0,
          zona: evalItem.zona || "N/A",
          // Campos del incidente
          incidente_nombre: inc.nombre || "Sin incidente",
          incidente_id: inc.id || null,
          // Campos del proceso
          actor: proceso.actor || "N/A",
          expediente: proceso.expediente || "N/A",
          juzgado: proceso.juzgado || "N/A",
          fecha_presentacion: proceso.fecha_presentacion || null,
          fecha_radicacion: proceso.fecha_radicacion || null,
          fecha_audiencia_proceso: proceso.fecha_audiencia || null,
          // Duración calculada
          duracion_dias: calcularDuracion(
            evalItem.fecha_apertura,
            evalItem.fecha_cierre,
          ),
          // Contador de evidencias
          total_evidencias: contarEvidencias(proceso),
          // Mes/Año para agrupaciones
          mes_apertura: evalItem.fecha_apertura
            ? evalItem.fecha_apertura.substring(0, 7)
            : null,
          trimestre_apertura: evalItem.fecha_apertura
            ? getTrimestre(evalItem.fecha_apertura)
            : null,
          año_apertura: evalItem.fecha_apertura
            ? evalItem.fecha_apertura.substring(0, 4)
            : null,
        });
      });
    } else {
      // Si no tiene incidentes, igual agregamos un registro sin incidente
      flatData.push({
        folio: evalItem.folio,
        fecha_apertura: evalItem.fecha_apertura,
        fecha_asesoria: evalItem.fecha_asesoria,
        fecha_cierre: evalItem.fecha_cierre,
        estatus_caso: evalItem.estatus_caso_nombre || "N/A",
        tipo_asesoria: evalItem.tipo_asesoria_nombre || "N/A",
        tipo_medida: evalItem.tipo_medida_nombre || "N/A",
        motivo_cierre: evalItem.motivo_cierre_nombre || "N/A",
        responsable: evalItem.responsable_nombre || "N/A",
        autoridad_emisora: evalItem.autoridad_emisora_nombre || "N/A",
        entrevista_nombre: evalItem.entrevista_nombre || "N/A",
        edad: evalItem.edad ?? 0,
        zona: evalItem.zona || "N/A",
        incidente_nombre: "Sin incidente",
        incidente_id: null,
        actor: "N/A",
        expediente: "N/A",
        juzgado: "N/A",
        fecha_presentacion: null,
        fecha_radicacion: null,
        fecha_audiencia_proceso: null,
        duracion_dias: calcularDuracion(
          evalItem.fecha_apertura,
          evalItem.fecha_cierre,
        ),
        total_evidencias: 0,
        mes_apertura: evalItem.fecha_apertura
          ? evalItem.fecha_apertura.substring(0, 7)
          : null,
        trimestre_apertura: evalItem.fecha_apertura
          ? getTrimestre(evalItem.fecha_apertura)
          : null,
        año_apertura: evalItem.fecha_apertura
          ? evalItem.fecha_apertura.substring(0, 4)
          : null,
      });
    }
  });

  return flatData;
};

// ─── Funciones auxiliares ────────────────────────────────────────────────
const calcularDuracion = (
  fechaApertura: string | null,
  fechaCierre: string | null,
) => {
  if (!fechaApertura || !fechaCierre) return null;
  const diff =
    new Date(fechaCierre).getTime() - new Date(fechaApertura).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const contarEvidencias = (proceso: any) => {
  if (!proceso) return 0;
  let count = 0;
  for (const key in proceso) {
    if (key.startsWith("evidencias_") && Array.isArray(proceso[key])) {
      count += proceso[key].length;
    }
  }
  return count;
};

const getTrimestre = (fecha: string) => {
  const mes = new Date(fecha).getMonth() + 1; // 1-12
  if (mes >= 1 && mes <= 3) return "Q1";
  if (mes >= 4 && mes <= 6) return "Q2";
  if (mes >= 7 && mes <= 9) return "Q3";
  return "Q4";
};

// ─── Etiquetas de campo ──────────────────────────────────────────────────
const fieldLabels = {
  folio: "Folio",
  fecha_apertura: "Fecha Apertura",
  fecha_asesoria: "Fecha Asesoría",
  fecha_cierre: "Fecha Cierre",
  estatus_caso: "Estatus del Caso",
  tipo_asesoria: "Tipo Asesoría",
  tipo_medida: "Tipo Medida",
  motivo_cierre: "Motivo Cierre",
  responsable: "Responsable",
  autoridad_emisora: "Autoridad Emisora",
  entrevista_nombre: "Nombre",
  edad: "Edad",
  zona: "Zona",
  incidente_nombre: "Incidente",
  actor: "Actor",
  expediente: "Expediente",
  juzgado: "Juzgado",
  fecha_presentacion: "Fecha Presentación",
  fecha_radicacion: "Fecha Radicación",
  fecha_audiencia_proceso: "Fecha Audiencia (Proceso)",
  duracion_dias: "Duración (días)",
  total_evidencias: "Total Evidencias",
  mes_apertura: "Mes Apertura",
  trimestre_apertura: "Trimestre Apertura",
  año_apertura: "Año Apertura",
};



// ─── Componente principal ────────────────────────────────────────────────


const AnalyticsReport= () => {
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {items} = UseLegalData()
  useEffect(() => {
    if (items && items.length > 0) {
      const data = transformDataForDashboard(items);
      setTransformedData(data);
    }
    setLoading(false);
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B2242] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!transformedData || transformedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">
            No hay datos disponibles para mostrar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdvancedAnalyticsDashboard
        data={transformedData}
        fieldLabels={fieldLabels}
      />
    </div>
  );
};

export default AnalyticsReport;
