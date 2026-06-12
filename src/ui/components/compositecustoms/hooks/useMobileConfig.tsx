// CompositeCrud/hooks/useMobileConfig.ts
import { useCallback } from "react";
import type { BuildResult, MobileConfig, MobileListTileConfig, MobileQuickFiltersConfig } from "../../../../models/genericmodels.model";
import type { AdvancedCrudConfig } from "../../../../types/crud-advanced.types";
import type { GenericDataReturn } from "../../../../library/reactztore/hook/usegenericdata";
import { prepareForForm } from "../utils/dateHelpers";
import { icons } from "../../../../constant";
export const useMobileConfig = <TForm extends object, TTable extends object = TForm>({
  crudConfig,
  hook,
  mobileListTile,
  mobileQuickFilters,
  enableMobileViews,
  advancedConfig,
  showDeleteConfirmation,
}: {
  crudConfig: BuildResult<TForm, TTable> | undefined;
  hook: GenericDataReturn<TForm>;
  mobileListTile?: MobileListTileConfig<TTable>;
  mobileQuickFilters?: MobileQuickFiltersConfig;
  enableMobileViews?: boolean;
  advancedConfig?: AdvancedCrudConfig<TForm, TTable>;
  showDeleteConfirmation: () => Promise<boolean>;
}) => {
  const buildMobileConfig = useCallback(() => {
    // 1. Obtener la configuración móvil del CRUD
    const mobileCfg = crudConfig?.mobileConfig as MobileConfig<TTable> | undefined;

    // Si está deshabilitado explícitamente, no generamos nada
    if (mobileCfg?.enabled === false) return undefined;

    // 2. Combinar configuraciones (props del componente > crudConfig)
    const finalListTile = mobileListTile ?? mobileCfg?.listTile;
    const finalQuickFilters = mobileQuickFilters ?? mobileCfg?.quickFilters;

    // 3. Generar swipe actions automáticas si no vienen definidas
    let finalSwipeActions: any = mobileCfg?.swipeActions;
    let generatedSwipe = false;

    if (!finalSwipeActions) {
      const tableActions = crudConfig?.tableActions;
      const isEditingEnabled = tableActions?.isEditing !== false;
      const isDeleteEnabled = tableActions?.isDelete !== false;

      const swipeLeft: any[] = [];
      const swipeRight: any[] = [];

      // Botón Editar (swipe izquierdo)
      if (isEditingEnabled) {
        swipeLeft.push({
          icon: <icons.Lu.LuPencilLine size={20} />,
          color: "bg-orange-500",
          label: "Editar",
          action: (row: any) => {
            const formattedRow = prepareForForm(row);
            hook.setOpen(true);
            hook.handleChangeItem(formattedRow);
          },
        });
      }

      // Botón Eliminar (swipe derecho)
      if (isDeleteEnabled) {
        swipeRight.push({
          icon: <icons.Lu.LuTrash size={20} />,
          color: "bg-red-500",
          label: "Eliminar",
          action: async (row: any) => {
            const confirmed = await showDeleteConfirmation();
            if (confirmed) await hook.removeItemData(row);
          },
        });
      }

      // Botones personalizados adicionales (más acciones)
      const moreButtons = tableActions?.moreButtons || [];
      moreButtons.forEach((btn) => {
        if (btn.permission === false) return;
        const action = btn.handleOnClick ? (row: any) => btn.handleOnClick(row) : undefined;
        if (!action) return;
        const swipeItem = {
          icon: typeof btn.icon === "string" ? <i className={btn.icon} /> : btn.icon,
          color: btn.color || "bg-gray-500",
          label: btn.label,
          action,
        };
        swipeRight.push(swipeItem);
      });

      if (swipeLeft.length > 0 || swipeRight.length > 0) {
        finalSwipeActions = { left: swipeLeft, right: swipeRight };
        generatedSwipe = true;
      }
    }

    // Si no hay nada que mostrar, retornamos undefined
    if (!finalSwipeActions && !finalListTile && !finalQuickFilters?.enabled) {
      return undefined;
    }

    // 4. ListTile por defecto (si no se proveyó uno)
    const defaultListTile: MobileListTileConfig<TTable> = {
      title: (row: any) => {
        const firstKey = Object.keys(row)[0];
        return row[firstKey] || "Registro";
      },
      leading: (row: any) => (
        <div className="w-10 h-10 rounded-full bg-[#9B2242] text-white flex items-center justify-center font-bold">
          {String(Object.values(row)[0] || "?").charAt(0).toUpperCase()}
        </div>
      ),
    };

    // 5. Construir el objeto de configuración móvil final
    const result: any = {
      activeViews: mobileCfg?.activeViews !== undefined ? mobileCfg.activeViews : enableMobileViews,
      listTile: finalListTile || defaultListTile,
    };

    if (finalSwipeActions) {
      result.swipeActions = finalSwipeActions;
    }

    if (finalQuickFilters?.enabled) {
      result.quickFilters = {
        enabled: true,
        filters: finalQuickFilters.filters || [],
      };
    } else if (advancedConfig?.filters?.length && !generatedSwipe) {
      // Si no hay quickFilters definidos pero hay filtros en advancedConfig, los usamos
      result.quickFilters = {
        enabled: true,
        filters: advancedConfig.filters.map((f: any) => ({
          dataField: f.field,
          label: f.label,
          type: f.type || "text",
        })),
      };
    }

    if (mobileCfg?.bottomSheet) {
      result.bottomSheet = mobileCfg.bottomSheet;
    }

    return result;
  }, [
    crudConfig,
    hook,
    mobileListTile,
    mobileQuickFilters,
    enableMobileViews,
    advancedConfig,
    showDeleteConfirmation,
  ]);

  return { buildMobileConfig };
};