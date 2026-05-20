import { usersBuilderCrud } from "../../../../crudbuilder/users/users.builder";
import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import useUsersData from "../../../hooks/users/useUsersdata";

const PageUsers = ({}) => {
  return (
    <>
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Usuario",
          modalTitleUpdate: "Editar Usuario",
        }}
        hook={useUsersData()}
        crudConfig={usersBuilderCrud}
      />
    </>
  );
};

export default PageUsers;
