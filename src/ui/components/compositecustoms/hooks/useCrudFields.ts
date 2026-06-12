// CompositeCrud/hooks/useCrudFields.ts
import { useMemo } from "react";
import type { FieldItem, ResponsiveSizes } from "../types";
import type { BuildResult } from "../../../../models/genericmodels.model";

const DEFAULT_RESPONSIVE: ResponsiveSizes = {
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
  "2xl": 12,
};

export const useCrudFields = <TForm extends object>(
  crudConfig: BuildResult<TForm> | undefined,
  manualFields: FieldItem[] | undefined,
): FieldItem[] => {
  return useMemo((): FieldItem[] => {
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
        dateFields,
        dateRangeFields,
        numberDirectFields,
        sliderFields,
        dateConfigs,
        dateRangeConfigs,
        numberDirectConfigs,
        sliderConfigs,
        arrayFields,
        arrayConfigs,
      } = crudConfig;

      const fieldsMap = new Map<string, FieldItem>();

      const addField = (
        name: string,
        typeField: FieldItem["typeField"],
        config: any,
      ) => {
        if (fieldsMap.has(name)) return;

        let label = "";
        if (config.label) {
          label = config.required ? `${config.label} *` : config.label;
        } else {
          label = config.required ? `${name} *` : name;
        }

        const baseField: FieldItem = {
          name,
          label,
          typeField,
          multiple: config.multiple,
          disabled: config.disabled || false,
          placeholder: config.placeholder || "",
          required: config.required || false,
          headerName: config.label || name,
          responsive: config.responsive || DEFAULT_RESPONSIVE,
          caseTransform: config.caseTransform,
          uppercase: config.uppercase,
          transform: config.transform,
          onChange: config.onChange,
          onInput: config.onInput,
          hidden: config.hidden,
        };

        switch (typeField) {
          case "Text":
            baseField.type = config.type;
            break;
          case "Select":
            baseField.selectOptions = config.options;
            baseField.multiple = config.multiple;
            baseField.selectIdKey = config.keyId;
            baseField.selectLabelKey = config.keyLabel;
            baseField.selectOptionsHook = config.selectOptionsHook;
            baseField.refreshActionHook = config.refreshActionHook;
            baseField.addActionHook = config.addActionHook;
            baseField.loadingHook = config.loadingHook;
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
            baseField.selectIdKey = config.keyId;
            baseField.selectLabelKey = config.keyLabel;
            baseField.radioConfig = config;
            break;
          case "Array":
            baseField.arrayConfig = {
              fields: config.fields || [],
              allowAdd: config.allowAdd,
              allowRemove: config.allowRemove,
              addButtonLabel: config.addButtonLabel,
              itemLabel: config.itemLabel,
            };
            break;
        }
        fieldsMap.set(name, baseField);
      };

      // Añadir todos los campos
      textFields?.forEach((f) => addField(f, "Text", textConfigs?.[f] || {}));
      selectFields?.forEach((f) =>
        addField(f, "Select", selectConfigs?.[f] || {}),
      );
      fileFields?.forEach((f) => addField(f, "File", fileConfigs?.[f] || {}));
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
      dateFields?.forEach((f) => addField(f, "Date", dateConfigs?.[f] || {}));
      dateRangeFields?.forEach((f) =>
        addField(f, "DateRange", dateRangeConfigs?.[f] || {}),
      );
      numberDirectFields?.forEach((f) =>
        addField(f, "NumberDirect", numberDirectConfigs?.[f] || {}),
      );
      sliderFields?.forEach((f) =>
        addField(f, "Slider", sliderConfigs?.[f] || {}),
      );
      arrayFields?.forEach((f) => {
        const config = arrayConfigs?.[f];
        if (config) addField(f, "Array", config);
      });

      let allFields = Array.from(fieldsMap.values());

      // Ordenar según uiLayout
      if (uiLayout?.fieldsPerSection) {
        const orderedNames = Object.values(uiLayout.fieldsPerSection).flatMap(
          (def: any) =>
            Array.isArray(def)
              ? def
                  .map((item: any) =>
                    typeof item === "string" ? item : item.fields,
                  )
                  .flat()
              : [],
        );
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
};
