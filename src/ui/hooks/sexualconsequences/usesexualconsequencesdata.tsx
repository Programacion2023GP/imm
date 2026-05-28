// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type SexualConsequencesDataReturn = GenericDataReturn<Catalogues>;

const UseSexualConsequences = (): SexualConsequencesDataReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues>({
    initialState: initialState,
    prefix: "consecuenciassexuales",
    autoFetch: true,
    // persistKey: "departments-persist",
    hooks: {
      onError: (msg) => console.error("[UseSexualConsequences]", msg),
    },
  });
};

export default UseSexualConsequences;
