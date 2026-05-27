// services/axios.config.ts
import axios from "axios";
import { authService } from "../../auth";
// authService
// Instancia para peticiones normales (JSON)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agregar token dinámico usando authService
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Instancia para archivos (multipart/form-data)
const AxiosFiles = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  responseType: "json",
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

AxiosFiles.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (!config.headers) config.headers = new axios.AxiosHeaders();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    config.headers.set("Content-Type", "multipart/form-data");

    return config;
  },
  (error) => Promise.reject(error),
);

// GET genérico
export const GetAxios = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.log("error",error)
    // console.error("Error en la solicitud:", error);
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = "/";
    }
    throw error;
  }
};

// AxiosRequest mejorado: usa AxiosFiles si detecta archivos
export const AxiosRequest = async (
  url: string,
  method: "POST" | "PUT" | "DELETE",
  values?: Record<string, any>,
  forceFormData: boolean = false,
) => {
  try {
    let finalData: any = values;
    const isAlreadyFormData = values instanceof FormData;

    const useFormData = forceFormData || isAlreadyFormData;

    if (useFormData && !isAlreadyFormData && values) {
      const formData = new FormData();

      const appendToFormData = (data: any, prefix = "") => {
        if (data instanceof File || data instanceof Blob) {
          formData.append(prefix, data);
        } else if (Array.isArray(data)) {
          data.forEach((item, index) => {
            const key = prefix ? `${prefix}[${index}]` : `${index}`;
            appendToFormData(item, key);
          });
        } else if (typeof data === "object" && data !== null) {
          Object.keys(data).forEach((key) => {
            const value = data[key];
            const newPrefix = prefix ? `${prefix}[${key}]` : key;
            appendToFormData(value, newPrefix);
          });
        } else if (data !== null && data !== undefined) {
          formData.append(prefix, String(data));
        }
      };

      appendToFormData(values);
      finalData = formData;
    }

    const instance = useFormData ? AxiosFiles : axiosInstance;
    const config = useFormData
      ? {}
      : { headers: { "Content-Type": "application/json" } };

    let response;

    switch (method) {
      case "POST":
        response = await instance.post(url, finalData, config);
        break;
      case "PUT":
        response = await instance.put(url, finalData, config);
        break;
      case "DELETE":
        response = await instance.delete(url, { data: finalData, ...config });
        break;
      default:
        throw new Error("Método no soportado");
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = "/";
    } else {
      console.error("Error en AxiosRequest:", error);
      throw error;
    }
  }
};

export { axiosInstance, AxiosFiles };
