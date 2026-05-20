import React from "react";
import { FiDroplet, FiFileText, FiUser } from "react-icons/fi";

// ============================================
// 1. TIPOS GENÉRICOS MEJORADOS
// ============================================

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "phone"
  | "email"
  | "badge"
  | "percentage"
  | "color"
  | "custom";

export interface FieldConfig<TData, TKey extends keyof TData = keyof TData> {
  key: TKey; // ✅ solo claves reales del modelo
  label: string;
  type: FieldType;
  icon?: React.ReactNode;
  color?: string; // clase CSS para el fondo del icono
  format?: "capitalize" | "uppercase" | "lowercase"; // formato de texto adicional
  render?: (value: TData[TKey], data: TData) => React.ReactNode;
  priority?: number; // para orden futuro
}

export interface SectionConfig<TData> {
  title: string;
  fields: Array<keyof TData>; // ✅ claves que deben existir en fields
  columns?: 1 | 2;
  color?: string;
  icon?: React.ReactNode;
}

export interface DataDisplayConfig<TData> {
  title: string | ((data: TData) => string);
  subtitle?: string | ((data: TData) => string);
  badge?: string | ((data: TData) => string);
  badgeColor?: string | ((data: TData) => string);
  fields: FieldConfig<TData>[];
  sections: SectionConfig<TData>[];
  layout?: "default" | "compact" | "detailed";
}

// ============================================
// 2. FUNCIÓN HELPER CON VALIDACIÓN
// ============================================

export function createConfig<TData>(
  config: DataDisplayConfig<TData>,
): DataDisplayConfig<TData> {
  // Validación en tiempo de ejecución (útil en desarrollo)
  const fieldKeys = new Set(config.fields.map((f) => f.key));
  for (const section of config.sections) {
    for (const fieldKey of section.fields) {
      if (!fieldKeys.has(fieldKey)) {
        throw new Error(
          `❌ La clave "${String(fieldKey)}" usada en la sección "${section.title}" no existe en 'fields'`,
        );
      }
    }
  }
  return config;
}

// ============================================
// 3. COMPONENTE PRINCIPAL (GENÉRICO)
// ============================================

interface DataDisplayProps<TData> {
  data: TData;
  config: DataDisplayConfig<TData>;
  className?: string;
}

export function CustomDataDisplay<TData>({
  data,
  config,
  className = "",
}: DataDisplayProps<TData>) {
  // --------------------------------------------------
  // Formateadores comunes
  // --------------------------------------------------
  const formatCurrency = (value: number, currency = "MXN") => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(value);
  };

  const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      if (includeTime) {
        return new Intl.DateTimeFormat("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      }
      return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "No especificado";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const formatColor = (color: string) => (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <span>{color}</span>
    </div>
  );

  const applyTextFormat = (value: string, format?: string) => {
    if (!format) return value;
    switch (format) {
      case "capitalize":
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      case "uppercase":
        return value.toUpperCase();
      case "lowercase":
        return value.toLowerCase();
      default:
        return value;
    }
  };

  // --------------------------------------------------
  // Obtener field config
  // --------------------------------------------------
  const getField = (key: keyof TData): FieldConfig<TData> | undefined => {
    return config.fields.find((field) => field.key === key);
  };

  // --------------------------------------------------
  // Obtener valor formateado según el tipo y formato
  // --------------------------------------------------
  const getFieldValue = (field: FieldConfig<TData>) => {
    const value = data[field.key];
    if (value === null || value === undefined || value === "") {
      return "No especificado";
    }

    if (field.render) {
      return field.render(value, data);
    }

    switch (field.type) {
      case "currency":
        return typeof value === "number" ? formatCurrency(value) : value;

      case "date":
        return typeof value === "string" ? formatDate(value, false) : value;

      case "datetime":
        return typeof value === "string" ? formatDate(value, true) : value;

      case "phone":
        return typeof value === "string" ? formatPhone(value) : value;

      case "percentage":
        return typeof value === "number" ? `${value}%` : value;

      case "color":
        return typeof value === "string" ? formatColor(value) : value;

      case "badge":
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              field.color || "bg-gray-100 text-gray-800"
            }`}
          >
            {value as string}
          </span>
        );

      default: {
        // Aplicar formato de texto si existe
        let displayValue = String(value);
        if (field.format && typeof value === "string") {
          displayValue = applyTextFormat(value, field.format);
        }
        return displayValue;
      }
    }
  };

  // --------------------------------------------------
  // Renderizar un field individual
  // --------------------------------------------------
  const renderField = (fieldKey: keyof TData) => {
    const field = getField(fieldKey);
    if (!field) return null;

    const value = getFieldValue(field);

    return (
      <div
        key={String(field.key)}
        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        {field.icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              field.color || "bg-gray-100"
            }`}
          >
            {field.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {field.label}
          </p>
          <div className="text-gray-900 font-semibold">{value as string}</div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Renderizar una sección completa
  // --------------------------------------------------
  const renderSection = (section: SectionConfig<TData>) => {
    const validFields = section.fields.filter((key) => getField(key));
    if (validFields.length === 0) return null;

    return (
      <div key={section.title} className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg border-b pb-2 flex items-center gap-2">
          {section.icon && (
            <span className="text-gray-600">{section.icon}</span>
          )}
          {section.title}
        </h3>
        <div
          className={`grid grid-cols-1 ${section.columns === 2 ? "lg:grid-cols-2" : ""} gap-4`}
        >
          {section.fields.map((key) => renderField(key))}
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Obtener header (título, subtítulo, badge)
  // --------------------------------------------------
  const title =
    typeof config.title === "function" ? config.title(data) : config.title;
  const subtitle = config.subtitle
    ? typeof config.subtitle === "function"
      ? config.subtitle(data)
      : config.subtitle
    : undefined;
  const badge = config.badge
    ? typeof config.badge === "function"
      ? config.badge(data)
      : config.badge
    : undefined;
  const badgeColor = config.badgeColor
    ? typeof config.badgeColor === "function"
      ? config.badgeColor(data)
      : config.badgeColor
    : "bg-red-100 text-red-800 border border-red-200";

  // --------------------------------------------------
  // JSX final
  // --------------------------------------------------
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiFileText className="flex-shrink-0" />
                <span className="text-sm">{subtitle}</span>
              </div>
            )}
          </div>
          {badge && (
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeColor}`}
            >
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-8">{config.sections.map(renderSection)}</div>
    </div>
  );
}

// ============================================
// 4. EJEMPLO DE CONFIGURACIÓN (userMovilView)
// ============================================

// Definimos el modelo de datos (ajústalo a tu UsersTable real)
export interface UsersTable {
  id: string;
  name: string;
  certificate: string;
  role: "admin" | "premium" | "doctor";
  email?: string;
  phone?: string;
}

export const userMovilView = createConfig<UsersTable>({
  title: (data) => data.name || "Doctor",
  subtitle: (data) => `ID: ${data.id || "N/A"}`,
  badge: (data) => data.role || "Doctor",
  badgeColor: (data) => {
    const role = data.role?.toLowerCase();
    if (role === "admin")
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (role === "premium")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  },
  fields: [
    {
      key: "name",
      label: "Nombre completo",
      type: "text",
      icon: <FiUser className="text-purple-600 text-lg" />,
      color: "bg-purple-50 border border-purple-100",
      format: "capitalize",
    },
    {
      key: "certificate",
      label: "Certificado",
      type: "text",
      icon: <FiUser className="text-purple-600 text-lg" />,
      color: "bg-purple-50 border border-purple-100",
    },
    {
      key: "role",
      label: "Rol",
      type: "badge",
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "email",
      label: "Correo electrónico",
      type: "email",
      icon: <FiUser className="text-gray-500" />,
    },
    {
      key: "phone",
      label: "Teléfono",
      type: "phone",
      icon: <FiUser className="text-gray-500" />,
    },
  ],
  sections: [
    {
      title: "Información personal",
      icon: <FiUser className="text-gray-600" />,
      fields: ["name", "certificate", "role", "email", "phone"],
      columns: 2, // mostrar en dos columnas en pantallas grandes
    },
  ],
});

export default CustomDataDisplay;
