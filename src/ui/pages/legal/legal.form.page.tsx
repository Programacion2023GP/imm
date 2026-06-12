import { Home, MapPin, Phone, User } from "lucide-react";
import CustomModal from "../../components/modal/modal";
import FormikForm from "../../formik/Formik";
import {
  FormikAutocomplete,
  FormikDatePicker,
  FormikRadio,
  FormikSwitch,
  FormikTextArea,
} from "../../formik/FormikInputs/FormikInput";
import useAuthData from "../../hooks/auth/useauthdata";
import UseLegalData from "../../hooks/legal/uselegal";
import useUsersData from "../../hooks/users/useUsersData";
import { Loby } from "../../../models/loby/loby.model";
import { useEffect, useRef } from "react";
import { FormikProps } from "formik";
import { Legal } from "../../../models/legal/legal.model";
import {
  ColComponent,
  RowComponent,
} from "../../components/responsive/Responsive";
import CompositePage from "../../components/compositecustoms/compositePage";
import CompositeCrud from "../../components/compositecustoms/compositeCrud";
import { legalBuilderCrud } from "../../../crudbuilder/legal/legal.builder";

const LegalForm = () => {
  const {
    open,
    setOpen,
    initialValues,
    postItem,
    legal,
    loading: loadingLegal, } = UseLegalData();
  const { items: users, loading: loadingUsers } = useUsersData();
  const { persist } = useAuthData();

  const abogados = users.filter((it) => it.id_rol == 5);
  const formikRef = useRef<FormikProps<Legal>>(null);
  useEffect(() => {
    if (persist.auth.id_rol == 4) {
      formikRef?.current?.setFieldValue(
        "id_responsable",
        Number(persist.auth.id),
      );
    }
  }, [formikRef?.current, open]);
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
  const addressInfo = legal ? getAddressSummary(legal) : null;

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
          <span className="text-xs text-gray-500">CURP</span>
          <p className="text-xs font-mono text-gray-800 truncate">
            {legal?.curp || "No registrado"}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Nombre</span>
          <p className="text-xs font-mono text-gray-800 truncate">
            {legal?.nombre || "No registrado"}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Folio</span>
          <p className="text-xs font-mono font-semibold text-blue-600">
            {legal?.id || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

//   // Tarjeta de contacto y dirección - Versión compacta
//   const ContactInfoCard = () => (
//     <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
//       <div className="flex items-center gap-2 mb-2">
//         <MapPin className="w-4 h-4 text-gray-600" />
//         <span className="text-sm font-semibold text-gray-800">
//           Contacto y Dirección
//         </span>
//       </div>

//       <div className="space-y-2">
//         {addressInfo?.phone && (
//           <div className="flex items-center gap-2 text-sm">
//             <Phone className="w-3.5 h-3.5 text-green-500" />
//             <span className="text-xs text-gray-600 w-20">Teléfono:</span>
//             <span className="text-xs font-medium">{addressInfo.phone}</span>
//           </div>
//         )}

//         {addressInfo?.fullAddress && (
//           <div className="flex items-start gap-2 text-sm">
//             <Home className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
//             <span className="text-xs text-gray-600 w-20">Dirección:</span>
//             <span className="text-xs text-gray-700 flex-1">
//               {addressInfo.fullAddress}
//             </span>
//           </div>
//         )}

//         {addressInfo?.zone && (
//           <div className="flex items-center gap-2 text-sm">
//             <div className="w-3.5 h-3.5" />
//             <span className="text-xs text-gray-600 w-20">Zona:</span>
//             <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
//               {addressInfo.zone}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
  return (
   <></>
  );
};
export default LegalForm;
