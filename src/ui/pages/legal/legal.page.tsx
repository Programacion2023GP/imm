import CustomTab from "../../components/tab/customtab";

import CompositeLoby from "../components/loby/loby.page";

import { FileText, Building2 } from "lucide-react";
import LegalForm from "./legal.form.page";
import CompositeCrud from "../../components/compositecustoms/compositeCrud";
import UseLegalData from "../../hooks/legal/uselegal";
import { legalBuilderCrud } from "../../../crudbuilder/legal/legal.builder";


const LegalPage = () => {
  return (
    <>
      <CustomTab
        tabs={[
          {
            content: (
              <>
             
              </>
            ),
            id: "agenda",
            label: "Agenda",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            content: (<>
            <CompositeLoby loby="juridico" />
                 <CompositeCrud
                  hook={UseLegalData()}
                  crudConfig={legalBuilderCrud}
                  formTitles={{
                    modalTitleAdd: "Registro",
                    modalTitleUpdate: "Edicion",
                  }}
                /></>
            ),
            id: "loby",
            label: "Loby",
            icon: <FileText className="w-4 h-4" />,
          },
        ]}
        variant="modern"
        size="sm"
        fullWidth
      />
    </>
  );
};

export default LegalPage;
