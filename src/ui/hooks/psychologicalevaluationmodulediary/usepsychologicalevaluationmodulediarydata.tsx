// hooks/psychologicalevaluationmodule/usepsychologicalevaluationmodulediarydata.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";

export interface Cita {
  id: number;
  personaId: number;
  fecha: string;
  hora: string;
  duracion: number;
  asistio: boolean;
  notasSeguimiento: string;
}

export interface AgendaData {
  personas: Person[];
  citas: Cita[];
  cierres: CierreCaso[];
}

export interface Person {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  notas?: string;
}

export interface CierreCaso {
  personaId: number;
  diagnosticoFinal: string;
  motivo: string;
  otroMotivo?: string;
  fechaCierre: string;
  cerradoEn: string;
}

interface ExtraState {
  agendaData: AgendaData;
  listDiary: Person[];
  closures: CierreCaso[]; // ✅ Agregado closures al estado extra
}

interface Methods {
  saveAppointment: (cita: Cita) => Promise<any>;
  deleteAppointment: (id: number) => Promise<any>;
  moveAppointment: (id: number, nuevaFecha: string) => Promise<any>;
  closeCase: (cierre: Omit<CierreCaso, "cerradoEn">) => Promise<any>;
  loadAgenda: () => Promise<void>;
  reabrirCaso: (personaId: number) => Promise<any>;
}

export type DataReturn = GenericDataReturn<any, Methods, {}, ExtraState>;

const UsePsychologicalEvaluationModuleDiaryData = (): DataReturn => {
  const initialState = useMemo(() => ({}), []);

  return useGenericData<any, Methods, {}, ExtraState>({
    initialState: initialState,
    prefix: "agenda",
    autoFetch: false,
    extraState: {
      agendaData: {
        personas: [],
        citas: [],
        cierres: [],
      },
      listDiary: [],
      closures: [], // ✅ Inicializar closures vacío
    },
    hooks: {
      onError: (msg) =>
        console.error("[UsePsychologicalEvaluationModuleDiaryData]", msg),
    },
    extension: (set, get, persist) => ({
      // Cargar toda la agenda
      loadAgenda: async () => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "GET",
            url: `${get().prefix}/datosiniciales`,
            getData: false,
          });
          set({
            loading: false,
            agendaData: res as AgendaData,
            items: (res as AgendaData)?.citas || [],
            listDiary: (res as AgendaData)?.personas || [],
            closures: (res as AgendaData)?.cierres || [], // ✅ Actualizar closures
          });
        } catch (error) {
          set({ loading: false });
          console.error("Error loading agenda:", error);
        }
      },

      // Guardar cita (crear o actualizar)
      saveAppointment: async (cita: Cita) => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "POST",
            url: `${get().prefix}/citas`,
            data: cita,
            getData: false,
          });
          await get().loadAgenda();
          set({ loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          console.error("Error saving appointment:", error);
        }
      },

      // Eliminar cita
      deleteAppointment: async (id: number) => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "DELETE",
            url: `${get().prefix}/citas/${id}`,
            getData: false,
          });
          await get().loadAgenda();
          set({ loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          console.error("Error deleting appointment:", error);
        }
      },

      // Mover cita a otra fecha
      moveAppointment: async (id: number, nuevaFecha: string) => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "POST",
            url: `${get().prefix}/citas/${id}/mover`,
            data: { nuevaFecha },
            getData: false,
          });
          await get().loadAgenda();
          set({ loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          console.error("Error moving appointment:", error);
        }
      },

      // Cerrar caso
      closeCase: async (cierre: Omit<CierreCaso, "cerradoEn">) => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "POST",
            url: `${get().prefix}/cierrescaso`,
            data: cierre,
            getData: false,
          });
          await get().loadAgenda();
          set({ loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          console.error("Error closing case:", error);
        }
      },

      // Reabrir caso
      reabrirCaso: async (personaId: number) => {
        try {
          set({ loading: true });
          const res = await get().request({
            method: "DELETE",
            url: `${get().prefix}/cierrescaso/${personaId}`,
            getData: false,
          });
          await get().loadAgenda();
          set({ loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          console.error("Error reopening case:", error);
        }
      },
    }),
  });
};

export default UsePsychologicalEvaluationModuleDiaryData;
