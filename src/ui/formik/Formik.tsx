import React, { useState } from "react";
import { Formik, Form } from "formik";
import type { FormikProps, FormikTouched, FormikErrors } from "formik";
import * as Yup from "yup";
import { RowComponent } from "../components/responsive/Responsive";
import CustomButton from "../components/button/custombuttom";
import { useWindowSize } from "../../hooks/windossize";

export interface FormikFormProps<TValues> {
  initialValues: TValues;
  validationSchema?: Yup.ObjectSchema<any>;
  enableReinitialize?: boolean;
  onSubmit: (values: TValues) => Promise<void> | void;
  children: (
    values: TValues,
    setFieldValue: (
      field: keyof TValues,
      value: any,
      shouldValidate?: boolean,
    ) => void,
    setTouched: (
      touched: FormikTouched<TValues>,
      shouldValidate?: boolean,
    ) => void,
    errors: FormikErrors<TValues>,
    touched: FormikTouched<TValues>,
  ) => React.ReactNode;
  buttonMessage?: string;
  buttonLoading?: boolean;
  handleButtonsSubmit?: React.ReactNode;
  id?: string;
  // ✅ Ref como prop normal — evita el problema con forwardRef + genéricos
  formikRef?: React.Ref<FormikProps<TValues>>;
}

export type FormikFormRef<TValues> = FormikProps<TValues>;

const FormikForm = <TValues extends Record<string, any>>({
  onSubmit,
  initialValues,
  validationSchema,
  children,
  buttonMessage,
  buttonLoading,
  handleButtonsSubmit,
  id,
  enableReinitialize,
  formikRef, // ✅ Recibir ref como prop
}: FormikFormProps<TValues>) => {
  const { width } = useWindowSize();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = width < 1048;

  return (
    <Formik<TValues>
      innerRef={formikRef} // ✅ Pasar directamente
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
      onSubmit={async (values, { setSubmitting }) => {
        setIsLoading(true);
        try {
          await onSubmit(values);
        } finally {
          setSubmitting(false);
          setIsLoading(false);
        }
      }}
    >
      {({
        isSubmitting,
        values,
        setFieldValue,
        setTouched,
        errors,
        touched,
      }) => (
        <Form encType="multipart/form-data" className="space-y-4">
          <RowComponent>
            {children(values, setFieldValue, setTouched, errors, touched)}
          </RowComponent>
          <div
            className={`flex ${isMobile ? "justify-center sticky bottom-4" : "justify-end"}`}
          >
            {buttonMessage && (
              <CustomButton
                type="submit"
                loading={buttonLoading || isSubmitting || isLoading}
                variant="solid"
              >
                {buttonMessage}
              </CustomButton>
            )}
            {handleButtonsSubmit}
          </div>
          {isMobile && <div className="h-6" />}
        </Form>
      )}
    </Formik>
  );
};

export default FormikForm;
