// CompositeCrud/utils/dateHelpers.ts

// ─── Validación de fechas ─────────────────────────────────────────────────────
const isValidDate = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (
    typeof value === "string" &&
    (value === "" || value === "null" || value === "undefined")
  )
    return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

const isISODateString = (value: any): boolean => {
  if (typeof value !== "string") return false;
  if (!value || value === "null" || value === "undefined") return false;

  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[\+\-]\d{2}:\d{2})?)?$/;
  if (!isoDateRegex.test(value)) return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

const isDateObject = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

const isTimestamp = (value: any): boolean => {
  if (typeof value !== "number") return false;
  if (isNaN(value)) return false;
  return value > 946684800000 && value < 4102444800000;
};

// ─── Conversión a formato para input date (YYYY-MM-DD) ────────────────────────
const toDateInputFormat = (value: any): string | null => {
  if (!isValidDate(value)) return null;

  let date: Date | null = null;

  try {
    if (isDateObject(value)) date = value;
    else if (isISODateString(value)) date = new Date(value);
    else if (isTimestamp(value)) date = new Date(value);
    else {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch (error) {
    console.warn("Error converting date:", value, error);
    return null;
  }

  return null;
};

// ─── Conversión a formato para backend (ISO con microsegundos) ────────────────
const toISOFullFormat = (value: any): string | null => {
  if (!isValidDate(value)) return null;

  let date: Date | null = null;

  try {
    if (isDateObject(value)) date = value;
    else if (isISODateString(value)) date = new Date(value);
    else if (isTimestamp(value)) date = new Date(value);
    else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date = new Date(`${value}T00:00:00Z`);
    } else {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    if (date && !isNaN(date.getTime())) {
      const iso = date.toISOString();
      return iso.replace(/\.\d{3}Z$/, ".000000Z");
    }
  } catch (error) {
    console.warn("Error converting date to ISO:", value, error);
    return null;
  }

  return null;
};

// ─── Transformación recursiva de fechas en objetos ────────────────────────────
export const transformDatesInObject = <T = any>(
  obj: T,
  transformFn: (value: any) => string | null = toDateInputFormat,
): T => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => transformDatesInObject(item, transformFn)) as T;
  }

  if (typeof obj === "object") {
    const result: any = {};
    try {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          if (
            isValidDate(value) &&
            (isISODateString(value) ||
              isDateObject(value) ||
              isTimestamp(value))
          ) {
            const transformed = transformFn(value);
            result[key] = transformed !== null ? transformed : value;
          } else if (value === null || value === undefined || value === "") {
            result[key] = value;
          } else if (typeof value === "object" && value !== null) {
            result[key] = transformDatesInObject(value, transformFn);
          } else {
            result[key] = value;
          }
        }
      }
    } catch (error) {
      console.error("Error transforming dates in object:", error);
      return obj;
    }
    return result;
  }

  return obj;
};

// ─── Funciones públicas para usar en el CRUD ──────────────────────────────────
export const toFormDateFormat = toDateInputFormat;
export const toBackendDateFormat = toISOFullFormat;

export const prepareForForm = <T = any>(obj: T): T => {
  if (!obj) return obj;
  try {
    return transformDatesInObject(obj, toDateInputFormat);
  } catch (error) {
    console.error("Error in prepareForForm:", error);
    return obj;
  }
};

export const prepareForBackend = <T = any>(obj: T): T => {
  if (!obj) return obj;
  try {
    return transformDatesInObject(obj, toISOFullFormat);
  } catch (error) {
    console.error("Error in prepareForBackend:", error);
    return obj;
  }
};
