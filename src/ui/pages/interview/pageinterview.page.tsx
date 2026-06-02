import { useEffect } from "react";
import { interviewBuilderCrud } from "../../../crudbuilder/interview/interview.builder";
import SuperCrud from "../../components/compositecustoms/compositeCrud";
import UseInterview from "../../hooks/interview/interviewdata";
import CustomModal from "../../components/modal/modal";
import PdfPreview from "../../components/pdfview/pdfview";
import { InterviewCaratula } from "./pdf/pageinterview.page.pdf";
import CustomBadge from "../../components/badge/custombadge";

const PageInterview = ({}) => {
  const interviewData = UseInterview();
  useEffect(()=>{
    interviewData.getAllData()
  },[])
  return (
    <>
     
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Entrevista",
          modalTitleUpdate: "Editar Entrevista",
        }}
        actionsDispatch={{
          // ← ¡AQUÍ ESTÁ LA CLAVE!
          UseInterview: interviewData,
        }}
        hook={interviewData}
        crudConfig={interviewBuilderCrud}
      />
      <CustomModal
        isOpen={interviewData.openCaratula}
        onClose={() => {
          interviewData.setExtra("openCaratula", false);
        }}
        title={"Caratula"}
      >
        <PdfPreview name={"Caratula"}>
          <InterviewCaratula data={interviewData.selectInterview} />
        </PdfPreview>
      </CustomModal>
    </>
  );
};

export default PageInterview;
