// hooks/useCatalogueData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

export type DataReturn = GenericDataReturn<Catalogues>;

// ✅ Hook genérico que recibe el prefijo
const UseCatalogueData = (
  prefix: string,
): DataReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues>({
    initialState: initialState,
    prefix: `catalogo/${prefix}`, // 👈 Recibido por parámetro
    autoFetch: true,
    hooks: {
      onError: (msg) => console.error(`[UseCatalogueData:${prefix}]`, msg),
    },
  });
};

export default UseCatalogueData;
