// hooks/useDepartamentsData.ts
import { useMemo } from "react";
import {
  useGenericData,
  type GenericDataReturn,
} from "../../../library/reactztore/hook/usegenericdata";
import type { InterviewForm } from "../../../models/interview/interview.model";

export interface ExtraState {

}

export interface Methods {
 
}

export type RolesDataReturn = GenericDataReturn<
  InterviewForm,
  Methods,
  {},
  ExtraState
>;

const UseInterview = (): RolesDataReturn => {
  const initialState = useMemo<InterviewForm>(
    () => ({
  id:0,
  curp:"",
  hechos:"",
  id_espacio_digital:[],
  id_espacio_particular:[],
  id_espacio_publico:[]
    }),
    [],
  );

  return useGenericData<InterviewForm, Methods, {}, ExtraState>({
    initialState: initialState,
    prefix: "interview",
    autoFetch: true,


    hooks: {
      onError: (msg) => console.error("[Roles]", msg),
    },
    extension: (set, get, prefix) => ({
     
      
    }),
  });
};

export default UseInterview;
