// CompositeCrud/components/RenderFormContent.tsx
import { RowComponent } from "../../../components/responsive/Responsive";
import type { RenderFormContentProps } from "../types";
import { StepperFormLocal } from "./StepperForm";
import { BoxFormLocal } from "./BoxForm";

export const RenderFormContent = ({
  computedFields,
  sectioned,
  activeStep,
  setActiveStep,
  renderField,
  renderComponent, // ← necesario para componentes y cajas
  stepperRef,
  boxRef,
  hideNavButtons = false,
}: RenderFormContentProps) => {
  // Sin secciones: renderizado simple de todos los campos (solo strings)
  if (!sectioned.hasSections) {
    return <RowComponent>{computedFields.map(renderField)}</RowComponent>;
  }

  // Modo Stepper: navegación por pasos
  if (sectioned.sectionType === "stepper") {
    return (
      <StepperFormLocal
        ref={stepperRef}
        sections={sectioned.sections} // ya tiene la forma { title, items: RenderableItem[] }
        activeStep={activeStep}
        onStepChange={setActiveStep}
        renderField={renderField}
        renderComponent={renderComponent}
        hideNavButtons={hideNavButtons}
      />
    );
  }

  // Modo Box: secciones en cajas independientes
  // `sectioned.sections` ya está en el formato correcto (con `items`), no hay que transformarlo
  return (
    <BoxFormLocal
      ref={boxRef}
      sections={sectioned.sections}
      renderField={renderField}
      renderComponent={renderComponent}
      hideSubmitButton={hideNavButtons}
    />
  );
};

export default RenderFormContent;
