import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Link,
  Image,
} from "@react-pdf/renderer";
import { formatDatetime, DateFormat } from "../../../../utils/helpers";

// ─── Registro de fuentes ──────────────────────────────────────────────────────
Font.register({
  family: "Lato",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wWw.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPHA.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPHA.ttf",
      fontWeight: 700,
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u_w4BMUTPHjxsI5wq_Gwft.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Playfair",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf",
      fontWeight: 700,
    },
  ],
});

// ─── Paleta de colores ──────────────────────────────────────────────────────
const colors = {
  primary: "#9B2242",
  primaryDark: "#651D32",
  primaryLight: "#C8456B",
  primarySoft: "#F9E4EA",
  gold: "#C5A059",
  goldLight: "#F5ECD7",
  darkGray: "#2D2D2D",
  mediumGray: "#6B6B6B",
  lightGray: "#F8F8F8",
  white: "#FFFFFF",
  border: "#E8E8E8",
  shadow: "rgba(155,34,66,0.12)",
  accent: "#E8A87C",
  success: "#2E7D32",
  warning: "#F57F17",
  danger: "#C62828",
};

// ─── Estilos mejorados ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.white,
    fontFamily: "Lato",
    fontSize: 9,
    lineHeight: 1.6,
    color: colors.darkGray,
  },
  topDecoration: {
    height: 4,
    backgroundColor: colors.gold,
    marginBottom: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: `2px solid ${colors.gold}`,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadow: `0 2px 8px ${colors.shadow}`,
  },
  logoTxt: {
    color: colors.white,
    fontSize: 22,
    fontFamily: "Playfair",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Playfair",
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 8,
    color: colors.mediumGray,
    fontFamily: "Montserrat",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerRight: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    border: `1px solid ${colors.primary}`,
    shadow: `0 2px 4px ${colors.shadow}`,
  },
  folioNumber: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "Montserrat",
    color: colors.primaryDark,
    textAlign: "right",
  },
  folioLabel: {
    fontSize: 7,
    color: colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "right",
  },
  // Sección con efecto "folder" mejorado
  section: {
    marginBottom: 20,
    padding: 14,
    paddingTop: 24,
    borderRadius: 6,
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderLeft: `6px solid ${colors.primary}`,
    shadow: `0 2px 6px ${colors.shadow}`,
    position: "relative",
    pageBreakInside: "avoid",
  },
  // Título tipo folder con triángulo decorativo
  sectionTitleContainer: {
    position: "absolute",
    top: -12,
    left: -8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "Montserrat",
    color: colors.white,
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    shadow: `0 2px 6px ${colors.shadow}`,
  },
  // Triángulo decorativo (simulado con un View)
  sectionTitleTriangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopColor: colors.primaryDark,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    marginLeft: -2,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: "flex-start",
  },
  viewBgImage: {
      position: "absolute",
      top: 0,
      left: 25,
      height: "148%",
      width: "100%",
      opacity: 0.78
   },
   bgImage: { width: "100%", height: "100%" },
  gridLabel: {
    width: "32%",
    fontSize: 7.5,
    fontWeight: 600,
    color: colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingTop: 1,
  },
  gridValue: {
    width: "68%",
    fontSize: 8,
    color: colors.darkGray,
    fontWeight: 400,
  },
  // Tarjeta de incidente con diseño refinado
  incidentCard: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderLeft: `6px solid ${colors.primary}`,
    shadow: `0 1px 4px ${colors.shadow}`,
    pageBreakInside: "avoid",
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: `1px dashed ${colors.gold}`,
  },
  incidentTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "Montserrat",
    color: colors.primaryDark,
  },
  incidentBadge: {
    fontSize: 6.5,
    color: colors.white,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  procesoBox: {
    marginTop: 4,
    padding: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  procesoRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottom: `1px solid ${colors.border}`,
  },
  procesoRowAlt: {
    backgroundColor: colors.white,
  },
  procesoLabel: {
    width: "22%",
    fontSize: 7,
    fontWeight: 600,
    color: colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  procesoValue: {
    width: "78%",
    fontSize: 7.5,
    color: colors.darkGray,
  },
  evidenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  evidenceItem: {
    width: 54,
    height: 54,
    backgroundColor: colors.white,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
    shadow: `0 1px 2px ${colors.shadow}`,
  },
  evidenceImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 3,
  },
  evidenceIcon: {
    fontSize: 18,
    color: colors.primaryLight,
  },
  evidenceLabel: {
    fontSize: 5.5,
    color: colors.mediumGray,
    fontFamily: "Montserrat",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    borderTop: `2px solid ${colors.gold}`,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: colors.mediumGray,
    fontFamily: "Montserrat",
    letterSpacing: 0.3,
  },
  footerBold: {
    fontWeight: 700,
    color: colors.primary,
  },
  watermark: {
    position: "absolute",
    bottom: 100,
    right: 40,
    fontSize: 60,
    color: colors.primarySoft,
    opacity: 0.12,
    fontFamily: "Playfair",
    transform: "rotate(-12deg)",
  },
  // Separadores decorativos
  divider: {
    height: 1,
    backgroundColor: colors.gold,
    marginVertical: 4,
    width: "40%",
    alignSelf: "center",
  },
});

// ─── Tipos ──────────────────────────────────────────────────────────────────
export interface LegalPDFData {
  folio: number;
  fecha_apertura: string;
  fecha_asesoria: string;
  hechos: string;
  activo: boolean;
  fecha_acompanamiento?: string;
  fecha_denuncia?: string;
  nombre_imputado?: string;
  carpeta_investigacion?: number;
  causa_penal?: number;
  comentarios_procesales?: string;
  fecha_solicitud?: string;
  fecha_audiencia?: string;
  fecha_medida?: string;
  fecha_termino_medida?: string;
  descripcion_medida?: string;
  fecha_cierre?: string;
  observaciones?: string;
  responsable_nombre?: string;
  tipo_asesoria_nombre?: string;
  estatus_caso_nombre?: string;
  autoridad_emisora_nombre?: string;
  tipo_medida_nombre?: string;
  motivo_cierre_nombre?: string;
  entrevista_nombre?: string;
  telefono?: string;
  colonia?: string;
  estado?: string;
  municipio?: string;
  calle?: string;
  curp?: string;
  zona?: string;
  edad?: number;
  incidentes: {
    id?: number;
    nombre: string;
    proceso?: {
      actor?: string;
      expediente?: string;
      juzgado?: string;
      fecha_presentacion?: string;
      comentarios_presentacion?: string;
      fecha_radicacion?: string;
      comentarios_radicacion?: string;
      fecha_audiencia?: string;
      comentarios_audiencia?: string;
      fecha_exhorto?: string;
      comentarios_exhorto?: string;
      fecha_oficios?: string;
      comentarios_oficio?: string;
      tipo_promocion?: string;
      comentarios_promocion?: string;
      fecha_sentencia?: string;
      comentarios_sentencia?: string;
      evidencias_presentacion?: string[];
      evidencias_radicacion?: string[];
      evidencias_audiencia?: string[];
      evidencias_exhorto?: string[];
      evidencias_oficio?: string[];
      evidencias_promocion?: string[];
      evidencias_sentencia?: string[];
    };
  }[];
}

interface LegalPDFProps {
  data: LegalPDFData | LegalPDFData[];
}

// ─── Componente principal ──────────────────────────────────────────────────
const LegalPDF: React.FC<LegalPDFProps> = ({ data }) => {
  const items = Array.isArray(data) ? data : [data];

  return (
    <Document>
      {items.map((item, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.topDecoration} />
          <Text style={styles.watermark}>⚖</Text>

          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBox}>
                <Text style={styles.logoTxt}>⚖</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Expediente Jurídico</Text>
                <Text style={styles.headerSub}>Despacho de Abogados</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.folioNumber}>Folio {item.folio}</Text>
              <Text style={styles.folioLabel}>
                Apertura:{" "}
                {formatDatetime(
                  item.fecha_apertura,
                  true,
                  DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                )}
              </Text>
            </View>
          </View>

          {/* ─── Datos de la entrevista ──────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Datos de la entrevista</Text>
              <View style={styles.sectionTitleTriangle} />
            </View>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Nombre</Text>
                <Text style={styles.gridValue}>
                  {item.entrevista_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Teléfono</Text>
                <Text style={styles.gridValue}>{item.telefono || "N/A"}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Dirección</Text>
                <Text style={styles.gridValue}>
                  {[item.calle, item.colonia, item.municipio, item.estado]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>CURP</Text>
                <Text style={styles.gridValue}>{item.curp || "N/A"}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Edad / Zona</Text>
                <Text style={styles.gridValue}>
                  {item.edad || "N/A"} / {item.zona || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Detalles del caso ───────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Detalles del caso</Text>
              <View style={styles.sectionTitleTriangle} />
            </View>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Responsable</Text>
                <Text style={styles.gridValue}>
                  {item.responsable_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Tipo asesoría</Text>
                <Text style={styles.gridValue}>
                  {item.tipo_asesoria_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Agresor</Text>
                <Text style={styles.gridValue}>
                  {item?.["nombre_agresor"] || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Vinculo con agresor</Text>
                <Text style={styles.gridValue}>
                  {item?.["relacion_victima"] || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Estatus</Text>
                <Text style={styles.gridValue}>
                  {item.estatus_caso_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Activo</Text>
                <Text style={styles.gridValue}>
                  {item.activo ? "Sí" : "No"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Hechos</Text>
                <Text style={[styles.gridValue, { width: "68%" }]}>
                  {item.hechos || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Información procesal ────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Información procesal</Text>
              <View style={styles.sectionTitleTriangle} />
            </View>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Acompañamiento</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_acompanamiento,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Denuncia</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_denuncia,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Imputado</Text>
                <Text style={styles.gridValue}>
                  {item.nombre_imputado || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Carpeta Investigación</Text>
                <Text style={styles.gridValue}>
                  {item.carpeta_investigacion || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Causa Penal</Text>
                <Text style={styles.gridValue}>
                  {item.causa_penal || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Autoridad Emisora</Text>
                <Text style={styles.gridValue}>
                  {item.autoridad_emisora_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Solicitud</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_solicitud,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Audiencia</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_audiencia,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Medida</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_medida,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Término Medida</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_termino_medida,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Tipo Medida</Text>
                <Text style={styles.gridValue}>
                  {item.tipo_medida_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Descripción Medida</Text>
                <Text style={styles.gridValue}>
                  {item.descripcion_medida || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Cierre</Text>
                <Text style={styles.gridValue}>
                  {formatDatetime(
                    item.fecha_cierre,
                    true,
                    DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Motivo Cierre</Text>
                <Text style={styles.gridValue}>
                  {item.motivo_cierre_nombre || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Observaciones</Text>
                <Text style={styles.gridValue}>
                  {item.observaciones || "N/A"}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Comentarios Procesales</Text>
                <Text style={styles.gridValue}>
                  {item.comentarios_procesales || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Incidentes y procesos ───────────────────────────────────── */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Incidentes y procesos</Text>
              <View style={styles.sectionTitleTriangle} />
            </View>
            {item.incidentes && item.incidentes.length > 0 ? (
              item.incidentes.map((inc, idx) => (
                <View key={idx} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentTitle}>{inc.nombre}</Text>
                    <Text style={styles.incidentBadge}>Incidente</Text>
                  </View>
                  {inc.proceso ? (
                    <View style={styles.procesoBox}>
                      <View
                        style={[
                          styles.procesoRow,
                          idx % 2 === 0 && styles.procesoRowAlt,
                        ]}
                      >
                        <Text style={styles.procesoLabel}>Actor</Text>
                        <Text style={styles.procesoValue}>
                          {inc.proceso.actor || "N/A"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.procesoRow,
                          idx % 2 !== 0 && styles.procesoRowAlt,
                        ]}
                      >
                        <Text style={styles.procesoLabel}>Expediente</Text>
                        <Text style={styles.procesoValue}>
                          {inc.proceso.expediente || "N/A"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.procesoRow,
                          idx % 2 === 0 && styles.procesoRowAlt,
                        ]}
                      >
                        <Text style={styles.procesoLabel}>Juzgado</Text>
                        <Text style={styles.procesoValue}>
                          {inc.proceso.juzgado || "N/A"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.procesoRow,
                          idx % 2 !== 0 && styles.procesoRowAlt,
                        ]}
                      >
                        <Text style={styles.procesoLabel}>Presentación</Text>
                        <Text style={styles.procesoValue}>
                          {formatDatetime(
                            inc.proceso.fecha_presentacion,
                            true,
                            DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                          )}
                        </Text>
                      </View>
                      {inc.proceso.comentarios_presentacion && (
                        <View
                          style={[
                            styles.procesoRow,
                            idx % 2 === 0 && styles.procesoRowAlt,
                          ]}
                        >
                          <Text style={styles.procesoLabel}>Comentario</Text>
                          <Text style={styles.procesoValue}>
                            {inc.proceso.comentarios_presentacion}
                          </Text>
                        </View>
                      )}
                      {inc.proceso.fecha_radicacion && (
                        <>
                          <View
                            style={[
                              styles.procesoRow,
                              idx % 2 !== 0 && styles.procesoRowAlt,
                            ]}
                          >
                            <Text style={styles.procesoLabel}>Radicación</Text>
                            <Text style={styles.procesoValue}>
                              {formatDatetime(
                                inc.proceso.fecha_radicacion,
                                true,
                                DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                              )}
                            </Text>
                          </View>
                          {inc.proceso.comentarios_radicacion && (
                            <View
                              style={[
                                styles.procesoRow,
                                idx % 2 === 0 && styles.procesoRowAlt,
                              ]}
                            >
                              <Text style={styles.procesoLabel}>
                                Comentario
                              </Text>
                              <Text style={styles.procesoValue}>
                                {inc.proceso.comentarios_radicacion}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                      {inc.proceso.fecha_audiencia && (
                        <>
                          <View
                            style={[
                              styles.procesoRow,
                              idx % 2 !== 0 && styles.procesoRowAlt,
                            ]}
                          >
                            <Text style={styles.procesoLabel}>Audiencia</Text>
                            <Text style={styles.procesoValue}>
                              {formatDatetime(
                                inc.proceso.fecha_audiencia,
                                true,
                                DateFormat.DDDD_DD_DE_MMMM_DE_YYYY,
                              )}
                            </Text>
                          </View>
                          {inc.proceso.comentarios_audiencia && (
                            <View
                              style={[
                                styles.procesoRow,
                                idx % 2 === 0 && styles.procesoRowAlt,
                              ]}
                            >
                              <Text style={styles.procesoLabel}>
                                Comentario
                              </Text>
                              <Text style={styles.procesoValue}>
                                {inc.proceso.comentarios_audiencia}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                      {/* Evidencias agrupadas por tipo */}
                      {Object.keys(inc.proceso)
                        .filter(
                          (key) =>
                            key.startsWith("evidencias_") &&
                            inc.proceso?.[key]?.length > 0,
                        )
                        .map((tipo) => (
                          <View key={tipo} style={{ marginTop: 6 }}>
                            <Text
                              style={[
                                styles.procesoLabel,
                                { width: "100%", marginBottom: 2 },
                              ]}
                            >
                              {tipo.replace("evidencias_", "").toUpperCase()}
                            </Text>
                            {/* <View style={styles.viewBgImage}>
                              {inc.proceso[tipo].map(
                                (url: string, i: number) => (
                                  <View key={i} style={styles.evidenceItem}>
                                    <Link src={url}>
                                      {url.match(
                                        /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i,
                                      ) ? (
                                        <Image
                                          src={url}
                                          style={styles.bgImage}
                                        />
                                      ) : (
                                        <Text style={styles.evidenceIcon}>
                                          📄
                                        </Text>
                                      )}
                                      <Text style={styles.evidenceLabel}>
                                        Ver
                                      </Text>
                                    </Link>
                                  </View>
                                ),
                              )}
                            </View> */}
                          </View>
                        ))}
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontSize: 7.5,
                        color: colors.mediumGray,
                        fontStyle: "italic",
                      }}
                    >
                      Sin proceso asociado
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text
                style={{
                  fontSize: 8,
                  color: colors.mediumGray,
                  fontStyle: "italic",
                }}
              >
                No hay incidentes registrados.
              </Text>
            )}
          </View>

          {/* ─── Pie de página ───────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>© Despacho Jurídico</Text> • Todos
              los derechos reservados
            </Text>
            <Text style={styles.footerText}>
              Generado:{" "}
              {new Date().toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.footerText}>
              Pág. <Text style={styles.footerBold}>{index + 1}</Text>
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default LegalPDF;
