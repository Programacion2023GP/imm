import CustomModal from "../../../components/modal/modal";
import FormikForm from "../../../formik/Formik";
import { FormikInput } from "../../../formik/FormikInputs/FormikInput";
import UseIncedentesTypeData from "../../../hooks/incedentstypes/useincedentstypedata";

const IncidentesCataloguesPage =()=>{
      const {initialValues,postItem,open,setOpen,refresh,loading} = UseIncedentesTypeData()

    return (
      <CustomModal
        zIndex={900}
        title="Agregar tipo de caso o incidente"
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <FormikForm
          buttonMessage="Guardar"
          buttonLoading={loading}
          initialValues={initialValues}
          onSubmit={async (values) => {
          const success =  await postItem(values);
          if (success) {
              await refresh();
              setOpen(false)
          }
          }}
          children={() => (
            <>
              <FormikInput name="nombre" label="Nombre" />
            </>
          )}
        />
      </CustomModal>
    );
}
export default IncidentesCataloguesPage;