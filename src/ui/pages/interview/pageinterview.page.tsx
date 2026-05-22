import { interviewBuilderCrud } from "../../../crudbuilder/interview/interview.builder";
import SuperCrud from "../../components/compositecustoms/compositeCrud";
import UseInterview from "../../hooks/interview/interviewdata";

const PageInterview = ({}) => {
  const interviewData = UseInterview();

  return (
    <>
    
      <SuperCrud
        formTitles={{
          modalTitleAdd: "Agregar Entrevista",
          modalTitleUpdate: "Editar Entrevista",
        }}
        hook={interviewData}
        crudConfig={interviewBuilderCrud}
      />
    </>
  );
};

export default PageInterview;
