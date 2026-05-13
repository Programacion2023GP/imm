import SuperCrud from "../../../components/compositecustoms/compositeCrud";
import { user2CrudConfig } from "../../../hooks/departaments/departaments.model";
import useDepartamentsData from "../../../hooks/departaments/usedepartamentsdata";

const PageDepartments = ({}) => {
   return (
      <>
         <SuperCrud
            titles={{
               modalTitleAdd: "Agregar Departamento",
               modalTitleUpdate: "Editar Departamento",
            }}
            hook={useDepartamentsData()}
            crudConfig={user2CrudConfig}
         />
      </>
   );
};

export default PageDepartments;
