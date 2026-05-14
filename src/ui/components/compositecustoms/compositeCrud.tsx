import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import type { GenericDataReturn } from "react-zustore";
import { useFormikContext } from "formik";
import { IoMdAdd } from "react-icons/io";
import { FiActivity, FiBarChart2 } from "react-icons/fi";

import CompositePage from "./compositePage";
import CustomButton from "../button/custombuttom";
import Tooltip from "../toltip/Toltip";
import FormikForm from "../../formik/Formik";
import CustomTable from "../table/customtable";
import {
   FormikAutocomplete,
   FormikCheckbox,
   FormikSwitch,
   FormikInput,
   FormikPassword,
   FormikTextArea,
   FormikNumber,
   FormikRadio,
   FormikColorPicker,
} from "../../formik/FormikInputs/FormikInput";
import { RowComponent } from "../../components/responsive/Responsive";
import FormikFileInput from "../../formik/FormikInputs/forminputimage";

import type { AdvancedCrudConfig } from "../../../types/crud-advanced.types";
import type {
   BuildResult,
   RenderContext,
   OverrideComponents,
   OverrideFieldProps,
   OverrideSelectProps,
   OverrideTableProps,
} from "../../../models/genericmodels.model";
import { icons } from "../../../constant";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResponsiveSizes = {
   sm?: number;
   md?: number;
   lg?: number;
   xl?: number;
   "2xl"?: number;
};

export interface FieldItem {
   name: string;
   label: string;
   typeField:
      | "Text"
      | "Select"
      | "Toggle"
      | "Checkbox"
      | "File"
      | "Color"
      | "Password"
      | "TextArea"
      | "Number"
      | "Radio";
   required?: boolean;
   type?: string; // ← agrega esto
   getFilterValue?: (value: any) => string; // ← nuevo

   headerName?: string;
   renderField?: (value: any, row: any) => React.ReactNode;
   responsive?: ResponsiveSizes;
   selectOptions?: any[];
   selectOptionsHook?: () => any[];
   selectIdKey?: string;
   selectLabelKey?: string;
   fileConfig?: any;
   colorConfig?: any;
   passwordConfig?: any;
   textareaConfig?: any;
   numberConfig?: any;
   radioConfig?: {
      options: any[];
      idKey: string;
      labelKey: string;
   };
}

interface PropsCrud<TForm extends object, TTable extends object = TForm> {
   hook: GenericDataReturn<TForm>;
   titles: { modalTitleAdd: string; modalTitleUpdate: string };
   fields?: FieldItem[];
   crudConfig?: BuildResult<TForm, TTable>;
   advancedConfig?: AdvancedCrudConfig<TForm, TTable>;
}

// ─── Design System ────────────────────────────────────────────────────────────

const DS = {
   bg: "#FAFAF9",
   white: "#FFFFFF",
   surface: "#F5F4F1",
   border: "#D6D3CC",
   borderFocus: "#2D2A26",
   borderError: "#C0392B",
   text1: "#1C1A17",
   text2: "#6B6560",
   text3: "#A8A39A",
   accent: "#3730A3",
   accentLight: "rgba(55,48,163,0.08)",
   accentGlow: "0 0 0 3px rgba(55,48,163,0.12)",
   errorText: "#DC2626",
   errorBg: "#FEF2F2",
   errorBorder: "#FCA5A5",
   r6: "8px",
   r8: "10px",
   shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
   transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
};

const DEFAULT_RESPONSIVE: ResponsiveSizes = {
   sm: 12,
   md: 12,
   lg: 12,
   xl: 12,
   "2xl": 12,
};

// ─── Fallback UI Components ───────────────────────────────────────────────────
// utils/dateUtils.ts

/**
 * Detecta si un valor es una fecha en formato ISO 8601 (con o sin timezone)
 * Ejemplos: "2024-01-15", "2024-01-15T00:00:00Z", "2024-01-15T06:00:00.000000Z"
 */
const isISODateString = (value: any): boolean => {
   if (typeof value !== "string") return false;
   // Regex que detecta formatos de fecha ISO
   const isoDateRegex =
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[\+\-]\d{2}:\d{2})?)?$/;
   if (!isoDateRegex.test(value)) return false;

   // Verificar que sea una fecha válida
   const date = new Date(value);
   return !isNaN(date.getTime());
};

/**
 * Detecta si un valor es un objeto Date de JavaScript
 */
const isDateObject = (value: any): value is Date => {
   return value instanceof Date && !isNaN(value.getTime());
};

/**
 * Detecta si un valor es un timestamp numérico (milisegundos)
 */
const isTimestamp = (value: any): boolean => {
   if (typeof value !== "number") return false;
   // Timestamp válido: entre año 2000 y 2100 aprox
   return value > 946684800000 && value < 4102444800000;
};

/**
 * Transforma cualquier formato de fecha a YYYY-MM-DD (para inputs type="date")
 */
const toDateInputFormat = (value: any): string | null => {
   let date: Date | null = null;

   if (isDateObject(value)) {
      date = value;
   } else if (isISODateString(value)) {
      date = new Date(value);
   } else if (isTimestamp(value)) {
      date = new Date(value);
   }

   if (date && !isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
   }

   return null;
};

/**
 * Transforma cualquier formato de fecha al formato ISO completo con timezone UTC
 * Ejemplo: "2024-01-15" → "2024-01-15T00:00:00.000000Z"
 */
const toISOFullFormat = (value: any): string | null => {
   let date: Date | null = null;

   if (isDateObject(value)) {
      date = value;
   } else if (isISODateString(value)) {
      date = new Date(value);
   } else if (isTimestamp(value)) {
      date = new Date(value);
   } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Ya es YYYY-MM-DD
      date = new Date(`${value}T00:00:00Z`);
   }

   if (date && !isNaN(date.getTime())) {
      // Formato: 2024-01-15T00:00:00.000000Z
      const iso = date.toISOString();
      // Reemplazar milisegundos (3 dígitos) por 6 dígitos
      return iso.replace(/\.\d{3}Z$/, ".000000Z");
   }

   return null;
};

/**
 * Recorre recursivamente un objeto y transforma TODAS las fechas encontradas
 *
 * @param obj - Objeto a transformar
 * @param transformFn - Función de transformación (toDateInputFormat o toISOFullFormat)
 * @returns Nuevo objeto con todas las fechas transformadas
 */
export const transformDatesInObject = <T = any,>(
   obj: T,
   transformFn: (value: any) => string | null = toDateInputFormat,
): T => {
   if (obj === null || obj === undefined) return obj;

   // Si es un array, procesar cada elemento
   if (Array.isArray(obj)) {
      return obj.map((item) => transformDatesInObject(item, transformFn)) as T;
   }

   // Si es un objeto, procesar sus propiedades
   if (typeof obj === "object") {
      const result: any = {};

      for (const key in obj) {
         if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            // Si el valor es una fecha (string ISO, Date object, timestamp)
            if (
               isISODateString(value) ||
               isDateObject(value) ||
               isTimestamp(value)
            ) {
               const transformed = transformFn(value);
               if (transformed !== null) {
                  result[key] = transformed;
               } else {
                  result[key] = value;
               }
            }
            // Si es un objeto o array, recursión
            else if (typeof value === "object" && value !== null) {
               result[key] = transformDatesInObject(value, transformFn);
            }
            // Valor normal
            else {
               result[key] = value;
            }
         }
      }

      return result;
   }

   // Valores primitivos
   return obj;
};

// Exportar funciones de transformación por separado
export const toFormDateFormat = toDateInputFormat;
export const toBackendDateFormat = toISOFullFormat;

// Función para transformar a formato de formulario (edición)
export const prepareForForm = <T = any,>(obj: T): T => {
   return transformDatesInObject(obj, toDateInputFormat);
};

// Función para transformar a formato de backend (guardar)
export const prepareForBackend = <T = any,>(obj: T): T => {
   return transformDatesInObject(obj, toISOFullFormat);
};
const SearchBar = ({ value, onChange, placeholder, debounceMs = 300 }: any) => {
   const [localValue, setLocalValue] = useState(value);
   useEffect(() => {
      const timer = setTimeout(() => onChange(localValue), debounceMs);
      return () => clearTimeout(timer);
   }, [localValue, onChange, debounceMs]);
   return (
      <input
         type="text"
         value={localValue}
         onChange={(e) => setLocalValue(e.target.value)}
         placeholder={placeholder || "Buscar..."}
         className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
      />
   );
};

const FilterPanel = ({ filters, values, onChange, onClear, isOpen }: any) => {
   if (!isOpen) return null;
   return (
      <div className="p-3 border rounded bg-gray-50">
         <div className="flex justify-between mb-2">
            <span className="font-medium">Filtros</span>
            <button onClick={onClear} className="text-xs text-red-600">
               Limpiar
            </button>
         </div>
         {filters?.map((filter: any) => (
            <div key={filter.field} className="mb-2">
               <label className="block mb-1 text-xs">{filter.label}</label>
               <input
                  type="text"
                  value={values[filter.field] || ""}
                  onChange={(e) => onChange(filter.field, e.target.value)}
                  className="w-full p-1 text-sm border rounded"
               />
            </div>
         ))}
      </div>
   );
};

const BulkActionsBar = ({
   selectedCount,
   onClearSelection,
   onBulkDelete,
   customActions,
   onCustomAction,
}: any) => (
   <div className="flex items-center gap-3 p-2 rounded-md bg-blue-50">
      <span className="text-sm">{selectedCount} seleccionados</span>
      <button onClick={onClearSelection} className="text-xs text-gray-600">
         Cancelar
      </button>
      <button onClick={onBulkDelete} className="text-xs text-red-600">
         Eliminar
      </button>
      {customActions?.map((action: any) => (
         <button
            key={action.id}
            onClick={() => onCustomAction(action.id)}
            className="text-xs">
            {action.label}
         </button>
      ))}
   </div>
);

const ViewSwitcher = ({ currentView, onViewChange, availableViews }: any) => (
   <div className="flex gap-1 p-1 bg-gray-100 rounded-md">
      {availableViews.map((mode: string) => (
         <button
            key={mode}
            onClick={() => onViewChange(mode)}
            className={`px-2 py-1 text-xs rounded ${currentView === mode ? "bg-white shadow" : ""}`}>
            {mode === "table"
               ? "📋"
               : mode === "kanban"
                 ? "📌"
                 : mode === "calendar"
                   ? "📅"
                   : mode}
         </button>
      ))}
   </div>
);

const DashboardStats = ({ stats, title, onRefresh }: any) => (
   <div className="p-4 bg-white border rounded shadow-sm">
      <div className="flex justify-between">
         <h3 className="font-medium">{title}</h3>
         <button onClick={onRefresh} className="text-xs">
            ⟳
         </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2 text-center">
         <div>
            Total
            <br />
            {stats.total ?? 0}
         </div>
         <div>
            Activos
            <br />
            {stats.active ?? 0}
         </div>
         <div>
            Inactivos
            <br />
            {stats.inactive ?? 0}
         </div>
      </div>
   </div>
);

const AuditLogViewer = ({ logs, loading, onRefresh }: any) => (
   <div className="p-3 border rounded">
      <div className="flex justify-between">
         <h3 className="font-medium">Auditoría</h3>
         <button onClick={onRefresh} className="text-xs">
            ⟳
         </button>
      </div>
      {loading ? (
         <p>Cargando...</p>
      ) : logs.length === 0 ? (
         <p className="text-gray-500">Sin registros</p>
      ) : (
         <ul className="mt-2 text-sm">
            {logs.slice(0, 5).map((log: any, idx: number) => (
               <li key={idx}>📄 {log.message || log.action}</li>
            ))}
         </ul>
      )}
   </div>
);

const KanbanView = () => (
   <div className="p-4 text-center text-gray-500 border rounded">
      Kanban View (en construcción)
   </div>
);
const CalendarView = () => (
   <div className="p-4 text-center text-gray-500 border rounded">
      Calendar View (en construcción)
   </div>
);

// ─── Formik Adapters ─────────────────────────────────────────────────────────

const FormikTextAdapter = (props: OverrideFieldProps) => (
   <FormikInput
      name={props.name}
      label={props.label || ""}
      required={props.required}
      placeholder={props.placeholder}
      disabled={props.disabled}
   />
);
const FormikSelectAdapter = (props: OverrideSelectProps) => (
   <FormikAutocomplete
      name={props.name}
      label={props.label || ""}
      disabled={props.disabled}
      options={props.options || []}
      idKey={props.config?.keyId || "id"}
      labelKey={props.config?.keyLabel || "name"}
   />
);
const FormikFileAdapter = (props: OverrideFieldProps) => (
   <FormikFileInput name={props.name} label={props.label || ""} />
);
const FormikColorAdapter = (props: OverrideFieldProps) => (
   <FormikColorPicker
      name={props.name}
      label={props.label || ""}
      required={props.required || false}
      colorPalette={[]}
   />
);
const FormikPasswordAdapter = (props: OverrideFieldProps) => (
   <FormikPassword name={props.name} label={props.label || ""} />
);
const FormikTextareaAdapter = (props: OverrideFieldProps) => (
   <FormikTextArea
      name={props.name}
      label={props.label || ""}
      required={props.required || false}
      placeholder={props.placeholder}
      rows={props.rows}
   />
);
const FormikNumberAdapter = (props: OverrideFieldProps) => (
   <FormikNumber name={props.name} label={props.label || ""} />
);
const FormikRadioAdapter = (props: OverrideFieldProps) => (
   <FormikRadio
      name={props.name}
      label={props.label || ""}
      options={props.options || []}
      idKey={props.config?.optionIdKey || "id"}
      labelKey={props.config?.optionLabelKey || "label"}
   />
);
const FormikToggleAdapter = (props: OverrideFieldProps) => (
   <FormikSwitch name={props.name} label={props.label || ""} />
);
const FormikCheckboxAdapter = (props: OverrideFieldProps) => (
   <FormikCheckbox name={props.name} label={props.label || ""} />
);

// ─── DynamicSelectField ───────────────────────────────────────────────────────
// ✅ OUTSIDE SuperCrud — stable component type, never remounts on parent re-render.
// ✅ selectOptionsHook() called at TOP LEVEL of component body — Rules of Hooks satisfied.

interface DynamicSelectFieldProps {
   field: FieldItem;
   responsive: ResponsiveSizes;
}

const DynamicSelectField = memo(
   ({ field, responsive }: DynamicSelectFieldProps) => {
      // Call the hook unconditionally at the top level.
      // This component is only rendered when selectOptionsHook exists (guarded in renderField).
      const hookResult = field.selectOptionsHook!();

      // Determine once on mount whether this is an async (Promise-based) hook.
      const [isAsync] = useState<boolean>(
         () =>
            hookResult != null &&
            typeof (hookResult as any).then === "function",
      );
      const [asyncOptions, setAsyncOptions] = useState<any[]>([]);

      useEffect(() => {
         if (!isAsync) return;
         let active = true;
         (hookResult as unknown as Promise<any[]>).then((data) => {
            if (active) setAsyncOptions(Array.isArray(data) ? data : []);
         });
         return () => {
            active = false;
         };
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // Promise resolved once on mount only

      // Sync hook (Zustand/React Query returning array) → reactive, updates with store.
      // Async hook (Promise) → resolved state.
      const options: any[] = isAsync
         ? asyncOptions
         : Array.isArray(hookResult)
           ? hookResult
           : (field.selectOptions ?? []);

      return (
         <FormikAutocomplete
            name={field.name}
            label={field.label}
            options={options}
            idKey={field.selectIdKey || "id"}
            labelKey={field.selectLabelKey || "label"}
            responsive={responsive}
         />
      );
   },
);
DynamicSelectField.displayName = "DynamicSelectField";

// ─── StepperFormLocal ─────────────────────────────────────────────────────────
// ✅ OUTSIDE SuperCrud — stable type, receives renderField as prop.

interface StepperFormLocalProps {
   sections: { title: string; fields: FieldItem[] }[];
   activeStep: number;
   onStepChange: (idx: number) => void;
   onSave: () => void;
   renderField: (field: FieldItem) => React.ReactNode;
}

const StepperFormLocal = ({
   sections,
   activeStep,
   onStepChange,
   onSave,
   renderField,
}: StepperFormLocalProps) => {
   const currentSection = sections[activeStep];
   return (
      <div>
         <div className="flex gap-2 mb-4 border-b">
            {sections.map((s, idx) => (
               <button
                  key={s.title}
                  onClick={() => onStepChange(idx)}
                  className={`pb-2 px-3 ${idx === activeStep ? "border-b-2 border-blue-600 font-medium" : "text-gray-500"}`}>
                  {s.title}
               </button>
            ))}
         </div>
         <div className="mb-4">
            <RowComponent>
               {currentSection.fields.map(renderField)}
            </RowComponent>
         </div>
         <div className="flex justify-between">
            <button
               disabled={activeStep === 0}
               onClick={() => onStepChange(activeStep - 1)}
               className="px-4 py-2 border rounded">
               Atrás
            </button>
            {activeStep === sections.length - 1 ? (
               <button
                  onClick={onSave}
                  className="px-4 py-2 text-white bg-blue-600 rounded">
                  Guardar
               </button>
            ) : (
               <button
                  onClick={() => onStepChange(activeStep + 1)}
                  className="px-4 py-2 text-white bg-blue-600 rounded">
                  Siguiente
               </button>
            )}
         </div>
      </div>
   );
};

// ─── BoxFormLocal ─────────────────────────────────────────────────────────────
// ✅ OUTSIDE SuperCrud — stable type, receives renderField as prop.

interface BoxFormLocalProps {
   sections: { title: string; fields: FieldItem[] }[];
   onSave: () => void;
   renderField: (field: FieldItem) => React.ReactNode;
}

const BoxFormLocal = ({ sections, onSave, renderField }: BoxFormLocalProps) => {
   const formik = useFormikContext();

   const handleSave = async () => {
      const errors = await formik.validateForm();
      const allFields = sections.flatMap((s) => s.fields);
      const allTouched = allFields.reduce(
         (acc: any, f: FieldItem) => ({ ...acc, [f.name]: true }),
         {},
      );
      await formik.setTouched({ ...formik.touched, ...allTouched });
      if (Object.keys(errors).length === 0) onSave();
   };

   return (
      <div>
         {sections.map((section) => (
            <div
               key={section.title}
               style={{
                  border: `1px solid ${DS.border}`,
                  borderRadius: DS.r8,
                  background: DS.white,
                  padding: "16px",
                  marginBottom: "24px",
               }}>
               <div
                  style={{
                     fontSize: "14px",
                     fontWeight: 600,
                     color: DS.accent,
                     marginBottom: "16px",
                     borderBottom: `2px solid ${DS.accentLight}`,
                     paddingBottom: "6px",
                  }}>
                  {section.title}
               </div>
               <RowComponent>{section.fields.map(renderField)}</RowComponent>
            </div>
         ))}
         <div
            style={{
               display: "flex",
               justifyContent: "flex-end",
               marginTop: "16px",
            }}>
            <button
               type="button"
               onClick={handleSave}
               disabled={formik.isSubmitting}
               style={{
                  padding: "8px 24px",
                  background: DS.accent,
                  color: DS.white,
                  border: "none",
                  borderRadius: DS.r6,
                  cursor: formik.isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: 600,
               }}>
               {formik.isSubmitting ? "Guardando…" : "Guardar"}
            </button>
         </div>
      </div>
   );
};

// ─── RenderFormContent ────────────────────────────────────────────────────────
// ✅ OUTSIDE SuperCrud — stable type, all needed values received as props.

interface RenderFormContentProps {
   computedFields: FieldItem[];
   sectioned: {
      hasSections: boolean;
      sectionType: string | null;
      sections: { title: string; fields: FieldItem[] }[];
   };
   activeStep: number;
   setActiveStep: (step: number) => void;
   renderField: (field: FieldItem) => React.ReactNode;
   onSubmit: () => void;
}

const RenderFormContent = ({
   computedFields,
   sectioned,
   activeStep,
   setActiveStep,
   renderField,
   onSubmit,
}: RenderFormContentProps) => {
   if (!sectioned.hasSections) {
      return <RowComponent>{computedFields.map(renderField)}</RowComponent>;
   }
   if (sectioned.sectionType === "stepper") {
      return (
         <StepperFormLocal
            sections={sectioned.sections}
            activeStep={activeStep}
            onStepChange={setActiveStep}
            onSave={onSubmit}
            renderField={renderField}
         />
      );
   }
   return (
      <BoxFormLocal
         sections={sectioned.sections}
         onSave={onSubmit}
         renderField={renderField}
      />
   );
};

// ─── SuperCrud ────────────────────────────────────────────────────────────────

const SuperCrud = <TForm extends object, TTable extends object = TForm>({
   hook,
   titles,
   fields: manualFields,
   crudConfig,
   advancedConfig,
}: PropsCrud<TForm, TTable>) => {
   const [activeStep, setActiveStep] = useState(0);
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [itemToDelete, setItemToDelete] = useState<TForm | null>(null);
   const [showFilters, setShowFilters] = useState(false);
   const [showDashboard, setShowDashboard] = useState(false);
   const [showAudit, setShowAudit] = useState(false);
   const [activeFilterCount, setActiveFilterCount] = useState(0);

   const isAdvanced = !!(hook as any).search !== undefined;
   const advancedHook = hook as any;

   const filtersKey = useMemo(
      () => JSON.stringify(advancedHook.filters || {}),
      [advancedHook.filters],
   );
   useEffect(() => {
      let count = 0;
      if (advancedHook.filters) {
         count = Object.values(advancedHook.filters).filter(
            (v) => v != null && v !== "" && v !== "all",
         ).length;
      }
      if (advancedHook.search) count++;
      setActiveFilterCount(count);
   }, [filtersKey, advancedHook.search]);

   // ── Computed fields ──────────────────────────────────────────────────────────
   const computedFields = useMemo((): FieldItem[] => {
      if (crudConfig) {
         const {
            textFields,
            selectFields,
            fileFields,
            colorFields,
            passwordFields,
            textareaFields,
            numberFields,
            radioFields,
            toggleFields,
            checkboxFields,
            textConfigs,
            selectConfigs,
            fileConfigs,
            colorConfigs,
            passwordConfigs,
            textareaConfigs,
            numberConfigs,
            radioConfigs,
            toggleConfigs,
            checkboxConfigs,
            uiLayout,
         } = crudConfig;

         const fieldsMap = new Map<string, FieldItem>();

         const addField = (
            name: string,
            typeField: FieldItem["typeField"],
            config: any,
         ) => {
            if (fieldsMap.has(name)) return;
            const baseField: FieldItem = {
               name,
               label: config.label || name,
               typeField,
               required: config.required || false,
               headerName: config.label || name,
               responsive: config.responsive || DEFAULT_RESPONSIVE,
            };
            switch (typeField) {
               case "Text":
                  baseField.type = config.type; // ← agrega este case
                  break;
               case "Select":
                  baseField.selectOptions = config.options;
                  baseField.selectIdKey = config.keyId;
                  baseField.selectLabelKey = config.keyLabel;
                  baseField.selectOptionsHook = config.selectOptionsHook;
                  break;
               case "File":
                  baseField.fileConfig = config;
                  break;
               case "Color":
                  baseField.colorConfig = config;
                  break;
               case "Password":
                  baseField.passwordConfig = config;
                  break;
               case "TextArea":
                  baseField.textareaConfig = config;
                  break;
               case "Number":
                  baseField.numberConfig = config;
                  break;
               case "Radio":
                  baseField.radioConfig = config;
                  break;
               default:
                  break;
            }
            fieldsMap.set(name, baseField);
         };

         textFields?.forEach((f) =>
            addField(f, "Text", textConfigs?.[f] || {}),
         );
         selectFields?.forEach((f) =>
            addField(f, "Select", selectConfigs?.[f] || {}),
         );
         fileFields?.forEach((f) =>
            addField(f, "File", fileConfigs?.[f] || {}),
         );
         colorFields?.forEach((f) =>
            addField(f, "Color", colorConfigs?.[f] || {}),
         );
         passwordFields?.forEach((f) =>
            addField(f, "Password", passwordConfigs?.[f] || {}),
         );
         textareaFields?.forEach((f) =>
            addField(f, "TextArea", textareaConfigs?.[f] || {}),
         );
         numberFields?.forEach((f) =>
            addField(f, "Number", numberConfigs?.[f] || {}),
         );
         radioFields?.forEach((f) =>
            addField(f, "Radio", radioConfigs?.[f] || {}),
         );
         toggleFields?.forEach((f) =>
            addField(f, "Toggle", toggleConfigs?.[f] || {}),
         );
         checkboxFields?.forEach((f) =>
            addField(f, "Checkbox", checkboxConfigs?.[f] || {}),
         );

         let allFields = Array.from(fieldsMap.values());

         if (uiLayout?.fieldsPerSection) {
            const orderedNames = Object.values(
               uiLayout.fieldsPerSection,
            ).flat();
            const orderedFields: FieldItem[] = [];
            for (const name of orderedNames) {
               const field = allFields.find((f) => f.name === name);
               if (field) orderedFields.push(field);
            }
            const remainingFields = allFields.filter(
               (f) => !orderedNames.includes(f.name),
            );
            allFields = [...orderedFields, ...remainingFields];
         }
         return allFields;
      }
      return manualFields || [];
   }, [crudConfig, manualFields]);

   const tableColumns = useMemo(() => {
      if (crudConfig?.tableConfig) {
         return Object.entries(crudConfig.tableConfig).map(
            ([field, config]) => ({
               field,
               headerName: config.label || field,
               renderField: (value: any, row: TTable) =>
                  config.render ? config.render(value, row) : value,
               getFilterValue: config.getFilterValue, // ✅ agregado
            }),
         );
      }
      return computedFields.map((it) => ({
         field: it.name,
         headerName: it.headerName || it.label,
         renderField: (value: any, row: TForm) =>
            it.renderField ? it.renderField(value, row) : value,
         getFilterValue: it.getFilterValue, // ✅ agregado (si lo necesitas en campos simples)
      }));
   }, [crudConfig, computedFields]);

   const sectioned = useMemo(() => {
      if (crudConfig?.uiLayout) {
         const { fieldsPerSection, sections, mode } = crudConfig.uiLayout;
         const sectionsList = sections.map((name: string) => ({
            title: name,
            fields: computedFields.filter((field) =>
               fieldsPerSection?.[name]?.includes(field.name),
            ),
         }));
         return {
            hasSections: true,
            sectionType: mode,
            sections: sectionsList,
         };
      }
      return { hasSections: false, sectionType: null, sections: [] };
   }, [crudConfig, computedFields]);

   useEffect(() => {
      if (!hook.open) setActiveStep(0);
   }, [hook.open]);

   useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
         if (hook.isDirty) {
            e.preventDefault();
            e.returnValue = "";
         }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
         window.removeEventListener("beforeunload", handleBeforeUnload);
   }, [hook.isDirty]);

   const validationSchema = crudConfig?.validationSchema;

   const handleDeleteConfirm = async () => {
      if (itemToDelete) {
         await hook.deleteItem(itemToDelete);
         setDeleteConfirmOpen(false);
         setItemToDelete(null);
      }
   };

   // ✅ renderField is stable — DynamicSelectField is now a module-level stable type
   const renderField = useCallback((field: FieldItem): React.ReactNode => {
      const responsive = field.responsive || DEFAULT_RESPONSIVE;
      switch (field.typeField) {
         case "Toggle":
            return (
               <FormikSwitch
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  responsive={responsive}
               />
            );
         case "Checkbox":
            return (
               <FormikCheckbox
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  responsive={responsive}
               />
            );
         case "Select":
            if (field.selectOptionsHook) {
               return (
                  <DynamicSelectField
                     key={field.name}
                     field={field}
                     responsive={responsive}
                  />
               );
            }
            return (
               <FormikAutocomplete
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  options={field.selectOptions || []}
                  idKey={field.selectIdKey || "id"}
                  labelKey={field.selectLabelKey || "label"}
                  responsive={responsive}
               />
            );
         case "File":
            return (
               <FormikFileInput
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  {...field.fileConfig}
                  responsive={responsive}
               />
            );
         case "Color":
            return (
               <FormikColorPicker
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  {...field.colorConfig}
                  responsive={responsive}
               />
            );
         case "Password":
            return (
               <FormikPassword
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  {...field.passwordConfig}
                  responsive={responsive}
               />
            );
         case "TextArea":
            return (
               <FormikTextArea
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  {...field.textareaConfig}
                  responsive={responsive}
               />
            );
         case "Number":
            return (
               <FormikNumber
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  {...field.numberConfig}
                  responsive={responsive}
               />
            );
         case "Radio":
            return (
               <FormikRadio
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  options={field.radioConfig?.options || []}
                  idKey={field.radioConfig?.idKey || "id"}
                  labelKey={field.radioConfig?.labelKey || "label"}
                  required={field.required}
                  responsive={responsive}
               />
            );
         default:
            return (
               <FormikInput
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  required={field.required}
                  type={
                     (field.type as
                        | "text"
                        | "email"
                        | "password"
                        | "number"
                        | "tel"
                        | "url"
                        | "date"
                        | "datetime-local"
                        | "time") || "text"
                  } // ← agrega esto
                  responsive={responsive}
               />
            );
      }
   }, []); // FieldItem values are passed in — no closure deps needed

   // ─── Custom render mode ────────────────────────────────────────────────────
   if (crudConfig?.render) {
      const FormikProvider = ({
         children,
      }: {
         children: (formikBag: any) => React.ReactNode;
      }) => {
         const hasFile = computedFields.some((f) => f.typeField === "File");
         console.log("form", hook.formData);
         return (
            <FormikForm
               initialValues={(hook.formData || {}) as TForm}
               validationSchema={validationSchema}
               onSubmit={async (values) => {
                  if (hasFile) await hook.saveItem(values as TForm, true);
                  else await hook.saveItem(values as TForm);
                  hook.setOpen(false);
               }}
               buttonMessage={undefined}>
               {(formikBag: any) => children(formikBag)}
            </FormikForm>
         );
      };

      const TableComponent = () => {
         const overrideTable = crudConfig.overrides?.table;
         if (overrideTable) {
            const columns = tableColumns.map((col) => ({
               field: String(col.field),
               label: col.headerName,
               render: col.renderField,
            }));
            const TableOverride = overrideTable as React.ComponentType<
               OverrideTableProps<TTable>
            >;
            const tableData = (hook.items || []) as unknown as TTable[];
            return (
               <TableOverride
                  columns={columns}
                  data={tableData}
                  onEdit={(row: TTable) => {
                     hook.setFormData(row as unknown as TForm);
                     hook.setOpen(true);
                  }}
                  onDelete={(row: TTable) => {
                     setItemToDelete(row as unknown as TForm);
                     setDeleteConfirmOpen(true);
                  }}
               />
            );
         }
         return (
            <CustomTable
               loading={hook.loading}
               data={hook.items || []}
               paginate={[5, 10, 25, 50, 100, 500, 1000]}
               columns={tableColumns as any}
               actions={(row) => (
                    <>
                        <Tooltip content="Editar">
                           <CustomButton
                              color="yellow"
                              onClick={() => {
                                 const formattedRow = prepareForForm(row);
                                 hook.setOpen(true);
                                 hook.setFormData(formattedRow);
                              }}
                              icon={<icons.Lu.LuPencil />}
                           />
                        </Tooltip>

                        <Tooltip content="Eliminar">
                           <CustomButton
                              color="ruby"
                              onClick={() => {
                                 hook.deleteItem(row);
                              }}
                              icon={<icons.Lu.LuTrash />}
                           />
                        </Tooltip>
                     </>
               )}
            />
         );
      };

      const defaultOverrides = {
         text: FormikTextAdapter,
         select: FormikSelectAdapter,
         file: FormikFileAdapter,
         color: FormikColorAdapter,
         password: FormikPasswordAdapter,
         textarea: FormikTextareaAdapter,
         number: FormikNumberAdapter,
         radio: FormikRadioAdapter,
         toggle: FormikToggleAdapter,
         checkbox: FormikCheckboxAdapter,
      };

      const userWrappedOverrides: OverrideComponents = {};
      Object.entries(crudConfig.overrides || {}).forEach(([key, Comp]) => {
         if (!Comp) return;
         if (key === "table") {
            userWrappedOverrides[key] = Comp;
         } else {
            userWrappedOverrides[key] = (props: any) => {
               const formik = useFormikContext<TForm>();
               const fieldName = props.name;
               const value = formik.values[fieldName as keyof TForm];
               const error = formik.errors[fieldName as keyof TForm] as string;
               const touched = formik.touched[
                  fieldName as keyof TForm
               ] as boolean;
               return (
                  <Comp
                     {...props}
                     value={value}
                     onChange={(newValue: any) => {
                        formik.setFieldValue(fieldName, newValue);
                        formik.validateField(fieldName);
                     }}
                     onBlur={() => {
                        formik.setFieldTouched(fieldName, true);
                        formik.validateField(fieldName);
                     }}
                     error={touched && error ? error : undefined}
                     touched={touched}
                  />
               );
            };
         }
      });

      const finalOverrides = { ...defaultOverrides, ...userWrappedOverrides };

      const buildFields = () => {
         const result: RenderContext<TForm, TTable>["fields"] = {
            text: [],
            select: [],
            file: [],
            color: [],
            password: [],
            textarea: [],
            number: [],
            radio: [],
            toggle: [],
            checkbox: [],
         };
         const fieldTypes = [
            "text",
            "select",
            "file",
            "color",
            "password",
            "textarea",
            "number",
            "radio",
            "toggle",
            "checkbox",
         ] as const;
         fieldTypes.forEach((type) => {
            const fieldList = crudConfig[`${type}Fields`] as
               | string[]
               | undefined;
            const configs = crudConfig[`${type}Configs`] as
               | Record<string, any>
               | undefined;
            fieldList?.forEach((name: string) => {
               const overrideComp = finalOverrides[type];
               const component = overrideComp || defaultOverrides[type];
               result[type].push({
                  name,
                  component: component as React.ComponentType<any>,
                  config: configs?.[name] || {},
                  props: {
                     name,
                     ...(configs?.[name] || {}),
                     config: configs?.[name],
                  },
               });
            });
         });
         return result;
      };

      const context: RenderContext<TForm, TTable> = {
         fields: buildFields(),
         Formik: FormikProvider,
         Table: TableComponent,
         overrides: finalOverrides,
         hook: hook as any,
         modal: {
            open: hook.open,
            close: () => hook.setOpen(false),
            openWith: (data?: TForm) => {
               if (data) hook.setFormData(data);
               hook.setOpen(true);
            },
         },
      };

      const rendered = crudConfig.render(context);
      if (React.isValidElement(rendered)) return rendered;

      console.error(
         "SuperCrud: crudConfig.render() debe retornar un elemento React válido. Se recibió:",
         rendered,
      );
      return (
         <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50">
            <strong>Error de configuración:</strong> la función{" "}
            <code>render</code> en crudConfig no retornó un componente React
            válido.
         </div>
      );
   }

   // ─── Default render ────────────────────────────────────────────────────────
   return (
      <div className="space-y-4">
         {/* Header */}
         <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
               {advancedConfig?.dashboard?.enabled && (
                  <button
                     onClick={() => setShowDashboard(!showDashboard)}
                     className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showDashboard ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>
                     <FiBarChart2 className="mr-1.5 h-3.5 w-3.5" /> Dashboard
                  </button>
               )}
               {advancedConfig?.search && isAdvanced && (
                  <div className="w-64">
                     <SearchBar
                        value={advancedHook.search || ""}
                        onChange={(val: string) => advancedHook.setSearch(val)}
                        placeholder={
                           advancedConfig.search.placeholder || "Buscar..."
                        }
                        debounceMs={advancedConfig.search.debounceMs || 300}
                     />
                  </div>
               )}
               {advancedConfig?.filters &&
                  advancedConfig.filters.length > 0 && (
                     <FilterPanel
                        filters={advancedConfig.filters}
                        values={advancedHook?.filters || {}}
                        onChange={(field: string, val: any) =>
                           advancedHook?.setFilter(field, val)
                        }
                        onClear={() => advancedHook?.clearFilters()}
                        isOpen={showFilters}
                     />
                  )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {advancedConfig?.views &&
                  advancedConfig.views.length > 1 &&
                  isAdvanced && (
                     <ViewSwitcher
                        currentView={advancedHook.viewMode || "table"}
                        onViewChange={(mode: string) =>
                           advancedHook.setViewMode(mode)
                        }
                        availableViews={advancedConfig.views.map((v) => v.mode)}
                     />
                  )}
               {advancedConfig?.audit?.enabled && (
                  <button
                     onClick={() => setShowAudit(!showAudit)}
                     className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showAudit ? "bg-purple-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>
                     <FiActivity className="mr-1.5 h-3.5 w-3.5" /> Auditoría
                  </button>
               )}
               <Tooltip content="Agregar">
                  <CustomButton
                     onClick={() => {
                        hook.setFormData({} as TForm);
                        hook.setOpen(true);
                     }}>
                     <IoMdAdd /> Nuevo
                  </CustomButton>
               </Tooltip>
            </div>
         </div>

         {/* Dashboard */}
         {showDashboard && advancedConfig?.dashboard?.enabled && isAdvanced && (
            <div className="space-y-4">
               <DashboardStats
                  stats={
                     advancedHook.dashboardStats || {
                        total: 0,
                        active: 0,
                        inactive: 0,
                     }
                  }
                  title="Dashboard"
                  onRefresh={() => advancedHook.refreshStats()}
               />
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {advancedConfig.dashboard.widgets.map((widget) => {
                     const WidgetComponent = widget.component;
                     return (
                        <div
                           key={widget.id}
                           className={
                              widget.size === "full" ? "md:col-span-2" : ""
                           }>
                           <WidgetComponent
                              data={
                                 advancedHook.filteredItems || hook.items || []
                              }
                              stats={advancedHook.dashboardStats}
                              loading={hook.loading}
                           />
                        </div>
                     );
                  })}
               </div>
            </div>
         )}

         {/* Filters expanded */}
         {showFilters && advancedConfig?.filters && (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
               <FilterPanel
                  filters={advancedConfig.filters}
                  values={advancedHook?.filters || {}}
                  onChange={(field: string, val: any) =>
                     advancedHook?.setFilter(field, val)
                  }
                  onClear={() => advancedHook?.clearFilters()}
                  isOpen={true}
               />
            </div>
         )}

         {/* Bulk actions */}
         {isAdvanced && advancedHook.selectedIds?.length > 0 && (
            <BulkActionsBar
               selectedCount={advancedHook.selectedIds.length}
               onClearSelection={() => advancedHook.clearSelection()}
               onBulkDelete={() => advancedHook.bulkDelete()}
               customActions={advancedConfig?.bulkActions || []}
               onCustomAction={(actionId: string) =>
                  advancedHook.bulkAction(actionId)
               }
            />
         )}

         {/* Main content */}
         <div className="min-h-[400px]">
            {isAdvanced && advancedHook.isRealtimeConnected && (
               <div className="flex items-center gap-2 mb-2 text-xs text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                  Tiempo real conectado
               </div>
            )}
            {(!(isAdvanced && advancedHook.viewMode) ||
               advancedHook.viewMode === "table") && (
               <CustomTable
                  loading={hook.loading}
                  data={hook.items || []}
                  paginate={[5, 10, 25, 50, 100, 500, 1000]}
                  columns={tableColumns as any}
                  actions={(row) => (
                     <>
                        <Tooltip content="Editar">
                           <CustomButton
                              color="yellow"
                              onClick={() => {
                                 const formattedRow = prepareForForm(row);
                                 hook.setOpen(true);
                                 hook.setFormData(formattedRow);
                              }}
                              icon={<icons.Lu.LuPencil />}
                           />
                        </Tooltip>

                        <Tooltip content="Eliminar">
                           <CustomButton
                              color="ruby"
                              onClick={() => {
                                 hook.deleteItem(row);
                              }}
                              icon={<icons.Lu.LuTrash />}
                           />
                        </Tooltip>
                     </>
                  )}
               />
            )}
            {isAdvanced && advancedHook.viewMode === "kanban" && <KanbanView />}
            {isAdvanced && advancedHook.viewMode === "calendar" && (
               <CalendarView />
            )}
            {isAdvanced &&
               (advancedHook.viewMode === "grid" ||
                  advancedHook.viewMode === "map") && (
                  <div className="py-12 text-center text-gray-500">
                     <p>Vista {advancedHook.viewMode} en desarrollo</p>
                  </div>
               )}
         </div>

         {/* Audit log */}
         {showAudit && (
            <AuditLogViewer
               logs={isAdvanced ? advancedHook.auditLogs || [] : []}
               loading={
                  isAdvanced ? advancedHook.isLoadingAudit || false : false
               }
               onRefresh={() => isAdvanced && advancedHook.fetchAuditLogs()}
            />
         )}

         {/* Modal Form */}
         <CompositePage
            isOpen={hook.open}
            onClose={() => hook.setOpen(false)}
            formDirection="modal"
            fullModal={false}
            modalTitle={
               hook.formData && (hook.formData as any).id
                  ? titles.modalTitleUpdate
                  : titles.modalTitleAdd
            }
            form={() => {
               const hasFileFields = computedFields.some(
                  (field) => field.typeField === "File",
               );
               return (
                  <FormikForm
                     initialValues={(hook.formData || {}) as TForm}
                     onSubmit={async (values) => {
                        if (hasFileFields)
                           await hook.saveItem(values as TForm, true);
                        else await hook.saveItem(values as TForm);
                        hook.setOpen(false);
                     }}
                     validationSchema={validationSchema}
                     buttonMessage={
                        !sectioned.hasSections ? "Guardar" : undefined
                     }
                     buttonLoading={hook.loading}>
                     {(formikBag: any) => (
                        // ✅ RenderFormContent is now a stable module-level component — no remount
                        <RenderFormContent
                           computedFields={computedFields}
                           sectioned={sectioned}
                           activeStep={activeStep}
                           setActiveStep={setActiveStep}
                           renderField={renderField}
                           onSubmit={() => formikBag.handleSubmit()}
                        />
                     )}
                  </FormikForm>
               );
            }}
         />

         {/* Delete confirmation */}
         {deleteConfirmOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
               onClick={() => setDeleteConfirmOpen(false)}>
               <div
                  className="bg-white rounded-xl p-6 max-w-md w-90%"
                  onClick={(e) => e.stopPropagation()}>
                  <h3 className="mb-3 text-lg font-semibold">
                     Confirmar eliminación
                  </h3>
                  <p className="mb-4 text-gray-600">
                     ¿Estás seguro? Esta acción no se puede deshacer.
                  </p>
                  {itemToDelete && advancedHook.selectedIds?.length > 0 && (
                     <p className="mb-4 text-sm text-gray-500">
                        Se eliminarán {advancedHook.selectedIds.length}{" "}
                        elemento(s)
                     </p>
                  )}
                  <div className="flex justify-end gap-3">
                     <CustomButton
                        variant="outline"
                        onClick={() => setDeleteConfirmOpen(false)}>
                        Cancelar
                     </CustomButton>
                     <CustomButton
                        variant="solid"
                        color="rose"
                        onClick={handleDeleteConfirm}
                        loading={hook.loading}>
                        Eliminar
                     </CustomButton>
                  </div>
               </div>
            </div>
         )}

         {/* Autosave indicator */}
         {isAdvanced && advancedHook.autosaveEnabled && (
            <div className="fixed flex items-center gap-2 px-3 py-2 text-xs text-green-700 border border-green-200 rounded-lg bottom-4 right-4 bg-green-50">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{" "}
               Autoguardado activo
            </div>
         )}
      </div>
   );
};

export default SuperCrud;
