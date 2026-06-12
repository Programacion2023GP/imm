import React, { useEffect, useRef, useState, useCallback, useMemo, useId } from "react";
import { FieldArray, FormikContextType, getIn, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";
import { FaMinus, FaPlus } from "react-icons/fa";
import { AiOutlineCamera, AiOutlineClose } from "react-icons/ai";
import { createPortal } from "react-dom";
import Select from "react-select";
import { ColComponent } from "../../components/responsive/Responsive";
import { theme } from "../../../config/themes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { NumericFormat } from "react-number-format";
import { HiPlus, HiTrash } from "react-icons/hi2";

// import { theme } from "../../../styles/theme";
// ------------------------------------------------------------------
// TIPOS COMPARTIDOS
// ------------------------------------------------------------------
export type HandleModifiedFn = (
  values: Record<string, any>,
  setFieldValue: (name: string, value: any) => void,
) => void | Promise<void>;

export type CaseTransform = "uppercase" | "lowercase" | "none";

export type FormikCtx = ReturnType<
  typeof useFormikContext<Record<string, any>>
>;

type ResponsiveProps = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
};

type TreeNode<T> = T & { children_recursive?: TreeNode<T>[] };

interface Option {
  value: string | number;
  label: string;
}

// ------------------------------------------------------------------
// HELPER: transformación de case
// ------------------------------------------------------------------
function applyCase(
  value: string,
  caseTransform: CaseTransform = "none",
): string {
  if (caseTransform === "uppercase") return value.toUpperCase();
  if (caseTransform === "lowercase") return value.toLowerCase();
  return value;
}

// ------------------------------------------------------------------
// COMPONENTES INTERNOS REUTILIZABLES
// ------------------------------------------------------------------
const FieldError = ({ error }: { error: string | null }) =>
  error ? (
    <motion.div
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "6px",
        padding: "6px 10px",
        background: theme.colors.feedback.errorLight,
        border: `1px solid ${theme.colors.feedback.errorBorder}`,
        borderRadius: theme.radius.md,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: theme.colors.status.error,
        }}
      />
      <span
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: 500,
          color: theme.colors.status.error,
        }}
      >
        {error}
      </span>
    </motion.div>
  ) : null;

const DisabledField = ({
  label,
  value,
  error,
  multiline = false,
  responsive,
  padding,
}: {
  label: string;
  value: any;
  error: string | null;
  multiline?: boolean;
  responsive?: ResponsiveProps;
  padding?: boolean;
}) => (
  <ColComponent responsive={responsive} autoPadding={padding}>
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <label
        style={{
          position: "absolute",
          left: "12px",
          top: "-9px",
          fontSize: "11px",
          fontWeight: 600,
          color: theme.colors.text.disabled,
          background: theme.colors.background.surface,
          padding: "0 4px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          zIndex: 2,
        }}
      >
        {label}
      </label>
      <div
        style={{
          border: `1.5px solid ${theme.colors.border.DEFAULT}`,
          borderRadius: theme.radius.md,
          background: theme.colors.background.surface,
          padding: multiline ? "16px 12px 10px" : "13px 12px",
          minHeight: multiline ? "80px" : "50px",
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            whiteSpace: multiline ? "pre-wrap" : "normal",
          }}
        >
          {value ?? "—"}
        </span>
      </div>
      <FieldError error={error} />
    </div>
  </ColComponent>
);

// ------------------------------------------------------------------
// FORMIK INPUT
// ------------------------------------------------------------------
interface FormikInputProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "date"
    | "datetime-local"
    | "time";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  debounceMs?: number;
  mask?: (value: string) => string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  caseTransform?: CaseTransform;
  onInput?: (value: string, formik: FormikCtx) => void;
  onChange?: (value: string, formik: FormikCtx) => void;
  handleModified?: HandleModifiedFn;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikInput(props: FormikInputProps) {
  const {
    name,
    label,
    type = "text",
    disabled = false,
    readOnly = false,
    required = false,
    placeholder = " ",
    autoComplete = "off",
    debounceMs,
    mask,
    leftIcon,
    rightIcon,
    onRightIconClick,
    onBlur,
    caseTransform = "none",
    onInput,
    onChange,
    handleModified,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState<string>("");
  const debounceTimer = useRef<number>(null);

  useEffect(() => {
    const value = formik.values?.[name];
    setLocalValue(value ?? "");
  }, [formik.values, name]);

  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;
  const hasValue = localValue.length > 0;
  const isActive =
    hasValue || isFocused || type === "date" || type === "datetime-local";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let processed = mask ? mask(raw) : raw;
    processed = applyCase(processed, caseTransform);

    setLocalValue(processed);
    onInput?.(processed, formik);

    const updateField = () => {
      formik.setFieldValue(name, processed);
      onChange?.(processed, formik);
      if (handleModified) {
        handleModified(
          { ...formik.values, [name]: processed },
          formik.setFieldValue,
        );
      }
    };

    if (debounceMs) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(updateField, debounceMs);
    } else {
      updateField();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    formik.setFieldTouched(name, true);
    onBlur?.(e);
    if (handleModified && !debounceMs) {
      handleModified(formik.values, formik.setFieldValue);
    }
  };

  if (disabled) {
    return (
      <DisabledField
        label={label}
        value={localValue}
        error={error}
        responsive={responsive}
        padding={padding}
      />
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: "12px",
            top: isActive ? "-9px" : "14px",
            fontSize: isActive ? "11px" : theme.typography.fontSize.base,
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary
              : theme.colors.text.placeholder,
            background: theme.colors.background.card,
            padding: "0 4px",
            pointerEvents: "none",
            transition: theme.transitions.DEFAULT,
            letterSpacing: isActive ? "0.04em" : "0",
            textTransform: isActive ? "uppercase" : "none",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.border.focus
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            boxShadow: isFocused
              ? error
                ? theme.colors.feedback.errorGlow
                : theme.colors.feedback.primaryGlow
              : "none",
            transition: theme.transitions.DEFAULT,
          }}
        >
          {leftIcon && <span style={{ marginLeft: 12 }}>{leftIcon}</span>}
          <input
            id={name}
            name={name}
            type={type}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            style={{
              flex: 1,
              padding: `20px ${rightIcon ? "8px" : "12px"} 8px ${
                leftIcon ? "8px" : "12px"
              }`,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
              fontFamily: "inherit",
            }}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              style={{
                marginRight: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.text.placeholder,
              }}
            >
              {rightIcon}
            </button>
          )}
        </div>
        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK TEXTAREA
// ------------------------------------------------------------------
interface FormikTextAreaProps {
  name: string;
  label: string;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  debounceMs?: number;
  caseTransform?: CaseTransform;
  onInput?: (value: string, formik: FormikCtx) => void;
  onChange?: (value: string, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
  // 🔥 Nuevas props
  maxLength?: number;
  showCounter?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  autoFocus?: boolean;
}




// Utilidad para extraer texto plano desde HTML
const getPlainTextFromHtml = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

// Botón de la barra de herramientas







// ─── Helpers ────────────────────────────────────────────────────────────────

function getPlainText(html: string): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? div.innerText ?? "";
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface Responsive {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}


interface Responsive {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

interface FormikTextAreaProps {
  name: string;
  label: string;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  debounceMs?: number;
  caseTransform?: "none" | "uppercase" | "lowercase";
  responsive?: Responsive;
  padding?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  autoFocus?: boolean;
}

// ─── Tokens de diseño ───────────────────────────────────────────────────────

/**
 * FormikTextArea — Rich text editor integrado con Formik
 *
 * FIXES:
 * 1. Selector CSS scopeado por `data-rte-id` único por instancia
 *    → múltiples editores en la misma página ya NO se afectan entre sí
 * 2. Estilos de listas bonitos (✦ bullets, numeración con color primario)
 * 3. Toolbar mejorada: grupos visuales con fondo, tooltips, iconos consistentes
 * 4. isActive() recalculado en cada render via estado para que los botones
 *    se iluminen correctamente al seleccionar texto
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface FormikTextAreaProps {
  name: string;
  label: string;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  debounceMs?: number;
  caseTransform?: "none" | "uppercase" | "lowercase";

  maxLength?: number;
  showCounter?: boolean;
  autoFocus?: boolean;
}

// ─── Tokens de diseño ───────────────────────────────────────────────────────

// ------------------------------------------------------------------
// FORMIK TEXTAREA (RICH TEXT EDITOR) - CON theme GLOBAL
// ------------------------------------------------------------------

// Utilidad para extraer texto plano desde HTML


// Botón de la barra de herramientas
const ToolbarButton = ({
  onClick,
  title,
  active = false,
  danger = false,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "30px",
        height: "30px",
        padding: "0 6px",
        borderRadius: theme.radius.sm,
        border: active ? `1px solid ${theme.colors.primary.light}` : "1px solid transparent",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        transition: theme.transitions.DEFAULT,
        background: active
          ? theme.colors.feedback.primaryLight
          : hover
          ? theme.colors.background.surfaceHover
          : "transparent",
        color:
          danger && hover
            ? theme.colors.status.error
            : active
            ? theme.colors.primary.dark
            : hover
            ? theme.colors.text.primary
            : theme.colors.text.secondary,
        outline: "none",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1px",
      background: `${theme.colors.primary.DEFAULT}10`,
      borderRadius: theme.radius.sm,
      padding: "2px",
      border: `1px solid ${theme.colors.border.light}`,
    }}
  >
    {children}
  </div>
);

const ToolbarDivider = () => <div style={{ width: "6px" }} />;

// Iconos SVG inline
const Icon = {
  Bold: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  Italic: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  Underline: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  ),
  Strike: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M16 4H9a3 3 0 0 0-2.83 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  BulletList: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  OrderedList: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="2" y="8" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">1</text>
      <text x="2" y="14" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">2</text>
      <text x="2" y="20" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">3</text>
    </svg>
  ),
  AlignLeft: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  ),
  AlignCenter: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  AlignRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Link: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Unlink: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ),
  Quote: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  ),
  Code: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Clear: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
      <line x1="17" y1="7" x2="7" y2="17" />
    </svg>
  ),
  Undo: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  Redo: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  ),
};

export function FormikTextArea(props: FormikTextAreaProps) {
  const {
    name,
    label,
    rows = 4,
    disabled = false,
    readOnly = false,
    required = false,
    placeholder = "Escribe aquí...",
    debounceMs = 300,
    caseTransform = "none",
    onInput,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
    maxLength,
    showCounter,
    autoFocus = false,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isFocused, setIsFocused] = useState(false);
  const [plainLen, setPlainLen] = useState(0);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>({});

  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>("");
  const skipSyncRef = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uid = useId().replace(/:/g, "");
  const editorSelector = `[data-rte-id="${uid}"]`;

  const formikValue: string = formik.values?.[name] ?? "";

  // Sincronización Formik → DOM
  useEffect(() => {
    if (!editorRef.current) return;
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== formikValue) {
      editorRef.current.innerHTML = formikValue;
      lastHtmlRef.current = formikValue;
      setPlainLen(getPlainText(formikValue).length);
    }
  }, [formikValue]);

  useEffect(() => {
    if (autoFocus) editorRef.current?.focus();
  }, [autoFocus]);

  const refreshActiveCommands = useCallback(() => {
    try {
      setActiveCommands({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {
      /* no-op */
    }
  }, []);

  const pushToFormik = useCallback(
    (html: string) => {
      let processed = html;
      if (caseTransform === "uppercase") processed = html.toUpperCase();
      if (caseTransform === "lowercase") processed = html.toLowerCase();
      skipSyncRef.current = true;
      const commit = () => {
        formik.setFieldValue(name, processed);
        onChange?.(processed, formik);
        onInput?.(processed, formik);
      };
      if (debounceMs > 0) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(commit, debounceMs);
      } else {
        commit();
      }
    },
    [name, formik, debounceMs, caseTransform, onChange, onInput],
  );

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plain = getPlainText(html);
    if (maxLength && plain.length > maxLength) {
      editorRef.current.innerHTML = lastHtmlRef.current;
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }
    lastHtmlRef.current = html;
    setPlainLen(plain.length);
    pushToFormik(html);
    refreshActiveCommands();
  };

  const handleBlur = () => {
    setIsFocused(false);
    formik.setFieldTouched(name, true);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  };

  const handleKeyUp = () => refreshActiveCommands();
  const handleMouseUp = () => refreshActiveCommands();

  const exec = useCallback(
    (command: string, value?: string) => {
      if (disabled || readOnly) return;
      document.execCommand(command, false, value);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        lastHtmlRef.current = html;
        setPlainLen(getPlainText(html).length);
        pushToFormik(html);
        refreshActiveCommands();
      }
    },
    [disabled, readOnly, pushToFormik, refreshActiveCommands],
  );

  const insertLink = () => {
    const url = prompt("URL del enlace:", "https://");
    if (url) exec("createLink", url);
  };

  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const hasValue = plainLen > 0;
  const labelRaised = hasValue || isFocused;
  const minHeight = `${rows * 1.6 + 1}rem`;
  const shouldShowCounter = showCounter || (maxLength && maxLength > 0);
  const counterWarn = maxLength && plainLen >= maxLength * 0.85;

  if (disabled) {
    return (
      <DisabledField
        label={label}
        value={getPlainText(formikValue)}
        error={error}
        multiline
        responsive={responsive}
        padding={padding}
      />
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ marginBottom: "28px", position: "relative" }}>
        {/* Wrapper con borde gradiente animado */}
        <div
          style={{
            borderRadius: theme.radius.xl,
            padding: "2px",
            background: error
              ? `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.critical})`
              : isFocused
              ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.light}, ${theme.colors.secondary?.DEFAULT || "#06b6d4"})`
              : `linear-gradient(135deg, ${theme.colors.border.DEFAULT}, ${theme.colors.border.DEFAULT})`,
            transition: theme.transitions.DEFAULT,
            boxShadow: isFocused
              ? error
                ? `0 6px 24px ${theme.colors.status.error}30`
                : `0 6px 24px ${theme.colors.primary.DEFAULT}38`
              : "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              borderRadius: "16px",
              background: theme.colors.background.card,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", paddingTop: "24px" }}>
              {/* Label flotante */}
              <label
                style={{
                  position: "absolute",
                  left: "14px",
                  top: labelRaised ? "6px" : "calc(24px + 0.55rem)",
                  transform: labelRaised ? "none" : "translateY(-50%)",
                  fontSize: labelRaised ? "10px" : "14px",
                  fontWeight: labelRaised ? 700 : 500,
                  color: error
                    ? theme.colors.status.error
                    : isFocused
                    ? theme.colors.primary.DEFAULT
                    : labelRaised
                    ? theme.colors.text.secondary
                    : theme.colors.text.placeholder,
                  letterSpacing: labelRaised ? "0.07em" : "0",
                  textTransform: labelRaised ? "uppercase" : "none",
                  pointerEvents: "none",
                  transition: theme.transitions.DEFAULT,
                  zIndex: 3,
                  background: labelRaised ? theme.colors.background.card : "transparent",
                  padding: labelRaised ? "0 4px" : "0",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
                {required && (
                  <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
                    *
                  </span>
                )}
              </label>

              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px 8px",
                  borderBottom: `1px solid ${theme.colors.border.light}`,
                  background: theme.colors.background.surface,
                }}
              >
                <ToolbarGroup>
                  <ToolbarButton onClick={() => exec("bold")} title="Negrita (Ctrl+B)" active={activeCommands.bold}>
                    <Icon.Bold />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("italic")} title="Cursiva (Ctrl+I)" active={activeCommands.italic}>
                    <Icon.Italic />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("underline")} title="Subrayado (Ctrl+U)" active={activeCommands.underline}>
                    <Icon.Underline />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("strikeThrough")} title="Tachado" active={activeCommands.strikeThrough}>
                    <Icon.Strike />
                  </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                <ToolbarGroup>
                  <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Lista con viñetas" active={activeCommands.insertUnorderedList}>
                    <Icon.BulletList />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("insertOrderedList")} title="Lista numerada" active={activeCommands.insertOrderedList}>
                    <Icon.OrderedList />
                  </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                <ToolbarGroup>
                  <ToolbarButton onClick={() => exec("justifyLeft")} title="Alinear izquierda" active={activeCommands.justifyLeft}>
                    <Icon.AlignLeft />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("justifyCenter")} title="Centrar" active={activeCommands.justifyCenter}>
                    <Icon.AlignCenter />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("justifyRight")} title="Alinear derecha" active={activeCommands.justifyRight}>
                    <Icon.AlignRight />
                  </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                <ToolbarGroup>
                  <ToolbarButton onClick={insertLink} title="Insertar enlace">
                    <Icon.Link />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("unlink")} title="Quitar enlace" danger>
                    <Icon.Unlink />
                  </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                <ToolbarGroup>
                  <ToolbarButton onClick={() => exec("formatBlock", "<blockquote>")} title="Cita en bloque">
                    <Icon.Quote />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("formatBlock", "<pre>")} title="Bloque de código">
                    <Icon.Code />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("removeFormat")} title="Limpiar todo el formato" danger>
                    <Icon.Clear />
                  </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                <ToolbarGroup>
                  <ToolbarButton onClick={() => exec("undo")} title="Deshacer (Ctrl+Z)">
                    <Icon.Undo />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => exec("redo")} title="Rehacer (Ctrl+Y)">
                    <Icon.Redo />
                  </ToolbarButton>
                </ToolbarGroup>
              </div>

              {/* Editor contentEditable */}
              <div
                ref={editorRef}
                contentEditable={!readOnly}
                data-rte-id={uid}
                data-placeholder={placeholder}
                dir="ltr"
                onInput={handleInput}
                onFocus={() => {
                  setIsFocused(true);
                  refreshActiveCommands();
                }}
                onBlur={handleBlur}
                onPaste={handlePaste}
                onKeyUp={handleKeyUp}
                onMouseUp={handleMouseUp}
                suppressContentEditableWarning
                style={{
                  minHeight,
                  maxHeight: "420px",
                  overflowY: "auto",
                  padding: "14px 16px",
                  fontSize: theme.typography.fontSize.base,
                  lineHeight: "1.7",
                  color: theme.colors.text.primary,
                  fontFamily: "inherit",
                  outline: "none",
                  wordBreak: "break-word",
                  direction: "ltr",
                  textAlign: "left",
                }}
              />
            </div>
          </div>
        </div>

        {/* Pie: error + contador */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "6px",
            minHeight: "20px",
            padding: "0 4px",
          }}
        >
          <FieldError error={error} />
          {shouldShowCounter && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: counterWarn
                  ? theme.colors.status.error
                  : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.disabled,
                background: counterWarn
                  ? `${theme.colors.status.error}10`
                  : isFocused
                  ? `${theme.colors.primary.DEFAULT}10`
                  : "transparent",
                padding: "2px 8px",
                borderRadius: "20px",
                transition: theme.transitions.DEFAULT,
              }}
            >
              {plainLen}
              {maxLength && ` / ${maxLength}`}
            </span>
          )}
        </div>

        {/* Estilos CSS scopeados */}
        <style>{`
          ${editorSelector}[data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: ${theme.colors.text.placeholder};
            pointer-events: none;
            font-style: italic;
          }

          ${editorSelector} ul {
            padding-left: 1.8rem;
            margin: 0.5rem 0;
            list-style: none !important;
          }
          ${editorSelector} ul > li {
            position: relative;
            margin: 0.3rem 0;
            padding-left: 0.1rem;
            list-style: none !important;
          }
          ${editorSelector} ul > li::before {
            content: "✦";
            color: ${theme.colors.primary.DEFAULT};
            font-size: 0.6em;
            position: absolute;
            left: -1.35rem;
            top: 0.22em;
            line-height: 1;
          }
          ${editorSelector} ul ul > li::before {
            content: "◆";
            font-size: 0.5em;
            color: ${theme.colors.text.secondary};
            top: 0.3em;
          }
          ${editorSelector} ul ul ul > li::before {
            content: "–";
            font-size: 0.85em;
            top: 0.06em;
            color: ${theme.colors.text.placeholder};
          }

          ${editorSelector} ol {
            padding-left: 1.8rem;
            margin: 0.5rem 0;
            list-style: none !important;
            counter-reset: rte-ol;
          }
          ${editorSelector} ol > li {
            position: relative;
            margin: 0.3rem 0;
            padding-left: 0.1rem;
            list-style: none !important;
            counter-increment: rte-ol;
          }
          ${editorSelector} ol > li::before {
            content: counter(rte-ol);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.25rem;
            height: 1.25rem;
            background: ${theme.colors.feedback.primaryLight};
            color: ${theme.colors.primary.dark};
            font-weight: 700;
            font-size: 0.72em;
            border-radius: 50%;
            position: absolute;
            left: -1.65rem;
            top: 0.12em;
          }

          ${editorSelector} a {
            color: ${theme.colors.primary.DEFAULT};
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          ${editorSelector} a:hover {
            opacity: 0.75;
          }

          ${editorSelector} blockquote {
            border-left: 3px solid ${theme.colors.primary.DEFAULT};
            background: ${theme.colors.feedback.primaryLight};
            padding: 0.5rem 1rem;
            margin: 0.6rem 0;
            border-radius: 0 ${theme.radius.sm} ${theme.radius.sm} 0;
            color: ${theme.colors.text.secondary};
            font-style: italic;
          }

          ${editorSelector} pre {
            background: ${theme.colors.background.surface};
            padding: 0.7rem 1rem;
            border-radius: ${theme.radius.md};
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 0.85em;
            overflow-x: auto;
            border: 1px solid ${theme.colors.border.light};
            margin: 0.5rem 0;
          }
          ${editorSelector} code {
            background: ${theme.colors.background.surface};
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 0.875em;
            border: 1px solid ${theme.colors.border.light};
          }

          ${editorSelector}::-webkit-scrollbar {
            width: 5px;
          }
          ${editorSelector}::-webkit-scrollbar-track {
            background: transparent;
          }
          ${editorSelector}::-webkit-scrollbar-thumb {
            background: ${theme.colors.border.DEFAULT};
            border-radius: 3px;
          }
          ${editorSelector}::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.text.placeholder};
          }
        `}</style>
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK PASSWORD
// ------------------------------------------------------------------
interface FormikPasswordProps {
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikPassword(props: FormikPasswordProps) {
  const {
    name,
    label,
    disabled = false,
    required = false,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;
  const formik = useFormikContext<Record<string, any>>();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const value = (formik.values?.[name] as string) ?? "";
  const hasValue = value.length > 0;
  const isActive = hasValue || isFocused;
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  if (disabled) {
    return (
      <DisabledField
        label={label}
        value={value}
        error={error}
        responsive={responsive}
        padding={padding}
      />
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: "12px",
            top: isActive ? "-9px" : "14px",
            fontSize: isActive ? "11px" : theme.typography.fontSize.base,
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary
              : theme.colors.text.placeholder,
            background: theme.colors.background.card,
            padding: "0 4px",
            transition: theme.transitions.DEFAULT,
            letterSpacing: isActive ? "0.04em" : "0",
            textTransform: isActive ? "uppercase" : "none",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.border.focus
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            boxShadow: isFocused ? theme.colors.feedback.primaryGlow : "none",
            transition: theme.transitions.DEFAULT,
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            id={name}
            value={value}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              formik.setFieldTouched(name, true);
            }}
            style={{
              flex: 1,
              padding: "20px 12px 8px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={{
              padding: "0 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.text.placeholder,
            }}
          >
            {showPassword ? <IoMdEye size={18} /> : <IoIosEyeOff size={18} />}
          </button>
        </div>
        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK NUMBER
// ------------------------------------------------------------------
interface FormikNumberProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: boolean;
  romanNumerals?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: number, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikNumber(props: FormikNumberProps) {
  const {
    name,
    label,
    min = 0,
    max = Infinity,
    step = 1,
    decimals = false,
    romanNumerals = false,
    disabled = false,
    required = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const value = (formik.values?.[name] as number) ?? 0;

  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  // Conversión a números romanos
  const toRoman = (num: number): string => {
    const map: [string, number][] = [
      ["M", 1000],
      ["CM", 900],
      ["D", 500],
      ["CD", 400],
      ["C", 100],
      ["XC", 90],
      ["L", 50],
      ["XL", 40],
      ["X", 10],
      ["IX", 9],
      ["V", 5],
      ["IV", 4],
      ["I", 1],
    ];
    let roman = "";
    let n = num;
    for (const [letter, val] of map) {
      while (n >= val) {
        roman += letter;
        n -= val;
      }
    }
    return roman;
  };

  // Formateo para mostrar
  const formatDisplay = (num: number) => {
    if (romanNumerals) return toRoman(num);
    return decimals ? num.toFixed(2) : Math.floor(num).toString();
  };

  // Actualiza el valor real (Formik + clamp)
  const setValue = (newVal: number) => {
    const clamped = Math.min(max, Math.max(min, newVal));
    formik.setFieldValue(name, clamped);
    onChange?.(clamped, formik);
    // Sincronizar el inputValue con el nuevo valor formateado
    if (!romanNumerals) {
      setInputValue(formatDisplay(clamped));
    }
  };

  // Manejo del cambio de texto en el input (solo si no es romano)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (romanNumerals) return;
    const raw = e.target.value;
    setInputValue(raw);
  };

  // Al perder foco, parsear el texto a número
  const handleBlur = () => {
    setIsFocused(false);
    formik.setFieldTouched(name, true);

    if (romanNumerals) {
      // En modo romano no se edita, solo se marca touched
      return;
    }

    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      parsed = min;
    }
    // Si decimals es false, redondeamos a entero
    if (!decimals) {
      parsed = Math.floor(parsed);
    }
    setValue(parsed);
  };

  // Cuando el valor externo (value) cambia, actualizar inputValue si no está enfocado
  // para mantener sincronía
  React.useEffect(() => {
    if (!isFocused && !romanNumerals) {
      setInputValue(formatDisplay(value));
    }
  }, [value, isFocused, romanNumerals, decimals]);

  // Inicializar inputValue
  React.useEffect(() => {
    if (!romanNumerals) {
      setInputValue(formatDisplay(value));
    }
  }, []);

  if (disabled) {
    return (
      <DisabledField
        label={label}
        value={formatDisplay(value)}
        error={error}
        responsive={responsive}
        padding={padding}
      />
    );
  }

  // Mostramos el valor formateado (romano) o el texto editable
  const displayValue = romanNumerals ? formatDisplay(value) : inputValue;

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <label
          style={{
            position: "absolute",
            left: "12px",
            top: "-9px",
            fontSize: "11px",
            fontWeight: 600,
            color: error
              ? theme.colors.status.error
              : isFocused
                ? theme.colors.primary.DEFAULT
                : theme.colors.text.secondary,
            background: theme.colors.background.card,
            padding: "0 4px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error ? theme.colors.border.error : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setValue(value - step)}
            style={{
              width: 40,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.colors.background.surface,
              border: "none",
              borderRight: `1px solid ${theme.colors.border.DEFAULT}`,
              cursor: "pointer",
            }}
          >
            <FaMinus size={10} />
          </button>
          <input
            type="text"
            value={displayValue}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onChange={handleTextChange}
            readOnly={romanNumerals} // Si es romano, no editable
            style={{
              flex: 1,
              padding: "10px 8px",
              textAlign: "center",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: theme.typography.fontSize.base,
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          />
          <button
            type="button"
            onClick={() => setValue(value + step)}
            style={{
              width: 40,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.colors.background.surface,
              border: "none",
              borderLeft: `1px solid ${theme.colors.border.DEFAULT}`,
              cursor: "pointer",
            }}
          >
            <FaPlus size={10} />
          </button>
        </div>
        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK CHECKBOX
// ------------------------------------------------------------------
interface FormikCheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: boolean, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikCheckbox(props: FormikCheckboxProps) {
  const {
    name,
    label,
    disabled = false,
    required = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;
  const formik = useFormikContext<Record<string, any>>();
  const value = !!formik.values?.[name];
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const handleToggle = () => {
    if (disabled) return;
    const next = !value;
    formik.setFieldValue(name, next);
    onChange?.(next, formik);
  };

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={handleToggle}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: theme.radius.sm,
            background: value
              ? theme.colors.primary.DEFAULT
              : theme.colors.background.card,
            border: `2px solid ${
              error
                ? theme.colors.border.error
                : value
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.border.DEFAULT
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value && (
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <label
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: 500,
            color: value
              ? theme.colors.text.primary
              : theme.colors.text.secondary,
            userSelect: "none",
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>
      </div>
      <FieldError error={error} />
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK SWITCH
// ------------------------------------------------------------------
interface FormikSwitchProps {
  name: string;
  label: string;
  disabled?: boolean;
  onChange?: (value: boolean, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
}

export function FormikSwitch(props: FormikSwitchProps) {
  const {
    name,
    label,
    disabled = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
  } = props;
  const formik = useFormikContext<Record<string, any>>();
  const value = !!formik.values?.[name];
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  return (
    <ColComponent responsive={responsive}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <label
          style={{
            position: "relative",
            display: "inline-flex",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={value}
            disabled={disabled}
            onChange={(e) => {
              const next = e.target.checked;
              formik.setFieldValue(name, next ? 1 : 0);
              onChange?.(next, formik);
            }}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          />
          <div
            style={{
              width: 70,
              height: 32,
              borderRadius: 100,
              background: value
                ? theme.colors.primary.DEFAULT
                : theme.colors.border.DEFAULT,
              transition: theme.transitions.DEFAULT,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 4,
                left: value ? 42 : 4,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: theme.colors.background.card,
                transition: theme.transitions.DEFAULT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                color: theme.colors.text.primary,
              }}
            >
              {value ? "SÍ" : "NO"}
            </div>
          </div>
        </label>

        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: 500,
            color: theme.colors.text.primary,
          }}
        >
          {label}
        </span>

        {error && (
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.status.error,
            }}
          >
            {error}
          </span>
        )}
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK RADIO
// ------------------------------------------------------------------
interface FormikRadioProps<TOption> {
  name: string;
  label: string;
  options: TOption[];
  idKey: keyof TOption;
  labelKey: keyof TOption;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: any, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikRadio<TOption>(props: FormikRadioProps<TOption>) {
  const {
    name,
    label,
    options,
    idKey,
    labelKey,
    disabled = false,
    required = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;
  const formik = useFormikContext<Record<string, any>>();
  const value = formik.values?.[name];
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div
        style={{
          position: "relative",
          marginBottom: "20px",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <label
          style={{
            position: "absolute",
            left: "12px",
            top: "-9px",
            fontSize: "11px",
            fontWeight: 600,
            color: error
              ? theme.colors.status.error
              : theme.colors.text.secondary,
            background: theme.colors.background.card,
            padding: "0 4px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>
        <div
          style={{
            border: `1.5px solid ${
              error ? theme.colors.border.error : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            padding: "16px 12px 10px",
            background: theme.colors.background.card,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {options.map((option) => {
              const optValue = option[idKey];
              const isSelected = String(value) === String(optValue);
              return (
                <label
                  key={String(optValue)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    borderRadius: theme.radius.md,
                    border: `1.5px solid ${
                      isSelected
                        ? error
                          ? theme.colors.border.error
                          : theme.colors.primary.DEFAULT
                        : theme.colors.border.DEFAULT
                    }`,
                    background: isSelected
                      ? error
                        ? "rgba(220,38,38,0.06)"
                        : theme.colors.feedback.primaryLight
                      : theme.colors.background.card,
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: theme.transitions.DEFAULT,
                  }}
                  onClick={() => {
                    if (!disabled) {
                      formik.setFieldValue(name, optValue);
                      onChange?.(optValue, formik);
                    }
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `2px solid ${
                        isSelected
                          ? error
                            ? theme.colors.border.error
                            : theme.colors.primary.DEFAULT
                          : theme.colors.border.DEFAULT
                      }`,
                      background: isSelected
                        ? error
                          ? theme.colors.border.error
                          : theme.colors.primary.DEFAULT
                        : theme.colors.background.card,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "13.5px",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    }}
                  >
                    {String(option[labelKey])}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK AUTOCOMPLETE
// ------------------------------------------------------------------

// Fallback manual para getIn


export interface FormikAutocompleteProps<TOption> {
  name: string;
  label: string;
  options: TOption[];
  idKey: keyof TOption;
  labelKey: keyof TOption;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  responsive?: Record<string, number>;
  padding?: boolean;
  compact?: boolean;
  onSelect?: (option: TOption | null) => void;
  onRefresh?: () => Promise<void>;
  onAdd?: () => void;
  onChange?: (value: any, formik: any) => void;
  onInput?: (value: string, formik: any) => void;
  caseTransform?: "uppercase" | "lowercase" | "none";
}

export function FormikAutocomplete<TOption>(
  props: FormikAutocompleteProps<TOption>,
) {
  const {
    name,
    label,
    options,
    idKey,
    labelKey,
    loading = false,
    disabled = false,
    required = false,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
    compact = false,
    onSelect,
    onRefresh,
    onAdd,
    onChange,
    onInput,
    caseTransform = "none",
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 200,
    placement: "bottom" as "bottom" | "top",
  });

  // ✅ Lectura correcta de valores anidados usando getIn
  const value = getIn(formik.values, name);
  const touched = getIn(formik.touched, name);
  const errorRaw = getIn(formik.errors, name);
  const error = touched && errorRaw ? String(errorRaw) : null;

  const hasValue = searchTerm.length > 0;
  const isActive = hasValue || isFocused || isOpen;

  const filteredOptions = useMemo(() => {
    const search = searchTerm.toLowerCase();
    if (!search) return options;
    return (options as any[]).filter((opt) =>
      String(opt[labelKey]).toLowerCase().includes(search),
    );
  }, [options, searchTerm, labelKey]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = Math.min(320, filteredOptions.length * 42 + 90);
    const GAP = 4;

    let topPosition: number;
    let placement: "bottom" | "top";
    let maxHeight: number;

    if (spaceBelow >= estimatedHeight + GAP) {
      placement = "bottom";
      topPosition = rect.bottom + window.scrollY + GAP;
      maxHeight = Math.min(estimatedHeight, spaceBelow - 20);
    } else if (spaceAbove >= estimatedHeight + GAP) {
      placement = "top";
      topPosition = rect.top + window.scrollY - estimatedHeight - GAP;
      maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
    } else {
      placement = "bottom";
      topPosition = rect.bottom + window.scrollY + GAP;
      maxHeight = Math.max(150, spaceBelow - 20);
    }

    setDropdownPosition({
      top: topPosition,
      left: rect.left + window.scrollX,
      width: rect.width,
      maxHeight: Math.max(150, maxHeight),
      placement,
    });
  };

  const openDropdown = () => {
    if (disabled || isOpen) return;
    updateDropdownPosition();
    setIsOpen(true);
    setIsFocused(true);
  };

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsFocused(false);
    } else {
      if (disabled) return;
      updateDropdownPosition();
      setIsOpen(true);
      setIsFocused(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, filteredOptions.length]);

  // ✅ Sincronizar searchTerm con el valor anidado
  useEffect(() => {
    if (!value && value !== 0) {
      setSearchTerm("");
      return;
    }
    const selected = (options as any[]).find(
      (opt) => String(opt[idKey]) === String(value),
    );
    if (selected) {
      setSearchTerm(String(selected[labelKey]));
    } else {
      setSearchTerm("");
    }
  }, [value, options, idKey, labelKey]);

  const handleSelect = (opt: any) => {
    const newValue = opt[idKey];
    setSearchTerm(String(opt[labelKey]));
    formik.setFieldValue(name, newValue);
    formik.setFieldTouched(name, true);
    onChange?.(newValue, formik);
    onSelect?.(opt);
    closeDropdown();
    inputRef.current?.blur();
  };

  const handleRefreshClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd?.();
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "0 7px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: theme.colors.text.disabled,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    height: "28px",
    width: "28px",
    transition: "color 0.15s, background 0.15s",
  };

  if (disabled) {
    return (
      <DisabledField
        label={label}
        value={searchTerm || ""}
        error={error}
        responsive={responsive}
        padding={padding}
      />
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div
        ref={containerRef}
        style={{ position: "relative", marginBottom: compact ? "0" : "20px" }}
      >
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: "12px",
            top: isActive ? "-9px" : "14px",
            fontSize: isActive ? "11px" : theme.typography.fontSize.base,
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary
              : theme.colors.text.placeholder,
            background: theme.colors.background.card,
            padding: "0 4px",
            transition: theme.transitions.DEFAULT,
            letterSpacing: isActive ? "0.04em" : "0",
            textTransform: isActive ? "uppercase" : "none",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.border.focus
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            boxShadow: isFocused ? theme.colors.feedback.primaryGlow : "none",
            transition: theme.transitions.DEFAULT,
          }}
        >
          <input
            ref={inputRef}
            id={name}
            type="text"
            value={searchTerm}
            placeholder=" "
            autoComplete="off"
            onFocus={() => {
              setIsFocused(true);
              openDropdown();
            }}
            onChange={(e) => {
              const query = applyCase(e.target.value, caseTransform);
              setSearchTerm(query);
              onInput?.(query, formik);
              if (query === "") {
                formik.setFieldValue(name, null);
                onChange?.(null, formik);
              }
              if (!isOpen) {
                updateDropdownPosition();
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                const active = document.activeElement;
                const inDropdown = dropdownRef.current?.contains(active);
                const inContainer = containerRef.current?.contains(active);
                if (!inDropdown && !inContainer) {
                  closeDropdown();
                }
              }, 0);
            }}
            style={{
              flex: 1,
              padding: compact ? "8px 10px" : "20px 12px 8px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
            }}
          />

          {(onRefresh || onAdd) && (
            <div
              style={{
                width: "1px",
                height: "20px",
                background: theme.colors.border.DEFAULT,
                margin: "0 2px",
                flexShrink: 0,
              }}
            />
          )}

          {onRefresh && (
            <button
              type="button"
              title="Actualizar opciones"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              style={actionButtonStyle}
            >
              {isRefreshing ? (
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: `2px solid ${theme.colors.border.DEFAULT}`,
                    borderTopColor: theme.colors.primary.DEFAULT,
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              )}
            </button>
          )}

          {onAdd && (
            <button
              type="button"
              title="Agregar nuevo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAddClick}
              style={actionButtonStyle}
            >
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}

          {(onRefresh || onAdd) && (
            <div
              style={{
                width: "1px",
                height: "20px",
                background: theme.colors.border.DEFAULT,
                margin: "0 2px",
                flexShrink: 0,
              }}
            />
          )}

          {loading ? (
            <div style={{ padding: "0 12px" }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${theme.colors.border.DEFAULT}`,
                  borderTopColor: theme.colors.primary.DEFAULT,
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleOpen();
              }}
              style={{
                padding: "0 12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.text.placeholder,
              }}
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: theme.transitions.DEFAULT,
                }}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        <FieldError error={error} />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              background: theme.colors.background.card,
              border: `1.5px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadows.dropdown,
              zIndex: theme.zIndex.portal,
              maxHeight: dropdownPosition.maxHeight,
              overflow: "auto",
            }}
          >
            <div style={{ padding: "4px" }}>
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: theme.colors.text.disabled,
                  }}
                >
                  Sin opciones
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={String(opt[idKey])}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: theme.radius.md,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        theme.colors.feedback.primaryLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: "13.5px" }}>
                      {String(opt[labelKey])}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </ColComponent>
  );
}
// ------------------------------------------------------------------
// FORMIK COLOR PICKER
// ------------------------------------------------------------------
interface FormikColorPickerProps {
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikColorPicker(props: FormikColorPickerProps) {
  const {
    name,
    label,
    disabled = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formik = useFormikContext<Record<string, any>>();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    transformOrigin: "top" as "top" | "bottom",
  });

  // Estado local para el color (garantiza la actualización visual)
  const [selectedColor, setSelectedColor] = useState<string>(
    getIn(formik.values, name) || "#3B82F6",
  );

  // Sincronizar con Formik cuando el valor cambie externamente
  useEffect(() => {
    const newValue = getIn(formik.values, name);
    if (newValue && newValue !== selectedColor) {
      setSelectedColor(newValue);
    }
  }, [formik.values, name, selectedColor]);

  const colorPalette = [
    "#DBEAFE",
    "#BFDBFE",
    "#93C5FD",
    "#60A5FA",
    "#3B82F6",
    "#2563EB",
    "#1D4ED8",
    "#1E40AF",
    "#1E3A8A",
    "#FEE2E2",
    "#FECACA",
    "#FCA5A5",
    "#F87171",
    "#EF4444",
    "#DC2626",
    "#B91C1C",
    "#991B1B",
    "#7F1D1D",
    "#D1FAE5",
    "#A7F3D0",
    "#6EE7B7",
    "#34D399",
    "#10B981",
    "#059669",
    "#047857",
    "#065F46",
    "#064E3B",
    "#FEF3C7",
    "#FDE68A",
    "#FCD34D",
    "#FBBF24",
    "#F59E0B",
    "#D97706",
    "#B45309",
    "#92400E",
    "#78350F",
    "#EDE9FE",
    "#DDD6FE",
    "#C4B5FD",
    "#A78BFA",
    "#8B5CF6",
    "#7C3AED",
    "#6D28D9",
    "#5B21B6",
    "#4C1D95",
    "#FCE7F3",
    "#FBCFE8",
    "#F9A8D4",
    "#F472B6",
    "#EC4899",
    "#DB2777",
    "#BE185D",
    "#9D174D",
    "#831843",
    "#CFFAFE",
    "#A5F3FC",
    "#67E8F9",
    "#22D3EE",
    "#06B6D4",
    "#0891B2",
    "#0E7490",
    "#155E75",
    "#164E63",
    "#FFEDD5",
    "#FED7AA",
    "#FDBA74",
    "#FB923C",
    "#F97316",
    "#EA580C",
    "#C2410C",
    "#9A3412",
    "#7C2D12",
    "#E0E7FF",
    "#C7D2FE",
    "#A5B4FC",
    "#818CF8",
    "#6366F1",
    "#4F46E5",
    "#4338CA",
    "#3730A3",
    "#312E81",
    "#CCFBF1",
    "#99F6E4",
    "#5EEAD4",
    "#2DD4BF",
    "#14B8A6",
    "#0D9488",
    "#0F766E",
    "#115E59",
    "#134E4A",
    "#FAE8FF",
    "#F5D0FE",
    "#F0ABFC",
    "#E879F9",
    "#D946EF",
    "#C026D3",
    "#A21CAF",
    "#86198F",
    "#701A75",
    "#ECFCCB",
    "#D9F99D",
    "#BEF264",
    "#A3E635",
    "#84CC16",
    "#65A30D",
    "#4D7C0F",
    "#3F6212",
    "#365314",
    "#F3F4F6",
    "#E5E7EB",
    "#D1D5DB",
    "#9CA3AF",
    "#6B7280",
    "#4B5563",
    "#374151",
    "#1F2937",
    "#111827",
    "#F1F5F9",
    "#E2E8F0",
    "#CBD5E1",
    "#94A3B8",
    "#64748B",
    "#475569",
    "#334155",
    "#1E293B",
    "#0F172A",
    "#F4F4F5",
    "#E4E4E7",
    "#D4D4D8",
    "#A1A1AA",
    "#71717A",
    "#52525B",
    "#3F3F46",
    "#27272A",
    "#18181B",
  ];

  const currentColor = selectedColor || "#3B82F6";
  const error =
    getIn(formik.touched, name) && getIn(formik.errors, name)
      ? String(getIn(formik.errors, name))
      : null;

  // Posicionamiento del dropdown (con portal)
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current || !isOpen) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 280;
    const dropdownHeight = 320;
    const spacing = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number;
    let transformOrigin: "top" | "bottom";
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dropdownHeight + spacing || spaceBelow >= spaceAbove) {
      top = rect.bottom + spacing;
      transformOrigin = "top";
    } else {
      top = rect.top - dropdownHeight - spacing;
      transformOrigin = "bottom";
    }

    let left = rect.left;
    const overflowRight = left + dropdownWidth - viewportWidth;
    if (overflowRight > 0) left = Math.max(spacing, left - overflowRight);
    if (left < spacing) left = spacing;

    setDropdownPosition({ top, left, transformOrigin });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // No cerrar si el clic es dentro del dropdown
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectColor = (color: string) => {
    setSelectedColor(color); // Actualiza UI inmediatamente
    formik.setFieldValue(name, color); // Actualiza Formik
    formik.setFieldTouched(name, true); // Marca como touched
    onChange?.(color, formik);
    setIsOpen(false);
  };

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        {" "}
        {/* ← agregar marginBottom */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "10px 14px",
            background: theme.colors.background.card,
            border: `1.5px solid ${
              isOpen
                ? theme.colors.border.focus
                : error
                  ? theme.colors.border.error
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: theme.transitions.DEFAULT,
            boxShadow: isOpen
              ? theme.colors.feedback.primaryGlow
              : theme.shadows.sm,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.md,
              background: currentColor,
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.disabled,
                fontFamily: "monospace",
              }}
            >
              {currentColor.toUpperCase()}
            </div>
          </div>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen &&
          createPortal(
            <AnimatePresence>
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: 280,
                  zIndex: theme.zIndex.dropdown,
                  transformOrigin: dropdownPosition.transformOrigin,
                }}
              >
                <div
                  style={{
                    background: theme.colors.background.card,
                    border: `1.5px solid ${theme.colors.border.DEFAULT}`,
                    borderRadius: theme.radius.xl,
                    boxShadow: theme.shadows.dropdown,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: `1px solid ${theme.colors.border.DEFAULT}`,
                      background: theme.colors.background.surface,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: theme.radius.sm,
                          background: currentColor,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                          }}
                        >
                          Color seleccionado
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                            color: theme.colors.text.secondary,
                          }}
                        >
                          {currentColor.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(10, 1fr)",
                        gap: "8px",
                      }}
                    >
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => selectColor(color)}
                          style={{
                            paddingBottom: "100%",
                            position: "relative",
                            borderRadius: theme.radius.sm,
                            background: color,
                            border:
                              currentColor === color
                                ? "2px solid white"
                                : "2px solid transparent",
                            outline:
                              currentColor === color
                                ? `2px solid ${theme.colors.primary.DEFAULT}`
                                : "none",
                            transform:
                              currentColor === color
                                ? "scale(1.15)"
                                : "scale(1)",
                            transition: theme.transitions.DEFAULT,
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )}
        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK IMAGE INPUT
// ------------------------------------------------------------------
interface FormikImageInputProps {
  name: string;
  label: string;
  disabled?: boolean;
  acceptedFileTypes?: string;
  multiple?: boolean;
  maxFiles?: number;
  onChange?: (value: File | File[] | null, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikImageInput(props: FormikImageInputProps) {
  const {
    name,
    label,
    disabled = false,
    acceptedFileTypes = "image/*",
    multiple = false,
    maxFiles = 5,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const { setFieldValue, values, errors, touched } =
    useFormikContext<Record<string, any>>();
  const formik = useFormikContext<Record<string, any>>();
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentValue = values[name];
    if (multiple && Array.isArray(currentValue)) {
      setPreviews(
        currentValue.filter((f: any) => typeof f === "string") as string[],
      );
    } else if (!multiple && typeof currentValue === "string") {
      setPreviews([currentValue]);
    } else {
      setPreviews([]);
    }
  }, [values, name, multiple]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const fileList = Array.from(files);
    if (multiple) {
      if (fileList.length + previews.length > maxFiles) return;
      const newPreviews = fileList.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
      const currentFiles = (values[name] as File[]) || [];
      const nextFiles = [...currentFiles, ...fileList];
      setFieldValue(name, nextFiles);
      onChange?.(nextFiles, formik);
    } else {
      setPreviews([URL.createObjectURL(fileList[0])]);
      setFieldValue(name, fileList[0]);
      onChange?.(fileList[0], formik);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    if (multiple) {
      const currentFiles = (values[name] as File[]) || [];
      const nextFiles = currentFiles.filter((_, i) => i !== index);
      setFieldValue(name, nextFiles);
      onChange?.(nextFiles, formik);
      URL.revokeObjectURL(previews[index]);
      setPreviews(previews.filter((_, i) => i !== index));
    } else {
      if (previews[0]) URL.revokeObjectURL(previews[0]);
      setPreviews([]);
      setFieldValue(name, null);
      onChange?.(null, formik);
    }
  };

  const error = touched[name] && errors[name] ? String(errors[name]) : null;

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "8px",
            color: theme.colors.text.primary,
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {previews.map((src, idx) => (
            <div
              key={idx}
              style={{ position: "relative", width: "100px", height: "100px" }}
            >
              <img
                src={src}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: theme.colors.status.error,
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AiOutlineClose size={12} />
              </button>
            </div>
          ))}
          {(!multiple || previews.length < maxFiles) && !disabled && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100px",
                height: "100px",
                border: `2px dashed ${theme.colors.border.DEFAULT}`,
                borderRadius: theme.radius.md,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: theme.colors.background.surface,
              }}
            >
              <AiOutlineCamera
                size={24}
                color={theme.colors.text.placeholder}
              />
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.placeholder,
                }}
              >
                Subir
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
        />
        {error && (
          <div
            style={{
              color: theme.colors.status.error,
              fontSize: theme.typography.fontSize.sm,
              marginTop: "8px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// FORMIK MULTI SELECT (nativo, sin react-select)
// ------------------------------------------------------------------
interface FormikMultiSelectProps {
  name: string;
  label: string;
  options: any[];
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  responsive?: ResponsiveProps;
  onRefresh?: () => Promise<void>;
  onAdd?: () => void;
  onChange?: (value: any[], formik: FormikContextType<any>) => void;
  idKey?: string;
  labelKey?: string;
}

export function FormikMultiSelect(props: FormikMultiSelectProps) {
  const {
    name,
    label,
    options,
    loading = false,
    disabled = false,
    required = false,
    placeholder = "Seleccione...",
    responsive,
    onRefresh,
    onAdd,
    onChange: externalOnChange,
    idKey = "value",
    labelKey = "label",
  } = props;

  const formik = useFormikContext();
  const value: any[] = formik.values[name] || [];
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 200,
    placement: "bottom" as "bottom" | "top",
  });

  // Función para obtener el valor de un option según idKey
  const getOptionValue = (opt: any): any => {
    return opt[idKey];
  };

  // Función para obtener la etiqueta de un option según labelKey
  const getOptionLabel = (opt: any): string => {
    return opt[labelKey];
  };

  // ✅ Función para comparar valores normalizados
  const areValuesEqual = (a: any, b: any): boolean => {
    // Convertir ambos a string para comparación
    return String(a) === String(b);
  };

  // Transformar options a un formato uniforme
  const normalizedOptions = options.map((opt) => ({
    raw: opt,
    value: getOptionValue(opt),
    label: getOptionLabel(opt),
  }));

  // ✅ Verificar si un valor está seleccionado (comparación normalizada)
  const isValueSelected = (optValue: any): boolean => {
    console.log('va',optValue)
    return value.some(v => areValuesEqual(v, optValue));
  };

  const hasValue = value.length > 0;
  const isActive = hasValue || isFocused || isOpen;

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    const estimatedHeight = Math.min(320, filteredOptions.length * 42 + 90);
    const GAP = 4;

    let topPosition: number;
    let placement: "bottom" | "top";
    let maxHeight: number;

    if (spaceBelow >= estimatedHeight + GAP) {
      placement = "bottom";
      topPosition = rect.bottom + window.scrollY + GAP;
      maxHeight = Math.min(estimatedHeight, spaceBelow - 20);
    } else if (spaceAbove >= estimatedHeight + GAP) {
      placement = "top";
      topPosition = rect.top + window.scrollY - estimatedHeight - GAP;
      maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
    } else {
      placement = "bottom";
      topPosition = rect.bottom + window.scrollY + GAP;
      maxHeight = Math.max(150, spaceBelow - 20);
    }

    setDropdownPosition({
      top: topPosition,
      left: rect.left + window.scrollX,
      width: rect.width,
      maxHeight: Math.max(150, maxHeight),
      placement,
    });
  };

  const openDropdown = () => {
    if (disabled) return;
    updateDropdownPosition();
    setIsOpen(true);
    setIsFocused(true);
    setSearchTerm("");
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsFocused(false);
    setSearchTerm("");
  };

  const toggleOpen = () => {
    if (isOpen) closeDropdown();
    else openDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (
          dropdownRef.current &&
          dropdownRef.current.contains(e.target as Node)
        ) {
          return;
        }
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, filteredOptions.length]);
useEffect(() => {
  if (formik.values[name] === undefined) {
    console.log(
      `[FormikMultiSelect] Inicializando campo ${name} con array vacío`,
    );
    formik.setFieldValue(name, []);
  }
}, [formik.values[name], name]);
  // ✅ toggleValue con comparación normalizada
  const toggleValue = (optValue: any) => {
    const isSelected = isValueSelected(optValue);
    console.log("seleccion",isSelected)
    let newValue: any[];
    if (isSelected) {
      newValue = value.filter(v => !areValuesEqual(v, optValue));
    } else {
      newValue = [...value, optValue];
    }
    
    formik.setFieldValue(name, newValue);
    formik.setFieldTouched(name, true);
    externalOnChange?.(newValue, formik);
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd?.();
  };

  // ✅ removeChip con comparación normalizada
  const removeChip = (optValue: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter(v => !areValuesEqual(v, optValue));
    formik.setFieldValue(name, newValue);
    formik.setFieldTouched(name, true);
    externalOnChange?.(newValue, formik);
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "0 7px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: theme.colors.text.disabled,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    height: "28px",
    width: "28px",
    transition: "color 0.15s, background 0.15s",
  };

  if (disabled) {
    const selectedLabels = normalizedOptions
      .filter((opt) => isValueSelected(opt.value))
      .map((opt) => opt.label);
    return (
      <DisabledField
        label={label}
        value={selectedLabels.join(", ")}
        error={error}
        responsive={responsive}
      />
    );
  }

  return (
    <ColComponent responsive={responsive}>
      <div
        ref={containerRef}
        style={{ position: "relative", marginBottom: "20px" }}
      >
        <label
          style={{
            position: "absolute",
            left: "12px",
            top: isActive ? "-9px" : "14px",
            fontSize: isActive ? "11px" : theme.typography.fontSize.base,
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary
              : theme.colors.text.placeholder,
            background: theme.colors.background.card,
            padding: "0 4px",
            transition: theme.transitions.DEFAULT,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error }}>*</span>
          )}
        </label>

        <div
          onClick={toggleOpen}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            minHeight: "56px",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.border.focus
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            boxShadow: isFocused ? theme.colors.feedback.primaryGlow : "none",
            transition: theme.transitions.DEFAULT,
            padding: "16px 12px 8px",
            cursor: "pointer",
          }}
        >
          {value.map((v) => {
            const opt = normalizedOptions.find((o) => areValuesEqual(o.value, v));
            if (!opt) return null;
            return (
              <div
                key={String(v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: theme.colors.feedback.primaryLight,
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.primary.DEFAULT,
                }}
              >
                <span>{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeChip(v, e)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: theme.colors.primary.DEFAULT,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
          {value.length === 0 && (
            <span
              style={{
                color: theme.colors.text.placeholder,
                fontSize: theme.typography.fontSize.base,
              }}
            >
              {placeholder}
            </span>
          )}
          <div style={{ flex: 1 }} />
        </div>

        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: 4,
          }}
        >
          {(onRefresh || onAdd) && (
            <div
              style={{
                width: "1px",
                height: "20px",
                background: theme.colors.border.DEFAULT,
              }}
            />
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={actionButtonStyle}
            >
              {isRefreshing ? (
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: `2px solid ${theme.colors.border.DEFAULT}`,
                    borderTopColor: theme.colors.primary.DEFAULT,
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              )}
            </button>
          )}
          {onAdd && (
            <button type="button" onClick={handleAdd} style={actionButtonStyle}>
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          {loading && (
            <div
              style={{
                width: 16,
                height: 16,
                border: `2px solid ${theme.colors.border.DEFAULT}`,
                borderTopColor: theme.colors.primary.DEFAULT,
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                margin: "0 8px",
              }}
            />
          )}
        </div>

        <FieldError error={error} />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              background: theme.colors.background.card,
              border: `1.5px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadows.dropdown,
              zIndex: theme.zIndex.portal,
              maxHeight: dropdownPosition.maxHeight,
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "8px",
                borderBottom: `1px solid ${theme.colors.border.DEFAULT}`,
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  borderRadius: theme.radius.md,
                  outline: "none",
                  fontSize: "13px",
                }}
              />
            </div>
            <div style={{ padding: "4px" }}>
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: theme.colors.text.disabled,
                  }}
                >
                  Sin opciones
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleValue(opt.value);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: theme.radius.md,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        theme.colors.feedback.primaryLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <input
                      type="checkbox"
                      style={{ accentColor: theme.colors.primary[100] }}
                      checked={isValueSelected(opt.value)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span style={{ fontSize: "13.5px" }}>{opt.label}</span>
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                padding: "8px",
                borderTop: `1px solid ${theme.colors.border.DEFAULT}`,
                textAlign: "right",
              }}
            >
              <button
                onClick={closeDropdown}
                style={{
                  padding: "4px 12px",
                  background: theme.colors.primary.DEFAULT,
                  color: "white",
                  border: "none",
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>,
          document.body,
        )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// NOTA: FormikReactSelect (con react-select) se puede eliminar
// ya que no se usa en el código original; si se necesita,
// se puede adaptar de forma similar usando theme.
// ------------------------------------------------------------------

interface FormikDatePickerProps {
  name: string;
  label: string;
  /** @default "date" */
  type?: "date" | "datetime-local" | "time" | "month" | "week";
  min?: string;
  max?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onChange?: (value: string, formik: FormikCtx) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}



// ✅ Portal container — monta el calendario directamente en document.body

const CalendarPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

export function FormikDatePicker(props: FormikDatePickerProps) {
  const {
    name,
    label,
    type = "date",
    min,
    max,
    disabled = false,
    readOnly = false,
    required = false,
    onChange,
    onBlur,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isFocused, setIsFocused] = useState(false);
  const datePickerRef = useRef<DatePicker>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rawValue = formik.values?.[name] ?? "";

  const getSafeDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === "string") {
      if (value === "" || value === "null" || value === "undefined")
        return null;
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (typeof value === "number" && !isNaN(value)) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const selectedDate = getSafeDate(rawValue);

  // React.useEffect(() => {
  //   if (rawValue && !selectedDate) {
  //     formik.setFieldValue(name, "");
  //   }
  // }, [rawValue, selectedDate, name, formik]);

  const handleChange = (date: Date | null) => {
    let value = "";
    if (date && !isNaN(date.getTime())) {
      if (type === "time") {
        value = date.toTimeString().split(" ")[0];
      } else if (type === "datetime-local") {
        value = date.toISOString().slice(0, 16);
      } else {
        value = date.toISOString().split("T")[0];
      }
    }
    formik.setFieldValue(name, value);
    onChange?.(value, formik);
  };

  const handleBlur = () => {
    setIsFocused(false);
    formik.setFieldTouched(name, true);
    onBlur?.({} as React.FocusEvent<HTMLInputElement>);
  };

  const handleContainerClick = () => {
    if (disabled) return;
    if (datePickerRef.current) datePickerRef.current.setOpen(true);
    if (inputRef.current) inputRef.current.focus();
  };

  const getDateFormat = (): string => {
    if (type === "time") return "HH:mm";
    if (type === "datetime-local") return "dd/MM/yyyy HH:mm";
    if (type === "month") return "MM/yyyy";
    if (type === "week") return "'Semana' w";
    return "dd/MM/yyyy";
  };

  const customStyles = `
    #datepicker-portal {
      position: fixed;
      z-index: 9999;
    }
    .react-datepicker-wrapper {
      width: 100%;
    }
    .react-datepicker {
      font-family: inherit;
      border-radius: ${theme.radius.md};
      border: 1px solid ${theme.colors.border.DEFAULT};
      box-shadow: ${theme.shadows.dropdown};
      background: ${theme.colors.background.card};
    }
    .react-datepicker__header {
      background: ${theme.colors.feedback.primaryLight};
      border-bottom: 1px solid ${theme.colors.border.DEFAULT};
    }
    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: ${theme.colors.text.primary};
      font-weight: 600;
    }
    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      color: ${theme.colors.text.primary};
    }
    .react-datepicker__day:hover,
    .react-datepicker__month-text:hover,
    .react-datepicker__quarter-text:hover,
    .react-datepicker__year-text:hover {
      background: ${theme.colors.feedback.primaryLight};
    }
    .react-datepicker__day--selected,
    .react-datepicker__day--in-selecting-range,
    .react-datepicker__day--in-range,
    .react-datepicker__month-text--selected,
    .react-datepicker__month-text--in-selecting-range,
    .react-datepicker__month-text--in-range,
    .react-datepicker__quarter-text--selected,
    .react-datepicker__quarter-text--in-selecting-range,
    .react-datepicker__quarter-text--in-range,
    .react-datepicker__year-text--selected,
    .react-datepicker__year-text--in-selecting-range,
    .react-datepicker__year-text--in-range {
      background: ${theme.colors.primary.DEFAULT};
      color: white;
    }
    .react-datepicker__day--keyboard-selected,
    .react-datepicker__month-text--keyboard-selected,
    .react-datepicker__quarter-text--keyboard-selected,
    .react-datepicker__year-text--keyboard-selected {
      background: ${theme.colors.primary[200]};
      color: white;
    }
    .react-datepicker__day--disabled,
    .react-datepicker__month-text--disabled,
    .react-datepicker__quarter-text--disabled,
    .react-datepicker__year-text--disabled {
      color: ${theme.colors.text.disabled};
    }
    .react-datepicker__close-icon::after {
      background: ${theme.colors.primary.DEFAULT};
    }
    .react-datepicker__day--outside-month {
      color: ${theme.colors.text.disabled};
    }
  `;

  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  if (disabled) {
    return (
      <ColComponent responsive={responsive} autoPadding={padding}>
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <label
            style={{
              position: "absolute",
              left: "14px",
              top: "-10px",
              fontSize: "11px",
              fontWeight: 600,
              color: theme.colors.text.disabled,
              background: theme.colors.background.surface,
              padding: "0 6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              zIndex: 2,
              borderRadius: "4px",
            }}
          >
            {label}
          </label>
          <div
            style={{
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.lg,
              background: theme.colors.background.surface,
              padding: "14px 16px",
              minHeight: "52px",
              opacity: 0.7,
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
              }}
            >
              {rawValue || "—"}
            </span>
          </div>
          <FieldError error={error} />
        </div>
      </ColComponent>
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <style>{customStyles}</style>
      <div style={{ position: "relative", marginBottom: "24px" }}>
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: "14px",
            top: "-10px",
            fontSize: "11px",
            fontWeight: 600,
            color: error
              ? theme.colors.status.error
              : isFocused
                ? theme.colors.primary.DEFAULT
                : theme.colors.text.secondary,
            background: theme.colors.background.card,
            padding: "0 6px",
            pointerEvents: "none",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
            zIndex: 2,
            borderRadius: "4px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 3 }}>
              *
            </span>
          )}
        </label>

        <div
          onClick={handleContainerClick}
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.lg,
            background: theme.colors.background.card,
            boxShadow: isFocused
              ? error
                ? `0 0 0 3px ${theme.colors.status.error}20`
                : `0 0 0 3px ${theme.colors.primary.DEFAULT}20`
              : "0 1px 2px rgba(0,0,0,0.02)",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
        >
          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            placeholderText="Seleccione una fecha"
            locale={es}
            showTimeSelect={type === "time" || type === "datetime-local"}
            showTimeSelectOnly={type === "time"}
            timeFormat="HH:mm"
            dateFormat={getDateFormat()}
            showMonthYearPicker={type === "month"}
            showWeekPicker={type === "week"}
            minDate={min ? getSafeDate(min) : undefined}
            maxDate={max ? getSafeDate(max) : undefined}
            // ✅ PORTAL NATIVO DE REACT-DATEPICKER
            portalId="datepicker-portal"
            popperProps={{ strategy: "fixed" }}
            customInput={
              <input
                ref={inputRef}
                style={{
                  flex: 1,
                  padding: "16px 12px 12px 16px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.primary,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              />
            }
          />
          <span
            style={{
              marginRight: 16,
              color: isFocused
                ? theme.colors.primary.DEFAULT
                : theme.colors.text.placeholder,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s ease",
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </div>

        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ──────────────────────────────────────────────────────────────
// 2. FORMIK DATE RANGE
//    Dos DatePickers (desde / hasta) en una sola caja visual
// ──────────────────────────────────────────────────────────────
interface FormikDateRangeProps {
  nameFrom: string;
  nameTo: string;
  labelFrom?: string;
  labelTo?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string; // etiqueta general del grupo
  onChange?: (from: string, to: string, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikDateRange(props: FormikDateRangeProps) {
  const {
    nameFrom,
    nameTo,
    labelFrom = "Desde",
    labelTo = "Hasta",
    min,
    max,
    disabled = false,
    required = false,
    label,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [focusedField, setFocusedField] = useState<"from" | "to" | null>(null);

  // Refs para controlar los DatePickers y los inputs internos
  const fromDatePickerRef = useRef<DatePicker>(null);
  const toDatePickerRef = useRef<DatePicker>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const fromValue = formik.values?.[nameFrom] ?? "";
  const toValue = formik.values?.[nameTo] ?? "";

  const fromDate = fromValue ? new Date(fromValue) : null;
  const toDate = toValue ? new Date(toValue) : null;

  const errorFrom =
    formik.touched[nameFrom] && formik.errors[nameFrom]
      ? String(formik.errors[nameFrom])
      : null;
  const errorTo =
    formik.touched[nameTo] && formik.errors[nameTo]
      ? String(formik.errors[nameTo])
      : null;

  const error = errorFrom || errorTo;
  const isFocused = focusedField !== null;

  const handleFromChange = (date: Date | null) => {
    const value = date ? date.toISOString().split("T")[0] : "";
    formik.setFieldValue(nameFrom, value);
    onChange?.(value, toValue, formik);
  };

  const handleToChange = (date: Date | null) => {
    const value = date ? date.toISOString().split("T")[0] : "";
    formik.setFieldValue(nameTo, value);
    onChange?.(fromValue, value, formik);
  };

  // Abrir calendario y enfocar input del campo "desde"
  const handleFromContainerClick = () => {
    if (disabled) return;
    fromDatePickerRef.current?.setOpen(true);
    fromInputRef.current?.focus();
  };

  // Abrir calendario y enfocar input del campo "hasta"
  const handleToContainerClick = () => {
    if (disabled) return;
    toDatePickerRef.current?.setOpen(true);
    toInputRef.current?.focus();
  };

  const customStyles = `
    .react-datepicker-wrapper {
      width: 100%;
    }
    .react-datepicker {
      font-family: inherit;
      border-radius: ${theme.radius.md};
      border: 1px solid ${theme.colors.border.DEFAULT};
      box-shadow: ${theme.shadows.dropdown};
      background: ${theme.colors.background.card};
    }
    .react-datepicker__header {
      background: ${theme.colors.feedback.primaryLight};
      border-bottom: 1px solid ${theme.colors.border.DEFAULT};
    }
    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: ${theme.colors.text.primary};
      font-weight: 600;
    }
    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      color: ${theme.colors.text.primary};
    }
    .react-datepicker__day:hover {
      background: ${theme.colors.feedback.primaryLight};
    }
    .react-datepicker__day--selected,
    .react-datepicker__day--in-range {
      background: ${theme.colors.primary.DEFAULT};
      color: white;
    }
    .react-datepicker__day--keyboard-selected {
      background: ${theme.colors.primary[200]};
      color: white;
    }
    .react-datepicker__day--disabled {
      color: ${theme.colors.text.disabled};
    }
  `;

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <style>{customStyles}</style>
      <div style={{ position: "relative", marginBottom: "24px" }}>
        {label && (
          <label
            style={{
              position: "absolute",
              left: "14px",
              top: "-10px",
              fontSize: "11px",
              fontWeight: 600,
              color: error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary,
              background: theme.colors.background.card,
              padding: "0 6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              zIndex: 2,
              borderRadius: "4px",
            }}
          >
            {label}
            {required && (
              <span style={{ color: theme.colors.status.error, marginLeft: 3 }}>
                *
              </span>
            )}
          </label>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.lg,
            background: theme.colors.background.card,
            boxShadow: isFocused
              ? error
                ? `0 0 0 3px ${theme.colors.status.error}20`
                : `0 0 0 3px ${theme.colors.primary.DEFAULT}20`
              : "0 1px 2px rgba(0,0,0,0.02)",
            transition: "all 0.2s ease",
            overflow: "hidden",
          }}
        >
          {/* FROM - contenedor clickeable */}
          <div
            onClick={handleFromContainerClick}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "12px 14px 10px",
              transition: "background 0.2s",
              background:
                focusedField === "from"
                  ? `${theme.colors.primary.DEFAULT}08`
                  : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color:
                  focusedField === "from"
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.text.disabled,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "4px",
              }}
            >
              {labelFrom}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DatePicker
                ref={fromDatePickerRef}
                selected={fromDate}
                onChange={handleFromChange}
                onFocus={() => setFocusedField("from")}
                onBlur={() => {
                  setFocusedField(null);
                  formik.setFieldTouched(nameFrom, true);
                }}
                disabled={disabled}
                placeholderText="Seleccione fecha"
                locale={es}
                dateFormat="dd/MM/yyyy"
                minDate={min ? new Date(min) : undefined}
                maxDate={toDate || (max ? new Date(max) : undefined)}
                customInput={
                  <input
                    ref={fromInputRef}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.text.primary,
                      fontFamily: "inherit",
                      padding: "4px 0",
                      cursor: "pointer",
                    }}
                  />
                }
              />
            </div>
          </div>

          {/* Divisor - no clickeable */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              color: theme.colors.border.DEFAULT,
              pointerEvents: "none",
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>

          {/* TO - contenedor clickeable */}
          <div
            onClick={handleToContainerClick}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "12px 14px 10px",
              transition: "background 0.2s",
              background:
                focusedField === "to"
                  ? `${theme.colors.primary.DEFAULT}08`
                  : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color:
                  focusedField === "to"
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.text.disabled,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "4px",
              }}
            >
              {labelTo}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DatePicker
                ref={toDatePickerRef}
                selected={toDate}
                onChange={handleToChange}
                onFocus={() => setFocusedField("to")}
                onBlur={() => {
                  setFocusedField(null);
                  formik.setFieldTouched(nameTo, true);
                }}
                disabled={disabled}
                placeholderText="Seleccione fecha"
                locale={es}
                dateFormat="dd/MM/yyyy"
                minDate={fromDate || (min ? new Date(min) : undefined)}
                maxDate={max ? new Date(max) : undefined}
                customInput={
                  <input
                    ref={toInputRef}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.text.primary,
                      fontFamily: "inherit",
                      padding: "4px 0",
                      cursor: "pointer",
                    }}
                  />
                }
              />
            </div>
          </div>
        </div>

        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ──────────────────────────────────────────────────────────────
// 3. FORMIK NUMBER DIRECT
//    Input numérico padre: tipado directo + botones ± opcionales
//    prefix/suffix, decimales, rangos, autoformat
// ──────────────────────────────────────────────────────────────
interface FormikNumberDirectProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /** Cantidad de decimales a mostrar (undefined = entero) */
  decimals?: number;
  /** Prefijo visual, e.g. "$" */
  prefix?: string;
  /** Sufijo visual, e.g. "kg", "%" */
  suffix?: string;
  /** Muestra los botones +/- al costado del input */
  showStepper?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  onChange?: (value: number | null, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikNumberDirect(props: FormikNumberDirectProps) {
  const {
    name,
    label,
    min,
    max,
    step = 1,
    decimals,
    prefix,
    suffix,
    showStepper = false,
    disabled = false,
    required = false,
    placeholder = "",
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const storedValue = formik.values?.[name];
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const clampValue = useCallback(
    (n: number): number => {
      let v = n;
      if (min !== undefined) v = Math.max(min, v);
      if (max !== undefined) v = Math.min(max, v);
      return v;
    },
    [min, max],
  );

  const handleValueChange = (values: { floatValue: number | undefined }) => {
    let newValue = values.floatValue ?? null;
    if (newValue !== null && !isNaN(newValue)) {
      newValue = clampValue(newValue);
    }
    formik.setFieldValue(name, newValue);
    onChange?.(newValue, formik);
    formik.setFieldTouched(name, true);
  };

  const stepValue = (direction: 1 | -1) => {
    const current =
      storedValue === null || storedValue === undefined
        ? 0
        : Number(storedValue);
    const next = clampValue(current + direction * step);
    formik.setFieldValue(name, next);
    onChange?.(next, formik);
    formik.setFieldTouched(name, true);
  };

  const hasValue =
    storedValue !== null && storedValue !== undefined && storedValue !== "";
  const isActive = hasValue || isFocused;

  if (disabled) {
    const displayValue =
      storedValue !== null && storedValue !== undefined && storedValue !== ""
        ? decimals !== undefined
          ? Number(storedValue).toFixed(decimals)
          : String(storedValue)
        : "—";
    return (
      <ColComponent responsive={responsive} autoPadding={padding}>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-9px",
              fontSize: "11px",
              fontWeight: 600,
              color: theme.colors.text.disabled,
              background: theme.colors.background.surface,
              padding: "0 4px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            {label}
          </label>
          <div
            style={{
              border: `1.5px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              background: theme.colors.background.surface,
              padding: "13px 12px",
              minHeight: "50px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {prefix && (
              <span
                style={{
                  color: theme.colors.text.disabled,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                {prefix}
              </span>
            )}
            <span
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
              }}
            >
              {displayValue}
            </span>
            {suffix && (
              <span
                style={{
                  color: theme.colors.text.disabled,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                {suffix}
              </span>
            )}
          </div>
          <FieldError error={error} />
        </div>
      </ColComponent>
    );
  }

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        {/* Floating label */}
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: prefix ? "32px" : "12px",
            top: isActive ? "-9px" : "14px",
            fontSize: isActive ? "11px" : theme.typography.fontSize.base,
            fontWeight: isActive ? 600 : 400,
            color: isActive
              ? error
                ? theme.colors.status.error
                : isFocused
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary
              : theme.colors.text.placeholder,
            background: isActive ? theme.colors.background.card : "transparent",
            padding: "0 4px",
            pointerEvents: "none",
            transition: theme.transitions.DEFAULT,
            letterSpacing: isActive ? "0.04em" : "0",
            textTransform: isActive ? "uppercase" : "none",
            zIndex: 2,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.status.error, marginLeft: 2 }}>
              *
            </span>
          )}
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${
              error
                ? theme.colors.border.error
                : isFocused
                  ? theme.colors.border.focus
                  : theme.colors.border.DEFAULT
            }`,
            borderRadius: theme.radius.md,
            background: theme.colors.background.card,
            boxShadow: isFocused
              ? error
                ? "0 0 0 3px rgba(220,38,38,0.10)"
                : theme.colors.feedback.primaryGlow
              : "none",
            transition: theme.transitions.DEFAULT,
            overflow: "hidden",
          }}
        >
          {/* Stepper - */}
          {showStepper && (
            <button
              type="button"
              onClick={() => stepValue(-1)}
              style={{
                width: 36,
                height: "100%",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.colors.background.surface,
                border: "none",
                borderRight: `1px solid ${theme.colors.border.DEFAULT}`,
                cursor: "pointer",
                color: theme.colors.text.secondary,
                flexShrink: 0,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  theme.colors.feedback.primaryLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  theme.colors.background.surface)
              }
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}

          {/* Input numérico con formato - sin customInput */}
          <NumericFormat
            getInputRef={inputRef}
            id={name}
            value={storedValue ?? ""}
            onValueChange={handleValueChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              formik.setFieldTouched(name, true);
            }}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            prefix={prefix}
            suffix={suffix}
            decimalScale={decimals}
            fixedDecimalScale={decimals !== undefined}
            allowNegative={min === undefined || min < 0}
            decimalSeparator="."
            thousandSeparator=","
            step={step}
            min={min}
            max={max}
            style={{
              flex: 1,
              padding: `20px 8px 8px ${prefix ? "4px" : showStepper ? "8px" : "12px"}`,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
              fontFamily: "inherit",
              textAlign: showStepper ? "center" : "left",
              fontWeight: showStepper ? 600 : 400,
              minWidth: 0,
            }}
          />

          {/* Stepper + */}
          {showStepper && (
            <button
              type="button"
              onClick={() => stepValue(1)}
              style={{
                width: 36,
                height: "100%",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.colors.background.surface,
                border: "none",
                borderLeft: `1px solid ${theme.colors.border.DEFAULT}`,
                cursor: "pointer",
                color: theme.colors.text.secondary,
                flexShrink: 0,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  theme.colors.feedback.primaryLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  theme.colors.background.surface)
              }
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}

          {/* Indicador min/max */}
          {isFocused && (min !== undefined || max !== undefined) && (
            <div
              style={{
                padding: "0 10px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              {max !== undefined && (
                <span
                  style={{
                    fontSize: "9px",
                    color: theme.colors.text.disabled,
                    lineHeight: 1,
                  }}
                >
                  máx {max}
                </span>
              )}
              {min !== undefined && (
                <span
                  style={{
                    fontSize: "9px",
                    color: theme.colors.text.disabled,
                    lineHeight: 1,
                  }}
                >
                  mín {min}
                </span>
              )}
            </div>
          )}
        </div>

        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ──────────────────────────────────────────────────────────────
// 4. FORMIK SLIDER
//    Slider con track visual, marks opcionales y valor en tooltip
// ──────────────────────────────────────────────────────────────
interface FormikSliderMark {
  value: number;
  label: string;
}

interface FormikSliderProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /** Unidad que aparece junto al valor, e.g. "%" o "km" */
  unit?: string;
  /** Muestra el valor actual flotando sobre el thumb */
  showTooltip?: boolean;
  /** Marcas en la pista */
  marks?: FormikSliderMark[];
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: number, formik: FormikCtx) => void;
  responsive?: ResponsiveProps;
  padding?: boolean;
}

export function FormikSlider(props: FormikSliderProps) {
  const {
    name,
    label,
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    showTooltip = true,
    marks,
    disabled = false,
    required = false,
    onChange,
    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
    padding = true,
  } = props;

  const formik = useFormikContext<Record<string, any>>();
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const rawValue = formik.values?.[name];
  const value =
    rawValue !== undefined && rawValue !== null ? Number(rawValue) : min;
  const error =
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    formik.setFieldValue(name, newVal);
    onChange?.(newVal, formik);
  };

  const primaryColor = theme.colors.primary.DEFAULT;
  const primaryLight = theme.colors.feedback.primaryLight;

  return (
    <ColComponent responsive={responsive} autoPadding={padding}>
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "14px",
          }}
        >
          <label
            htmlFor={name}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: error
                ? theme.colors.status.error
                : isDragging
                  ? primaryColor
                  : theme.colors.text.secondary,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            {label}
            {required && (
              <span style={{ color: theme.colors.status.error, marginLeft: 3 }}>
                *
              </span>
            )}
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "3px",
              padding: "4px 12px",
              borderRadius: "40px",
              background: isDragging ? primaryColor : primaryLight,
              transition: "all 0.2s",
              boxShadow: isDragging ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: isDragging ? "#ffffff" : primaryColor,
                transition: "color 0.2s",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </span>
            {unit && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: isDragging ? "rgba(255,255,255,0.85)" : primaryColor,
                }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        <div style={{ position: "relative", padding: "8px 0" }}>
          <div
            ref={trackRef}
            style={{
              position: "relative",
              height: "6px",
              borderRadius: "6px",
              background: theme.colors.border.DEFAULT,
              margin: "10px 0",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${percentage}%`,
                borderRadius: "6px",
                background: error
                  ? theme.colors.status.error
                  : disabled
                    ? theme.colors.text.disabled
                    : primaryColor,
                transition: isDragging
                  ? "none"
                  : "width 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />

            {marks?.map((mark) => {
              const markPct =
                max === min ? 0 : ((mark.value - min) / (max - min)) * 100;
              return (
                <div
                  key={mark.value}
                  style={{
                    position: "absolute",
                    left: `${markPct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background:
                      mark.value <= value
                        ? "#ffffff"
                        : theme.colors.text.disabled,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </div>

          <input
            id={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => {
              setIsDragging(false);
              formik.setFieldTouched(name, true);
            }}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => {
              setIsDragging(false);
              formik.setFieldTouched(name, true);
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: disabled ? "not-allowed" : "pointer",
              margin: 0,
              padding: 0,
              zIndex: 2,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${percentage}%`,
              transform: "translate(-50%, -50%)",
              width: isDragging ? "22px" : "18px",
              height: isDragging ? "22px" : "18px",
              borderRadius: "50%",
              background: error
                ? theme.colors.status.error
                : disabled
                  ? theme.colors.text.disabled
                  : "#ffffff",
              border: `2px solid ${error ? theme.colors.status.error : primaryColor}`,
              boxShadow: isDragging
                ? `0 0 0 6px ${primaryLight}, 0 4px 12px rgba(0,0,0,0.15)`
                : "0 2px 6px rgba(0,0,0,0.1)",
              transition: isDragging
                ? "width 0.1s, height 0.1s, box-shadow 0.2s"
                : "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>

        {marks && marks.length > 0 && (
          <div
            style={{ position: "relative", height: "24px", marginTop: "6px" }}
          >
            {marks.map((mark) => {
              const markPct =
                max === min ? 0 : ((mark.value - min) / (max - min)) * 100;
              return (
                <span
                  key={mark.value}
                  style={{
                    position: "absolute",
                    left: `${markPct}%`,
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    color:
                      mark.value <= value
                        ? primaryColor
                        : theme.colors.text.disabled,
                    fontWeight: mark.value === value ? 600 : 400,
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                >
                  {mark.label}
                </span>
              );
            })}
          </div>
        )}

        {!marks && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
            }}
          >
            <span
              style={{ fontSize: "10px", color: theme.colors.text.disabled }}
            >
              {min}
              {unit}
            </span>
            <span
              style={{ fontSize: "10px", color: theme.colors.text.disabled }}
            >
              {max}
              {unit}
            </span>
          </div>
        )}

        <FieldError error={error} />
      </div>
    </ColComponent>
  );
}

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

// ====================================================================
// TIPOS (deben coincidir con los definidos en genericmodels.model.ts)
// ====================================================================
type SelectKeyType = "id" | "label";

export interface ArrayFieldItem {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "checkbox" | "toggle";
  required?: boolean;
  options?: Array<{ id: any; label: string }>;
  selectIdKey?: string;
  selectLabelKey?: string;
  defaultValue?: any;
  // 👇 AÑADE ESTOS (si no están)
  selectOptionsHook?: () => any[] | Promise<any[]>;
  refreshActionHook?: () => () => void | Promise<void>;
  addActionHook?: () => () => void;
  loadingHook?: () => boolean;
  multiple?: boolean;
  placeholder?: string;
  responsive?: ResponsiveProps;
}

interface FormikArrayTableProps {
  name: string;
  label: string;
  fields: ArrayFieldItem[];
  allowAdd?: boolean;
  allowRemove?: boolean;
  addButtonLabel?: string;
  itemLabel?: string;
  disabled?: boolean;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================
// ====================================================================
// DynamicSelectFieldLocal (igual al DynamicSelectField de SuperCrud)
// ====================================================================
interface DynamicSelectFieldLocalProps {
  name: string;
  label: string;
  responsive?: ResponsiveProps;
  selectOptionsHook?: () => any[] | Promise<any[]>;
  loadingHook?: () => boolean;
  refreshActionHook?: () => () => void | Promise<void> | Promise<any>;
  addActionHook?: () => () => void;
  selectIdKey?: string;
  selectLabelKey?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  placeholder?: string;
  caseTransform?: CaseTransform;
}

// ====================================================================
// DynamicSelectFieldLocal (igual a DynamicMultipleSelectField pero para un solo valor)
// ====================================================================
const DynamicSelectFieldLocal = React.memo(
  ({
    field,
    responsive,
    onChange,
    onInput,
    caseTransform,
  }: {
    field: any;
    responsive: any;
    onChange?: (value: any) => void;
    onInput?: (value: string) => void;
    caseTransform?: CaseTransform;
  }) => {
    const hookResult = field.selectOptionsHook?.();
    const isLoadingOptions = field.loadingHook?.() || false;
    const [isAsync, setIsAsync] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState<any[]>([]);

    useEffect(() => {
      if (!field.selectOptionsHook) return;
      const checkAsync = async () => {
        try {
          const result = hookResult;
          const isPromise = result && typeof (result as any).then === "function";
          setIsAsync(isPromise);
          if (isPromise) {
            const data = await (result as Promise<any[]>);
            setAsyncOptions(Array.isArray(data) ? data : []);
          } else {
            setAsyncOptions(Array.isArray(result) ? result : []);
          }
        } catch (error) {
          console.error("Error loading select options:", error);
          setAsyncOptions([]);
        }
      };
      checkAsync();
    }, [hookResult, field.selectOptionsHook]);

    const options = isAsync
      ? asyncOptions
      : Array.isArray(hookResult)
      ? hookResult
      : (field.options ?? []);

    const refreshFn = field.refreshActionHook?.();
    const addFn = field.addActionHook?.();

    return (
      <FormikAutocomplete
        name={field.name}
        label={field.label}
        options={options}
        compact
        idKey={field.selectIdKey as never}
        labelKey={field.selectLabelKey as never}
        responsive={responsive}
        onRefresh={refreshFn}
        onAdd={addFn}
        loading={isLoadingOptions}
        onSelect={(selectedItem) => {
          onChange?.(selectedItem);
        }}
        onInput={onInput}
        caseTransform={caseTransform}
        disabled={field.disabled}
        required={field.required}
      />
    );
  }
);
DynamicSelectFieldLocal.displayName = "DynamicSelectFieldLocal";
// ====================================================================
// FORMIK ARRAY TABLE (versión final, sin errores de hooks)
// ====================================================================
export const FormikArrayTable: React.FC<FormikArrayTableProps> = ({
  name,
  label,
  fields,
  allowAdd = true,
  allowRemove = true,
  addButtonLabel = "Agregar",
  itemLabel = "ítem",
  disabled = false,
  responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
}) => {
  const formik = useFormikContext();
  const values = getIn(formik.values, name) || [];
  const error = getIn(formik.errors, name);
  const touched = getIn(formik.touched, name);
  const hasError = touched && typeof error === "string";

  const getEmptyItem = useCallback(() => {
    const empty: any = {};
    fields.forEach((field) => {
      empty[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
    });
    return empty;
  }, [fields]);

  const setArrayValue = (rowIndex: number, fieldName: string, newValue: any) => {
    const newArray = [...values];
    if (!newArray[rowIndex]) newArray[rowIndex] = {};
    newArray[rowIndex][fieldName] = newValue;
    formik.setFieldValue(name, newArray);
    formik.setFieldTouched(name, true);
  };

  const renderNativeField = (fieldDef: ArrayFieldItem, rowIndex: number) => {
    const currentValue = values[rowIndex]?.[fieldDef.name] ?? fieldDef.defaultValue ?? "";
    switch (fieldDef.type) {
      case "text":
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) =>
              setArrayValue(rowIndex, fieldDef.name, e.target.value)
            }
            disabled={disabled}
            required={fieldDef.required}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              fontSize: theme.typography.fontSize.sm,
              background: disabled ? theme.colors.background.surface : "white",
            }}
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) =>
              setArrayValue(
                rowIndex,
                fieldDef.name,
                e.target.valueAsNumber || 0,
              )
            }
            disabled={disabled}
            required={fieldDef.required}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              fontSize: theme.typography.fontSize.sm,
            }}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!currentValue}
            onChange={(e) =>
              setArrayValue(rowIndex, fieldDef.name, e.target.checked)
            }
            disabled={disabled}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: theme.colors.primary.DEFAULT,
            }}
          />
        );
      case "toggle":
        return (
          <button
            type="button"
            onClick={() =>
              setArrayValue(rowIndex, fieldDef.name, !currentValue)
            }
            disabled={disabled}
            style={{
              width: "70px",
              height: "32px",
              borderRadius: "30px",
              background: currentValue
                ? theme.colors.primary.DEFAULT
                : theme.colors.border.DEFAULT,
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              position: "relative",
              transition: "background 0.2s",
              boxShadow: theme.shadows.card,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "4px",
                left: currentValue ? "38px" : "4px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                color: theme.colors.text.primary,
              }}
            >
              {currentValue ? "SÍ" : "NO"}
            </span>
          </button>
        );
      case "date":
        return (
          <input
            type="date"
            value={currentValue}
            onChange={(e) =>
              setArrayValue(rowIndex, fieldDef.name, e.target.value)
            }
            disabled={disabled}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${theme.colors.border.DEFAULT}`,
              borderRadius: theme.radius.md,
              fontSize: theme.typography.fontSize.sm,
            }}
          />
        );
      default:
        return null;
    }
  };

 const renderSelectField = (fieldDef: ArrayFieldItem, rowIndex: number) => {
   // ✅ Notación con corchetes para arrays anidados
   const fullName = `${name}[${rowIndex}].${fieldDef.name}`;
   // Ejemplo: "dependientes[0].id_vinculo"

   const fieldForSelect = {
     name: fullName,
     label: fieldDef.label,
     selectOptionsHook: fieldDef.selectOptionsHook,
     loadingHook: fieldDef.loadingHook,
     refreshActionHook: fieldDef.refreshActionHook,
     addActionHook: fieldDef.addActionHook,
     selectIdKey: fieldDef.selectIdKey,
     selectLabelKey: fieldDef.selectLabelKey,
     disabled: disabled,
     required: fieldDef.required,
     multiple: fieldDef.multiple,
     placeholder: fieldDef.placeholder,
     options: fieldDef.options,
   };
   return (
     <DynamicSelectFieldLocal
       field={fieldForSelect}
       responsive={fieldDef.responsive || { sm: 12 }}
     />
   );
 };

  return (
    <ColComponent responsive={responsive} autoPadding>
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "0.75rem",
          }}
        >
          <label
            style={{
              fontWeight: 600,
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.text.primary,
            }}
          >
            {label}
          </label>
          {values.length > 0 && (
            <span
              style={{
                background: `${theme.colors.primary.DEFAULT}15`,
                color: theme.colors.primary.DEFAULT,
                borderRadius: "40px",
                padding: "2px 10px",
                fontSize: "0.7rem",
                fontWeight: 700,
                border: `1px solid ${theme.colors.primary.DEFAULT}30`,
              }}
            >
              {values.length}
            </span>
          )}
        </div>

        <FieldArray
          name={name}
          render={({ push, remove }) => (
            <>
              {allowAdd && !disabled && (
                <button
                  type="button"
                  onClick={() => push(getEmptyItem())}
                  style={{
                    marginTop: ".3rem",
                    marginBottom: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: `1.5px dashed ${theme.colors.primary.DEFAULT}70`,
                    color: theme.colors.primary.DEFAULT,
                    padding: "8px 20px",
                    borderRadius: theme.radius.lg,
                    cursor: "pointer",
                    fontSize: theme.typography.fontSize.sm,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      `${theme.colors.primary.DEFAULT}10`;
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      theme.colors.primary.DEFAULT;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "none";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      `${theme.colors.primary.DEFAULT}70`;
                  }}
                >
                  <HiPlus size={16} /> {addButtonLabel}
                </button>
              )}
              {values.length === 0 ? (
                <div
                  style={{
                    padding: "3rem 1.5rem",
                    textAlign: "center",
                    border: `1px dashed ${theme.colors.border.DEFAULT}`,
                    borderRadius: theme.radius.xl,
                    background: `${theme.colors.background.surface}80`,
                    color: theme.colors.text.disabled,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <span>No hay {itemLabel}s agregados.</span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      border: `1px solid ${hasError ? theme.colors.border.error : theme.colors.border.DEFAULT}`,
                      borderRadius: theme.radius.xl,
                      overflow: "hidden",
                      boxShadow: theme.shadows.sm,
                    }}
                  >
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 480,
                          overflowY: "visible",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              background: `linear-gradient(to bottom, ${theme.colors.background.surface}, ${theme.colors.background.card})`,
                              borderBottom: `1px solid ${theme.colors.border.DEFAULT}`,
                            }}
                          >
                            {fields.map((f) => (
                              <th
                                key={f.name}
                                style={{
                                  textAlign: "left",
                                  padding: "14px 12px",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  color: theme.colors.text.secondary,
                                  textTransform: "uppercase",
                                }}
                              >
                                {f.label}
                                {f.required && (
                                  <span
                                    style={{ color: theme.colors.status.error }}
                                  >
                                    *
                                  </span>
                                )}
                              </th>
                            ))}
                            {allowRemove && <th style={{ width: 50 }} />}
                          </tr>
                        </thead>
                        <tbody>
                          {values.map((_, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom:
                                  idx === values.length - 1
                                    ? "none"
                                    : `1px solid ${theme.colors.border.DEFAULT}30`,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = `${theme.colors.primary.DEFAULT}08`)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              {fields.map((fieldDef) => (
                                <td
                                  key={fieldDef.name}
                                  style={{
                                    padding: "8px 12px",
                                    verticalAlign: "middle",
                                    overflow: "visible",
                                  }}
                                >
                                  {fieldDef.type === "select"
                                    ? renderSelectField(fieldDef, idx)
                                    : renderNativeField(fieldDef, idx)}
                                </td>
                              ))}
                              {allowRemove && (
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    textAlign: "center",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => remove(idx)}
                                    disabled={disabled}
                                    title="Eliminar fila"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 32,
                                      height: 32,
                                      background: "none",
                                      border: "none",
                                      borderRadius: theme.radius.md,
                                      cursor: disabled
                                        ? "not-allowed"
                                        : "pointer",
                                      color: theme.colors.text.disabled,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!disabled)
                                        (
                                          e.currentTarget as HTMLButtonElement
                                        ).style.color =
                                          theme.colors.status.error;
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.color =
                                        theme.colors.text.disabled;
                                    }}
                                  >
                                    <HiTrash size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        />

        {hasError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: "0.5rem",
              padding: "8px 12px",
              background: `${theme.colors.status.error}10`,
              border: `1px solid ${theme.colors.status.error}30`,
              borderRadius: theme.radius.md,
              color: theme.colors.status.error,
              fontSize: "0.75rem",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </ColComponent>
  )
};