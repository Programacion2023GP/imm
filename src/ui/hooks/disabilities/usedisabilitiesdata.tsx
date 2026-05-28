// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type DisabilitiesDataDataReturn = GenericDataReturn<Catalogues>;

const UseDisabilitiesData = (): DisabilitiesDataDataReturn => {
   const initialState = useMemo<Catalogues>(
     () => ({
       id: 0,
      nombre:"",
     }),
     [],
   );

   return useGenericData<Catalogues>({
     initialState: initialState,
     prefix: "discapacidades",
     autoFetch: true,
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) => console.error("[UseDisabilitiesData]", msg),
     },
   });
};

export default UseDisabilitiesData;
