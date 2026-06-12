// CompositeCrud/dynamic/DynamicSelectField.tsx
import { useState, useEffect, memo, useMemo, useCallback, useRef } from "react";
import {
  FormikAutocomplete,
  FormikMultiSelect,
} from "../../../formik/FormikInputs/FormikInput";
import type { FieldItem, ResponsiveSizes, CaseTransform } from "../types";

type SelectOption = Record<string, unknown>;

// ─── Hook interno: resuelve opciones sync/async ────────────────────────────────
function useResolvedOptions(field: FieldItem): SelectOption[] {
  const hookResult: SelectOption[] | Promise<SelectOption[]> | undefined =
    field.selectOptionsHook?.();

  const [resolvedOptions, setResolvedOptions] = useState<SelectOption[]>(() => {
    if (Array.isArray(hookResult)) return hookResult;
    return field.selectOptions ?? [];
  });

  const prevRef = useRef<typeof hookResult>(undefined);

  useEffect(() => {
    if (Object.is(prevRef.current, hookResult)) return;
    prevRef.current = hookResult;

    if (!hookResult) {
      setResolvedOptions(field.selectOptions ?? []);
      return;
    }

    if (Array.isArray(hookResult)) {
      setResolvedOptions(hookResult);
      return;
    }

    const isPromise =
      typeof (hookResult as Promise<SelectOption[]>).then === "function";
    if (!isPromise) {
      setResolvedOptions(field.selectOptions ?? []);
      return;
    }

    let cancelled = false;
    (hookResult as Promise<SelectOption[]>)
      .then((data) => {
        if (!cancelled) setResolvedOptions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading select options:", err);
        if (!cancelled) setResolvedOptions([]);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookResult]);

  return resolvedOptions;
}

// ─── DynamicSelectField ────────────────────────────────────────────────────────
interface DynamicSelectFieldProps {
  field: FieldItem;
  responsive: ResponsiveSizes;
  onChange?: (value: unknown) => void;
  onInput?: (value: string) => void;
  caseTransform?: CaseTransform;
}

export const DynamicSelectField = memo(
  ({
    field,
    responsive,
    onChange,
    onInput,
    caseTransform,
  }: DynamicSelectFieldProps) => {
    const isLoadingOptions = field.loadingHook?.() ?? false;
    const options = useResolvedOptions(field);

    const refreshFn = useCallback(async (): Promise<void> => {
      if (field.refreshActionHook) {
        await Promise.resolve(field.refreshActionHook());
      }
    }, [field.refreshActionHook]);

    const addFn = useMemo(() => field.addActionHook?.(), [field.addActionHook]);

    return (
      <FormikAutocomplete
        name={field.name}
        label={field.label}
        options={options}
        idKey={field.selectIdKey ?? "id"}
        labelKey={field.selectLabelKey ?? "label"}
        responsive={responsive}
        onRefresh={refreshFn}
        onAdd={addFn}
        loading={isLoadingOptions}
        onSelect={(selectedItem) => onChange?.(selectedItem)}
        onInput={onInput}
        caseTransform={caseTransform}
      />
    );
  },
);
DynamicSelectField.displayName = "DynamicSelectField";

// ─── DynamicMultipleSelectField ────────────────────────────────────────────────
interface DynamicMultipleSelectFieldProps {
  field: FieldItem;
  responsive: ResponsiveSizes;
  onChange?: (value: unknown) => void;
  caseTransform?: CaseTransform;
}

export const DynamicMultipleSelectField = memo(
  ({ field, responsive, onChange }: DynamicMultipleSelectFieldProps) => {
    const isLoadingOptions = field.loadingHook?.() ?? false;
    const rawOptions = useResolvedOptions(field);

    // 🔥 MEMOIZAR selectOptions para que no cambie de referencia en cada render
    const selectOptions = useMemo(
      () => {
        if (!rawOptions || rawOptions.length === 0) return [];
        return rawOptions.map((opt) => ({
          value: opt[field.selectIdKey ?? "id"],
          label: opt[field.selectLabelKey ?? "name"],
        }));
      },
      // 🔥 IMPORTANTE: Convertir rawOptions a string para comparación profunda
      [JSON.stringify(rawOptions), field.selectIdKey, field.selectLabelKey],
    );

    const refreshFn = useCallback(async (): Promise<void> => {
      if (field.refreshActionHook) {
        await Promise.resolve(field.refreshActionHook());
      }
    }, [field.refreshActionHook]);

    const addFn = useMemo(() => field.addActionHook?.(), [field.addActionHook]);

    // 🔥 Manejar onChange sin crear nuevas funciones en cada render
    const handleChange = useCallback(
      (newValue: any, formikContext: any) => {
        if (field.onChange) {
          field.onChange(newValue, formikContext, undefined);
        }
        onChange?.(newValue);
      },
      [field.onChange, onChange],
    );

    return (
      <FormikMultiSelect
        name={field.name}
        label={field.label}
        options={selectOptions}
        loading={isLoadingOptions}
        disabled={field.disabled}
        required={field.required}
        placeholder={field.placeholder}
        responsive={responsive}
        onRefresh={refreshFn}
        onAdd={addFn}
        onChange={handleChange}
      />
    );
  },
);
DynamicMultipleSelectField.displayName = "DynamicMultipleSelectField";

// ─── Helper ────────────────────────────────────────────────────────────────────
export const getSelectComponent = (field: FieldItem) => {
  if (!field.selectOptionsHook) return null;
  return field.multiple === true
    ? DynamicMultipleSelectField
    : DynamicSelectField;
};
