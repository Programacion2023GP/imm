import { ConfigCrud } from "../../models/genericmodels.model";
import { Legal } from "../../models/legal/legal.model";
import { LegalPatientInfoCard } from "../../ui/pages/legal/components/info.folio";

export const legalBuilderCrud = ConfigCrud<Legal, {}, {}>()
  .fields({
    date: ["fecha_apertura", "fecha_asesoria"],
    select: ["id_asesoria", "id_responsable"],
    textarea: ["hechos"],
    toggle: ["activo"],
  })
  .toggle({
    activo: { label: "Activo" },
  })
  .date({
    fecha_apertura: { label: "Fecha apertura" },
    fecha_asesoria: { label: "Fecha de asesoría" },
  })
  .textarea({
    hechos: { label: "Hechos" },
  })
  .registerComponent("legal", {
    component: LegalPatientInfoCard, // ✅ registrado como "legal"
  })
  .layout(
    "stepper",
    "seccion1",
  )({
    seccion1: [
      { component: "legal" }, // ✅ usa el nombre registrado
      { component: "legal" }, // ✅ usa el nombre registrado

      "fecha_apertura",
      "fecha_asesoria",
      "hechos",
      "activo",
    ],
  })
  // UI personalizada

  .build();
