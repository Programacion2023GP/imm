// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { Departaments } from "./departaments/departaments.model";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page





export type DepartamentsDataReturn = GenericDataReturn<Departaments>;

const useDepartamentsData = (): DepartamentsDataReturn => {
  const initialState = useMemo<Departaments>(
    () => ({
      id: 0,
      uuid: null,
      active: true,
      code: null,
      created_at: null,
      deleted_at: null,
      end_date: null,
      name: null,
      organization_id: null,
      seal_image: null,
      start_date: null,
      updated_at: null,
    }),
    [],
  );

  return useGenericData<Departaments>({
    defaultValues:initialState,
    prefix: "departments",
    autoFetch: true,
    // persistKey: "departaments-persist",
    hooks: {
      onError: (msg) => console.error("[Departaments]", msg),
    },
  });
};

export default useDepartamentsData;
