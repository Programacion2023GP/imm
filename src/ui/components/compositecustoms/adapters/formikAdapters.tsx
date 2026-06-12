// CompositeCrud/adapters/formikAdapters.tsx
import React from "react";
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
  FormikMultiSelect,
  FormikDatePicker,
  FormikDateRange,
  FormikNumberDirect,
  FormikSlider,
  FormikArrayTable,
} from "../../../formik/FormikInputs/FormikInput";
import FormikFileInput from "../../../formik/FormikInputs/forminputimage";
import type {
  OverrideFieldProps,
  OverrideSelectProps,
} from "../../../../models/genericmodels.model";

// ─── Text Adapter ─────────────────────────────────────────────────────────────
export const FormikTextAdapter = (props: OverrideFieldProps) => (
  <FormikInput
    name={props.name}
    label={props.label || ""}
    required={props.required}
    placeholder={props.placeholder}
    disabled={props.disabled}
  />
);

// ─── Select Adapter ───────────────────────────────────────────────────────────
export const FormikSelectAdapter = (props: OverrideSelectProps) => (
  <FormikAutocomplete
    name={props.name}
    label={props.label || ""}
    disabled={props.disabled}
    options={props.options || []}
    idKey={props.config?.keyId || "id"}
    labelKey={props.config?.keyLabel || "name"}
  />
);

// ─── Date Adapter ─────────────────────────────────────────────────────────────
export const FormikDateAdapter = (props: OverrideFieldProps) => {
  const config = props.config || {};
  return (
    <FormikDatePicker
      name={props.name}
      label={props.label || ""}
      type={config.type || "date"}
      min={config.min}
      max={config.max}
      disabled={props.disabled}
      required={props.required}
      responsive={props.responsive}
    />
  );
};

// ─── Date Range Adapter ───────────────────────────────────────────────────────
export const FormikDateRangeAdapter = (props: OverrideFieldProps) => {
  const config = props.config || {};
  return (
    <FormikDateRange
      nameFrom={config.nameFrom || props.name + "_from"}
      nameTo={config.nameTo || props.name + "_to"}
      labelFrom={config.labelFrom}
      labelTo={config.labelTo}
      min={config.min}
      max={config.max}
      disabled={props.disabled}
      required={props.required}
      label={props.label}
      responsive={props.responsive}
    />
  );
};

// ─── Number Direct Adapter ────────────────────────────────────────────────────
export const FormikNumberDirectAdapter = (props: OverrideFieldProps) => {
  const config = props.config || {};
  return (
    <FormikNumberDirect
      name={props.name}
      label={props.label || ""}
      min={config.min}
      max={config.max}
      step={config.step}
      decimals={config.decimals}
      prefix={config.prefix}
      suffix={config.suffix}
      showStepper={config.showStepper}
      disabled={props.disabled}
      required={props.required}
      placeholder={props.placeholder}
      responsive={props.responsive}
    />
  );
};

// ─── Slider Adapter ───────────────────────────────────────────────────────────
export const FormikSliderAdapter = (props: OverrideFieldProps) => {
  const config = props.config || {};
  return (
    <FormikSlider
      name={props.name}
      label={props.label || ""}
      min={config.min ?? 0}
      max={config.max ?? 100}
      step={config.step ?? 1}
      unit={config.unit}
      showTooltip={config.showTooltip}
      marks={config.marks}
      disabled={props.disabled}
      required={props.required}
      responsive={props.responsive}
    />
  );
};

// ─── File Adapter ─────────────────────────────────────────────────────────────
export const FormikFileAdapter = (props: OverrideFieldProps) => (
  <FormikFileInput name={props.name} label={props.label || ""} />
);

// ─── Color Adapter ────────────────────────────────────────────────────────────
export const FormikColorAdapter = (props: OverrideFieldProps) => (
  <FormikColorPicker
    name={props.name}
    label={props.label || ""}
    required={props.required || false}
  />
);

// ─── Password Adapter ─────────────────────────────────────────────────────────
export const FormikPasswordAdapter = (props: OverrideFieldProps) => (
  <FormikPassword name={props.name} label={props.label || ""} />
);

// ─── Textarea Adapter ─────────────────────────────────────────────────────────
export const FormikTextareaAdapter = (props: OverrideFieldProps) => (
  <FormikTextArea
    name={props.name}
    label={props.label || ""}
    required={props.required || false}
    placeholder={props.placeholder}
    rows={props.rows}
  />
);

// ─── Number Adapter ───────────────────────────────────────────────────────────
export const FormikNumberAdapter = (props: OverrideFieldProps) => (
  <FormikNumber name={props.name} label={props.label || ""} />
);

// ─── Radio Adapter ────────────────────────────────────────────────────────────
export const FormikRadioAdapter = (props: OverrideFieldProps) => (
  <FormikRadio
    name={props.name}
    label={props.label || ""}
    options={props.options || []}
    idKey={(props.config?.optionIdKey as string) || "id"}
    labelKey={props.config?.optionLabelKey || "label"}
  />
);

// ─── Toggle Adapter ───────────────────────────────────────────────────────────
export const FormikToggleAdapter = (props: OverrideFieldProps) => (
  <FormikSwitch name={props.name} label={props.label || ""} />
);

// ─── Checkbox Adapter ─────────────────────────────────────────────────────────
export const FormikCheckboxAdapter = (props: OverrideFieldProps) => (
  <FormikCheckbox name={props.name} label={props.label || ""} />
);

// ─── Array Adapter ────────────────────────────────────────────────────────────
export const FormikArrayAdapter = (props: OverrideFieldProps) => {
  const config = props.config || {};
  return (
    <FormikArrayTable
      name={props.name}
      label={props.label || ""}
      fields={config.fields || []}
      allowAdd={config.allowAdd}
      allowRemove={config.allowRemove}
      addButtonLabel={config.addButtonLabel}
      itemLabel={config.itemLabel}
      disabled={props.disabled}
      responsive={props.responsive}
    />
  );
};

// ─── Mapa de adaptadores por tipo (útil para FieldWrapper) ────────────────────
export const ADAPTERS_BY_TYPE: Record<string, React.ComponentType<any>> = {
  Text: FormikTextAdapter,
  TextArea: FormikTextareaAdapter,
  Select: FormikSelectAdapter,
  Number: FormikNumberAdapter,
  Toggle: FormikToggleAdapter,
  Checkbox: FormikCheckboxAdapter,
  Password: FormikPasswordAdapter,
  Radio: FormikRadioAdapter,
  Date: FormikDateAdapter,
  DateRange: FormikDateRangeAdapter,
  NumberDirect: FormikNumberDirectAdapter,
  Slider: FormikSliderAdapter,
  Color: FormikColorAdapter,
  File: FormikFileAdapter,
  Array: FormikArrayAdapter,
};

// ─── Default overrides para modo render ───────────────────────────────────────
export const DEFAULT_OVERRIDES = {
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
  date: FormikDateAdapter,
  daterange: FormikDateRangeAdapter,
  numberdirect: FormikNumberDirectAdapter,
  slider: FormikSliderAdapter,
};
