export interface PyschologicalEvaluation {
  id: number;
  fecha_alta: string;
  id_responsable: number;
  id_entrevista:number,
  id_problematica_abordada: number[];
  especifique_problematica_abordada:string,
  id_violencia_asociada: number[];
  activo:boolean,
}