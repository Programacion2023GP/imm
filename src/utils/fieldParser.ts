// utils/fieldParser.ts (el mismo que antes, pero ajustado para trabajar con tus componentes)
import * as Yup from "yup";

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "switch"
  | "select"
  | "date"
  | "password";

export interface ParsedField {
  name: string;
  type: FieldType;
  validations: { rule: string; params?: any; message?: string }[];
  options?: string[];
  visibleIf?: string;
  dependsOn?: string[];
  readonly?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export function parseFieldDefinition(def: string): ParsedField {
  const parts = def.split(":");
  const name = parts[0];
  const type = (parts[1] as FieldType) || "text";
  const result: ParsedField = { name, type, validations: [] };
  let remaining = parts.slice(2);

  if (type === "select" && remaining[0]?.includes(",")) {
    result.options = remaining[0].split(",");
    remaining = remaining.slice(1);
  }

  for (const segment of remaining) {
    const subs = segment.split(",");
    for (const sub of subs) {
      if (sub.includes(":")) {
        const [rule, param] = sub.split(":");
        if (rule === "visibleIf") result.visibleIf = param;
        else if (rule === "depends") result.dependsOn = param.split(",");
        else if (rule === "placeholder") result.placeholder = param;
        else if (rule === "default") result.defaultValue = param;
        else if (rule === "readonly") result.readonly = true;
        else result.validations.push({ rule, params: param });
      } else if (sub.startsWith("msg:")) {
        const last = result.validations[result.validations.length - 1];
        if (last) last.message = sub.replace("msg:", "");
      } else {
        result.validations.push({ rule: sub });
      }
    }
  }
  return result;
}

export function buildYupValidation(field: ParsedField): Yup.AnySchema {
  let schema: Yup.AnySchema;
  switch (field.type) {
    case "email":
      schema = Yup.string().email(
        field.validations.find((v) => v.rule === "email")?.message ||
          "Email inválido",
      );
      break;
    case "number":
      schema = Yup.number().typeError("Debe ser número");
      break;
    case "switch":
      schema = Yup.boolean();
      break;
    default:
      schema = Yup.string();
  }
  for (const v of field.validations) {
    const msg = v.message;
    switch (v.rule) {
      case "required":
        schema = schema.required(msg || "Requerido");
        break;
      case "min":
        schema = (schema as Yup.NumberSchema).min(
          Number(v.params),
          msg || `Mínimo ${v.params}`,
        );
        break;
      case "max":
        schema = (schema as Yup.NumberSchema).max(
          Number(v.params),
          msg || `Máximo ${v.params}`,
        );
        break;
      case "minLength":
        schema = (schema as Yup.StringSchema).min(
          Number(v.params),
          msg || `Mínimo ${v.params} caracteres`,
        );
        break;
      case "maxLength":
        schema = (schema as Yup.StringSchema).max(
          Number(v.params),
          msg || `Máximo ${v.params} caracteres`,
        );
        break;
      case "regex":
        schema = (schema as Yup.StringSchema).matches(
          new RegExp(v.params),
          msg || "Formato inválido",
        );
        break;
    }
  }
  return schema;
}
