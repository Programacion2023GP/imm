import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";

interface SimpleAlertProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  closable?: boolean;
  className?: string;
}

const CustomAlert: React.FC<SimpleAlertProps> = ({
  type = "info",
  message,
  closable = true,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const types = {
    success: {
      bg: "#F0FDF4", // Verde muy claro
      border: "#22C55E", // Verde
      text: "#166534", // Verde oscuro
      icon: <CheckCircle className="w-5 h-5" />,
      hover: "#15803D", // Verde más oscuro para hover
    },
    error: {
      bg: "#FEF2F2", // Rojo muy claro
      border: "#EF4444", // Rojo
      text: "#991B1B", // Rojo oscuro
      icon: <AlertCircle className="w-5 h-5" />,
      hover: "#B91C1C",
    },
    warning: {
      bg: "#FFFBEB", // Amarillo muy claro
      border: "#F59E0B", // Amarillo/Ámbar
      text: "#92400E", // Ámbar oscuro
      icon: <AlertTriangle className="w-5 h-5" />,
      hover: "#B45309",
    },
    info: {
      bg: "#EFF6FF", // Azul muy claro
      border: "#3B82F6", // Azul
      text: "#1E40AF", // Azul oscuro
      icon: <Info className="w-5 h-5" />,
      hover: "#1D4ED8",
    },
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border w-full ${className}`}
      style={{
        background: types.bg,
        borderColor: types.border,
      }}
    >
      <div className="flex items-center gap-3">
        <div style={{ color: types.text }}>{types.icon}</div>
        <span className="text-sm font-medium" style={{ color: types.text }}>
          {message}
        </span>
      </div>

      {closable && (
        <button
          onClick={() => setIsVisible(false)}
          className="transition-colors"
          style={{ color: "#9CA3AF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = types.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9CA3AF";
          }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default CustomAlert;

// Uso:
// <CustomAlert type="warning" message="Esta es una advertencia" />
// <CustomAlert type="info" message="Información importante" closable={false} />
