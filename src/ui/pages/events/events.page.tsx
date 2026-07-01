import React from "react";
import { eventBuilder } from "../../../crudbuilder/events/events.builder";
import CompositeCrud, {
  prepareForForm,
} from "../../components/compositecustoms/compositeCrud";
import UseEventData from "../../hooks/events/useevents";
import UseCatalogueData from "../../hooks/catalogues/usecatalogues";
import CalendaryEvents from "./calendary.events.page";
import { Event } from "../../../models/events/event.model";

const PageEvents = () => {
  const eventsData = UseEventData();
  const cataloguesData = UseCatalogueData("tipo_actividad", false);

  // 📌 Crear nuevo evento: recibe la fecha (string YYYY-MM-DD)
  const handleNewEvent = (dateKey: string) => {
    console.log("aqui en new event");
    const data = prepareForForm({ date: dateKey });
    eventsData.setField("fecha_realizacion", data.date);
    eventsData.setOpen(true, false); // modo creación
  };

  // 📌 Editar evento: recibe el item completo (raw)
  const handleEditEvent = (rawItem: any) => {
    // Cargar todos los campos del item en el formulario
    eventsData.handleChangeItem(rawItem as unknown as Event)
    // Abrir modal en modo edición
    eventsData.setOpen(true,false);
  };

  return (
    <>
      <CalendaryEvents
        onNewEvent={handleNewEvent}
        onEditEvent={handleEditEvent}
      />
      <CompositeCrud
        formTitles={{
          modalTitleAdd: "Agregar evento",
          modalTitleUpdate: "Editar evento",
        }}
        hook={eventsData}
        crudConfig={eventBuilder}
      />
    </>
  );
};

export default PageEvents;
