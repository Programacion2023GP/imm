
import CustomTab from "../../components/tab/customtab";

import CompositeLoby from "../components/loby/loby.page";

import {
  FileText,
 
  Building2,
} from "lucide-react";

import AgendaPro from "./calendary.page";
import { PsychologicalForm } from "./PsychologicalForm";

const PsychologicalPage = () => {

  return (
    <>
      <CustomTab
        tabs={[
          {
            content: (
              <AgendaPro onEvent={(e) => console.log(e.type, e.payload)} />
            ),
            id: "agenda",
            label: "Agenda",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            content: <CompositeLoby loby="psicologo" />,
            id: "loby",
            label: "Loby",
            icon: <FileText className="w-4 h-4" />,
          },
        ]}
        variant="modern"
        size="sm"
        fullWidth
      />

        <PsychologicalForm/>
    </>
  );
};

export default PsychologicalPage;
