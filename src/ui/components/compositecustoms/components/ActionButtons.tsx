// CompositeCrud/components/ActionButtons.tsx
import React, { useState, useRef } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { PortalDropdown } from "./PortalDropdown";
import { ActionButtonsProps } from "../types";
import Tooltip from "../../toltip/Toltip";
import CustomButton from "../../button/custombuttom";
import { icons } from "../../../../constant";

export const ActionButtons = <
  TRecord,
  THooks extends Record<string, any> = Record<string, any>,
  TMainHook = any,
>({
  row,
  actionsConfig,
  onEdit,
  onDelete,
  maxVisibleButtons = 2,
  actionsDispatch,
  mainHook,
}: ActionButtonsProps<TRecord, THooks, TMainHook>) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  if (!actionsConfig && !onEdit && !onDelete) return null;

  const buttons: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    color?: string;
    tooltip?: string;
    danger?: boolean;
  }> = [];

  // Botón Editar
  if (actionsConfig?.isEditing !== false && onEdit) {
    buttons.push({
      id: "edit",
      label: "Editar",
      icon: <icons.Lu.LuPencilLine className="w-4 h-4" />,
      onClick: () => onEdit(row),
      color: "orange",
      tooltip: "Editar",
    });
  }

  // Botón Eliminar
  if (actionsConfig?.isDelete !== false && onDelete) {
    buttons.push({
      id: "delete",
      label: "Eliminar",
      icon: <icons.Lu.LuTrash className="w-4 h-4" />,
      onClick: () => onDelete(row),
      color: "ruby",
      tooltip: "Eliminar",
      danger: true,
    });
  }

  // Botones personalizados
  actionsConfig?.moreButtons?.forEach((btn, idx) => {
    if (btn.permission === false) return;
    if (btn.multiple === true) return;

    const getIcon = () => {
      if (btn.icon) {
        if (typeof btn.icon === "string")
          return <i className={`${btn.icon} w-4 h-4`} />;
        return btn.icon;
      }
      if (btn.iconName) return <i className={`${btn.iconName} w-4 h-4`} />;
      return undefined;
    };

    const icon = getIcon();
    let realOnClick: (() => void) | undefined;

    if (btn.actionHook) {
      realOnClick = () =>
        btn.actionHook({
          row,
          hooks: (actionsDispatch || {}) as THooks,
          mainHook: mainHook,
        });
    } else if (btn.handleOnClick) {
      realOnClick = () => btn.handleOnClick(row);
    }

    if (!realOnClick) return;

    buttons.push({
      id: `custom-${idx}`,
      label: btn.label,
      icon: icon,
      onClick: realOnClick,
      color: btn.color,
      tooltip: btn.tooltip || btn.label,
    });
  });

  const visibleButtons = buttons.slice(0, maxVisibleButtons);
  const hiddenButtons = buttons.slice(maxVisibleButtons);

  return (
    <div className="flex items-center gap-2">
      {/* Botones visibles */}
      {visibleButtons.map((btn) => (
        <Tooltip key={btn.id} content={btn.tooltip || btn.label}>
          <CustomButton
            color={(btn.color as any) || "gray"}
            onClick={btn.onClick}
            icon={btn.icon}
            size="sm"
          >
            {!btn.icon && btn.label}
          </CustomButton>
        </Tooltip>
      ))}

      {/* Botones ocultos en menú desplegable */}
      {hiddenButtons.length > 0 && (
        <>
          <Tooltip content="Más acciones">
            <span
              ref={triggerRef as React.RefObject<HTMLSpanElement>}
              style={{ display: "inline-flex" }}
            >
              <CustomButton
                color="gray"
                onClick={() => setMenuOpen((prev) => !prev)}
                icon={<HiDotsVertical className="w-4 h-4" />}
                size="sm"
              />
            </span>
          </Tooltip>

          <PortalDropdown
            anchorRef={triggerRef}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
          >
            {hiddenButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  btn.onClick();
                  setMenuOpen(false);
                }}
                className={`
                  flex items-center gap-2 w-full px-4 py-2 text-sm text-left
                  hover:bg-gray-100 transition-colors hover:cursor-pointer
                  ${btn.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}
                `}
              >
                <div
                  className={`flex items-center justify-center gap-1.5 align-middle hover:translate-x-1 transition-all hover:font-bold hover:text-${btn.color}-500`}
                >
                  {btn.icon && (
                    <span className="w-4 h-4 flex items-center justify-center">
                      {btn.icon}
                    </span>
                  )}
                  <span>{btn.label}</span>
                </div>
              </button>
            ))}
          </PortalDropdown>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
