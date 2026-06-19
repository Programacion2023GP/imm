import React, { useState, useMemo } from "react";
import {
  FaBriefcase,
  FaChevronDown,
  FaFolder,
  FaComment,
  FaPaperclip,
  FaGavel,
  FaClock,
  FaArrowRight,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa6";
import type { Caso } from "./types";
import { theme } from "../../../../config/themes";
import { useCasosTree } from "./usecasostree";
import UseLegalData from "../../../hooks/legal/uselegal";
import UseJuridicProccessData from "../../../hooks/juridicproccess/useproccessjuridic";
import {
  FaCalendarAlt,
  FaEdit,
  FaFileAlt,
  FaListAlt,
  FaDownload,
  FaTimes,
  FaCheckCircle,
  FaEye,
} from "react-icons/fa";
import { ProccessJuridic } from "../../../../models/proccessjuridic/processjuridic";

// ─── Constantes de color (solo para tipos de caso) ──────────────────────────
const TIPO_COLORS: Record<string, { bg: string; color: string; dot: string }> =
  {
    Laboral: { bg: "#E6F1FB", color: "#185FA5", dot: "#378ADD" },
    Civil: { bg: "#F1EFE8", color: "#5F5E5A", dot: "#888780" },
    Mercantil: { bg: "#EEEDFE", color: "#534AB7", dot: "#7F77DD" },
    Penal: { bg: "#FCEBEB", color: "#A32D2D", dot: "#E24B4A" },
  };
const DEFAULT_TIPO_COLOR = { bg: "#F1EFE8", color: "#5F5E5A", dot: "#888780" };

// ─── Niveles de progreso (sin verde) ──────────────────────────────────────
const PROGRESS_LEVELS = [
  {
    min: 100,
    fill: theme.colors.primary.dark, // guinda oscuro
    bg: theme.colors.primary[100] || "#F9E4EA", // guinda muy claro
    text: theme.colors.primary.dark,
    label: "Completado",
  },
  {
    min: 50,
    fill: theme.colors.status.warning, // amarillo
    bg: theme.colors.feedback.warningLight,
    text: "#854F0B",
    label: "En progreso",
  },
  {
    min: 1,
    fill: theme.colors.primary.DEFAULT, // guinda
    bg: theme.colors.feedback.primaryLight,
    text: theme.colors.primary.DEFAULT,
    label: "Iniciado",
  },
  {
    min: 0,
    fill: theme.colors.neutral[400],
    bg: theme.colors.neutral[100],
    text: theme.colors.text.secondary,
    label: "Sin iniciar",
  },
];

function getProgressLevel(pct: number) {
  return PROGRESS_LEVELS.find((c) => pct >= c.min) ?? PROGRESS_LEVELS[3];
}

function getProgressColor(pct: number) {
  return getProgressLevel(pct).fill;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Evidencia {
  evidencia_url: string;
  tipo_archivo?: string;
  nombre_original?: string;
  fecha_subida?: string;
}

interface Props {
  caso: Caso;
  onClose: () => void;
  onEditar: (label: string) => void;
}

type TimelineEvent = {
  id: string;
  label: string;
  date?: string;
  comments?: string;
  evidences?: any[];
  icon: React.ReactNode;
  done?: boolean;
};

type CasoCardProps = { caso: Caso };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isImage = (tipo?: string) => !!tipo?.startsWith("image/");
const isPdf = (tipo?: string) => tipo === "application/pdf";

function FileIconComp({ tipo, size = 16 }: { tipo?: string; size?: number }) {
  if (isPdf(tipo)) return <FaFilePdf size={size} color="#d32f2f" />;
  if (isImage(tipo))
    return <FaFileImage size={size} color={theme.colors.primary.DEFAULT} />; // guinda en lugar de verde
  if (tipo?.includes("word")) return <FaFileWord size={size} color="#1a73e8" />;
  if (tipo?.includes("excel") || tipo?.includes("spreadsheet"))
    return <FaFileExcel size={size} color="#217346" />;
  return <FaFileAlt size={size} color={theme.colors.neutral[400]} />;
}

function getFileLabel(tipo?: string) {
  if (isPdf(tipo)) return "PDF";
  if (isImage(tipo)) return "IMAGEN";
  if (tipo?.includes("word")) return "WORD";
  if (tipo?.includes("excel") || tipo?.includes("spreadsheet")) return "EXCEL";
  return tipo?.split("/")[1]?.toUpperCase() ?? "ARCHIVO";
}

// ─── Normalización de evidencias (strings → objetos) ──────────────────────

function getMimeFromUrl(url: string): string | undefined {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext || "")) {
    return "image/" + ext;
  }
  if (["doc", "docx"].includes(ext || "")) return "application/msword";
  if (["xls", "xlsx"].includes(ext || "")) return "application/vnd.ms-excel";
  return undefined;
}

function normalizeEvidence(
  ev: any,
  etapaLabel: string,
  etapaId: string,
): Evidencia & { etapa: string; etapaId: string } {
  if (typeof ev === "string") {
    const url = ev;
    const mime = getMimeFromUrl(url);
    const fileName = url.split("/").pop() || "archivo";
    return {
      evidencia_url: url,
      tipo_archivo: mime,
      nombre_original: fileName,
      fecha_subida: undefined,
      etapa: etapaLabel,
      etapaId: etapaId,
    };
  }
  return {
    ...ev,
    etapa: etapaLabel,
    etapaId: etapaId,
  };
}

// ─── Estilos base con theme ─────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  height: "28px",
  borderRadius: theme.radius.md,
  border: `0.5px solid ${theme.colors.border.DEFAULT}`,
  backgroundColor: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  fontSize: theme.typography.fontSize.sm,
  fontWeight: theme.typography.fontWeight.medium,
  padding: "0 10px",
  whiteSpace: "nowrap" as const,
  transition: theme.transitions.fast,
  fontFamily: theme.typography.fontFamily,
};

const badgeStyle: React.CSSProperties = {
  fontSize: theme.typography.fontSize.xs,
  background: theme.colors.neutral[100],
  color: theme.colors.text.secondary,
  padding: "2px 10px",
  borderRadius: theme.radius.full,
  border: `0.5px solid ${theme.colors.border.light}`,
};

const iconBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: `0.5px solid ${theme.colors.border.DEFAULT}`,
  borderRadius: theme.radius.sm,
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.text.secondary,
  flexShrink: 0,
  transition: theme.transitions.fast,
};

const editBtnStyle: React.CSSProperties = {
  height: 26,
  padding: "0 10px",
  fontSize: theme.typography.fontSize.xs,
  border: `0.5px solid ${theme.colors.border.DEFAULT}`,
  borderRadius: theme.radius.sm,
  background: "transparent",
  cursor: "pointer",
  color: theme.colors.text.secondary,
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontFamily: theme.typography.fontFamily,
  transition: theme.transitions.fast,
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "0 16px",
  height: 32,
  fontSize: theme.typography.fontSize.sm,
  border: `0.5px solid ${theme.colors.border.DEFAULT}`,
  borderRadius: theme.radius.sm,
  background: "transparent",
  color: theme.colors.text.secondary,
  cursor: "pointer",
  fontFamily: theme.typography.fontFamily,
  transition: theme.transitions.fast,
};

const actionBtnStyle: React.CSSProperties = {
  height: 22,
  padding: "0 8px",
  fontSize: "10px",
  border: `0.5px solid ${theme.colors.border.light}`,
  borderRadius: theme.radius.sm,
  background: "transparent",
  cursor: "pointer",
  color: theme.colors.text.secondary,
  display: "flex",
  alignItems: "center",
  gap: 3,
  fontFamily: theme.typography.fontFamily,
  transition: theme.transitions.fast,
};

// ─── Thumbnail ────────────────────────────────────────────────────────────────

const ImageThumbnail: React.FC<{ ev: Evidencia }> = ({ ev }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: theme.colors.neutral[100], // gris claro en lugar de verde
        }}
      >
        <FaFileImage size={28} color={theme.colors.primary.DEFAULT} />
        <span
          style={{
            fontSize: "10px",
            color: theme.colors.primary.DEFAULT,
            fontWeight: 600,
          }}
        >
          IMAGEN
        </span>
      </div>
    );
  }
  return (
    <img
      src={ev.evidencia_url}
      alt={ev.nombre_original ?? "imagen"}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
};

const PdfThumbnail: React.FC<{ ev: Evidencia }> = ({ ev }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "#fff5f5", // se mantiene rojo claro para PDF
        }}
      >
        <FaFilePdf size={30} color="#d32f2f" />
        <span style={{ fontSize: "10px", color: "#d32f2f", fontWeight: 600 }}>
          PDF
        </span>
      </div>
    );
  }
  const scale = 100 / 340;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: theme.colors.background.card,
      }}
    >
      <iframe
        src={`${ev.evidencia_url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH`}
        title={ev.nombre_original ?? "preview pdf"}
        onError={() => setFailed(true)}
        scrolling="no"
        style={{
          // position:"absolute",
          width: "100%",
          border: "none",
          transformOrigin: "top left",
          // transform: `scale(${scale})`,
          pointerEvents: "none",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          background: "rgba(211,47,47,0.88)",
          color: "#fff",
          fontSize: "9px",
          fontWeight: 700,
          padding: "1px 6px",
          borderRadius: 3,
          letterSpacing: "0.05em",
          pointerEvents: "none",
        }}
      >
        PDF
      </div>
    </div>
  );
};

const Thumbnail: React.FC<{ ev: Evidencia }> = ({ ev }) => {
  const tipo = ev.tipo_archivo ?? "";
  if (isImage(tipo)) return <ImageThumbnail ev={ev} />;
  if (isPdf(tipo)) return <PdfThumbnail ev={ev} />;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: theme.colors.neutral[50],
      }}
    >
      <FileIconComp tipo={tipo} size={28} />
      <span
        style={{
          fontSize: "10px",
          color: theme.colors.text.placeholder,
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        {getFileLabel(tipo)}
      </span>
    </div>
  );
};

// ─── FilterChip ───────────────────────────────────────────────────────────────

const FilterChip: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}> = ({ label, count, active, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      padding: "4px 12px",
      fontSize: theme.typography.fontSize.xs,
      borderRadius: theme.radius.full,
      cursor: "pointer",
      border: active ? "none" : `0.5px solid ${theme.colors.border.DEFAULT}`,
      background: active ? color : "transparent",
      color: active ? theme.colors.text.inverse : theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily,
      transition: theme.transitions.fast,
      fontWeight: active ? 600 : 400,
    }}
  >
    {label} <span style={{ opacity: 0.7 }}>({count})</span>
  </button>
);

// ─── EvidenciaCard ──────────────────────────────────────────────────────────

const EvidenciaCard: React.FC<{
  ev: Evidencia & { etapa: string; etapaId: string };
  onClick: () => void;
}> = ({ ev, onClick }) => {
  const canInteract = isImage(ev.tipo_archivo) || isPdf(ev.tipo_archivo);

  return (
    <div
      onClick={canInteract ? onClick : undefined}
      style={{
        border: `0.5px solid ${theme.colors.border.light}`,
        borderRadius: theme.radius.md,
        overflow: "hidden",
        background: theme.colors.background.card,
        cursor: canInteract ? "pointer" : "default",
        transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}, border-color ${theme.transitions.fast}`,
        boxShadow: theme.shadows.card,
      }}
      onMouseEnter={(e) => {
        if (canInteract) {
          (e.currentTarget as HTMLDivElement).style.transform =
            "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            theme.shadows.lg;
          (e.currentTarget as HTMLDivElement).style.borderColor =
            theme.colors.primary.DEFAULT;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          theme.shadows.card;
        (e.currentTarget as HTMLDivElement).style.borderColor =
          theme.colors.border.light;
      }}
    >
      <div
        style={{
          height: 100,
          overflow: "hidden",
          background: theme.colors.neutral[50],
          position: "relative",
        }}
      >
        <Thumbnail ev={ev} />
      </div>

      <div style={{ padding: "8px 10px" }}>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: 500,
            color: theme.colors.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ev.nombre_original ?? "Archivo"}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: theme.colors.text.placeholder,
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <span>{ev.etapa}</span>
          {ev.fecha_subida && (
            <span>
              {new Date(ev.fecha_subida).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: `0.5px solid ${theme.colors.border.light}`,
          padding: "4px 8px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 4,
          background: theme.colors.neutral[50],
        }}
      >
        {isImage(ev.tipo_archivo) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={actionBtnStyle}
            title="Ver imagen"
          >
            <FaEye size={15} />
          </button>
        )}
        {isPdf(ev.tipo_archivo) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(ev.evidencia_url, "_blank", "noopener,noreferrer");
            }}
            style={actionBtnStyle}
            title="Abrir PDF"
          >
            <FaEye size={15} />
          </button>
        )}
       
      </div>
    </div>
  );
};

// ─── CasoDesglose ────────────────────────────────────────────────────────────

const CasoDesglose: React.FC<Props> = ({ caso, onClose, onEditar }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"evidencias" | "etapas">(
    "evidencias",
  );
  const [filterEtapa, setFilterEtapa] = useState<string | null>(null);

  const etapas = useMemo(
    () => [
      {
        id: "presentacion",
        label: "Presentación",
        date: caso.fecha_presentacion,
        comments: caso.comentarios_presentacion,
        evidences: caso.evidencias_presentacion ?? [],
      },
      {
        id: "radicacion",
        label: "Radicación",
        date: caso.fecha_radicacion,
        comments: caso.comentarios_radicacion,
        evidences: caso.evidencias_radicacion ?? [],
      },
      {
        id: "audiencia",
        label: "Audiencia",
        date: caso.fecha_audiencia,
        comments: caso.comentarios_audiencia,
        evidences: caso.evidencias_audiencia ?? [],
      },
      {
        id: "exhorto",
        label: "Exhorto",
        date: caso.fecha_exhorto,
        comments: caso.comentarios_exhorto,
        evidences: caso.evidencias_exhorto ?? [],
      },
      {
        id: "oficios",
        label: "Oficios",
        date: caso.fecha_oficios,
        comments: caso.comentarios_oficio,
        evidences: caso.evidencias_oficio ?? [],
      },
      {
        id: "promocion",
        label: "Promoción",
        date: caso.fecha_promocion,
        comments: caso.comentarios_promocion,
        evidences: caso.evidencias_promocion ?? [],
        done: !!(caso.tipo_promocion || caso.fecha_promocion),
      },
      {
        id: "sentencia",
        label: "Sentencia",
        date: caso.fecha_sentencia,
        comments: caso.comentarios_sentencia,
        evidences: caso.evidencias_sentencia ?? [],
      },
    ],
    [caso],
  );

  const total = etapas.length;
  const completadas = etapas.filter((e) =>
    (e as any).done !== undefined ? (e as any).done : !!e.date,
  ).length;
  const pct = Math.round((completadas / total) * 100);
  const progressColor = getProgressColor(pct);

  const todasEvidencias = etapas.flatMap((e) =>
    e.evidences.map((ev) => normalizeEvidence(ev, e.label, e.id)),
  );
const [expandedPdf, setExpandedPdf] = useState<string | null>(null);

  const fechas = etapas.map((e) => e.date).filter(Boolean) as string[];
  const inicio = fechas.length ? new Date(fechas[0]) : null;
  const fin = fechas.length ? new Date(fechas[fechas.length - 1]) : null;
  const duracion =
    inicio && fin
      ? Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const evidenciasFiltradas = filterEtapa
    ? todasEvidencias.filter((ev) => ev.etapaId === filterEtapa)
    : todasEvidencias;

  const etapasConEv = etapas.filter((e) => e.evidences.length > 0);

function handleEvidenciaClick(ev: Evidencia & { etapaId: string }) {
  if (isImage(ev.tipo_archivo)) {
    setExpandedImage(ev.evidencia_url);
  } else if (isPdf(ev.tipo_archivo)) {
    setExpandedPdf(ev.evidencia_url); // antes: window.open(...)
  }
}

  return (
    <>
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedImage(null)}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                cursor: "pointer",
                padding: "5px 14px",
                borderRadius: theme.radius.sm,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              <FaTimes size={12} /> cerrar
            </button>
            <img
              src={expandedImage}
              alt="Vista ampliada"
              style={{
                maxWidth: "82vw",
                maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: theme.radius.md,
                display: "block",
              }}
            />
          </div>
        </div>
      )}

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 700,
            maxWidth: "95vw",
            height: "100vh",
            background: theme.colors.background.card,
            borderLeft: `0.5px solid ${theme.colors.border.DEFAULT}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: theme.shadows.xl,
            animation: "slideInRight 0.22s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `0.5px solid ${theme.colors.border.light}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <h2
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: 600,
                    margin: "0 0 6px",
                    color: theme.colors.text.primary,
                  }}
                >
                  {caso.nombre}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {caso.expediente && (
                    <span style={badgeStyle}>📁 {caso.expediente}</span>
                  )}
                  {caso.juzgado && (
                    <span style={badgeStyle}>⚖️ {caso.juzgado}</span>
                  )}
                  {caso.actor && (
                    <span style={badgeStyle}>👤 {caso.actor}</span>
                  )}
                </div>
              </div>
              <button onClick={onClose} style={iconBtnStyle}>
                <FaTimes size={14} />
              </button>
            </div>

            {/* Barra de progreso */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    marginBottom: 4,
                  }}
                >
                  <span>Progreso</span>
                  <span style={{ fontWeight: 500, color: progressColor }}>
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: theme.colors.neutral[200],
                    borderRadius: theme.radius.full,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: progressColor,
                      borderRadius: theme.radius.full,
                      transition: `width ${theme.transitions.normal}`,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  flexShrink: 0,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <FaCheckCircle
                    size={11}
                    color={theme.colors.primary.DEFAULT} // guinda en lugar de verde
                  />{" "}
                  {completadas}/{total}
                </span>
                {duracion > 0 && (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <FaClock size={11} /> {duracion}d
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <FaPaperclip size={11} /> {todasEvidencias.length}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `0.5px solid ${theme.colors.border.light}`,
              flexShrink: 0,
              padding: "0 20px",
            }}
          >
            {(["evidencias", "etapas"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 14px",
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color:
                    activeTab === tab
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${
                    activeTab === tab ? progressColor : "transparent"
                  }`,
                  cursor: "pointer",
                  transition: theme.transitions.fast,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {tab === "evidencias"
                  ? `Evidencias (${todasEvidencias.length})`
                  : "Etapas"}
              </button>
            ))}
          </div>

          {/* Cuerpo */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              background: theme.colors.background.page,
            }}
          >
            {activeTab === "evidencias" && (
              <>
                {etapasConEv.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    <FilterChip
                      label="Todas"
                      count={todasEvidencias.length}
                      active={filterEtapa === null}
                      onClick={() => setFilterEtapa(null)}
                      color={progressColor}
                    />
                    {etapasConEv.map((e) => (
                      <FilterChip
                        key={e.id}
                        label={e.label}
                        count={e.evidences.length}
                        active={filterEtapa === e.id}
                        onClick={() => setFilterEtapa(e.id)}
                        color={progressColor}
                      />
                    ))}
                  </div>
                )}

                {evidenciasFiltradas.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {evidenciasFiltradas.map((ev, idx) => (
                      <EvidenciaCard
                        key={idx}
                        ev={ev}
                        onClick={() => handleEvidenciaClick(ev)}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 20px",
                      color: theme.colors.text.placeholder,
                    }}
                  >
                    <FaPaperclip
                      size={28}
                      style={{
                        opacity: 0.3,
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        margin: 0,
                      }}
                    >
                      No hay evidencias en esta etapa
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "etapas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {etapas.map((e) => {
                  const isDone =
                    (e as any).done !== undefined ? (e as any).done : !!e.date;
                  const dateStr = e.date
                    ? new Date(e.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null;
                  const normalizedEvs = e.evidences.map((ev) =>
                    normalizeEvidence(ev, e.label, e.id),
                  );
                  return (
                    <div
                      key={e.id}
                      style={{
                        border: `0.5px solid ${theme.colors.border.light}`,
                        borderLeft: `3px solid ${
                          isDone ? progressColor : theme.colors.border.DEFAULT
                        }`,
                        borderRadius: theme.radius.md,
                        overflow: "hidden",
                        background: theme.colors.background.card,
                        boxShadow: theme.shadows.sm,
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          background: theme.colors.neutral[50],
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: 600,
                              color: theme.colors.text.primary,
                            }}
                          >
                            {e.label}
                          </span>
                          {dateStr && (
                            <span
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.text.secondary,
                              }}
                            >
                              {dateStr}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "1px 8px",
                              borderRadius: theme.radius.full,
                              fontWeight: 500,
                              background: isDone
                                ? theme.colors.primary[100] || "#F9E4EA" // guinda claro en lugar de verde
                                : theme.colors.feedback.warningLight,
                              color: isDone
                                ? theme.colors.primary.dark
                                : "#854F0B",
                            }}
                          >
                            {isDone ? "Completada" : "Pendiente"}
                          </span>
                        </div>
                        <button
                          onClick={() => onEditar(e.label)}
                          style={editBtnStyle}
                        >
                          <FaEdit size={11} /> Editar
                        </button>
                      </div>

                      {(e.comments || normalizedEvs.length > 0) && (
                        <div style={{ padding: "10px 14px" }}>
                          {e.comments && (
                            <div
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                color: theme.colors.text.secondary,
                                background: theme.colors.background.card,
                                padding: "7px 10px",
                                borderRadius: theme.radius.sm,
                                border: `0.5px solid ${theme.colors.border.light}`,
                                marginBottom: normalizedEvs.length > 0 ? 8 : 0,
                                display: "flex",
                                gap: 6,
                              }}
                            >
                              <FaComment
                                size={11}
                                color={theme.colors.text.placeholder}
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{e.comments}</span>
                            </div>
                          )}
                          {normalizedEvs.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              {normalizedEvs.map((ev, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "10px",
                                    background:
                                      theme.colors.feedback.primaryLight,
                                    padding: "2px 8px",
                                    borderRadius: theme.radius.full,
                                    color: theme.colors.primary.DEFAULT,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                >
                                  <FaPaperclip size={9} />{" "}
                                  {ev.nombre_original ?? "archivo"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
        
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
};


const CasoCard: React.FC<CasoCardProps> = ({ caso }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDesglose, setShowDesglose] = useState(false);
  const {
    setOpen,
    setField,
    setExtra,
    handleChangeItem,
    initialValues,
    reset,
  } = UseJuridicProccessData();

  const tc = TIPO_COLORS[caso.tipo] ?? DEFAULT_TIPO_COLOR;

  const timelineEvents: TimelineEvent[] = [
    {
      id: "presentacion",
      label: "Presentación",
      date: caso.fecha_presentacion,
      comments: caso.comentarios_presentacion,
      evidences: caso.evidencias_presentacion,
      icon: <FaFileAlt size={9} />,
    },
    {
      id: "radicacion",
      label: "Radicación",
      date: caso.fecha_radicacion,
      comments: caso.comentarios_radicacion,
      evidences: caso.evidencias_radicacion,
      icon: <FaFolder size={9} />,
    },
    {
      id: "audiencia",
      label: "Audiencia",
      date: caso.fecha_audiencia,
      comments: caso.comentarios_audiencia,
      evidences: caso.evidencias_audiencia,
      icon: <FaGavel size={9} />,
    },
    {
      id: "exhorto",
      label: "Exhorto",
      date: caso.fecha_exhorto,
      comments: caso.comentarios_exhorto,
      evidences: caso.evidencias_exhorto,
      icon: <FaClock size={9} />,
    },
    {
      id: "oficios",
      label: "Oficios",
      date: caso.fecha_oficios,
      comments: caso.comentarios_oficio,
      evidences: caso.evidencias_oficio,
      icon: <FaFileAlt size={9} />,
    },
    {
      id: "promocion",
      label: "Promocion",
      done: !!caso.tipo_promocion,
      comments: caso.comentarios_promocion,
      evidences: caso.evidencias_promocion,
      icon: <FaFileAlt size={9} />,
    },
    {
      id: "sentencia",
      label: "Sentencia",
      date: caso.fecha_sentencia,
      comments: caso.comentarios_sentencia,
      evidences: caso.evidencias_sentencia,
      icon: <FaGavel size={9} />,
    },
  ];

  const completed = timelineEvents.filter((e) =>
    e.done !== undefined ? e.done : !!e.date,
  ).length;
  const total = timelineEvents.length;
  const pct = Math.round((completed / total) * 100);
  const pc = getProgressLevel(pct);

  const nextPendingIndex = timelineEvents.findIndex((e) =>
    e.done !== undefined ? !e.done : !e.date,
  );
  const nextPending =
    nextPendingIndex !== -1 ? timelineEvents[nextPendingIndex] : null;

  const handleContinuar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExtra("type", nextPending!.label as any);
    if (nextPending!.label !== "Presentación") {
      handleChangeItem(caso as unknown as ProccessJuridic);
    } else {
      const id_evaluaciones_juridicas = initialValues.id_evaluaciones_juridicas;
      reset();
      setField("id_tipo_caso_incidente", Number(caso.id));
      setField("id_evaluaciones_juridicas", Number(id_evaluaciones_juridicas));
    }
    setOpen(true, false);
  };

  const handleEditarEtapa = (label: string) => {
    handleChangeItem(caso as unknown as ProccessJuridic);
    setExtra("type", label as any);
    setShowDesglose(false);
    setOpen(true, false);
  };

  return (
    <>
      {showDesglose && (
        <CasoDesglose
          caso={caso}
          onClose={() => setShowDesglose(false)}
          onEditar={handleEditarEtapa}
        />
      )}

      <div
        style={{
          backgroundColor: theme.colors.background.card,
          border: `0.5px solid ${theme.colors.border.DEFAULT}`,
          borderRadius: theme.radius.lg,
          overflow: "hidden",
          marginBottom: "10px",
          transition: `border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            theme.colors.border.hover;
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            theme.shadows.md;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            theme.colors.border.DEFAULT;
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div
          style={{
            height: "3px",
            backgroundColor: theme.colors.neutral[200],
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              backgroundColor: pc.fill,
              borderRadius: "0 2px 2px 0",
              transition: `width ${theme.transitions.normal}`,
            }}
          />
        </div>

        <div
          style={{
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            cursor: "pointer",
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: theme.radius.md,
                backgroundColor: tc.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: `0.5px solid ${tc.dot}22`,
              }}
            >
              <FaBriefcase size={15} style={{ color: tc.dot }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {caso.nombre}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 3,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: theme.radius.full,
                    backgroundColor: pc.bg,
                    color: pc.text,
                  }}
                >
                  {pc.label}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.disabled,
                  }}
                >
                  {completed}/{total} etapas
                </span>
                {caso.expediente && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: theme.colors.text.disabled,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 120,
                    }}
                  >
                    {caso.expediente}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDesglose(true);
              }}
              style={{ ...btnBase, color: theme.colors.text.secondary }}
              aria-label="Ver desglose"
            >
              <FaListAlt size={11} /> Desglose
            </button>
            {nextPending && pct < 100 && (
              <button
                onClick={handleContinuar}
                style={{
                  ...btnBase,
                  backgroundColor: pc.fill,
                  color: theme.colors.text.inverse,
                  border: "none",
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
                aria-label={`Continuar ${nextPending.label}`}
              >
                <FaArrowRight size={10} /> {nextPending.label}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={{
                width: 24,
                height: 24,
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.colors.text.disabled,
                borderRadius: 4,
                transition: `transform ${theme.transitions.fast}`,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
              aria-label={isExpanded ? "Contraer" : "Expandir"}
              aria-expanded={isExpanded}
            >
              <FaChevronDown size={12} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div
            style={{
              borderTop: `0.5px solid ${theme.colors.border.light}`,
              padding: "16px 16px 18px",
              background: theme.colors.background.page,
            }}
          >
            <div style={{ position: "relative", paddingLeft: 26 }}>
              <div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 12,
                  bottom: 12,
                  width: 1,
                  backgroundColor: theme.colors.border.light,
                }}
              />
              {timelineEvents.map((event, index) => {
                const isDone =
                  event.done !== undefined ? event.done : !!event.date;
                const isLast = index === timelineEvents.length - 1;
                const evCount = event.evidences?.length ?? 0;
                const dateStr = event.date
                  ? new Date(event.date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "";
                return (
                  <div
                    key={event.id}
                    style={{
                      position: "relative",
                      paddingBottom: isLast ? 0 : 10,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -20,
                        top: 4,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: isDone
                          ? pc.fill
                          : theme.colors.neutral[200],
                        border: `2px solid ${theme.colors.background.card}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isDone
                          ? theme.colors.text.inverse
                          : theme.colors.text.disabled,
                        zIndex: 1,
                        boxShadow: isDone ? `0 0 0 2px ${pc.fill}30` : "none",
                      }}
                    >
                      {event.icon}
                    </div>

                    <div
                      style={{
                        backgroundColor: isDone
                          ? theme.colors.background.card
                          : theme.colors.neutral[50],
                        padding: "7px 11px",
                        borderRadius: theme.radius.md,
                        border: `0.5px solid ${theme.colors.border.light}`,
                        opacity: isDone ? 1 : 0.6,
                        transition: `opacity ${theme.transitions.fast}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: 600,
                              color: isDone
                                ? theme.colors.text.primary
                                : theme.colors.text.secondary,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.label}
                          </span>
                          {dateStr && (
                            <span
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.text.secondary,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <FaCalendarAlt size={9} />
                              {dateStr}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexShrink: 0,
                          }}
                        >
                          {evCount > 0 && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: theme.colors.text.disabled,
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <FaPaperclip size={9} />
                              {evCount}
                            </span>
                          )}
                          {event.comments && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: theme.colors.text.disabled,
                              }}
                            >
                              <FaComment size={9} />
                            </span>
                          )}
                          {isDone ? (
                            <button
                              onClick={() => handleEditarEtapa(event.label)}
                              style={{
                                ...btnBase,
                                height: 22,
                                padding: "0 8px",
                                fontSize: "10px",
                                color: theme.colors.text.secondary,
                              }}
                            >
                              <FaEdit size={9} /> Editar
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 500,
                                padding: "1px 7px",
                                borderRadius: theme.radius.full,
                                backgroundColor: theme.colors.neutral[100],
                                color: theme.colors.text.disabled,
                                border: `0.5px solid ${theme.colors.border.DEFAULT}`,
                              }}
                            >
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {event.comments && (
                        <div
                          style={{
                            marginTop: 5,
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.secondary,
                            lineHeight: 1.5,
                            padding: "4px 8px",
                            borderRadius: theme.radius.sm,
                            backgroundColor: theme.colors.neutral[50],
                            borderLeft: `2px solid ${theme.colors.border.DEFAULT}`,
                          }}
                        >
                          {event.comments}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── CasosExplorer ────────────────────────────────────────────────────────────

const CasosExplorer: React.FC = () => {
  const { selected } = UseLegalData();
  const casosAdaptados: Caso[] = (selected.incidentes ?? []).map((inc) => ({
    ...(inc.proceso || {}),
    id: String(inc.id),
    nombre: inc.nombre,
    tipo: inc.nombre,
  }));
  const { casos } = useCasosTree(casosAdaptados);

  const totalCasos = casos.length;
  const casosCompletados = casos.filter((caso) => {
    const events = [
      caso.fecha_presentacion,
      caso.fecha_radicacion,
      caso.fecha_audiencia,
      caso.fecha_exhorto,
      caso.fecha_oficios,
      caso.fecha_sentencia,
    ];
    return events.every((d) => d !== undefined && d !== null && d !== "");
  }).length;

  return (
    <div
      style={{
        padding: theme.spacing[6],
        maxWidth: "1200px",
        margin: "0 auto",
        background: theme.colors.background.page,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 4,
            height: 20,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.primary.DEFAULT,
            flexShrink: 0,
          }}
        />
        <h1
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: 0,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: "-0.3px",
          }}
        >
          Expedientes
        </h1>
        <span
          style={{
            fontSize: theme.typography.fontSize.xs,
            padding: "2px 10px",
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.neutral[100],
            color: theme.colors.text.secondary,
            fontWeight: 500,
            border: `0.5px solid ${theme.colors.border.DEFAULT}`,
          }}
        >
          {totalCasos} casos
        </span>
        {casosCompletados > 0 && (
          <span
            style={{
              fontSize: theme.typography.fontSize.xs,
              padding: "2px 10px",
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary[100] || "#F9E4EA",
              color: theme.colors.primary.dark,
              fontWeight: 500,
            }}
          >
            {casosCompletados} completados
          </span>
        )}
      </div>

      {casos.map((caso) => (
        <CasoCard key={caso.id} caso={caso} />
      ))}

      {casos.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: theme.colors.text.disabled,
            backgroundColor: theme.colors.neutral[50],
            borderRadius: theme.radius.lg,
            border: `0.5px dashed ${theme.colors.border.DEFAULT}`,
          }}
        >
          <FaFolder
            size={32}
            style={{
              opacity: 0.3,
              marginBottom: 10,
              display: "block",
              margin: "0 auto 10px",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            No hay casos disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default CasosExplorer;
