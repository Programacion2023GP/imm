// crud-domain.ts
import { ConfigCrud, NestedKeys, BoxGroup } from "./genericmodels.model";

// --------------------------------------------------------------
//  Tipos para fusionar interfaces parciales
// --------------------------------------------------------------
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

// Extrae un objeto con los campos declarados en fieldsList de un dominio
type ExtractFieldsFromDomain<D> = D extends {
  fieldsList: {
    text?: (infer T)[];
    textarea?: (infer TA)[];
    number?: (infer N)[];
    select?: (infer S)[];
    toggle?: (infer TG)[];
    radio?: (infer R)[];
    date?: (infer Dt)[];
    array?: (infer A)[];
  };
}
  ? (T extends string ? Record<T, any> : {}) &
      (TA extends string ? Record<TA, any> : {}) &
      (N extends string ? Record<N, any> : {}) &
      (S extends string ? Record<S, any> : {}) &
      (TG extends string ? Record<TG, any> : {}) &
      (R extends string ? Record<R, any> : {}) &
      (Dt extends string ? Record<Dt, any> : {}) &
      (A extends string ? Record<A, any[]> : {})
  : {};

// Dado un array de dominios, produce la intersección de todos sus campos
type MergeDomains<D extends any[]> = UnionToIntersection<
  ExtractFieldsFromDomain<D[number]>
>;

// --------------------------------------------------------------
//  Definición de dominio (con interfaz parcial)
// --------------------------------------------------------------
export interface DomainDefinition<
  TPartialForm extends object,
  TTable extends object,
  THooks,
> {
  step: string;
  groups?: Record<string, (keyof TPartialForm)[]>;
  fieldsList: {
    text?: (NestedKeys<TPartialForm> & string)[];
    textarea?: (NestedKeys<TPartialForm> & string)[];
    number?: (NestedKeys<TPartialForm> & string)[];
    select?: (NestedKeys<TPartialForm> & string)[];
    toggle?: (NestedKeys<TPartialForm> & string)[];
    radio?: (NestedKeys<TPartialForm> & string)[];
    date?: (NestedKeys<TPartialForm> & string)[];
    array?: (NestedKeys<TPartialForm> & string)[];
  };
  configure: (builder: any) => void;
}

export function defineDomain<
  TPartialForm extends object,
  TTable extends object = any,
  THooks = any,
>(
  domain: DomainDefinition<TPartialForm, TTable, THooks>,
): DomainDefinition<TPartialForm, TTable, THooks> {
  return domain;
}

// --------------------------------------------------------------
//  Tipos para la configuración del layout
// --------------------------------------------------------------
export type LayoutMode = "stepper" | "box";

export interface BuildCrudOptions {
  layoutMode?: LayoutMode;
}

// --------------------------------------------------------------
//  Tipo para el resultado del builder (versión corregida)
// --------------------------------------------------------------
type BuilderWithHelpers<
  TForm extends object,
  TTable extends object,
  THooks,
> = ReturnType<
  ReturnType<typeof ConfigCrud<TForm, TTable, THooks>>["fields"]
> & {
  __inferredFormType: () => TForm;
  getSteps: () => string[];
  getLayoutMode: () => LayoutMode;
};

// --------------------------------------------------------------
//  Constructor del CRUD que infiere TForm automáticamente
// --------------------------------------------------------------
export function buildCrudFromDomains<TTable extends object, THooks>(
  domains: DomainDefinition<any, TTable, THooks>[],
  options?: BuildCrudOptions,
) {
  const { layoutMode = "stepper" } = options || {};

  // 1. Unir todas las fieldsList
  const mergedFieldsList: {
    text?: string[];
    textarea?: string[];
    number?: string[];
    select?: string[];
    toggle?: string[];
    radio?: string[];
    date?: string[];
    array?: string[];
  } = {};

  for (const d of domains) {
    const f = d.fieldsList;
    if (f.text)
      mergedFieldsList.text = [...(mergedFieldsList.text || []), ...f.text];
    if (f.textarea)
      mergedFieldsList.textarea = [
        ...(mergedFieldsList.textarea || []),
        ...f.textarea,
      ];
    if (f.number)
      mergedFieldsList.number = [
        ...(mergedFieldsList.number || []),
        ...f.number,
      ];
    if (f.select)
      mergedFieldsList.select = [
        ...(mergedFieldsList.select || []),
        ...f.select,
      ];
    if (f.toggle)
      mergedFieldsList.toggle = [
        ...(mergedFieldsList.toggle || []),
        ...f.toggle,
      ];
    if (f.radio)
      mergedFieldsList.radio = [...(mergedFieldsList.radio || []), ...f.radio];
    if (f.date)
      mergedFieldsList.date = [...(mergedFieldsList.date || []), ...f.date];
    if (f.array)
      mergedFieldsList.array = [...(mergedFieldsList.array || []), ...f.array];
  }

  // 2. Inferir el tipo del formulario completo
  type TForm = MergeDomains<typeof domains>;

  // 3. Crear el ConfigCrud con el tipo inferido
  const baseBuilder = ConfigCrud<TForm, TTable, THooks>();
  let currentBuilder = baseBuilder.fields(mergedFieldsList);

  // 4. Configurar cada dominio con el builder tipado
  for (const d of domains) {
    (d.configure as (b: typeof currentBuilder) => void)(currentBuilder);
  }

  // 5. Construir layout según el modo elegido
  const steps = domains.map((d) => d.step);

  // Construir fieldsPerSection correctamente tipado
  type FieldsPerSectionType = Record<string, string[] | BoxGroup<TForm>[]>;
  const fieldsPerSection = {} as FieldsPerSectionType;

  for (const d of domains) {
    if (d.groups && Object.keys(d.groups).length > 0) {
      // Convertir los grupos a BoxGroup<TForm>[]
      const boxGroups: BoxGroup<TForm>[] = Object.entries(d.groups).map(
        ([title, fields]) => ({
          title,
          fields: fields as (keyof TForm)[],
        }),
      );
      fieldsPerSection[d.step] = boxGroups;
    } else {
      // Si no tiene grupos, recoger todos los campos del dominio
      const allFieldsInDomain: (keyof TForm)[] = [
        ...((d.fieldsList.text || []) as (keyof TForm)[]),
        ...((d.fieldsList.textarea || []) as (keyof TForm)[]),
        ...((d.fieldsList.number || []) as (keyof TForm)[]),
        ...((d.fieldsList.select || []) as (keyof TForm)[]),
        ...((d.fieldsList.toggle || []) as (keyof TForm)[]),
        ...((d.fieldsList.radio || []) as (keyof TForm)[]),
        ...((d.fieldsList.date || []) as (keyof TForm)[]),
        ...((d.fieldsList.array || []) as (keyof TForm)[]),
      ];
      fieldsPerSection[d.step] = allFieldsInDomain;
    }
  }

  // Aplicar el layout con el modo seleccionado
  if (layoutMode === "stepper") {
    currentBuilder = currentBuilder.layout(
      "stepper",
      ...steps,
    )(fieldsPerSection);
  } else {
    // Modo "box": se muestra todo en una sola sección
    // Aplanar todos los grupos en una sola lista de BoxGroup
    const allBoxGroups: BoxGroup<TForm>[] = [];

    for (const section of Object.values(fieldsPerSection)) {
      if (Array.isArray(section)) {
        if (
          section.length > 0 &&
          typeof section[0] === "object" &&
          "title" in section[0]
        ) {
          // Ya son BoxGroup
          allBoxGroups.push(...(section as BoxGroup<TForm>[]));
        } else if (section.length > 0 && typeof section[0] === "string") {
          // Es un array de strings, convertirlo a BoxGroup
          allBoxGroups.push({
            title: "Información general",
            fields: section as (keyof TForm)[],
          });
        }
      }
    }

    // Si no hay grupos, crear uno por defecto
    const finalBoxGroups =
      allBoxGroups.length > 0
        ? allBoxGroups
        : [{ title: "Datos del formulario", fields: [] as (keyof TForm)[] }];

    currentBuilder = currentBuilder.layout(
      "box",
      "Todos los datos",
    )({
      "Todos los datos": finalBoxGroups,
    });
  }

  // 6. Retornar el builder con métodos helpers
  // Añadir los métodos helper al builder existente
  const result = currentBuilder as any;
  result.__inferredFormType = () => ({}) as TForm;
  result.getSteps = () => steps;
  result.getLayoutMode = () => layoutMode;

  return result as BuilderWithHelpers<TForm, TTable, THooks>;
}

// --------------------------------------------------------------
//  Helper para crear arrays de dominios fácilmente
// --------------------------------------------------------------
export function createDomainsArray<TTable extends object, THooks>(
  ...domains: DomainDefinition<any, TTable, THooks>[]
): DomainDefinition<any, TTable, THooks>[] {
  return domains;
}

// --------------------------------------------------------------
//  Helper para construir un CRUD completo de una sola vez
// --------------------------------------------------------------
export function buildCompleteCrud<TTable extends object, THooks>(
  domains: DomainDefinition<any, TTable, THooks>[],
  options?: {
    layoutMode?: LayoutMode;
    tableHeader?: {
      title?: string;
      subtitle?: string;
      icon?: string | React.ReactNode;
    };
    tableActions?: {
      isEditing?: boolean;
      isDelete?: boolean;
      moreButtons?: any[];
    };
    mobileConfig?: any;
  },
) {
  const builder = buildCrudFromDomains(domains, options);

  // Aplicar configuraciones adicionales si se proporcionan
  let result = builder as any;

  if (options?.tableHeader) {
    result = result.tableHeader(options.tableHeader);
  }

  if (options?.tableActions) {
    result = result.tableActions(options.tableActions);
  }

  if (options?.mobileConfig) {
    result = result.mobile(options.mobileConfig);
  }

  return result.build();
}
