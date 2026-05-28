import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { theme } from "../../../config/themes";

type LocationButtonProps = {
  idNameLat: string;
  idNameLng: string;
  idNameUbi: string;
  label?: string;
  helperText?: string;
  variant?:
    | "primary"
    | "secondary"
    | "gradient"
    | "outline"
    | "icon"
    | "glass"
    | "neon";
  color?:
    | "cyan"
    | "purple"
    | "pink"
    | "green"
    | "red"
    | "blue"
    | "yellow"
    | "slate";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  disabled?: boolean;
  showMap?: boolean;
  fullWidth?: boolean;
};

export const LocationButton: React.FC<LocationButtonProps> = ({
  idNameLat,
  idNameLng,
  idNameUbi,
  label = "Obtener ubicación",
  helperText,
  variant = "primary",
  color = "blue",
  size = "md",
  className = "",
  disabled = false,
  showMap = true,
  fullWidth = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const formik: any = useFormikContext<any>();
  const isEditMode = Boolean(formik?.values?.id);

  // Tamaños consistentes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-9",
    md: "px-6 py-3 text-base min-h-11",
    lg: "px-8 py-4 text-lg min-h-12",
    xl: "px-10 py-5 text-xl min-h-14",
  }[size];

  // Sistema de colores usando el tema global
  const colorVariants: Record<
    string,
    {
      primary: string;
      hover: string;
      active: string;
      gradientFrom: string;
      gradientTo: string;
      border: string;
      text: string;
      glow: string;
      glass: string;
    }
  > = {
    cyan: {
      primary: `bg-[${theme.colors.status.info}]`,
      hover: `hover:bg-[${theme.colors.status.info}cc] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.status.info}99] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.status.info}]`,
      gradientTo: `to-[${theme.colors.primary.DEFAULT}]`,
      border: `border-[${theme.colors.status.info}]`,
      text: `text-[${theme.colors.status.info}]`,
      glow: `shadow-[${theme.colors.status.info}/25]`,
      glass: `bg-[${theme.colors.status.info}/10] backdrop-blur-sm border-[${theme.colors.status.info}/20]`,
    },
    purple: {
      primary: `bg-[${theme.colors.secondary.DEFAULT}]`,
      hover: `hover:bg-[${theme.colors.secondary.dark}] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.secondary.dark}cc] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.secondary.DEFAULT}]`,
      gradientTo: `to-[${theme.colors.primary.DEFAULT}]`,
      border: `border-[${theme.colors.secondary.DEFAULT}]`,
      text: `text-[${theme.colors.secondary.DEFAULT}]`,
      glow: `shadow-[${theme.colors.secondary.DEFAULT}/25]`,
      glass: `bg-[${theme.colors.secondary.DEFAULT}/10] backdrop-blur-sm border-[${theme.colors.secondary.DEFAULT}/20]`,
    },
    pink: {
      primary: `bg-[${theme.colors.primary.light}]`,
      hover: `hover:bg-[${theme.colors.primary.DEFAULT}] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.primary.dark}] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.primary.light}]`,
      gradientTo: `to-[${theme.colors.primary.DEFAULT}]`,
      border: `border-[${theme.colors.primary.light}]`,
      text: `text-[${theme.colors.primary.light}]`,
      glow: `shadow-[${theme.colors.primary.light}/25]`,
      glass: `bg-[${theme.colors.primary.light}/10] backdrop-blur-sm border-[${theme.colors.primary.light}/20]`,
    },
    green: {
      primary: `bg-[${theme.colors.status.success}]`,
      hover: `hover:bg-[${theme.colors.status.success}cc] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.status.success}99] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.status.success}]`,
      gradientTo: `to-[${theme.colors.status.success}cc]`,
      border: `border-[${theme.colors.status.success}]`,
      text: `text-[${theme.colors.status.success}]`,
      glow: `shadow-[${theme.colors.status.success}/25]`,
      glass: `bg-[${theme.colors.status.success}/10] backdrop-blur-sm border-[${theme.colors.status.success}/20]`,
    },
    red: {
      primary: `bg-[${theme.colors.status.error}]`,
      hover: `hover:bg-[${theme.colors.status.error}cc] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.status.error}99] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.status.error}]`,
      gradientTo: `to-[${theme.colors.status.warning}]`,
      border: `border-[${theme.colors.status.error}]`,
      text: `text-[${theme.colors.status.error}]`,
      glow: `shadow-[${theme.colors.status.error}/25]`,
      glass: `bg-[${theme.colors.status.error}/10] backdrop-blur-sm border-[${theme.colors.status.error}/20]`,
    },
    blue: {
      primary: `bg-[${theme.colors.primary.DEFAULT}]`,
      hover: `hover:bg-[${theme.colors.primary.dark}] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.primary.dark}cc] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.primary.DEFAULT}]`,
      gradientTo: `to-[${theme.colors.primary.light}]`,
      border: `border-[${theme.colors.primary.DEFAULT}]`,
      text: `text-[${theme.colors.primary.DEFAULT}]`,
      glow: `shadow-[${theme.colors.primary.DEFAULT}/25]`,
      glass: `bg-[${theme.colors.primary.DEFAULT}/10] backdrop-blur-sm border-[${theme.colors.primary.DEFAULT}/20]`,
    },
    yellow: {
      primary: `bg-[${theme.colors.status.warning}]`,
      hover: `hover:bg-[${theme.colors.status.warning}cc] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.status.warning}99] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.status.warning}]`,
      gradientTo: `to-[${theme.colors.status.warning}cc]`,
      border: `border-[${theme.colors.status.warning}]`,
      text: `text-[${theme.colors.status.warning}]`,
      glow: `shadow-[${theme.colors.status.warning}/25]`,
      glass: `bg-[${theme.colors.status.warning}/10] backdrop-blur-sm border-[${theme.colors.status.warning}/20]`,
    },
    slate: {
      primary: `bg-[${theme.colors.neutral[700]}]`,
      hover: `hover:bg-[${theme.colors.neutral[800]}] hover:shadow-lg hover:-translate-y-0.5`,
      active: `active:bg-[${theme.colors.neutral[900]}] active:translate-y-0`,
      gradientFrom: `from-[${theme.colors.neutral[700]}]`,
      gradientTo: `to-[${theme.colors.neutral[600]}]`,
      border: `border-[${theme.colors.neutral[500]}]`,
      text: `text-[${theme.colors.neutral[600]}]`,
      glow: `shadow-[${theme.colors.neutral[500]}/25]`,
      glass: `bg-[${theme.colors.neutral[500]}/10] backdrop-blur-sm border-[${theme.colors.neutral[500]}/20]`,
    },
  };

  const c = colorVariants[color];

  // Estilos base
  const baseClasses = `
    font-semibold rounded-xl shadow-md
    flex items-center justify-center
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-3 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden group
  `;

  // Variantes de estilo
  const variantClasses = {
    primary: `
      ${c.primary} text-white ${c.hover} ${c.active}
      shadow-lg ${c.glow} focus:ring-${color}-300
    `,
    secondary: `
      bg-white text-slate-700 border border-slate-200
      hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg
      active:bg-slate-100 focus:ring-slate-300
      shadow-sm
    `,
    gradient: `
      bg-gradient-to-r ${c.gradientFrom} ${c.gradientTo} text-white
      hover:shadow-xl hover:-translate-y-0.5 ${c.glow}
      active:translate-y-0 focus:ring-${color}-300
      relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/10 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100
    `,
    outline: `
      border-2 ${c.border} ${c.text} bg-transparent
      hover:bg-${color}-50 hover:${c.text} hover:border-${color}-500
      active:bg-${color}-100 focus:ring-${color}-300
      transition-colors duration-200
    `,
    icon: `
      w-12 h-12 rounded-full ${c.primary} text-white
      hover:shadow-lg hover:-translate-y-0.5 ${c.hover}
      active:translate-y-0 focus:ring-${color}-300
      shadow-md ${c.glow}
    `,
    glass: `
      ${c.glass} ${c.text} border
      backdrop-filter backdrop-blur-sm
      hover:shadow-lg hover:-translate-y-0.5 hover:bg-${color}-500/20
      active:translate-y-0 focus:ring-${color}-300
      shadow-sm
    `,
    neon: `
      bg-${color}-500/10 border border-${color}-400/50 ${c.text}
      shadow-lg ${c.glow}
      hover:shadow-xl hover:-translate-y-0.5 hover:bg-${color}-500/20
      active:translate-y-0 focus:ring-${color}-300
      relative after:absolute after:inset-0 after:bg-${color}-400/10 after:opacity-0 after:transition-opacity hover:after:opacity-100
    `,
  }[variant];

  // Cargar ubicación inicial desde Formik (modo edición)
  useEffect(() => {
    const lat = parseFloat(formik.values?.[idNameLat]);
    const lon = parseFloat(formik.values?.[idNameLng]);
    if (!isNaN(lat) && !isNaN(lon)) {
      setLocation({ lat, lon });
    }
    handleGetLocation();
  }, [formik.values?.[idNameLat], formik.values?.[idNameLng]]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por este navegador.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLocation(coords);

        // Guardar en Formik
        formik?.setFieldValue(idNameLat, coords.lat);
        formik?.setFieldValue(idNameLng, coords.lon);
        formik?.setFieldValue(
          idNameUbi,
          `https://www.google.com/maps?q=${coords.lat},${coords.lon}`,
        );

        setLoading(false);
      },
      () => {
        setError(
          "No se pudo obtener la ubicación. Verifica los permisos del navegador.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Spinner de carga
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
      <div
        className="w-5 h-5 border-2 rounded-full animate-spin"
        style={{
          borderColor: `${theme.colors.text.inverse}4D`,
          borderTopColor: theme.colors.text.inverse,
        }}
      />
    </div>
  );

  // Ícono de ubicación SVG
  const LocationIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const errorFormik =
    formik.touched[idNameUbi] && formik.errors[idNameUbi]
      ? formik.errors[idNameUbi].toString()
      : null;
  const isError = Boolean(errorFormik);

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} ${className}`}>
      {/* Label */}
      {label && (
        <label
          className={`block font-medium mb-2 ${
            isError || error ? "text-red-600" : ""
          }`}
          style={{
            color: isError || error ? theme.colors.status.error : undefined,
          }}
        >
          {label}
        </label>
      )}

      {/* Botón principal */}
      <button
        onClick={handleGetLocation}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${sizeClasses}
          ${variantClasses}
          ${fullWidth ? "w-full" : "w-auto"}
          transform transition-all duration-300
        `}
      >
        {/* Efecto de ripple */}
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute inset-0 transition-all duration-300 transform scale-0 bg-white/0 group-hover:bg-white/10 group-hover:scale-100" />
        </span>

        {/* Spinner de carga */}
        {loading && <LoadingSpinner />}

        {/* Contenido del botón */}
        <span
          className={`flex items-center justify-center gap-2 ${
            loading ? "opacity-0" : "opacity-100"
          } transition-opacity`}
        >
          <LocationIcon />
          <span className="relative z-10 whitespace-nowrap">
            {isEditMode ? "Actualizar ubicación" : "Obtener ubicación"}
          </span>
        </span>
      </button>

      {/* Mensajes de error */}
      {(error || isError) && (
        <p
          className="mt-2 ml-1 text-sm"
          style={{ color: theme.colors.status.error }}
        >
          {isError ? errorFormik : error}
        </p>
      )}

      {/* Mapa y coordenadas */}
      {location && showMap && (
        <div className="w-full mt-4 space-y-3 text-sm">
          {/* Coordenadas */}
          <div className="flex justify-between gap-4">
            <span
              className="flex-1"
              style={{ color: theme.colors.text.secondary }}
            >
              <strong>Latitud:</strong> {location.lat.toFixed(6)}
            </span>
            <span
              className="flex-1"
              style={{ color: theme.colors.text.secondary }}
            >
              <strong>Longitud:</strong> {location.lon.toFixed(6)}
            </span>
          </div>

          {/* Botón para abrir en Google Maps */}
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <button
              className={`
                ${baseClasses}
                ${sizeClasses}
                w-full
              `}
              style={{
                background: theme.colors.primary.DEFAULT,
                color: theme.colors.text.inverse,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.primary.DEFAULT;
              }}
            >
              Abrir en Google Maps
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationButton;
