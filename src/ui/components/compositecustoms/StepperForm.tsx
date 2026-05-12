import React from "react";
import { useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { RowComponent } from "../responsive/Responsive";
import type { FieldItem } from "./compositeCrud";

// Design system (mismo que en compositeCrud)
const DS = {
  bg: "#FAFAF9",
  white: "#FFFFFF",
  surface: "#F5F4F1",
  border: "#D6D3CC",
  borderFocus: "#2D2A26",
  borderError: "#C0392B",
  text1: "#1C1A17",
  text2: "#6B6560",
  text3: "#A8A39A",
  accent: "#3730A3",
  accentLight: "rgba(55,48,163,0.08)",
  accentGlow: "0 0 0 3px rgba(55,48,163,0.12)",
  errorText: "#DC2626",
  errorBg: "#FEF2F2",
  errorBorder: "#FCA5A5",
  r6: "8px",
  r8: "10px",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
};

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
          borderBottom: `1px solid ${DS.border}`,
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
                    ? DS.errorBg
                    : DS.accent
                  : hasError
                  ? DS.errorBg
                  : "transparent",
                color: isActive
                  ? hasError
                    ? DS.errorText
                    : DS.white
                  : hasError
                  ? DS.errorText
                  : DS.text2,
                border: `1.5px solid ${hasError ? DS.errorBorder : isActive ? DS.accent : DS.border}`,
                padding: "6px 16px",
                borderRadius: "40px",
                fontSize: "13px",
                fontWeight: isActive || hasError ? 600 : 400,
                cursor: "pointer",
                transition: DS.transition,
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
                      ? DS.errorText
                      : "rgba(255,255,255,0.25)"
                    : hasError
                    ? DS.errorText
                    : DS.border,
                  color: isActive || hasError ? DS.white : DS.text2,
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
          borderTop: `1px solid ${DS.border}`,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={activeStep === 0}
          style={{
            padding: "8px 20px",
            background: "transparent",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.r6,
            cursor: activeStep === 0 ? "not-allowed" : "pointer",
            opacity: activeStep === 0 ? 0.4 : 1,
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
            background: DS.accent,
            color: DS.white,
            border: "none",
            borderRadius: DS.r6,
            cursor: formik.isSubmitting ? "not-allowed" : "pointer",
            fontWeight: 600,
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
