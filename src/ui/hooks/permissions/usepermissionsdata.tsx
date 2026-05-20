// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { PermissionForm } from "../../../models/permissions/permission.models";

// ✅ Exportado — necesario para SuperCrud<Departaments> en la page

export type PermissionsDataReturn = GenericDataReturn<PermissionForm>;

const UsePermissions = (): PermissionsDataReturn => {
   const initialState = useMemo<PermissionForm>(
     () => ({
       id: 0,
       activo: true,
       descripcion: "",
       modulo: "",
       nombre_permiso: "",
     }),
     [],
   );

   return useGenericData<PermissionForm>({
     defaultValues: initialState,
     prefix: "permisos",
     autoFetch: true,
     // persistKey: "departments-persist",
     hooks: {
       onError: (msg) => console.error("[Permissions]", msg),
     },
   });
};

export default UsePermissions;
