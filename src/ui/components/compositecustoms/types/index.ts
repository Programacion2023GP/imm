// CompositeCrud/types/index.ts
import { GenericDataReturn } from "../../../../library/reactztore/hook/usegenericdata";
import type {
  BuildResult,
  TableActionsConfig,
  MobileListTileConfig,
  MobileQuickFiltersConfig,
  MobileConfig,
  ArrayFieldItem,
  OverrideFieldProps,
  OverrideSelectProps,
  OverrideTableProps,
  OverrideComponents,
  RenderContext,
} from "../../../../models/genericmodels.model";
import { AdvancedCrudConfig } from "../../../../types/crud-advanced.types";

// ─── Responsive Sizes ────────────────────────────────────────────────────────
export type ResponsiveSizes = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
};

// ─── Case Transform ──────────────────────────────────────────────────────────
export type CaseTransform = "uppercase" | "lowercase" | "none";
export type RenderableItem =
  | { kind: "field"; field: FieldItem }
  | {
      kind: "component";
      componentName: string;
      responsive?: ResponsiveSizes;
      props?: Record<string, any>;
    }
  | { kind: "box"; title: string; fields: FieldItem[] };
// ─── Default Responsive ──────────────────────────────────────────────────────
export const DEFAULT_RESPONSIVE: ResponsiveSizes = {
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
  "2xl": 12,
};

// ─── Field Item ──────────────────────────────────────────────────────────────
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
    | "Radio"
    | "Date"
    | "DateRange"
    | "NumberDirect"
    | "Slider"
    | "Array";

  // Configuraciones específicas por tipo
  dateConfig?: {
    type?: "date" | "datetime-local" | "time" | "month" | "week";
    min?: string;
    max?: string;
  };
  dateRangeConfig?: {
    nameFrom: string;
    nameTo: string;
    labelFrom?: string;
    labelTo?: string;
    min?: string;
    max?: string;
  };
  numberDirectConfig?: {
    min?: number;
    max?: number;
    step?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    showStepper?: boolean;
  };
  sliderConfig?: {
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    showTooltip?: boolean;
    marks?: Array<{ value: number; label: string }>;
  };
  arrayConfig?: {
    fields: ArrayFieldItem[];
    allowAdd?: boolean;
    allowRemove?: boolean;
    addButtonLabel?: string;
    itemLabel?: string;
  };

  // Propiedades generales
  disabled?: boolean;
  required?: boolean;
  type?: string;
  multiple: boolean;
  loadingHook?: () => boolean;
  getFilterValue?: (value: any) => string;
  headerName?: string;
  renderField?: (value: any, row: any) => React.ReactNode;
  responsive?: ResponsiveSizes;
  selectOptions?: any[];
  hidden?: boolean | ((values: any) => boolean);

  // Props para Select
  selectOptionsHook?: () => any[] | Promise<any[]>;
  selectIdKey?: string;
  selectLabelKey?: string;

  // Props para otros tipos
  fileConfig?: any;
  colorConfig?: any;
  passwordConfig?: any;
  textareaConfig?: any;
  numberConfig?: any;
  refreshActionHook?: () => () => void | Promise<void>;
  addActionHook?: () => () => void;

  // Props para Radio
  radioConfig?: {
    options: any[];
    optionIdKey: string;
    optionLabelKey: string;
  };

  // Props de transformación
  placeholder?: string;
  uppercase?: boolean;
  caseTransform?: CaseTransform;
  transform?: (value: any) => any;

  // Callbacks
  onChange?: (value: any, formik: any, hooks?: any) => void;
  onInput?: (value: any, formik: any, hooks?: any) => void;
}

// ─── Action Hook Context ──────────────────────────────────────────────────────
export type ActionHookContext<
  TRecord = any,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> = {
  row: TRecord;
  hooks: THooks;
  mainHook?: TMainHook;
};

// ─── Props del componente CompositeCrud ───────────────────────────────────────
export interface PropsCrud<
  TForm extends object,
  TTable extends object = TForm,
  THooks extends Record<string, any> = Record<string, any>,
> {
  hook: GenericDataReturn<TForm>;
  formTitles: { modalTitleAdd: string; modalTitleUpdate: string };
  fields?: FieldItem[];
  crudConfig?: BuildResult<TForm, TTable, THooks>;
  advancedConfig?: AdvancedCrudConfig<TForm, TTable>;
  mobileListTile?: MobileListTileConfig<TTable>;
  mobileQuickFilters?: MobileQuickFiltersConfig;
  enableMobileViews?: boolean;
  actionsDispatch?: THooks;
}

// ─── PortalDropdown Props ─────────────────────────────────────────────────────
export interface PortalDropdownProps {
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// ─── ActionButtons Props ──────────────────────────────────────────────────────
export interface ActionButtonsProps<
  TRecord,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
> {
  row: TRecord;
  actionsConfig?: TableActionsConfig<TRecord, THooks, TMainHook>;
  onEdit?: (row: TRecord) => void;
  onDelete?: (row: TRecord) => void;
  maxVisibleButtons?: number;
  actionsDispatch?: THooks;
  mainHook?: TMainHook;
}

// ─── DynamicSelectField Props ─────────────────────────────────────────────────
export interface DynamicSelectFieldProps {
  field: FieldItem;
  responsive: ResponsiveSizes;
  onChange?: (value: any) => void;
  onInput?: (value: string) => void;
  caseTransform?: CaseTransform;
}

// ─── DynamicMultipleSelectField Props ─────────────────────────────────────────
export interface DynamicMultipleSelectFieldProps {
  field: FieldItem;
  responsive: ResponsiveSizes;
  onChange?: (value: any) => void;
  caseTransform?: CaseTransform;
}

// ─── StepperFormLocal Props ───────────────────────────────────────────────────
export interface StepperFormLocalProps {
  sections: Array<{ title: string; items: RenderableItem[] }>;
  activeStep: number;
  hideNavButtons?: boolean;
  onStepChange: (idx: number) => void;
  renderField: (field: FieldItem) => React.ReactNode;
  renderComponent: (
    componentName: string,
    responsive?: ResponsiveSizes,
    props?: Record<string, any>,
  ) => React.ReactNode;
}


// ─── StepperNavHandle y BoxNavHandle ─────────────────────────────────────────
export interface StepperNavHandle {
  tryNext: () => Promise<void>;
  trySave: () => Promise<void>;
}

export interface BoxNavHandle {
  trySave: () => Promise<void>;
}

// ─── BoxFormLocal Props ───────────────────────────────────────────────────────

export interface BoxFormLocalProps {
  sections: Array<{ title: string; items: RenderableItem[] }>;
  renderField: (field: FieldItem) => React.ReactNode;
  renderComponent: (
    componentName: string,
    responsive?: ResponsiveSizes,
    props?: Record<string, any>,
  ) => React.ReactNode;
  hideSubmitButton?: boolean;
}

// ─── RenderFormContent Props ──────────────────────────────────────────────────
export interface RenderFormContentProps {
  computedFields: FieldItem[];
  sectioned: {
    hasSections: boolean;
    sectionType: string | null;
    sections: Array<{ title: string; items: RenderableItem[] }>;
  };
  activeStep: number;
  setActiveStep: (step: number) => void;
  renderField: (field: FieldItem) => React.ReactNode;
  renderComponent: (
    componentName: string,
    responsive?: ResponsiveSizes,
    props?: Record<string, any>,
  ) => React.ReactNode;
  stepperRef?: React.RefObject<StepperNavHandle>;
  boxRef?: React.RefObject<BoxNavHandle>;
  hideNavButtons?: boolean;
}

// ─── FieldWrapper Props ───────────────────────────────────────────────────────
export interface FieldWrapperProps {
  field: FieldItem;
  actionsDispatch?: any;
}
