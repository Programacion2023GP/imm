import CustomModal from "../../../components/modal/modal";
import FormikForm from "../../../formik/Formik";
import { FormikInput } from "../../../formik/FormikInputs/FormikInput";
import UseCatalogueData from "../../../hooks/catalogues/usecatalogues";

const AereaCataloguesPage =()=>{
      const { initialValues, postItem, open, setOpen, refresh, loading } =
        UseCatalogueData("area_organizadora");

    return (
      <CustomModal
        zIndex={900}
        title="Agregar Aerea Organizadora"
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
export default AereaCataloguesPage;