// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import { Loby } from "../../../models/loby/loby.model";
import { ProccessJuridic } from "../../../models/proccessjuridic/processjuridic";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page


interface ExtraState {
  type:
    | "Presentación"
    | "Radicacion"
    | "Audiencia"
    | "Exhorto"
    | "Oficios"
    | "Promocion"
    | "Sentencia";
}
interface Methods {
}

export type DataReturn = GenericDataReturn<
  ProccessJuridic,
  Methods,
  {},
  ExtraState
>;

const UseJuridicProccessData = (): DataReturn => {
   const initialState = useMemo<ProccessJuridic>(
     () => ({
       id: 0,
       actor: "",
       comentarios_audiencia: "",
       comentarios_exhorto: "",
       comentarios_oficio: "",
       comentarios_presentacion: "",
       comentarios_promocion: "",
       comentarios_radicacion: "",
       comentarios_setencia: "",
       evidencias_audiencia: [],
       evidencias_exhorto: [],
       evidencias_oficio: [],
       evidencias_presentacion: [],
       evidencias_promocion: [],
       evidencias_radicacion: [],
       evidencias_setencia: [],
       expediente: "",
       fecha_audiencia: "",
       fecha_exhorto: "",
       fecha_oficios: "",
       fecha_presentacion: "",
       fecha_radicacion: "",
       fecha_setencia: "",
       juzgado: "",
       tipo_promocion: "",
       id_evaluaciones_juridicas: 0,
       id_tipo_caso_incidente: 0,
     }),
     [],
   );

   return useGenericData<ProccessJuridic, Methods, {}, ExtraState>({
     initialState: initialState,
     prefix: "processjuridic",
     autoFetch: false,
     extraState: {
       type: "Presentación",
     },
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) => console.error("[UseJuridicProccessData]", msg),
     },
     extension: (set, get, prefix) => ({}),
     
   });
};

export default UseJuridicProccessData;
