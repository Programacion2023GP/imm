// hooks/useUsersData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { UsersForm } from "../../../models/users/users.models";

// ✅ Exportado — necesario para SuperCrud<Users> en la page

export type UsersDataReturn = GenericDataReturn<UsersForm>;

const useUsersData = (): UsersDataReturn => {
   const initialState = useMemo<UsersForm>(
      () => ({
      id:0,
      id_rol:0,
      nombre_completo:"",
      password:"",
      usuario:"",
      activo:false
      }),
      [],
   );

   return useGenericData<UsersForm>({
     defaultValues: initialState,
     prefix: "usuarios",
     autoFetch: true,
     debug:true,
     // persistKey: "user-persist",
     hooks: {
       onError: (msg) => console.error("[Users]", msg),
     },
   });
};

export default useUsersData;
