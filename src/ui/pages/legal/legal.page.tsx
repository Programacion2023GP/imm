import CustomTab from "../../components/tab/customtab";

import CompositeLoby from "../components/loby/loby.page";

import { FileText, Building2 } from "lucide-react";
import CompositeCrud from "../../components/compositecustoms/compositeCrud";
import UseLegalData from "../../hooks/legal/uselegal";
import {
  legalBuilderCrud,
  legalBuilderTable,
} from "../../../crudbuilder/legal/legal.builder";
import UseInterview from "../../hooks/interview/interviewdata";
import CustomModal from "../../components/modal/modal";
import CasosExplorer from "./components/casosexplorer";
import FormProccessJuridic from "./components/formjuridicproccess";
import UseJuridicProccessData from "../../hooks/juridicproccess/useproccessjuridic";
import UseIncedentesTypeData from "../../hooks/incedentstypes/useincedentstypedata";
import FormikForm from "../../formik/Formik";
import { FormikInput } from "../../formik/FormikInputs/FormikInput";
import IncidentesCataloguesPage from "../catalogues/incidentestype/incidentes.catalogues.page";

const LegalPage = () => {
  const {  getLoby } = UseInterview();
  const legalData = UseLegalData();
  const juridicProccessData = UseJuridicProccessData();
  return (
    <>
      <CustomTab
        tabs={[
          {
            id: "list",
            label: "Lista",
            icon: <Building2 className="w-4 h-4" />,
            content: (
              <>
                <CompositeCrud
                  hook={legalData}
                  crudConfig={legalBuilderTable}
                  actionsDispatch={{
                    UseLegalData: legalData,
                    juridicProccessData: juridicProccessData,
                  }}
                  formTitles={{
                    modalTitleAdd: "Registro",
                    modalTitleUpdate: "Edicion",
                  }}
                />
                <CustomModal
                  title={legalData.selected?.nombre}
                  fullModal
                  expand
                  isOpen={legalData.openModal}
                  onClose={() => {
                    legalData.setExtra("openModal", false);
                  }}
                >
                  <CasosExplorer />
                </CustomModal>
                <FormProccessJuridic />
              </>
            ),
          },
          {
            id: "loby",
            label: "Loby",
            icon: <FileText className="w-4 h-4" />,
            content: (
              <>
              <IncidentesCataloguesPage/>

                <CompositeLoby loby="juridico" />
                <CompositeCrud
                  callbacks={{
                    onBeforePost: () => getLoby("juridico"),
                  }}
                  hook={legalData}
                  crudConfig={legalBuilderCrud}
                  formTitles={{
                    modalTitleAdd: "Registro",
                    modalTitleUpdate: "Edicion",
                  }}
                />
              </>
            ),
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
