import { usersBuilderCrud } from "../../../../crudbuilder/users/users.builder";
import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import useUsersData from "../../../hooks/users/useUsersData";

const PageUsers = ({}) => {
  const usersData = useUsersData();


  return (
    <>
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Usuario",
          modalTitleUpdate: "Editar Usuario",
        }}
        hook={usersData}
        crudConfig={usersBuilderCrud}
      />
    </>
  );
};

export default PageUsers;
