// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import { Loby } from "../../../models/loby/loby.model";
import { Legal, LegalTable } from "../../../models/legal/legal.model";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page


interface ExtraState {
  legal: Loby;
  selected:LegalTable,
  openModal:boolean,
}
interface Methods {
}

export type DataReturn = GenericDataReturn<
  Legal,
  Methods,
  {},
  ExtraState
>;

const UseLegalData = (): DataReturn => {
   const initialState = useMemo<Legal>(
     () => ({
      id:0,
      id_entrevista:0,
      activo:true,
      fecha_apertura:"",
      fecha_asesoria:"",
      hechos:"",
      id_responsable:0,
      id_casos_incidentes:[],
      id_estatus_caso:0,
      id_tipo_asesoria:0,
      carpeta_investigacion:null,
      causa_penal:null,
      comentarios_procesales:null,
      fecha_acompanamiento:null,
      fecha_denuncia:null,
      nombre_imputado:null,
      descripcion_medida:null,
      fecha_audiencia:null,
      fecha_medida:null,
      fecha_solicitud:null,
      fecha_termino_medida:null,
      id_autoridad_emisora:null,
      id_tipo_medida:null,
      fecha_cierre:null,
      id_motivo_cierre:null,
      observaciones:null
     }),
     [],
   );

   return useGenericData<Legal, Methods, {}, ExtraState>({
     initialState: initialState,
     prefix: "legal",
     autoFetch: true,
     extraState: {
       legal: null,
       selected:null,
       openModal:false
     },
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) =>
         console.error("[UseLegalData]", msg),
     },
     extension: (set, get, prefix) => ({
      
      
     }),
   });
};

export default UseLegalData;
