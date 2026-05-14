// import Toast from "./Toast";
import dayjs from "dayjs";
import "dayjs/locale/es"; // importa el locale español
// import * as XLSX from "xlsx";

dayjs.locale("es"); // establece el locale global a español
// import dayjs from "dayjs";
// import sAlert from "./sAlert";
// import Toast from "./Toast";
// // import { colorPrimaryDark } from "../context/GlobalContext";
// import { formatDatetime } from "./Formats";
// import axios from "axios";
import { showToast } from "react-zustore";

export const fmtFecha = (iso: string | number | Date) => {
   const d = new Date(iso);
   return d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
};

export const validateImageRequired = (
   valuesImg: any,
   _msg = "Imagen requerida",
) => {
   if (
      valuesImg == null ||
      valuesImg == "null" ||
      valuesImg == "" ||
      valuesImg.name == "" ||
      valuesImg.name == null ||
      valuesImg.name == "null" ||
      valuesImg.name == "undefined" ||
      valuesImg.name == "[object Object]"
   ) {
      // showToast(msg,"error", "center");
      return false;
   } else return true;
};

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Funcion para evaluar si el valor es numerico
 *
 * @param {string | number} val Valor a evaluar
 * @returns
 */
export const isNumeric = (val: string | number) =>
   typeof val === "number" || /^[0-9]+$/.test(val);

/**
 *
 * @param {string} curp Valor del input correspondiente a la CURP
 * @returns
 */
export function validateCURP(str_curp: string) {
   const curp = str_curp.toUpperCase();
   let regex =
         /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
      validated = curp !== undefined ? curp.match(regex) : false;

   if (!validated)
      //Coincide con el formato general?
      return false;

   //Validar que coincida el dígito verificador
   const checkDigit = (curp17: string) => {
      //Fuente https://consultas.curp.gob.mx/CurpSP/
      let diccionario = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
         lngSuma = 0.0,
         lngDigito = 0.0;
      for (var i = 0; i < 17; i++)
         lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
      lngDigito = 10 - (lngSuma % 10);
      if (lngDigito == 10) return 0;
      return lngDigito;
   };

   if (Number(validated[2]) != checkDigit(validated[1])) return false;

   return true; //Validado
}

//#region /** FECHAS - FORMATEADO */

/**
 * Valida el rango de fechas.
 * @param action - Acción: "create" u otra.
 * @param input_initial_date - Objeto con método val() que retorna la fecha.
 * @param input_final_date - Objeto con método val() que retorna la fecha.
 * @returns true si el rango es válido, false en caso contrario.
 */
export function validateRangeDates(
   action: string,
   input_initial_date: {
      [x: string]: any;
      val: () => string;
   },
   input_final_date: {
      [x: string]: any;
      val: () => string;
   },
): boolean {
   let current_date = new Date();
   let yesterday = new Date(current_date.setDate(current_date.getDate() - 1));
   yesterday = new Date(yesterday.setHours(23, 59, 59));
   const yesterdayTime = yesterday.getTime();

   let date1 = new Date(input_initial_date.val());
   date1 = new Date(date1.setDate(date1.getDate() + 1));
   date1 = new Date(date1.setHours(0, 0, 0));
   const data_date1 = new Date(date1).getTime();

   let date2 = new Date(input_final_date.val());
   date2 = new Date(date2.setDate(date2.getDate() + 1));
   date2 = new Date(date2.setHours(11, 59, 59));
   const data_date2 = new Date(date2).getTime();

   if (action === "create") {
      if (data_date1 <= yesterdayTime) {
         // showToast no definido, asumimos que es showToastWarning
         showToast("No puedes publicar con fecha anterior a hoy.", "warning");
         input_initial_date.focus();
         return false;
      }
   }
   if (data_date1 > data_date2) {
      showToast("Rango de fechas inválido.", "warning");
      input_final_date.focus();
      return false;
   }
   return true;
}

export function binaryDateTimeFormat(the_date: string): string {
   let date = new Date(parseInt(the_date.substr(6)));
   let datetime = dayjs(date).format("MM-DD-YYYY h:mm:ss a");
   return datetime;
}

/**
 * Formatea una fecha u hora a un string legible.
 * @param the_date - Fecha en formato string, number o Date.
 * @param long_format - Si es true incluye hora, si no solo fecha.
 * @param format - Formato personalizado (opcional).
 * @returns Fecha formateada o "Sin Fecha".
 */
export function formatDatetime(
   the_date: string | number | Date | null | undefined,
   long_format: boolean = true,
   format: string | null = null,
): string {
   if (the_date == null || the_date === "") return "Sin Fecha";
   dayjs.locale("es");
   // Si la fecha trae la T de separador y caracteres después de los segundos, se quita para evitar errores
   let cleanDate: string | number | Date = the_date;
   if (typeof the_date === "string" && the_date.includes("T")) {
      cleanDate = the_date.replace(/\.\d+Z?$/, "");
   }
   let date = new Date(cleanDate);
   let datetime: string;
   const formato = !format
      ? long_format
         ? "DD-MM-YYYY h:mm:ss a"
         : "DD-MM-YYYY"
      : format;
   datetime = dayjs(date).format(formato);
   return datetime;
}

/**
 * Obtiene la edad a partir de la fecha de nacimiento.
 * @param birthdate - Fecha de nacimiento.
 * @param reference - Fecha de referencia (por defecto hoy).
 * @returns Edad en años o "Sin Fecha".
 */
export function getAge(
   birthdate: string | Date | null | undefined,
   reference: Date = new Date(),
): number | string {
   if (birthdate == null) return "Sin Fecha";
   dayjs.locale("es");
   const date = new Date(birthdate);
   const age = dayjs(reference).diff(date, "years");
   return age;
}

/**
 * Convierte una fecha a formato SQL.
 * @param the_date - Fecha a convertir.
 * @param dbType - Tipo de base de datos ("mysql" o "sqlserver").
 * @returns Fecha en formato YYYY-MM-DD HH:mm:ss o YYYY-MM-DDTHH:mm:ss.
 */
export function formatDatetimeToSQL(
   the_date: string | Date,
   dbType: string = "mysql",
): string {
   const date = dayjs(the_date);
   if (dbType.toLowerCase() === "sqlserver") {
      return date.format("YYYY-MM-DDTHH:mm:ss");
   }
   return date.format("YYYY-MM-DD HH:mm:ss");
}

//#endregion

/**
 * Formatea un número a moneda.
 * @param amount - Cantidad.
 * @param MX - Si es true usa formato MX, si no USD.
 * @param show_currency - Si muestra el símbolo de moneda.
 * @returns String formateado.
 */
export function formatCurrency(
   amount: number,
   MX: boolean = true,
   show_currency: boolean = true,
): string {
   let divisa = "MXN";
   let total = new Intl.NumberFormat("es-MX").format(amount);
   if (!MX) {
      divisa = "USD";
      total = new Intl.NumberFormat("en-US").format(amount);
   }
   if (!total.includes(".")) total += ".00";
   let decimales = total.split(".").reverse();
   if (decimales[0].length === 1) total += "0";
   if (amount === 0) total = "0.00";
   show_currency ? (total = `$${total} ${divisa}`) : (total = `$${total}`);
   return total;
}

/**
 * Aplica formato de moneda a una lista de elementos jQuery.
 * @param tds - Array de elementos TD de jQuery.
 */
// export function formatearCantidadDeRenglones(tds: JQuery<HTMLElement>): void {
//    // Nota: Esta función usa jQuery. Si no se usa jQuery, se puede eliminar o adaptar.
//    tds.each(function (this: HTMLElement) {
//       let td = $(this);
//       let cantidad = td.text();
//       let cantidad_formateada = formatCurrency(parseFloat(cantidad));
//       td.html(`${cantidad_formateada}`);
//    });
// }

/**
 * Formatea un número de teléfono a 10 dígitos con espacios.
 * @param phone - Cadena de números.
 * @returns Teléfono formateado o "Sin numero".
 */
export function formatPhone(phone: string): string {
   if (!phone) return "Sin numero";
   return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)}${phone.slice(-2)}`;
}

/**
 * Manejador para input de teléfono: limpia caracteres no numéricos.
 */
export const handlePhoneChange = (
   e: React.ChangeEvent<HTMLInputElement>,
   setFieldValue: (field: string, value: any) => void,
   input: string,
): void => {
   const cleanedValue = e.target.value.replace(/[^\d]/g, "");
   setFieldValue(input, cleanedValue);
};

export function formatToLowerCase(
   event: React.ChangeEvent<HTMLInputElement>,
): string {
   return event.target.value.toLowerCase();
}

export function formatToUpperCase(
   event: React.ChangeEvent<HTMLInputElement>,
): string {
   return event.target.value.toUpperCase();
}

export const handleInputFormik = async (
   e: React.ChangeEvent<HTMLInputElement>,
   setFieldValue: (field: string, value: any) => void,
   input: string,
   toUpper: boolean = true,
): Promise<void> => {
   try {
      const newText = toUpper ? formatToUpperCase(e) : formatToLowerCase(e);
      setFieldValue(input, newText);
   } catch (error: any) {
      console.log(error);
      showToast(error, "error");
   }
};

export const handleInputStringCase = async (
   e: React.ChangeEvent<HTMLInputElement>,
   setState: React.Dispatch<React.SetStateAction<string>>,
   toUpper: boolean = true,
): Promise<void> => {
   try {
      const newText = toUpper ? formatToUpperCase(e) : formatToLowerCase(e);
      setState(newText);
   } catch (error: any) {
      console.log(error);
      showToast(error, "error");
   }
};

export const splitArroba = (
   string: string,
   returnFirst: boolean = true,
): string | undefined => {
   try {
      const array = string.split("@");
      const value = returnFirst ? array[0] : array.reverse()[0];
      return value;
   } catch (error: any) {
      console.log(error);
      showToast(error, "error");
      return undefined;
   }
};

/**
 * Agrupa un array de objetos por una clave.
 * @param data - Array de objetos.
 * @param key - Clave por la cual agrupar (puede ser anidada con ".").
 * @param returnArray - Si es true retorna un array de [key, value], si no un objeto.
 * @param consoleLogResult - Si muestra en consola el resultado.
 * @returns Objeto o array agrupado.
 */
export const groupBy = <T extends Record<string, any>>(
   data: T[],
   key: string,
   returnArray: boolean,
   consoleLogResult: boolean = false,
): Record<string, T[]> | [string, T[]][] => {
   let result: Record<string, T[]> = data.reduce(
      (acc: Record<string, T[]>, current: T) => {
         const keys = key.includes(".") ? key.split(".") : null;
         let keyValue: any;
         if (keys) {
            keyValue = current[keys[0]]?.[keys[1]];
         } else {
            keyValue = current[key];
         }
         if (!acc[keyValue]) {
            acc[keyValue] = [];
         }
         acc[keyValue].push(current);
         return acc;
      },
      {},
   );

   let finalResult: Record<string, T[]> | [string, T[]][] = result;
   if (returnArray) finalResult = Object.entries(result);

   if (consoleLogResult)
      console.log(
         `🚀 ~ groupBy ~ result ${returnArray ? "array" : "object"}:`,
         finalResult,
      );
   return finalResult;
};

/**
 * Obtiene todas las claves de un objeto anidado con prefijo.
 * @param obj - Objeto a inspeccionar.
 * @param prefix - Prefijo inicial.
 * @returns Array de claves con notación de puntos.
 */
export const getKeys = (obj: any, prefix: string = ""): string[] => {
   return Object.entries(obj).flatMap(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
         value !== null &&
         typeof value === "object" &&
         !Array.isArray(value)
      ) {
         return getKeys(value, newKey);
      }
      return newKey;
   });
};

/**
 * Elimina duplicados de un array de objetos según una clave.
 * @param data - Array de objetos.
 * @param key - Clave para determinar unicidad.
 * @returns Array sin duplicados.
 */
export const unifyBy = <T extends Record<string, any>>(
   data: T[],
   key: keyof T,
): T[] => {
   return Array.from(new Map(data.map((item) => [item[key], item])).values());
};

/**
 * Corta un texto en líneas de longitud máxima.
 * @param text - Texto a dividir.
 * @param lengthRow - Longitud máxima por línea.
 * @returns Array de líneas.
 */
export const cutLinesPDF = (
   text: string,
   lengthRow: number = 100,
): string[] => {
   if (typeof text !== "string") return [];
   const lines = text.split(/\r\n|\n/);
   const rows: string[] = [];
   lines.forEach((line) => {
      for (let i = 0; i < line.length; i += lengthRow) {
         const fragment = line.slice(i, i + lengthRow);
         rows.push(fragment);
      }
   });
   return rows;
};

const unidades = [
   "",
   "uno",
   "dos",
   "tres",
   "cuatro",
   "cinco",
   "seis",
   "siete",
   "ocho",
   "nueve",
];
const especiales = [
   "diez",
   "once",
   "doce",
   "trece",
   "catorce",
   "quince",
   "dieciséis",
   "diecisiete",
   "dieciocho",
   "diecinueve",
];
const decenas = [
   "",
   "diez",
   "veinte",
   "treinta",
   "cuarenta",
   "cincuenta",
   "sesenta",
   "setenta",
   "ochenta",
   "noventa",
];
const centenas = [
   "",
   "cien",
   "doscientos",
   "trescientos",
   "cuatrocientos",
   "quinientos",
   "seiscientos",
   "setecientos",
   "ochocientos",
   "novecientos",
];

/**
 * Convierte un número a texto (límite hasta 99,999.99).
 * @param number - Número a convertir.
 * @returns Texto representando la cantidad.
 */
export const numberToText = (number: number | string): string => {
   try {
      return convertirNumeroATexto(number);

      function convertirNumeroATexto(numero: number | string): string {
         const [enterosStr, decimalesStr] = numero.toString().split(".");
         const enteros = parseInt(enterosStr, 10);
         const decimales = decimalesStr || "";

         let textoEnteros = convertirParteEntera(enterosStr);
         let textoDecimales = convertirParteDecimal(decimales);

         let resultado = `son ${textoEnteros} peso${enteros !== 1 ? "s" : ""}`;
         if (textoDecimales) {
            const decInt = parseInt(decimales, 10);
            resultado += ` con ${textoDecimales} centavo${decInt !== 1 ? "s" : ""}`;
         }
         return resultado;
      }

      function convertirParteEntera(numeroStr: string): string {
         if (numeroStr === "0") return "cero";
         let partes: string[] = [];
         let num = parseInt(numeroStr, 10);

         if (num >= 10000 && num < 20000) {
            partes.push(
               `${especiales[parseInt(numeroStr.slice(0, 2), 10) - 10]} mil`,
            );
            num = num % 1000;
         } else if (num >= 20000 && num <= 100000) {
            const miles = Math.floor(num / 1000);
            if (miles >= 30)
               partes.push(
                  `${decenas[Math.floor(parseInt(numeroStr.slice(0, 2), 10) / 10)]}`,
               );
            num = num % 10000;

            if (miles === 20) {
               partes.push("veinte mil");
               num = num % 1000;
            } else if (miles === 21) {
               partes.push("veintiún mil");
               num = num % 1000;
            } else if (miles >= 22 && miles < 30) {
               partes.push(`veinti${unidades[Math.floor(num / 1000)]} mil`);
               num = num % 1000;
            } else {
               if (miles % 10 > 0) partes.push("y");
               if (miles % 10 === 1) partes.push("un mil");
               else partes.push(`${unidades[Math.floor(num / 1000)]} mil`);
               num = num % 1000;
            }
         } else if (num >= 1000) {
            partes.push(`${unidades[Math.floor(num / 1000)]} mil`);
            num = num % 1000;
         }

         if (num >= 100) {
            if (num >= 101 && num < 200) {
               partes.push("ciento");
            } else {
               partes.push(centenas[Math.floor(num / 100)]);
            }
            num = num % 100;
         }

         if (num >= 10 && num < 20) {
            partes.push(especiales[num - 10]);
         } else {
            const dec = Math.floor(num / 10);
            if (dec >= 3) partes.push(decenas[Math.floor(num / 10)]);
            if (dec === 2) {
               const uni = num % 10;
               num = num % 10;
               if (uni === 0) partes.push("veinte");
               else if (uni === 1) partes.push("veintiún");
               else partes.push(`veinti${unidades[num]}`);
            } else {
               num = num % 10;
               if (dec >= 3 && num > 0) partes.push("y");
               if (
                  includesInArray(partes, ["cien", "ciento", "mil"]) &&
                  num === 1
               )
                  partes.push("un");
               else partes.push(unidades[num]);
            }
         }
         return partes
            .filter((p) => p !== "")
            .join(" ")
            .trim();
      }

      function convertirParteDecimal(numero: string): string {
         if (!numero) return "";
         let num = numero;
         if (num.length === 1) num += "0";
         return convertirParteEntera(num);
      }
   } catch (error: any) {
      console.log("Error en numberToText:", error);
      showToast(error, "error");
      return "";
   }
};

/**
 * Verifica si un array contiene al menos uno (o todos) los elementos de otro.
 * @param array1 - Array principal.
 * @param array2 - Array de valores a buscar.
 * @param allValues - Si es true, deben coincidir todos; si false, al menos uno.
 * @returns Booleano.
 */
export const includesInArray = <T>(
   array1: T[],
   array2: T[],
   allValues: boolean = false,
): boolean => {
   try {
      if (allValues) {
         return array2.every((element) => array1.includes(element));
      } else {
         return array2.some((element) => array1.includes(element));
      }
   } catch (error: any) {
      console.log("Error en includesInArray:", error);
      showToast(error, "error");
      return false;
   }
};

/**
 * Convierte una imagen desde una URI a un objeto tipo File (para React Native / Web).
 * @param uri - URI de la imagen.
 * @param fileName - Nombre del archivo.
 * @param mimeType - Tipo MIME.
 * @returns Objeto File-like.
 */
export const convertImageToFile = async (
   uri: string,
   fileName: string,
   mimeType: string,
): Promise<{
   uri: string;
   name: string;
   type: string;
   originalName: string;
   fileName: string;
   mimeType: string;
}> => {
   const file = {
      uri,
      name: fileName,
      type: mimeType,
      originalName: uri,
      fileName: fileName,
      mimeType: mimeType,
   };
   return file;
};

/**
 * Convierte una cadena base64 a un objeto File.
 * @param base64String - Cadena base64.
 * @param fileName - Nombre del archivo.
 * @returns Objeto File.
 */
export const base64ToFile = async (
   base64String: string,
   fileName: string,
): Promise<File> => {
   const response = await fetch(base64String);
   const blob = await response.blob();
   return new File([blob], fileName, { type: blob.type });
};

/**
 * Convierte un objeto plano a FormData.
 * @param objForm - Objeto con valores.
 * @returns FormData.
 */
export const convertToFormData = async (
   objForm: Record<string, any>,
): Promise<FormData> => {
   const formData = new FormData();
   Object.keys(objForm).forEach((key) => {
      const value = objForm[key];
      if (typeof value === "object" && value != null) {
         if (
            includesInArray(Object.keys(value), ["uri", "name", "type"], true)
         ) {
            formData.append(key, {
               uri: value.uri,
               name: value.name,
               type: value.type,
            } as any);
         } else {
            formData.append(key, JSON.stringify(value));
         }
      } else {
         formData.append(key, value);
      }
   });
   return formData;
};

/**
 * Elimina elementos duplicados de un array.
 * @param array - Array con posibles duplicados.
 * @returns Array sin duplicados.
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
   return [...new Set(array)];
};

/**
 * Filtra un objeto para mantener solo las propiedades que existen en el objeto original.
 * @param original - Objeto original con las propiedades permitidas.
 * @param newArray - Objeto con posibles valores nuevos.
 * @returns Objeto filtrado.
 */
export function setPropsOriginals<T extends Record<string, any>>(
   original: T,
   newArray: Partial<T>,
): Partial<T> {
   return Object.keys(original).reduce((obj, key) => {
      if (newArray.hasOwnProperty(key)) {
         (obj as any)[key] = newArray[key];
      }
      return obj;
   }, {} as Partial<T>);
}

/**
 * Busca en un array de objetos según criterios.
 * @param data - Array de objetos.
 * @param searchKey - Clave a buscar (puede ser anidada con "."). Si es vacío, busca en todas.
 * @param values - Valores a buscar (si isBool es true, se ignora).
 * @param isBool - Si es true, verifica si la propiedad es null o no.
 * @returns Array filtrado.
 */
export function search<T extends Record<string, any>>(
   data: T[],
   searchKey: string = "",
   values: string[] = [],
   isBool: boolean = false,
): T[] {
   if (searchKey) {
      const [key, subkey] = searchKey.split(".");
      return data.filter((item) => {
         const value = subkey ? item[key]?.[subkey] : item[key];
         if (isBool) {
            return values[0] ? value !== null : value === null;
         }
         return values.length > 0
            ? values.some((filtro) =>
                 String(value ?? "")
                    .toLowerCase()
                    .includes(String(filtro).toLowerCase()),
              )
            : false;
      });
   } else {
      return data.filter((item) =>
         Object.values(item).some((value) =>
            String(value).toLowerCase().includes(String(values).toLowerCase()),
         ),
      );
   }
}

/**
 * Obtiene las claves de un objeto cuyo valor es verdadero.
 * @param data - Objeto a inspeccionar.
 * @returns Array de claves con valor truthy.
 */
export const getKeysBy = (data: Record<string, any>): string[] => {
   return Object.entries(data)
      .filter(([_, value]) => value)
      .map(([key]) => key);
};

/**
 * Imprime el contenido de un elemento HTML.
 * @param titlePrint - Título de la ventana de impresión.
 * @param idContent - ID del elemento cuyo contenido se imprimirá.
 */
export const printContent = (titlePrint: string, idContent: string): void => {
   const content = document.getElementById(idContent)?.innerHTML;
   const printWindow = window.open("", "_blank");
   if (!printWindow) return;
   printWindow.document.writeln(`<html><head>
         <title>${titlePrint}</title>
         <script src="https://cdn.tailwindcss.com/3.4.17"></script>
         <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css" rel="stylesheet" type="text/css" />
         <link rel="preconnect" href="https://fonts.googleapis.com">
         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
         <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
         <style>
            table{font-family: 'Outfit', sans-serif;}
            svg{max-width:50px; max-height:50px}
            .checkCross{max-width:50px; max-height:50px}
            .containerImg {
               text-align: center;
               padding: 20px;
               border-radius: 10px;
               margin-bottom: 20px;
               display: flex;
               flex-direction: column;
               align-items: center;
            }
            .containerImg .title {
               font-size: 35px;
               font-weight: bold;
               color: #364152;
            }
            .containerImg img{
               object-fit: cover;
               max-width: 80%;
               border-radius: 10px;
               margin-block: 10px;
            }
            .containerImg .caption {
               margin-top: -5px;
               font-size: 16px;
               color: #555;
               font-style: italic;
            }
         </style>
      </head><body>`);
   printWindow.document.writeln(content as string);
   printWindow.document.writeln(`</body>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/material-ui/4.12.4/index.min.js" integrity="sha512-kIdy/WIexvksScC2I+uDkS0mx9tkTDDcYHjeY5Rmeum5GQuq8wgZqUv6FUMtGv0bm5KPY0vlps5nKBj+8BGutQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      </html>`);
   printWindow.document.close();
   setTimeout(() => {
      printWindow.print();
   }, 1000);
};

/**
 * Detecta el sistema operativo del dispositivo.
 * @returns Nombre del SO.
 */
export const detectOS = (): string => {
   const userAgent = navigator.userAgent || navigator.vendor;
   if (/android/i.test(userAgent)) return "Android";
   if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream)
      return "iOS";
   if (/Windows NT/.test(userAgent)) return "Windows";
   if (/Macintosh/.test(userAgent)) return "MacOS";
   if (/Linux/.test(userAgent)) return "Linux";
   if (/HarmonyOS/i.test(userAgent)) return "HarmonyOS";
   return "Other";
};

/**
 * Genera un enlace para WhatsApp con mensaje predefinido.
 * @param phone - Número a 10 dígitos.
 * @param message - Mensaje a enviar.
 * @returns URL de WhatsApp.
 */
export const getLinkWhatsApp = (phone: string, message: string): string => {
   const phoneNumber = `521${phone}`;
   const messageEncode = encodeURIComponent(message);
   return `https://wa.me/${phoneNumber}?text=${messageEncode}`;
};

/**
 * Genera un avatar a partir del nombre completo.
 * @param name - Nombre completo.
 * @returns Objeto con estilo y children (iniciales).
 */
export function stringAvatar(name: string): {
   sx: { bgcolor: string; fontWeight: string };
   children: string;
} {
   function stringToColor(string: string): string {
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
         hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (let i = 0; i < 3; i++) {
         const value = (hash >> (i * 8)) & 0xff;
         color += `00${value.toString(16)}`.slice(-2);
      }
      return color;
   }
   const letters = !name || name === "null" ? "? ?" : name.toUpperCase();
   const parts = letters.split(" ");
   const firstInitial = parts[0]?.[0] || "";
   const secondInitial = parts[1]?.[0] || parts[0]?.[1] || "";
   const children = `${firstInitial}${secondInitial}`;
   return {
      sx: {
         bgcolor: stringToColor(letters),
         fontWeight: "bold",
      },
      children,
   };
}

/**
 * Pausa la ejecución por un tiempo determinado.
 * @param ms - Milisegundos.
 * @returns Promise.
 */
export const sleep = (ms: number): Promise<void> => {
   return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Convierte una fecha de Excel a formato SQL.
 * @param excelDate - Número serial o string.
 * @param dbType - Tipo de base de datos.
 * @returns Fecha en formato SQL o null.
 */
export function excelDateToJSDate(
   excelDate: number | string,
   dbType: string = "mysql",
): string | null {
   if (!excelDate) return null;
   if (typeof excelDate === "number" && excelDate.toString().length < 10) {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split("T")[0];
   }
   return formatDatetimeToSQL(excelDate.toString(), dbType);
}

/**
 * Detecta si un objeto contiene archivos (File o Blob).
 * @param data - Objeto o FormData.
 * @returns Booleano.
 */
export const hasFiles = (data: any): boolean => {
   if (!data) return false;
   if (data instanceof FormData) return true;
   return Object.values(data).some(
      (val) => val instanceof File || val instanceof Blob,
   );
};

/**
 * Elimina acentos de una cadena.
 * @param str - Cadena de entrada.
 * @returns Cadena sin acentos.
 */
export function removeAccents(str: string): string {
   return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Genera un nombre de usuario a partir de un selector.
 * @param valorSelector - Cadena con formato "ID - NOMBRE APELLIDO".
 * @returns Nombre de usuario generado.
 */
export function generateUsername(valorSelector: string): string {
   if (!valorSelector) return "";
   let partes = valorSelector.split("-");
   let nombreCompleto = partes.length > 1 ? partes[1] : partes[0];
   nombreCompleto = nombreCompleto.trim();
   nombreCompleto = removeAccents(nombreCompleto.replace(/\s+/g, " "));
   const palabras = nombreCompleto.split(" ");
   const nombresFiltrados = palabras.filter(
      (p) => !["DE", "DEL", "LA", "LAS", "LOS"].includes(p.toUpperCase()),
   );
   const primerNombre = nombresFiltrados[0] || "";
   const apellidoPaterno = nombresFiltrados[1] || "";
   const apellidoMaterno = nombresFiltrados[2] || "";
   const nombreFormateado =
      primerNombre.charAt(0).toUpperCase() +
      primerNombre.slice(1).toLowerCase();
   let iniciales = "";
   if (apellidoPaterno && apellidoMaterno) {
      iniciales =
         apellidoPaterno.charAt(0).toUpperCase() +
         apellidoMaterno.charAt(0).toUpperCase();
   } else if (apellidoPaterno) {
      iniciales = apellidoPaterno.slice(0, 2).toUpperCase();
   }
   return `${nombreFormateado}${iniciales}`;
}
