import { permissionBuilderCrud } from "../../../../crudbuilder/permissions/permissions.builder";
import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import UsePermissions from "../../../hooks/permissions/usepermissionsdata";

const PagePermissions = ({}) => {
  return (
    <>
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Permiso",
          modalTitleUpdate: "Editar Permiso",
        }}
        hook={UsePermissions()}
        crudConfig={permissionBuilderCrud}
      />
    </>
  );
};

export default PagePermissions;
