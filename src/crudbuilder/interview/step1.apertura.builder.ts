import { defineDomain } from "../../models/crud-domain";
import { AperturaForm, HooksInterview, InterviewTable } from "../../models/interview/interview.model";

export const aperturaDomain = defineDomain<
  AperturaForm,
  InterviewTable,
  HooksInterview
>({
  step: "Apertura del caso",
  groups: { Curp: ["curp"] },
  fieldsList: { text: ["curp"] },
  configure: (builder) => {
    builder.text({
      curp: {
        label: "CURP",
        uppercase: true,
        validation: ({ yup, hooks }) =>
          yup
            .string()
            .length(18, "La CURP debe tener exactamente 18 caracteres")
            .matches(
              /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/,
              "Formato de CURP inválido",
            )
            .test(
              "curp-unica",
              "Esta CURP ya está registrada",
              async (value, ctx) => {
                if (!value) return true;
                const entrevistas = hooks.UseInterview.dataAll;
                const currentId = ctx.parent?.id || 0;
                const existe = entrevistas.some(
                  (item: any) => item.curp === value && currentId === 0,
                );
                return !existe;
              },
            )
            .required("La CURP es requerida"),
      },
    });
  },
});