// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { Organizations } from "./organizations.model";

// ✅ Exportado — necesario para SuperCrud<Organizations> en la page

export type OrganizationsDataReturn = GenericDataReturn<Organizations>;

const useOrganizationsData = (): OrganizationsDataReturn => {
   const initialState = useMemo<Organizations>(
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

   return useGenericData<Organizations>({
      defaultValues: initialState,
      prefix: "departments",
      autoFetch: true,
      // persistKey: "departaments-persist",
      hooks: {
         onError: (msg) => console.error("[Organizations]", msg),
      },
   });
};

export default useOrganizationsData;
