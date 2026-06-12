// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import { Loby } from "../../../models/loby/loby.model";
import { Legal } from "../../../models/legal/legal.model";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page


interface ExtraState {
  legal: Loby;
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
      id_asesoria:0,
      id_responsable:0,
      
     }),
     [],
   );

   return useGenericData<Legal, Methods, {}, ExtraState>({
     initialState: initialState,
     prefix: "juridico",
     autoFetch: false,
     extraState: {
       legal: null,
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
