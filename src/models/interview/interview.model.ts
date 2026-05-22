// models/interview.model.ts

export interface InterviewForm {
  // Identificación
  id: number;
  curp: string;
  hechos: string;
  id_espacio_digital: number[];
  id_espacio_particular: number[];
  id_espacio_publico: number[];
}
export interface InterviewTable extends InterviewForm {}