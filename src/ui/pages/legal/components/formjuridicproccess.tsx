import CustomModal from "../../../components/modal/modal";
import FormikForm from "../../../formik/Formik";
import {
  FormikDatePicker,
  FormikInput,
  FormikTextArea,
} from "../../../formik/FormikInputs/FormikInput";
import FormikFileInput from "../../../formik/FormikInputs/forminputimage";
import UseJuridicProccessData from "../../../hooks/juridicproccess/useproccessjuridic";
import { useMemo, useRef } from "react";
import getValidationSchema from "./validations";
import { FormikProps } from "formik";
import { ProccessJuridic } from "../../../../models/proccessjuridic/processjuridic";
import CustomButton from "../../../components/button/custombuttom";
import UseLegalData from "../../../hooks/legal/uselegal";

type FieldConfig = {
  name: string;
  label: string;
};

type Fields = {
  date: FieldConfig;
  comment: FieldConfig;
  file: FieldConfig;
};

const FormProccessJuridic = () => {
  const { initialValues, open, setOpen, type, postItem, loading } =
    UseJuridicProccessData();
  const { fetchData, setExtra } = UseLegalData();
  // Mapeo de campos por tipo
  const getFieldConfig = useMemo(() => {
    const configs: Record<string, Fields> = {
      Presentación: {
        date: { name: "fecha_presentacion", label: "Fecha de Presentación" },
        comment: {
          name: "comentarios_presentacion",
          label: "Comentarios de presentación",
        },
        file: {
          name: "evidencias_presentacion",
          label: "Evidencias de la presentación",
        },
      },
      Radicación: {
        date: { name: "fecha_radicacion", label: "Fecha de Radicación" },
        comment: {
          name: "comentarios_radicacion",
          label: "Comentarios de radicación",
        },
        file: {
          name: "evidencias_radicacion",
          label: "Evidencias de radicación",
        },
      },
      Audiencia: {
        date: { name: "fecha_audiencia", label: "Fecha de Audiencia" },
        comment: {
          name: "comentarios_audiencia",
          label: "Comentarios de audiencia",
        },
        file: {
          name: "evidencias_audiencia",
          label: "Evidencias de audiencia",
        },
      },
      Exhorto: {
        date: { name: "fecha_exhorto", label: "Fecha de Exhorto" },
        comment: {
          name: "comentarios_exhorto",
          label: "Comentarios de exhorto",
        },
        file: { name: "evidencias_exhorto", label: "Evidencias de exhorto" },
      },
      Oficios: {
        date: { name: "fecha_oficios", label: "Fecha de Oficios" },
        comment: { name: "comentarios_oficio", label: "Comentarios de oficio" },
        file: { name: "evidencias_oficio", label: "Evidencias de oficio" },
      },
      Promocion: {
        date: { name: "tipo_promocion", label: "Tipo de Promoción" },
        comment: {
          name: "comentarios_promocion",
          label: "Comentarios de promoción",
        },
        file: {
          name: "evidencias_promocion",
          label: "Evidencias de promoción",
        },
      },
      Sentencia: {
        date: { name: "fecha_sentencia", label: "Fecha de Sentencia" },
        comment: {
          name: "comentarios_sentencia",
          label: "Comentarios de sentencia",
        },
        file: {
          name: "evidencias_sentencia",
          label: "Evidencias de sentencia",
        },
      },
    };
    return configs[type] || configs["Presentación"]; // fallback
  }, [type]);
  const validationSchema = useMemo(() => {
    return getValidationSchema(type);
  }, [type]);
  const formikRef = useRef<FormikProps<ProccessJuridic>>(null);
 
  return (
    <CustomModal
      title={type}
      isOpen={open}
      onClose={() => setOpen(false)}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <CustomButton
            loading={loading}
            onClick={async () => {
              await formikRef.current?.submitForm(); // ← falta esto
            }}
          >
            Guardar
          </CustomButton>
        </div>
      }
    >
      <FormikForm
        formikRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          console.log("aqui es");
          const res = await postItem(values, true);
          if (res) {
            setOpen(false);
            setExtra("openModal", false);
            await fetchData();
          }
        }}
        children={(values, setFieldValue, setTouched, errors, touched) => (
          <>
            {type == "Presentación" && (
              <>
                <FormikInput
                  name="actor"
                  label="Actor"
                  caseTransform="uppercase"
                />
                <FormikInput
                  name="expediente"
                  label="Expediente"
                  caseTransform="uppercase"
                />
                <FormikInput
                  name="juzgado"
                  label="Juzgado"
                  caseTransform="uppercase"
                />
              </>
            )}

            <>
              <FormikDatePicker
                name={getFieldConfig.date.name}
                label={getFieldConfig.date.label}
              />
              <FormikTextArea
                name={getFieldConfig.comment.name}
                label={getFieldConfig.comment.label}
              />
              <FormikFileInput
                maxFiles={3}
                multiple={true}
                compressImages={true}
                imageMaxWidth={1200}
                imageMaxHeight={1200}
                imageQuality={0.85}
                imageMaxSizeMB={2}
                customExtensions={["pdf", "png"]}
                name={getFieldConfig.file.name}
                label={getFieldConfig.file.label}
              />
            </>
          </>
        )}
      />
    </CustomModal>
  );
};

export default FormProccessJuridic;
