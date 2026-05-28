// src/ui/components/advanced/ImportExportButtons.tsx
import React, { useRef } from "react";
import { FiDownload, FiUpload, FiFileText } from "react-icons/fi";
import type {
  ExportConfig,
  ImportConfig,
} from "../../../types/crud-advanced.types";
import { theme } from "../../../config/themes";

interface ImportExportButtonsProps {
  exportConfig?: ExportConfig;
  importConfig?: ImportConfig;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onImport: (file: File) => void;
  isImporting: boolean;
  importProgress: number;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  exportConfig,
  importConfig,
  onExportCSV,
  onExportExcel,
  onImport,
  isImporting,
  importProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Estilos base para botones
  const buttonBaseStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: theme.radius.md,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 500,
    border: `1px solid ${theme.colors.border.DEFAULT}`,
    background: theme.colors.background.card,
    color: theme.colors.text.secondary,
    transition: theme.transitions.DEFAULT,
    cursor: "pointer",
  };

  const buttonHoverStyle = {
    background: theme.colors.background.surface,
    color: theme.colors.text.primary,
  };

  const dropdownItemStyle = {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    fontSize: theme.typography.fontSize.xs,
    textAlign: "left" as const,
    color: theme.colors.text.secondary,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.DEFAULT,
  };

  const dropdownItemHoverStyle = {
    background: theme.colors.background.surface,
    color: theme.colors.text.primary,
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Export */}
      {exportConfig?.enabled && (
        <div className="relative group">
          <button
            className="inline-flex items-center"
            style={buttonBaseStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, buttonBaseStyle);
            }}
          >
            <FiDownload
              className="mr-1.5 h-3.5 w-3.5"
              style={{ color: "inherit" }}
            />
            Exportar
          </button>
          <div
            className="absolute right-0 z-10 hidden w-48 py-1 mt-1 rounded-lg shadow-lg group-hover:block"
            style={{
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              boxShadow: theme.shadows.dropdown,
            }}
          >
            {exportConfig.formats.includes("csv") && (
              <button
                onClick={onExportCSV}
                style={dropdownItemStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, dropdownItemHoverStyle);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, dropdownItemStyle);
                }}
              >
                <FiFileText
                  className="inline w-3 h-3 mr-2"
                  style={{ color: "inherit" }}
                />
                Exportar como CSV
              </button>
            )}
            {exportConfig.formats.includes("xlsx") && (
              <button
                onClick={onExportExcel}
                style={dropdownItemStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, dropdownItemHoverStyle);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, dropdownItemStyle);
                }}
              >
                <FiDownload
                  className="inline w-3 h-3 mr-2"
                  style={{ color: "inherit" }}
                />
                Exportar como Excel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import */}
      {importConfig?.enabled && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            style={{
              ...buttonBaseStyle,
              opacity: isImporting ? 0.6 : 1,
              cursor: isImporting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isImporting) {
                Object.assign(e.currentTarget.style, buttonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (!isImporting) {
                Object.assign(e.currentTarget.style, buttonBaseStyle);
              }
            }}
          >
            <FiUpload className="mr-1.5 h-3.5 w-3.5" />
            {isImporting ? `Importando... ${importProgress}%` : "Importar"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={importConfig.acceptedFormats.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ImportExportButtons;
