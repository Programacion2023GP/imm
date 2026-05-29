// hooks/useInterviewData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type {
  InterviewForm,
  Dependientes,
} from "../../../models/interview/interview.model";

export interface Colonia {
  id: number;
  nombre: string;
  codigoPostal: string;
  tipo: string;
  zona: string;
  municipio: string;
  estado: string;
}

export interface ExtraStateInterview {
  colonias: Colonia[];
  estado: string;
  municipio: string;
  zona: string;
  loadingCp: boolean;
  colonias_agresor: Colonia[];
  estado_agresor: string;
  municipio_agresor: string;
  zona_agresor: string;
  loadingCp_agresor: boolean;
}

export interface Methods {
  getCp: (cp: number) => Promise<void>;
  getCpAgresor: (cp: number) => Promise<void>;
}

export type InterviewDataReturn = GenericDataReturn<
  InterviewForm,
  Methods,
  {},
  ExtraStateInterview
>;

// ─── VALORES INICIALES POR PASO ──────────────────────────────────────────────

// PASO 1: APERTURA DEL CASO
const aperturaInicial = {
  id: 0,
  curp: "",
};

// PASO 2: NARRACIÓN DE LOS HECHOS
const narracionInicial = {
  hechos: "",
  id_espacio_digital: [] as number[],
  id_espacio_particular: [] as number[],
  id_espacio_publico: [] as number[],
  id_transporte_foraneo: [] as number[],
  id_transporte_urbano: [] as number[],
  id_transporte_privado: [] as number[],
  ocurrio_domicilio_victima: false,
  especifica_domicilio: "",
  sector: "",
  ocurrio_extranjero: false,
  fecha_hecho: "",
  hora_hecho: "",
  dia_festivo: false,
  conoce_autoridad_asunto: false,
  canalizado_cabi: false,
};

// PASO 3: CLASIFICACIÓN DE LA VIOLENCIA
const clasificacionInicial = {
  id_tipos_violencia: [] as number[],
  especifique_tipo_violencia: "",
  id_ambitos_violencia: [] as number[],
  victima_delicuencia_organizada: false,
  relacion_denuncia: false,
  relacionado_orientacion_indetidad_genero: false,
};

// PASO 4: EFECTOS DE LA VIOLENCIA
const efectosInicial = {
  id_efectos_fisicos: [] as number[],
  especifique_efecto_fisico: "",
  id_consecuencias_sexuales: [] as number[],
  especifique_consecuencia_sexual: "",
  id_efectos_psicologicos: [] as number[],
  especifique_efecto_psicologico: "",
  id_efectos_economicos_patrimoniales: [] as number[],
  especifique_economicos_patrimonial: "",
  id_agente_lesion: [] as number[],
  especifique_agente_lesion: "",
  id_aerea_anatomica_lesionada: [] as number[],
  especifique_aerea_anatomica_lesionada: "",
};

// PASO 5: DATOS DE LA VÍCTIMA
const datosVictimaInicial = {
  vive_extrajero: false,
  fecha_nacimiento: "",
  edad: 0,
  telefono: "",
  correo: "",
  id_orientacion_sexual: 0,
  id_identidad_genero: 0,
  id_estado_civil: 0,
  id_ultimo_grado_estudios: 0,
  id_ingreso_promedio_mensual: 0,
  id_actividad: 0,
  realiza_mas_actividades: false,
  id_servicio_medico: 0,
  codigo_postal: 0,
  colonia: "",
  estado: "",
  municipio: "",
  localidad: "",
  calle: "",
  num_ext: 0,
  num_int: 0,
  entre_calles: "",
  referencias: "",
  zona: "",

  // CONDICIONES ESPECÍFICAS
  migrante: false,
  pertenece_pueblo_indigena: false,
  autoidentificacion_etnica: "",
  tiene_discapacidad: false,
  id_discapacidad: 0,
  discapacidad_causada_violencia: false,
  enfermedad_cronica_degenerativa: false,
  trastorno_neurologico_mental: false,
  tratado_medicamente_actualmente: false,
  embarazo: false,
  semananas_embarazo: 0,
  tiene_dependientes: false,
  vive_extranjero: false,

  // DEPENDIENTES (ARRAY)
  dependientes: [] as Dependientes[],
};

// ─── FORMULARIO COMPLETO ─────────────────────────────────────────────────────
export const initialInterviewForm: InterviewForm = {
  ...aperturaInicial,
  ...narracionInicial,
  ...clasificacionInicial,
  ...efectosInicial,
  ...datosVictimaInicial,
};

// ─── HOOK PRINCIPAL ─────────────────────────────────────────────────────────
const UseInterview = (): InterviewDataReturn => {
  const initialState = useMemo<InterviewForm>(() => initialInterviewForm, []);

  return useGenericData<InterviewForm, Methods, {}, ExtraStateInterview>({
    initialState: initialState,
    prefix: "interview",
    autoFetch: true,
    extraState: {
      colonias: [],
      estado: "",
      municipio: "",
      zona: "",
      loadingCp: false,
      colonias_agresor: [],
      estado_agresor: "",
      municipio_agresor: "",
      zona_agresor: "",
      loadingCp_agresor: false
    },

    hooks: {
      onError: (msg) => console.error("[Interview]", msg),
    },

    extension: (set, get, prefix) => ({
      getCp: async (cp) => {
        set({ loadingCp: true });

        try {
          const response = await fetch(
            `https://cp.atc.gomezpalacio.gob.mx/api/cp/${cp}`,
          );
          const res = await response.json();

          // Según la estructura de tu respuesta, los resultados están en res.result
          const resultados = res.data.result; // ← esto ya es el array de resultados

          const colonias = resultados.map((item) => ({
            id: item.id,
            nombre: item.Colonia,
            codigoPostal: item.CodigoPostal,
            tipo: item.Tipo,
            zona: item.Zona,
            municipio: item.Municipio,
            estado: item.Estado,
          }));

          set({ colonias: colonias, loadingCp: false });

          return res;
        } catch (error) {
          console.error("❌ Error en getCp:", error);
          set({ loadingCp: false });
        }
      },
      getCpAgresor: async (cp) => {
        set({ loadingCp_agresor: true });

        try {
          const response = await fetch(
            `https://cp.atc.gomezpalacio.gob.mx/api/cp/${cp}`,
          );
          const res = await response.json();

          // Según la estructura de tu respuesta, los resultados están en res.result
          const resultados = res.data.result; // ← esto ya es el array de resultados

          const colonias = resultados.map((item) => ({
            id: item.id,
            nombre: item.Colonia,
            codigoPostal: item.CodigoPostal,
            tipo: item.Tipo,
            zona: item.Zona,
            municipio: item.Municipio,
            estado: item.Estado,
          }));
          console.log("cargando inf",colonias)
          set({ colonias_agresor: colonias, loadingCp_agresor: false });

          return res;
        } catch (error) {
          console.error("❌ Error en getCp:", error);
          set({ loadingCp_agresor: false });
        }
      },
    }),
  });
};

export default UseInterview;
