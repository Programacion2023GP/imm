export interface Event {
    id:number,
    fecha_realizacion:string,
    id_aerea_organizadora:number,
    id_tipo_actividad:number,
    tema_central:string,
    ponente_facilitador:string,
    lugar:string,
    duracion_estimada:string,
    id_user_created:number,

    numero_asistentes:number,
    sexo:"Hombre"|"Mujer"|'No binario',
    edad:number,
    persona_discapacidad:boolean,
    poblacion_indigena:boolean,
    poblacion_migrante:boolean,
    poblacion_afrodescediente:boolean,
    comunidad_lgbtq:boolean,
    otro:boolean,
    especifique:string,
    asistentes:Asistentes[]
    evidencias:string[]
    comentarios:string,
    id_seguimiento_control:number,
    id_responsable_seguimiento:number
    acciones_programadas:string,
    fecha_proxima:string
  }
export interface EventsTable extends Event{

}


type Asistentes = {
  id: number;
  nombre: string;
  sexo: "Hombre" | "Mujer" | "No binario";
  edad: number;
  colonia: string;
  dependencia: string;
};