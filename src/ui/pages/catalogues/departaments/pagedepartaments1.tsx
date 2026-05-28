// import React, {
//   useState,
//   useCallback,
//   useRef,
//   useEffect,
//   useMemo,
// } from "react";
// import CustomTable, {
//   type Column,
// } from "../../../components/table/customtable";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   PointElement,
//   LineElement,
//   Filler,
// } from "chart.js";
// import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
// import {
//   BarChart3,
//   LineChart,
//   PieChart,
//   TrendingUp,
//   Settings,
//   Download,
//   Upload,
//   Plus,
//   X,
//   Maximize2,
//   Minimize2,
//   ChevronRight,
//   Trash2,
//   Printer,
//   ZoomIn,
//   Image,
//   FileText,
//   Filter,
//   RefreshCw,
//   MessageCircle,
// } from "lucide-react";

// // Registrar componentes de Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   PointElement,
//   LineElement,
//   Filler,
// );

// // ─────────────────────────────────────────────
// // Tipos
// // ─────────────────────────────────────────────
// interface ChatMessage {
//   id: number;
//   role: "user" | "ai" | "error";
//   text: string;
//   sql?: string;
//   rowCount?: number;
//   timestamp: Date;
// }

// interface APIResponse {
//   status: boolean;
//   message?: string;
//   result?: {
//     resultados: Record<string, unknown>[];
//     sql_generado: string;
//     total_registros: number;
//   };
// }

// interface ChartData {
//   id: string;
//   type: "bar" | "pie" | "line" | "doughnut";
//   title: string;
//   labels: string[];
//   datasets: {
//     label: string;
//     data: number[];
//     backgroundColor?: string | string[];
//     borderColor?: string;
//     fill?: boolean;
//   }[];
// }

// // ─────────────────────────────────────────────
// // Utilidades
// // ─────────────────────────────────────────────
// const toLabel = (key: string): string => {
//   // Si la key es muy larga o tiene formato especial
//   if (key.length > 30) {
//     return key
//       .split("_")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");
//   }
//   return key
//     .replace(/_/g, " ")
//     .replace(/([a-z])([A-Z])/g, "$1 $2")
//     .replace(/\b\w/g, (c) => c.toUpperCase())
//     .trim();
// };
// const generateColumns = (
//   rows: Record<string, unknown>[],
// ): Column<Record<string, unknown>>[] => {
//   if (!rows.length) return [];
//   const sample = rows[0];
//   const keys = Object.keys(sample);

//   return keys.map((key) => {
//     const sampleValue = sample[key];

//     // Detectar si el valor es un objeto o JSON
//     const isJson =
//       sampleValue !== null &&
//       typeof sampleValue === "object" &&
//       !Array.isArray(sampleValue);
//     const isArray = Array.isArray(sampleValue);

//     // Para valores JSON, crear un render personalizado
//     const renderField =
//       isJson || isArray
//         ? (val: any) => {
//             if (val === null || val === undefined) return "—";
//             try {
//               // Si es string JSON, parsearlo
//               const parsed = typeof val === "string" ? JSON.parse(val) : val;
//               // Mostrar como string legible (máximo 100 caracteres)
//               const str = JSON.stringify(parsed);
//               return str.length > 80 ? str.substring(0, 80) + "..." : str;
//             } catch {
//               return String(val);
//             }
//           }
//         : undefined;

//     return {
//       field: key,
//       headerName: toLabel(key),
//       filterType: isJson || isArray ? ("text" as const) : ("text" as const),
//       sortable: true,
//       resizable: true,
//       align: typeof sampleValue === "number" ? "right" : "left",
//       renderField,
//     };
//   });
// };

// const generateColors = (count: number): string[] => {
//   const palette = [
//     "#9B2242",
//     "#2563EB",
//     "#16A34A",
//     "#EAB308",
//     "#8B5CF6",
//     "#EC4899",
//     "#14B8A6",
//     "#F97316",
//     "#6366F1",
//     "#06B6D4",
//   ];
//   return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
// };

// // ─────────────────────────────────────────────
// // Componente principal
// // ─────────────────────────────────────────────
// interface AITableContainerProps {
//   apiBase?: string;
//   paginate?: number[];
// }

// const AITableContainer: React.FC<AITableContainerProps> = ({
//   apiBase = "http://127.0.0.1:8000",
//   paginate = [10, 25, 50, 100],
// }) => {
//   // Estados principales
//   const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
//   const [columns, setColumns] = useState<Column<Record<string, unknown>>[]>([]);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hasData, setHasData] = useState(false);
//   const [activeTab, setActiveTab] = useState<"table" | "charts">("table");
//   const [charts, setCharts] = useState<ChartData[]>([]);
//   const [isChatOpen, setIsChatOpen] = useState(true);
//   const [showSql, setShowSql] = useState(false);

//   const msgIdRef = useRef(0);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const chatMessagesRef = useRef<HTMLDivElement>(null);

//   // Sesión persistente
//   const [sessionId] = useState(() => {
//     let id = localStorage.getItem("ai_session_id");
//     if (!id) {
//       id = crypto.randomUUID
//         ? crypto.randomUUID()
//         : Math.random().toString(36).substring(2);
//       localStorage.setItem("ai_session_id", id);
//     }
//     return id;
//   });

//   const nextId = () => ++msgIdRef.current;

//   // Scroll del chat
//   useEffect(() => {
//     if (chatMessagesRef.current && messages.length > 0) {
//       const timeout = setTimeout(() => {
//         if (chatMessagesRef.current) {
//           chatMessagesRef.current.scrollTop =
//             chatMessagesRef.current.scrollHeight;
//         }
//       }, 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [messages]);

//   // Generar gráficas automáticamente desde los datos
//  // Generar gráficas automáticamente desde los datos
// const generateChartsFromData = (data: Record<string, unknown>[]) => {
//   if (!data.length) return [];

//   const newCharts: ChartData[] = [];
//   const firstRow = data[0];
//   const keys = Object.keys(firstRow);
  
//   // DETECTAR SI ES UN RESULTADO DE CONTEO (una sola fila con campos como total_*, count_*, etc.)
//   const isCountResult = data.length === 1 && keys.some(k => 
//     k.toLowerCase().includes('total') || 
//     k.toLowerCase().includes('count') || 
//     typeof firstRow[k] === 'number'
//   );
  
//   // Si es un resultado de conteo, mostrar una tarjeta especial en lugar de gráficas
//   if (isCountResult && data.length === 1) {
//     // No generar gráficas, solo mostraremos el conteo en las estadísticas
//     return [];
//   }
  
//   // Si hay suficientes datos para gráficas (más de 1 fila)
//   if (data.length > 1) {
//     // Gráfica 1: Distribución por categoría principal (barras)
//     const textKeys = keys.filter(k => typeof firstRow[k] === 'string');
//     if (textKeys.length > 0) {
//       const categoryKey = textKeys[0];
//       const counts: Record<string, number> = {};
//       data.forEach((item) => {
//         const val = String(item[categoryKey] ?? "N/D");
//         counts[val] = (counts[val] || 0) + 1;
//       });
//       if (Object.keys(counts).length > 1) {
//         newCharts.push({
//           id: "bar-distribution",
//           type: "bar",
//           title: `Distribución por ${toLabel(categoryKey)}`,
//           labels: Object.keys(counts).slice(0, 10),
//           datasets: [{
//             label: "Cantidad",
//             data: Object.values(counts).slice(0, 10),
//             backgroundColor: generateColors(Object.keys(counts).length),
//           }],
//         });
//       }
//     }

//     // Gráfica 2: Top valores numéricos (pastel)
//     const numericKeys = keys.filter(k => typeof firstRow[k] === 'number');
//     if (numericKeys.length > 0 && textKeys.length > 0) {
//       const numericKey = numericKeys[0];
//       const categoryKey = textKeys[0];
//       const topData = [...data]
//         .sort((a, b) => (Number(b[numericKey]) || 0) - (Number(a[numericKey]) || 0))
//         .slice(0, 8);
//       if (topData.length > 1) {
//         newCharts.push({
//           id: "pie-top",
//           type: "pie",
//           title: `Top ${toLabel(numericKey)} por ${toLabel(categoryKey)}`,
//           labels: topData.map(item => String(item[categoryKey] ?? "N/D").slice(0, 20)),
//           datasets: [{
//             label: toLabel(numericKey),
//             data: topData.map(item => Number(item[numericKey]) || 0),
//             backgroundColor: generateColors(topData.length),
//           }],
//         });
//       }
//     }
//   }

//   return newCharts;
// };

//   // Llamada a la API
//   const ask = useCallback(
//     async (question: string) => {
//       if (!question.trim() || loading) return;
//       setLoading(true);
//       setIsChatOpen(true);
//       setActiveTab("table");

//       const userMsg: ChatMessage = {
//         id: nextId(),
//         role: "user",
//         text: question.trim(),
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);

//       try {
//         const res = await fetch(`${apiBase}/api/ia/ask`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-Session-Id": sessionId,
//           },
//           body: JSON.stringify({ pregunta: question.trim() }),
//         });
//         const json: APIResponse = await res.json();

//         if (json.status && json.result?.resultados) {
//           const rows = json.result.resultados;
//           setTableData(rows);
//           setColumns(generateColumns(rows));
//           setHasData(true);
//           setCharts(generateChartsFromData(rows));

//           setMessages((prev) => [
//             ...prev,
//             {
//               id: nextId(),
//               role: "ai",
//               text: `✅ ${json.result!.total_registros.toLocaleString()} registros encontrados`,
//               sql: json.result!.sql_generado,
//               rowCount: json.result!.total_registros,
//               timestamp: new Date(),
//             },
//           ]);
//         } else {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: nextId(),
//               role: "error",
//               text: `❌ ${json.message ?? "No se pudo resolver la consulta."}`,
//               timestamp: new Date(),
//             },
//           ]);
//         }
//       } catch (err) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: nextId(),
//             role: "error",
//             text: "❌ Error de conexión con el servidor",
//             timestamp: new Date(),
//           },
//         ]);
//       } finally {
//         setLoading(false);
//         setTimeout(() => inputRef.current?.focus(), 100);
//       }
//     },
//     [apiBase, loading, sessionId],
//   );

//   const handleSend = () => {
//     if (!input.trim() || loading) return;
//     const q = input.trim();
//     setInput("");
//     ask(q);
//   };

//   const suggestions = [
//     "📊 Muéstrame los primeros 50 registros",
//     "🔢 ¿Cuántos registros hay en total?",
//     "🕐 Dame los últimos 20 registros",
//     "👥 Muéstrame los usuarios activos",
//     "📈 Requisiciones por departamento",
//     "🏆 Usuario con más requisiciones",
//   ];

//   // Renderizar gráfica según tipo
//   const renderChart = (chart: ChartData) => {
//     const options = {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { position: "bottom" as const, labels: { font: { size: 11 } } },
//         tooltip: { backgroundColor: "#9B2242" },
//       },
//     };
//     const commonProps = { options, style: { maxHeight: 300, width: "100%" } };

//     switch (chart.type) {
//       case "bar":
//         return <Bar data={chart as any} {...commonProps} />;
//       case "pie":
//         return <Pie data={chart as any} {...commonProps} />;
//       case "line":
//         return <Line data={chart as any} {...commonProps} />;
//       case "doughnut":
//         return <Doughnut data={chart as any} {...commonProps} />;
//       default:
//         return <Bar data={chart as any} {...commonProps} />;
//     }
//   };

//   // Estadísticas rápidas
//   const stats = useMemo(() => {
//     if (!tableData.length) return [];
//     const numericKeys = Object.keys(tableData[0]).filter(
//       (k) => typeof tableData[0][k] === "number",
//     );
//     return numericKeys.slice(0, 4).map((key) => {
//       const values = tableData.map((row) => Number(row[key]) || 0);
//       return {
//         label: toLabel(key),
//         total: values.reduce((a, b) => a + b, 0),
//         avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
//       };
//     });
//   }, [tableData]);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
//         display: "flex",
//       }}
//     >
//       {/* PANEL DE CHAT LATERAL */}
//       <div
//         style={{
//           width: isChatOpen ? 380 : 0,
//           transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//           overflow: "hidden",
//           background: "#fff",
//           boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
//           display: "flex",
//           flexDirection: "column",
//           flexShrink: 0,
//           height: "100vh",
//           position: "sticky",
//           top: 0,
//           zIndex: 40,
//         }}
//       >
//         {isChatOpen && (
//           <>
//             <div
//               style={{
//                 padding: "20px",
//                 background: "#9B2242",
//                 color: "#fff",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <MessageCircle size={22} />
//                 <span style={{ fontWeight: 700, fontSize: 18 }}>
//                   Asistente IA
//                 </span>
//               </div>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <button
//                   onClick={() => setShowSql(!showSql)}
//                   style={{
//                     background: showSql
//                       ? "rgba(255,255,255,0.3)"
//                       : "rgba(255,255,255,0.2)",
//                     border: "none",
//                     borderRadius: 6,
//                     padding: "4px 10px",
//                     cursor: "pointer",
//                     color: "#fff",
//                     fontSize: 11,
//                     fontWeight: 500,
//                   }}
//                 >
//                   SQL
//                 </button>
//                 <button
//                   onClick={() => setIsChatOpen(false)}
//                   style={{
//                     background: "rgba(255,255,255,0.2)",
//                     border: "none",
//                     borderRadius: 6,
//                     width: 30,
//                     height: 30,
//                     cursor: "pointer",
//                     color: "#fff",
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div
//               ref={chatMessagesRef}
//               style={{
//                 flex: 1,
//                 overflowY: "auto",
//                 padding: "20px",
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 12,
//               }}
//             >
//               {messages.length === 0 ? (
//                 <div
//                   style={{
//                     textAlign: "center",
//                     color: "#adb5bd",
//                     padding: "40px 20px",
//                   }}
//                 >
//                   <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
//                   <p style={{ fontSize: 14, fontWeight: 500 }}>
//                     Escribe tu pregunta
//                   </p>
//                   <p style={{ fontSize: 12, marginTop: 8 }}>
//                     Ej: "muéstrame los usuarios"
//                   </p>
//                 </div>
//               ) : (
//                 messages.map((msg) => (
//                   <div
//                     key={msg.id}
//                     style={{
//                       display: "flex",
//                       justifyContent:
//                         msg.role === "user" ? "flex-end" : "flex-start",
//                     }}
//                   >
//                     <div
//                       style={{
//                         maxWidth: "85%",
//                         padding: "10px 14px",
//                         borderRadius:
//                           msg.role === "user"
//                             ? "16px 16px 4px 16px"
//                             : "16px 16px 16px 4px",
//                         background:
//                           msg.role === "user"
//                             ? "#9B2242"
//                             : msg.role === "error"
//                               ? "#fee2e2"
//                               : "#f1f3f5",
//                         color:
//                           msg.role === "user"
//                             ? "#fff"
//                             : msg.role === "error"
//                               ? "#dc2626"
//                               : "#1e293b",
//                         fontSize: 13,
//                         boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//                       }}
//                     >
//                       <div style={{ wordBreak: "break-word" }}>{msg.text}</div>
//                       {showSql && msg.sql && (
//                         <details style={{ marginTop: 8 }}>
//                           <summary
//                             style={{
//                               fontSize: 10,
//                               opacity: 0.7,
//                               cursor: "pointer",
//                             }}
//                           >
//                             Ver SQL
//                           </summary>
//                           <pre
//                             style={{
//                               marginTop: 6,
//                               padding: "6px 8px",
//                               background: "rgba(0,0,0,0.06)",
//                               borderRadius: 6,
//                               fontSize: 9,
//                               overflowX: "auto",
//                               fontFamily: "monospace",
//                             }}
//                           >
//                             {msg.sql}
//                           </pre>
//                         </details>
//                       )}
//                       <div
//                         style={{
//                           fontSize: 9,
//                           opacity: 0.5,
//                           marginTop: 6,
//                           textAlign: msg.role === "user" ? "right" : "left",
//                         }}
//                       >
//                         {msg.timestamp.toLocaleTimeString("es-MX", {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//               {loading && (
//                 <div style={{ display: "flex", justifyContent: "flex-start" }}>
//                   <div
//                     style={{
//                       background: "#f1f3f5",
//                       padding: "10px 14px",
//                       borderRadius: "16px 16px 16px 4px",
//                       fontSize: 13,
//                       color: "#9B2242",
//                     }}
//                   >
//                     <span className="dot-flashing" /> Pensando...
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div
//               style={{
//                 padding: "16px 20px",
//                 borderTop: "1px solid #e9ecef",
//                 background: "#fff",
//               }}
//             >
//               <div style={{ display: "flex", gap: 8 }}>
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                   placeholder="Escribe tu pregunta..."
//                   disabled={loading}
//                   style={{
//                     flex: 1,
//                     padding: "12px 16px",
//                     borderRadius: 12,
//                     border: "1.5px solid #e2e8f0",
//                     fontSize: 13,
//                     outline: "none",
//                     transition: "all 0.2s",
//                   }}
//                   onFocus={(e) =>
//                     (e.currentTarget.style.borderColor = "#9B2242")
//                   }
//                   onBlur={(e) =>
//                     (e.currentTarget.style.borderColor = "#e2e8f0")
//                   }
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={loading || !input.trim()}
//                   style={{
//                     padding: "0 20px",
//                     borderRadius: 12,
//                     border: "none",
//                     background:
//                       loading || !input.trim() ? "#cbd5e1" : "#9B2242",
//                     color: "#fff",
//                     fontWeight: 600,
//                     cursor:
//                       loading || !input.trim() ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   →
//                 </button>
//               </div>
//               <div
//                 style={{
//                   marginTop: 12,
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 6,
//                 }}
//               >
//                 {suggestions.map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => {
//                       setInput(s);
//                       inputRef.current?.focus();
//                     }}
//                     style={{
//                       padding: "5px 12px",
//                       borderRadius: 50,
//                       border: "1px solid #e2e8f0",
//                       background: "#fff",
//                       color: "#64748b",
//                       fontSize: 10,
//                       cursor: "pointer",
//                       transition: "all 0.15s",
//                     }}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* BOTÓN FLOTANTE PARA ABRIR CHAT */}
//       {!isChatOpen && (
//         <button
//           onClick={() => setIsChatOpen(true)}
//           style={{
//             position: "fixed",
//             left: 24,
//             bottom: 24,
//             width: 56,
//             height: 56,
//             borderRadius: 28,
//             background: "#9B2242",
//             border: "none",
//             color: "#fff",
//             cursor: "pointer",
//             boxShadow: "0 4px 16px rgba(155,34,66,0.4)",
//             zIndex: 50,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             transition: "transform 0.2s",
//           }}
//         >
//           <MessageCircle size={24} />
//         </button>
//       )}

//       {/* CONTENIDO PRINCIPAL */}
//       <div
//         style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "24px 32px" }}
//       >
//         {/* HEADER */}
//         <div style={{ marginBottom: 28 }}>
//           <h1
//             style={{
//               margin: 0,
//               fontSize: 28,
//               fontWeight: 800,
//               background: "linear-gradient(135deg, #9B2242, #651D32)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             Dashboard Inteligente
//           </h1>
//           <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6c757d" }}>
//             Consulta tu base de datos en lenguaje natural y visualiza los
//             resultados
//           </p>
//         </div>

//         {/* ESTADÍSTICAS RÁPIDAS */}
//         {hasData && stats.length > 0 && (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//               gap: 16,
//               marginBottom: 28,
//             }}
//           >
//             {stats.map((stat) => (
//               <div
//                 key={stat.label}
//                 style={{
//                   background: "#fff",
//                   borderRadius: 16,
//                   padding: "16px 20px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   borderLeft: `4px solid #9B2242`,
//                 }}
//               >
//                 <p
//                   style={{
//                     margin: 0,
//                     fontSize: 12,
//                     color: "#6c757d",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.5px",
//                   }}
//                 >
//                   {stat.label}
//                 </p>
//                 <p
//                   style={{
//                     margin: "8px 0 0",
//                     fontSize: 28,
//                     fontWeight: 700,
//                     color: "#9B2242",
//                   }}
//                 >
//                   {stat.total.toLocaleString()}
//                 </p>
//                 <p
//                   style={{ margin: "4px 0 0", fontSize: 11, color: "#adb5bd" }}
//                 >
//                   Promedio: {stat.avg.toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* TABS */}
//         {hasData && (
//           <div
//             style={{
//               display: "flex",
//               gap: 12,
//               marginBottom: 24,
//               borderBottom: "2px solid #e9ecef",
//               paddingBottom: 8,
//             }}
//           >
//             <button
//               onClick={() => setActiveTab("table")}
//               style={{
//                 padding: "8px 20px",
//                 borderRadius: 20,
//                 border: "none",
//                 background: activeTab === "table" ? "#9B2242" : "transparent",
//                 color: activeTab === "table" ? "#fff" : "#6c757d",
//                 fontWeight: 600,
//                 fontSize: 14,
//                 cursor: "pointer",
//                 transition: "all 0.2s",
//               }}
//             >
//               📋 Tabla de Datos
//             </button>
//             <button
//               onClick={() => setActiveTab("charts")}
//               style={{
//                 padding: "8px 20px",
//                 borderRadius: 20,
//                 border: "none",
//                 background: activeTab === "charts" ? "#9B2242" : "transparent",
//                 color: activeTab === "charts" ? "#fff" : "#6c757d",
//                 fontWeight: 600,
//                 fontSize: 14,
//                 cursor: "pointer",
//                 transition: "all 0.2s",
//               }}
//             >
//               📊 Visualizaciones
//             </button>
//           </div>
//         )}

//         {/* ESTADO VACÍO */}
//         {!hasData && !loading && (
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               minHeight: 400,
//               background: "#fff",
//               borderRadius: 20,
//               boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//               padding: 48,
//             }}
//           >
//             <div style={{ fontSize: 72, marginBottom: 20 }}>📊</div>
//             <h2
//               style={{
//                 margin: 0,
//                 fontSize: 22,
//                 fontWeight: 600,
//                 color: "#343a40",
//               }}
//             >
//               Esperando tu primera pregunta
//             </h2>
//             <p style={{ margin: "8px 0 0", fontSize: 15, color: "#6c757d" }}>
//               Escribe algo en el chat lateral para comenzar
//             </p>
//           </div>
//         )}

//         {/* LOADING */}
//         {loading && (
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               minHeight: 400,
//               background: "#fff",
//               borderRadius: 20,
//               gap: 16,
//             }}
//           >
//             <div
//               style={{
//                 width: 48,
//                 height: 48,
//                 border: "3px solid #e2e8f0",
//                 borderTopColor: "#9B2242",
//                 borderRadius: "50%",
//                 animation: "spin 0.7s linear infinite",
//               }}
//             />
//             <p style={{ color: "#6c757d" }}>Consultando la base de datos...</p>
//           </div>
//         )}

//         {/* TABLA */}
//         {hasData && !loading && activeTab === "table" && (
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: 20,
//               overflow: "hidden",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//             }}
//           >
//             <CustomTable
//               data={tableData}
//               columns={columns}
//               paginate={paginate}
//               title="Resultados"
//               subtitle={`${tableData.length.toLocaleString()} registros devueltos`}
//               enableViewToggle
//               enableThemeToggle
//               enableExportOptions
//               enableColumnVisibility
//               enableDensityControl
//               enableRowSelection
//               enableSelectAllRows
//               enableFullscreen
//               enableGroupBy
//               enableAggregations
//               enableSavedFilters
//               enableColumnResize
//               enableColumnReorder
//               striped
//               hoverable
//               rowIdField="id"
//               storageKey="ai-table-container"
//             />
//           </div>
//         )}

//         {/* GRÁFICAS */}
//         {hasData && !loading && activeTab === "charts" && (
//           <div>
//             {charts.length === 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: 60,
//                   background: "#fff",
//                   borderRadius: 20,
//                 }}
//               >
//                 <p>
//                   No hay suficientes datos para generar gráficas. Intenta con
//                   otra consulta.
//                 </p>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
//                   gap: 24,
//                 }}
//               >
//                 {charts.map((chart) => (
//                   <div
//                     key={chart.id}
//                     style={{
//                       background: "#fff",
//                       borderRadius: 20,
//                       overflow: "hidden",
//                       boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//                       transition: "transform 0.2s, box-shadow 0.2s",
//                     }}
//                   >
//                     <div
//                       style={{
//                         padding: "14px 20px",
//                         background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
//                         borderBottom: "1px solid #e9ecef",
//                       }}
//                     >
//                       <h3
//                         style={{
//                           margin: 0,
//                           fontSize: 16,
//                           fontWeight: 600,
//                           color: "#343a40",
//                         }}
//                       >
//                         {chart.title}
//                       </h3>
//                     </div>
//                     <div style={{ padding: 20 }}>
//                       <div style={{ height: 280 }}>{renderChart(chart)}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         .dot-flashing { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #9B2242; animation: dotFlashing 1s infinite linear alternate; }
//         .dot-flashing::before, .dot-flashing::after { content: ''; display: inline-block; position: relative; width: 6px; height: 6px; border-radius: 50%; background-color: #9B2242; animation: dotFlashing 1s infinite alternate; }
//         .dot-flashing::before { left: -10px; animation-delay: 0.2s; }
//         .dot-flashing::after { left: 10px; animation-delay: 0.4s; }
//         @keyframes dotFlashing { 0% { background-color: #cbd5e1; } 50%, 100% { background-color: #9B2242; } }
//       `}</style>
//     </div>
//   );
// };

// export default AITableContainer;
