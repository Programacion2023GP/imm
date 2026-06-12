// CompositeCrud/utils/fieldHelpers.tsx
import { useCallback, useMemo } from "react";
import { useFormikContext } from "formik";
import {
  FormikInput,
  FormikTextArea,
  FormikNumber,
  FormikSwitch,
  FormikCheckbox,
  FormikPassword,
  FormikRadio,
  FormikDatePicker,
  FormikDateRange,
  FormikNumberDirect,
  FormikSlider,
  FormikColorPicker,
  FormikArrayTable,
  FormikAutocomplete,
  FormikMultiSelect,
} from "../../../formik/FormikInputs/FormikInput";
import type {
  FieldItem,
  FieldWrapperProps,
  ResponsiveSizes,
  CaseTransform,
} from "../types";
import { DEFAULT_RESPONSIVE } from "./responsive";
import {
  DynamicSelectField,
  DynamicMultipleSelectField,
} from "../dynamic/DynamicSelectField";
import { ADAPTERS_BY_TYPE } from "../adapters/formikAdapters";
import FormikFileInput from "../../../formik/FormikInputs/forminputimage";

// ─── Process value with case transform ────────────────────────────────────────
export const processValue = (
  value: any,
  caseTransform: CaseTransform,
  transform?: (value: any) => any,
): any => {
  if (value === undefined || value === null) return value;
  let processed = value;
  if (typeof processed === "string") {
    if (caseTransform === "uppercase") processed = processed.toUpperCase();
    if (caseTransform === "lowercase") processed = processed.toLowerCase();
  }
  if (transform) processed = transform(processed);
  return processed;
};

// ─── FieldWrapper Component ───────────────────────────────────────────────────
export const FieldWrapper = ({ field, actionsDispatch }: FieldWrapperProps) => {
  const formik = useFormikContext();
  const responsive = field.responsive || DEFAULT_RESPONSIVE;
  const caseTransform =
    field.caseTransform || (field.uppercase ? "uppercase" : "none");

  // Handle select change
  const handleSelectChange = useCallback(
    (selectedItem: any) => {
      const idKey = field.selectIdKey || "id";
      const idValue = selectedItem?.[idKey];
      if (field.onChange) field.onChange(selectedItem, formik, actionsDispatch);
      formik.setFieldValue(field.name, idValue);
    },
    [field, formik, actionsDispatch],
  );

  // Handle generic change
  const handleChange = useCallback(
    (rawValue: any) => {
      const processed = processValue(rawValue, caseTransform, field.transform);
      if (field.onChange) field.onChange(processed, formik, actionsDispatch);
      formik.setFieldValue(field.name, processed);
    },
    [field, formik, actionsDispatch, caseTransform],
  );

  // Handle input event
  const handleInput = useCallback(
    (rawValue: any) => {
      const processed = processValue(rawValue, caseTransform, field.transform);
      if (field.onInput) field.onInput(processed, formik, actionsDispatch);
    },
    [field, formik, actionsDispatch, caseTransform],
  );

  // Check if field is hidden
  const isHidden = useMemo(() => {
    if (field.hidden === undefined) return false;
    if (typeof field.hidden === "function") {
      return field.hidden(formik.values);
    }
    return field.hidden;
  }, [field.hidden, formik.values]);

  if (isHidden) return null;

  const commonProps = {
    name: field.name,
    label: field.label,
    disabled: field.disabled,
    required: field.required,
    responsive,
    onBlur: () => formik.setFieldTouched(field.name, true),
  };

  // ─── Render según tipo de campo ─────────────────────────────────────────────
  switch (field.typeField) {
    case "Text":
      return (
        <FormikInput
          {...commonProps}
          type={(field.type as any) || "text"}
          caseTransform={caseTransform}
          onChange={handleChange}
          responsive={responsive}
          onInput={handleInput}
        />
      );

    case "TextArea":
      return (
        <FormikTextArea
          {...commonProps}
          rows={field.textareaConfig?.rows}
          caseTransform={caseTransform}
          onChange={handleChange}
          responsive={responsive}
          onInput={handleInput}
        />
      );

    case "Select":
      if (field.selectOptionsHook) {
        if (field.multiple) {
          return (
            <DynamicMultipleSelectField
              field={field}
              responsive={responsive}
              onChange={handleChange} // ← Cambiar a handleChange
            />
          );
        }
        return (
          <DynamicSelectField
            field={field}
            responsive={responsive}
            onChange={handleSelectChange}
            onInput={handleInput}
            caseTransform={caseTransform}
          />
        );
      }
      if (field.multiple) {
        const selectOptions = (field.selectOptions || []).map((opt) => ({
          value: opt[field.selectIdKey || "id"],
          label: opt[field.selectLabelKey || "name"],
        }));
        return (
          <FormikMultiSelect
            name={field.name}
            label={field.label}
            options={selectOptions}
            loading={field.loadingHook?.()}
            disabled={field.disabled}
            required={field.required}
            placeholder={field.placeholder}
            responsive={responsive}
          />
        );
      }
      return (
        <FormikAutocomplete
          {...commonProps}
          options={field.selectOptions || []}
          idKey={field.selectIdKey || "id"}
          labelKey={field.selectLabelKey || "label"}
          onSelect={handleSelectChange}
          onInput={handleInput}
          responsive={responsive}
          caseTransform={caseTransform}
        />
      );

    case "Number":
      return (
        <FormikNumber
          {...commonProps}
          min={field.numberConfig?.min}
          max={field.numberConfig?.max}
          step={field.numberConfig?.step}
          decimals={field.numberConfig?.decimals}
          onChange={handleChange}
        />
      );

    case "Toggle":
      return (
        <FormikSwitch
          {...commonProps}
          responsive={responsive}
          onChange={(checked) => handleChange(checked)}
        />
      );

    case "Checkbox":
      return (
        <FormikCheckbox
          {...commonProps}
          responsive={responsive}
          onChange={(checked) => handleChange(checked)}
        />
      );

    case "Password":
      return <FormikPassword {...commonProps} responsive={responsive} />;

    case "Radio":
      return (
        <FormikRadio
          {...commonProps}
          responsive={responsive}
          options={field.radioConfig?.options || []}
          idKey={field.radioConfig?.optionIdKey || "id"}
          labelKey={field.radioConfig?.optionLabelKey || "label"}
          onChange={handleChange}
        />
      );

    case "Date":
      return (
        <FormikDatePicker
          {...commonProps}
          responsive={responsive}
          type={field.dateConfig?.type || "date"}
          min={field.dateConfig?.min}
          max={field.dateConfig?.max}
          onChange={(value, formikContext) => {
            if (field.onChange)
              field.onChange(value, formikContext, actionsDispatch);
          }}
        />
      );

    case "DateRange":
      return (
        <FormikDateRange
          responsive={responsive}
          nameFrom={field.dateRangeConfig?.nameFrom || field.name + "_from"}
          nameTo={field.dateRangeConfig?.nameTo || field.name + "_to"}
          labelFrom={field.dateRangeConfig?.labelFrom}
          labelTo={field.dateRangeConfig?.labelTo}
          min={field.dateRangeConfig?.min}
          max={field.dateRangeConfig?.max}
          label={field.label}
          disabled={field.disabled}
          required={field.required}
          onChange={(from, to, formikContext) => {
            if (field.onChange)
              field.onChange({ from, to }, formikContext, actionsDispatch);
          }}
        />
      );

    case "NumberDirect":
      return (
        <FormikNumberDirect
          {...commonProps}
          min={field.numberDirectConfig?.min}
          max={field.numberDirectConfig?.max}
          step={field.numberDirectConfig?.step}
          decimals={field.numberDirectConfig?.decimals}
          prefix={field.numberDirectConfig?.prefix}
          suffix={field.numberDirectConfig?.suffix}
          showStepper={field.numberDirectConfig?.showStepper}
          placeholder={field.placeholder}
          responsive={responsive}
          onChange={(value, formikContext) => {
            if (field.onChange)
              field.onChange(value, formikContext, actionsDispatch);
          }}
        />
      );

    case "Slider":
      return (
        <FormikSlider
          {...commonProps}
          min={field.sliderConfig?.min ?? 0}
          max={field.sliderConfig?.max ?? 100}
          step={field.sliderConfig?.step ?? 1}
          unit={field.sliderConfig?.unit}
          showTooltip={field.sliderConfig?.showTooltip}
          marks={field.sliderConfig?.marks}
          responsive={responsive}
          onChange={(value, formikContext) => {
            if (field.onChange)
              field.onChange(value, formikContext, actionsDispatch);
          }}
        />
      );

    case "Color":
      return (
        <FormikColorPicker
          responsive={responsive}
          {...commonProps}
          onChange={handleChange}
        />
      );

    case "File":
      return (
        <FormikFileInput
          responsive={responsive}
          {...commonProps}
          {...field.fileConfig}
          onChange={handleChange}
        />
      );

    case "Array":
      return (
        <FormikArrayTable
          name={field.name}
          label={field.label}
          fields={field.arrayConfig?.fields || []}
          allowAdd={field.arrayConfig?.allowAdd}
          allowRemove={field.arrayConfig?.allowRemove}
          addButtonLabel={field.arrayConfig?.addButtonLabel}
          itemLabel={field.arrayConfig?.itemLabel}
          disabled={field.disabled}
          responsive={responsive}
        />
      );

    default:
      return (
        <FormikInput
          {...commonProps}
          type="text"
          responsive={responsive}
          caseTransform={caseTransform}
          onChange={handleChange}
          onInput={handleInput}
        />
      );
  }
};
