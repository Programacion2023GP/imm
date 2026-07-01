import CustomTab from "../../components/tab/customtab";
import CompositeLoby from "../components/loby/loby.page";
import { FileText, Building2 } from "lucide-react";
import AgendaPro from "./calendary.page";
import { PsychologicalForm } from "./PsychologicalForm";
import UseInterview from "../../hooks/interview/interviewdata";
import CustomModal from "../../components/modal/modal";
import InterviewCaratula from "../interview/pdf/pageinterview.page.pdf";
import { PDFViewer } from "@react-pdf/renderer"; // 👈 agregar este import

const PsychologicalPage = () => {
  const interviewData = UseInterview();
  return (
    <>
      <CustomTab
        tabs={[
          {
            content: (
              <>
                <AgendaPro onEvent={(e) => console.log(e.type, e.payload)} />
                <CustomModal
                  title
                  fullModal
                  isOpen={interviewData.openCaratula}
                  onClose={() => {
                    interviewData.setExtra("openCaratula", false);
                  }}
                >
                  {/* 👇 Solo montamos el PDFViewer si hay datos, para no renderizar
                      el iframe vacío innecesariamente mientras el modal está cerrado */}
                  {interviewData.selectInterview && (
                    <PDFViewer
                      style={{
                        width: "100%",
                        height: "80vh",
                        border: "none",
                      }}
                    >
                      <InterviewCaratula data={interviewData.selectInterview} />
                    </PDFViewer>
                  )}
                </CustomModal>
              </>
            ),
            id: "agenda",
            label: "Agenda",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            content: <CompositeLoby loby="psicologo" />,
            id: "loby",
            label: "Loby",
            icon: <FileText className="w-4 h-4" />,
          },
        ]}
        variant="modern"
        size="sm"
        fullWidth
      />

      <PsychologicalForm />
    </>
  );
};

export default PsychologicalPage;
