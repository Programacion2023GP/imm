// hooks/useCatalogueData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { Catalogues } from "../../../models/catalogues/catalogues.models";

type ExtraState = {
  colonias: string[];
};
type Methods = {
  getColonias:()=>void,
};
export type DataReturn = GenericDataReturn<Catalogues,Methods,null,ExtraState>;

// ✅ Hook genérico que recibe el prefijo
const UseCatalogueData = (prefix: string, autofech: boolean=true): DataReturn => {
  const initialState = useMemo<Catalogues>(
    () => ({
      id: 0,
      nombre: "",
    }),
    [],
  );

  return useGenericData<Catalogues, Methods, null, ExtraState>({
    initialState: initialState,
    prefix: `catalogo/${prefix}`, // 👈 Recibido por parámetro
    autoFetch: autofech,
    extraState: {
      colonias: [],
    },
    hooks: {
      onError: (msg) => console.error(`[UseCatalogueData:${prefix}]`, msg),
    },
    extension: (set, get, prefix) => ({
      getColonias:async() =>{
     try {
       console.log("🚀 ~ UseCatalogueData ~ res INICIO:");

      set({
        loading: true,
      });
        const response = await fetch(
          `https://cp.atc.gomezpalacio.gob.mx/api/gpd/comunidades`,
        );
        const res = await response.json();

        const resultados = res.data.result;
    const colonias = resultados.map((item: any) => ({
      id: item.id,
      nombre: item.Colonia,
      codigoPostal: item.CodigoPostal,
      tipo: item.Tipo,
      zona: item.Zona,
      municipio: item.Municipio,
      estado: item.Estado,
    }));
       console.log("🚀 ~ UseCatalogueData ~ res:", resultados);
       set({
         loading: false,
         colonias: colonias,
       });
     } catch (error) {
         set({
           loading: false,
         });
     }
        
      },
    }),
  });
};

export default UseCatalogueData;
