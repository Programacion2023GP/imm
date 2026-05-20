import { useState, useEffect } from "react";

// Ajusta el patrón según tu estructura de carpetas
// Ejemplo: busca todos los archivos .builder.ts dentro de src/crudbuilder
const modules = import.meta.glob("/src/crudbuilder/**/*.builder.ts", {
  eager: false,
});

export async function loadBuilder<T = any>(builderPath: string): Promise<T> {
  // Encuentra la clave que coincida con el nombre del builder (ej: 'roles')
  const key = Object.keys(modules).find((k) => k.includes(builderPath));
  if (!key) throw new Error(`Builder not found: ${builderPath}`);

  // Importa el módulo y lo tipamos como Record<string, any>
  const mod = (await modules[key]()) as Record<string, any>;

  // Busca la primera exportación que tenga 'textFields' y 'selectFields' (BuildResult)
  for (const exp of Object.values(mod)) {
    if (
      exp &&
      typeof exp === "object" &&
      "textFields" in exp &&
      "selectFields" in exp
    ) {
      return exp as T;
    }
  }

  // Si no encontró, intenta con export default
  if (mod.default) return mod.default as T;

  throw new Error(`No valid BuildResult found in ${builderPath}`);
}

export function useBuilder<T>(builderName: string): T | null {
  const [config, setConfig] = useState<T | null>(null);

  useEffect(() => {
    let mounted = true;
    const fullPath = `/src/crudbuilder/${builderName}.builder.ts`;

    const load = async () => {
      try {
        const cfg = await loadBuilder<T>(fullPath);
        if (mounted) setConfig(cfg);
      } catch (err) {
        console.error(`Error loading builder ${builderName}:`, err);
        if (mounted) setConfig(null);
      }
    };

    load();

    // Hot Module Replacement
    if (import.meta.hot) {
      const handleUpdate = async () => {
        const newCfg = await loadBuilder<T>(fullPath);
        if (mounted) setConfig(newCfg);
      };
      import.meta.hot.accept(fullPath, handleUpdate);
    }

    return () => {
      mounted = false;
    };
  }, [builderName]);

  return config;
}
