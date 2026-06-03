// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import { Loby } from "../../../models/loby/loby.model";
import { PyschologicalEvaluation } from "../../../models/psychologicalevaluation.tsx/psychological.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page


interface ExtraState {
  psychologicalEvaluation: Loby;
}

export type DataReturn = GenericDataReturn<PyschologicalEvaluation, {}, {}, ExtraState>;

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

   return useGenericData<PyschologicalEvaluation, {}, {}, ExtraState>({
     initialState: initialState,
     prefix: "evaluacionpsicologica",
     autoFetch: false,
     extraState:{
      psychologicalEvaluation:null
     },
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) =>
         console.error("[UsePsychologicalEvaluationModuleData]", msg),
     },
   });
};

export default UsePsychologicalEvaluationModuleData;
