import React, { useState, useEffect, ReactElement } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import Spinner from "../loading/loading";
import { theme } from "../../../config/themes";

interface PdfPreviewProps {
  name: string;
  children: ReactElement;
}

export default function PdfPreview({ name, children }: PdfPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Spinner />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <BlobProvider document={children}>
        {({ blob, url, loading, error }) => {
          if (loading) {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  background: theme.colors.background.page,
                }}
              >
                <Spinner />
              </div>
            );
          }

          if (error) {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: theme.spacing[4],
                  background: theme.colors.background.page,
                }}
              >
                <div
                  style={{
                    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
                    background: theme.colors.feedback.errorLight,
                    border: `1px solid ${theme.colors.border.error}`,
                    borderRadius: theme.radius.md,
                    color: theme.colors.status.error,
                    fontFamily: theme.typography.fontFamilySecondary,
                    fontWeight: theme.typography.fontWeight.medium,
                    boxShadow: theme.shadows.sm,
                  }}
                >
                  ❌ Error al generar la vista previa del PDF
                </div>
              </div>
            );
          }

          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: theme.colors.background.page,
              }}
            >
              {/* Barra de herramientas / Botón de descarga */}
              <div
                style={{
                  padding: theme.spacing[4],
                  borderBottom: `1px solid ${theme.colors.border.DEFAULT}`,
                  background: theme.colors.background.card,
                  boxShadow: theme.shadows.sm,
                  zIndex: 1,
                }}
              >
                <a
                  href={url || ""}
                  download={`${name || "sin-id"}.pdf`}
                  className="transition-all duration-150 active:scale-95"
                  style={{
                    textDecoration: "none",
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    backgroundColor: theme.colors.primary.DEFAULT,
                    color: theme.colors.text.inverse,
                    borderRadius: theme.radius.md,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: theme.spacing[2],
                    fontFamily: theme.typography.fontFamilySecondary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    fontSize: theme.typography.fontSize.sm,
                    boxShadow: theme.shadows.sm,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.primary[600] || theme.colors.primary.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.primary.DEFAULT;
                  }}
                >
                  <span>Doc.</span> Descargar Acta de Infracción
                </a>
              </div>

              {/* Visor de PDF */}
              <div style={{ flex: 1, width: "100%", position: "relative" }}>
                <iframe
                  src={url || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: theme.colors.background.surface,
                  }}
                  title="Vista previa del PDF"
                />
              </div>
            </div>
          );
        }}
      </BlobProvider>
    </div>
  );
}
