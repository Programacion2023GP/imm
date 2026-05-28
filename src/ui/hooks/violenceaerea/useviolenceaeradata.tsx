// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type ViolenceAereaDataReturn = GenericDataReturn<Catalogues>;

const UseViolenceAerea = (): ViolenceAereaDataReturn => {
   const initialState = useMemo<Catalogues>(
     () => ({
       id: 0,
      nombre:"",
     }),
     [],
   );

   return useGenericData<Catalogues>({
     initialState: initialState,
     prefix: "ambitoviolencia",
     autoFetch: true,
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) => console.error("[UseViolenceAerea]", msg),
     },
   });
};

export default UseViolenceAerea;
