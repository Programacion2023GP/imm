// hooks/useInterviewData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type {
  InterviewForm,
  Dependientes,
  RedApoyo,
  InterviewTable,
  EntrevistaShowResponse,
} from "../../../models/interview/interview.model";
import { Loby } from "../../../models/loby/loby.model";

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
  dataAll: InterviewTable[];
  lobyData: Loby[];
  lobyLoading: boolean;
  openCaratula: boolean;
  selectInterview: EntrevistaShowResponse;
}

export interface Methods {
  getCp: (cp: number) => Promise<void>;
  getCpAgresor: (cp: number) => Promise<void>;
  getLoby: (string: "psicologo" | "juridico") => void;
  getAllData: () => void;
  getPdf: (id: number) => void;
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
  nombre:null,
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

  // RED DE APOYO (ARRAY)
  redapoyo: [] as RedApoyo[],

  // OTRAS CONDICIONES
  vive_situacion_calle: false,
  tiene_adiccion: false,
  conducta: "",
};

// PASO 6: PERSONA AGRESORA
const agresorInicial = {
  conoce_agresor: false,
  nombre_agresor: "",
  edad_agresor: "",
  sexo_agresor: "",
  id_vinculo_agresor: 0,
  id_identidad_genero_agresor: 0,
  id_orientacion_sexual_agresor: 0,
  vive_domicilio_victima: false,
  codigo_postal_agresor: 0,
  colonia_agresor: "",
  estado_agresor: "",
  municipio_agresor: "",
  calle_agresor: "",
  num_ext_agresor: 0,
  num_int_agresor: 0,
  entre_calles_agresor: "",
  referencias_agresor: "",
  zona_agresor: "",
  id_ultimo_grado_estudios_agresor: 0,
  id_ingreso_promedio_mensual_agresor: 0,
  id_ocupacion_agresor: 0,
  acceso_armas_agresor: false,
  id_armas_agresor: 0,
  acceso_drogas_agresor: false,
  id_drogas_agresor: [] as number[],
};

// PASO 7: RUTA DE ATENCIÓN
const rutaAtencionInicial = {
  id_servicios_trabajo_social: [] as number[],
  id_servicios_juridicos: [] as number[],
  id_servicios_psicologicos: [] as number[],
};

// PASO 8: CANALIZACIÓN
const canalizacionInicial = {
  id_dependencia: 0,
  especifica_dependencia: "",
  id_canalizacion: 0,
  fecha_canalizacion: "",
  responsable: "",
  observaciones: "",
};

// ─── FORMULARIO COMPLETO ─────────────────────────────────────────────────────
export const initialInterviewForm: InterviewForm = {
  ...aperturaInicial,
  ...narracionInicial,
  ...clasificacionInicial,
  ...efectosInicial,
  ...datosVictimaInicial,
  ...agresorInicial,
  ...rutaAtencionInicial,
  ...canalizacionInicial,
};

// ─── HOOK PRINCIPAL ─────────────────────────────────────────────────────────
const UseInterview = (): InterviewDataReturn => {
  const initialState = useMemo<InterviewForm>(() => initialInterviewForm, []);

  return useGenericData<InterviewForm, Methods, {}, ExtraStateInterview>({
    initialState: initialState,
    prefix: "entrevista",
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
      loadingCp_agresor: false,
      lobyData: [],
      lobyLoading: false,
      dataAll: [],
      openCaratula: false,
      selectInterview: null,
    },

    hooks: {
      onError: (msg) => console.error("[entrevista]", msg),
    },

    extension: (set, get, prefix) => ({
      handleChangeItem: (item: InterviewForm) => {
        set({initialValues:item})

        if (item.codigo_postal) {
          get().getCp(item.codigo_postal);
        }
        if (item.codigo_postal_agresor) {
          get().getCpAgresor(item.codigo_postal_agresor);
        }
      },
      getCp: async (cp) => {
        set({ loadingCp: true });

        try {
          const response = await fetch(
            `https://cp.atc.gomezpalacio.gob.mx/api/cp/${cp}`,
          );
          const res = await response.json();

          const resultados = res.data.result;

          const colonias = resultados.map((item: any) => ({
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

          const resultados = res.data.result;

          const colonias = resultados.map((item: any) => ({
            id: item.id,
            nombre: item.Colonia,
            codigoPostal: item.CodigoPostal,
            tipo: item.Tipo,
            zona: item.Zona,
            municipio: item.Municipio,
            estado: item.Estado,
          }));

          console.log("cargando inf", colonias);
          set({ colonias_agresor: colonias, loadingCp_agresor: false });

          return res;
        } catch (error) {
          console.error("❌ Error en getCpAgresor:", error);
          set({ loadingCp_agresor: false });
        }
      },
      getLoby: async (option: "psicologo" | "juridico") => {
        try {
          set({ lobyLoading: true });
          const res = await get().request({
            method: "GET",
            formData: false,
            url: `${get().prefix}/${option}`,
          });
          set({ lobyData: res as unknown as Loby[], lobyLoading: false });
        } catch (error) {
          set({ lobyData: [], lobyLoading: false });
        }
      },
      getAllData: async () => {
        try {
          const res = await get().request({
            method: "GET",
            formData: false,
            url: `${get().prefix}/all`,
          });
          set({ lobyData: res as unknown as Loby[] });
        } catch (error) {
          set({ lobyData: [] });
        }
      },
      getPdf: async (id: number) => {
        try {
          const res = await get().request({
            method: "GET",
            formData: false,
            url: `${get().prefix}/show/${id}`,
          });

          // Validar que sea un array y tenga al menos un elemento
          if (Array.isArray(res) && res.length > 0 && res[0]) {
            set({
              selectInterview: res[0] as unknown as EntrevistaShowResponse,
              openCaratula: true,
            });
          } else {
            set({
              selectInterview: null,
              openCaratula: false,
            });
          }
        } catch (error) {
          set({
            selectInterview: null,
            openCaratula: false,
          });
        }
      },
    }),
  });
};

export default UseInterview;
