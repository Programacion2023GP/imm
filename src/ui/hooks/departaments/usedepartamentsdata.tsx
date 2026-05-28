// // hooks/useDepartamentsData.ts
// import { useMemo } from "react";
// // import { useGenericData, type GenericDataReturn } from "react-zustore";
// import type { DepartmentForm } from "./departaments.model";
// import { GenericDataReturn } from "../../../library/reactztore/hook/usegenericdata";

// // ✅ Exportado — necesario para SuperCrud<Departaments> en la page

// export type DepartamentsDataReturn = GenericDataReturn<DepartmentForm>;

// const useDepartamentsData = (): DepartamentsDataReturn => {
//    const initialState = useMemo<DepartmentForm>(
//       () => ({
//          id: 0,
//          uuid: "",
//          organization_id: 0,
//          code: "",
//          name: "",
//          seal_image: "",
//          start_date: null,
//          end_date: null,
//          active: true,
//       }),
//       [],
//    );

//    return useGenericData<DepartmentForm>({
//       defaultValues: initialState,
//       prefix: "departments",
//       autoFetch: true,
//       // persistKey: "departments-persist",
//       hooks: {
//          onError: (msg) => console.error("[Departaments]", msg),
//       },
//    });
// };

// export default useDepartamentsData;
