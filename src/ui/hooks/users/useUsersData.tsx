// hooks/useUsersData.ts
import { useMemo } from "react";
import type { UsersForm } from "../../../models/users/users.models";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";

// ✅ Exportado — necesario para SuperCrud<Users> en la page

export type UsersDataReturn = GenericDataReturn<UsersForm>;

const useUsersData = (): UsersDataReturn => {
   const initialState = useMemo<UsersForm>(
      () => ({
      id:0,
      id_rol:null,
      nombre_completo:"",
      password:"",
      usuario:"",
      activo:false
      }),
      [],
   );

   return useGenericData<UsersForm>({
      initialState: initialState,
      prefix: "usuarios",
      autoFetch: true,
      // persistKey: "user-persist",
      hooks: {
         onError: (msg) => console.error("[usuarios]", msg),
      },
   });
};

export default useUsersData;
