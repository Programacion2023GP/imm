// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import { Event } from "../../../models/events/event.model";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

interface ExtraState {}
interface Methods {}

export type DataReturn = GenericDataReturn<Event, Methods, {}, ExtraState>;

const UseEventData = (): DataReturn => {
  const initialState = useMemo<Event>(
    () => ({
      id: 0,
      asistentes: [],
      comunidad_lgbtq: false,
      duracion_estimada: null,
      edad: null,
      especifique: null,
      fecha_realizacion: null,
      id_aerea_organizadora: null,
      id_tipo_actividad: null,
      lugar: null,
      numero_asistentes: null,
      otro: null,
      persona_discapacidad: false,
      poblacion_afrodescediente: false,
      poblacion_indigena: false,
      poblacion_migrante: false,
      ponente_facilitador: null,
      sexo: null,
      tema_central: null,
      acciones_programadas: "",
      comentarios: "",
      evidencias: [],
      fecha_proxima: null,
      id_responsable_seguimiento: null,
      id_seguimiento_control: null,
      id_user_created:null,
    }),
    [],
  );

  return useGenericData<Event, Methods, {}, ExtraState>({
    initialState: initialState,
    prefix: "eventos",
    autoFetch: true,
    extraState: {},
    // persistKey: "departments-persist",
    hooks: {
      onError: (msg) => console.error("[UseEventData]", msg),
    },
    extension: (set, get, prefix) => ({}),
  });
};

export default UseEventData;
