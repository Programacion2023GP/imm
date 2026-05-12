// models/genericmodels.model.ts
import * as yup from "yup";
import React from "react";
import type { GenericDataReturn } from "react-zustore"; // 👈 Agregado
import type { FilePreset } from "../ui/formik/FormikInputs/forminputimage";

// ====================== TIPOS BASE ======================
type ResponsiveSizes = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
};

type BaseFieldConfig = {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: unknown;
  responsive?: ResponsiveSizes;
};

type TextConfig<TFormValues = any> = BaseFieldConfig & {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  readOnly?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type SelectConfig<TFormValues = any> = BaseFieldConfig & {
  keyId: string;
  keyLabel: string;
  options?: any[];
  multiple?: boolean;
  searchable?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type FileUploadConfig<TFormValues = any> = BaseFieldConfig & {
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

type ColorPickerConfig<TFormValues = any> = BaseFieldConfig & {
  palette?: string[];
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type PasswordConfig<TFormValues = any> = BaseFieldConfig & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type TextareaConfig<TFormValues = any> = BaseFieldConfig & {
  rows?: number;
  readOnly?: boolean;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type NumberConfig<TFormValues = any> = BaseFieldConfig & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type RadioGroupConfig<TOption = any, TFormValues = any> = BaseFieldConfig & {
  options: TOption[];
  optionIdKey: keyof TOption;
  optionLabelKey: keyof TOption;
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type ToggleConfig<TFormValues = any> = BaseFieldConfig & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

type CheckboxConfig<TFormValues = any> = BaseFieldConfig & {
  validation?: (
    ctx: ValidationContext<TFormValues>,
  ) => yup.Schema<unknown> | undefined;
};

// ====================== HELPERS ======================
type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends object
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
};

// ====================== TIPOS PARA OVERRIDES Y RENDER ======================
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
  table?: React.ComponentType<OverrideTableProps>;
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
}
export type BuildResult<TForm = any, TTable = any> = {
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
  textConfigs: Record<string, TextConfig<TForm>>;
  selectConfigs: Record<string, SelectConfig<TForm>>;
  fileConfigs: Record<string, FileUploadConfig<TForm>>;
  colorConfigs: Record<string, ColorPickerConfig<TForm>>;
  passwordConfigs: Record<string, PasswordConfig<TForm>>;
  textareaConfigs: Record<string, TextareaConfig<TForm>>;
  numberConfigs: Record<string, NumberConfig<TForm>>;
  radioConfigs: Record<string, RadioGroupConfig<any, TForm>>;
  toggleConfigs: Record<string, ToggleConfig<TForm>>;
  checkboxConfigs: Record<string, CheckboxConfig<TForm>>;
  tableConfig: Record<string, TableColumnConfig<TTable>>;
  uiLayout: any;
  validationSchema: any;
  overrides: OverrideComponents;
  render: ((ctx: RenderContext<TForm, TTable>) => React.ReactNode) | null;
  getOptionLabel: (field: string, option: any) => string;
  getOptionValue: (field: string, option: any) => any;
};
export interface OverrideSubmitButtonProps {
  isSubmitting?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
}

// models/genericmodels.model.ts

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
  // ✅ CORREGIDO: Ahora Form recibe children con formikBag completo
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
// ====================== CONSTRUCTOR PRINCIPAL ======================
export const ConfigCrud = <TForm extends object, TTable extends object = TForm>() => {
  // Listas de campos
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

  // Configuraciones
  let textConfigs: Record<string, TextConfig<TForm>> = {};
  let selectConfigs: Record<string, SelectConfig<TForm>> = {};
  let fileConfigs: Record<string, FileUploadConfig<TForm>> = {};
  let colorConfigs: Record<string, ColorPickerConfig<TForm>> = {};
  let passwordConfigs: Record<string, PasswordConfig<TForm>> = {};
  let textareaConfigs: Record<string, TextareaConfig<TForm>> = {};
  let numberConfigs: Record<string, NumberConfig<TForm>> = {};
  let radioConfigs: Record<string, RadioGroupConfig<any, TForm>> = {};
  let toggleConfigs: Record<string, ToggleConfig<TForm>> = {};
  let checkboxConfigs: Record<string, CheckboxConfig<TForm>> = {};
  let tableConfig: Record<string, TableColumnConfig<TTable>> = {};
  let uiLayoutConfig: any = null;

  // Overrides y render personalizado
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
          newConfig: Partial<Record<TText[number], TextConfig<TForm>>>,
        ) => {
          textConfigs = { ...textConfigs, ...newConfig };
          return methods;
        },
        select: (
          newConfig: Partial<Record<TSelect[number], SelectConfig<TForm>>>,
        ) => {
          selectConfigs = { ...selectConfigs, ...newConfig };
          return methods;
        },
        file: (
          newConfig: Partial<Record<TFile[number], FileUploadConfig<TForm>>>,
        ) => {
          fileConfigs = { ...fileConfigs, ...newConfig };
          return methods;
        },
        color: (
          newConfig: Partial<Record<TColor[number], ColorPickerConfig<TForm>>>,
        ) => {
          colorConfigs = { ...colorConfigs, ...newConfig };
          return methods;
        },
        password: (
          newConfig: Partial<Record<TPassword[number], PasswordConfig<TForm>>>,
        ) => {
          passwordConfigs = { ...passwordConfigs, ...newConfig };
          return methods;
        },
        textarea: (
          newConfig: Partial<Record<TTextarea[number], TextareaConfig<TForm>>>,
        ) => {
          textareaConfigs = { ...textareaConfigs, ...newConfig };
          return methods;
        },
        number: (
          newConfig: Partial<Record<TNumber[number], NumberConfig<TForm>>>,
        ) => {
          numberConfigs = { ...numberConfigs, ...newConfig };
          return methods;
        },
        radio: (
          newConfig: Partial<
            Record<TRadio[number], RadioGroupConfig<any, TForm>>
          >,
        ) => {
          radioConfigs = { ...radioConfigs, ...newConfig };
          return methods;
        },
        toggle: (
          newConfig: Partial<Record<TToggle[number], ToggleConfig<TForm>>>,
        ) => {
          toggleConfigs = { ...toggleConfigs, ...newConfig };
          return methods;
        },
        checkbox: (
          newConfig: Partial<Record<TCheckbox[number], CheckboxConfig<TForm>>>,
        ) => {
          checkboxConfigs = { ...checkboxConfigs, ...newConfig };
          return methods;
        },
        table: (
          newConfig: Partial<Record<keyof TTable, TableColumnConfig<TTable>>>,
        ) => {
          tableConfig = { ...tableConfig, ...newConfig };
          return methods;
        },
        layout: <TNames extends readonly string[]>(uiConfig: {
          mode: "stepper" | "box";
          sections: TNames;
          fieldsPerSection: { [K in TNames[number]]: AllAllowed[] };
        }) => {
          uiLayoutConfig = uiConfig;
          return methods;
        },
        // 🔥 CORREGIDO: override con tipos específicos
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
          table?: React.ComponentType<OverrideTableProps<TTable>>;
          submitButton?: React.ComponentType<OverrideSubmitButtonProps>;
          [fieldName: string]: React.ComponentType<any> | undefined;
        }) => {
          overrideComponents = { ...overrideComponents, ...overrides };
          return methods;
        },
        // 🔥 Render personalizado
        render: (
          fn: (ctx: RenderContext<TForm, TTable>) => React.ReactNode,
        ) => {
          renderFunction = fn;
          return methods;
        },
        build: (): BuildResult<TForm, TTable> => ({
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
          tableConfig,
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

// Exportar todos los tipos necesarios (sin conflictos)
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
};
