import { useFormikContext } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────── */
const DS = {
   bg: "#FAFAF9",
   white: "#FFFFFF",
   surface: "#F5F4F1",
   surfaceHover: "#EFEDE8",
   border: "#D6D3CC",
   borderHover: "#A8A39A",
   borderFocus: "#2D2A26",
   borderError: "#C0392B",
   text1: "#1C1A17",
   text2: "#6B6560",
   text3: "#A8A39A",
   textPlaceholder: "#B8B3AA",
   accent: "#3730A3",
   accentLight: "rgba(55,48,163,0.08)",
   accentMid: "rgba(55,48,163,0.16)",
   accentGlow: "0 0 0 3px rgba(55,48,163,0.12)",
   errorBg: "#FEF2F2",
   errorBorder: "#FCA5A5",
   errorText: "#DC2626",
   successBg: "#F0FDF4",
   successText: "#16A34A",
   warningBg: "#FFFBEB",
   warningText: "#D97706",
   r3: "4px",
   r6: "8px",
   r8: "10px",
   r10: "12px",
   shadowSm: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)",
   shadowMd: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
   shadowDropdown: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
   transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)"
};

/* ─────────────────────────────────────────────────────────────────
   TIPOS DE ARCHIVO
───────────────────────────────────────────────────────────────── */
export type FilePreset = "images" | "documents" | "spreadsheets" | "presentations" | "videos" | "audio" | "archives" | "code" | "all";

interface FileTypeConfig {
   accept: string;
   extensions: string[];
   maxSizeMB: number;
   label: string;
   icon: string;
   color: string;
   colorLight: string;
}

const FILE_PRESETS: Record<FilePreset, FileTypeConfig> = {
   images: {
      accept: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif",
      extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"],
      maxSizeMB: 10,
      label: "Imágenes",
      icon: "🖼",
      color: "#7C3AED",
      colorLight: "rgba(124,58,237,0.08)"
   },
   documents: {
      accept: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
      extensions: ["pdf", "doc", "docx", "txt"],
      maxSizeMB: 25,
      label: "Documentos",
      icon: "📄",
      color: "#1D4ED8",
      colorLight: "rgba(29,78,216,0.08)"
   },
   spreadsheets: {
      accept: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
      extensions: ["xls", "xlsx", "csv"],
      maxSizeMB: 15,
      label: "Hojas de cálculo",
      icon: "📊",
      color: "#047857",
      colorLight: "rgba(4,120,87,0.08)"
   },
   presentations: {
      accept: "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extensions: ["ppt", "pptx"],
      maxSizeMB: 50,
      label: "Presentaciones",
      icon: "📑",
      color: "#B45309",
      colorLight: "rgba(180,83,9,0.08)"
   },
   videos: {
      accept: "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo",
      extensions: ["mp4", "webm", "ogg", "mov", "avi"],
      maxSizeMB: 200,
      label: "Videos",
      icon: "🎬",
      color: "#DC2626",
      colorLight: "rgba(220,38,38,0.08)"
   },
   audio: {
      accept: "audio/mpeg,audio/ogg,audio/wav,audio/aac,audio/flac",
      extensions: ["mp3", "ogg", "wav", "aac", "flac"],
      maxSizeMB: 50,
      label: "Audio",
      icon: "🎵",
      color: "#0891B2",
      colorLight: "rgba(8,145,178,0.08)"
   },
   archives: {
      accept: "application/zip,application/x-rar-compressed,application/x-7z-compressed,application/gzip",
      extensions: ["zip", "rar", "7z", "gz", "tar"],
      maxSizeMB: 100,
      label: "Archivos comprimidos",
      icon: "📦",
      color: "#6B7280",
      colorLight: "rgba(107,114,128,0.08)"
   },
   code: {
      accept: "text/javascript,text/typescript,text/html,text/css,application/json,text/plain",
      extensions: ["js", "ts", "jsx", "tsx", "html", "css", "json", "py", "php"],
      maxSizeMB: 5,
      label: "Código fuente",
      icon: "💻",
      color: "#0F766E",
      colorLight: "rgba(15,118,110,0.08)"
   },
   all: {
      accept: "*/*",
      extensions: ["*"],
      maxSizeMB: 100,
      label: "Cualquier archivo",
      icon: "📎",
      color: "#374151",
      colorLight: "rgba(55,65,81,0.08)"
   }
};

/* ─────────────────────────────────────────────────────────────────
   ESTADO DEL ARCHIVO
───────────────────────────────────────────────────────────────── */
type FileStatus = "idle" | "loading" | "success" | "error";

interface FileEntry {
   id: string;
   file: File;
   status: FileStatus;
   progress: number;
   errorMsg?: string;
   preview?: string;
   isImage: boolean;
   existingUrl?: string;
   existingData?: any;
}

/* ─────────────────────────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────────────────────────── */
const getFileExtension = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const formatBytes = (bytes: number): string => {
   if (bytes === 0) return "0 B";
   const k = 1024;
   const sizes = ["B", "KB", "MB", "GB"];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const isImageFile = (file: File) => file.type.startsWith("image/");

const isImageUrl = (url: string): boolean => {
   return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url);
};

const getFileTypeIcon = (file: File): string => {
   const type = file.type;
   if (type.startsWith("image/")) return "🖼";
   if (type === "application/pdf") return "📕";
   if (type.includes("word")) return "📝";
   if (type.includes("excel") || type.includes("csv") || type.includes("spreadsheet")) return "📊";
   if (type.includes("powerpoint") || type.includes("presentation")) return "📑";
   if (type.startsWith("video/")) return "🎬";
   if (type.startsWith("audio/")) return "🎵";
   if (type.includes("zip") || type.includes("rar") || type.includes("compressed")) return "📦";
   if (type.startsWith("text/") || type.includes("json") || type.includes("javascript")) return "💻";
   return "📄";
};

/* ─────────────────────────────────────────────────────────────────
   COMPRESIÓN DE IMÁGENES
───────────────────────────────────────────────────────────────── */
interface CompressionOptions {
   maxWidth?: number;
   maxHeight?: number;
   quality?: number;
   maxSizeMB?: number;
}

const compressImage = async (file: File, options: CompressionOptions = {}): Promise<File> => {
   const { maxWidth = 1920, maxHeight = 1920, quality = 0.8, maxSizeMB } = options;
   if (!file.type.startsWith("image/")) return file;
   return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
         const img = new Image();
         img.src = e.target?.result as string;
         img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
               const ratio = Math.min(maxWidth / width, maxHeight / height);
               width = Math.round(width * ratio);
               height = Math.round(height * ratio);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            const getBlob = (q: number): Promise<Blob | null> => {
               return new Promise((res) => {
                  canvas.toBlob((blob) => res(blob), file.type, q);
               });
            };
            (async () => {
               let finalQuality = quality;
               let blob = await getBlob(finalQuality);
               if (maxSizeMB && blob && blob.size > maxSizeMB * 1024 * 1024) {
                  let low = 0.3;
                  let high = quality;
                  for (let i = 0; i < 5; i++) {
                     const mid = (low + high) / 2;
                     const testBlob = await getBlob(mid);
                     if (testBlob && testBlob.size <= maxSizeMB * 1024 * 1024) {
                        high = mid;
                        blob = testBlob;
                     } else {
                        low = mid;
                     }
                  }
                  finalQuality = high;
               }
               if (blob) {
                  const compressedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() });
                  resolve(compressedFile);
               } else {
                  resolve(file);
               }
            })();
         };
         img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
   });
};

/* ─────────────────────────────────────────────────────────────────
   SUBCOMPONENTES
───────────────────────────────────────────────────────────────── */
const ProgressBar = ({ progress, status }: { progress: number; status: FileStatus }) => {
   const color = status === "error" ? DS.errorText : status === "success" ? DS.successText : DS.accent;
   return (
      <div style={{ height: 3, background: DS.surface, borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
         <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ height: "100%", background: color, borderRadius: 99, transition: DS.transition }}
         />
      </div>
   );
};

const ExtBadge = ({ ext, color, colorLight }: { ext: string; color: string; colorLight: string }) => (
   <span
      style={{
         display: "inline-flex",
         alignItems: "center",
         padding: "2px 7px",
         borderRadius: DS.r3,
         background: colorLight,
         border: `1px solid ${color}30`,
         fontSize: "11px",
         fontWeight: 700,
         color,
         letterSpacing: "0.05em",
         textTransform: "uppercase" as const,
         fontFamily: "monospace"
      }}
   >
      .{ext}
   </span>
);

const StatusIcon = ({ status }: { status: FileStatus }) => {
   if (status === "loading") {
      return (
         <div
            style={{
               width: 16,
               height: 16,
               border: `2px solid ${DS.border}`,
               borderTopColor: DS.accent,
               borderRadius: "50%",
               animation: "spin 0.7s linear infinite",
               flexShrink: 0
            }}
         />
      );
   }
   if (status === "success") {
      return (
         <svg style={{ width: 16, height: 16, color: DS.successText, flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
         </svg>
      );
   }
   if (status === "error") {
      return (
         <svg style={{ width: 16, height: 16, color: DS.errorText, flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
         </svg>
      );
   }
   return null;
};

/* ─────────────────────────────────────────────────────────────────
   PROPS DEL COMPONENTE
───────────────────────────────────────────────────────────────── */
export interface FormikFileInputProps {
   name: string;
   label: string;
   preset?: FilePreset | FilePreset[];
   customExtensions?: string[];
   customAccept?: string;
   maxFiles?: number;
   maxSizeMB?: number;
   multiple?: boolean;
   disabled?: boolean;
   showPreviews?: boolean;
   compact?: boolean;
   hint?: string;
   onFilesChange?: (files: File[]) => void;
   simulateLoadMs?: number;
   responsive?: { sm?: number; md?: number; lg?: number; xl?: number };
   padding?: boolean;
   compressImages?: boolean;
   imageMaxWidth?: number;
   imageMaxHeight?: number;
   imageQuality?: number;
   imageMaxSizeMB?: number;
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL (CORREGIDO, SIN BUCLE INFINITO)
───────────────────────────────────────────────────────────────── */
export const FormikFileInput: React.FC<FormikFileInputProps> = ({
   name,
   label,
   preset = "all",
   customExtensions,
   customAccept,
   maxFiles = 1,
   maxSizeMB,
   multiple = false,
   disabled = false,
   showPreviews = true,
   compact = false,
   hint,
   onFilesChange,
   simulateLoadMs = 800,
   compressImages = true,
   imageMaxWidth = 1920,
   imageMaxHeight = 1920,
   imageQuality = 0.8,
   imageMaxSizeMB
}) => {
   const formik = useFormikContext<any>();
   const inputRef = useRef<HTMLInputElement>(null);
   const dropRef = useRef<HTMLDivElement>(null);
   const isInternalUpdate = useRef(false); // ← Evita bucles infinitos

   const [entries, setEntries] = useState<FileEntry[]>([]);
   const [isDragging, setIsDragging] = useState(false);
   const [dragCount, setDragCount] = useState(0);
   const [previewModal, setPreviewModal] = useState<string | null>(null);
   const [showAllowed, setShowAllowed] = useState(false);

   // Resolver preset(s)
   const presets = Array.isArray(preset) ? preset : [preset];
   const resolvedConfig = presets.reduce<FileTypeConfig>(
      (acc, p) => {
         const cfg = FILE_PRESETS[p];
         return {
            accept: acc.accept ? `${acc.accept},${cfg.accept}` : cfg.accept,
            extensions: [...acc.extensions, ...cfg.extensions],
            maxSizeMB: Math.max(acc.maxSizeMB, cfg.maxSizeMB),
            label: presets.length > 1 ? "Archivos" : cfg.label,
            icon: presets.length > 1 ? "📎" : cfg.icon,
            color: cfg.color,
            colorLight: cfg.colorLight
         };
      },
      { accept: "", extensions: [], maxSizeMB: 0, label: "", icon: "", color: DS.accent, colorLight: DS.accentLight }
   );

   const effectiveAccept = customAccept || resolvedConfig.accept;
   const effectiveMaxMB = maxSizeMB || resolvedConfig.maxSizeMB;
   const allExtensions = customExtensions
      ? [...new Set([...resolvedConfig.extensions, ...customExtensions.map(e => e.replace(".", ""))])]
      : resolvedConfig.extensions;
   const effectiveMultiple = multiple || maxFiles > 1;

   // Formik touched/errors
   const touched = formik?.touched?.[name];
   const errorMsg = touched && formik?.errors?.[name] ? String(formik.errors[name]) : null;

   // ──────────────────────────────────────────────────────────────
   // Convertir valor de Formik a FileEntry[]
   // ──────────────────────────────────────────────────────────────
   const convertToFileEntries = useCallback((value: any): FileEntry[] => {
      if (!value) return [];
      const items = Array.isArray(value) ? value : [value];
      return items
         .map((item: any, idx: number) => {
            if (item instanceof File) {
               const isImg = isImageFile(item);
               return {
                  id: `file-${Date.now()}-${idx}-${item.name}`,
                  file: item,
                  status: "success",
                  progress: 100,
                  preview: isImg ? URL.createObjectURL(item) : undefined,
                  isImage: isImg
               };
            }
            if (typeof item === "string") {
               const isImg = isImageUrl(item);
               const fileName = item.split("/").pop() || "Archivo";
               const placeholderFile = new File([], fileName);
               return {
                  id: `existing-${idx}-${fileName}`,
                  file: placeholderFile,
                  status: "success",
                  progress: 100,
                  preview: isImg ? item : undefined,
                  isImage: isImg,
                  existingUrl: item
               };
            }
            if (typeof item === "object" && item !== null) {
               const url = item.url || item.src || "";
               const name = item.name || item.filename || "Archivo";
               const isImg = isImageUrl(url);
               const placeholderFile = new File([], name);
               return {
                  id: `existing-${idx}-${name}`,
                  file: placeholderFile,
                  status: "success",
                  progress: 100,
                  preview: isImg ? url : undefined,
                  isImage: isImg,
                  existingUrl: url,
                  existingData: item
               };
            }
            return null;
         })
         .filter(Boolean) as FileEntry[];
   }, []);

   // ──────────────────────────────────────────────────────────────
   // Sincronizar desde Formik → entries (solo cuando el valor externo cambia realmente)
   // ──────────────────────────────────────────────────────────────
   useEffect(() => {
      if (!formik || isInternalUpdate.current) return;
      const currentValue = formik.values?.[name];
      const newEntries = convertToFileEntries(currentValue);
      const currentKey = JSON.stringify(entries.map(e => ({ id: e.id, url: e.existingUrl, name: e.file.name })));
      const newKey = JSON.stringify(newEntries.map(e => ({ id: e.id, url: e.existingUrl, name: e.file.name })));
      if (currentKey !== newKey) {
         entries.forEach(e => {
            if (e.preview && e.preview.startsWith("blob:")) URL.revokeObjectURL(e.preview);
         });
         setEntries(newEntries);
      }
   }, [formik?.values?.[name]]);

   // Carga inicial
   useEffect(() => {
      if (!formik) return;
      const initialValue = formik.values?.[name];
      if (initialValue && entries.length === 0) {
         setEntries(convertToFileEntries(initialValue));
      }
   }, []);

   // ──────────────────────────────────────────────────────────────
   // Sincronizar entries → Formik (evitando bucle)
   // ──────────────────────────────────────────────────────────────
   const syncFormik = useCallback(
      (newEntries: FileEntry[]) => {
         if (!formik) return;
         let newFormikValue: any;
         if (effectiveMultiple) {
            newFormikValue = newEntries.map(entry => {
               if (entry.file.size > 0) return entry.file;
               return entry.existingUrl || entry.existingData || entry.file.name;
            });
         } else {
            if (newEntries.length === 0) {
               newFormikValue = null;
            } else {
               const entry = newEntries[0];
               newFormikValue = entry.file.size > 0 ? entry.file : (entry.existingUrl || entry.existingData || entry.file.name);
            }
         }
         const currentFormikValue = formik.values[name];
         if (JSON.stringify(currentFormikValue) !== JSON.stringify(newFormikValue)) {
            isInternalUpdate.current = true;
            formik.setFieldValue(name, newFormikValue);
            setTimeout(() => { isInternalUpdate.current = false; }, 0);
         }
         const validFiles = newEntries.map(e => e.file).filter(f => f.size > 0);
         onFilesChange?.(validFiles);
      },
      [name, effectiveMultiple, onFilesChange, formik]
   );

   // Cuando entries cambie, sincronizar con Formik
   useEffect(() => {
      if (formik && !isInternalUpdate.current) {
         syncFormik(entries);
      }
   }, [entries, syncFormik, formik]);

   // ──────────────────────────────────────────────────────────────
   // Validar archivo nuevo
   // ──────────────────────────────────────────────────────────────
   const validateFile = useCallback(
      (file: File): string | null => {
         const ext = getFileExtension(file.name);
         if (
            effectiveAccept !== "*/*" &&
            !allExtensions.includes("*") &&
            !allExtensions.includes(ext) &&
            !file.type.split("/").some(t => effectiveAccept.includes(t))
         ) {
            return `Extensión .${ext} no permitida`;
         }
         const mb = file.size / (1024 * 1024);
         if (mb > effectiveMaxMB) {
            return `Excede ${effectiveMaxMB}MB (${formatBytes(file.size)})`;
         }
         return null;
      },
      [effectiveAccept, allExtensions, effectiveMaxMB]
   );

   // ──────────────────────────────────────────────────────────────
   // Procesar archivos nuevos (con compresión)
   // ──────────────────────────────────────────────────────────────
   const processFiles = useCallback(
      async (files: File[]) => {
         const existingNames = entries.map(e => e.file.name);
         const newFiles = files.filter(f => !existingNames.includes(f.name));
         if (newFiles.length === 0) return;

         const slots = effectiveMultiple ? maxFiles - entries.filter(e => e.status !== "error").length : 1;
         const incoming = newFiles.slice(0, Math.max(slots, 0));
         if (incoming.length === 0) return;

         const processedFiles = await Promise.all(
            incoming.map(async (file) => {
               if (compressImages && isImageFile(file)) {
                  try {
                     return await compressImage(file, {
                        maxWidth: imageMaxWidth,
                        maxHeight: imageMaxHeight,
                        quality: imageQuality,
                        maxSizeMB: imageMaxSizeMB
                     });
                  } catch {
                     return file;
                  }
               }
               return file;
            })
         );

         const newEntries: FileEntry[] = processedFiles.map((file) => {
            const valError = validateFile(file);
            const isImg = isImageFile(file);
            return {
               id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
               file,
               status: valError ? "error" : simulateLoadMs > 0 ? "loading" : "success",
               progress: valError ? 100 : 0,
               errorMsg: valError ?? undefined,
               preview: isImg ? URL.createObjectURL(file) : undefined,
               isImage: isImg
            };
         });

         setEntries(prev => {
            const updated = effectiveMultiple ? [...prev, ...newEntries] : newEntries;
            return updated;
         });

         if (simulateLoadMs > 0) {
            newEntries.forEach((entry) => {
               if (entry.status === "error") return;
               const step = 100 / (simulateLoadMs / 50);
               let prog = 0;
               const interval = setInterval(() => {
                  prog = Math.min(prog + step, 100);
                  setEntries(prev =>
                     prev.map(e =>
                        e.id === entry.id ? { ...e, progress: Math.round(prog), status: prog >= 100 ? "success" : "loading" } : e
                     )
                  );
                  if (prog >= 100) clearInterval(interval);
               }, 50);
            });
         }
      },
      [entries, effectiveMultiple, maxFiles, simulateLoadMs, validateFile, compressImages, imageMaxWidth, imageMaxHeight, imageQuality, imageMaxSizeMB]
   );

   // ──────────────────────────────────────────────────────────────
   // Eliminar entrada
   // ──────────────────────────────────────────────────────────────
   const removeEntry = (id: string) => {
      setEntries(prev => {
         const entry = prev.find(e => e.id === id);
         if (entry?.preview && entry.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
         return prev.filter(e => e.id !== id);
      });
      if (formik) formik.setFieldTouched(name, true, false);
   };

   // ──────────────────────────────────────────────────────────────
   // Limpiar todo
   // ──────────────────────────────────────────────────────────────
   const clearAll = () => {
      entries.forEach(e => {
         if (e.preview && e.preview.startsWith("blob:")) URL.revokeObjectURL(e.preview);
      });
      setEntries([]);
      if (formik) formik.setFieldValue(name, effectiveMultiple ? [] : null);
      onFilesChange?.([]);
      if (inputRef.current) inputRef.current.value = "";
   };

   // ──────────────────────────────────────────────────────────────
   // Drag & Drop handlers
   // ──────────────────────────────────────────────────────────────
   const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      setDragCount(c => c + 1);
      setIsDragging(true);
   };
   const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setDragCount(c => {
         const next = c - 1;
         if (next <= 0) setIsDragging(false);
         return next;
      });
   };
   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
   };
   const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragCount(0);
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
      if (formik) formik.setFieldTouched(name, true, false);
   };

   const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      await processFiles(files);
      if (formik) formik.setFieldTouched(name, true, false);
      if (inputRef.current) inputRef.current.value = "";
   };

   const canAddMore = effectiveMultiple ? entries.filter(e => e.status !== "error").length < maxFiles : entries.length === 0;
   const successCount = entries.filter(e => e.status === "success").length;

   // ──────────────────────────────────────────────────────────────
   // RENDER
   // ──────────────────────────────────────────────────────────────
   return (
      <div style={{ width: "100%", marginBottom: 28, boxSizing: "border-box" }}>
         {/* Header */}
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <span style={{ fontSize: 16 }}>{resolvedConfig.icon}</span>
               <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: DS.text2 }}>
                  {label}
               </span>
               {effectiveMultiple && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: DS.accent, background: DS.accentLight, borderRadius: DS.r3, padding: "1px 7px" }}>
                     {successCount}/{maxFiles}
                  </span>
               )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
               {entries.length > 0 && (
                  <button
                     type="button"
                     onClick={clearAll}
                     style={{ fontSize: 11, fontWeight: 600, color: DS.errorText, background: "none", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: DS.r3, transition: DS.transition }}
                     onMouseEnter={e => e.currentTarget.style.background = DS.errorBg}
                     onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                     Limpiar todo
                  </button>
               )}
               <button
                  type="button"
                  onClick={() => setShowAllowed(s => !s)}
                  style={{
                     fontSize: 11, fontWeight: 600, color: showAllowed ? DS.accent : DS.text3,
                     background: showAllowed ? DS.accentLight : "none", border: `1px solid ${showAllowed ? DS.accent + "40" : DS.border}`,
                     cursor: "pointer", padding: "2px 8px", borderRadius: DS.r3, transition: DS.transition, whiteSpace: "nowrap" as const
                  }}
               >
                  {showAllowed ? "Ocultar tipos" : "Ver tipos permitidos"}
               </button>
            </div>
         </div>

         {/* Tipos permitidos expandible */}
         <AnimatePresence>
            {showAllowed && (
               <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", width: "100%" }}
               >
                  <div style={{ width: "100%", padding: "12px 14px", background: DS.surface, border: `1.5px solid ${DS.border}`, borderRadius: DS.r8, boxSizing: "border-box" }}>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, alignItems: "center" }}>
                        {allExtensions.map(ext => (
                           <ExtBadge key={ext} ext={ext === "*" ? "todo" : ext} color={resolvedConfig.color} colorLight={resolvedConfig.colorLight} />
                        ))}
                     </div>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: DS.text3 }}>Tamaño máx. <strong style={{ color: DS.text2 }}>{effectiveMaxMB} MB</strong></span>
                        <span style={{ fontSize: 12, color: DS.text3 }}>Máx. archivos <strong style={{ color: DS.text2 }}>{maxFiles}</strong></span>
                        {effectiveMultiple && <span style={{ fontSize: 12, color: DS.text3 }}>Selección <strong style={{ color: DS.text2 }}>múltiple habilitada</strong></span>}
                        {compressImages && <span style={{ fontSize: 12, color: DS.text3 }}>🖼️ Compresión activa (máx. {imageMaxWidth}x{imageMaxHeight})</span>}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Zona de drop */}
         {!disabled && canAddMore && (
            <div
               ref={dropRef}
               onDragEnter={handleDragEnter}
               onDragLeave={handleDragLeave}
               onDragOver={handleDragOver}
               onDrop={handleDrop}
               onClick={() => !disabled && inputRef.current?.click()}
               style={{
                  width: "100%", position: "relative", border: `2px dashed ${isDragging ? resolvedConfig.color : errorMsg ? DS.borderError : DS.border}`,
                  borderRadius: DS.r10, background: isDragging ? resolvedConfig.colorLight : errorMsg ? DS.errorBg : DS.white,
                  padding: compact ? "20px 16px" : "32px 24px", cursor: disabled ? "not-allowed" : "pointer",
                  transition: DS.transition, textAlign: "center" as const, boxShadow: isDragging ? `0 0 0 3px ${resolvedConfig.color}25` : "none", boxSizing: "border-box"
               }}
               onMouseEnter={e => { if (!isDragging && !disabled) { e.currentTarget.style.borderColor = DS.borderHover; e.currentTarget.style.background = DS.surface; } }}
               onMouseLeave={e => { if (!isDragging) { e.currentTarget.style.borderColor = errorMsg ? DS.borderError : DS.border; e.currentTarget.style.background = errorMsg ? DS.errorBg : DS.white; } }}
            >
               <motion.div animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ fontSize: compact ? 28 : 40, marginBottom: compact ? 8 : 12, lineHeight: 1 }}>
                  {isDragging ? "📂" : resolvedConfig.icon}
               </motion.div>
               <p style={{ margin: 0, fontSize: compact ? 13 : 14, fontWeight: 600, color: isDragging ? resolvedConfig.color : DS.text1 }}>
                  {isDragging ? "Suelta los archivos aquí" : entries.length > 0 ? `Agregar más ${resolvedConfig.label.toLowerCase()}` : `Arrastra ${resolvedConfig.label.toLowerCase()} aquí`}
               </p>
               {!compact && (
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.text3 }}>
                     o <span style={{ color: resolvedConfig.color, fontWeight: 600, textDecoration: "underline", textDecorationStyle: "dotted" as const }}>haz clic para seleccionar</span>
                  </p>
               )}
               {!compact && (
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: DS.text3 }}>
                     {allExtensions.includes("*") ? `Cualquier formato · máx. ${effectiveMaxMB} MB` : `.${allExtensions.slice(0, 5).join(" · .")}${allExtensions.length > 5 ? ` · +${allExtensions.length - 5} más` : ""} · máx. ${effectiveMaxMB} MB`}
                     {compressImages && " · Las imágenes se comprimirán automáticamente"}
                  </p>
               )}
            </div>
         )}

         {/* Disabled state */}
         {disabled && entries.length === 0 && (
            <div style={{ width: "100%", padding: compact ? "14px" : "24px", border: `1.5px solid ${DS.border}`, borderRadius: DS.r10, background: DS.surface, textAlign: "center" as const, color: DS.text3, fontSize: 13, boxSizing: "border-box" }}>
               Campo deshabilitado
            </div>
         )}

         {/* Lista de archivos */}
         <AnimatePresence mode="popLayout">
            {entries.length > 0 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: canAddMore && !disabled ? 12 : 0, width: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                     {entries.map(entry => (
                        <motion.div
                           key={entry.id}
                           layout
                           initial={{ opacity: 0, x: -10, scale: 0.97 }}
                           animate={{ opacity: 1, x: 0, scale: 1 }}
                           exit={{ opacity: 0, x: 10, scale: 0.97 }}
                           transition={{ duration: 0.18 }}
                           style={{
                              width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px",
                              border: `1.5px solid ${entry.status === "error" ? DS.borderError : entry.status === "success" ? DS.border : DS.border}`,
                              borderRadius: DS.r8, background: entry.status === "error" ? DS.errorBg : DS.white,
                              boxShadow: DS.shadowSm, transition: DS.transition, boxSizing: "border-box"
                           }}
                        >
                           {/* Preview / ícono */}
                           {showPreviews && entry.isImage && entry.preview ? (
                              <div
                                 style={{ width: 48, height: 48, borderRadius: DS.r6, overflow: "hidden", flexShrink: 0, background: DS.surface, border: `1px solid ${DS.border}`, cursor: "pointer" }}
                                 onClick={() => setPreviewModal(entry.preview!)}
                              >
                                 <img src={entry.preview} alt={entry.file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                           ) : (
                              <div style={{ width: 48, height: 48, borderRadius: DS.r6, background: resolvedConfig.colorLight, border: `1px solid ${resolvedConfig.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                                 {entry.isImage ? "🖼" : getFileTypeIcon(entry.file)}
                              </div>
                           )}

                           {/* Info */}
                           <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                                 <span style={{ fontSize: 13, fontWeight: 600, color: DS.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "calc(100% - 80px)" }}>
                                    {entry.existingUrl ? (entry.file.name || "Archivo") : entry.file.name}
                                 </span>
                                 <ExtBadge
                                    ext={getFileExtension(entry.file.name)}
                                    color={entry.status === "error" ? DS.errorText : entry.status === "success" ? DS.successText : resolvedConfig.color}
                                    colorLight={entry.status === "error" ? DS.errorBg : entry.status === "success" ? DS.successBg : resolvedConfig.colorLight}
                                 />
                              </div>
                              {entry.status === "error" && entry.errorMsg ? (
                                 <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: DS.errorText }}>✕ {entry.errorMsg}</p>
                              ) : (
                                 <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 11, color: DS.text3 }}>{formatBytes(entry.file.size)}</span>
                                    {entry.status === "success" && <span style={{ fontSize: 11, color: DS.successText, fontWeight: 600 }}>✓ Listo</span>}
                                    {entry.status === "loading" && <span style={{ fontSize: 11, color: DS.accent, fontWeight: 600 }}>{entry.progress}%</span>}
                                 </div>
                              )}
                              {entry.status !== "error" && <ProgressBar progress={entry.progress} status={entry.status} />}
                           </div>

                           {/* Acciones */}
                           <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              <StatusIcon status={entry.status} />
                              {!disabled && (
                                 <button
                                    type="button"
                                    onClick={() => removeEntry(entry.id)}
                                    style={{ width: 28, height: 28, borderRadius: DS.r3, background: DS.surface, border: `1px solid ${DS.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: DS.transition }}
                                    onMouseEnter={e => { e.currentTarget.style.background = DS.errorBg; e.currentTarget.style.borderColor = DS.errorBorder; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = DS.surface; e.currentTarget.style.borderColor = DS.border; }}
                                 >
                                    <svg style={{ width: 12, height: 12, color: DS.text3 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                 </button>
                              )}
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Error Formik */}
         <AnimatePresence>
            {errorMsg && (
               <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 10px", background: DS.errorBg, border: `1px solid ${DS.errorBorder}`, borderRadius: DS.r6, boxSizing: "border-box" }}
               >
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: DS.errorText, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: DS.errorText }}>{errorMsg}</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Hint */}
         {hint && <p style={{ margin: "8px 0 0", fontSize: 12, color: DS.text3, lineHeight: 1.5, width: "100%" }}>{hint}</p>}

         {/* Input oculto */}
         <input
            ref={inputRef}
            type="file"
            name={name}
            accept={effectiveAccept}
            multiple={effectiveMultiple}
            onChange={handleInputChange}
            disabled={disabled}
            style={{ display: "none" }}
            aria-label={label}
         />

         {/* Modal de preview */}
         <AnimatePresence>
            {previewModal && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPreviewModal(null)}
                  style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
               >
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     transition={{ type: "spring", damping: 24 }}
                     onClick={e => e.stopPropagation()}
                     style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
                  >
                     <img src={previewModal} alt="Vista previa" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: DS.r10, objectFit: "contain", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }} />
                     <button
                        onClick={() => setPreviewModal(null)}
                        style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, borderRadius: "50%", background: DS.errorText, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: DS.shadowMd }}
                     >
                        <svg style={{ width: 16, height: 16, color: "white" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
   );
};

export default FormikFileInput;