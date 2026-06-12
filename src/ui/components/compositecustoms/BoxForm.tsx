import React from "react";
import { useFormikContext } from "formik";
import { RowComponent } from "../responsive/Responsive";
import { theme } from "../../../config/themes";
import { FieldItem } from "./types";

interface BoxFormProps {
  sections: { title: string; fields: FieldItem[] }[];
  renderField: (field: FieldItem) => React.ReactNode;
  onSave: () => void;
}

const BoxForm: React.FC<BoxFormProps> = ({ sections, renderField, onSave }) => {
  const formik = useFormikContext<Record<string, any>>();

  const handleSave = async () => {
    const errors = await formik.validateForm();
    const allFields = sections.flatMap((s) => s.fields);
    const allTouched = allFields.reduce(
      (acc, f) => ({ ...acc, [f.name]: true }),
      {} as Record<string, boolean>,
    );
    await formik.setTouched({ ...formik.touched, ...allTouched });
    if (Object.keys(errors).length > 0) return;
    onSave();
  };

  return (
    <div style={{ width: "100%" }}>
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
              color: theme.colors.primary.DEFAULT,
              marginBottom: "16px",
              borderBottom: `2px solid ${theme.colors.feedback.primaryLight}`,
              paddingBottom: "6px",
            }}
          >
            {section.title}
          </div>
          <RowComponent>
            {section.fields.map((field) => renderField(field))}
          </RowComponent>
        </div>
      ))}
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
          {formik.isSubmitting ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default BoxForm;
