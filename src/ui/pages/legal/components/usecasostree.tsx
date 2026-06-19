// hooks/casos/useCasosTree.ts

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Carpeta, Caso } from "./types";

// Inserta una nueva carpeta en el nodo correcto del árbol (recursivo, inmutable)
function insertCarpeta(
  carpetas: Carpeta[],
  parentId: string,
  nombre: string,
): Carpeta[] {
  return carpetas.map((c) => {
    if (c.id === parentId) {
      return { ...c, subs: [...c.subs, { id: uuidv4(), nombre, subs: [] }] };
    }
    return { ...c, subs: insertCarpeta(c.subs, parentId, nombre) };
  });
}

export function useCasosTree(initial: Caso[]) {
  const [casos, setCasos] = useState<Caso[]>(initial);

  // Agrega carpeta raíz a un caso
  const addCarpetaRaiz = useCallback((casoId: string, nombre: string) => {
    setCasos((prev) =>
      prev.map((c) =>
        c.id === casoId
          ? {
              ...c,
              carpetas: [...c.carpetas, { id: uuidv4(), nombre, subs: [] }],
            }
          : c,
      ),
    );
  }, []);

  // Agrega subcarpeta en cualquier nivel del árbol
  const addSubCarpeta = useCallback(
    (casoId: string, parentFolderId: string, nombre: string) => {
      setCasos((prev) =>
        prev.map((c) =>
          c.id === casoId
            ? {
                ...c,
                carpetas: insertCarpeta(c.carpetas, parentFolderId, nombre),
              }
            : c,
        ),
      );
    },
    [],
  );

  return { casos, addCarpetaRaiz, addSubCarpeta };
}
