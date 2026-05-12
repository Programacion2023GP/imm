import React from "react";
import { useFormikContext } from "formik";
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
            border: `1px solid ${DS.border}`,
            borderRadius: DS.r8,
            background: DS.white,
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: DS.accent,
              marginBottom: "16px",
              borderBottom: `2px solid ${DS.accentLight}`,
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
            background: DS.accent,
            color: DS.white,
            border: "none",
            borderRadius: DS.r6,
            cursor: formik.isSubmitting ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {formik.isSubmitting ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default BoxForm;
