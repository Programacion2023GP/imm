import { useEffect } from "react";
import CustomTable from "../../../components/table/customtable";
import UseInterview from "../../../hooks/interview/interviewdata";
import CustomButton from "../../../components/button/custombuttom";
import { FaRegAddressBook } from "react-icons/fa6";
import Tooltip from "../../../components/toltip/Toltip";
import UsePsychologicalEvaluationModuleData from "../../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import Typography from "../../../components/typografy/Typografy";
import UseLegalData from "../../../hooks/legal/uselegal";
import { DateFormat, formatDatetime } from "../../../../utils/helpers";
import { Column } from "../../../components/table/customtable"; // Ajusta la ruta según tu proyecto
import { json } from "stream/consumers";

const CompositeLoby = ({ loby }: { loby: "psicologo" | "juridico" }) => {
  const { lobyData, lobyLoading, getLoby } = UseInterview();
  const {
    setExtra: setExtraPsychological,
    setOpen: setModalOpenPsychological,
    handleChangeItem: setHandlePsychological,
    initialValues: initialValuesPsychological,
  } = UsePsychologicalEvaluationModuleData();
  const {
    setOpen: setModalOpenLegal,
    setExtra: setExtraLegal,
    handleChangeItem: setHandleLegal,
    initialValues: initialValuesLegal,
  } = UseLegalData();

  useEffect(() => {
    getLoby(loby);
  }, [loby]);

  // ✅ Definir columns con el tipo correcto

  return (
    <>
      <CustomTable
        title="LOBY"
        subtitle="Selecciona al que quieras añadir"
        data={lobyData}
        paginate={[10, 5, 25, 50]}
        loading={lobyLoading}
        refreshData={() => {
          getLoby(loby);
        }}
        columns={
          loby === "psicologo"
            ? [
                { field: "id", headerName: "Folio" },
                { field: "nombre", headerName: "Nombre" },
                { field: "edad", headerName: "Edad" },
                { field: "colonia", headerName: "Colonia" },
                { field: "telefono", headerName: "Teléfono" },
                { field: "curp", headerName: "CURP" },
                { field: "servicios_psicologicos", headerName: "Servicios" },
                {
                  field: "created_at",
                  headerName: "Fecha de creación",
                  filterType: "datetime-local" as const, // ✅ usar 'as const' para tipo literal
                  renderField: (v, field) => (
                    <>
                      {formatDatetime(
                        v,
                        true,
                        DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                      )}
                    </>
                  ),
                },
                { field: "nombre_completo", headerName: "Capturado por" },
              ]
            : [
                { field: "id", headerName: "Folio" },
                { field: "nombre", headerName: "Nombre" },
                { field: "edad", headerName: "Edad" },
                { field: "colonia", headerName: "Colonia" },
                { field: "telefono", headerName: "Teléfono" },
                { field: "curp", headerName: "CURP" },
                { field: "servicios_juridicos", headerName: "Servicios" },
                {
                  field: "created_at",
                  headerName: "Fecha de creación",
                  filterType: "datetime-local" as const, // ✅ usar 'as const'
                  renderField: (v, field) => (
                    <>
                      {formatDatetime(
                        v,
                        true,
                        DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                      )}
                    </>
                  ),
                },
                { field: "nombre_completo", headerName: "Capturado por" },
              ]
        }
        mobileConfig={{
          listTile: {
            title: (row) => (
              <div style={{ fontWeight: 600, color: "#1a1a24" }}>
                {row.nombre}
              </div>
            ),
            subtitle: (row) => (
              <div style={{ fontSize: 12, color: "#5a5a72", marginTop: 2 }}>
                CURP: {row.curp || "No registrado"}
              </div>
            ),
            leading: (row) => (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "linear-gradient(135deg, #9B2242, #b52a4f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {row.nombre?.charAt(0)?.toUpperCase() || "?"}
              </div>
            ),
            trailing: (row) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Typography>{row.colonia}</Typography>
                <Tooltip content="Añadir a la agenda">
                  <CustomButton
                    color="cyan"
                    size="sm"
                    rounded
                    onClick={() => {
                      if (loby === "psicologo") {
                        setExtraPsychological("psychologicalEvaluation", row);
                        setModalOpenPsychological();
                        setHandlePsychological({
                          ...initialValuesPsychological,
                          id_entrevista: row.id,
                        });
                      } else {
                        setExtraLegal("legal", row);
                        setHandleLegal({
                          ...initialValuesLegal,
                          id_entrevista: row.id,
                        });
                        setExtraPsychological("psychologicalEvaluation", {
                          ...(row as unknown as any),
                          id_entrevista: row.id,
                        });
                        setModalOpenLegal(true, false);
                      }
                    }}
                  >
                    <FaRegAddressBook size={14} />
                  </CustomButton>
                </Tooltip>
              </div>
            ),
          },
          swipeActions: {
            left: [
              {
                icon: <></>,
                color: "",
                action: (row) => null,
                label: "",
              },
            ],
            right: [
              {
                icon: <></>,
                color: "",
                action: (row) => null,
                label: "",
              },
            ],
          },
        }}
        actions={(row) => (
          <>
            <Tooltip content="Añadir a la agenda">
              <CustomButton
                color="cyan"
                onClick={() => {
                  if (loby === "psicologo") {
                    setExtraPsychological("psychologicalEvaluation", row);
                    setModalOpenPsychological();
                    setHandlePsychological({
                      ...initialValuesPsychological,
                      id_entrevista: row.id,
                    });
                  } else {
                    
                    setExtraLegal("legal", row);
                    setHandleLegal({
                      ...initialValuesLegal,
                      id_entrevista: row.id,
                    });
                    setExtraPsychological("psychologicalEvaluation", {
                      ...(row as unknown as any),
                      id_entrevista: row.id,
                    });
                    setModalOpenLegal(true,false);
                  }
                }}
              >
                <FaRegAddressBook />{" "}
              </CustomButton>
            </Tooltip>
          </>
        )}
      />
    </>
  );
};

export default CompositeLoby;
