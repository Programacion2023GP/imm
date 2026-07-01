// hooks/casos/useCasosTree.ts

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Caso } from "./types";

// Inserta una nueva carpeta en el nodo correcto del árbol (recursivo, inmutable)


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
 

  return { casos, addCarpetaRaiz, };
}
