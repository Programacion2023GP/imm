// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type InjuredAnatomicAlareaReturn = GenericDataReturn<Catalogues>;

const UseInjuredAnatomicAlarea = (): InjuredAnatomicAlareaReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues>({
    initialState: initialState,
    prefix: "agentelesion",
    autoFetch: true,
    // persistKey: "departments-persist",
    hooks: {
      onError: (msg) => console.error("[UseInjuredAnatomicAlarea]", msg),
    },
  });
};

export default UseInjuredAnatomicAlarea;
