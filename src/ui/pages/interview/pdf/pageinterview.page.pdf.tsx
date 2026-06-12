import React, { useMemo } from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

// ============================================================================
// Paleta de colores Human Tech 2026
// ============================================================================
const COLORS = {
  primary: "#0B2B40",
  secondary: "#E05A47",
  background: "#FFFFFF",
  surface: "#F4F7F9",
  textPrimary: "#1A2E3D",
  textSecondary: "#5B6F82",
  accentLight: "#FCE8E4",
  border: "#DCE3E9",
  success: "#2C8C6E",
  warning: "#E6A157",
};

// ============================================================================
// Estilos
// ============================================================================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: COLORS.background,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 24,
    borderBottom: `2px solid ${COLORS.secondary}`,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  titleBlock: { flexDirection: "column" },
  mainTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.primary },
  subTitle: { fontSize: 8, color: COLORS.textSecondary, marginTop: 4 },
  folioBox: { alignItems: "flex-end" },
  folioLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  folioNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginTop: 2,
  },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  sectionBody: { paddingLeft: 16 },
  subsection: {
    marginTop: 12,
    marginBottom: 6,
    borderBottom: `0.5px solid ${COLORS.border}`,
    paddingBottom: 3,
  },
  subsectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  gridTwoCols: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 4,
    paddingRight: 12,
  },
  gridLabel: { width: "40%", fontSize: 8, color: COLORS.textSecondary },
  gridValue: {
    width: "60%",
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  row: { flexDirection: "row", paddingVertical: 4 },
  rowLabel: { width: "30%", fontSize: 8, color: COLORS.textSecondary },
  rowValue: {
    width: "70%",
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  badgesContainer: { flexDirection: "row", flexWrap: "wrap", width: "70%" },
  badge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  badgeText: { fontSize: 7, color: COLORS.secondary, fontWeight: "bold" },
  // Narrativa rich text
  narrativeBox: {
    backgroundColor: COLORS.surface,
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  narrativeText: { fontSize: 8, lineHeight: 1.5, color: COLORS.textPrimary },
  // Listas dentro de narrativa
  rtListItem: { flexDirection: "row", marginBottom: 3 },
  rtBullet: { width: 14, fontSize: 8, color: COLORS.secondary },
  rtListText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.5,
    color: COLORS.textPrimary,
  },
  // Blockquote
  rtBlockquote: {
    borderLeft: `3px solid ${COLORS.secondary}`,
    paddingLeft: 8,
    marginVertical: 4,
    backgroundColor: COLORS.accentLight,
  },
  // Code
  rtCode: {
    fontFamily: "Courier",
    fontSize: 7,
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: 3,
  },
  table: { marginTop: 6, width: "100%" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: `0.5px solid ${COLORS.border}`,
    paddingVertical: 3,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    flex: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottom: `0.3px solid ${COLORS.border}`,
  },
  tableCell: { fontSize: 7, color: COLORS.textPrimary, flex: 1 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTop: `0.5px solid ${COLORS.border}`,
    fontSize: 7,
    color: COLORS.textSecondary,
  },
});

// ============================================================================
// HTML → react-pdf renderer
// ============================================================================

/**
 * Parsea HTML del rich text editor y lo convierte en componentes react-pdf.
 *
 * react-pdf NO soporta dangerouslySetInnerHTML ni HTML nativo.
 * Usamos DOMParser del lado del cliente (o un parser manual SSR-safe)
 * para convertir el árbol HTML en nodos <Text> con estilos en línea.
 *
 * Estilos soportados: bold, italic, underline, strikethrough,
 * listas ul/ol con bullets personalizados, blockquote, pre/code, links.
 */
function parseHtmlNode(
  node: Node,
  inheritedStyle: Record<string, any> = {},
  key: string = "0",
): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text) return null;
    return (
      <Text key={key} style={{ ...styles.narrativeText, ...inheritedStyle }}>
        {text}
      </Text>
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  const tag = el.tagName?.toLowerCase();

  const children = Array.from(el.childNodes).map((child, i) =>
    parseHtmlNode(child, inheritedStyle, `${key}-${i}`),
  );

  switch (tag) {
    case "strong":
    case "b":
      return (
        <Text
          key={key}
          style={{
            ...styles.narrativeText,
            ...inheritedStyle,
            fontWeight: "bold",
          }}
        >
          {Array.from(el.childNodes).map((c, i) =>
            parseHtmlNode(
              c,
              { ...inheritedStyle, fontWeight: "bold" },
              `${key}-${i}`,
            ),
          )}
        </Text>
      );

    case "em":
    case "i":
      return (
        <Text
          key={key}
          style={{
            ...styles.narrativeText,
            ...inheritedStyle,
            fontStyle: "italic",
          }}
        >
          {Array.from(el.childNodes).map((c, i) =>
            parseHtmlNode(
              c,
              { ...inheritedStyle, fontStyle: "italic" },
              `${key}-${i}`,
            ),
          )}
        </Text>
      );

    case "u":
      return (
        <Text
          key={key}
          style={{
            ...styles.narrativeText,
            ...inheritedStyle,
            textDecoration: "underline",
          }}
        >
          {Array.from(el.childNodes).map((c, i) =>
            parseHtmlNode(
              c,
              { ...inheritedStyle, textDecoration: "underline" },
              `${key}-${i}`,
            ),
          )}
        </Text>
      );

    case "s":
    case "del":
    case "strike":
      return (
        <Text
          key={key}
          style={{
            ...styles.narrativeText,
            ...inheritedStyle,
            textDecoration: "line-through",
          }}
        >
          {Array.from(el.childNodes).map((c, i) =>
            parseHtmlNode(
              c,
              { ...inheritedStyle, textDecoration: "line-through" },
              `${key}-${i}`,
            ),
          )}
        </Text>
      );

    case "a": {
      const href = el.getAttribute("href") ?? "";
      return (
        <Link
          key={key}
          src={href}
          style={{
            color: COLORS.secondary,
            textDecoration: "underline",
            fontSize: 8,
          }}
        >
          {el.textContent ?? href}
        </Link>
      );
    }

    case "br":
      return (
        <Text key={key} style={styles.narrativeText}>
          {"\n"}
        </Text>
      );

    case "p":
    case "div":
      return (
        <View key={key} style={{ marginBottom: 3 }}>
          {children}
        </View>
      );

    case "ul": {
      const items = Array.from(el.querySelectorAll(":scope > li"));
      return (
        <View key={key} style={{ marginVertical: 4, paddingLeft: 4 }}>
          {items.map((li, i) => (
            <View key={i} style={styles.rtListItem}>
              <Text style={[styles.rtBullet, { color: COLORS.secondary }]}>
                ✦
              </Text>
              <Text style={styles.rtListText}>
                {Array.from(li.childNodes).map((c, j) =>
                  parseHtmlNode(c, inheritedStyle, `${key}-li${i}-${j}`),
                )}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    case "ol": {
      const items = Array.from(el.querySelectorAll(":scope > li"));
      return (
        <View key={key} style={{ marginVertical: 4, paddingLeft: 4 }}>
          {items.map((li, i) => (
            <View key={i} style={styles.rtListItem}>
              <Text
                style={[
                  styles.rtBullet,
                  { fontWeight: "bold", color: COLORS.primary },
                ]}
              >
                {i + 1}.
              </Text>
              <Text style={styles.rtListText}>
                {Array.from(li.childNodes).map((c, j) =>
                  parseHtmlNode(c, inheritedStyle, `${key}-li${i}-${j}`),
                )}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    case "li":
      // li sin ul/ol padre — fallback
      return (
        <View key={key} style={styles.rtListItem}>
          <Text style={styles.rtBullet}>•</Text>
          <Text style={styles.rtListText}>{children}</Text>
        </View>
      );

    case "blockquote":
      return (
        <View key={key} style={styles.rtBlockquote}>
          <Text
            style={{
              ...styles.narrativeText,
              fontStyle: "italic",
              color: COLORS.textSecondary,
            }}
          >
            {el.textContent ?? ""}
          </Text>
        </View>
      );

    case "pre":
    case "code":
      return (
        <View
          key={key}
          style={{
            backgroundColor: COLORS.surface,
            padding: 4,
            borderRadius: 3,
            marginVertical: 3,
          }}
        >
          <Text style={styles.rtCode}>{el.textContent ?? ""}</Text>
        </View>
      );

    default:
      // Cualquier otro tag: renderizar children directo
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

/**
 * Componente NarrativeField:
 * Recibe HTML string, lo parsea y lo renderiza como react-pdf nodes.
 * Muestra texto plano limpio como fallback si el HTML no tiene etiquetas.
 */
function NarrativeField({ html }: { html: string | undefined }) {
  if (!html) return null;

  // Si no hay etiquetas HTML, renderizar como texto plano directamente
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html);
  if (!hasHtmlTags) {
    return (
      <View style={styles.narrativeBox}>
        <Text style={styles.narrativeText}>{html}</Text>
      </View>
    );
  }

  // Parsear HTML usando DOMParser (disponible en browser donde se genera el PDF)
  let nodes: React.ReactNode[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    nodes = Array.from(doc.body.childNodes).map((node, i) =>
      parseHtmlNode(node, {}, String(i)),
    );
  } catch {
    // Fallback: mostrar texto plano sin etiquetas
    const div = document.createElement("div");
    div.innerHTML = html;
    return (
      <View style={styles.narrativeBox}>
        <Text style={styles.narrativeText}>{div.textContent ?? html}</Text>
      </View>
    );
  }

  return <View style={styles.narrativeBox}>{nodes}</View>;
}

// ============================================================================
// Utilidades
// ============================================================================
const formatDate = (date: any): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatBoolean = (val: boolean | number | undefined): string => {
  if (val === undefined || val === null) return "";
  if (val === 1 || val === true) return "✓ Sí";
  if (val === 0 || val === false) return "✗ No";
  return "";
};

// ============================================================================
// Componentes base
// ============================================================================
const FieldRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
};

const BadgeField = ({ label, value }: { label: string; value: any }) => {
  if (!value) return null;
  const badges = String(value)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (badges.length === 0) return null;
  if (badges.length === 1) return <FieldRow label={label} value={value} />;
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.badgesContainer}>
        {badges.map((b, i) => (
          <View key={i} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  // wrap={false} removido — causaba páginas en blanco forzando secciones completas a nueva página
  <View style={styles.section}>
    <View style={styles.sectionHeader} wrap={false}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Subsection = ({ title }: { title: string }) => (
  <View style={styles.subsection} wrap={false}>
    <Text style={styles.subsectionTitle}>{title}</Text>
  </View>
);

const GridField = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.gridItem} wrap={false}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{String(value)}</Text>
    </View>
  );
};

// ============================================================================
// Secciones
// ============================================================================
const DatosVictima = ({ data }: { data: any }) => (
  <Section title="Datos de la víctima">
    <View style={styles.gridTwoCols}>
      <GridField label="Nombre" value={data.nombre} />
      <GridField label="CURP" value={data.curp} />
      <GridField
        label="Fecha nacimiento"
        value={formatDate(data.fecha_nacimiento)}
      />
      <GridField label="Edad" value={data.edad} />
      <GridField label="Teléfono" value={data.telefono} />
      <GridField label="Correo electrónico" value={data.correo} />
      <GridField label="Estado civil" value={data.id_estado_civil_nombre} />
      <GridField
        label="Orientación sexual"
        value={data.id_orientacion_sexual_nombre}
      />
      <GridField
        label="Identidad de género"
        value={data.id_identidad_genero_nombre}
      />
      <GridField
        label="Último grado estudios"
        value={data.id_ultimo_grado_estudios_nombre}
      />
      <GridField
        label="Ingreso mensual"
        value={data.id_ingreso_promedio_mensual_nombre}
      />
      <GridField label="Actividad principal" value={data.id_actividad_nombre} />
      <GridField
        label="Servicio médico"
        value={data.id_servicio_medico_nombre}
      />
    </View>
    <FieldRow
      label="Realiza más actividades"
      value={formatBoolean(data.realiza_mas_actividades)}
    />

    <Subsection title="Domicilio" />
    <View style={styles.gridTwoCols}>
      <GridField label="Código postal" value={data.codigo_postal} />
      <GridField label="Colonia" value={data.colonia_nombre || data.colonia} />
      <GridField label="Estado" value={data.estado} />
      <GridField label="Municipio" value={data.municipio} />
      <GridField label="Calle" value={data.calle} />
      <GridField label="Número exterior" value={data.num_ext} />
      <GridField label="Número interior" value={data.num_int} />
    </View>

    {/* ── entre_calles: campo rich text ── */}
    {data.entre_calles && (
      <>
        <Subsection title="Entre calles" />
        <NarrativeField html={data.entre_calles} />
      </>
    )}

    {/* ── referencias: campo rich text ── */}
    {data.referencias && (
      <>
        <Subsection title="Referencias" />
        <NarrativeField html={data.referencias} />
      </>
    )}

    <Subsection title="Condiciones específicas" />
    <View style={styles.gridTwoCols}>
      <GridField
        label="Vive en el extranjero"
        value={formatBoolean(data.vive_extranjero)}
      />
      <GridField label="Migrante" value={formatBoolean(data.migrante)} />
      <GridField
        label="Pueblo indígena"
        value={formatBoolean(data.pertenece_pueblo_indigena)}
      />
      <GridField
        label="Tiene discapacidad"
        value={formatBoolean(data.tiene_discapacidad)}
      />
      <GridField
        label="Enf. crónico-degenerativa"
        value={formatBoolean(data.enfermedad_cronica_degenerativa)}
      />
      <GridField
        label="Trastorno neurológico"
        value={formatBoolean(data.trastorno_neurologico_mental)}
      />
      <GridField
        label="Tratamiento médico activo"
        value={formatBoolean(data.tratado_medicamente_actualmente)}
      />
      <GridField label="Embarazo" value={formatBoolean(data.embarazo)} />
      <GridField
        label="Situación de calle"
        value={formatBoolean(data.vive_situacion_calle)}
      />
      <GridField label="Adicción" value={formatBoolean(data.tiene_adiccion)} />
    </View>
    <FieldRow
      label="Autoidentificación étnica"
      value={data.autoidentificacion_etnica}
    />
    {data.tiene_discapacidad && (
      <FieldRow
        label="Tipo de discapacidad"
        value={data.id_discapacidad_nombre}
      />
    )}
    {data.discapacidad_causada_violencia && (
      <FieldRow
        label="Discapacidad por violencia"
        value={formatBoolean(data.discapacidad_causada_violencia)}
      />
    )}
    {data.embarazo && (
      <FieldRow label="Semanas de embarazo" value={data.semanas_embarazo} />
    )}
    {data.tiene_adiccion && (
      <FieldRow label="Tipo de conducta" value={data.conducta} />
    )}
    <FieldRow
      label="Tiene dependientes"
      value={formatBoolean(data.tiene_dependientes)}
    />
  </Section>
);

const Hechos = ({ data }: { data: any }) => (
  <Section title="Narración de los hechos">
    {/* ── hechos: campo rich text principal ── */}
    <NarrativeField html={data.hechos} />

    <View style={styles.gridTwoCols}>
      <GridField label="Fecha del hecho" value={formatDate(data.fecha_hecho)} />
      <GridField label="Hora" value={data.hora_hecho} />
      <GridField
        label="Ocurrió en extranjero"
        value={formatBoolean(data.ocurrio_extranjero)}
      />
      <GridField label="Día festivo" value={formatBoolean(data.dia_festivo)} />
      <GridField
        label="Conoce autoridad"
        value={formatBoolean(data.conoce_autoridad_asunto)}
      />
      <GridField
        label="Canalizado por CABI"
        value={formatBoolean(data.canalizado_cabi)}
      />
      <GridField
        label="En domicilio víctima"
        value={formatBoolean(data.ocurrio_domicilio_victima)}
      />
      <GridField label="Sector" value={data.sector} />
    </View>
    {data.ocurrio_domicilio_victima === 0 && data.especifica_domicilio && (
      <FieldRow
        label="Especificación del domicilio"
        value={data.especifica_domicilio}
      />
    )}

    <Subsection title="Lugares y espacios" />
    {[
      ["Espacio digital", data.id_espacio_digital_nombres],
      ["Espacio particular", data.id_espacio_particular_nombres],
      ["Espacio público", data.id_espacio_publico_nombres],
      ["Transporte foráneo", data.id_transporte_foraneo_nombres],
      ["Transporte privado", data.id_transporte_privado_nombres],
      ["Transporte urbano", data.id_transporte_urbano_nombres],
    ]
      .filter(([, v]) => v)
      .map(([label, value], i) => (
        <BadgeField key={i} label={label as string} value={value} />
      ))}
  </Section>
);

const Violencia = ({ data }: { data: any }) => (
  <Section title="Clasificación de violencia">
    <BadgeField
      label="Tipos de violencia"
      value={data.id_tipos_violencia_nombres}
    />
    {data.especifique_tipo_violencia && (
      <FieldRow
        label="Especifique tipo"
        value={data.especifique_tipo_violencia}
      />
    )}
    <BadgeField
      label="Ámbitos de violencia"
      value={data.id_ambitos_violencia_nombres}
    />
    <View style={styles.gridTwoCols}>
      <GridField
        label="Víctima delincuencia organizada"
        value={formatBoolean(data.victima_delicuencia_organizada)}
      />
      <GridField
        label="Relacionado con denuncia"
        value={formatBoolean(data.relacion_denuncia)}
      />
      <GridField
        label="Relacionado orientación/identidad género"
        value={formatBoolean(data.relacionado_orientacion_identidad_genero)}
      />
    </View>
  </Section>
);

const Efectos = ({ data }: { data: any }) => (
  <Section title="Efectos de la violencia">
    <BadgeField
      label="Efectos físicos"
      value={data.id_efectos_fisicos_nombres}
    />
    {data.especifique_efecto_fisico && (
      <FieldRow
        label="Especifique físico"
        value={data.especifique_efecto_fisico}
      />
    )}
    <BadgeField
      label="Consecuencias sexuales"
      value={data.id_consecuencias_sexuales_nombres}
    />
    {data.especifique_consecuencia_sexual && (
      <FieldRow
        label="Especifique sexual"
        value={data.especifique_consecuencia_sexual}
      />
    )}
    <BadgeField
      label="Efectos psicológicos"
      value={data.id_efectos_psicologicos_nombres}
    />
    {data.especifique_efecto_psicologico && (
      <FieldRow
        label="Especifique psicológico"
        value={data.especifique_efecto_psicologico}
      />
    )}
    <BadgeField
      label="Efectos económicos/patrimoniales"
      value={data.id_efectos_economicos_patrimoniales_nombres}
    />
    {data.especifique_economicos_patrimonial && (
      <FieldRow
        label="Especifique económico"
        value={data.especifique_economicos_patrimonial}
      />
    )}
    <BadgeField
      label="Agente de lesión"
      value={data.id_agente_lesion_nombres}
    />
    {data.especifique_agente_lesion && (
      <FieldRow
        label="Especifique agente"
        value={data.especifique_agente_lesion}
      />
    )}
    <BadgeField
      label="Área anatómica lesionada"
      value={data.id_aerea_anatomica_lesionada_nombres}
    />
    {data.especifique_aerea_anatomica_lesionada && (
      <FieldRow
        label="Especifique área"
        value={data.especifique_aerea_anatomica_lesionada}
      />
    )}
  </Section>
);

const DependientesRed = ({ data }: { data: any }) => {
  const hasDep = data.dependientes && data.dependientes.length > 0;
  const hasRed = data.redapoyo && data.redapoyo.length > 0;
  if (!hasDep && !hasRed) return null;

  return (
    <Section title="Red familiar y de apoyo">
      {hasDep && (
        <>
          <Subsection title="Hijas, hijos y dependientes" />
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {/* ++ Columna Edad añadida ++ */}
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                Nombre completo
              </Text>
              <Text style={styles.tableHeaderCell}>Edad</Text>
              <Text style={styles.tableHeaderCell}>Vínculo</Text>
              <Text style={styles.tableHeaderCell}>¿En riesgo?</Text>
            </View>
            {data.dependientes.map((dep: any, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>
                  {`${dep.nombre} ${dep.apellido_paterno} ${dep.apellido_materno}`}
                </Text>
                {/* edad puede venir como dep.edad o dep.age */}
                <Text style={styles.tableCell}>
                  {dep.edad ?? dep.age ?? "—"}
                </Text>
                <Text style={styles.tableCell}>{dep.vinculo_nombre}</Text>
                <Text style={styles.tableCell}>{dep.esta_riesgo_texto}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {hasRed && (
        <>
          <Subsection title="Red de apoyo" />
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {/* ++ Columna Teléfono añadida ++ */}
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                Nombre completo
              </Text>
              <Text style={styles.tableHeaderCell}>Teléfono</Text>
              <Text style={styles.tableHeaderCell}>Vínculo</Text>
              <Text style={styles.tableHeaderCell}>¿Cuenta con apoyo?</Text>
            </View>
            {data.redapoyo.map((red: any, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>
                  {`${red.nombre} ${red.apellido_paterno} ${red.apellido_materno}`}
                </Text>
                {/* telefono puede venir como red.telefono o red.phone */}
                <Text style={styles.tableCell}>
                  {red.telefono ?? red.phone ?? "—"}
                </Text>
                <Text style={styles.tableCell}>{red.vinculo_nombre}</Text>
                <Text style={styles.tableCell}>{red.cuenta_apoyo_texto}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Section>
  );
};

const Agresor = ({ data }: { data: any }) => (
  <Section title="Persona agresora">
    <FieldRow
      label="¿Conoce al agresor?"
      value={formatBoolean(data.conoce_agresor)}
    />
    {data.conoce_agresor === 1 && (
      <>
        <View style={styles.gridTwoCols}>
          <GridField label="Nombre" value={data.nombre_agresor} />
          <GridField label="Edad" value={data.edad_agresor} />
          <GridField label="Sexo" value={data.sexo_agresor} />
          <GridField
            label="Vínculo con la víctima"
            value={data.id_vinculo_agresor_nombre}
          />
          <GridField
            label="Identidad de género"
            value={data.id_identidad_genero_agresor_nombre}
          />
          <GridField
            label="Orientación sexual"
            value={data.id_orientacion_sexual_agresor_nombre}
          />
          <GridField
            label="Último grado estudios"
            value={data.id_ultimo_grado_estudios_agresor_nombre}
          />
          <GridField
            label="Ingreso mensual"
            value={data.id_ingreso_promedio_mensual_agresor_nombre}
          />
          <GridField
            label="Ocupación"
            value={data.id_ocupacion_agresor_nombre}
          />
          <GridField
            label="Acceso a armas"
            value={formatBoolean(data.acceso_armas_agresor)}
          />
          <GridField
            label="Consume drogas"
            value={formatBoolean(data.acceso_drogas_agresor)}
          />
          <GridField
            label="Vive en mismo domicilio"
            value={formatBoolean(data.vive_domicilio_victima)}
          />
        </View>
        {data.acceso_armas_agresor === 1 && data.id_armas_agresor_nombre && (
          <FieldRow label="Tipo de arma" value={data.id_armas_agresor_nombre} />
        )}
        {data.acceso_drogas_agresor === 1 && data.id_drogas_agresor_nombres && (
          <BadgeField
            label="Sustancias"
            value={data.id_drogas_agresor_nombres}
          />
        )}
        <Subsection title="Domicilio del agresor" />
        <View style={styles.gridTwoCols}>
          <GridField label="Código postal" value={data.codigo_postal_agresor} />
          <GridField label="Colonia" value={data.colonia_agresor_nombre} />
          <GridField label="Estado" value={data.estado_agresor} />
          <GridField label="Municipio" value={data.municipio_agresor} />
          <GridField label="Calle" value={data.calle_agresor} />
          <GridField label="Número exterior" value={data.num_ext_agresor} />
          <GridField label="Número interior" value={data.num_int_agresor} />
        </View>
      </>
    )}
  </Section>
);

const RutaAtencion = ({ data }: { data: any }) => (
  <Section title="Ruta de atención">
    <BadgeField
      label="Servicios de Trabajo Social"
      value={data.id_servicios_trabajo_social_nombres}
    />
    <BadgeField
      label="Servicios Jurídicos"
      value={data.id_servicios_juridicos_nombres}
    />
    <BadgeField
      label="Servicios Psicológicos"
      value={data.id_servicios_psicologicos_nombres}
    />

    {/* ── comentarios_ruta_antencion: campo rich text ── */}
    {data.comentarios_ruta_antencion && (
      <>
        <Subsection title="Comentarios" />
        <NarrativeField html={data.comentarios_ruta_antencion} />
      </>
    )}
  </Section>
);

const Canalizacion = ({ data }: { data: any }) => (
  <Section title="Canalización">
    <View style={styles.gridTwoCols}>
      <GridField
        label="Dependencia / Institución"
        value={data.id_dependencia_nombre}
      />
      <GridField
        label="Tipo de canalización"
        value={data.id_canalizacion_nombre}
      />
      <GridField
        label="Fecha de canalización"
        value={formatDate(data.fecha_canalizacion)}
      />
      <GridField label="Responsable" value={data.responsable} />
    </View>

    {/* ── observaciones: campo rich text ── */}
    {data.observaciones && (
      <>
        <Subsection title="Observaciones" />
        <NarrativeField html={data.observaciones} />
      </>
    )}
  </Section>
);

// ============================================================================
// Componente principal
// ============================================================================
interface InterviewCaratulaProps {
  data: any;
}

export const InterviewCaratula = ({ data }: InterviewCaratulaProps) => {
  const resolvedData = useMemo(() => data ?? {}, [data]);

  const isEmpty = !resolvedData || Object.keys(resolvedData).length === 0;

  const generatedDate = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>CARÁTULA DE ENTREVISTA</Text>
            <Text style={styles.subTitle}>
              Sistema de Registro de Entrevistas — Documento confidencial
            </Text>
          </View>
          <View style={styles.folioBox}>
            <Text style={styles.folioLabel}>Folio</Text>
            <Text style={styles.folioNumber}>{resolvedData.id ?? "NUEVO"}</Text>
          </View>
        </View>

        {isEmpty ? (
          <Text
            style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 20 }}
          >
            Sin datos disponibles
          </Text>
        ) : (
          <>
            <DatosVictima data={resolvedData} />
            <Hechos data={resolvedData} />
            <Violencia data={resolvedData} />
            <Efectos data={resolvedData} />
            <DependientesRed data={resolvedData} />
            <Agresor data={resolvedData} />
            <RutaAtencion data={resolvedData} />
            <Canalizacion data={resolvedData} />
          </>
        )}

        {/* footer fixed — siempre al fondo, no genera página extra */}
        <View style={styles.footer} fixed>
          <Text>Generado el {generatedDate}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default InterviewCaratula;
