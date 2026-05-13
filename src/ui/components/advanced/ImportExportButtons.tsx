// src/ui/components/advanced/ImportExportButtons.tsx
import React, { useRef } from "react";
import { FiDownload, FiUpload, FiFileText } from "react-icons/fi";
import type {
   ExportConfig,
   ImportConfig,
} from "../../../types/crud-advanced.types";

interface ImportExportButtonsProps {
   exportConfig?: ExportConfig;
   importConfig?: ImportConfig;
   onExportCSV: () => void;
   onExportExcel: () => void;
   onImport: (file: File) => void;
   isImporting: boolean;
   importProgress: number;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
   exportConfig,
   importConfig,
   onExportCSV,
   onExportExcel,
   onImport,
   isImporting,
   importProgress,
}) => {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         onImport(file);
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   return (
      <div className="flex items-center space-x-2">
         {/* Export */}
         {exportConfig?.enabled && (
            <div className="relative group">
               <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FiDownload className="mr-1.5 h-3.5 w-3.5" />
                  Exportar
               </button>
               <div className="absolute right-0 z-10 hidden w-48 py-1 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg group-hover:block">
                  {exportConfig.formats.includes("csv") && (
                     <button
                        onClick={onExportCSV}
                        className="block w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-gray-50">
                        <FiFileText className="inline w-3 h-3 mr-2" />
                        Exportar como CSV
                     </button>
                  )}
                  {exportConfig.formats.includes("xlsx") && (
                     <button
                        onClick={onExportExcel}
                        className="block w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-gray-50">
                        <FiDownload className="inline w-3 h-3 mr-2" />
                        Exportar como Excel
                     </button>
                  )}
               </div>
            </div>
         )}

         {/* Import */}
         {importConfig?.enabled && (
            <>
               <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                  <FiUpload className="mr-1.5 h-3.5 w-3.5" />
                  {isImporting
                     ? `Importando... ${importProgress}%`
                     : "Importar"}
               </button>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept={importConfig.acceptedFormats.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
               />
            </>
         )}
      </div>
   );
};

export default ImportExportButtons;
