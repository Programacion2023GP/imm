import React from "react";
import { useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { RowComponent } from "../responsive/Responsive";
import type { FieldItem } from "./compositeCrud";
import { theme } from "../../../config/themes";

interface StepperFormProps {
  sections: { title: string; fields: FieldItem[] }[];
  activeStep: number;
  onStepChange: (step: number) => void;
  renderField: (field: FieldItem) => React.ReactNode;
  onSave: () => void;
}

const StepperForm: React.FC<StepperFormProps> = ({
  sections,
  activeStep,
  onStepChange,
  renderField,
  onSave,
}) => {
  const formik = useFormikContext<Record<string, any>>();
  const totalSteps = sections.length;
  const currentSection = sections[activeStep];
  const isLastStep = activeStep === totalSteps - 1;

  const stepHasError = sections.map((section) =>
    section.fields.some(
      (f) => !!(formik.errors[f.name] && formik.touched[f.name]),
    ),
  );

  const handleNext = async () => {
    if (isLastStep) {
      const errors = await formik.validateForm();
      const allTouched = sections
        .flatMap((s) => s.fields)
        .reduce(
          (acc, f) => ({ ...acc, [f.name]: true }),
          {} as Record<string, boolean>,
        );
      await formik.setTouched({ ...formik.touched, ...allTouched });
      if (Object.keys(errors).length > 0) {
        const firstErrorStep = sections.findIndex((section) =>
          section.fields.some((f) => errors[f.name]),
        );
        if (firstErrorStep >= 0 && firstErrorStep !== activeStep)
          onStepChange(firstErrorStep);
        return;
      }
      onSave();
    } else {
      const errors = await formik.validateForm();
      const currentFieldNames = currentSection.fields.map((f) => f.name);
      const stepErrors = Object.keys(errors).filter((key) =>
        currentFieldNames.includes(key),
      );
      if (stepErrors.length > 0) {
        const touched = currentFieldNames.reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {} as Record<string, boolean>,
        );
        await formik.setTouched({ ...formik.touched, ...touched });
        return;
      }
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => onStepChange(activeStep - 1);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: `1px solid ${theme.colors.border.DEFAULT}`,
          paddingBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        {sections.map((section, idx) => {
          const isActive = idx === activeStep;
          const hasError = stepHasError[idx];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isActive
                  ? hasError
                    ? theme.colors.feedback.errorLight
                    : theme.colors.primary.DEFAULT
                  : hasError
                    ? theme.colors.feedback.errorLight
                    : "transparent",
                color: isActive
                  ? hasError
                    ? theme.colors.status.error
                    : theme.colors.text.inverse
                  : hasError
                    ? theme.colors.status.error
                    : theme.colors.text.secondary,
                border: `1.5px solid ${
                  hasError
                    ? theme.colors.border.error
                    : isActive
                      ? theme.colors.primary.DEFAULT
                      : theme.colors.border.DEFAULT
                }`,
                padding: "6px 16px",
                borderRadius: "40px",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: isActive || hasError ? 600 : 400,
                cursor: "pointer",
                transition: theme.transitions.DEFAULT,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: isActive
                    ? hasError
                      ? theme.colors.status.error
                      : "rgba(255,255,255,0.25)"
                    : hasError
                      ? theme.colors.status.error
                      : theme.colors.border.DEFAULT,
                  color:
                    isActive || hasError
                      ? theme.colors.text.inverse
                      : theme.colors.text.secondary,
                }}
              >
                {hasError ? "!" : idx + 1}
              </span>
              {section.title}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <RowComponent>
            {currentSection.fields.map((field) => renderField(field))}
          </RowComponent>
        </motion.div>
      </AnimatePresence>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "28px",
          paddingTop: "16px",
          borderTop: `1px solid ${theme.colors.border.DEFAULT}`,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={activeStep === 0}
          style={{
            padding: "8px 20px",
            background: "transparent",
            border: `1px solid ${theme.colors.border.DEFAULT}`,
            borderRadius: theme.radius.md,
            cursor: activeStep === 0 ? "not-allowed" : "pointer",
            opacity: activeStep === 0 ? 0.4 : 1,
            transition: theme.transitions.DEFAULT,
          }}
          onMouseEnter={(e) => {
            if (activeStep !== 0) {
              e.currentTarget.style.background =
                theme.colors.background.surface;
              e.currentTarget.style.borderColor = theme.colors.border.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeStep !== 0) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
            }
          }}
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={formik.isSubmitting}
          style={{
            padding: "8px 24px",
            background: theme.colors.primary.DEFAULT,
            color: theme.colors.text.inverse,
            border: "none",
            borderRadius: theme.radius.md,
            cursor: formik.isSubmitting ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: theme.transitions.DEFAULT,
          }}
          onMouseEnter={(e) => {
            if (!formik.isSubmitting) {
              e.currentTarget.style.background = theme.colors.primary.dark;
            }
          }}
          onMouseLeave={(e) => {
            if (!formik.isSubmitting) {
              e.currentTarget.style.background = theme.colors.primary.DEFAULT;
            }
          }}
        >
          {formik.isSubmitting
            ? "Guardando…"
            : isLastStep
              ? "Guardar"
              : "Siguiente →"}
        </button>
      </div>
    </div>
  );
};

export default StepperForm;
