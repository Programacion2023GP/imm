import { useEffect } from "react";
import CustomTable from "../../../components/table/customtable";
import UseInterview from "../../../hooks/interview/interviewdata";
import CustomButton from "../../../components/button/custombuttom";
import { FaRegAddressBook } from "react-icons/fa6";
import Tooltip from "../../../components/toltip/Toltip";
import UsePsychologicalEvaluationModuleData from "../../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";

const CompositeLoby = ({ loby }: { loby: "psicologo" | "juridico" }) => {
  const { lobyData, lobyLoading, getLoby } = UseInterview();
 const {
   setExtra: setExtraPsychological,
   setOpen: setModalOpenPsychological,
   handleChangeItem: setHandlePsychological,
   initialValues: initialValuesPsychological,
   
 } = UsePsychologicalEvaluationModuleData();
  useEffect(() => {
    getLoby(loby);
  }, [loby]);
  const columns =
    loby == "psicologo"
      ? [
          {
            field: "id",
            headerName: "Folio",
          },
          {
            field: "curp",
            headerName: "Curp",
          },
          {
            field: "servicios_psicologicos",
            headerName: "Servicos",
          },
        ]
      : [];
  return (
    <CustomTable
      title="LOBY"
      subtitle="Selecciona al que quieras añadir"
      data={lobyData}
      paginate={[10, 5, 25, 50]}
      loading={lobyLoading}
      refreshData={() => {
        getLoby(loby);
      }}
      columns={columns}
      actions={(row) => (
        <>
          <Tooltip content="Añadir a la agenda">
            <CustomButton color="cyan" onClick={()=>{
              if (loby=="psicologo") {
                
                setExtraPsychological('psychologicalEvaluation',row)
                setModalOpenPsychological();
                setHandlePsychological({
                  ...initialValuesPsychological,
                  id_entrevista:row.id
                })
              }
            }}>
              <FaRegAddressBook />{" "}
            </CustomButton>
          </Tooltip>
        </>
      )}
    />
  );
};
export default CompositeLoby;
