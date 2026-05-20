import { rolBuilderCrud } from "../../../../crudbuilder/roles/roles.builder";
import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import CustomModal from "../../../components/modal/modal";
import { DataTransfer } from "../../../components/transferlist/TransferList";
import UsePermissions from "../../../hooks/permissions/usepermissionsdata";
import UseRoles from "../../../hooks/roles/userolesdata";

// PageRoles.tsx
const PageRoles = () => {
  // ✅ Llama los hooks UNA sola vez aquí arriba
  const rolesHook = UseRoles();
  const permissionsHook = UsePermissions();

  const handleSave = (idsSeleccionados: (string | number)[]) => {
    rolesHook.unChangePermissions(rolesHook?.rol?.id, idsSeleccionados as number[]);
  };

  return (
    <>
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Rol",
          modalTitleUpdate: "Editar Rol",
        }}
        hook={rolesHook}
        actionsDispatch={{ UseRoles: rolesHook }}
        crudConfig={rolBuilderCrud}
      />
      <CustomModal
        // zIndex={'900'}
        isOpen={rolesHook.openRolPermission}
        onClose={rolesHook.toggleOpenRolPermission}
        title={rolesHook?.rol?.nombre_rol}
      >
        <DataTransfer
          items={permissionsHook.items}
          selectedIds={rolesHook?.rol?.permissions}
          getId={(item) => item.id}
          getName={(item) => item.nombre_permiso}
          getGroup={(item) => item.modulo}
          onSave={handleSave}
        />
      </CustomModal>
    </>
  );
};

export default PageRoles;
