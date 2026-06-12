// CompositeCrud/hooks/useSectionedLayout.ts
import { useMemo } from "react";
import type { FieldItem } from "../types";
import type {
  BuildResult,
  LayoutItem,
} from "../../../../models/genericmodels.model";

type RenderableItem =
  | { kind: "field"; field: FieldItem }
  | {
      kind: "component";
      componentName: string;
      responsive?: any;
      props?: Record<string, any>;
    }
  | { kind: "box"; title: string; fields: FieldItem[] };

// Type guard para identificar objetos BoxGroup
function isBoxGroup(item: any): item is { title: string; fields: string[] } {
  return (
    item &&
    typeof item === "object" &&
    "title" in item &&
    typeof item.title === "string" &&
    "fields" in item &&
    Array.isArray(item.fields) &&
    item.fields.every((f: any) => typeof f === "string")
  );
}

export const useSectionedLayout = <TForm extends object>(
  crudConfig: BuildResult<TForm> | undefined,
  computedFields: FieldItem[],
) => {
  return useMemo(() => {
    if (crudConfig?.uiLayout) {
      const { fieldsPerSection, sections, mode } = crudConfig.uiLayout;
      const sectionsList = sections.map((name: string) => {
        const definition = fieldsPerSection?.[name] as
          | LayoutItem<TForm, any>[]
          | undefined;
        if (!definition) return { title: name, items: [] as RenderableItem[] };

        const items: RenderableItem[] = [];
        for (const item of definition) {
          if (typeof item === "string") {
            const field = computedFields.find((f) => f.name === item);
            if (field) items.push({ kind: "field", field });
          } else if (item && typeof item === "object" && "component" in item) {
            items.push({
              kind: "component",
              componentName: item.component,
              responsive: item.responsive,
              props: item.props,
            });
          } else if (isBoxGroup(item)) {
            // Es un BoxGroup con title y fields (array de strings)
            const boxFields = item.fields
              .map((fieldName) =>
                computedFields.find((f) => f.name === fieldName),
              )
              .filter((f): f is FieldItem => f !== undefined);
            items.push({
              kind: "box",
              title: item.title,
              fields: boxFields,
            });
          }
        }
        return { title: name, items };
      });
      return { hasSections: true, sectionType: mode, sections: sectionsList };
    }
    return { hasSections: false, sectionType: null, sections: [] };
  }, [crudConfig, computedFields]);
};
