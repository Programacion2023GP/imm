import * as Yup from "yup";

// ─── Helper reutilizable ──────────────────────────────────────────────────
const fileArrayValidation = Yup.array()
  .nullable()
  .max(3, "Máximo 3 evidencias permitidas")
  .test("fileSize", "Los archivos no pueden exceder 2MB", (files) => {
    if (!files || files.length === 0) return true;
    return files.every((file: any) => {
      if (!(file instanceof File)) return true; // ya existe en BD
      return file.size <= 2 * 1024 * 1024;
    });
  })
  .test("fileType", "Solo se permiten archivos PDF y PNG", (files) => {
    if (!files || files.length === 0) return true;
    const allowedTypes = ["application/pdf", "image/png"];
    return files.every((file: any) => {
      if (!(file instanceof File)) return true; // ya existe en BD
      if (file.type && allowedTypes.includes(file.type)) return true;
      const fileName = file.name || "";
      return fileName.endsWith(".pdf") || fileName.endsWith(".png");
    });
  });

// ─── Schema base ──────────────────────────────────────────────────────────
const baseSchema = {
  actor: Yup.string()
    .required("El actor es requerido")
    .min(3, "El actor debe tener al menos 3 caracteres")
    .max(100, "El actor no puede exceder 100 caracteres"),
  expediente: Yup.string()
    .required("El expediente es requerido")
    .matches(
      /^[A-Z0-9-]+$/,
      "Formato de expediente inválido (solo mayúsculas, números y guiones)",
    ),
  juzgado: Yup.string()
    .required("El juzgado es requerido")
    .min(3, "El juzgado debe tener al menos 3 caracteres"),
};

const comentario = Yup.string()
  .nullable()
  .max(500, "Los comentarios no pueden exceder 500 caracteres");
const fecha = (msg: string) =>
  Yup.string()
    .required(msg)
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

// ─── Schemas por tipo ─────────────────────────────────────────────────────
type ProccessType =
  | "Presentación"
  | "Radicacion"
  | "Audiencia"
  | "Exhorto"
  | "Oficios"
  | "Promocion"
  | "Sentencia";

const getValidationSchema = (type: ProccessType) => {
  const typeSchemas: Record<ProccessType, any> = {
    Presentación: Yup.object().shape({
      ...baseSchema,
      fecha_presentacion: fecha("La fecha de presentación es requerida"),
      comentarios_presentacion: comentario,
      evidencias_presentacion: fileArrayValidation,
    }),
    Radicacion: Yup.object().shape({
      ...baseSchema,
      fecha_radicacion: fecha("La fecha de radicación es requerida"),
      comentarios_radicacion: comentario,
      evidencias_radicacion: fileArrayValidation,
    }),
    Audiencia: Yup.object().shape({
      ...baseSchema,
      fecha_audiencia: fecha("La fecha de audiencia es requerida"),
      comentarios_audiencia: comentario,
      evidencias_audiencia: fileArrayValidation,
    }),
    Exhorto: Yup.object().shape({
      ...baseSchema,
      fecha_exhorto: fecha("La fecha de exhorto es requerida"),
      comentarios_exhorto: comentario,
      evidencias_exhorto: fileArrayValidation,
    }),
    Oficios: Yup.object().shape({
      ...baseSchema,
      fecha_oficios: fecha("La fecha de oficios es requerida"),
      comentarios_oficio: comentario,
      evidencias_oficio: fileArrayValidation,
    }),
    Promocion: Yup.object().shape({
      ...baseSchema,
      tipo_promocion: Yup.string()
        .required("El tipo de promoción es requerido")
        .min(3, "El tipo de promoción debe tener al menos 3 caracteres")
        .max(50, "El tipo de promoción no puede exceder 50 caracteres"),
      comentarios_promocion: comentario,
      evidencias_promocion: fileArrayValidation,
    }),
    Sentencia: Yup.object().shape({
      ...baseSchema,
      fecha_sentencia: fecha("La fecha de sentencia es requerida"),
      comentarios_sentencia: comentario,
      comentarios_juicio: Yup.string()
        .nullable()
        .max(
          1000,
          "Los comentarios del juicio no pueden exceder 1000 caracteres",
        ),
      evidencias_sentencia: fileArrayValidation,
    }),
  };

  return typeSchemas[type] || typeSchemas["Presentación"];
};

export default getValidationSchema;
