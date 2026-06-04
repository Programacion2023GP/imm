// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import { Loby } from "../../../models/loby/loby.model";
import { PyschologicalEvaluation } from "../../../models/psychologicalevaluation.tsx/psychological.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page


interface ExtraState {
  psychologicalEvaluation: Loby;
  listDiary:{id:number,nombre:string}[]
}
interface Methods {
  getDiary:()=>void
}

export type DataReturn = GenericDataReturn<
  PyschologicalEvaluation,
  Methods,
  {},
  ExtraState
>;

const UsePsychologicalEvaluationModuleData = (): DataReturn => {
   const initialState = useMemo<PyschologicalEvaluation>(
     () => ({
      id:0,
      fecha_alta:"",
      id_responsable:null,
      id_problematica_abordada:[],
      id_violencia_asociada:[],
      especifique_problematica_abordada:null,
      activo:true,
      id_entrevista:0,
     }),
     [],
   );

   return useGenericData<PyschologicalEvaluation, Methods, {}, ExtraState>({
     initialState: initialState,
     prefix: "evaluacionpsicologica",
     autoFetch: false,
     extraState: {
       psychologicalEvaluation: null,
       listDiary: [],
     },
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) =>
         console.error("[UsePsychologicalEvaluationModuleData]", msg),
     },
     extension: (set, get, prefix) => ({
      
       getDiary:async()=>{
         set({loading:true})
        try {
           const res = await get().request({
            method:"GET",
            url:`${get().prefix}/agenda`,
            getData:false,
  
           })
          set({ loading: false });
  
           set({ listDiary: res as unknown as { id: number; nombre: string }[] });
          
        } catch (error) {
         set({ loading: false, listDiary:[] });
          
        }
       }
     }),
   });
};

export default UsePsychologicalEvaluationModuleData;
