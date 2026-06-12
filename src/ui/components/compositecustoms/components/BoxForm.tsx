// CompositeCrud/components/BoxForm.tsx
import React, { useCallback, useImperativeHandle, forwardRef } from "react";
import { useFormikContext } from "formik";
import { RowComponent } from "../../../components/responsive/Responsive";
import type { BoxFormLocalProps, BoxNavHandle, FieldItem } from "../types";
import { theme } from "../../../../config/themes";

export const BoxFormLocal = forwardRef<BoxNavHandle, BoxFormLocalProps>(
  (
    { sections, renderField, renderComponent, hideSubmitButton = false },
    ref,
  ) => {
    const formik = useFormikContext();

    const handleSave = useCallback(async () => {
      const allFields = sections.flatMap((s) =>
        s.items.filter((i: any) => i.kind === "field").map((i: any) => i.field),
      );
      const allTouched = allFields.reduce(
        (acc: any, f: FieldItem) => ({ ...acc, [f.name]: true }),
        {},
      );
      await formik.setTouched({ ...formik.touched, ...allTouched });
      const errors = await formik.validateForm();
      if (Object.keys(errors).length === 0) {
        await formik.submitForm();
      }
    }, [sections, formik]);

    useImperativeHandle(ref, () => ({ trySave: handleSave }), [handleSave]);

    const primaryColor = theme.colors.primary.DEFAULT;
    const primaryLight = theme.colors.feedback.primaryLight;

    return (
      <div>
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              background: theme.colors.background.card,
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: 600,
                color: primaryColor,
                marginBottom: "16px",
                borderBottom: `2px solid ${primaryLight}`,
                paddingBottom: "6px",
              }}
            >
              {section.title}
            </div>
            <RowComponent>
              {section.items.map((item: any, idx: number) => {
                if (item.kind === "field") return renderField(item.field);
                else
                  return renderComponent(
                    item.componentName,
                    item.responsive,
                    item.props,
                  );
              })}
            </RowComponent>
          </div>
        ))}
        {!hideSubmitButton && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={formik.isSubmitting}
              style={{
                padding: "8px 24px",
                background: primaryColor,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.radius.md,
                cursor: formik.isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {formik.isSubmitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        )}
      </div>
    );
  },
);
BoxFormLocal.displayName = "BoxFormLocal";
