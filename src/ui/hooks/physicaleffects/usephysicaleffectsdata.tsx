// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type PhysicalEffectsDataReturn = GenericDataReturn<Catalogues>;

const UsePhysicalEffects = (): PhysicalEffectsDataReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues>({
    initialState: initialState,
    prefix: "efectosfisicos",
    autoFetch: true,
    // persistKey: "departments-persist",
    hooks: {
      onError: (msg) => console.error("[UsePhysicalEffects]", msg),
    },
  });
};

export default UsePhysicalEffects;
