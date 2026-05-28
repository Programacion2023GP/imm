// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import type { RolesForm } from "../../../models/roles/roles.models";
import UsePermissions from "../permissions/usepermissionsdata";
import { useGenericData, type GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";

export interface ExtraState {
  openRolPermission: boolean;
  rol: RolesForm;
}

export interface Methods {
  toggleOpenRolPermission: () => void; // 👈 Método para toggle
  unChangeRol: (rol: RolesForm) => void;
  unChangePermissions: (id: number, permissions: number[]) => void;
}

export type RolesDataReturn = GenericDataReturn<
  RolesForm,
  Methods,
  {},
  ExtraState
>;

const UseRoles = (): RolesDataReturn => {
  const initialState = useMemo<RolesForm>(
    () => ({
      id: 0,
      activo: true,
      descripcion: "",
      nombre_rol: "",
      permissions: [],
    }),
    [],
  );

  return useGenericData<RolesForm, Methods, {}, ExtraState>({
    initialState: initialState,
    prefix: "roles",
    autoFetch: true,

    extraState: {
      openRolPermission: false,
      rol: {
        id: 0,
        nombre_rol: "",
        descripcion: "",
        activo: false,
        permissions: [],
      },
    },
    hooks: {
      onError: (msg) => console.error("[Roles]", msg),
    },
    extension: (set, get) => ({
      toggleOpenRolPermission: () => {
        set({ openRolPermission: !get().openRolPermission });
      },
      unChangeRol: (rol) => {
        set({ rol });
      },
      unChangePermissions: async (id: number, permissions: number[]) => {
        get()
          .request({
            method: "POST",
            url: `${get().prefix}/unchangepermissions`,
            data: {
              id,
              permissions,
            },
            getData: false,
          })
          .finally(() => {
            UsePermissions().refresh();

            set({ openRolPermission: false });
          });
      },
    }),
  });
};

export default UseRoles;
