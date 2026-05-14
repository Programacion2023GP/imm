// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { OrganizationForm } from "./organizations.model";

// ✅ Exportado — necesario para SuperCrud<Organizations> en la page

export type OrganizationsDataReturn = GenericDataReturn<OrganizationForm>;

const useOrganizationsData = (): OrganizationsDataReturn => {
   const initialState = useMemo<OrganizationForm>(
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

   return useGenericData<OrganizationForm>({
      defaultValues: initialState,
      prefix: "organizations",
      autoFetch: true,
      // persistKey: "organization-persist",
      hooks: {
         onError: (msg) => console.error("[Organizations]", msg),
      },
   });
};

export default useOrganizationsData;
