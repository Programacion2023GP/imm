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
import UsePsychologicalEvaluationModuleData from "../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import { PDFViewer } from "@react-pdf/renderer";
import LegalPDF from "./components/pdf.legal.page";
import AnalyticsReport from "./components/analitic.legal.page";
import useAuthData from "../../hooks/auth/useauthdata";
import { useEffect } from "react";
import BitacoraCasos from "./components/bitacora.legal.page";

const LegalPage = () => {
  const { getLoby } = UseInterview();
  const legalData = UseLegalData();
  const juridicProccessData = UseJuridicProccessData();
  const psychologicalEvaluationModuleData =
    UsePsychologicalEvaluationModuleData();
  const { persist } = useAuthData();
  useEffect(() => {
    if (persist.auth.id_rol == 5) {
      legalData.setField("id_responsable", Number(persist.auth.id));
    }
  }, [legalData.open]);
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
                <CustomModal
                  expand
                  fullModal
                  isOpen={legalData.openPdf}
                  onClose={() => {
                    legalData.setExtra("openPdf", false);
                  }}
                  title={legalData.selected?.nombre}
                >
                  <PDFViewer width="100%" height="600px">
                    <LegalPDF data={legalData.selected as any} />
                  </PDFViewer>
                </CustomModal>

                <CompositeCrud
                  key={"Formulario-por-fecha"}
                  hook={legalData}
                  crudConfig={legalBuilderTable}
                  actionsDispatch={{
                    UseLegalData: legalData,
                    juridicProccessData: juridicProccessData,
                    psychologicalEvaluationModuleData:
                      psychologicalEvaluationModuleData,
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
                <CompositeCrud
                  key={"Formulario-Edicion-Expediente"}
                  callbacks={{
                    onBeforePost: () => {
                      getLoby("juridico");
                      legalData.reset();
                    },
                    onBeforeClosed: () => legalData.reset(),
                  }}
                  hook={legalData}
                  crudConfig={legalBuilderCrud}
                  actionsDispatch={{
                    psychologicalEvaluationModuleData:
                      psychologicalEvaluationModuleData,
                  }}
                  formTitles={{
                    modalTitleAdd: "Registro",
                    modalTitleUpdate: "Edicion",
                  }}
                />
                <FormProccessJuridic />
                <IncidentesCataloguesPage />
              </>
            ),
          },
          {
            id: "loby",
            label: "Loby",
            icon: <FileText className="w-4 h-4" />,
            content: (
              <>
                <IncidentesCataloguesPage />

                <CompositeLoby loby="juridico" />
                <CompositeCrud
                  key={"Formulario-Creacion-Expediente"}
                  callbacks={{
                    onBeforePost: () => {
                      getLoby("juridico");
                      legalData.reset();
                    },
                    onBeforeClosed: () => legalData.reset(),
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
          {
            id: "Grafico",
            label: "Graficas",
            content: <AnalyticsReport />,
          },
          {
            id: "Bitacora",
            label: "Bitacora",
            content: <BitacoraCasos />,
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
