import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import { departmentCrudConfig } from "../../../hooks/departaments/departaments.model";
import useDepartamentsData from "../../../hooks/departaments/useDepartamentsData";
import useOrganizationsData from "../../../hooks/organization/useOrganizationsData";

const PageDepartments = ({}) => {
   const contextOrganizations = useOrganizationsData();
   return (
      <>
         <SuperCrud
            titles={{
               modalTitleAdd: "Agregar Departamento",
               modalTitleUpdate: "Editar Departamento",
            }}
            hook={useDepartamentsData()}
            crudConfig={departmentCrudConfig}
         />
      </>
   );
};

export default PageDepartments;
