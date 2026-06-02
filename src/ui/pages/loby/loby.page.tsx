import { useEffect } from "react";
import CustomTable from "../../components/table/customtable";
import UseInterview from "../../hooks/interview/interviewdata";

const PageLoby = ({ loby }: { loby: "psicologo" | "juridico" }) => {
  const { lobyData, lobyLoading, getLoby } = UseInterview();
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
    />
  );
};
export default PageLoby;
