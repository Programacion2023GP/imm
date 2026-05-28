
import React from "react";
import { FiFileText, FiUser } from "react-icons/fi";
import { theme } from "../../../../config/themes";

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
  key: TKey;
  label: string;
  type: FieldType;
  icon?: React.ReactNode;
  color?: string; 
  bgColor?: string; 
  textColor?: string; 
  format?: "capitalize" | "uppercase" | "lowercase";
  render?: (value: TData[TKey], data: TData) => React.ReactNode;
  priority?: number;
}

export interface SectionConfig<TData> {
  title: string;
  fields: Array<keyof TData>;
  columns?: 1 | 2;
  color?: string;
  icon?: React.ReactNode;
}

export interface DataDisplayConfig<TData> {
  title: string | ((data: TData) => string);
  subtitle?: string | ((data: TData) => string);
  badge?: string | ((data: TData) => string);
  badgeColor?: string | ((data: TData) => string);
  badgeBgColor?: string | ((data: TData) => string);
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
        className="w-6 h-6 rounded-full border"
        style={{
          backgroundColor: color,
          borderColor: theme.colors.border.DEFAULT,
        }}
      />
      <span style={{ color: theme.colors.text.primary }}>{color}</span>
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
  const getFieldValue = (field: FieldConfig<TData>): React.ReactNode => {
    const value = data[field.key];
    if (value === null || value === undefined || value === "") {
      return "No especificado";
    }

    if (field.render) {
      return field.render(value, data);
    }

    switch (field.type) {
      case "currency":
        return typeof value === "number" ? formatCurrency(value) : String(value);

      case "date":
        return typeof value === "string" ? formatDate(value, false) : String(value);

      case "datetime":
        return typeof value === "string" ? formatDate(value, true) : String(value);

      case "phone":
        return typeof value === "string" ? formatPhone(value) : String(value);

      case "percentage":
        return typeof value === "number" ? `${value}%` : String(value);

      case "color":
        return typeof value === "string" ? formatColor(value) : String(value);

      case "badge":
        const badgeBgColor = field.bgColor || theme.colors.feedback.primaryLight;
        const badgeTextColor = field.textColor || theme.colors.primary.DEFAULT;
        return (
          <span
            className="px-3 py-1 text-sm font-medium"
            style={{
              background: badgeBgColor,
              color: badgeTextColor,
              borderRadius: theme.radius.full,
            }}
          >
            {String(value)}
          </span>
        );

      default: {
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

    const content = getFieldValue(field);
    const iconBgColor = field.bgColor || theme.colors.feedback.primaryLight;
    const iconTextColor = field.textColor || theme.colors.primary.DEFAULT;

    return (
      <div
        key={String(field.key)}
        className="flex items-center gap-3 transition-shadow duration-200 hover:shadow-md"
        style={{
          padding: theme.spacing[4],
          borderRadius: theme.radius.xl,
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.DEFAULT}`,
          boxShadow: theme.shadows.sm,
        }}
      >
        {field.icon && (
          <div
            className="w-12 h-12 flex items-center justify-center flex-shrink-0"
            style={{
              borderRadius: theme.radius.xl,
              background: iconBgColor,
              color: iconTextColor,
            }}
          >
            {field.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium mb-1"
            style={{ 
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamilySecondary 
            }}
          >
            {field.label}
          </p>
          <div
            className="font-semibold"
            style={{ 
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamilySecondary
            }}
          >
            {content}
          </div>
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
      <div key={section.title}  className="flex flex-col gap-4">
        <h3
          className="font-bold text-lg border-b pb-2 flex items-center gap-2"
          style={{
            color: theme.colors.text.primary,
            borderBottomColor: theme.colors.border.DEFAULT,
            fontFamily: theme.typography.fontFamilyPrimary
          }}
        >
          {section.icon && (
            <span style={{ color: theme.colors.text.secondary }}>
              {section.icon}
            </span>
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
  const title = typeof config.title === "function" ? config.title(data) : config.title;
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

  // Funciones para obtener colores del badge desde el tema
  const getBadgeBgColor = () => {
    if (config.badgeBgColor) {
      return typeof config.badgeBgColor === "function"
        ? config.badgeBgColor(data)
        : config.badgeBgColor;
    }
    if (config.badgeColor) {
      const badgeColorValue =
        typeof config.badgeColor === "function" ? config.badgeColor(data) : config.badgeColor;
      
      if (badgeColorValue.includes("purple")) return theme.colors.feedback.primaryLight;
      if (badgeColorValue.includes("yellow")) return `${theme.colors.status.warning}20`;
      if (badgeColorValue.includes("green")) return `${theme.colors.status.success}20`;
      if (badgeColorValue.includes("red")) return `${theme.colors.status.error}20`;
      return theme.colors.feedback.primaryLight;
    }
    return theme.colors.feedback.primaryLight;
  };

  const getBadgeTextColor = () => {
    if (config.badgeColor) {
      const badgeColorValue =
        typeof config.badgeColor === "function" ? config.badgeColor(data) : config.badgeColor;
      if (badgeColorValue.includes("purple")) return theme.colors.secondary.DEFAULT;
      if (badgeColorValue.includes("yellow")) return theme.colors.status.warning;
      if (badgeColorValue.includes("green")) return theme.colors.status.success;
      if (badgeColorValue.includes("red")) return theme.colors.status.error;
      return theme.colors.primary.DEFAULT;
    }
    return theme.colors.primary.DEFAULT;
  };

  const badgeBgColor = getBadgeBgColor();
  const badgeTextColor = getBadgeTextColor();

  // --------------------------------------------------
  // JSX final
  // --------------------------------------------------
  return (
    <div
      className={`border overflow-hidden ${className}`}
      style={{
        background: theme.colors.background.card,
        borderColor: theme.colors.border.DEFAULT,
        borderRadius: theme.radius["2xl"],
        boxShadow: theme.shadows.lg,
        fontFamily: theme.typography.fontFamily
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
          borderBottomColor: theme.colors.border.DEFAULT,
          background: `linear-gradient(135deg, ${theme.colors.background.surface}, ${theme.colors.background.card})`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ 
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamilyPrimary 
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <div
                className="flex items-center gap-2"
                style={{ 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamilySecondary 
                }}
              >
                <FiFileText className="flex-shrink-0" />
                <span className="text-sm">{subtitle}</span>
              </div>
            )}
          </div>
          {badge && (
            <div
              className="px-4 py-2 text-sm font-semibold flex-shrink-0"
              style={{
                background: badgeBgColor,
                color: badgeTextColor,
                borderRadius: theme.radius.full,
              }}
            >
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8" style={{ padding: theme.spacing[6] }}>
        {config.sections.map(renderSection)}
      </div>
    </div>
  );
}

// ============================================
// 4. EJEMPLO DE CONFIGURACIÓN (userMovilView)
// ============================================

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
    if (role === "admin") return "purple";
    if (role === "premium") return "yellow";
    return "green";
  },
  fields: [
    {
      key: "name",
      label: "Nombre completo",
      type: "text",
      icon: <FiUser className="text-lg" />,
      bgColor: theme.colors.feedback.primaryLight,
      textColor: theme.colors.primary.DEFAULT,
      format: "capitalize",
    },
    {
      key: "certificate",
      label: "Certificado",
      type: "text",
      icon: <FiUser className="text-lg" />,
      bgColor: theme.colors.feedback.primaryLight,
      textColor: theme.colors.primary.DEFAULT,
    },
    {
      key: "role",
      label: "Rol",
      type: "badge",
      bgColor: theme.colors.feedback.primaryLight,
      textColor: theme.colors.primary.DEFAULT,
    },
    {
      key: "email",
      label: "Correo electrónico",
      type: "email",
      icon: <FiUser className="text-lg" />,
      bgColor: theme.colors.background.surface,
      textColor: theme.colors.text.secondary,
    },
    {
      key: "phone",
      label: "Teléfono",
      type: "phone",
      icon: <FiUser className="text-lg" />,
      bgColor: theme.colors.background.surface,
      textColor: theme.colors.text.secondary,
    },
  ],
  sections: [
    {
      title: "Información personal",
      icon: <FiUser />,
      fields: ["name", "certificate", "role", "email", "phone"],
      columns: 2,
    },
  ],
});

export default CustomDataDisplay;

