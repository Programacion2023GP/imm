// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type PrivateTransportationDataReturn = GenericDataReturn<Catalogues>;

const UsePrivateTransportation = (): PrivateTransportationDataReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues>({
    initialState: initialState,
    prefix: "transporteprivado",
    autoFetch: true,
    // persistKey: "departments-persist",
    hooks: {
      onError: (msg) => console.error("[UsePrivateTransportation]", msg),
    },
  });
};

export default UsePrivateTransportation;
