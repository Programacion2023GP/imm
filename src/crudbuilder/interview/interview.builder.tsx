import { FaList } from "react-icons/fa";
import { ConfigCrud } from "../../models/genericmodels.model";
import type {
  InterviewForm,
  InterviewTable,
} from "../../models/interview/interview.model";
import UseDigitalSpace from "../../ui/hooks/digitalspace/usedigitalspacedata";
import UseParticleSpace from "../../ui/hooks/particlespace/useparticlespacedata";
import UsePublicSpace from "../../ui/hooks/publicspace/usepublicspacedata";

export const interviewBuilderCrud = ConfigCrud<InterviewForm, InterviewTable>()
  .fields({
    text: ["curp", "hechos"],
    select: [
      "id_espacio_digital",
      "id_espacio_particular",
      "id_espacio_publico",
    ],
  })
  .text({
    curp: {
      label: "CURP",
      caseTransform: "uppercase",
      placeholder: "CURP (18 caracteres)",
      validation: ({ yup }) =>
        yup.string().length(18, "CURP debe tener 18 caracteres"),
    },
    hechos: {
      label: "Narración de los hechos",
      // caseTransform:"lowercase",
    },
  })
  .select({
    id_espacio_digital: {
      label: "Espacio Digital",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseDigitalSpace().items,
      multiple: true,
    },
    id_espacio_particular: {
      label: "Espacio Particular",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UseParticleSpace().items,
      multiple: true,
    },
    id_espacio_publico: {
      label: "Espacio Publico",
      keyId: "id",
      keyLabel: "nombre",
      selectOptionsHook: () => UsePublicSpace().items,
      multiple: true,
    },
  })
  .layout({
    mode: "stepper", // 👈 Modo stepper (pasos)
    sections: ["Apertura del caso", "Narración de los hechos"],
    fieldsPerSection: {
      // 🔹 Paso 1: Dos boxes
      "Apertura del caso": ["curp"],

      // 🔹 Paso 2: Forma simple (sin boxes) – solo campos
      "Narración de los hechos": [
        { title: "Hechos", fields: ["hechos"] },
        {
          title: "Lugar de hechos",
          fields: [
            "id_espacio_digital",
            "id_espacio_particular",
            "id_espacio_publico",
          ],
        },
      ],

      // 🔹 Paso 3: Un solo box
    },
  })
  .build();
