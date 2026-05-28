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

type CaseTransform = "uppercase" | "lowercase" | "none";

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
  actions?: FieldActions<TFormValues>,
) => void;

type BaseFieldConfig<TFormValues = any, THooks = any> = {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: unknown;
  responsive?: ResponsiveSizes;
  caseTransform?: CaseTransform;
  uppercase?: boolean;
  transform?: (value: any) => any;
  onChange?: FieldCallback<TFormValues, THooks>;
  onInput?: FieldCallback<TFormValues, THooks>;
  hidden?: boolean | ((values: TFormValues) => boolean);
  onVisibilityChange?: (hidden: boolean, formik: any, hooks?: THooks) => void;
};

// ====================================================================
// BOX GROUP TYPE / TIPO PARA AGRUPAR CAMPOS EN CAJAS
// ====================================================================

type BoxGroup<TForm> = {
  title: string;
  fields: (keyof TForm)[];
};

// ====================================================================
// FIELD CONFIGS EXISTENTES
// ====================================================================

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

type ColorPickerConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  palette?: string[];
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type PasswordConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

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
// ARRAY FIELD CONFIG (subformulario para listas)
// ====================================================================

type ArrayFieldConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  fields: ArrayFieldItem[];
  allowAdd?: boolean;
  allowRemove?: boolean;
  editMode?: "inline" | "modal";
  addButtonLabel?: string;
  itemLabel?: string;
  itemsLabel?: string;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};
 type SelectKeyType = "id" | "label";

// genericmodels.model.ts
  interface ArrayFieldItem {
    name: string;
    label: string;
    type: "text" | "number" | "select" | "date" | "checkbox" | "toggle";
    required?: boolean;
    options?: Array<{ id: any; label: string }>;
    selectIdKey?: string;
    selectLabelKey?: string;
    defaultValue?: any;

    // 🚀 NUEVAS PROPIEDADES PARA SELECT DINÁMICO
    selectOptionsHook?: () => any[] | Promise<any[]>;
    refreshActionHook?: () => () => void | Promise<void> | Promise<any>; // ← ampliado
    addActionHook?: () => () => void;
    loadingHook?: () => boolean;
  }

type NumberConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

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

type ToggleConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type CheckboxConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// NUEVAS CONFIGURACIONES PARA COMPONENTES AGREGADOS
// ====================================================================

type DateConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  type?: "date" | "datetime-local" | "time" | "month" | "week";
  min?: string;
  max?: string;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type DateRangeConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  nameFrom?: string;
  nameTo?: string;
  labelFrom?: string;
  labelTo?: string;
  min?: string;
  max?: string;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type NumberDirectConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  showStepper?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type SliderMark = {
  value: number;
  label: string;
};

type SliderConfig<TFormValues = any, THooks = any> = BaseFieldConfig<
  TFormValues,
  THooks
> & {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showTooltip?: boolean;
  marks?: SliderMark[];
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================================================================
// HELPERS / UTILIDADES
// ====================================================================

type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends any[]
          ? `${K}`
          : T[K] extends object
            ? `${K}` | `${K}.${NestedKeys<T[K]>}`
            : `${K}`
        : never;
    }[keyof T]
  : never;

type ValidationContext<TFormValues = any> = {
  yup: typeof yup;
  value: any;
  formData: TFormValues;
};

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
// TABLE ACTIONS CONFIG
// ====================================================================

interface BottomSheetConfig<T = any> {
  height?: number | string;
  showCloseButton?: boolean;
  builder: (row: T, onClose: () => void) => React.ReactNode;
}

interface TableActionButton<
  TRecord = any,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> {
  label: string;
  icon?: string | React.ReactNode;
  iconName?: string;
  tooltip?: string;
  actionHook?: (params: {
    row: TRecord;
    hooks: THooks;
    mainHook?: TMainHook;
  }) => void;
  handleOnClick?: (record: TRecord) => void;
  color?: string;
  permission?: boolean;
  multiple?: boolean | null;
}

interface TableActionsConfig<
  TRecord = any,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> {
  isEditing?: boolean;
  isDelete?: boolean;
  moreButtons?: TableActionButton<TRecord, THooks, TMainHook>[];
}

interface TableHeaderConfig {
  title?: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
}

// ====================================================================
// MOBILE CONFIGURATION
// ====================================================================

interface SwipeActionItem {
  icon: React.ReactNode;
  color: string;
  label?: string;
  action?: (row: any) => void;
}

interface SwipeActionsConfig {
  left?: SwipeActionItem[];
  right?: SwipeActionItem[];
}

interface MobileListTileConfig<T = any> {
  leading?: (row: T) => React.ReactNode;
  title?: (row: T) => React.ReactNode;
  subtitle?: (row: T) => React.ReactNode;
  trailing?: (row: T) => React.ReactNode;
}

type MobileQuickFilterType = "text" | "date" | "select" | "number";

interface MobileQuickFilterItem<TTable = any> {
  dataField: keyof TTable;
  label: string;
  type?: MobileQuickFilterType;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

interface MobileQuickFiltersConfig<TTable = any> {
  enabled?: boolean;
  filters?: MobileQuickFilterItem<TTable>[];
}

interface MobileConfig<T = any> {
  enabled?: boolean;
  activeViews?: boolean;
  listTile?: MobileListTileConfig<T>;
  swipeActions?: SwipeActionsConfig;
  quickFilters?: MobileQuickFiltersConfig<T>;
  bottomSheet?: BottomSheetConfig<T>;
}

// ====================================================================
// OVERRIDES COMPONENTS
// ====================================================================

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
  daterange?: React.ComponentType<OverrideFieldProps>;
  numberdirect?: React.ComponentType<OverrideFieldProps>;
  slider?: React.ComponentType<OverrideFieldProps>;
  tableColumns?: React.ComponentType<OverrideTableProps>;
  submitButton?: React.ComponentType<OverrideSubmitButtonProps>;
  [fieldName: string]: React.ComponentType<any> | undefined;
}

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
  responsive:ResponsiveSizes
  [key: string]: any;
}

export interface OverrideSelectProps extends OverrideFieldProps {
  options?: Array<{ id: string | number; name: string; [key: string]: any }>;
  multiple?: boolean;
  searchable?: boolean;
}

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

export interface OverrideSubmitButtonProps {
  isSubmitting?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
}

// ====================================================================
// BUILD RESULT
// ====================================================================

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
  dateFields: string[];
  dateRangeFields: string[];
  numberDirectFields: string[];
  sliderFields: string[];
  arrayFields: string[];
arrayConfigs: Record<string, ArrayFieldConfig<TForm, THooks>>;
  textConfigs: Record<string, TextConfig<TForm, THooks>>;
  selectConfigs: Record<string, SelectConfig<TForm, THooks>>;
  fileConfigs: Record<string, FileUploadConfig<TForm, THooks>>;
  colorConfigs: Record<string, ColorPickerConfig<TForm, THooks>>;
  passwordConfigs: Record<string, PasswordConfig<TForm, THooks>>;
  textareaConfigs: Record<string, TextareaConfig<TForm, THooks>>;
  numberConfigs: Record<string, NumberConfig<TForm, THooks>>;
  radioConfigs: Record<string, RadioGroupConfig<any, TForm, THooks>>;
  toggleConfigs: Record<string, ToggleConfig<TForm, THooks>>;
  checkboxConfigs: Record<string, CheckboxConfig<TForm, THooks>>;
  dateConfigs: Record<string, DateConfig<TForm, THooks>>;
  dateRangeConfigs: Record<string, DateRangeConfig<TForm, THooks>>;
  numberDirectConfigs: Record<string, NumberDirectConfig<TForm, THooks>>;
  sliderConfigs: Record<string, SliderConfig<TForm, THooks>>;
  tableColumns: Record<string, TableColumnConfig<TTable>>;
  tableConfig: Record<string, TableColumnConfig<TTable>>;
  tableActions?: TableActionsConfig<TTable>;
  tableHeader?: TableHeaderConfig;
  uiLayout: {
    mode: "stepper" | "box";
    sections: readonly string[];
    fieldsPerSection: Record<string, any>;
  };
  validationSchema: any;
  overrides: OverrideComponents;
  render: ((ctx: RenderContext<TForm, TTable>) => React.ReactNode) | null;
  getOptionLabel: (field: string, option: any) => string;
  getOptionValue: (field: string, option: any) => any;
  mobileConfig?: MobileConfig<TTable>;
};

// ====================================================================
// RENDER CONTEXT
// ====================================================================

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
    date: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    daterange: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    numberdirect: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
    slider: Array<{
      name: string;
      component: React.ComponentType<OverrideFieldProps>;
      config: any;
      props: any;
    }>;
  };
  Formik: React.ComponentType<{
    children: (formikBag: any) => React.ReactNode;
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
// CONFIGURATION BUILDER
// ====================================================================

export const ConfigCrud = <
  TForm extends object,
  TTable extends object = TForm,
  THooks = any,
>() => {
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
  let dateFieldsList: (NestedKeys<TForm> & string)[] = [];
  let dateRangeFieldsList: (NestedKeys<TForm> & string)[] = [];
  let numberDirectFieldsList: (NestedKeys<TForm> & string)[] = [];
  let sliderFieldsList: (NestedKeys<TForm> & string)[] = [];
  let arrayFieldsList: (NestedKeys<TForm> & string)[] = []; // ← AGREGAR
  let arrayConfigs: Record<string, ArrayFieldConfig<TForm, THooks>> = {}; // ← AGREGAR
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
  let dateConfigs: Record<string, DateConfig<TForm, THooks>> = {};
  let dateRangeConfigs: Record<string, DateRangeConfig<TForm, THooks>> = {};
  let numberDirectConfigs: Record<
    string,
    NumberDirectConfig<TForm, THooks>
  > = {};
  let sliderConfigs: Record<string, SliderConfig<TForm, THooks>> = {};

  let tableConfig: Record<string, TableColumnConfig<TTable>> = {};
  let uiLayoutConfig: any = null;
  let tableActionsConfig: TableActionsConfig<TTable> | undefined = undefined;
  let tableHeaderConfig: TableHeaderConfig | undefined = undefined;
  let mobileConfigValue: MobileConfig<TTable> | undefined = undefined;
  let overrideComponents: OverrideComponents = {};
  let renderFunction:
    | ((ctx: RenderContext<TForm, TTable>) => React.ReactNode)
    | null = null;

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
    addValidations(dateConfigs);
    addValidations(dateRangeConfigs);
    addValidations(numberDirectConfigs);
    addValidations(sliderConfigs);
    addValidations(arrayConfigs); // ← AGREGAR
    Object.entries(arrayConfigs).forEach(([field, cfg]) => {
      if (!cfg.validation && schema[field] === undefined) {
        schema[field] = yup.array().of(yup.mixed());
      }
    });
    return yup.object().shape(schema);
  };

  const api = {
    fields: <
      TText extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TSelect extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TFile extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TColor extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TPassword extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TTextarea extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TNumber extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TRadio extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TToggle extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TCheckbox extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TDate extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TDateRange extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TNumberDirect extends readonly (NestedKeys<TForm> & string)[] =
        readonly [],
      TSlider extends readonly (NestedKeys<TForm> & string)[] = readonly [],
      TArray extends readonly (NestedKeys<TForm> & string)[] = readonly [],
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
      date?: TDate;
      daterange?: TDateRange;
      numberdirect?: TNumberDirect;
      slider?: TSlider;
      array?: TArray; // ← AGREGAR
    }) => {
      // ============================================================
      // VALIDACIÓN EN TIEMPO DE EJECUCIÓN: NO REPETIR CAMPOS
      // ============================================================
      const usedFields = new Map<string, string>(); // field -> tipo donde se declaró primero
      const allTypes = [
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
        "date",
        "daterange",
        "numberdirect",
        "slider",
        "array", // ← AGREGAR
      ] as const;

      for (const type of allTypes) {
        const fields = config[type];
        if (Array.isArray(fields)) {
          for (const field of fields) {
            if (usedFields.has(field)) {
              const previousType = usedFields.get(field);
              throw new Error(
                `❌ ConfigCrud: El campo "${field}" ya fue declarado en '${previousType}' y no puede repetirse en '${type}'. Los campos deben ser únicos por formulario.`,
              );
            }
            usedFields.set(field, type);
          }
        }
      }
      // ============================================================

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
      if (config.date) dateFieldsList = [...config.date];
      if (config.daterange) dateRangeFieldsList = [...config.daterange];
      if (config.numberdirect)
        numberDirectFieldsList = [...config.numberdirect];
      if (config.slider) sliderFieldsList = [...config.slider];
      if (config.array) arrayFieldsList = [...config.array];
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
        | TCheckbox[number]
        | TDate[number]
        | TDateRange[number]
        | TNumberDirect[number]
        | TSlider[number];

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
        date: (
          newConfig: Partial<Record<TDate[number], DateConfig<TForm, THooks>>>,
        ) => {
          dateConfigs = { ...dateConfigs, ...newConfig };
          return methods;
        },
        daterange: (
          newConfig: Partial<
            Record<TDateRange[number], DateRangeConfig<TForm, THooks>>
          >,
        ) => {
          dateRangeConfigs = { ...dateRangeConfigs, ...newConfig };
          return methods;
        },
        numberdirect: (
          newConfig: Partial<
            Record<TNumberDirect[number], NumberDirectConfig<TForm, THooks>>
          >,
        ) => {
          numberDirectConfigs = { ...numberDirectConfigs, ...newConfig };
          return methods;
        },
        slider: (
          newConfig: Partial<
            Record<TSlider[number], SliderConfig<TForm, THooks>>
          >,
        ) => {
          sliderConfigs = { ...sliderConfigs, ...newConfig };
          return methods;
        },
        array: (
          newConfig: Partial<
            Record<TArray[number], ArrayFieldConfig<TForm, THooks>>
          >,
        ) => {
          arrayConfigs = { ...arrayConfigs, ...newConfig };
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
        layout:
          <TNames extends string[]>(
            mode: "stepper" | "box",
            ...sections: TNames
          ) =>
          <
            TFieldsPerSection extends {
              [K in TNames[number]]:
                | (NestedKeys<TForm> & string)[]
                | BoxGroup<TForm>[];
            },
          >(
            fieldsPerSection: TFieldsPerSection,
          ) => {
            uiLayoutConfig = {
              mode,
              sections: sections as unknown as readonly string[],
              fieldsPerSection: fieldsPerSection as any,
            };
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
          daterange?: React.ComponentType<OverrideFieldProps>;
          numberdirect?: React.ComponentType<OverrideFieldProps>;
          slider?: React.ComponentType<OverrideFieldProps>;
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
          arrayFields: arrayFieldsList, // ← AGREGAR
          arrayConfigs: arrayConfigs,
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
          dateFields: dateFieldsList,
          dateRangeFields: dateRangeFieldsList,
          numberDirectFields: numberDirectFieldsList,
          sliderFields: sliderFieldsList,
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
          dateConfigs,
          dateRangeConfigs,
          numberDirectConfigs,
          sliderConfigs,
          tableColumns: tableConfig,
          tableConfig: tableConfig,
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
// FIELD ACTIONS
// ====================================================================

type FieldActions<TFormValues> = {
  setHidden: <K extends keyof TFormValues>(field: K, hidden: boolean) => void;
  setRequired: <K extends keyof TFormValues>(
    field: K,
    required: boolean,
  ) => void;
  setDisabled: <K extends keyof TFormValues>(
    field: K,
    disabled: boolean,
  ) => void;
  setValue: <K extends keyof TFormValues>(
    field: K,
    value: TFormValues[K],
  ) => void;
};

// ====================================================================
// EXPORTED TYPES
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
  DateConfig,
  DateRangeConfig,
  NumberDirectConfig,
  SliderConfig,
  SliderMark,
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
  FieldActions,
  BottomSheetConfig,
  ArrayFieldConfig, // ← AGREGAR
  ArrayFieldItem,
};
