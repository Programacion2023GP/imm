// CompositeCrud/hooks/useDeleteConfirmation.ts
import { useCallback } from "react";
import Swal from "sweetalert2";
import { theme } from "../../../../config/themes";

export const useDeleteConfirmation = () => {
  const showDeleteConfirmation = useCallback(async (): Promise<boolean> => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary.DEFAULT,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    return result.isConfirmed;
  }, []);

  return { showDeleteConfirmation };
};
