// PsychologicalForm.tsx
import { FormikProps } from "formik";
import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { User, MapPin, Phone, Home } from "lucide-react";
import CustomBox from "../../components/box/custombox";
import {
  ColComponent,
  RowComponent,
} from "../../components/responsive/Responsive";
import FormikForm from "../../formik/Formik";
import {
  FormikAutocomplete,
  FormikDatePicker,
  FormikInput,
  FormikMultiSelect,
  FormikSwitch,
} from "../../formik/FormikInputs/FormikInput";
import { PyschologicalEvaluation } from "../../../models/psychologicalevaluation.tsx/psychological.models";
import { Loby } from "../../../models/loby/loby.model";
import useAuthData from "../../hooks/auth/useauthdata";
import useUsersData from "../../hooks/users/useUsersData";
import UseAssociatedviolencesData from "../../hooks/associatedviolences/useassociatedviolencesdata";
import UseIssuesAddressedData from "../../hooks/issuesaddressed/useissuesaddresseddata";
import UsePsychologicalEvaluationModuleData from "../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import UseInterview from "../../hooks/interview/interviewdata";
import CustomModal from "../../components/modal/modal";
import UsePsychologicalEvaluationModuleDiaryData from "../../hooks/psychologicalevaluationmodulediary/usepsychologicalevaluationmodulediarydata";
import Spinner from "../../components/loading/loading";

export const PsychologicalForm = () => {
  const validationSchema = Yup.object().shape({
    fecha_alta: Yup.date()
      .required("La fecha de alta es obligatoria")
      .typeError("Debe seleccionar una fecha válida"),

    id_responsable: Yup.number()
      .required("Debe seleccionar un psicólogo responsable")
      .positive("Seleccione un psicólogo válido")
      .typeError("Debe seleccionar un psicólogo"),

    id_entrevista: Yup.number() // ✅ Campo faltante
      .required("ID de entrevista es obligatorio")
      .positive("ID de entrevista inválido"),

    // id_problematica_abordada: Yup.array()
    //   .of(Yup.number().positive("ID de problemática inválido"))
    //   .min(1, "Debe seleccionar al menos una problemática abordada")
    //   .required("La problemática abordada es obligatoria"),

    // id_violencia_asociada: Yup.array()
    //   .of(Yup.number().positive("ID de violencia inválido"))
    //   .min(1, "Debe seleccionar al menos un tipo de violencia asociada")
    //   .required("El tipo de violencia asociada es obligatorio"),

    especifique_problematica_abordada: Yup.string().when(
      "id_problematica_abordada",
      {
        is: (val: number[]) => val?.includes(11), // 11 es el ID de "Otro" o "Especifique"
        then: (schema) => schema.required("Debe especificar la problemática"),
        otherwise: (schema) => schema.nullable(),
      },
    ),

    activo: Yup.boolean().default(true),
  });
  const { persist } = useAuthData();
     const { getLoby } = UseInterview();

  const {
    open: isModalOpenPsychological,
    setOpen: setModalOpenPsychological,
    psychologicalEvaluation,
    initialValues: psychologicalInitialValues,
    postItem: submitPsychological,
    loading: loadingPsychological,
  } = UsePsychologicalEvaluationModuleData();
    console.log("🚀 ~ PsychologicalForm ~ psychologicalInitialValues:", psychologicalInitialValues)
   const { items: violence, loading: loadingViolence } =
     UseAssociatedviolencesData();

  const { items: issuesAddressed, loading: loadingIssuesAddressed } =
    UseIssuesAddressedData();
   const { items: users, loading: loadingUsers } = useUsersData();
  const {

    loadAgenda,
   
  } = UsePsychologicalEvaluationModuleDiaryData();
  const formikRef = useRef<FormikProps<PyschologicalEvaluation>>(null);
  useEffect(() => {
    if (persist.auth.id_rol == 4) {
      formikRef?.current?.setFieldValue(
        "id_responsable",
        Number(persist.auth.id),
      );
    }
  }, [formikRef?.current, isModalOpenPsychological]);
    const getAddressSummary = (values: Loby) => {
      const addressParts = [
        values.calle && values.calle,
        values.num_ext && `#${values.num_ext}`,
        values.num_int && `Int. ${values.num_int}`,
        values.colonia && values.colonia,
        values.codigo_postal && `CP ${values.codigo_postal}`,
        values.municipio && values.municipio,
        values.estado && values.estado,
      ].filter(Boolean);

      return {
        fullAddress: addressParts.join(", "),
        phone: values.telefono,
        zone: values.zona,
      };
    };
  const addressInfo = psychologicalEvaluation
    ? getAddressSummary(psychologicalEvaluation)
    : null;
     const psicologos = users.filter((it) => it.id_rol == 4);

   const PatientInfoCard = () => (
     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-100">
       <div className="flex items-center gap-2 mb-2">
         <User className="w-4 h-4 text-blue-600" />
         <span className="text-sm font-semibold text-gray-800">
           Información general
         </span>
       </div>
       <div className="grid grid-cols-2 gap-3 text-sm">
         <div>
           <span className="text-xs text-gray-500">Edad</span>
           <p className="text-xs font-mono text-gray-800 truncate">
             {psychologicalEvaluation?.edad || "No registrado"}
           </p>
         </div>
         <div>
           <span className="text-xs text-gray-500">CURP</span>
           <p className="text-xs font-mono text-gray-800 truncate">
             {psychologicalEvaluation?.curp || "No registrado"}
           </p>
         </div>
         <div>
           <span className="text-xs text-gray-500">Nombre</span>
           <p className="text-xs font-mono text-gray-800 truncate">
             {psychologicalEvaluation?.nombre || "No registrado"}
           </p>
         </div>
         <div>
           <span className="text-xs text-gray-500">Folio</span>
           <p className="text-xs font-mono font-semibold text-blue-600">
             {psychologicalEvaluation?.id || psychologicalEvaluation?.['folio'] || 'N/A'}
           </p>
         </div>
       </div>
     </div>
   );

   // Tarjeta de contacto y dirección - Versión compacta
   const ContactInfoCard = () => (
     <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
       <div className="flex items-center gap-2 mb-2">
         <MapPin className="w-4 h-4 text-gray-600" />
         <span className="text-sm font-semibold text-gray-800">
           Contacto y Dirección
         </span>
       </div>

       <div className="space-y-2">
         {addressInfo?.phone && (
           <div className="flex items-center gap-2 text-sm">
             <Phone className="w-3.5 h-3.5 text-green-500" />
             <span className="text-xs text-gray-600 w-20">Teléfono:</span>
             <span className="text-xs font-medium">{addressInfo.phone}</span>
           </div>
         )}

         {addressInfo?.fullAddress && (
           <div className="flex items-start gap-2 text-sm">
             <Home className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
             <span className="text-xs text-gray-600 w-20">Dirección:</span>
             <span className="text-xs text-gray-700 flex-1">
               {addressInfo.fullAddress}
             </span>
           </div>
         )}

         {addressInfo?.zone && (
           <div className="flex items-center gap-2 text-sm">
             <div className="w-3.5 h-3.5" />
             <span className="text-xs text-gray-600 w-20">Zona:</span>
             <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
               {addressInfo.zone}
             </span>
           </div>
         )}
       </div>
     </div>
   );
  return (
    <CustomModal
      isOpen={isModalOpenPsychological}
      onClose={() => setModalOpenPsychological(false)}
      title="Apertura de Expediente Psicológico"
    >

      <div className="space-y-3">
        <FormikForm
          key={psychologicalInitialValues.id}
          ref={formikRef}
          initialValues={psychologicalInitialValues}
          buttonMessage="Guardar"
          buttonLoading={loadingPsychological}
          onSubmit={async (values) => {
            await submitPsychological(values);
            await loadAgenda()
            await getLoby("psicologo");
          }}
          validationSchema={validationSchema}
          children={(values, r, c, a, errors) => (
            <>
              {loadingPsychological && (<Spinner/>)}
              <RowComponent>
                <ColComponent
                  responsive={{ "2xl": 6, lg: 6, md: 12, sm: 12, xl: 12 }}
                >
                  <PatientInfoCard />
                </ColComponent>
                <ColComponent
                  responsive={{ "2xl": 6, lg: 6, md: 12, sm: 12, xl: 12 }}
                >
                  <ContactInfoCard />
                </ColComponent>
              </RowComponent>
              <CustomBox title={"Apertura de expediente psicologicó"}>
                <FormikDatePicker label="Fecha de alta" name="fecha_alta" />
                <FormikAutocomplete
                  label="Psicologo responsable"
                  name="id_responsable"
                  options={psicologos}
                  disabled={persist.auth.id_rol == 4}
                  labelKey={"nombre_completo"}
                  loading={loadingUsers}
                  idKey={"id"}
                />
              </CustomBox>
              <CustomBox title={"Problematica Abordada"}>
                <FormikMultiSelect
                  label="Problematica Abordada"
                  name="id_problematica_abordada"
                  options={issuesAddressed}
                  labelKey={"nombre"}
                  idKey={"id"}
                  loading={loadingIssuesAddressed}
                />
                {values?.["id_problematica_abordada"]?.includes(11) && (
                  <FormikInput
                    label="Especifique la problematica"
                    name="especifique_problematica_abordada"
                  />
                )}
              </CustomBox>
              <CustomBox title={"Tipo de violencia asociada"}>
                <FormikMultiSelect
                  label="Tipo de violencia asociada"
                  name="id_violencia_asociada"
                  options={violence}
                  labelKey={"nombre"}
                  idKey={"id"}
                  loading={loadingViolence}
                />
              </CustomBox>
              <FormikSwitch label="Activo" name="activo" />
            </>
          )}
        />
      </div>
    </CustomModal>
  );
};
