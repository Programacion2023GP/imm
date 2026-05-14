// hooks/useUsersData.ts
import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "react-zustore";
import type { UserForm } from "./users.model";

// ✅ Exportado — necesario para SuperCrud<Users> en la page

export type UsersDataReturn = GenericDataReturn<UserForm>;

const useUsersData = (): UsersDataReturn => {
   const initialState = useMemo<UserForm>(
      () => ({
         id: 0,
         employee_id: 0,
         username: "",
         email: "",
         password: "",
         active: true,
      }),
      [],
   );

   return useGenericData<UserForm>({
      defaultValues: initialState,
      prefix: "users",
      autoFetch: true,
      // persistKey: "user-persist",
      hooks: {
         onError: (msg) => console.error("[Users]", msg),
      },
   });
};

export default useUsersData;
