import React, { useMemo, useState, useEffect } from "react";
import type { GenericDataReturn } from "react-zustore";
import { motion, AnimatePresence } from "framer-motion";
import { useFormikContext } from "formik";
import { IoMdAdd } from "react-icons/io";
import { FiSearch, FiFilter, FiGrid, FiList, FiCalendar, FiDownload, FiUpload, FiActivity, FiBarChart2 } from "react-icons/fi";

import CompositePage from "./compositePage";
import StepperForm from "./StepperForm";
import BoxForm from "./BoxForm";
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

// Componentes avanzados
import SearchBar from "../advanced/SearchBar";
import FilterPanel from "../advanced/FilterPanel";
import BulkActionsBar from "../advanced/BulkActionsBar";
import ViewSwitcher from "../advanced/ViewSwitcher";
import ImportExportButtons from "../advanced/ImportExportButtons";
import DashboardStats from "../advanced/DashboardStats";
import AuditLogViewer from "../advanced/AuditLogViewer";
import KanbanView from "../advanced/KanbanView";
import CalendarView from "../advanced/CalendarView";

import type { AdvancedCrudConfig, ViewMode } from "../../types/crud-advanced.types";

// IMPORTAR TIPOS DEL MODELO CENTRAL
import type {
  BuildResult,
  RenderContext,
  OverrideComponents,
  OverrideFieldProps,
  OverrideSelectProps,
  OverrideTableProps,
} from "../../../models/genericmodels.model";

// ====================== TIPOS LOCALES ======================
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
  headerName?: string;
  renderField?: (value: any, row: any) => React.ReactNode;
  responsive?: ResponsiveSizes;
  selectOptions?: any[];
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
    [key: string]: any;
  };
}

// ====================== DESIGN SYSTEM ======================
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

interface PropsCrud<TForm extends object, TTable extends object = TForm> {
  hook: GenericDataReturn<TForm>;
  titles: {
    modalTitleAdd: string;
    modalTitleUpdate: string;
  };
  fields?: FieldItem[];
  crudConfig?: BuildResult<TForm, TTable>;
  advancedConfig?: AdvancedCrudConfig<TForm, TTable>;
}

// ====================== ADAPTADORES CONECTADOS A FORMIK ======================
const FormikTextAdapter = (props: OverrideFieldProps) => {
  return (
    <FormikInput
      name={props.name}
      label={props.label || ""}
      required={props.required}
      placeholder={props.placeholder}
      disabled={props.disabled}
    />
  );
};

const FormikSelectAdapter = (props: OverrideSelectProps) => {
  return (
    <FormikAutocomplete
      name={props.name}
      label={props.label || ""}
      disabled={props.disabled}
      options={props.options || []}
      idKey={props.config?.keyId || "id"}
      labelKey={props.config?.keyLabel || "name"}
    />
  );
};

const FormikFileAdapter = (props: OverrideFieldProps) => {
  return <FormikFileInput name={props.name} label={props.label || ""} />;
};

const FormikColorAdapter = (props: OverrideFieldProps) => {
  return (
    <FormikColorPicker
      name={props.name}
      label={props.label || ""}
      required={props.required || false}
      colorPalette={[]}
    />
  );
};

const FormikPasswordAdapter = (props: OverrideFieldProps) => {
  return <FormikPassword name={props.name} label={props.label || ""} />;
};

const FormikTextareaAdapter = (props: OverrideFieldProps) => {
  return (
    <FormikTextArea
      name={props.name}
      label={props.label || ""}
      required={props.required || false}
      placeholder={props.placeholder}
      rows={props.rows}
    />
  );
};

const FormikNumberAdapter = (props: OverrideFieldProps) => {
  return <FormikNumber name={props.name} label={props.label || ""} />;
};

const FormikRadioAdapter = (props: OverrideFieldProps) => {
  return (
    <FormikRadio
      name={props.name}
      label={props.label || ""}
      options={props.options || []}
      idKey={(props.config?.optionIdKey as string) || "id"}
      labelKey={props.config?.optionLabelKey || "label"}
    />
  );
};

const FormikToggleAdapter = (props: OverrideFieldProps) => {
  return <FormikSwitch name={props.name} label={props.label || ""} />;
};

const FormikCheckboxAdapter = (props: OverrideFieldProps) => {
  return <FormikCheckbox name={props.name} label={props.label || ""} />;
};

// ====================== COMPONENTE PRINCIPAL ======================
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
  
  // Estados para funcionalidades avanzadas
  const [showFilters, setShowFilters] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Verificar si el hook tiene funcionalidades avanzadas
  const isAdvanced = !!(hook as any).search !== undefined;
  const advancedHook = hook as any;

  // Actualizar contador de filtros activos
  useEffect(() => {
    if (advancedHook.filters) {
      const count = Object.values(advancedHook.filters).filter(v => v != null && v !== '' && v !== 'all').length;
      setActiveFilterCount(count + (advancedHook.search ? 1 : 0));
    }
  }, [advancedHook.filters, advancedHook.search]);

  // --------------------------------------------------------------
  // 1. Construir campos del formulario
  // --------------------------------------------------------------
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
        if (!fieldsMap.has(name)) {
          fieldsMap.set(name, {
            name,
            label: config.label || name,
            typeField,
            required: config.required || false,
            headerName: config.label || name,
            responsive: config.responsive || DEFAULT_RESPONSIVE,
            selectOptions: config.options,
            selectIdKey: config.keyId,
            selectLabelKey: config.keyLabel,
            fileConfig: config,
            colorConfig: config,
            passwordConfig: config,
            textareaConfig: config,
            numberConfig: config,
            radioConfig: config,
          });
        }
      };

      textFields?.forEach((field) =>
        addField(field, "Text", textConfigs?.[field] || {}),
      );
      selectFields?.forEach((field) =>
        addField(field, "Select", selectConfigs?.[field] || {}),
      );
      fileFields?.forEach((field) =>
        addField(field, "File", fileConfigs?.[field] || {}),
      );
      colorFields?.forEach((field) =>
        addField(field, "Color", colorConfigs?.[field] || {}),
      );
      passwordFields?.forEach((field) =>
        addField(field, "Password", passwordConfigs?.[field] || {}),
      );
      textareaFields?.forEach((field) =>
        addField(field, "TextArea", textareaConfigs?.[field] || {}),
      );
      numberFields?.forEach((field) =>
        addField(field, "Number", numberConfigs?.[field] || {}),
      );
      radioFields?.forEach((field) =>
        addField(field, "Radio", radioConfigs?.[field] || {}),
      );
      toggleFields?.forEach((field) =>
        addField(field, "Toggle", toggleConfigs?.[field] || {}),
      );
      checkboxFields?.forEach((field) =>
        addField(field, "Checkbox", checkboxConfigs?.[field] || {}),
      );

      let allFields = Array.from(fieldsMap.values());

      if (uiLayout?.fieldsPerSection) {
        const orderedNames = Object.values(uiLayout.fieldsPerSection).flat();
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

  // --------------------------------------------------------------
  // 2. Columnas de tabla
  // --------------------------------------------------------------
  const tableColumns = useMemo(() => {
    if (crudConfig?.tableConfig) {
      return Object.entries(crudConfig.tableConfig).map(([field, config]) => ({
        field,
        headerName: config.label || field,
        renderField: (value: any, row: TTable) =>
          config.render ? config.render(value, row) : value,
      }));
    }
    return computedFields.map((it) => ({
      field: it.name,
      headerName: it.headerName || it.label,
      renderField: (value: any, row: TForm) =>
        it.renderField ? it.renderField(value, row) : value,
    }));
  }, [crudConfig, computedFields]);

  // --------------------------------------------------------------
  // 3. Secciones
  // --------------------------------------------------------------
  const sectioned = useMemo(() => {
    if (crudConfig?.uiLayout) {
      const { fieldsPerSection, sections, mode } = crudConfig.uiLayout;
      const sectionsList = sections.map((name: string) => ({
        title: name,
        fields: computedFields.filter((field) =>
          fieldsPerSection?.[name]?.includes(field.name),
        ),
      }));
      return { hasSections: true, sectionType: mode, sections: sectionsList };
    }
    return { hasSections: false, sectionType: null, sections: [] };
  }, [crudConfig, computedFields]);

  useEffect(() => {
    if (!hook.open) setActiveStep(0);
  }, [hook.open]);

  // Protección de navegación con formulario sucio
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hook.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hook.isDirty]);

  const validationSchema = crudConfig?.validationSchema;

  // --------------------------------------------------------------
  // 4. Eliminación
  // --------------------------------------------------------------
  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await hook.deleteItem(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // --------------------------------------------------------------
  // 5. Renderizado de campos
  // --------------------------------------------------------------
  const renderField = (field: FieldItem) => {
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
            responsive={responsive}
          />
        );
    }
  };

  // --------------------------------------------------------------
  // 6. Layouts por defecto
  // --------------------------------------------------------------
  const BoxForm = ({
    sections,
  }: {
    sections: { title: string; fields: FieldItem[] }[];
  }) => {
    const formik = useFormikContext<Record<string, any>>();

    const handleSave = async () => {
      const errors = await formik.validateForm();
      const allFields = sections.flatMap((s) => s.fields);
      const allTouched = allFields.reduce(
        (acc, f) => ({ ...acc, [f.name]: true }),
        {} as Record<string, boolean>,
      );
      await formik.setTouched({ ...formik.touched, ...allTouched });
      if (Object.keys(errors).length > 0) return;
      formik.handleSubmit();
    };

    return (
      <div style={{ width: "100%" }}>
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              border: `1px solid ${DS.border}`,
              borderRadius: DS.r8,
              background: DS.white,
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: DS.accent,
                marginBottom: "16px",
                borderBottom: `2px solid ${DS.accentLight}`,
                paddingBottom: "6px",
              }}
            >
              {section.title}
            </div>
            <RowComponent>
              {section.fields.map((field) => renderField(field))}
            </RowComponent>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
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
            }}
          >
            {formik.isSubmitting ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------
  // 6.5 RenderFormContent con StepperForm y BoxForm importados
  // --------------------------------------------------------------
  const RenderFormContent = () => {
    const formik = useFormikContext();

    if (!sectioned.hasSections) {
      return (
        <RowComponent>
          {computedFields.map((field) => renderField(field))}
        </RowComponent>
      );
    }
    if (sectioned.sectionType === "stepper") {
      return (
        <StepperForm
          sections={sectioned.sections}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          renderField={renderField}
          onSave={() => formik.handleSubmit()}
        />
      );
    }
    return (
      <BoxForm
        sections={sectioned.sections}
        renderField={renderField}
        onSave={() => formik.handleSubmit()}
      />
    );
  };

  // --------------------------------------------------------------
  // 7. SOPORTE PARA .render() y .override() - SOLUCIÓN 2 (Wrapper Centralizado)
  // --------------------------------------------------------------
  if (crudConfig?.render) {
    // ✅ Componente Formik que expone el formikBag completo
    const FormikProvider = ({
      children,
    }: {
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
    }) => {
      const hasFile = computedFields.some((f) => f.typeField === "File");

      return (
        <FormikForm
          initialValues={(hook.formData || {}) as TForm}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            if (hasFile) await hook.saveItem(values as TForm, true);
            else await hook.saveItem(values as TForm);
            hook.setOpen(false);
          }}
          buttonMessage={undefined}
        >
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
        />
      );
    };

    // ✅ Overrides por defecto (ya conectados a Formik internamente)
    const defaultOverrides: OverrideComponents = {
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

    // ✅ SOLUCIÓN 2: Wrapper centralizado que conecta automáticamente los overrides del usuario a Formik
    const userWrappedOverrides: OverrideComponents = {};
    Object.entries(crudConfig.overrides || {}).forEach(([key, Comp]) => {
      if (!Comp) return;

      // La tabla no necesita wrapper porque no usa Formik
      if (key === "table") {
        userWrappedOverrides[key] = Comp;
      } else {
        // ✅ Wrapper que conecta el override del usuario con Formik
        userWrappedOverrides[key] = (props: any) => {
          const formik = useFormikContext<TForm>();
          const fieldName = props.name;

          // Obtener valores de Formik
          const value = formik.values[fieldName as keyof TForm];
          const error = formik.errors[fieldName as keyof TForm] as string;
          const touched = formik.touched[fieldName as keyof TForm] as boolean;
          const showError = touched && error;

          // Pasar todas las props necesarias al componente del usuario
          return (
            <Comp
              {...props}
              value={value}
              onChange={(newValue: any) => {
                formik.setFieldValue(fieldName, newValue);
                // Opcional: trigger validation on change
                formik.validateField(fieldName);
              }}
              onBlur={() => {
                formik.setFieldTouched(fieldName, true);
                formik.validateField(fieldName);
              }}
              error={showError ? error : undefined}
              touched={touched}
            />
          );
        };
      }
    });

    // Combinar: defaults + user (user tiene prioridad)
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
        const fieldList = crudConfig[`${type}Fields`] as string[] | undefined;
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

    // ✅ Contexto con Formik en lugar de Form
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

    return crudConfig.render(context);
  }

  // --------------------------------------------------------------
  // 8. Render final (sin render personalizado)
  // --------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dashboard Toggle */}
          {advancedConfig?.dashboard?.enabled && (
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${showDashboard ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <FiBarChart2 className="mr-1.5 h-3.5 w-3.5" />
              Dashboard
            </button>
          )}

          {/* Search Bar */}
          {advancedConfig?.search && isAdvanced && (
            <div className="w-64">
              <SearchBar
                value={advancedHook.search || ''}
                onChange={(val) => advancedHook.setSearch(val)}
                placeholder={advancedConfig.search.placeholder || "Buscar..."}
                debounceMs={advancedConfig.search.debounceMs || 300}
              />
            </div>
          )}

          {/* Filter Toggle */}
          {advancedConfig?.filters && advancedConfig.filters.length > 0 && (
            <FilterPanel
              filters={advancedConfig.filters}
              values={advancedHook?.filters || {}}
              onChange={(field, val) => advancedHook?.setFilter(field, val)}
              onClear={() => advancedHook?.clearFilters()}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              activeFilterCount={activeFilterCount}
            />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Switcher */}
          {advancedConfig?.views && advancedConfig.views.length > 1 && isAdvanced && (
            <ViewSwitcher
              currentView={advancedHook.viewMode || 'table'}
              onViewChange={(mode) => advancedHook.setViewMode(mode)}
              availableViews={advancedConfig.views.map(v => v.mode)}
            />
          )}

          {/* Import/Export */}
          {isAdvanced && (
            <ImportExportButtons
              exportConfig={advancedConfig?.export}
              importConfig={advancedConfig?.import}
              onExportCSV={() => advancedHook.exportToCSV()}
              onExportExcel={() => advancedHook.exportToExcel()}
              onImport={(file) => advancedHook.importFromFile(file)}
              isImporting={advancedHook.isImporting || false}
              importProgress={advancedHook.importProgress || 0}
            />
          )}

          {/* Audit Toggle */}
          {advancedConfig?.audit?.enabled && (
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${showAudit ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <FiActivity className="mr-1.5 h-3.5 w-3.5" />
              Auditoría
            </button>
          )}

          {/* Add Button */}
          <Tooltip content="Agregar">
            <CustomButton
              onClick={() => {
                hook.setFormData({} as TForm);
                hook.setOpen(true);
              }}
            >
              <IoMdAdd /> Nuevo
            </CustomButton>
          </Tooltip>
        </div>
      </div>

      {/* Error Display */}
      {hook.error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <span className="text-red-600 text-sm">{hook.error}</span>
          </div>
          <button
            onClick={() => hook.clearError()}
            className="text-red-600 hover:text-red-800 text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Section */}
      {showDashboard && advancedConfig?.dashboard?.enabled && isAdvanced && (
        <div className="space-y-4">
          <DashboardStats
            stats={advancedHook.dashboardStats || { total: 0, active: 0, inactive: 0, recentActivity: [] }}
            loading={hook.loadingFetch || hook.loading}
            title="Dashboard"
            onRefresh={() => advancedHook.refreshStats()}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedConfig.dashboard.widgets.map((widget) => {
              const WidgetComponent = widget.component;
              return (
                <div key={widget.id} className={`${widget.size === 'full' ? 'md:col-span-2' : ''}`}>
                  <WidgetComponent
                    data={advancedHook.filteredItems || hook.items || []}
                    stats={advancedHook.dashboardStats}
                    loading={hook.loadingFetch || hook.loading}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Panel (expanded) */}
      {showFilters && advancedConfig?.filters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <FilterPanel
            filters={advancedConfig.filters}
            values={advancedHook?.filters || {}}
            onChange={(field, val) => advancedHook?.setFilter(field, val)}
            onClear={() => advancedHook?.clearFilters()}
            isOpen={true}
            onToggle={() => setShowFilters(false)}
            activeFilterCount={activeFilterCount}
          />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {isAdvanced && advancedHook.selectedIds?.length > 0 && (
        <BulkActionsBar
          selectedCount={advancedHook.selectedIds.length}
          onClearSelection={() => advancedHook.clearSelection()}
          onBulkDelete={() => advancedHook.bulkDelete()}
          customActions={advancedConfig?.bulkActions || []}
          onCustomAction={(actionId) => advancedHook.bulkAction(actionId)}
        />
      )}

      {/* Main Content View */}
      <div className="min-h-[400px]">
        {/* Realtime Status Indicator */}
        {isAdvanced && advancedHook.isRealtimeConnected && (
          <div className="mb-2 flex items-center gap-2 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Tiempo real conectado
          </div>
        )}

        {/* View Mode: Table */}
        {(!(isAdvanced && advancedHook.viewMode) || advancedHook.viewMode === 'table') && (
          <CustomTable
            loading={hook.loadingFetch || hook.loading}
            data={isAdvanced ? advancedHook.filteredItems || [] : hook.items || []}
            paginate={[5, 10, 25, 50, 100, 500, 1000]}
            columns={tableColumns as any}
          />
        )}

        {/* View Mode: Kanban */}
        {isAdvanced && advancedHook.viewMode === 'kanban' && (
          <KanbanView
            items={advancedHook.filteredItems || hook.items || []}
            onEdit={(item) => {
              hook.setFormData(item as unknown as TForm);
              hook.setOpen(true);
            }}
            onDelete={(item) => {
              setItemToDelete(item as unknown as TForm);
              setDeleteConfirmOpen(true);
            }}
          />
        )}

        {/* View Mode: Calendar */}
        {isAdvanced && advancedHook.viewMode === 'calendar' && (
          <CalendarView
            items={advancedHook.filteredItems || hook.items || []}
            onEdit={(item) => {
              hook.setFormData(item as unknown as TForm);
              hook.setOpen(true);
            }}
            onDelete={(item) => {
              setItemToDelete(item as unknown as TForm);
              setDeleteConfirmOpen(true);
            }}
          />
        )}

        {/* View Mode: Grid/Map - Placeholder for future implementation */}
        {isAdvanced && (advancedHook.viewMode === 'grid' || advancedHook.viewMode === 'map') && (
          <div className="text-center py-12 text-gray-500">
            <p>Vista {advancedHook.viewMode} en desarrollo</p>
          </div>
        )}
      </div>

      {/* Audit Log Viewer */}
      {showAudit && (
        <AuditLogViewer
          logs={isAdvanced ? advancedHook.auditLogs || [] : []}
          loading={isAdvanced ? advancedHook.isLoadingAudit || false : false}
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
                if (hasFileFields) await hook.saveItem(values as TForm, true);
                else await hook.saveItem(values as TForm);
                hook.setOpen(false);
              }}
              validationSchema={validationSchema}
              buttonMessage={!sectioned.hasSections ? "Guardar" : undefined}
              buttonLoading={hook.loadingCreate || hook.loadingUpdate || hook.loading}
            >
              {() => <RenderFormContent />}
            </FormikForm>
          );
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-90%"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro? Esta acción no se puede deshacer.</p>
            {itemToDelete && advancedHook.selectedIds?.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Se eliminarán {advancedHook.selectedIds.length} elemento(s)
              </p>
            )}
            <div className="flex justify-end gap-3">
              <CustomButton
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                variant="solid"
                color="rose"
                onClick={handleDeleteConfirm}
                loading={hook.loadingDelete || hook.loading}
              >
                Eliminar
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Autosave Indicator */}
      {isAdvanced && advancedHook.autosaveEnabled && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Autoguardado activo
        </div>
      )}
    </div>
  );
};

export default SuperCrud;
