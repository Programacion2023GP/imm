import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { theme } from "../../../config/themes";

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
      bg: theme.colors.feedback.successLight,
      border: theme.colors.status.success,
      text: theme.colors.status.success,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      bg: theme.colors.feedback.errorLight,
      border: theme.colors.status.error,
      text: theme.colors.status.error,
      icon: <AlertCircle className="w-5 h-5" />,
    },
    warning: {
      bg: `${theme.colors.status.warning}15`,
      border: theme.colors.status.warning,
      text: theme.colors.status.warning,
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    info: {
      bg: theme.colors.feedback.primaryLight,
      border: theme.colors.primary.DEFAULT,
      text: theme.colors.primary.DEFAULT,
      icon: <Info className="w-5 h-5" />,
    },
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${className}`}
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
          style={{ color: theme.colors.text.disabled }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.text.disabled;
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
