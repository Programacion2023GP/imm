// models/genericmodels.model.ts
// ====================================================================
// CONFIGURACIÓN CRUD GENÉRICA CON SOPORTE MÓVIL
// GENERIC CRUD CONFIGURATION WITH MOBILE SUPPORT
// ====================================================================

import * as yup from "yup";
import React from "react";
import type { FilePreset } from "../ui/formik/FormikInputs/forminputimage";
import type { GenericDataReturn } from "../library/reactztore/hook/usegenericdata";

// ====================================================================
// RESPONSIVE SIZES / TAMAÑOS RESPONSIVOS
// ====================================================================

/**
 * Configuración de tamaños responsivos para grids (sistema de 12 columnas de Tailwind)
 * Responsive grid sizes configuration (Tailwind 12-column system)
 *
 * @example { sm: 12, md: 6, lg: 4, xl: 3, "2xl": 2 }
 *
 * @property {number} sm - Pantallas pequeñas (< 640px) / Small screens (< 640px)
 * @property {number} md - Pantallas medianas (< 768px) / Medium screens (< 768px)
 * @property {number} lg - Pantallas grandes (< 1024px) / Large screens (< 1024px)
 * @property {number} xl - Pantallas extra grandes (< 1280px) / Extra large screens (< 1280px)
 * @property {number} "2xl" - Pantallas 2XL (≥ 1536px) / 2XL screens (≥ 1536px)
 */
type ResponsiveSizes = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
};

// ====================================================================
// BASE FIELD CONFIG / CONFIGURACIÓN BASE DE CAMPOS
// ====================================================================

/**
 * Transformación de mayúsculas/minúsculas que se aplica automáticamente al valor del campo.
 * Uppercase/lowercase transformation applied automatically to field value.
 */
type CaseTransform = "uppercase" | "lowercase" | "none";

/**
 * Tipo para los callbacks de campo que reciben el valor procesado, el contexto de Formik y los hooks externos.
 * Type for field callbacks that receive processed value, Formik context, and external hooks.
 *
 * @template TFormValues - Tipo del formulario / Form type
 * @template THooks - Tipo de los hooks externos (actionsDispatch) / External hooks type
 */
type FieldCallback<TFormValues = any, THooks = any> = (
  value: any,
  formik: {
    values: TFormValues;
    setFieldValue: (name: string, value: any) => void;
    setFieldTouched: (name: string, touched: boolean) => void;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  },
  hooks?: THooks,
) => void;

/**
 * Configuración base común para todos los tipos de campos
 * Base configuration common to all field types
 *
 * @property {string} label - Etiqueta visible del campo / Field visible label
 * @property {string} placeholder - Texto de ayuda dentro del input / Input placeholder text
 * @property {boolean} disabled - Deshabilita el campo (no editable) / Disables the field (not editable)
 * @property {unknown} defaultValue - Valor por defecto inicial / Initial default value
 * @property {ResponsiveSizes} responsive - Configuración responsiva (tamaños en grid) / Responsive grid configuration
 * @property {CaseTransform} caseTransform - Transformación automática de mayúsculas/minúsculas / Auto case transformation
 * @property {boolean} uppercase - (Deprecated) Usar caseTransform en su lugar / Use caseTransform instead
 * @property {(value: any) => any} transform - Función personalizada para transformar el valor antes de guardarlo / Custom transform function
 * @property {FieldCallback<TFormValues, THooks>} onChange - Callback cuando el valor cambia (después de transformar) / Callback when value changes (after transform)
 * @property {FieldCallback<TFormValues, THooks>} onInput - Callback mientras el usuario escribe (antes de commitear a Formik) / Callback while user types (before committing to Formik)
 */
type BaseFieldConfig<TFormValues = any, THooks = any> = {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: unknown;
  responsive?: ResponsiveSizes;
  caseTransform?: CaseTransform;
  uppercase?: boolean; // deprecated
  transform?: (value: any) => any;
  onChange?: FieldCallback<TFormValues, THooks>;
  onInput?: FieldCallback<TFormValues, THooks>;
};
// ====================================================================
// BOX GROUP TYPE / TIPO PARA AGRUPAR CAMPOS EN CAJAS DENTRO DE UNA SECCIÓN
// ====================================================================

/**
 * Define un grupo de campos (box) dentro de una sección del layout.
 * Cada box tiene un título y una lista de nombres de campos.
 */
type BoxGroup = {
  title: string;
  fields: string[];
};
// ====================================================================
// TEXT FIELD CONFIG / CONFIGURACIÓN DE CAMPO TEXTO
// ====================================================================

/**
 * Configuración para campos de texto, email, password, número, teléfono, URL, fechas
 * Configuration for text, email, password, number, phone, URL, date fields
 *
 * @property {string} type - Tipo de input HTML / HTML input type
 * @property {boolean} readOnly - Modo solo lectura (no editable, pero puede tener valor) / Read-only mode
 * @property {Function} validation - Validación con Yup / Yup validation schema
 */
type TextConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "date"
    | "datetime"
    | "time";
  readOnly?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// SELECT FIELD CONFIG / CONFIGURACIÓN DE CAMPO SELECCIÓN
// ====================================================================

/**
 * Configuración para campos de selección (dropdown / autocomplete)
 * Configuration for select/dropdown/autocomplete fields
 *
 * @property {string} keyId - Nombre de la propiedad que sirve como ID único (ej: "id") / Property name for unique ID (e.g., "id")
 * @property {string} keyLabel - Nombre de la propiedad que sirve como etiqueta visible (ej: "name") / Property name for visible label (e.g., "name")
 * @property {any[]} options - Opciones estáticas / Static options array
 * @property {Function} selectOptionsHook - Hook para cargar opciones asíncronamente (ej: useRolesData) / Hook for async options loading
 * @property {boolean} multiple - Permite selección múltiple / Enables multi-selection
 * @property {boolean} searchable - Habilita búsqueda dentro de opciones / Enables search within options
 * @property {Function} validation - Validación Yup / Yup validation
 */
type SelectConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  keyId: string;
  keyLabel: string;
  options?: any[];
  selectOptionsHook?: () => any[];
  refreshActionHook?: () => () => void | Promise<void> | Promise<any>;
  addActionHook?: () => () => void;
  loadingHook?: () => boolean;
  multiple?: boolean;
  searchable?: boolean;

  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// FILE UPLOAD CONFIG / CONFIGURACIÓN DE CARGA DE ARCHIVOS
// ====================================================================

/**
 * Configuración para campos de carga de archivos (imágenes, documentos)
 * Configuration for file upload fields (images, documents)
 *
 * @property {FilePreset|FilePreset[]} preset - Preset de carpeta de destino / Destination folder preset
 * @property {number} maxFiles - Número máximo de archivos permitidos / Maximum number of files allowed
 * @property {number} maxSizeMB - Tamaño máximo en MB por archivo / Maximum size in MB per file
 * @property {boolean} multiple - Permite múltiples archivos / Allows multiple files
 * @property {boolean} showPreviews - Muestra previsualización de imágenes / Shows image preview
 * @property {boolean} compressImages - Comprime imágenes automáticamente / Automatically compress images
 * @property {string} hint - Texto de ayuda adicional / Additional hint text
 * @property {Function} validation - Validación Yup / Yup validation
 */
type FileUploadConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  preset?: FilePreset | FilePreset[];
  maxFiles?: number;
  maxSizeMB?: number;
  multiple?: boolean;
  showPreviews?: boolean;
  compressImages?: boolean;
  hint?: string;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// COLOR PICKER CONFIG / CONFIGURACIÓN DE SELECTOR DE COLOR
// ====================================================================

/**
 * Configuración para selector de colores
 * Configuration for color picker field
 *
 * @property {string[]} palette - Paleta de colores personalizada / Custom color palette
 * @property {Function} validation - Validación Yup / Yup validation
 */
type ColorPickerConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  palette?: string[];
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// PASSWORD FIELD CONFIG / CONFIGURACIÓN DE CAMPO CONTRASEÑA
// ====================================================================

/**
 * Configuración para campo de contraseña (con toggle de visibilidad)
 * Configuration for password field (with visibility toggle)
 *
 * @property {Function} validation - Validación Yup (ej: mínimo 8 caracteres) / Yup validation (e.g., min 8 chars)
 */
type PasswordConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// TEXTAREA FIELD CONFIG / CONFIGURACIÓN DE ÁREA DE TEXTO
// ====================================================================

/**
 * Configuración para área de texto (textarea) multilínea
 * Configuration for multiline textarea field
 *
 * @property {number} rows - Número de filas visibles / Number of visible rows
 * @property {boolean} readOnly - Modo solo lectura / Read-only mode
 * @property {Function} validation - Validación Yup / Yup validation
 */
type TextareaConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  rows?: number;
  readOnly?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// NUMBER FIELD CONFIG / CONFIGURACIÓN DE CAMPO NUMÉRICO
// ====================================================================

/**
 * Configuración para campo numérico (con validación de rango)
 * Configuration for numeric field (with range validation)
 *
 * @property {Function} validation - Validación Yup (min, max, integer, etc.) / Yup validation (min, max, integer, etc.)
 */
type NumberConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// RADIO GROUP CONFIG / CONFIGURACIÓN DE GRUPO DE RADIO BUTTONS
// ====================================================================
export interface BottomSheetConfig<T = any> {
  /** Altura del bottom sheet (píxeles o porcentaje, ej: 400, "50%", "70vh") */
  height?: number | string;
  /** Muestra botón de cerrar en la parte superior */
  showCloseButton?: boolean;
  /** Función que construye el contenido del bottom sheet. Recibe la fila y una función para cerrar. */
  builder: (row: T, onClose: () => void) => React.ReactNode;
}
/**
 * Configuración para grupo de botones de opción (radio buttons)
 * Configuration for radio button group
 *
 * @property {TOption[]} options - Lista de opciones disponibles / List of available options
 * @property {keyof TOption} optionIdKey - Propiedad del objeto que sirve como ID / Object property for ID
 * @property {keyof TOption} optionLabelKey - Propiedad del objeto que sirve como etiqueta / Object property for label
 * @property {Function} validation - Validación Yup / Yup validation
 */
type RadioGroupConfig<
  TOption = any,
  TFormValues = any,
  THooks = any,
> = BaseFieldConfig<TFormValues, THooks> & {
  options: TOption[];
  optionIdKey: keyof TOption;
  optionLabelKey: keyof TOption;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// TOGGLE / SWITCH CONFIG / CONFIGURACIÓN DE INTERRUPTOR
// ====================================================================

/**
 * Configuración para interruptor (toggle / switch) de booleano
 * Configuration for boolean toggle/switch field
 *
 * @property {Function} validation - Validación Yup (generalmente .boolean()) / Yup validation (usually .boolean())
 */
type ToggleConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// CHECKBOX CONFIG / CONFIGURACIÓN DE CHECKBOX
// ====================================================================

/**
 * Configuración para checkbox individual (booleano)
 * Configuration for single checkbox (boolean)
 *
 * @property {Function} validation - Validación Yup / Yup validation
 */
type CheckboxConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// HELPERS / UTILIDADES
// ====================================================================

/**
 * Obtiene las claves anidadas de un objeto (para paths como "user.address.city")
 * Gets nested keys of an object (for paths like "user.address.city")
 *
 * @template T - Tipo del objeto / Object type
 * @internal
 */
type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends any[] // 👈 Si es un array, NO recursiona
          ? `${K}`
          : T[K] extends object
            ? `${K}` | `${K}.${NestedKeys<T[K]>}`
            : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Contexto de validación pasado a las funciones de validación Yup
 * Validation context passed to Yup validation functions
 *
 * @property {typeof yup} yup - Objeto Yup para crear esquemas / Yup object to create schemas
 * @property {any} value - Valor actual del campo / Current field value
 * @property {TFormValues} formData - Todos los datos del formulario / All form data
 */
type ValidationContext<TFormValues = any> = {
  yup: typeof yup;
  value: any;
  formData: TFormValues;
};

/**
 * Configuración de una columna en la tabla (para renderizado personalizado y filtros)
 * Table column configuration (for custom rendering and filtering)
 *
 * @property {string} label - Etiqueta visible de la columna / Column visible label
 * @property {Function} render - Función para renderizar el contenido de la celda / Function to render cell content
 * @property {Function} getFilterValue - Función para obtener el valor a filtrar (útil para fechas o valores complejos) / Function to get filterable value
 * @property {string} filterType - Tipo de filtro para la columna / Column filter type
 * @property {Array<{value: any, label: string}>} filterOptions - Opciones para filtros tipo "select" o "multi-select"
 * @property {number} width - Ancho de la columna en píxeles / Column width in pixels
 * @property {number} minWidth - Ancho mínimo de la columna / Minimum column width
 * @property {string} align - Alineación del texto: "left" | "center" | "right"
 * @property {boolean} sortable - Permite ordenamiento por esta columna
 * @property {boolean} resizable - Permite redimensionar la columna
 * @property {boolean} groupable - Permite agrupar por esta columna
 * @property {string} aggregation - Tipo de agregación: "sum" | "avg" | "min" | "max" | "count"
 * @property {string} format - Formato de visualización: "currency" | "percent" | "number" | "date" | "text"
 * @property {boolean} editable - Permite edición inline
 * @property {Function} tooltip - Función que retorna el tooltip para la celda
 * @property {Function} conditionalStyle - Función que retorna estilos condicionales
 * @property {string} visibility - Visibilidad: "always" | "desktop" | "expanded" | "hidden" | "mobile"
 * @property {number} priority - Prioridad para columnas responsivas
 * @property {string} pinned - Fijar columna: "left" | "right"
 * @property {boolean} frozen - Congelar columna al hacer scroll
 */
type TableColumnConfig<TTable> = {
  label: string;
  render?: (value: any, record: TTable) => React.ReactNode;
  getFilterValue?: (value: any, row?: TTable) => string;
  filterType?:
    | "text"
    | "number"
    | "date"
    | "date-range"
    | "select"
    | "boolean"
    | "number-range"
    | "multi-select"
    | "time"
    | "datetime-local"
    | "autocomplete";
  filterOptions?: Array<{ value: any; label: string }>;
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  resizable?: boolean;
  groupable?: boolean;
  aggregation?: "sum" | "avg" | "min" | "max" | "count";
  format?: "currency" | "percent" | "number" | "date" | "text";
  editable?: boolean;
  tooltip?: (row: TTable) => string;
  conditionalStyle?: (row: TTable) => React.CSSProperties;
  visibility?: "always" | "desktop" | "expanded" | "hidden" | "mobile";
  priority?: number;
  pinned?: "left" | "right";
  frozen?: boolean;
};

// ====================================================================
// TABLE ACTIONS CONFIG (Desktop) / CONFIGURACIÓN DE ACCIONES DE TABLA (ESCRITORIO)
// ====================================================================

/**
 * Botón de acción personalizado en la tabla (aparece en menú "Más acciones" y en swipe móvil)
 * Custom action button in table (appears in "More actions" menu and mobile swipe)
 *
 * @template TRecord - Tipo de la fila / Row type
 * @template THooks - Tipo de los hooks inyectados / Injected hooks type
 * @template TMainHook - Tipo del hook principal / Main hook type
 *
 * @property {string} label - Texto del botón / Button text
 * @property {string|React.ReactNode} icon - Ícono (puede ser string con clase CSS o componente React)
 * @property {string} iconName - Deprecated: usar 'icon' en su lugar
 * @property {string} tooltip - Texto de ayuda al hacer hover
 * @property {Function} actionHook - Función que recibe { row, hooks, mainHook } y se ejecuta al hacer clic
 * @property {Function} handleOnClick - (Deprecated) Función que recibe solo la fila
 * @property {string} color - Color del botón (opciones: "blue", "red", "green", "orange", "ruby", etc.)
 * @property {boolean} permission - Permiso requerido para mostrar el botón (si es false, se oculta)
 * @property {boolean|null} multiple - Si es true, permite selección múltiple (no implementado aún)
 */
interface TableActionButton<
  TRecord = any,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> {
  label: string;
  icon?: string | React.ReactNode;
  iconName?: string;
  tooltip?: string;
  /**
   * Acción personalizada con contexto completo tipado
   * Custom action with full typed context
   * @param params - { row: TRecord, hooks: THooks, mainHook?: TMainHook }
   */
  actionHook?: (params: {
    row: TRecord;
    hooks: THooks;
    mainHook?: TMainHook;
  }) => void;
  /** @deprecated Usa actionHook en su lugar / Use actionHook instead */
  handleOnClick?: (record: TRecord) => void;
  color?: string;
  permission?: boolean;
  multiple?: boolean | null;
}

/**
 * Configuración de acciones de la tabla (botones de editar, eliminar y personalizados)
 * Table actions configuration (edit, delete, and custom buttons)
 *
 * @template TRecord - Tipo de la fila / Row type
 * @template THooks - Tipo de los hooks inyectados / Injected hooks type
 * @template TMainHook - Tipo del hook principal / Main hook type
 *
 * @property {boolean} isEditing - Muestra el botón de editar (por defecto true)
 * @property {boolean} isDelete - Muestra el botón de eliminar (por defecto true)
 * @property {TableActionButton<TRecord, THooks, TMainHook>[]} moreButtons - Botones personalizados adicionales
 */
interface TableActionsConfig<
  TRecord = any,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> {
  isEditing?: boolean;
  isDelete?: boolean;
  moreButtons?: TableActionButton<TRecord, THooks, TMainHook>[];
}

/**
 * Configuración del encabezado de la tabla (título, subtítulo, ícono)
 * Table header configuration (title, subtitle, icon)
 *
 * @property {string} title - Título principal de la tabla / Main table title
 * @property {string} subtitle - Subtítulo / Subtitle
 * @property {string|React.ReactNode} icon - Ícono (string con clase CSS o componente React)
 */
interface TableHeaderConfig {
  title?: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
}

// ====================================================================
// MOBILE CONFIGURATION / CONFIGURACIÓN MÓVIL
// ====================================================================

/**
 * Ítem de acción para deslizamiento (swipe) en móvil
 * Swipe action item for mobile
 *
 * @property {React.ReactNode} icon - Ícono a mostrar (componente React)
 * @property {string} color - Color de fondo (clase de Tailwind como "bg-red-500")
 * @property {string} label - Etiqueta opcional / Optional label
 * @property {Function} action - Acción a ejecutar (recibe la fila)
 */
interface SwipeActionItem {
  icon: React.ReactNode;
  color: string;
  label?: string;
  action?: (row: any) => void;
}

/**
 * Configuración de acciones de deslizamiento (swipe) para móvil
 * Swipe actions configuration for mobile
 *
 * @property {SwipeActionItem[]} left - Acciones al deslizar hacia la IZQUIERDA (acción DETRÁS del elemento)
 * @property {SwipeActionItem[]} right - Acciones al deslizar hacia la DERECHA (acción DETRÁS del elemento)
 */
interface SwipeActionsConfig {
  left?: SwipeActionItem[];
  right?: SwipeActionItem[];
}

/**
 * Configuración de cómo se muestra cada elemento en la lista móvil
 * Configuration of how each item appears in mobile list
 *
 * @property {Function} leading - Elemento a la izquierda (avatar, ícono, imagen)
 * @property {Function} title - Título principal (negrita, más grande)
 * @property {Function} subtitle - Subtítulo (texto gris, más pequeño)
 * @property {Function} trailing - Elemento a la derecha (badge, estado, etc.)
 */
interface MobileListTileConfig<T = any> {
  leading?: (row: T) => React.ReactNode;
  title?: (row: T) => React.ReactNode;
  subtitle?: (row: T) => React.ReactNode;
  trailing?: (row: T) => React.ReactNode;
}

/**
 * Tipos de filtro disponibles para el filtro rápido móvil
 * Available filter types for mobile quick filter
 */
type MobileQuickFilterType = "text" | "date" | "select" | "number";

/**
 * Ítem de filtro rápido para móvil (aparece en el modal de filtros)
 * Quick filter item for mobile (appears in filter modal)
 *
 * @property {keyof TTable} dataField - Campo de la tabla a filtrar
 * @property {string} label - Etiqueta visible del filtro
 * @property {MobileQuickFilterType} type - Tipo de filtro
 * @property {Array<{label: string, value: any}>} options - Opciones para el tipo "select"
 * @property {string} placeholder - Texto de ayuda en el input
 */
interface MobileQuickFilterItem<TTable = any> {
  dataField: keyof TTable;
  label: string;
  type?: MobileQuickFilterType;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

/**
 * Configuración de filtros rápidos para móvil
 * Quick filters configuration for mobile
 *
 * @property {boolean} enabled - Habilita el botón de filtros en móvil
 * @property {MobileQuickFilterItem[]} filters - Lista de filtros disponibles
 */
interface MobileQuickFiltersConfig<TTable = any> {
  enabled?: boolean;
  filters?: MobileQuickFilterItem<TTable>[];
}

/**
 * Configuración completa para la experiencia móvil de la tabla
 * Complete configuration for mobile table experience
 *
 * @property {boolean} enabled - Habilita/deshabilita toda la configuración móvil
 * @property {boolean} activeViews - Muestra el selector de vistas (lista, tarjetas, timeline, etc.)
 * @property {MobileListTileConfig} listTile - Personalización del aspecto de cada fila
 * @property {SwipeActionsConfig} swipeActions - Acciones de deslizamiento (swipe)
 * @property {MobileQuickFiltersConfig} quickFilters - Filtros rápidos en modal
 */
interface MobileConfig<T = any> {
  enabled?: boolean;
  activeViews?: boolean;
  listTile?: MobileListTileConfig<T>;
  swipeActions?: SwipeActionsConfig;
  quickFilters?: MobileQuickFiltersConfig<T>;
  bottomSheet?: BottomSheetConfig<T>;
}

// ====================================================================
// OVERRIDES COMPONENTS / COMPONENTES SOBRESCRITOS
// ====================================================================

/**
 * Componentes personalizados para sobrescribir el renderizado de campos y tabla
 * Custom components to override field and table rendering
 */
export interface OverrideComponents {
  text?: React.ComponentType<OverrideFieldProps>;
  select?: React.ComponentType<OverrideSelectProps>;
  file?: React.ComponentType<OverrideFieldProps>;
  color?: React.ComponentType<OverrideFieldProps>;
  password?: React.ComponentType<OverrideFieldProps>;
  textarea?: React.ComponentType<OverrideFieldProps>;
  number?: React.ComponentType<OverrideFieldProps>;
  radio?: React.ComponentType<OverrideFieldProps>;
  toggle?: React.ComponentType<OverrideFieldProps>;
  checkbox?: React.ComponentType<OverrideFieldProps>;
  date?: React.ComponentType<OverrideFieldProps>;
  range?: React.ComponentType<OverrideFieldProps>;
  tableColumns?: React.ComponentType<OverrideTableProps>;
  submitButton?: React.ComponentType<OverrideSubmitButtonProps>;
  [fieldName: string]: React.ComponentType<any> | undefined;
}

/**
 * Props estándar para componentes de campo sobrescritos
 * Standard props for overridden field components
 */
export interface OverrideFieldProps {
  name: string;
  label?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  [key: string]: any;
}

/**
 * Props específicas para componentes de selección sobrescritos
 * Specific props for overridden select components
 */
export interface OverrideSelectProps extends OverrideFieldProps {
  options?: Array<{ id: string | number; name: string; [key: string]: any }>;
  multiple?: boolean;
  searchable?: boolean;
}

/**
 * Props para componente de tabla sobrescrito
 * Props for overridden table component
 */
export interface OverrideTableProps<T = any> {
  columns: Array<{
    field: string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
  actionsConfig?: TableActionsConfig<T>;
  headerConfig?: TableHeaderConfig;
}

/**
 * Props para botón de envío sobrescrito
 * Props for overridden submit button
 */
export interface OverrideSubmitButtonProps {
  isSubmitting?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
}

// ====================================================================
// BUILD RESULT / RESULTADO DEL CONSTRUCTOR (ahora con THooks)
// ====================================================================

/**
 * Resultado final de la configuración del CRUD
 * Final CRUD configuration output
 */
export type BuildResult<TForm = any, TTable = any, THooks = any> = {
  textFields: string[];
  selectFields: string[];
  fileFields: string[];
  colorFields: string[];
  passwordFields: string[];
  textareaFields: string[];
  numberFields: string[];
  radioFields: string[];
  toggleFields: string[];
  checkboxFields: string[];
  textConfigs: Record<string, TextConfig<TForm, THooks>>;
  tableColumns: Record<string, TableColumnConfig<TTable>>;
  selectConfigs: Record<string, SelectConfig<TForm, THooks>>;
  fileConfigs: Record<string, FileUploadConfig<TForm, THooks>>;
  colorConfigs: Record<string, ColorPickerConfig<TForm, THooks>>;
  passwordConfigs: Record<string, PasswordConfig<TForm, THooks>>;
  textareaConfigs: Record<string, TextareaConfig<TForm, THooks>>;
  numberConfigs: Record<string, NumberConfig<TForm, THooks>>;
  radioConfigs: Record<string, RadioGroupConfig<any, TForm, THooks>>;
  toggleConfigs: Record<string, ToggleConfig<TForm, THooks>>;
  checkboxConfigs: Record<string, CheckboxConfig<TForm, THooks>>;
  tableConfig: Record<string, TableColumnConfig<TTable>>;
  tableActions?: TableActionsConfig<TTable>;
  tableHeader?: TableHeaderConfig;
  uiLayout: any;
  validationSchema: any;
  overrides: OverrideComponents;
  render: ((ctx: RenderContext<TForm, TTable>) => React.ReactNode) | null;
  getOptionLabel: (field: string, option: any) => string;
  getOptionValue: (field: string, option: any) => any;
  mobileConfig?: MobileConfig<TTable>;
};

// ====================================================================
// RENDER CONTEXT / CONTEXTO DE RENDERIZADO
// ====================================================================

/**
 * Contexto de renderizado para la función personalizada de render
 * Render context for custom render function
 */
export type RenderContext<TForm, TTable> = {
  fields: {
    text: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    select: Array<{
      name: string;
      component: React.ComponentType<OverrideSelectProps>;
      config: any;
      props: any;
    }>;
    file: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    color: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    password: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    textarea: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    number: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    radio: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    toggle: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    checkbox: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    date?: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    range?: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
  };
  Formik: React.ComponentType<{
    children: (formikBag: {
      values: TForm;
      setFieldValue: (name: string, value: any) => void;
      setFieldTouched: (name: string, touched: boolean) => void;
      errors: Record<string, string>;
      touched: Record<string, boolean>;
      isSubmitting: boolean;
      submitForm: () => Promise<void>;
      handleSubmit: () => void;
    }) => React.ReactNode;
  }>;
  Table?: React.ComponentType<{}>;
  overrides: OverrideComponents;
  hook: GenericDataReturn<TForm>;
  modal: {
    open: boolean;
    close: () => void;
    openWith: (data?: TForm) => void;
  };
};

// ====================================================================
// CONFIGURATION BUILDER / CONSTRUCTOR DE CONFIGURACIÓN (ahora con THooks)
// ====================================================================

/**
 * Constructor fluido para configurar un CRUD completo
 * Fluent builder for complete CRUD configuration
 *
 * @template TForm - Tipo del formulario (datos que se guardan en BD)
 * @template TTable - Tipo de la tabla (datos enriquecidos para mostrar)
 * @template THooks - Tipo de los hooks externos (actionsDispatch) que se pasan a SuperCrud
 *
 * @example
 * const config = ConfigCrud<MyForm, MyTable, MyHooks>()
 *   .fields({ select: ["role_id"] })
 *   .select({ role_id: { label: "Rol", keyId: "id", keyLabel: "name",
 *     onChange: (value, formik, hooks) => { hooks?.myFunction(value); }
 *   }})
 *   .build();
 */
export const ConfigCrud = <
  TForm extends object,
  TTable extends object = TForm,
  THooks = any,
>() => {
  // Listas de campos / Field lists
  let textFieldsList: (NestedKeys<TForm> & string)[] = [];
  let selectFieldsList: (NestedKeys<TForm> & string)[] = [];
  let fileFieldsList: (NestedKeys<TForm> & string)[] = [];
  let colorFieldsList: (NestedKeys<TForm> & string)[] = [];
  let passwordFieldsList: (NestedKeys<TForm> & string)[] = [];
  let textareaFieldsList: (NestedKeys<TForm> & string)[] = [];
  let numberFieldsList: (NestedKeys<TForm> & string)[] = [];
  let radioFieldsList: (NestedKeys<TForm> & string)[] = [];
  let toggleFieldsList: (NestedKeys<TForm> & string)[] = [];
  let checkboxFieldsList: (NestedKeys<TForm> & string)[] = [];

  // Configuraciones / Configurations (ahora con THooks)
  let textConfigs: Record<string, TextConfig<TForm, THooks>> = {};
  let selectConfigs: Record<string, SelectConfig<TForm, THooks>> = {};
  let fileConfigs: Record<string, FileUploadConfig<TForm, THooks>> = {};
  let colorConfigs: Record<string, ColorPickerConfig<TForm, THooks>> = {};
  let passwordConfigs: Record<string, PasswordConfig<TForm, THooks>> = {};
  let textareaConfigs: Record<string, TextareaConfig<TForm, THooks>> = {};
  let numberConfigs: Record<string, NumberConfig<TForm, THooks>> = {};
  let radioConfigs: Record<string, RadioGroupConfig<any, TForm, THooks>> = {};
  let toggleConfigs: Record<string, ToggleConfig<TForm, THooks>> = {};
  let checkboxConfigs: Record<string, CheckboxConfig<TForm, THooks>> = {};
  let tableConfig: Record<string, TableColumnConfig<TTable>> = {};
  let uiLayoutConfig: any = null;

  // Configuraciones de tabla / Table configurations
  let tableActionsConfig: TableActionsConfig<TTable> | undefined = undefined;
  let tableHeaderConfig: TableHeaderConfig | undefined = undefined;
  let mobileConfigValue: MobileConfig<TTable> | undefined = undefined;

  // Overrides y render / Overrides and render
  let overrideComponents: OverrideComponents = {};
  let renderFunction:
    | ((ctx: RenderContext<TForm, TTable>) => React.ReactNode)
    | null = null;

  /**
   * Construye el esquema de validación Yup combinando todas las validaciones de los campos
   */
  const buildValidationSchema = () => {
    const schema: Record<string, yup.Schema<unknown>> = {};
    const addValidations = (configs: Record<string, any>) => {
      Object.entries(configs).forEach(([field, cfg]) => {
        if (cfg?.validation) {
          const validation = cfg.validation({
            yup,
            value: undefined,
            formData: {} as TForm,
          });
          if (validation) schema[field] = validation;
        }
      });
    };
    addValidations(textConfigs);
    addValidations(selectConfigs);
    addValidations(fileConfigs);
    addValidations(colorConfigs);
    addValidations(passwordConfigs);
    addValidations(textareaConfigs);
    addValidations(numberConfigs);
    addValidations(radioConfigs);
    addValidations(toggleConfigs);
    addValidations(checkboxConfigs);
    return yup.object().shape(schema);
  };

  const api = {
    fields: <
      TText extends readonly (NestedKeys<TForm> & string)[],
      TSelect extends readonly (NestedKeys<TForm> & string)[],
      TFile extends readonly (NestedKeys<TForm> & string)[],
      TColor extends readonly (NestedKeys<TForm> & string)[],
      TPassword extends readonly (NestedKeys<TForm> & string)[],
      TTextarea extends readonly (NestedKeys<TForm> & string)[],
      TNumber extends readonly (NestedKeys<TForm> & string)[],
      TRadio extends readonly (NestedKeys<TForm> & string)[],
      TToggle extends readonly (NestedKeys<TForm> & string)[],
      TCheckbox extends readonly (NestedKeys<TForm> & string)[],
    >(config: {
      text?: TText;
      select?: TSelect;
      file?: TFile;
      color?: TColor;
      password?: TPassword;
      textarea?: TTextarea;
      number?: TNumber;
      radio?: TRadio;
      toggle?: TToggle;
      checkbox?: TCheckbox;
    }) => {
      if (config.text) textFieldsList = [...config.text];
      if (config.select) selectFieldsList = [...config.select];
      if (config.file) fileFieldsList = [...config.file];
      if (config.color) colorFieldsList = [...config.color];
      if (config.password) passwordFieldsList = [...config.password];
      if (config.textarea) textareaFieldsList = [...config.textarea];
      if (config.number) numberFieldsList = [...config.number];
      if (config.radio) radioFieldsList = [...config.radio];
      if (config.toggle) toggleFieldsList = [...config.toggle];
      if (config.checkbox) checkboxFieldsList = [...config.checkbox];

      type AllAllowed =
        | TText[number]
        | TSelect[number]
        | TFile[number]
        | TColor[number]
        | TPassword[number]
        | TTextarea[number]
        | TNumber[number]
        | TRadio[number]
        | TToggle[number]
        | TCheckbox[number];

      const methods = {
        text: (
          newConfig: Partial<Record<TText[number], TextConfig<TForm, THooks>>>,
        ) => {
          textConfigs = { ...textConfigs, ...newConfig };
          return methods;
        },
        select: (
          newConfig: Partial<
            Record<TSelect[number], SelectConfig<TForm, THooks>>
          >,
        ) => {
          selectConfigs = { ...selectConfigs, ...newConfig };
          return methods;
        },
        file: (
          newConfig: Partial<
            Record<TFile[number], FileUploadConfig<TForm, THooks>>
          >,
        ) => {
          fileConfigs = { ...fileConfigs, ...newConfig };
          return methods;
        },
        color: (
          newConfig: Partial<
            Record<TColor[number], ColorPickerConfig<TForm, THooks>>
          >,
        ) => {
          colorConfigs = { ...colorConfigs, ...newConfig };
          return methods;
        },
        password: (
          newConfig: Partial<
            Record<TPassword[number], PasswordConfig<TForm, THooks>>
          >,
        ) => {
          passwordConfigs = { ...passwordConfigs, ...newConfig };
          return methods;
        },
        textarea: (
          newConfig: Partial<
            Record<TTextarea[number], TextareaConfig<TForm, THooks>>
          >,
        ) => {
          textareaConfigs = { ...textareaConfigs, ...newConfig };
          return methods;
        },
        number: (
          newConfig: Partial<
            Record<TNumber[number], NumberConfig<TForm, THooks>>
          >,
        ) => {
          numberConfigs = { ...numberConfigs, ...newConfig };
          return methods;
        },
        radio: (
          newConfig: Partial<
            Record<TRadio[number], RadioGroupConfig<any, TForm, THooks>>
          >,
        ) => {
          radioConfigs = { ...radioConfigs, ...newConfig };
          return methods;
        },
        toggle: (
          newConfig: Partial<
            Record<TToggle[number], ToggleConfig<TForm, THooks>>
          >,
        ) => {
          toggleConfigs = { ...toggleConfigs, ...newConfig };
          return methods;
        },
        checkbox: (
          newConfig: Partial<
            Record<TCheckbox[number], CheckboxConfig<TForm, THooks>>
          >,
        ) => {
          checkboxConfigs = { ...checkboxConfigs, ...newConfig };
          return methods;
        },
        tableColumns: (
          newConfig: Partial<Record<keyof TTable, TableColumnConfig<TTable>>>,
        ) => {
          tableConfig = { ...tableConfig, ...newConfig };
          return methods;
        },
        tableActions: <
          TCustomHooks extends Record<string, any> = Record<string, any>,
          TMainHook = any,
        >(
          actions: TableActionsConfig<TTable, TCustomHooks, TMainHook>,
        ) => {
          tableActionsConfig = actions as TableActionsConfig<TTable>;
          return methods;
        },
        tableHeader: (header: TableHeaderConfig) => {
          tableHeaderConfig = header;
          return methods;
        },
        mobile: (config: MobileConfig<TTable>) => {
          mobileConfigValue = config;
          return methods;
        },
        layout: <TNames extends readonly string[]>(uiConfig: {
          mode: "stepper" | "box";
          sections: TNames;
          fieldsPerSection: {
            [K in TNames[number]]:
              | AllAllowed[] // forma simple: solo nombres de campos
              | BoxGroup[]; // forma con boxes: título + lista de campos
          };
        }) => {
          uiLayoutConfig = uiConfig;
          return methods;
        },
        override: (overrides: {
          text?: React.ComponentType<OverrideFieldProps>;
          select?: React.ComponentType<OverrideSelectProps>;
          file?: React.ComponentType<OverrideFieldProps>;
          color?: React.ComponentType<OverrideFieldProps>;
          password?: React.ComponentType<OverrideFieldProps>;
          textarea?: React.ComponentType<OverrideFieldProps>;
          number?: React.ComponentType<OverrideFieldProps>;
          radio?: React.ComponentType<OverrideFieldProps>;
          toggle?: React.ComponentType<OverrideFieldProps>;
          checkbox?: React.ComponentType<OverrideFieldProps>;
          date?: React.ComponentType<OverrideFieldProps>;
          range?: React.ComponentType<OverrideFieldProps>;
          tableColumns?: React.ComponentType<OverrideTableProps<TTable>>;
          submitButton?: React.ComponentType<OverrideSubmitButtonProps>;
          [fieldName: string]: React.ComponentType<any> | undefined;
        }) => {
          overrideComponents = { ...overrideComponents, ...overrides };
          return methods;
        },
        render: (
          fn: (ctx: RenderContext<TForm, TTable>) => React.ReactNode,
        ) => {
          renderFunction = fn;
          return methods;
        },
        build: (): BuildResult<TForm, TTable, THooks> => ({
          tableColumns: tableConfig,
          tableConfig: tableConfig,
          textFields: textFieldsList,
          selectFields: selectFieldsList,
          fileFields: fileFieldsList,
          colorFields: colorFieldsList,
          passwordFields: passwordFieldsList,
          textareaFields: textareaFieldsList,
          numberFields: numberFieldsList,
          radioFields: radioFieldsList,
          toggleFields: toggleFieldsList,
          checkboxFields: checkboxFieldsList,
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
          tableActions: tableActionsConfig,
          tableHeader: tableHeaderConfig,
          mobileConfig: mobileConfigValue,
          uiLayout: uiLayoutConfig,
          validationSchema: buildValidationSchema(),
          getOptionLabel: (field: string, option: any) => {
            const cfg = selectConfigs[field];
            const keyLabel = cfg?.keyLabel ?? "label";
            return option?.[keyLabel] ?? "";
          },
          getOptionValue: (field: string, option: any) => {
            const cfg = selectConfigs[field];
            const keyId = cfg?.keyId ?? "id";
            return option?.[keyId];
          },
          overrides: overrideComponents,
          render: renderFunction,
        }),
      };
      return methods;
    },
  };
  return api;
};

// ====================================================================
// EXPORTED TYPES / TIPOS EXPORTADOS
// ====================================================================

export type {
  ResponsiveSizes,
  TextConfig,
  SelectConfig,
  FileUploadConfig,
  ColorPickerConfig,
  PasswordConfig,
  TextareaConfig,
  NumberConfig,
  RadioGroupConfig,
  ToggleConfig,
  CheckboxConfig,
  TableActionButton,
  TableActionsConfig,
  TableHeaderConfig,
  SwipeActionItem,
  SwipeActionsConfig,
  MobileListTileConfig,
  MobileQuickFiltersConfig,
  MobileConfig,
  CaseTransform,
  FieldCallback,
  BoxGroup,
};
