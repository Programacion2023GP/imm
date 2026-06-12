// CompositeCrud/components/StepperForm.tsx
import React, { useCallback, useImperativeHandle, forwardRef } from "react";
import { useFormikContext } from "formik";
import { RowComponent } from "../../../components/responsive/Responsive";
import type {
  FieldItem,
  StepperFormLocalProps,
  StepperNavHandle,
} from "../types";
import { theme } from "../../../../config/themes";

export const StepperFormLocal = forwardRef<
  StepperNavHandle,
  StepperFormLocalProps
>(
  (
    {
      sections,
      activeStep,
      onStepChange,
      renderField,
      renderComponent,
      hideNavButtons = false,
    },
    ref,
  ) => {
    const formik = useFormikContext();

    // Guarda: aseguramos que sections sea un array
    const safeSections = Array.isArray(sections) ? sections : [];
    const safeActiveStep = Math.min(activeStep, safeSections.length - 1);
    const currentSection = safeSections[safeActiveStep];
    const isLast = safeActiveStep === safeSections.length - 1;

const handleNext = useCallback(async () => {
  if (!currentSection) return;

  const currentFieldNames = currentSection.items
    .filter((item) => item.kind === "field")
    .map((item) => (item as { kind: "field"; field: FieldItem }).field.name);

  // Marcar como touched
  const touchedPatch = currentFieldNames.reduce(
    (acc: any, name: string) => ({ ...acc, [name]: true }),
    {},
  );

  // Esperar a que se actualice touched
  await formik.setTouched({ ...formik.touched, ...touchedPatch });

  // Validar SOLO los campos del paso actual
  // Esto ejecuta las validaciones y espera resultados
  await formik.validateForm();

  // Verificar errores específicos del paso actual
  const currentErrors = currentFieldNames.filter((name) => formik.errors[name]);

  console.log("Errores en paso actual:", currentErrors);
  console.log("Todos los errores:", formik.errors);

  if (currentErrors.length === 0) {
    onStepChange(safeActiveStep + 1);
  }
}, [safeActiveStep, currentSection, formik, onStepChange]);

    const handleSave = useCallback(async () => {
      const allFields = safeSections.flatMap((s) =>
        s.items
          .filter((i) => i.kind === "field")
          .map((i) => (i as { kind: "field"; field: FieldItem }).field),
      );
      const allTouched = allFields.reduce(
        (acc: any, f: FieldItem) => ({ ...acc, [f.name]: true }),
        {},
      );
      await formik.setTouched(allTouched);
      await formik.submitForm();
    }, [safeSections, formik]);

    useImperativeHandle(
      ref,
      () => ({ tryNext: handleNext, trySave: handleSave }),
      [handleNext, handleSave],
    );

    if (!currentSection) {
      return <div className="p-4 text-gray-500">No hay secciones</div>;
    }

    const primaryColor = theme.colors.primary.DEFAULT;
    const primaryLight = theme.colors.feedback.primaryLight;
    const borderColor = theme.colors.border.DEFAULT;

    // ... el resto del JSX igual, pero usando safeSections y safeActiveStep
    // (mantén el mismo código de renderizado, solo cambia las variables)
    // Te doy el JSX completo con las variables corregidas:

    return (
      <div className="flex flex-col w-full">
        {/* Progress header */}
        <div className="relative px-2 pt-2">
          <div
            className="absolute h-0.5 bg-gray-200"
            style={{
              top: "calc(1.25rem + 0.5rem)",
              left: `calc(${100 / (safeSections.length * 2)}% + 0.5rem)`,
              right: `calc(${100 / (safeSections.length * 2)}% + 0.5rem)`,
              zIndex: 0,
            }}
          />
          <div
            className="absolute h-0.5 transition-all duration-500 ease-in-out"
            style={{
              top: "calc(1.25rem + 0.5rem)",
              left: `calc(${100 / (safeSections.length * 2)}% + 0.5rem)`,
              width:
                safeSections.length <= 1
                  ? "0%"
                  : `calc(${(safeActiveStep / (safeSections.length - 1)) * (100 - 100 / safeSections.length)}% - 1rem)`,
              zIndex: 1,
              background: primaryColor,
            }}
          />
          <div className="relative flex justify-between" style={{ zIndex: 2 }}>
            {safeSections.map((s, idx) => {
              const isDone = idx < safeActiveStep;
              const isCurrent = idx === safeActiveStep;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => isDone && onStepChange(idx)}
                  className="flex flex-col items-center gap-1.5 flex-1"
                  style={{
                    cursor: isDone ? "pointer" : "default",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <div
                    className={`
                      relative flex items-center justify-center
                      w-10 h-10 rounded-full border-2 font-semibold text-sm
                      transition-all duration-300
                    `}
                    style={{
                      background: isDone
                        ? primaryColor
                        : isCurrent
                          ? theme.colors.background.card
                          : theme.colors.background.card,
                      borderColor: isDone
                        ? primaryColor
                        : isCurrent
                          ? primaryColor
                          : borderColor,
                      color: isDone
                        ? theme.colors.text.inverse
                        : isCurrent
                          ? primaryColor
                          : theme.colors.text.disabled,
                      boxShadow: isCurrent
                        ? `0 0 0 4px ${primaryLight}`
                        : "none",
                      transform: isCurrent ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {isDone ? (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 11.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium text-center leading-tight max-w-[72px] transition-colors duration-200 select-none"
                    style={{
                      color: isCurrent
                        ? primaryColor
                        : isDone
                          ? primaryColor
                          : theme.colors.text.disabled,
                    }}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div
          style={{
            borderRadius: theme.radius.lg,
            border: `1px solid ${borderColor}`,
            background: theme.colors.background.card,
            boxShadow: theme.shadows.sm,
            overflow: "hidden",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${
                theme.colors.primary[700] || "#7D1B35"
              } 100%)`,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: primaryLight,
                color: primaryColor,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {safeActiveStep + 1}
            </div>
            <span
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: 600,
                color: "#FFFFFF",
                letterSpacing: "0.3px",
              }}
            >
              {currentSection.title}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.disabled,
              }}
            >
              {safeActiveStep + 1} / {safeSections.length}
            </span>
          </div>

          <div className="p-5">
            {currentSection.items.map((item, idx) => {
              if (item.kind === "field") {
                return renderField(item.field);
              }
              if (item.kind === "component") {
                return renderComponent(
                  item.componentName,
                  item.responsive,
                  item.props,
                );
              }
              if (item.kind === "box") {
                return (
                  <div
                    key={`box-${idx}`}
                    style={{
                      marginBottom: "24px",
                      background: theme.colors.background.page,
                      borderRadius: theme.radius.lg,
                      border: `1px solid ${theme.colors.border.light}`,
                      boxShadow: theme.shadows.sm,
                      overflow: "hidden",
                    }}
                  >
                    <div className="px-5 pt-4 pb-2">
                      <h4
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                          color: primaryColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            background: primaryColor,
                            borderRadius: "50%",
                          }}
                        />
                        {item.title}
                      </h4>
                    </div>
                    <div className="px-5 pb-5">
                      <RowComponent>
                        {item.fields.map(renderField)}
                      </RowComponent>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        {!hideNavButtons && (
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              disabled={safeActiveStep === 0}
              onClick={() => onStepChange(safeActiveStep - 1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: theme.radius.md,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: 500,
                border: `1px solid ${borderColor}`,
                background:
                  safeActiveStep === 0
                    ? theme.colors.background.surface
                    : theme.colors.background.card,
                color:
                  safeActiveStep === 0
                    ? theme.colors.text.disabled
                    : theme.colors.text.secondary,
                cursor: safeActiveStep === 0 ? "not-allowed" : "pointer",
              }}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5l-7 5 7 5"
                />
              </svg>
              Atrás
            </button>

            <div className="flex items-center gap-1.5">
              {safeSections.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: "9999px",
                    width: idx === safeActiveStep ? "20px" : "8px",
                    height: "8px",
                    background:
                      idx === safeActiveStep
                        ? primaryColor
                        : idx < safeActiveStep
                          ? primaryColor
                          : borderColor,
                  }}
                />
              ))}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={formik.isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 20px",
                  borderRadius: theme.radius.md,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: 600,
                  background: primaryColor,
                  color: theme.colors.text.inverse,
                  border: "none",
                  cursor: formik.isSubmitting ? "not-allowed" : "pointer",
                  opacity: formik.isSubmitting ? 0.6 : 1,
                }}
              >
                {formik.isSubmitting ? "Guardando…" : "Guardar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: theme.radius.md,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: 500,
                  background: primaryColor,
                  color: theme.colors.text.inverse,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Siguiente
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 5l7 5-7 5"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

StepperFormLocal.displayName = "StepperFormLocal";

export default StepperFormLocal;
