// // CompositeCrud.tsx
// import React, {
//   useMemo,
//   useState,
//   useEffect,
//   useCallback,
//   memo,
//   useRef,
//   useImperativeHandle,
// } from "react";
// import ReactDOM from "react-dom";

// import { useFormikContext } from "formik";
// import { FiActivity, FiBarChart2 } from "react-icons/fi";
// import { HiDotsVertical } from "react-icons/hi";
// import Swal from "sweetalert2";

// import CompositePage from "./compositePage";
// import CustomButton from "../button/custombuttom";
// import Tooltip from "../toltip/Toltip";
// import FormikForm from "../../formik/Formik";
// import CustomTable from "../table/customtable";
// import {
//   FormikAutocomplete,
//   FormikCheckbox,
//   FormikSwitch,
//   FormikInput,
//   FormikPassword,
//   FormikTextArea,
//   FormikNumber,
//   FormikRadio,
//   FormikColorPicker,
//   FormikMultiSelect,
//   FormikDatePicker,
//   FormikDateRange,
//   FormikNumberDirect,
//   FormikSlider,
//   FormikArrayTable,
// } from "../../formik/FormikInputs/FormikInput";
// import { RowComponent } from "../../components/responsive/Responsive";
// import FormikFileInput from "../../formik/FormikInputs/forminputimage";

// import type { AdvancedCrudConfig } from "../../../types/crud-advanced.types";
// import type {
//   BuildResult,
//   RenderContext,
//   OverrideComponents,
//   OverrideFieldProps,
//   OverrideSelectProps,
//   OverrideTableProps,
//   TableActionsConfig,
//   MobileListTileConfig,
//   MobileQuickFiltersConfig,
//   MobileConfig,
//   BoxGroup,
//   ArrayFieldItem,
// } from "../../../models/genericmodels.model";
// import { icons } from "../../../constant";
// import type { GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";

// // 🎨 Importamos el tema global
// import { theme } from "../../../config/themes";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type ResponsiveSizes = {
//   sm?: number;
//   md?: number;
//   lg?: number;
//   xl?: number;
//   "2xl"?: number;
// };

// export type CaseTransform = "uppercase" | "lowercase" | "none";

// export interface FieldItem {
//   name: string;
//   label: string;
//   typeField:
//     | "Text"
//     | "Select"
//     | "Toggle"
//     | "Checkbox"
//     | "File"
//     | "Color"
//     | "Password"
//     | "TextArea"
//     | "Number"
//     | "Radio"
//     | "Date"
//     | "DateRange"
//     | "NumberDirect"
//     | "Slider"
//     | "Array";

//   dateConfig?: {
//     type?: "date" | "datetime-local" | "time" | "month" | "week";
//     min?: string;
//     max?: string;
//   };
//   dateRangeConfig?: {
//     nameFrom: string;
//     nameTo: string;
//     labelFrom?: string;
//     labelTo?: string;
//     min?: string;
//     max?: string;
//   };
//   numberDirectConfig?: {
//     min?: number;
//     max?: number;
//     step?: number;
//     decimals?: number;
//     prefix?: string;
//     suffix?: string;
//     showStepper?: boolean;
//   };
//   sliderConfig?: {
//     min?: number;
//     max?: number;
//     step?: number;
//     unit?: string;
//     showTooltip?: boolean;
//     marks?: Array<{ value: number; label: string }>;
//   };
//   arrayConfig?: {
//     fields: ArrayFieldItem[];
//     allowAdd?: boolean;
//     allowRemove?: boolean;
//     addButtonLabel?: string;
//     itemLabel?: string;
//   };

//   disabled?: boolean;
//   required?: boolean;
//   type?: string;
//   multiple: boolean;
//   loadingHook?: () => boolean;
//   getFilterValue?: (value: any) => string;
//   headerName?: string;
//   renderField?: (value: any, row: any) => React.ReactNode;
//   responsive?: ResponsiveSizes;
//   selectOptions?: any[];
//   hidden?: boolean | ((values: any) => boolean);

//   selectOptionsHook?: () => any[] | Promise<any[]>;
//   selectIdKey?: string;
//   selectLabelKey?: string;
//   fileConfig?: any;
//   colorConfig?: any;
//   passwordConfig?: any;
//   textareaConfig?: any;
//   numberConfig?: any;
//   refreshActionHook?: () => () => void | Promise<void>;
//   addActionHook?: () => () => void;
//   radioConfig?: {
//     options: any[];
//     optionIdKey: string;
//     optionLabelKey: string;
//   };
//   placeholder?: string;
//   uppercase?: boolean;
//   caseTransform?: CaseTransform;
//   transform?: (value: any) => any;
//   onChange?: (value: any, formik: any, hooks?: any) => void;
//   onInput?: (value: any, formik: any, hooks?: any) => void;
// }

// export type ActionHookContext<
//   TRecord = any,
//   THooks extends Record<string, any> = Record<string, any>,
//   TMainHook = any,
// > = {
//   row: TRecord;
//   hooks: THooks;
//   mainHook?: TMainHook;
// };

// interface PropsCrud<
//   TForm extends object,
//   TTable extends object = TForm,
//   THooks extends Record<string, any> = Record<string, any>,
// > {
//   hook: GenericDataReturn<TForm>;
//   formTitles: { modalTitleAdd: string; modalTitleUpdate: string };
//   fields?: FieldItem[];
//   crudConfig?: BuildResult<TForm, TTable>;
//   advancedConfig?: AdvancedCrudConfig<TForm, TTable>;
//   mobileListTile?: MobileListTileConfig<TTable>;
//   mobileQuickFilters?: MobileQuickFiltersConfig;
//   enableMobileViews?: boolean;
//   actionsDispatch?: THooks;
// }

// // ─── PortalDropdown (con theme) ────────────────────────────────────────────────
// interface PortalDropdownProps {
//   anchorRef: React.RefObject<HTMLElement>;
//   isOpen: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
// }

// const PortalDropdown = ({
//   anchorRef,
//   isOpen,
//   onClose,
//   children,
// }: PortalDropdownProps) => {
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [coords, setCoords] = useState<{
//     top?: number;
//     bottom?: number;
//     left: number;
//     openUp: boolean;
//   } | null>(null);

//   useEffect(() => {
//     if (!isOpen || !anchorRef.current) {
//       setCoords(null);
//       return;
//     }
//     const rect = anchorRef.current.getBoundingClientRect();
//     const estimatedHeight = 200;
//     const spaceBelow = window.innerHeight - rect.bottom;
//     const spaceAbove = rect.top;
//     const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
//     setCoords({
//       top: openUp ? undefined : rect.bottom + window.scrollY + 4,
//       bottom: openUp
//         ? window.innerHeight - rect.top - window.scrollY + 4
//         : undefined,
//       left: rect.right + window.scrollX,
//       openUp,
//     });
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node) &&
//         anchorRef.current &&
//         !anchorRef.current.contains(e.target as Node)
//       ) {
//         onClose();
//       }
//     };
//     const timer = setTimeout(() => {
//       document.addEventListener("mousedown", handleClickOutside);
//     }, 0);
//     return () => {
//       clearTimeout(timer);
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose, anchorRef]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const handleScroll = () => onClose();
//     window.addEventListener("scroll", handleScroll, true);
//     return () => window.removeEventListener("scroll", handleScroll, true);
//   }, [isOpen, onClose]);

//   if (!isOpen || !coords) return null;
//   return ReactDOM.createPortal(
//     <div
//       ref={dropdownRef}
//       style={{
//         position: "absolute",
//         top: coords.top,
//         bottom: coords.bottom,
//         left: coords.left,
//         transform: "translateX(-100%)",
//         zIndex: theme.zIndex.portal,
//         minWidth: "160px",
//         background: theme.colors.background.card,
//         border: `1px solid ${theme.colors.border.DEFAULT}`,
//         borderRadius: theme.radius.md,
//         boxShadow: theme.shadows.dropdown,
//         overflow: "hidden",
//       }}
//     >
//       <div className="py-1">{children}</div>
//     </div>,
//     document.body,
//   );
// };

// // ─── ActionButtons (con theme) ─────────────────────────────────────────────────
// interface ActionButtonsProps<
//   TRecord,
//   THooks extends Record<string, any> = Record<string, any>,
//   TMainHook = any,
// > {
//   row: TRecord;
//   actionsConfig?: TableActionsConfig<TRecord, THooks, TMainHook>;
//   onEdit?: (row: TRecord) => void;
//   onDelete?: (row: TRecord) => void;
//   maxVisibleButtons?: number;
//   actionsDispatch?: THooks;
//   mainHook?: TMainHook;
// }

// const ActionButtons = <
//   TRecord,
//   THooks extends Record<string, any> = Record<string, any>,
//   TMainHook = any,
// >({
//   row,
//   actionsConfig,
//   onEdit,
//   onDelete,
//   maxVisibleButtons = 2,
//   actionsDispatch,
//   mainHook,
// }: ActionButtonsProps<TRecord, THooks, TMainHook>) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const triggerRef = useRef<HTMLElement>(null);
//   if (!actionsConfig && !onEdit && !onDelete) return null;

//   const buttons: Array<{
//     id: string;
//     label: string;
//     icon?: React.ReactNode;
//     onClick: () => void;
//     color?: string;
//     tooltip?: string;
//     danger?: boolean;
//   }> = [];

//   if (actionsConfig?.isEditing !== false && onEdit) {
//     buttons.push({
//       id: "edit",
//       label: "Editar",
//       icon: <icons.Lu.LuPencilLine className="w-4 h-4" />,
//       onClick: () => onEdit(row),
//       color: "orange",
//       tooltip: "Editar",
//     });
//   }
//   if (actionsConfig?.isDelete !== false && onDelete) {
//     buttons.push({
//       id: "delete",
//       label: "Eliminar",
//       icon: <icons.Lu.LuTrash className="w-4 h-4" />,
//       onClick: () => onDelete(row),
//       color: "ruby",
//       tooltip: "Eliminar",
//       danger: true,
//     });
//   }
//   actionsConfig?.moreButtons?.forEach((btn, idx) => {
//     if (btn.permission === false) return;
//     if (btn.multiple === true) return;
//     const getIcon = () => {
//       if (btn.icon) {
//         if (typeof btn.icon === "string")
//           return <i className={`${btn.icon} w-4 h-4`} />;
//         return btn.icon;
//       }
//       if (btn.iconName) return <i className={`${btn.iconName} w-4 h-4`} />;
//       return undefined;
//     };
//     const icon = getIcon();
//     let realOnClick: (() => void) | undefined;
//     if (btn.actionHook) {
//       realOnClick = () =>
//         btn.actionHook({
//           row,
//           hooks: (actionsDispatch || {}) as THooks,
//           mainHook: mainHook,
//         });
//     } else if (btn.handleOnClick) {
//       realOnClick = () => btn.handleOnClick(row);
//     }
//     if (!realOnClick) return;
//     buttons.push({
//       id: `custom-${idx}`,
//       label: btn.label,
//       icon: icon,
//       onClick: realOnClick,
//       color: btn.color,
//       tooltip: btn.tooltip || btn.label,
//     });
//   });

//   const visibleButtons = buttons.slice(0, maxVisibleButtons);
//   const hiddenButtons = buttons.slice(maxVisibleButtons);
//   return (
//     <div className="flex items-center gap-2">
//       {visibleButtons.map((btn) => (
//         <Tooltip key={btn.id} content={btn.tooltip || btn.label}>
//           <CustomButton
//             color={(btn.color as any) || "gray"}
//             onClick={btn.onClick}
//             icon={btn.icon}
//             size="sm"
//           >
//             {!btn.icon && btn.label}
//           </CustomButton>
//         </Tooltip>
//       ))}
//       {hiddenButtons.length > 0 && (
//         <>
//           <Tooltip content="Más acciones">
//             <span
//               ref={triggerRef as React.RefObject<HTMLSpanElement>}
//               style={{ display: "inline-flex" }}
//             >
//               <CustomButton
//                 color="gray"
//                 onClick={() => setMenuOpen((prev) => !prev)}
//                 icon={<HiDotsVertical className="w-4 h-4" />}
//                 size="sm"
//               />
//             </span>
//           </Tooltip>
//           <PortalDropdown
//             anchorRef={triggerRef}
//             isOpen={menuOpen}
//             onClose={() => setMenuOpen(false)}
//           >
//             {hiddenButtons.map((btn) => (
//               <button
//                 key={btn.id}
//                 onClick={() => {
//                   btn.onClick();
//                   setMenuOpen(false);
//                 }}
//                 className={`
//                   flex items-center gap-2 w-full px-4 py-2 text-sm text-left
//                   hover:bg-gray-100 transition-colors hover:cursor-pointer
//                   ${btn.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}
//                 `}
//               >
//                 <div
//                   className={`flex items-center justify-center gap-1.5 align-middle hover:translate-x-1 transition-all hover:font-bold hover:text-${btn.color}-500`}
//                 >
//                   {btn.icon && (
//                     <span className="w-4 h-4 flex items-center justify-center">
//                       {btn.icon}
//                     </span>
//                   )}
//                   <span>{btn.label}</span>
//                 </div>
//               </button>
//             ))}
//           </PortalDropdown>
//         </>
//       )}
//     </div>
//   );
// };

// // ─── Design System (ahora usa el tema global) ─────────────────────────────────
// const DEFAULT_RESPONSIVE: ResponsiveSizes = {
//   sm: 12,
//   md: 12,
//   lg: 12,
//   xl: 12,
//   "2xl": 12,
// };

// // ─── Date helpers (se mantienen igual) ─────────────────────────────────────────
// const isISODateString = (value: any): boolean => {
//   if (typeof value !== "string") return false;
//   if (!value || value === "null" || value === "undefined") return false;

//   const isoDateRegex =
//     /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[\+\-]\d{2}:\d{2})?)?$/;
//   if (!isoDateRegex.test(value)) return false;

//   const date = new Date(value);
//   return !isNaN(date.getTime());
// };

// const isDateObject = (value: any): value is Date => {
//   return value instanceof Date && !isNaN(value.getTime());
// };

// const isTimestamp = (value: any): boolean => {
//   if (typeof value !== "number") return false;
//   if (isNaN(value)) return false;
//   return value > 946684800000 && value < 4102444800000;
// };

// const toDateInputFormat = (value: any): string | null => {
//   if (!isValidDate(value)) return null;

//   let date: Date | null = null;

//   try {
//     if (isDateObject(value)) date = value;
//     else if (isISODateString(value)) date = new Date(value);
//     else if (isTimestamp(value)) date = new Date(value);
//     else {
//       const parsed = new Date(value);
//       if (!isNaN(parsed.getTime())) date = parsed;
//     }

//     if (date && !isNaN(date.getTime())) {
//       return date.toISOString().split("T")[0];
//     }
//   } catch (error) {
//     console.warn("Error converting date:", value, error);
//     return null;
//   }

//   return null;
// };

// const toISOFullFormat = (value: any): string | null => {
//   if (!isValidDate(value)) return null;

//   let date: Date | null = null;

//   try {
//     if (isDateObject(value)) date = value;
//     else if (isISODateString(value)) date = new Date(value);
//     else if (isTimestamp(value)) date = new Date(value);
//     else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
//       date = new Date(`${value}T00:00:00Z`);
//     } else {
//       const parsed = new Date(value);
//       if (!isNaN(parsed.getTime())) date = parsed;
//     }

//     if (date && !isNaN(date.getTime())) {
//       const iso = date.toISOString();
//       return iso.replace(/\.\d{3}Z$/, ".000000Z");
//     }
//   } catch (error) {
//     console.warn("Error converting date to ISO:", value, error);
//     return null;
//   }

//   return null;
// };

// const isValidDate = (value: any): boolean => {
//   if (value === null || value === undefined) return false;
//   if (
//     typeof value === "string" &&
//     (value === "" || value === "null" || value === "undefined")
//   )
//     return false;

//   const date = new Date(value);
//   return !isNaN(date.getTime());
// };

// export const transformDatesInObject = <T = any,>(
//   obj: T,
//   transformFn: (value: any) => string | null = toDateInputFormat,
// ): T => {
//   if (obj === null || obj === undefined) return obj;

//   if (Array.isArray(obj)) {
//     return obj.map((item) => transformDatesInObject(item, transformFn)) as T;
//   }

//   if (typeof obj === "object") {
//     const result: any = {};
//     try {
//       for (const key in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, key)) {
//           const value = obj[key];

//           if (
//             isValidDate(value) &&
//             (isISODateString(value) ||
//               isDateObject(value) ||
//               isTimestamp(value))
//           ) {
//             const transformed = transformFn(value);
//             result[key] = transformed !== null ? transformed : value;
//           } else if (value === null || value === undefined || value === "") {
//             result[key] = value;
//           } else if (typeof value === "object" && value !== null) {
//             result[key] = transformDatesInObject(value, transformFn);
//           } else {
//             result[key] = value;
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error transforming dates in object:", error);
//       return obj;
//     }
//     return result;
//   }

//   return obj;
// };

// export const toFormDateFormat = toDateInputFormat;
// export const toBackendDateFormat = toISOFullFormat;
// export const prepareForForm = <T = any,>(obj: T): T => {
//   if (!obj) return obj;
//   try {
//     return transformDatesInObject(obj, toDateInputFormat);
//   } catch (error) {
//     console.error("Error in prepareForForm:", error);
//     return obj;
//   }
// };
// export const prepareForBackend = <T = any,>(obj: T): T => {
//   if (!obj) return obj;
//   try {
//     return transformDatesInObject(obj, toISOFullFormat);
//   } catch (error) {
//     console.error("Error in prepareForBackend:", error);
//     return obj;
//   }
// };

// // ─── Fallback UI Components adaptados al theme ────────────────────────────────
// const SearchBar = ({ value, onChange, placeholder, debounceMs = 300 }: any) => {
//   const [localValue, setLocalValue] = useState(value);
//   useEffect(() => {
//     const timer = setTimeout(() => onChange(localValue), debounceMs);
//     return () => clearTimeout(timer);
//   }, [localValue, onChange, debounceMs]);
//   return (
//     <input
//       type="text"
//       value={localValue}
//       onChange={(e) => setLocalValue(e.target.value)}
//       placeholder={placeholder || "Buscar..."}
//       style={{
//         width: "100%",
//         padding: "6px 12px",
//         border: `1px solid ${theme.colors.border.DEFAULT}`,
//         borderRadius: theme.radius.md,
//         fontSize: theme.typography.fontSize.sm,
//       }}
//     />
//   );
// };

// const FilterPanel = ({ filters, values, onChange, onClear, isOpen }: any) => {
//   if (!isOpen) return null;
//   return (
//     <div
//       style={{
//         padding: "12px",
//         border: `1px solid ${theme.colors.border.DEFAULT}`,
//         borderRadius: theme.radius.md,
//         background: theme.colors.background.surface,
//       }}
//     >
//       <div className="flex justify-between mb-2">
//         <span
//           className="font-medium"
//           style={{ color: theme.colors.text.primary }}
//         >
//           Filtros
//         </span>
//         <button
//           onClick={onClear}
//           style={{
//             fontSize: theme.typography.fontSize.xs,
//             color: theme.colors.status.error,
//           }}
//         >
//           Limpiar
//         </button>
//       </div>
//       {filters?.map((filter: any) => (
//         <div key={filter.field} className="mb-2">
//           <label
//             className="block mb-1 text-xs"
//             style={{ color: theme.colors.text.secondary }}
//           >
//             {filter.label}
//           </label>
//           <input
//             type="text"
//             value={values[filter.field] || ""}
//             onChange={(e) => onChange(filter.field, e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px 8px",
//               fontSize: theme.typography.fontSize.sm,
//               border: `1px solid ${theme.colors.border.DEFAULT}`,
//               borderRadius: theme.radius.sm,
//             }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// const BulkActionsBar = ({
//   selectedCount,
//   onClearSelection,
//   onBulkDelete,
//   customActions,
//   onCustomAction,
// }: any) => (
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       gap: "12px",
//       padding: "8px",
//       borderRadius: theme.radius.md,
//       background: theme.colors.feedback.primaryLight,
//     }}
//   >
//     <span
//       style={{
//         fontSize: theme.typography.fontSize.sm,
//         color: theme.colors.text.primary,
//       }}
//     >
//       {selectedCount} seleccionados
//     </span>
//     <button
//       onClick={onClearSelection}
//       style={{
//         fontSize: theme.typography.fontSize.xs,
//         color: theme.colors.text.secondary,
//       }}
//     >
//       Cancelar
//     </button>
//     <button
//       onClick={onBulkDelete}
//       style={{
//         fontSize: theme.typography.fontSize.xs,
//         color: theme.colors.status.error,
//       }}
//     >
//       Eliminar
//     </button>
//     {customActions?.map((action: any) => (
//       <button
//         key={action.id}
//         onClick={() => onCustomAction(action.id)}
//         style={{ fontSize: theme.typography.fontSize.xs }}
//       >
//         {action.label}
//       </button>
//     ))}
//   </div>
// );

// const ViewSwitcher = ({ currentView, onViewChange, availableViews }: any) => (
//   <div
//     style={{
//       display: "flex",
//       gap: "4px",
//       padding: "4px",
//       background: theme.colors.background.surface,
//       borderRadius: theme.radius.md,
//     }}
//   >
//     {availableViews.map((mode: string) => (
//       <button
//         key={mode}
//         onClick={() => onViewChange(mode)}
//         style={{
//           padding: "4px 8px",
//           fontSize: theme.typography.fontSize.xs,
//           borderRadius: theme.radius.sm,
//           background:
//             currentView === mode ? theme.colors.background.card : "transparent",
//           boxShadow: currentView === mode ? theme.shadows.sm : "none",
//         }}
//       >
//         {mode === "table"
//           ? "📋"
//           : mode === "kanban"
//             ? "📌"
//             : mode === "calendar"
//               ? "📅"
//               : mode}
//       </button>
//     ))}
//   </div>
// );

// const DashboardStats = ({ stats, title, onRefresh }: any) => (
//   <div
//     style={{
//       padding: "16px",
//       background: theme.colors.background.card,
//       border: `1px solid ${theme.colors.border.DEFAULT}`,
//       borderRadius: theme.radius.lg,
//       boxShadow: theme.shadows.sm,
//     }}
//   >
//     <div className="flex justify-between">
//       <h3 style={{ fontWeight: 500, color: theme.colors.text.primary }}>
//         {title}
//       </h3>
//       <button
//         onClick={onRefresh}
//         style={{ fontSize: theme.typography.fontSize.xs }}
//       >
//         ⟳
//       </button>
//     </div>
//     <div className="grid grid-cols-3 gap-4 mt-2 text-center">
//       <div style={{ color: theme.colors.text.secondary }}>
//         Total
//         <br />
//         <span style={{ fontWeight: 600 }}>{stats.total ?? 0}</span>
//       </div>
//       <div style={{ color: theme.colors.text.secondary }}>
//         Activos
//         <br />
//         <span style={{ fontWeight: 600 }}>{stats.active ?? 0}</span>
//       </div>
//       <div style={{ color: theme.colors.text.secondary }}>
//         Inactivos
//         <br />
//         <span style={{ fontWeight: 600 }}>{stats.inactive ?? 0}</span>
//       </div>
//     </div>
//   </div>
// );

// const AuditLogViewer = ({ logs, loading, onRefresh }: any) => (
//   <div
//     style={{
//       padding: "12px",
//       border: `1px solid ${theme.colors.border.DEFAULT}`,
//       borderRadius: theme.radius.md,
//     }}
//   >
//     <div className="flex justify-between">
//       <h3 style={{ fontWeight: 500, color: theme.colors.text.primary }}>
//         Auditoría
//       </h3>
//       <button
//         onClick={onRefresh}
//         style={{ fontSize: theme.typography.fontSize.xs }}
//       >
//         ⟳
//       </button>
//     </div>
//     {loading ? (
//       <p style={{ color: theme.colors.text.secondary }}>Cargando...</p>
//     ) : logs.length === 0 ? (
//       <p style={{ color: theme.colors.text.disabled }}>Sin registros</p>
//     ) : (
//       <ul className="mt-2 text-sm">
//         {logs.slice(0, 5).map((log: any, idx: number) => (
//           <li key={idx} style={{ color: theme.colors.text.secondary }}>
//             📄 {log.message || log.action}
//           </li>
//         ))}
//       </ul>
//     )}
//   </div>
// );

// const KanbanView = () => (
//   <div
//     style={{
//       padding: "16px",
//       textAlign: "center",
//       color: theme.colors.text.disabled,
//       border: `1px solid ${theme.colors.border.DEFAULT}`,
//       borderRadius: theme.radius.md,
//     }}
//   >
//     Kanban View (en construcción)
//   </div>
// );

// const CalendarView = () => (
//   <div
//     style={{
//       padding: "16px",
//       textAlign: "center",
//       color: theme.colors.text.disabled,
//       border: `1px solid ${theme.colors.border.DEFAULT}`,
//       borderRadius: theme.radius.md,
//     }}
//   >
//     Calendar View (en construcción)
//   </div>
// );

// // ─── Formik Adapters ───────────────────────────────────────────────────────────
// const FormikTextAdapter = (props: OverrideFieldProps) => (
//   <FormikInput
//     name={props.name}
//     label={props.label || ""}
//     required={props.required}
//     placeholder={props.placeholder}
//     disabled={props.disabled}
//   />
// );

// const FormikDateAdapter = (props: OverrideFieldProps) => {
//   const config = props.config || {};
//   return (
//     <FormikDatePicker
//       name={props.name}
//       label={props.label || ""}
//       type={config.type || "date"}
//       min={config.min}
//       max={config.max}
//       disabled={props.disabled}
//       required={props.required}
//       responsive={props.responsive}
//     />
//   );
// };

// const FormikDateRangeAdapter = (props: OverrideFieldProps) => {
//   const config = props.config || {};
//   return (
//     <FormikDateRange
//       nameFrom={config.nameFrom || props.name + "_from"}
//       nameTo={config.nameTo || props.name + "_to"}
//       labelFrom={config.labelFrom}
//       labelTo={config.labelTo}
//       min={config.min}
//       max={config.max}
//       disabled={props.disabled}
//       required={props.required}
//       label={props.label}
//       responsive={props.responsive}
//     />
//   );
// };

// const FormikNumberDirectAdapter = (props: OverrideFieldProps) => {
//   const config = props.config || {};
//   return (
//     <FormikNumberDirect
//       name={props.name}
//       label={props.label || ""}
//       min={config.min}
//       max={config.max}
//       step={config.step}
//       decimals={config.decimals}
//       prefix={config.prefix}
//       suffix={config.suffix}
//       showStepper={config.showStepper}
//       disabled={props.disabled}
//       required={props.required}
//       placeholder={props.placeholder}
//       responsive={props.responsive}
//     />
//   );
// };

// const FormikSliderAdapter = (props: OverrideFieldProps) => {
//   const config = props.config || {};
//   return (
//     <FormikSlider
//       name={props.name}
//       label={props.label || ""}
//       min={config.min ?? 0}
//       max={config.max ?? 100}
//       step={config.step ?? 1}
//       unit={config.unit}
//       showTooltip={config.showTooltip}
//       marks={config.marks}
//       disabled={props.disabled}
//       required={props.required}
//       responsive={props.responsive}
//     />
//   );
// };

// const FormikSelectAdapter = (props: OverrideSelectProps) => (
//   <FormikAutocomplete
//     name={props.name}
//     label={props.label || ""}
//     disabled={props.disabled}
//     options={props.options || []}
//     idKey={props.config?.keyId || "id"}
//     labelKey={props.config?.keyLabel || "name"}
//   />
// );

// const FormikFileAdapter = (props: OverrideFieldProps) => (
//   <FormikFileInput name={props.name} label={props.label || ""} />
// );

// const FormikColorAdapter = (props: OverrideFieldProps) => (
//   <FormikColorPicker
//     name={props.name}
//     label={props.label || ""}
//     required={props.required || false}
//   />
// );

// const FormikPasswordAdapter = (props: OverrideFieldProps) => (
//   <FormikPassword name={props.name} label={props.label || ""} />
// );

// const FormikTextareaAdapter = (props: OverrideFieldProps) => (
//   <FormikTextArea
//     name={props.name}
//     label={props.label || ""}
//     required={props.required || false}
//     placeholder={props.placeholder}
//     rows={props.rows}
//   />
// );

// const FormikNumberAdapter = (props: OverrideFieldProps) => (
//   <FormikNumber name={props.name} label={props.label || ""} />
// );

// const FormikRadioAdapter = (props: OverrideFieldProps) => (
//   <FormikRadio
//     name={props.name}
//     label={props.label || ""}
//     options={props.options || []}
//     idKey={(props.config?.optionIdKey as string) || "id"}
//     labelKey={props.config?.optionLabelKey || "label"}
//   />
// );

// const FormikToggleAdapter = (props: OverrideFieldProps) => (
//   <FormikSwitch name={props.name} label={props.label || ""} />
// );

// const FormikCheckboxAdapter = (props: OverrideFieldProps) => (
//   <FormikCheckbox name={props.name} label={props.label || ""} />
// );

// // ─── DynamicSelectField y DynamicMultipleSelectField ───────────────────────────
// interface DynamicSelectFieldProps {
//   field: FieldItem;
//   responsive: ResponsiveSizes;
//   onChange?: (value: any) => void;
//   onInput?: (value: string) => void;
//   caseTransform?: CaseTransform;
// }

// const DynamicSelectField = memo(
//   ({
//     field,
//     responsive,
//     onChange,
//     onInput,
//     caseTransform,
//   }: DynamicSelectFieldProps) => {
//     const hookResult = field.selectOptionsHook!();
//     const isLoadingOptions = field.loadingHook?.() || false;
//     const [isAsync, setIsAsync] = useState(false);
//     const [asyncOptions, setAsyncOptions] = useState<any[]>([]);

//     useEffect(() => {
//       const checkAsync = async () => {
//         try {
//           const result = hookResult;
//           const isPromise =
//             result && typeof (result as any).then === "function";
//           setIsAsync(isPromise);
//           if (isPromise) {
//             const data = await (result as Promise<any[]>);
//             setAsyncOptions(Array.isArray(data) ? data : []);
//           } else {
//             setAsyncOptions(Array.isArray(result) ? result : []);
//           }
//         } catch (error) {
//           console.error("Error loading select options:", error);
//           setAsyncOptions([]);
//         }
//       };
//       checkAsync();
//     }, [hookResult]);

//     const options = isAsync
//       ? asyncOptions
//       : Array.isArray(hookResult)
//         ? hookResult
//         : (field.selectOptions ?? []);
//     const refreshFn = useCallback(async (): Promise<void> => {
//       if (field.refreshActionHook) {
//         await Promise.resolve(field.refreshActionHook());
//       }
//     }, [field.refreshActionHook]);
//     const addFn = field.addActionHook?.();

//     return (
//       <FormikAutocomplete
//         name={field.name}
//         label={field.label}
//         options={options}
//         idKey={field.selectIdKey || "id"}
//         labelKey={field.selectLabelKey || "label"}
//         responsive={responsive}
//         onRefresh={refreshFn}
//         onAdd={addFn}
//         loading={isLoadingOptions}
//         onSelect={(selectedItem) => {
//           onChange?.(selectedItem);
//         }}
//         onInput={onInput}
//         caseTransform={caseTransform}
//       />
//     );
//   },
// );
// DynamicSelectField.displayName = "DynamicSelectField";

// interface DynamicMultipleSelectFieldProps {
//   field: FieldItem;
//   responsive: ResponsiveSizes;
//   onChange?: (value: any) => void;
//   caseTransform?: CaseTransform;
// }

// const DynamicMultipleSelectField = memo(
//   ({ field, responsive, onChange }: DynamicMultipleSelectFieldProps) => {
//     const hookResult = field.selectOptionsHook!();
//     const isLoadingOptions = field.loadingHook?.() || false;
//     const [isAsync, setIsAsync] = useState(false);
//     const [asyncOptions, setAsyncOptions] = useState<any[]>([]);

//     useEffect(() => {
//       const checkAsync = async () => {
//         try {
//           const result = hookResult;
//           const isPromise =
//             result && typeof (result as any).then === "function";
//           setIsAsync(isPromise);
//           if (isPromise) {
//             const data = await (result as Promise<any[]>);
//             setAsyncOptions(Array.isArray(data) ? data : []);
//           } else {
//             setAsyncOptions(Array.isArray(result) ? result : []);
//           }
//         } catch (error) {
//           console.error("Error loading multiple select options:", error);
//           setAsyncOptions([]);
//         }
//       };
//       checkAsync();
//     }, [hookResult]);

//     const options = isAsync
//       ? asyncOptions
//       : Array.isArray(hookResult)
//         ? hookResult
//         : (field.selectOptions ?? []);

//     const selectOptions = options.map((opt) => ({
//       value: opt[field.selectIdKey || "id"],
//       label: opt[field.selectLabelKey || "name"],
//     }));

// const refreshFn = async () => {
//   if (field.refreshActionHook) {
//     await field.refreshActionHook();
//   }
// };    const addFn = field.addActionHook?.();

//     return (
//       <FormikMultiSelect
//         name={field.name}
//         label={field.label}
//         options={selectOptions}
//         loading={isLoadingOptions}
//         disabled={field.disabled}
//         required={field.required}
//         placeholder={field.placeholder}
//         responsive={responsive}
//         onRefresh={refreshFn}
//         onAdd={addFn}
//         onChange={(newValue, formik) => {
//           if (field.onChange) field.onChange(newValue, formik, undefined);
//         }}
//       />
//     );
//   },
// );
// DynamicMultipleSelectField.displayName = "DynamicMultipleSelectField";

// // ─── FieldWrapper ──────────────────────────────────────────────────────────────
// const FieldWrapper = ({
//   field,
//   actionsDispatch,
// }: {
//   field: FieldItem;
//   actionsDispatch?: any;
// }) => {
//   const formik = useFormikContext();
//   const responsive = field.responsive || DEFAULT_RESPONSIVE;

//   const caseTransform =
//     field.caseTransform || (field.uppercase ? "uppercase" : "none");

//   const processValue = useCallback(
//     (value: any) => {
//       if (value === undefined || value === null) return value;
//       let processed = value;
//       if (typeof processed === "string") {
//         if (caseTransform === "uppercase") processed = processed.toUpperCase();
//         if (caseTransform === "lowercase") processed = processed.toLowerCase();
//       }
//       if (field.transform) processed = field.transform(processed);
//       return processed;
//     },
//     [caseTransform, field.transform],
//   );

//   const handleSelectChange = useCallback(
//     (selectedItem: any) => {
//       const idKey = field.selectIdKey || "id";
//       const idValue = selectedItem?.[idKey];
//       if (field.onChange) field.onChange(selectedItem, formik, actionsDispatch);
//       formik.setFieldValue(field.name, idValue);
//     },
//     [field, formik, actionsDispatch],
//   );

//   const handleChange = useCallback(
//     (rawValue: any) => {
//       const processed = processValue(rawValue);
//       if (field.onChange) field.onChange(processed, formik, actionsDispatch);
//       formik.setFieldValue(field.name, processed);
//     },
//     [field, formik, actionsDispatch, processValue],
//   );

//   const handleInput = useCallback(
//     (rawValue: any) => {
//       const processed = processValue(rawValue);
//       if (field.onInput) field.onInput(processed, formik, actionsDispatch);
//     },
//     [field, formik, actionsDispatch, processValue],
//   );

//   const isHidden = useMemo(() => {
//     if (field.hidden === undefined) return false;
//     if (typeof field.hidden === "function") {
//       return field.hidden(formik.values);
//     }
//     return field.hidden;
//   }, [field.hidden, formik.values]);

//   if (isHidden) return null;

//   const commonProps = {
//     name: field.name,
//     label: field.label,
//     disabled: field.disabled,
//     required: field.required,
//     responsive,
//     onBlur: () => formik.setFieldTouched(field.name, true),
//   };

//   switch (field.typeField) {
//     case "Text":
//       return (
//         <FormikInput
//           {...commonProps}
//           type={(field.type as any) || "text"}
//           caseTransform={caseTransform}
//           onChange={handleChange}
//           responsive={responsive}
//           onInput={handleInput}
//         />
//       );
//     case "TextArea":
//       return (
//         <FormikTextArea
//           {...commonProps}
//           rows={field.textareaConfig?.rows}
//           caseTransform={caseTransform}
//           onChange={handleChange}
//           responsive={responsive}
//           onInput={handleInput}
//         />
//       );
//     case "Select":
//       if (field.selectOptionsHook) {
//         if (field.multiple) {
//           return (
//             <DynamicMultipleSelectField
//               field={field}
//               responsive={responsive}
//               onChange={handleSelectChange}
//             />
//           );
//         }
//         return (
//           <DynamicSelectField
//             field={field}
//             responsive={responsive}
//             onChange={handleSelectChange}
//             onInput={handleInput}
//             caseTransform={caseTransform}
//           />
//         );
//       }
//       if (field.multiple) {
//         const selectOptions = (field.selectOptions || []).map((opt) => ({
//           value: opt[field.selectIdKey || "id"],
//           label: opt[field.selectLabelKey || "name"],
//         }));
//         return (
//           <FormikMultiSelect
//             name={field.name}
//             label={field.label}
//             options={selectOptions}
//             loading={field.loadingHook?.()}
//             disabled={field.disabled}
//             required={field.required}
//             placeholder={field.placeholder}
//             responsive={responsive}
//           />
//         );
//       }
//       return (
//         <FormikAutocomplete
//           {...commonProps}
//           options={field.selectOptions || []}
//           idKey={field.selectIdKey || "id"}
//           labelKey={field.selectLabelKey || "label"}
//           onSelect={handleSelectChange}
//           onInput={handleInput}
//           responsive={responsive}
//           caseTransform={caseTransform}
//         />
//       );
//     case "Number":
//       return (
//         <FormikNumber
//           {...commonProps}
//           min={field.numberConfig?.min}
//           responsive={responsive}
//           max={field.numberConfig?.max}
//           step={field.numberConfig?.step}
//           decimals={field.numberConfig?.decimals}
//           onChange={handleChange}
//         />
//       );
//     case "Toggle":
//       return (
//         <FormikSwitch
//           {...commonProps}
//           responsive={responsive}
//           onChange={(checked) => handleChange(checked)}
//         />
//       );
//     case "Checkbox":
//       return (
//         <FormikCheckbox
//           {...commonProps}
//           responsive={responsive}
//           onChange={(checked) => handleChange(checked)}
//         />
//       );
//     case "Password":
//       return <FormikPassword {...commonProps} responsive={responsive} />;
//     case "Radio":
//       return (
//         <FormikRadio
//           {...commonProps}
//           responsive={responsive}
//           options={field.radioConfig?.options || []}
//           idKey={field.radioConfig?.optionIdKey || "id"}
//           labelKey={field.radioConfig?.optionLabelKey || "label"}
//           onChange={handleChange}
//         />
//       );
//     case "Date":
//       return (
//         <FormikDatePicker
//           {...commonProps}
//           responsive={responsive}
//           type={field.dateConfig?.type || "date"}
//           min={field.dateConfig?.min}
//           max={field.dateConfig?.max}
//           onChange={(value, formik) => {
//             if (field.onChange) field.onChange(value, formik, actionsDispatch);
//           }}
//         />
//       );
//     case "DateRange":
//       return (
//         <FormikDateRange
//           responsive={responsive}
//           nameFrom={field.dateRangeConfig?.nameFrom || field.name + "_from"}
//           nameTo={field.dateRangeConfig?.nameTo || field.name + "_to"}
//           labelFrom={field.dateRangeConfig?.labelFrom}
//           labelTo={field.dateRangeConfig?.labelTo}
//           min={field.dateRangeConfig?.min}
//           max={field.dateRangeConfig?.max}
//           label={field.label}
//           disabled={field.disabled}
//           required={field.required}
//           onChange={(from, to, formik) => {
//             if (field.onChange)
//               field.onChange({ from, to }, formik, actionsDispatch);
//           }}
//         />
//       );
//     case "NumberDirect":
//       return (
//         <FormikNumberDirect
//           {...commonProps}
//           min={field.numberDirectConfig?.min}
//           max={field.numberDirectConfig?.max}
//           step={field.numberDirectConfig?.step}
//           decimals={field.numberDirectConfig?.decimals}
//           prefix={field.numberDirectConfig?.prefix}
//           suffix={field.numberDirectConfig?.suffix}
//           showStepper={field.numberDirectConfig?.showStepper}
//           placeholder={field.placeholder}
//           responsive={responsive}
//           onChange={(value, formik) => {
//             if (field.onChange) field.onChange(value, formik, actionsDispatch);
//           }}
//         />
//       );
//     case "Slider":
//       return (
//         <FormikSlider
//           {...commonProps}
//           min={field.sliderConfig?.min ?? 0}
//           max={field.sliderConfig?.max ?? 100}
//           step={field.sliderConfig?.step ?? 1}
//           unit={field.sliderConfig?.unit}
//           showTooltip={field.sliderConfig?.showTooltip}
//           marks={field.sliderConfig?.marks}
//           responsive={responsive}
//           onChange={(value, formik) => {
//             if (field.onChange) field.onChange(value, formik, actionsDispatch);
//           }}
//         />
//       );
//     case "Color":
//       return (
//         <FormikColorPicker
//           responsive={responsive}
//           {...commonProps}
//           onChange={handleChange}
//         />
//       );
//     case "File":
//       return (
//         <FormikFileInput
//           responsive={responsive}
//           {...commonProps}
//           {...field.fileConfig}
//           onChange={handleChange}
//         />
//       );
//     case "Array":
//       return (
//         <FormikArrayTable
//           name={field.name}
//           label={field.label}
//           fields={field.arrayConfig?.fields || []}
//           allowAdd={field.arrayConfig?.allowAdd}
//           allowRemove={field.arrayConfig?.allowRemove}
//           addButtonLabel={field.arrayConfig?.addButtonLabel}
//           itemLabel={field.arrayConfig?.itemLabel}
//           disabled={field.disabled}
//           responsive={responsive}
//         />
//       );
//     default:
//       return (
//         <FormikInput
//           {...commonProps}
//           type="text"
//           responsive={responsive}
//           caseTransform={caseTransform}
//           onChange={handleChange}
//           onInput={handleInput}
//         />
//       );
//   }
// };

// // ─── StepperFormLocal — diseño mejorado + soporte para boxes (con theme) ───────
// interface StepperFormLocalProps {
//   sections: Array<{
//     title: string;
//     items: Array<
//       | { kind: "field"; field: FieldItem }
//       | {
//           kind: "component";
//           componentName: string;
//           responsive?: ResponsiveSizes;
//           props?: Record<string, any>;
//         }
//       | { kind: "box"; title: string; fields: FieldItem[] }
//     >;
//   }>;
//   activeStep: number;
//   hideNavButtons?: boolean;
//   onStepChange: (idx: number) => void;
//   renderField: (field: FieldItem) => React.ReactNode;
//   renderComponent: (
//     componentName: string,
//     responsive?: ResponsiveSizes,
//     props?: Record<string, any>,
//   ) => React.ReactNode;
// }

// export interface StepperNavHandle {
//   tryNext: () => Promise<void>;
//   trySave: () => Promise<void>;
// }

// export interface BoxNavHandle {
//   trySave: () => Promise<void>;
// }

// const StepperFormLocal = React.forwardRef<
//   StepperNavHandle,
//   StepperFormLocalProps
// >(
//   (
//     {
//       sections,
//       activeStep,
//       onStepChange,
//       renderField,
//       renderComponent,
//       hideNavButtons = false,
//     },
//     ref,
//   ) => {
//     const formik = useFormikContext();
//     const currentSection = sections[activeStep];
//     const isLast = activeStep === sections.length - 1;

//     const handleNext = useCallback(async () => {
//       let currentFieldNames: string[] = [];
//       if (currentSection?.items) {
//         currentFieldNames = currentSection.items
//           .filter((item) => item.kind === "field")
//           .map(
//             (item) => (item as { kind: "field"; field: FieldItem }).field.name,
//           );
//       }
//       const touchedPatch = currentFieldNames.reduce(
//         (acc: any, name) => ({ ...acc, [name]: true }),
//         {},
//       );
//       await formik.setTouched({ ...formik.touched, ...touchedPatch });
//       const errors = await formik.validateForm();
//       const hasErrors = currentFieldNames.some((name) => errors[name]);
//       if (!hasErrors) onStepChange(activeStep + 1);
//     }, [activeStep, currentSection, formik, onStepChange]);

//     const handleSave = useCallback(async () => {
//       const allFields = sections.flatMap((s) =>
//         s.items
//           .filter((i) => i.kind === "field")
//           .map((i) => (i as { kind: "field"; field: FieldItem }).field),
//       );
//       const allTouched = allFields.reduce(
//         (acc: any, f: FieldItem) => ({ ...acc, [f.name]: true }),
//         {},
//       );
//       await formik.setTouched(allTouched);
//       await formik.submitForm();
//     }, [sections, formik]);

//     useImperativeHandle(
//       ref,
//       () => ({ tryNext: handleNext, trySave: handleSave }),
//       [handleNext, handleSave],
//     );

//     const primaryColor = theme.colors.primary.DEFAULT;
//     const primaryLight = theme.colors.feedback.primaryLight;
//     const borderColor = theme.colors.border.DEFAULT;

//     return (
//       <div className="flex flex-col w-full">
//         <div className="relative px-2 pt-2">
//           <div
//             className="absolute h-0.5 bg-gray-200"
//             style={{
//               top: "calc(1.25rem + 0.5rem)",
//               left: `calc(${100 / (sections.length * 2)}% + 0.5rem)`,
//               right: `calc(${100 / (sections.length * 2)}% + 0.5rem)`,
//               zIndex: 0,
//             }}
//           />
//           <div
//             className="absolute h-0.5 transition-all duration-500 ease-in-out"
//             style={{
//               top: "calc(1.25rem + 0.5rem)",
//               left: `calc(${100 / (sections.length * 2)}% + 0.5rem)`,
//               width:
//                 sections.length <= 1
//                   ? "0%"
//                   : `calc(${
//                       (activeStep / (sections.length - 1)) *
//                       (100 - 100 / sections.length)
//                     }% - 1rem)`,
//               zIndex: 1,
//               background: primaryColor,
//             }}
//           />
//           <div className="relative flex justify-between" style={{ zIndex: 2 }}>
//             {sections.map((s, idx) => {
//               const isDone = idx < activeStep;
//               const isCurrent = idx === activeStep;
//               return (
//                 <button
//                   key={s.title}
//                   type="button"
//                   onClick={() => isDone && onStepChange(idx)}
//                   className="flex flex-col items-center gap-1.5 flex-1"
//                   style={{
//                     cursor: isDone ? "pointer" : "default",
//                     background: "none",
//                     border: "none",
//                     padding: 0,
//                   }}
//                 >
//                   <div
//                     className={`
//                       relative flex items-center justify-center
//                       w-10 h-10 rounded-full border-2 font-semibold text-sm
//                       transition-all duration-300
//                     `}
//                     style={{
//                       background: isDone
//                         ? primaryColor
//                         : isCurrent
//                           ? theme.colors.background.card
//                           : theme.colors.background.card,
//                       borderColor: isDone
//                         ? primaryColor
//                         : isCurrent
//                           ? primaryColor
//                           : borderColor,
//                       color: isDone
//                         ? theme.colors.text.inverse
//                         : isCurrent
//                           ? primaryColor
//                           : theme.colors.text.disabled,
//                       boxShadow: isCurrent
//                         ? `0 0 0 4px ${primaryLight}`
//                         : "none",
//                       transform: isCurrent ? "scale(1.1)" : "scale(1)",
//                     }}
//                   >
//                     {isDone ? (
//                       <svg
//                         className="w-5 h-5"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 11.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     ) : (
//                       <span>{idx + 1}</span>
//                     )}
//                   </div>
//                   <span
//                     className="text-xs font-medium text-center leading-tight max-w-[72px] transition-colors duration-200 select-none"
//                     style={{
//                       color: isCurrent
//                         ? primaryColor
//                         : isDone
//                           ? primaryColor
//                           : theme.colors.text.disabled,
//                     }}
//                   >
//                     {s.title}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div
//           style={{
//             borderRadius: theme.radius.lg,
//             border: `1px solid ${borderColor}`,
//             background: theme.colors.background.card,
//             boxShadow: theme.shadows.sm,
//             overflow: "hidden",
//             marginTop: "16px",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//               padding: "12px 20px",
//               background: `linear-gradient(135deg, ${primaryColor} 0%, ${theme.colors.primary[700] || "#7D1B35"} 100%)`,
//               borderBottom: `1px solid ${borderColor}`,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: "24px",
//                 height: "24px",
//                 borderRadius: "50%",
//                 background: primaryLight,
//                 color: primaryColor,
//                 fontSize: theme.typography.fontSize.xs,
//                 fontWeight: "bold",
//                 flexShrink: 0,
//               }}
//             >
//               {activeStep + 1}
//             </div>
//             <span
//               style={{
//                 fontSize: theme.typography.fontSize.base,
//                 fontWeight: 600,
//                 color: "#FFFFFF",
//                 letterSpacing: "0.3px",
//               }}
//             >
//               {currentSection.title}
//             </span>
//             <span
//               style={{
//                 marginLeft: "auto",
//                 fontSize: theme.typography.fontSize.xs,
//                 color: theme.colors.text.disabled,
//               }}
//             >
//               {activeStep + 1} / {sections.length}
//             </span>
//           </div>

//           <div className="p-5">
//             {currentSection.items.map((item, idx) => {
//               if (item.kind === "field") {
//                 return renderField(item.field);
//               }
//               if (item.kind === "component") {
//                 return renderComponent(
//                   item.componentName,
//                   item.responsive,
//                   item.props,
//                 );
//               }
//               if (item.kind === "box") {
//                 return (
//                   <div
//                     key={`box-${idx}`}
//                     style={{
//                       marginBottom: "24px",
//                       background: theme.colors.background.page,
//                       borderRadius: theme.radius.lg,
//                       border: `1px solid ${theme.colors.border.light}`,
//                       boxShadow: theme.shadows.sm,
//                       overflow: "hidden",
//                     }}
//                   >
//                     <div className="px-5 pt-4 pb-2">
//                       <h4
//                         style={{
//                           fontSize: theme.typography.fontSize.sm,
//                           fontWeight: 600,
//                           color: primaryColor,
//                           textTransform: "uppercase",
//                           letterSpacing: "0.04em",
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "8px",
//                         }}
//                       >
//                         <span
//                           style={{
//                             width: "6px",
//                             height: "6px",
//                             background: primaryColor,
//                             borderRadius: "50%",
//                           }}
//                         ></span>
//                         {item.title}
//                       </h4>
//                     </div>
//                     <div className="px-5 pb-5">
//                       <RowComponent>
//                         {item.fields.map(renderField)}
//                       </RowComponent>
//                     </div>
//                   </div>
//                 );
//               }
//               return null;
//             })}
//           </div>
//         </div>

//         {!hideNavButtons && (
//           <div className="flex items-center justify-between mt-4">
//             <button
//               type="button"
//               disabled={activeStep === 0}
//               onClick={() => onStepChange(activeStep - 1)}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 padding: "8px 16px",
//                 borderRadius: theme.radius.md,
//                 fontSize: theme.typography.fontSize.sm,
//                 fontWeight: 500,
//                 border: `1px solid ${borderColor}`,
//                 background:
//                   activeStep === 0
//                     ? theme.colors.background.surface
//                     : theme.colors.background.card,
//                 color:
//                   activeStep === 0
//                     ? theme.colors.text.disabled
//                     : theme.colors.text.secondary,
//                 cursor: activeStep === 0 ? "not-allowed" : "pointer",
//               }}
//             >
//               <svg
//                 className="w-4 h-4"
//                 viewBox="0 0 20 20"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 5l-7 5 7 5"
//                 />
//               </svg>
//               Atrás
//             </button>

//             <div className="flex items-center gap-1.5">
//               {sections.map((_, idx) => (
//                 <div
//                   key={idx}
//                   style={{
//                     borderRadius: "9999px",
//                     transition: theme.transitions.DEFAULT,
//                     width: idx === activeStep ? "20px" : "8px",
//                     height: "8px",
//                     background:
//                       idx === activeStep
//                         ? primaryColor
//                         : idx < activeStep
//                           ? primaryColor
//                           : borderColor,
//                   }}
//                 />
//               ))}
//             </div>

//             {isLast ? (
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 disabled={formik.isSubmitting}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   padding: "8px 20px",
//                   borderRadius: theme.radius.md,
//                   fontSize: theme.typography.fontSize.sm,
//                   fontWeight: 600,
//                   background: primaryColor,
//                   color: theme.colors.text.inverse,
//                   border: "none",
//                   cursor: formik.isSubmitting ? "not-allowed" : "pointer",
//                   opacity: formik.isSubmitting ? 0.6 : 1,
//                 }}
//               >
//                 {formik.isSubmitting ? "Guardando…" : "Guardar"}
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={handleNext}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   padding: "8px 16px",
//                   borderRadius: theme.radius.md,
//                   fontSize: theme.typography.fontSize.sm,
//                   fontWeight: 500,
//                   background: primaryColor,
//                   color: theme.colors.text.inverse,
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Siguiente
//                 <svg
//                   className="w-4 h-4"
//                   viewBox="0 0 20 20"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M8 5l7 5-7 5"
//                   />
//                 </svg>
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   },
// );

// StepperFormLocal.displayName = "StepperFormLocal";

// // ─── BoxFormLocal (con theme) ─────────────────────────────────────────────────
// interface BoxFormLocalProps {
//   sections: Array<{
//     title: string;
//     items: Array<
//       | { kind: "field"; field: FieldItem }
//       | {
//           kind: "component";
//           componentName: string;
//           responsive?: ResponsiveSizes;
//           props?: Record<string, any>;
//         }
//       | { kind: "box"; title: string; fields: FieldItem[] }
//     >;
//   }>;
//   renderField: (field: FieldItem) => React.ReactNode;
//   renderComponent: (
//     componentName: string,
//     responsive?: ResponsiveSizes,
//     props?: Record<string, any>,
//   ) => React.ReactNode;
//   hideSubmitButton?: boolean;
// }

// const BoxFormLocal = React.forwardRef<BoxNavHandle, BoxFormLocalProps>(
//   (
//     { sections, renderField, renderComponent, hideSubmitButton = false },
//     ref,
//   ) => {
//     const formik = useFormikContext();

//     const handleSave = useCallback(async () => {
//       const allFields = sections.flatMap((s) =>
//         s.items
//           .filter((i) => i.kind === "field")
//           .map((i) => (i as { kind: "field"; field: FieldItem }).field),
//       );
//       const allTouched = allFields.reduce(
//         (acc: any, f: FieldItem) => ({ ...acc, [f.name]: true }),
//         {},
//       );
//       await formik.setTouched({ ...formik.touched, ...allTouched });
//       const errors = await formik.validateForm();
//       if (Object.keys(errors).length === 0) {
//         await formik.submitForm();
//       }
//     }, [sections, formik]);

//     useImperativeHandle(ref, () => ({ trySave: handleSave }), [handleSave]);

//     const primaryColor = theme.colors.primary.DEFAULT;
//     const primaryLight = theme.colors.feedback.primaryLight;

//     return (
//       <div>
//         {sections.map((section) => (
//           <div
//             key={section.title}
//             style={{
//               border: `1px solid ${theme.colors.border.DEFAULT}`,
//               borderRadius: theme.radius.md,
//               background: theme.colors.background.card,
//               padding: "16px",
//               marginBottom: "24px",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: theme.typography.fontSize.base,
//                 fontWeight: 600,
//                 color: primaryColor,
//                 marginBottom: "16px",
//                 borderBottom: `2px solid ${primaryLight}`,
//                 paddingBottom: "6px",
//               }}
//             >
//               {section.title}
//             </div>
//             <RowComponent>
//               {section.items.map((item, idx) => {
//                 if (item.kind === "field") {
//                   return renderField(item.field);
//                 }
//                 if (item.kind === "component") {
//                   return renderComponent(
//                     item.componentName,
//                     item.responsive,
//                     item.props,
//                   );
//                 }
//                 if (item.kind === "box") {
//                   return (
//                     <div
//                       key={`box-${idx}`}
//                       style={{
//                         marginBottom: "24px",
//                         background: theme.colors.background.page,
//                         borderRadius: theme.radius.lg,
//                         border: `1px solid ${theme.colors.border.light}`,
//                         boxShadow: theme.shadows.sm,
//                         overflow: "hidden",
//                       }}
//                     >
//                       <div className="px-5 pt-4 pb-2">
//                         <h4
//                           style={{
//                             fontSize: theme.typography.fontSize.sm,
//                             fontWeight: 600,
//                             color: primaryColor,
//                             textTransform: "uppercase",
//                             letterSpacing: "0.04em",
//                             display: "flex",
//                             alignItems: "center",
//                             gap: "8px",
//                           }}
//                         >
//                           <span
//                             style={{
//                               width: "6px",
//                               height: "6px",
//                               background: primaryColor,
//                               borderRadius: "50%",
//                             }}
//                           />
//                           {item.title}
//                         </h4>
//                       </div>
//                       <div className="px-5 pb-5">
//                         <RowComponent>
//                           {item.fields.map(renderField)}
//                         </RowComponent>
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               })}
//             </RowComponent>
//           </div>
//         ))}
//         {!hideSubmitButton && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               marginTop: "16px",
//             }}
//           >
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={formik.isSubmitting}
//               style={{
//                 padding: "8px 24px",
//                 background: primaryColor,
//                 color: theme.colors.text.inverse,
//                 border: "none",
//                 borderRadius: theme.radius.md,
//                 cursor: formik.isSubmitting ? "not-allowed" : "pointer",
//                 fontWeight: 600,
//               }}
//             >
//               {formik.isSubmitting ? "Guardando…" : "Guardar"}
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   },
// );

// BoxFormLocal.displayName = "BoxFormLocal";

// // ─── RenderFormContent (adaptado) ──────────────────────────────────────────────
// interface RenderFormContentProps {
//   computedFields: FieldItem[];
//   sectioned: {
//     hasSections: boolean;
//     sectionType: string | null;
//     sections: Array<{
//       title: string;
//       items: Array<
//         | { kind: "field"; field: FieldItem }
//         | {
//             kind: "component";
//             componentName: string;
//             responsive?: ResponsiveSizes;
//             props?: Record<string, any>;
//           }
//         | { kind: "box"; title: string; fields: FieldItem[] }
//       >;
//     }>;
//   };
//   activeStep: number;
//   setActiveStep: (step: number) => void;
//   renderField: (field: FieldItem) => React.ReactNode;
//   renderComponent: (
//     componentName: string,
//     responsive?: ResponsiveSizes,
//     props?: Record<string, any>,
//   ) => React.ReactNode;
//   stepperRef?: React.RefObject<StepperNavHandle>;
//   boxRef?: React.RefObject<BoxNavHandle>;
//   hideNavButtons?: boolean;
// }

// const RenderFormContent = ({
//   computedFields,
//   sectioned,
//   activeStep,
//   setActiveStep,
//   renderField,
//   renderComponent,
//   stepperRef,
//   boxRef,
//   hideNavButtons = false,
// }: RenderFormContentProps) => {
//   if (!sectioned.hasSections) {
//     return <RowComponent>{computedFields.map(renderField)}</RowComponent>;
//   }
//   if (sectioned.sectionType === "stepper") {
//     return (
//       <StepperFormLocal
//         ref={stepperRef}
//         sections={sectioned.sections}
//         activeStep={activeStep}
//         onStepChange={setActiveStep}
//         renderField={renderField}
//         renderComponent={renderComponent}
//         hideNavButtons={hideNavButtons}
//       />
//     );
//   }
//   // Modo box: pasa las secciones tal cual (ya tienen items que BoxFormLocal sabe procesar)
//   return (
//     <BoxFormLocal
//       ref={boxRef}
//       sections={sectioned.sections}
//       renderField={renderField}
//       renderComponent={renderComponent}
//       hideSubmitButton={hideNavButtons}
//     />
//   );
// };

// // =============================================================================
// // ====================== COMPONENTE PRINCIPAL CompositeCrud ====================
// // =============================================================================
// const CompositeCrud = <
//   TForm extends object,
//   TTable extends object = TForm,
//   THooks extends Record<string, any> = Record<string, any>,
// >({
//   hook,
//   formTitles,
//   fields: manualFields,
//   crudConfig,
//   advancedConfig,
//   mobileListTile,
//   mobileQuickFilters,
//   enableMobileViews = true,
//   actionsDispatch,
// }: PropsCrud<TForm, TTable, THooks>) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState<TForm | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showDashboard, setShowDashboard] = useState(false);
//   const [showAudit, setShowAudit] = useState(false);
//   const [activeFilterCount, setActiveFilterCount] = useState(0);
//   const stepperRef = useRef<StepperNavHandle>(null);
//   const boxRef = useRef<BoxNavHandle>(null);
//   const isAdvanced = !!(hook as any).search !== undefined;
//   const advancedHook = hook as any;

//   const filtersKey = useMemo(
//     () => JSON.stringify(advancedHook.filters || {}),
//     [advancedHook.filters],
//   );
//   useEffect(() => {
//     let count = 0;
//     if (advancedHook.filters) {
//       count = Object.values(advancedHook.filters).filter(
//         (v) => v != null && v !== "" && v !== "all",
//       ).length;
//     }
//     if (advancedHook.search) count++;
//     setActiveFilterCount(count);
//   }, [filtersKey, advancedHook.search]);

//   // ── Computed fields ────────────────────────────────────────────────────────
//   const computedFields = useMemo((): FieldItem[] => {
//     if (crudConfig) {
//       const {
//         textFields,
//         selectFields,
//         fileFields,
//         colorFields,
//         passwordFields,
//         textareaFields,
//         numberFields,
//         radioFields,
//         toggleFields,
//         checkboxFields,
//         textConfigs,
//         selectConfigs,
//         fileConfigs,
//         colorConfigs,
//         passwordConfigs,
//         textareaConfigs,
//         numberConfigs,
//         radioConfigs,
//         toggleConfigs,
//         checkboxConfigs,
//         uiLayout,
//         dateFields,
//         dateRangeFields,
//         numberDirectFields,
//         sliderFields,
//         dateConfigs,
//         dateRangeConfigs,
//         numberDirectConfigs,
//         sliderConfigs,
//         arrayFields,
//         arrayConfigs,
//       } = crudConfig;

//       const fieldsMap = new Map<string, FieldItem>();

//       const addField = (
//         name: string,
//         typeField: FieldItem["typeField"],
//         config: any,
//       ) => {
//         if (fieldsMap.has(name)) return;

//         let label = "";
//         if (config.label) {
//           label = config.required ? `${config.label} *` : config.label;
//         } else {
//           label = config.required ? `${name} *` : name;
//         }

//         const baseField: FieldItem = {
//           name,
//           label,
//           typeField,
//           multiple: config.multiple,
//           disabled: config.disabled || false,
//           placeholder: config.placeholder || "",
//           required: config.required || false,
//           headerName: config.label || name,
//           responsive: config.responsive || DEFAULT_RESPONSIVE,
//           caseTransform: config.caseTransform,
//           uppercase: config.uppercase,
//           transform: config.transform,
//           onChange: config.onChange,
//           onInput: config.onInput,
//           hidden: config.hidden,
//         };
//         switch (typeField) {
//           case "Text":
//             baseField.type = config.type;
//             break;
//           case "Select":
//             baseField.selectOptions = config.options;
//             baseField.multiple = config.multiple;
//             baseField.selectIdKey = config.keyId;
//             baseField.selectLabelKey = config.keyLabel;
//             baseField.selectOptionsHook = config.selectOptionsHook;
//             baseField.refreshActionHook = config.refreshActionHook;
//             baseField.addActionHook = config.addActionHook;
//             baseField.loadingHook = config.loadingHook;
//             break;
//           case "File":
//             baseField.fileConfig = config;
//             break;
//           case "Color":
//             baseField.colorConfig = config;
//             break;
//           case "Password":
//             baseField.passwordConfig = config;
//             break;
//           case "TextArea":
//             baseField.textareaConfig = config;
//             break;
//           case "Number":
//             baseField.numberConfig = config;
//             break;
//           case "Radio":
//             baseField.selectIdKey = config.keyId;
//             baseField.selectLabelKey = config.keyLabel;
//             baseField.radioConfig = config;
//             break;
//           case "Array":
//             baseField.arrayConfig = {
//               fields: config.fields || [],
//               allowAdd: config.allowAdd,
//               allowRemove: config.allowRemove,
//               addButtonLabel: config.addButtonLabel,
//               itemLabel: config.itemLabel,
//             };
//             break;
//           default:
//             break;
//         }
//         fieldsMap.set(name, baseField);
//       };

//       textFields?.forEach((f) => addField(f, "Text", textConfigs?.[f] || {}));
//       selectFields?.forEach((f) =>
//         addField(f, "Select", selectConfigs?.[f] || {}),
//       );
//       fileFields?.forEach((f) => addField(f, "File", fileConfigs?.[f] || {}));
//       colorFields?.forEach((f) =>
//         addField(f, "Color", colorConfigs?.[f] || {}),
//       );
//       passwordFields?.forEach((f) =>
//         addField(f, "Password", passwordConfigs?.[f] || {}),
//       );
//       textareaFields?.forEach((f) =>
//         addField(f, "TextArea", textareaConfigs?.[f] || {}),
//       );
//       numberFields?.forEach((f) =>
//         addField(f, "Number", numberConfigs?.[f] || {}),
//       );
//       radioFields?.forEach((f) =>
//         addField(f, "Radio", radioConfigs?.[f] || {}),
//       );
//       toggleFields?.forEach((f) =>
//         addField(f, "Toggle", toggleConfigs?.[f] || {}),
//       );
//       checkboxFields?.forEach((f) =>
//         addField(f, "Checkbox", checkboxConfigs?.[f] || {}),
//       );
//       dateFields?.forEach((f) => addField(f, "Date", dateConfigs?.[f] || {}));
//       dateRangeFields?.forEach((f) =>
//         addField(f, "DateRange", dateRangeConfigs?.[f] || {}),
//       );
//       numberDirectFields?.forEach((f) =>
//         addField(f, "NumberDirect", numberDirectConfigs?.[f] || {}),
//       );
//       sliderFields?.forEach((f) =>
//         addField(f, "Slider", sliderConfigs?.[f] || {}),
//       );
//       arrayFields?.forEach((f) => {
//         const config = arrayConfigs?.[f];
//         if (config) {
//           addField(f, "Array", config);
//         }
//       });
//       let allFields = Array.from(fieldsMap.values());

//       if (uiLayout?.fieldsPerSection) {
//         const orderedNames = Object.values(uiLayout.fieldsPerSection).flatMap(
//           (def: any) =>
//             Array.isArray(def)
//               ? def
//                   .map((item: any) =>
//                     typeof item === "string" ? item : item.fields,
//                   )
//                   .flat()
//               : [],
//         );
//         const orderedFields: FieldItem[] = [];
//         for (const name of orderedNames) {
//           const field = allFields.find((f) => f.name === name);
//           if (field) orderedFields.push(field);
//         }
//         const remainingFields = allFields.filter(
//           (f) => !orderedNames.includes(f.name),
//         );
//         allFields = [...orderedFields, ...remainingFields];
//       }
//       return allFields;
//     }
//     return manualFields || [];
//   }, [crudConfig, manualFields]);

//   const tableColumns = useMemo(() => {
//     if (
//       crudConfig?.tableColumns &&
//       Object.keys(crudConfig.tableColumns).length > 0
//     ) {
//       const cols = crudConfig.tableColumns as Record<string, any>;
    //   return Object.entries(cols).map(([field, config]) => ({
    //     field,
    //     headerName: config.label || field,
    //     renderField: (value: any, row: TTable) =>
    //       config.render ? config.render(value, row, actionsDispatch) : value,
    //     getFilterValue: config.getFilterValue,
    //     filterType: config.filterType,
    //     filterOptions: config.filterOptions,
    //     width: config.width,
    //     minWidth: config.minWidth,
    //     align: config.align,
    //     sortable: config.sortable,
    //     resizable: config.resizable,
    //     groupable: config.groupable,
    //     aggregation: config.aggregation,
    //     visibility: config.visibility,
    //     priority: config.priority,
    //     pinned: config.pinned,
    //     frozen: config.frozen,
    //     editable: config.editable,
    //     tooltip: config.tooltip,
    //     conditionalStyle: config.conditionalStyle,
    //   }));
    //   return cols;
    // }

//     if (computedFields.length > 0) {
//       return computedFields.map((it) => ({
//         field: it.name,
//         headerName: it.headerName || it.label,
//         renderField: (value: any, row: TForm) =>
//           it.renderField ? it.renderField(value, row) : value,
//         getFilterValue: it.getFilterValue,
//       }));
//     }

//     return [];
//   }, [crudConfig, computedFields]);

//   // ── Procesamiento de secciones con soporte para componentes y boxes ───────
//   // ── Procesamiento de secciones con soporte para componentes y boxes ───────
//  const sectioned = useMemo(() => {
//    if (crudConfig?.uiLayout) {
//      const { fieldsPerSection, sections, mode } = crudConfig.uiLayout;
//      const sectionsList = sections.map((sectionName: string) => {
//        const definition = fieldsPerSection?.[sectionName];
//        if (!definition) return { title: sectionName, items: [] };
//        const items: any[] = [];
//        for (const def of definition) {
//          if (typeof def === "string") {
//            const field = computedFields.find((f) => f.name === def);
//            if (field) items.push({ kind: "field", field });
//          } else if (def && typeof def === "object" && "component" in def) {
//            items.push({
//              kind: "component",
//              componentName: def.component,
//              responsive: def.responsive,
//              props: def.props,
//            });
//          } else if (
//            def &&
//            typeof def === "object" &&
//            "title" in def &&
//            "fields" in def
//          ) {
//            if (mode === "stepper") {
//              // En stepper se permite box
//              const fieldsList = computedFields.filter((field) =>
//                (def as any).fields.includes(field.name),
//              );
//              items.push({
//                kind: "box",
//                title: (def as any).title,
//                fields: fieldsList,
//              });
//            } else {
//              // En modo box: aplanamos los fields del box, es decir, los añadimos como items individuales de tipo "field"
//              const fieldsList = computedFields.filter((field) =>
//                (def as any).fields.includes(field.name),
//              );
//              items.push(
//                ...fieldsList.map((field) => ({ kind: "field", field })),
//              );
//            }
//          }
//        }
//        return { title: sectionName, items };
//      });
//      return { hasSections: true, sectionType: mode, sections: sectionsList };
//    }
//    return { hasSections: false, sectionType: null, sections: [] };
//  }, [crudConfig, computedFields]);

//   useEffect(() => {
//     if (!hook.open) setActiveStep(0);
//   }, [hook.open]);

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (hook.isDirty) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [hook.isDirty]);

//   const validationSchema = useMemo(() => {
//     if (!crudConfig?.validationSchema) return undefined;
//     if (typeof crudConfig.validationSchema === "function") {
//       return crudConfig.validationSchema(actionsDispatch || {});
//     }
//     return crudConfig.validationSchema;
//   }, [crudConfig?.validationSchema, actionsDispatch]);

//   const showDeleteConfirmation = useCallback(async (): Promise<boolean> => {
//     const result = await Swal.fire({
//       title: "¿Estás seguro?",
//       text: "Esta acción no se puede deshacer.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: theme.colors.primary.DEFAULT,
//       cancelButtonColor: "#6B7280",
//       confirmButtonText: "Sí, eliminar",
//       cancelButtonText: "Cancelar",
//     });
//     return result.isConfirmed;
//   }, []);

//   const handleDeleteConfirm = async () => {
//     if (itemToDelete) {
//       const confirmed = await showDeleteConfirmation();
//       if (confirmed) {
//         await hook.removeItemData(itemToDelete);
//         setDeleteConfirmOpen(false);
//         setItemToDelete(null);
//         Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
//       }
//     }
//   };

//   const renderField = useCallback(
//     (field: FieldItem): React.ReactNode => {
//       return (
//         <FieldWrapper
//           key={field.name}
//           field={field}
//           actionsDispatch={actionsDispatch}
//         />
//       );
//     },
//     [actionsDispatch],
//   );

//   // ✅ Función renderComponent (necesaria para componentes registrados)
//   const renderComponent = useCallback(
//     (
//       componentName: string,
//       responsive?: ResponsiveSizes,
//       props?: Record<string, any>,
//     ) => {
//       const config = crudConfig?.registeredComponents?.[componentName];
//       if (!config) {
//         console.warn(`Componente registrado "${componentName}" no encontrado`);
//         return null;
//       }
//       const Comp = config.component;
//       const defaultResp = config.defaultResponsive || DEFAULT_RESPONSIVE;
//       const finalResponsive = {
//         sm: responsive?.sm ?? defaultResp.sm ?? 12,
//         md: responsive?.md ?? defaultResp.md ?? 12,
//         lg: responsive?.lg ?? defaultResp.lg ?? 12,
//         xl: responsive?.xl ?? defaultResp.xl ?? 12,
//         "2xl": responsive?.["2xl"] ?? defaultResp["2xl"] ?? 12,
//       };
//       return (
//         <Comp hooks={hook as any} responsive={finalResponsive} {...props} />
//       );
//     },
//     [crudConfig?.registeredComponents, hook],
//   );

//   // ── Mobile config ──────────────────────────────────────────────────────────
//   const buildMobileConfig = useCallback(() => {
//     const mobileCfg = crudConfig?.mobileConfig as
//       | MobileConfig<TTable>
//       | undefined;

//     if (mobileCfg?.enabled === false) return undefined;

//     const finalListTile = mobileListTile ?? mobileCfg?.listTile;
//     const finalQuickFilters = mobileQuickFilters ?? mobileCfg?.quickFilters;

//     let finalSwipeActions: any = mobileCfg?.swipeActions;
//     let generatedSwipe = false;

//     if (!finalSwipeActions) {
//       const tableActions = crudConfig?.tableActions;
//       const isEditingEnabled = tableActions?.isEditing !== false;
//       const isDeleteEnabled = tableActions?.isDelete !== false;

//       const swipeLeft: any[] = [];
//       const swipeRight: any[] = [];

//       if (isEditingEnabled) {
//         swipeLeft.push({
//           icon: <icons.Lu.LuPencilLine size={20} />,
//           color: "bg-orange-500",
//           label: "Editar",
//           action: (row: any) => {
//             const formattedRow = prepareForForm(row);
//             hook.setOpen(true);
//             hook.handleChangeItem(formattedRow);
//           },
//         });
//       }

//       if (isDeleteEnabled) {
//         swipeRight.push({
//           icon: <icons.Lu.LuTrash size={20} />,
//           color: "bg-red-500",
//           label: "Eliminar",
//           action: async (row: any) => {
//             const confirmed = await showDeleteConfirmation();
//             if (confirmed) await hook.removeItemData(row);
//           },
//         });
//       }

//       const moreButtons = tableActions?.moreButtons || [];
//       moreButtons.forEach((btn) => {
//         if (btn.permission === false) return;
//         const action = btn.handleOnClick
//           ? (row: any) => btn.handleOnClick(row)
//           : undefined;
//         if (!action) return;
//         const swipeItem = {
//           icon:
//             typeof btn.icon === "string" ? (
//               <i className={btn.icon} />
//             ) : (
//               btn.icon
//             ),
//           color: btn.color || "bg-gray-500",
//           label: btn.label,
//           action,
//         };
//         swipeRight.push(swipeItem);
//       });

//       if (swipeLeft.length > 0 || swipeRight.length > 0) {
//         finalSwipeActions = { left: swipeLeft, right: swipeRight };
//         generatedSwipe = true;
//       }
//     }

//     if (!finalSwipeActions && !finalListTile && !finalQuickFilters?.enabled) {
//       return undefined;
//     }

//     const defaultListTile = {
//       title: (row: any) => {
//         const firstKey = Object.keys(row)[0];
//         return row[firstKey] || "Registro";
//       },
//       leading: (row: any) => (
//         <div className="w-10 h-10 rounded-full bg-[#9B2242] text-white flex items-center justify-center font-bold">
//           {String(Object.values(row)[0] || "?")
//             .charAt(0)
//             .toUpperCase()}
//         </div>
//       ),
//     };

//     const result: any = {
//       activeViews:
//         mobileCfg?.activeViews !== undefined
//           ? mobileCfg.activeViews
//           : enableMobileViews,
//       listTile: finalListTile || defaultListTile,
//     };
//     if (finalSwipeActions) result.swipeActions = finalSwipeActions;
//     if (finalQuickFilters?.enabled) {
//       result.quickFilters = {
//         enabled: true,
//         filters: finalQuickFilters.filters || [],
//       };
//     } else if (advancedConfig?.filters?.length && !generatedSwipe) {
//       result.quickFilters = {
//         enabled: true,
//         filters: advancedConfig.filters.map((f: any) => ({
//           dataField: f.field,
//           label: f.label,
//           type: f.type || "text",
//         })),
//       };
//     }

//     if (mobileCfg?.bottomSheet) result.bottomSheet = mobileCfg.bottomSheet;
//     return result;
//   }, [
//     crudConfig?.mobileConfig,
//     crudConfig?.tableActions,
//     hook,
//     mobileListTile,
//     mobileQuickFilters,
//     enableMobileViews,
//     advancedConfig,
//     showDeleteConfirmation,
//   ]);

//   // ─── Custom render mode (crudConfig.render) ─────────────────────────────────
//   if (crudConfig?.render) {
//     // ... (código del modo render, que ya tenías) ...
//     // Lo omito por brevedad, pero debe estar igual que antes.
//     // Asegúrate de que en el contexto se pasen registeredComponents y globalTypeOverrides.
//   }

//   // ─── Default render ──────────────────────────────────────────────────────────
//   const mobileConfigValue = buildMobileConfig();

//   const buildSectionedModalFooter = useCallback((): React.ReactNode => {
//     if (!sectioned.hasSections) return undefined;

//     const primaryColor = theme.colors.primary.DEFAULT;
//     const borderColor = theme.colors.border.DEFAULT;

//     if (sectioned.sectionType === "stepper") {
//       const isFirst = activeStep === 0;
//       const isLast = activeStep === sectioned.sections.length - 1;

//       return (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: "12px 20px",
//             borderTop: `1px solid ${borderColor}`,
//             background: theme.colors.background.surface,
//             gap: "12px",
//           }}
//         >
//           <button
//             type="button"
//             disabled={isFirst}
//             onClick={() => setActiveStep(activeStep - 1)}
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "6px",
//               padding: "8px 16px",
//               borderRadius: theme.radius.md,
//               fontSize: theme.typography.fontSize.sm,
//               fontWeight: 500,
//               border: `1px solid ${borderColor}`,
//               background: isFirst
//                 ? theme.colors.background.surface
//                 : theme.colors.background.card,
//               color: isFirst
//                 ? theme.colors.text.disabled
//                 : theme.colors.text.secondary,
//               cursor: isFirst ? "not-allowed" : "pointer",
//             }}
//           >
//             <svg
//               className="w-4 h-4"
//               viewBox="0 0 20 20"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2}
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M12 5l-7 5 7 5"
//               />
//             </svg>
//             Atrás
//           </button>

//           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//             {sectioned.sections.map((_, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   borderRadius: "9999px",
//                   transition: theme.transitions.DEFAULT,
//                   width: idx === activeStep ? "20px" : "8px",
//                   height: "8px",
//                   background:
//                     idx === activeStep
//                       ? primaryColor
//                       : idx < activeStep
//                         ? primaryColor
//                         : borderColor,
//                 }}
//               />
//             ))}
//           </div>

//           {isLast ? (
//             <button
//               type="button"
//               disabled={hook.loading}
//               onClick={() => stepperRef.current?.trySave()}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 padding: "8px 20px",
//                 borderRadius: theme.radius.md,
//                 fontSize: theme.typography.fontSize.sm,
//                 fontWeight: 600,
//                 background: primaryColor,
//                 color: theme.colors.text.inverse,
//                 border: "none",
//                 cursor: hook.loading ? "not-allowed" : "pointer",
//                 opacity: hook.loading ? 0.6 : 1,
//               }}
//             >
//               {hook.loading ? (
//                 <>
//                   <svg
//                     className="w-4 h-4 animate-spin"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
//                   </svg>
//                   Guardando…
//                 </>
//               ) : (
//                 <>
//                   Guardar
//                   <svg
//                     className="w-4 h-4"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 11.586l7.293-7.293a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </>
//               )}
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={() => stepperRef.current?.tryNext()}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 padding: "8px 16px",
//                 borderRadius: theme.radius.md,
//                 fontSize: theme.typography.fontSize.sm,
//                 fontWeight: 500,
//                 background: primaryColor,
//                 color: theme.colors.text.inverse,
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               Siguiente
//               <svg
//                 className="w-4 h-4"
//                 viewBox="0 0 20 20"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M8 5l7 5-7 5"
//                 />
//               </svg>
//             </button>
//           )}
//         </div>
//       );
//     }

//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: "12px",
//           padding: "12px 20px",
//           borderTop: `1px solid ${borderColor}`,
//           background: theme.colors.background.surface,
//         }}
//       >
//         <button
//           type="button"
//           onClick={() => hook.setOpen(false)}
//           style={{
//             padding: "8px 16px",
//             borderRadius: theme.radius.md,
//             fontSize: theme.typography.fontSize.sm,
//             fontWeight: 500,
//             border: `1px solid ${borderColor}`,
//             background: theme.colors.background.card,
//             color: theme.colors.text.secondary,
//             cursor: "pointer",
//           }}
//         >
//           Cancelar
//         </button>
//         <button
//           type="button"
//           disabled={hook.loading}
//           onClick={() => boxRef.current?.trySave()}
//           style={{
//             padding: "8px 20px",
//             borderRadius: theme.radius.md,
//             fontSize: theme.typography.fontSize.sm,
//             fontWeight: 600,
//             background: primaryColor,
//             color: theme.colors.text.inverse,
//             border: "none",
//             cursor: hook.loading ? "not-allowed" : "pointer",
//             opacity: hook.loading ? 0.6 : 1,
//           }}
//         >
//           {hook.loading ? "Guardando…" : "Guardar"}
//         </button>
//       </div>
//     );
//   }, [sectioned, activeStep, hook.loading, hook.setOpen]);

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
//         {crudConfig?.tableHeader && (
//           <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
//             <div className="flex items-center gap-4">
//               {crudConfig.tableHeader.icon && (
//                 <div className="text-gray-600">
//                   {typeof crudConfig.tableHeader.icon === "string" ? (
//                     <i className={`${crudConfig.tableHeader.icon} text-2xl`} />
//                   ) : (
//                     <div
//                       className="p-3 rounded-xl text-white"
//                       style={{ background: theme.colors.primary.DEFAULT }}
//                     >
//                       {crudConfig.tableHeader.icon}
//                     </div>
//                   )}
//                 </div>
//               )}
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">
//                   {crudConfig.tableHeader.title}
//                 </h2>
//                 {crudConfig.tableHeader.subtitle && (
//                   <p className="font-light text-gray-600">
//                     {crudConfig.tableHeader.subtitle}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-wrap items-center gap-2">
//           {advancedConfig?.dashboard?.enabled && (
//             <button
//               onClick={() => setShowDashboard(!showDashboard)}
//               className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
//                 showDashboard
//                   ? "bg-blue-600 text-white"
//                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               <FiBarChart2 className="mr-1.5 h-3.5 w-3.5" /> Dashboard
//             </button>
//           )}
//           {advancedConfig?.search && isAdvanced && (
//             <div className="w-64">
//               <SearchBar
//                 value={advancedHook.search || ""}
//                 onChange={(val: string) => advancedHook.setSearch(val)}
//                 placeholder={advancedConfig.search.placeholder || "Buscar..."}
//                 debounceMs={advancedConfig.search.debounceMs || 300}
//               />
//             </div>
//           )}
//           {advancedConfig?.filters && advancedConfig.filters.length > 0 && (
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
//                 showFilters
//                   ? "bg-blue-600 text-white"
//                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
//             </button>
//           )}
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {advancedConfig?.views &&
//             advancedConfig.views.length > 1 &&
//             isAdvanced && (
//               <ViewSwitcher
//                 currentView={advancedHook.viewMode || "table"}
//                 onViewChange={(mode: string) => advancedHook.setViewMode(mode)}
//                 availableViews={advancedConfig.views.map((v) => v.mode)}
//               />
//             )}
//           {advancedConfig?.audit?.enabled && (
//             <button
//               onClick={() => setShowAudit(!showAudit)}
//               className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
//                 showAudit
//                   ? "bg-purple-600 text-white"
//                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               <FiActivity className="mr-1.5 h-3.5 w-3.5" /> Auditoría
//             </button>
//           )}
//           <Tooltip content="Agregar Registro">
//             <button
//               onClick={() => hook.setOpen(true)}
//               style={{
//                 width: 44,
//                 height: 44,
//                 borderRadius: "50%",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 border: "none",
//                 cursor: "pointer",
//                 background: theme.colors.primary[600],
//               }}
//             >
//               <icons.Pi.PiListPlus size={22} color="white" />
//             </button>
//           </Tooltip>
//         </div>
//       </div>

//       {/* Filters expanded */}
//       {showFilters && advancedConfig?.filters && (
//         <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <FilterPanel
//             filters={advancedConfig.filters}
//             values={advancedHook?.filters || {}}
//             onChange={(field: string, val: any) =>
//               advancedHook?.setFilter(field, val)
//             }
//             onClear={() => advancedHook?.clearFilters()}
//             isOpen={true}
//           />
//         </div>
//       )}

//       {/* Dashboard */}
//       {showDashboard && advancedConfig?.dashboard?.enabled && isAdvanced && (
//         <div className="space-y-4">
//           <DashboardStats
//             stats={
//               advancedHook.dashboardStats || {
//                 total: 0,
//                 active: 0,
//                 inactive: 0,
//               }
//             }
//             title="Dashboard"
//             onRefresh={() => advancedHook.refreshStats()}
//           />
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             {advancedConfig.dashboard.widgets.map((widget) => {
//               const WidgetComponent = widget.component;
//               return (
//                 <div
//                   key={widget.id}
//                   className={widget.size === "full" ? "md:col-span-2" : ""}
//                 >
//                   <WidgetComponent
//                     data={advancedHook.filteredItems || hook.items || []}
//                     stats={advancedHook.dashboardStats}
//                     loading={hook.loading}
//                   />
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Bulk actions */}
//       {isAdvanced && advancedHook.selectedIds?.length > 0 && (
//         <BulkActionsBar
//           selectedCount={advancedHook.selectedIds.length}
//           onClearSelection={() => advancedHook.clearSelection()}
//           onBulkDelete={() => advancedHook.bulkDelete()}
//           customActions={advancedConfig?.bulkActions || []}
//           onCustomAction={(actionId: string) =>
//             advancedHook.bulkAction(actionId)
//           }
//         />
//       )}

//       {/* Main content */}
//       <div className="min-h-[400px]">
//         {isAdvanced && advancedHook.isRealtimeConnected && (
//           <div className="flex items-center gap-2 mb-2 text-xs text-green-600">
//             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
//             Tiempo real conectado
//           </div>
//         )}

//         {(!(isAdvanced && advancedHook.viewMode) ||
//           advancedHook.viewMode === "table") && (
//           <>
//             {tableColumns.length === 0 ? (
//               <></>
//             ) : hook.items?.length === 0 && tableColumns.length > 0 ? (
//               <></>
//             ) : (
//               <div className="h-[calc(85vh-60px)]">
//                 <CustomTable
//                   loading={hook.loading}
//                   data={hook.items || []}
//                   paginate={[5, 10, 25, 50, 100, 500, 1000]}
//                   columns={tableColumns as any}
//                   refreshData={hook.fetchData}
//                   actions={(row) => (
//                     <ActionButtons
//                       row={row}
//                       actionsConfig={crudConfig?.tableActions as any}
//                       onEdit={(row) => {
//                         const formattedRow = prepareForForm(row);
//                         hook.setOpen(true);
//                         hook.handleChangeItem(formattedRow);
//                       }}
//                       onDelete={async (row) => {
//                         const confirmed = await showDeleteConfirmation();
//                         if (confirmed) await hook.removeItemData(row);
//                       }}
//                       actionsDispatch={actionsDispatch}
//                       mainHook={hook}
//                       maxVisibleButtons={2}
//                     />
//                   )}
//                   mobileConfig={mobileConfigValue}
//                 />
//               </div>
//             )}
//           </>
//         )}
//         {isAdvanced && advancedHook.viewMode === "kanban" && <KanbanView />}
//         {isAdvanced && advancedHook.viewMode === "calendar" && <CalendarView />}
//         {isAdvanced &&
//           (advancedHook.viewMode === "grid" ||
//             advancedHook.viewMode === "map") && (
//             <div className="py-12 text-center text-gray-500">
//               <p>Vista {advancedHook.viewMode} en desarrollo</p>
//             </div>
//           )}
//       </div>

//       {/* Audit log */}
//       {showAudit && (
//         <AuditLogViewer
//           logs={isAdvanced ? advancedHook.auditLogs || [] : []}
//           loading={isAdvanced ? advancedHook.isLoadingAudit || false : false}
//           onRefresh={() => isAdvanced && advancedHook.fetchAuditLogs()}
//         />
//       )}

//       {/* Modal Form */}
//       <CompositePage
//         isOpen={hook.open}
//         onClose={() => hook.setOpen(false)}
//         formDirection="modal"
//         fullModal={false}
//         modalTitle={
//           hook.initialValues && (hook.initialValues as any).id
//             ? formTitles.modalTitleUpdate
//             : formTitles.modalTitleAdd
//         }
//         hideDefaultFooter={sectioned.hasSections}
//         modalFooter={
//           sectioned.hasSections ? buildSectionedModalFooter() : undefined
//         }
//         saveButtonText={sectioned.hasSections ? undefined : "Guardar"}
//         cancelButtonText={sectioned.hasSections ? undefined : "Cancelar"}
//         onSave={
//           sectioned.hasSections
//             ? undefined
//             : () => {
//                 const formElement = document.querySelector("form");
//                 formElement?.dispatchEvent(
//                   new Event("submit", { bubbles: true }),
//                 );
//               }
//         }
//         onCancel={sectioned.hasSections ? undefined : () => hook.setOpen(false)}
//         isSaving={hook.loading}
//         modalBodyClassName="pb-4"
//         form={() => {
//           const hasFileFields = computedFields.some(
//             (f) => f.typeField === "File",
//           );
//           return (
//             <FormikForm
//               initialValues={hook.initialValues as TForm}
//               onSubmit={async (values) => {
//                 try {
//                   if (hasFileFields) await hook.postItem(values as TForm, true);
//                   else await hook.postItem(values as TForm);
//                 } catch {
//                   // Error handled by hook
//                 }
//               }}
//               validationSchema={validationSchema}
//               buttonMessage={undefined}
//               buttonLoading={hook.loading}
//             >
//               {() => (
//                 <RenderFormContent
//                   computedFields={computedFields}
//                   sectioned={sectioned}
//                   activeStep={activeStep}
//                   setActiveStep={setActiveStep}
//                   renderField={renderField}
//                   renderComponent={renderComponent}
//                   stepperRef={stepperRef}
//                   boxRef={boxRef}
//                   hideNavButtons={sectioned.hasSections}
//                 />
//               )}
//             </FormikForm>
//           );
//         }}
//       />

//       {/* Delete confirmation modal (legacy) */}
//       {deleteConfirmOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={() => setDeleteConfirmOpen(false)}
//         >
//           <div
//             className="bg-white rounded-xl p-6 max-w-md w-90%"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h3 className="mb-3 text-lg font-semibold">
//               Confirmar eliminación
//             </h3>
//             <p className="mb-4 text-gray-600">
//               ¿Estás seguro? Esta acción no se puede deshacer.
//             </p>
//             {itemToDelete && advancedHook.selectedIds?.length > 0 && (
//               <p className="mb-4 text-sm text-gray-500">
//                 Se eliminarán {advancedHook.selectedIds.length} elemento(s)
//               </p>
//             )}
//             <div className="flex justify-end gap-3">
//               <CustomButton
//                 variant="outline"
//                 onClick={() => setDeleteConfirmOpen(false)}
//               >
//                 Cancelar
//               </CustomButton>
//               <CustomButton
//                 variant="solid"
//                 color="rose"
//                 onClick={handleDeleteConfirm}
//                 loading={hook.loading}
//               >
//                 Eliminar
//               </CustomButton>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Autosave indicator */}
//       {isAdvanced && advancedHook.autosaveEnabled && (
//         <div className="fixed flex items-center gap-2 px-3 py-2 text-xs text-green-700 border border-green-200 rounded-lg bottom-4 right-4 bg-green-50">
//           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{" "}
//           Autoguardado activo
//         </div>
//       )}
//     </div>
//   );
// };;

// export default CompositeCrud;
