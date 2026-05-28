// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type ParticleSpaceDataReturn = GenericDataReturn<Catalogues>;

const UseParticleSpace = (): ParticleSpaceDataReturn => {
   const initialState = useMemo<Catalogues>(
     () => ({
       id: 0,
      nombre:"",
     }),
     [],
   );

   return useGenericData<Catalogues>({
     initialState: initialState,
     prefix: "espacioparticular",
     autoFetch: true,
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) => console.error("[UseParticleSpace]", msg),
     },
   });
};

export default UseParticleSpace;
