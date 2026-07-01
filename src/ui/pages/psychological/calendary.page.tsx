import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import {
  HiMenu,
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiPlus,
  HiTrash,
  HiPencilAlt,
  HiOutlineFilter,
  HiClock,
  HiLockClosed,
  HiChartPie,
} from "react-icons/hi";
import * as XLSX from "xlsx";
import { RiFileExcelFill } from "react-icons/ri";
import {
  FaEdit,
  FaCheck,
  FaPhoneAlt,
  FaEnvelope,
  FaBirthdayCake,
  FaFileExcel,
  FaNotesMedical,
  FaUserMd,
  FaVenusMars,
  FaHospitalUser,
  FaSlidersH,
  FaChartLine,
  FaPencilAlt,
} from "react-icons/fa";
import CustomButton from "../../components/button/custombuttom";
import {
  FormikInput,
  FormikAutocomplete,
  FormikTextArea,
  FormikDatePicker,
} from "../../formik/FormikInputs/FormikInput";
import FormikForm from "../../formik/Formik";
import CustomModal from "../../components/modal/modal";
import Tooltip from "../../components/toltip/Toltip";
import UsePsychologicalEvaluationModuleData from "../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import UsePsychologicalEvaluationModuleDiaryData from "../../hooks/psychologicalevaluationmodulediary/usepsychologicalevaluationmodulediarydata";
import Swal from "sweetalert2";
import { PsychologicalForm } from "./PsychologicalForm";
import { PyschologicalEvaluation } from "../../../models/psychologicalevaluation.tsx/psychological.models";
import { Loby } from "../../../models/loby/loby.model";

// ========================== IMPORTS PARA DASHBOARD ==========================
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { prepareForForm } from "../../components/compositecustoms/compositeCrud";
import { FaFilePdf } from "react-icons/fa6";
import UseInterview from "../../hooks/interview/interviewdata";
import { EntrevistaShowResponse } from "../../../models/interview/interview.model";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

// ========================== TIPOS EXTENDIDOS ==========================
interface Person {
  id: number;
  nombre: string;
  email?: string;
  phone?: string;
  edad?: number;
  fechaNacimiento?: string;
  genero?: "F" | "M" | "Otro";
  telefonoEmergencia?: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  escolaridad?: string;
  ocupacion?: string;
  derivadoPor?: string;
  fechaIngreso?: string;
  psicologoAsignado?: string;
  notes?: string;
  observaciones?: string; // 👈 Agrega esta línea
}

interface Appointment {
  id: string;
  personId: number;
  date: string;
  time: string;
  duration: number;
  attended: boolean;
  followUpNotes: string;
  folio?: number;
  psicologoNombre?: string;
  primeravez: boolean; // 👈 Añade esta línea
}

interface Closure {
  personId: string;
  finalDiagnosis: string;
  reason: string;
  otherReason?: string;
  closureDate: string;
  closedAt: string;
}

interface Palette {
  bg: string;
  text: string;
  dot: string;
}

interface AgendaProProps {
  initialPersons?: Person[];
  initialAppointments?: Appointment[];
  initialClosures?: Closure[];
  onEvent?: (event: { type: string; payload: any }) => void;
}

// ========================== CONSTANTES ==========================
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const CLOSURE_REASONS = [
  "CONCLUSIÓN DEL PROCESO",
  "USUARIA YA NO ACUDIÓ",
  "USUARIA REFERENCIADA A OTRA INSTANCIA",
  "OTRO (ESPECIFIQUE)",
];

const PERSON_PALETTES: Palette[] = [
  { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  { bg: "#ede9fe", text: "#4c1d95", dot: "#8b5cf6" },
  { bg: "#fee2e2", text: "#7f1d1d", dot: "#ef4444" },
  { bg: "#ccfbf1", text: "#134e4a", dot: "#14b8a6" },
  { bg: "#ffedd5", text: "#7c2d12", dot: "#f97316" },
];

const CLOSURE_COLORS: Record<string, string> = {
  "CONCLUSIÓN DEL PROCESO": "#1D9E75",
  "USUARIA YA NO ACUDIÓ": "#E24B4A",
  "USUARIA REFERENCIADA A OTRA INSTANCIA": "#378ADD",
  "OTRO (ESPECIFIQUE)": "#BA7517",
};

const PALETTE = [
  "#378ADD",
  "#1D9E75",
  "#D85A30",
  "#BA7517",
  "#D4537E",
  "#534AB7",
  "#639922",
  "#E24B4A",
  "#0F6E56",
  "#993556",
];

const getColorByPsicologo = (nombre?: string): string => {
  if (!nombre) return "#6b7280";
  const colores: Record<string, string> = {
    "Juan Pérez": "#3b82f6",
    "María García": "#ec4899",
    "Carlos López": "#10b981",
    "Ana Martínez": "#f59e0b",
    "Luis Fernández": "#8b5cf6",
  };
  return colores[nombre] || "#6b7280";
};

// ========================== UTILIDADES ==========================
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const daysInMonth = (y: number, m: number): number =>
  new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number): number =>
  new Date(y, m, 1).getDay();
const isToday = (d: Date): boolean =>
  d.toDateString() === new Date().toDateString();
const parseDate = (str: string): Date => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const displayDate = (str: string): string => {
  const d = parseDate(str);
  return `${DAYS_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const formatTo12Hour = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};
const calcularEdad = (fechaNacimiento?: string): number | undefined => {
  if (!fechaNacimiento) return undefined;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};
const daysSince = (dateStr: string): number => {
  const past = parseDate(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - past.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
const isoWeek = (dateStr: string): string => {
  const d = new Date(dateStr);
  const mo = d.getMonth();
  const week = Math.ceil(d.getDate() / 7);
  return `${MONTHS_SHORT[mo]} S${week}`;
};

// ========================== COMPONENTES AUXILIARES COMUNES ==========================
const FormikSwitch: React.FC<{ name: string; label: string }> = ({
  name,
  label,
}) => {
  const [field, , helpers] = useField<boolean>(name);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <label style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => helpers.setValue(!field.value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 20,
          background: field.value ? "#3b82f6" : "#e5e7eb",
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: field.value ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
};

const Avatar: React.FC<{ name: string; palette: Palette; size?: number }> = ({
  name,
  palette,
  size = 40,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: palette.dot,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 600,
      fontSize: size * 0.4,
      flexShrink: 0,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

const AttendedBadge: React.FC<{ attended: boolean }> = ({ attended }) => (
  <span
    style={{
      background: attended ? "#d1fae5" : "#fee2e2",
      color: attended ? "#065f46" : "#7f1d1d",
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 20,
      whiteSpace: "nowrap",
    }}
  >
    {attended ? "Acudió" : "No acudió"}
  </span>
);

// ========================== MODALES DE LA AGENDA (copiados de tu código) ==========================
// MonthYearPicker
const MonthYearPicker: React.FC<{
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}> = ({ year, month, onSelect, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  return (
    <CustomModal isOpen onClose={onClose} title="Navegar a mes y año">
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Año
        </label>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value) || 2024)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "1px solid #d1d5db",
            fontSize: 16,
          }}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Mes
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "1px solid #d1d5db",
            fontSize: 16,
          }}
        >
          {MONTHS.map((m, idx) => (
            <option key={idx} value={idx}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <CustomButton variant="outline" onClick={onClose}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="solid"
          onClick={() => {
            onSelect(selectedYear, selectedMonth);
            onClose();
          }}
        >
          Ir
        </CustomButton>
      </div>
    </CustomModal>
  );
};

// Appointment Modal
const AppointmentSchema = Yup.object({
  personId: Yup.number().required("Requerido"),
  date: Yup.string().required("Requerido"),
  time: Yup.string().required("Requerido"),
  duration: Yup.number().min(5).required("Requerido"),
  attended: Yup.boolean(),
  followUpNotes: Yup.string(),
});
const ApptModal: React.FC<{
  appt: Appointment | null;
  persons: Person[];
  dateKey: string;
  defaultPersonId?: number; // 👈 nuevo

  onSave: (form: Appointment) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}> = ({
  appt,
  persons,
  dateKey,
  onSave,
  onDelete,
  onClose,
  defaultPersonId,
}) => {
  const isNew = !appt;
  const initialValues: Appointment = appt || {
    id: uid(),
    personId: defaultPersonId ?? persons[0]?.id ?? 0, // 👈 usa el de drag&drop si existe
    date:
      dateKey ||
      fmtDate(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      ),
    time: "09:00",
    duration: 30,
    attended: true,
    followUpNotes: "",
    primeravez: false,
  };
  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title={isNew ? "Nueva cita" : "Editar cita"}
    >
      <FormikForm
        initialValues={initialValues}
        validationSchema={AppointmentSchema}
        onSubmit={onSave}
        enableReinitialize
        buttonMessage="Guardar"
      >
        {(values, setFieldValue) => (
          <>
            <FormikAutocomplete
              name="personId"
              label="Persona"
              options={persons
                .filter((p) => p.id != null && p.nombre) // 👈 descarta nulos/vacíos
                .map((p) => ({ value: p.id, label: p.nombre }))}
              required
              idKey="value"
              labelKey="label"
            />
            <FormikDatePicker name="date" label="Fecha" type="date" required />
            <FormikInput name="time" label="Hora" type="time" required />
            <FormikAutocomplete
              name="duration"
              label="Duración (min)"
              options={[15, 20, 30, 45, 60, 90, 120].map((d) => ({
                value: d,
                label: `${d} min`,
              }))}
              idKey="value"
              labelKey="label"
            />
            <FormikSwitch name="attended" label="Acudió" />
            {/* Switch para Primera vez / Subsecuente */}
            <div style={{ marginBottom: 16 }} className="w-full">
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Tipo de cita
              </label>
              <div
                style={{
                  display: "flex",
                  background: "#f3f4f6",
                  borderRadius: 48,
                  padding: 4,
                  width: "fit-content",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFieldValue("primeravez", true)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 40,
                    border: "none",
                    background: values.primeravez ? "#fff" : "transparent",
                    color: values.primeravez ? "#f59e0b" : "#6b7280",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: values.primeravez
                      ? "0 2px 8px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  ✨ Primera vez
                </button>
                <button
                  type="button"
                  onClick={() => setFieldValue("primeravez", false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 40,
                    border: "none",
                    background: !values.primeravez ? "#fff" : "transparent",
                    color: !values.primeravez ? "#10b981" : "#6b7280",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: !values.primeravez
                      ? "0 2px 8px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  🔄 Subsecuente
                </button>
              </div>
            </div>

            <FormikTextArea
              name="followUpNotes"
              label="Notas de seguimiento"
              rows={3}
              placeholder="Evolución, comentarios..."
            />
          </>
        )}
      </FormikForm>
    </CustomModal>
  );
};

// Closure Modal
const ClosureSchema = Yup.object({
  finalDiagnosis: Yup.string().required("Requerido"),
  reason: Yup.string().required("Requerido"),
  otherReason: Yup.string().when("reason", {
    is: "OTRO (ESPECIFIQUE)",
    then: (schema) => schema.required("Especifique el motivo"),
    otherwise: (schema) => schema.notRequired(),
  }),
  closureDate: Yup.string().required("Requerido"),
});
const ClosureModal: React.FC<{
  person: Person;
  onSave: (closureData: Omit<Closure, "personId" | "closedAt">) => void;
  onClose: () => void;
}> = ({ person, onSave, onClose }) => {
  const initialValues = {
    finalDiagnosis: "",
    reason: "",
    otherReason: "",
    closureDate: fmtDate(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    ),
  };
  return (
    <CustomModal isOpen onClose={onClose} title="Cierre de caso">
      <Formik
        initialValues={initialValues}
        validationSchema={ClosureSchema}
        onSubmit={(values) => {
          onSave({
            finalDiagnosis: values.finalDiagnosis,
            reason: values.reason,
            otherReason:
              values.reason === "OTRO (ESPECIFIQUE)"
                ? values.otherReason
                : undefined,
            closureDate: values.closureDate,
          });
          onClose();
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <FormikTextArea
              name="finalDiagnosis"
              label="Diagnóstico clínico final"
              rows={4}
              required
            />
            <FormikAutocomplete
              name="reason"
              label="Motivo de cierre"
              options={CLOSURE_REASONS.map((r) => ({ value: r, label: r }))}
              required
              idKey="value"
              labelKey="label"
              onChange={(val) => {
                if (val !== "OTRO (ESPECIFIQUE)")
                  setFieldValue("otherReason", "");
              }}
            />
            {values.reason === "OTRO (ESPECIFIQUE)" && (
              <FormikInput
                name="otherReason"
                label="Especifique"
                required
                placeholder="Describa el motivo"
              />
            )}
            <FormikDatePicker
              name="closureDate"
              label="Fecha de cierre"
              type="date"
              required
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                justifyContent: "flex-end",
              }}
            >
              <CustomButton type="button" variant="outline" onClick={onClose}>
                Cancelar
              </CustomButton>
              <CustomButton
                type="submit"
                variant="solid"
                loading={isSubmitting}
              >
                Cerrar caso
              </CustomButton>
            </div>
          </Form>
        )}
      </Formik>
    </CustomModal>
  );
};

// PersonDetailModal
const PersonDetailModal: React.FC<{
  person: Person;
  appointments: Appointment[];
  palettes: Palette[];
  personIndex: number;
  onClose: () => void;
  onEditAppt: (appt: Appointment) => void;
  onNewAppt: (personId: number) => void;
  onClosure: () => void;
  onReabrirCaso?: () => void;
  closureInfo?: Closure;
}> = ({
  person,
  appointments,
  palettes,
  personIndex,
  onClose,
  onEditAppt,
  onNewAppt,
  onClosure,
  onReabrirCaso,
  closureInfo,
}) => {
  const palette = palettes[personIndex % palettes.length];
  const personAppts = appointments
    .filter((a) => a.personId === person.id)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const todayKey = fmtDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
  const upcoming = personAppts.filter((a) => a.date >= todayKey);
  const past = personAppts.filter((a) => a.date < todayKey);
  const {
    setExtra,
    setOpen: setModalOpenPsychological,
    handleChangeItem: setHandleChangePsychological,
    evaluationPerson,
  } = UsePsychologicalEvaluationModuleData();
  return (
    <CustomModal isOpen onClose={onClose} title={`Detalle de ${person.nombre}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: palette.bg,
            padding: 16,
            borderRadius: 16,
            flexWrap: "wrap",
          }}
        >
          <Avatar name={person.nombre} palette={palette} size={56} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: palette.text }}>
              {person.nombre}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 8,
              }}
            >
              {person.phone && (
                <Tooltip content="Teléfono">
                  <div
                    style={{
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FaPhoneAlt size={12} /> {person.phone}
                  </div>
                </Tooltip>
              )}
              {person.email && (
                <Tooltip content="Email">
                  <div
                    style={{
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FaEnvelope size={12} /> {person.email}
                  </div>
                </Tooltip>
              )}
              {(person.edad || person.fechaNacimiento) && (
                <div
                  style={{
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FaBirthdayCake size={12} />{" "}
                  {person.edad || calcularEdad(person.fechaNacimiento) || "N/A"}{" "}
                  años
                </div>
              )}
              {person.obraSocial && (
                <div style={{ fontSize: 13 }}>🏥 {person.obraSocial}</div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Historial de citas</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {closureInfo ? (
                <Tooltip content="Reabrir caso">
                  <CustomButton
                    variant="solid"
                    color="gray"
                    size="sm"
                    onClick={onReabrirCaso}
                  >
                    <FaCheck size={14} />
                  </CustomButton>
                </Tooltip>
              ) : (
                <Tooltip content="Cerrar caso">
                  <CustomButton
                    variant="solid"
                    color="gray"
                    size="sm"
                    onClick={onClosure}
                  >
                    <HiX size={14} />
                  </CustomButton>
                </Tooltip>
              )}
              <Tooltip content="Nueva cita">
                <CustomButton
                  variant="solid"
                  size="sm"
                  onClick={() => onNewAppt(person.id)}
                  disabled={!!closureInfo}
                >
                  <HiPlus size={14} />
                </CustomButton>
              </Tooltip>
              <Tooltip content="Editar Expediente">
                <CustomButton
                  variant="solid"
                  size="sm"
                  color="yellow"
                  onClick={async () => {
                    setModalOpenPsychological();
                    let res = await evaluationPerson(person.id);
                    console.log("🚀 ~ PersonDetailModal ~ res:", res);
                    res = prepareForForm(res);
                    console.log("🚀 ~ PersonDetailModal ~ res:", res);
                    setExtra("psychologicalEvaluation", {
                      ...(res as unknown as Loby),
                      id: person?.["folio"],
                    });
                    setTimeout(() => {
                      setHandleChangePsychological(
                        res as unknown as PyschologicalEvaluation,
                      );
                    }, 500);
                  }}
                  disabled={!!closureInfo}
                >
                  <FaEdit size={14} />
                </CustomButton>
              </Tooltip>
            </div>
          </div>
          {closureInfo && (
            <div
              style={{
                background: "#fef3c7",
                padding: 12,
                borderRadius: 12,
                marginBottom: 16,
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                🔒 Caso cerrado
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>Fecha cierre:</strong>{" "}
                {displayDate(closureInfo.closureDate)}
              </div>
              <div style={{ fontSize: 13 }}>
                <strong>Motivo:</strong> {closureInfo.reason}
                {closureInfo.otherReason && ` (${closureInfo.otherReason})`}
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                <strong>Diagnóstico final:</strong> {closureInfo.finalDiagnosis}
              </div>
            </div>
          )}
          {upcoming.length === 0 && past.length === 0 && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
              No hay citas registradas
            </p>
          )}
          {[...upcoming, ...past].map((a) => (
            <div
              key={a.id}
              onClick={() => onEditAppt(a)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: palette.bg,
                borderRadius: 16,
                marginBottom: 8,
                cursor: "pointer",
                flexWrap: "wrap",
                borderLeft: `4px solid ${getColorByPsicologo(a.psicologoNombre)}`,
              }}
            >
              <div style={{ textAlign: "center", minWidth: 56 }}>
                <div
                  style={{ fontSize: 22, fontWeight: 700, color: palette.dot }}
                >
                  {parseDate(a.date).getDate()}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {MONTHS[parseDate(a.date).getMonth()].slice(0, 3)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {formatTo12Hour(a.time)} • {a.duration} min
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  <span style={{ fontWeight: 500 }}>Folio:</span>{" "}
                  {a.folio || "N/A"} •{" "}
                  <span style={{ fontWeight: 500, marginLeft: 8 }}>
                    Psicólogo:
                  </span>{" "}
                  {a.psicologoNombre || "No asignado"}
                </div>
              </div>
              <AttendedBadge attended={a.attended} />
              <span style={{ fontSize: 20, color: "#9ca3af" }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </CustomModal>
  );
};

// DayPanelDesktop
const DayPanelDesktop: React.FC<{
  dateKey: string;
  appointments: Appointment[];
  persons: Person[];
  palettes: Palette[];
  onClose: () => void;
  onEdit: (appt: Appointment) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onQuickNote: (appt: Appointment) => void;
}> = ({
  dateKey,
  appointments,
  persons,
  palettes,
  onClose,
  onEdit,
  onAdd,
  onDelete,
  onQuickNote,
}) => {
  const dayAppts = appointments
    .filter((a) => a.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
  const getPalette = (personId: number) => {
    const idx = persons.findIndex((p) => p.id === personId);
    return palettes[idx % palettes.length];
  };
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 420,
        height: "100vh",
        background: "#fff",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
        zIndex: 1050,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slideInRight 0.2s ease-out",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {displayDate(dateKey)}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {dayAppts.length} cita{dayAppts.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <CustomButton variant="solid" size="sm" onClick={onAdd}>
            + Agregar
          </CustomButton>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 40,
              width: 32,
              height: 32,
              cursor: "pointer",
            }}
          >
            <HiX size={16} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {dayAppts.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
            <div>Sin citas este día</div>
            <CustomButton variant="solid" size="sm" onClick={onAdd}>
              Crear primera cita
            </CustomButton>
          </div>
        )}
        {dayAppts.map((a) => {
          const p = persons.find((x) => x.id === a.personId);
          if (!p) return null;
          const pal = getPalette(a.personId);
          return (
            <div
              key={a.id}
              style={{
                background: pal.bg,
                borderRadius: 16,
                padding: 12,
                marginBottom: 12,
                borderLeft: `4px solid ${getColorByPsicologo(a.psicologoNombre)}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>{a.time}</span>{" "}
                  <span style={{ fontSize: 14, color: pal.text }}>
                    • {p.nombre}
                  </span>
                </div>
                <AttendedBadge attended={a.attended} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: pal.text,
                  opacity: 0.7,
                  marginBottom: 4,
                }}
              >
                Folio: {a.folio || "N/A"} | Psicólogo:{" "}
                {a.psicologoNombre?.split(" ")[0] || "N/A"}
              </div>
              <div style={{ fontSize: 13, color: pal.text, opacity: 0.8 }}>
                {a.duration} min
              </div>
              {a.followUpNotes && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                    marginTop: 6,
                    fontStyle: "italic",
                  }}
                >
                  {a.followUpNotes}
                </div>
              )}
              {a.primeravez && (
                <span
                  style={{
                    background: "#fbbf24",
                    color: "#78350f",
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 12,
                    marginLeft: 8,
                  }}
                >
                  🫨 1ra vez
                </span>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <CustomButton
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(a)}
                >
                  <HiPencilAlt size={14} /> Editar
                </CustomButton>
                <CustomButton
                  size="sm"
                  variant="solid"
                  color="ruby"
                  onClick={() => onDelete(a.id)}
                >
                  <HiTrash size={14} /> Eliminar
                </CustomButton>
                <Tooltip content="Nota rápida">
                  <CustomButton
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickNote(a)}
                  >
                    <FaNotesMedical size={14} /> Nota
                  </CustomButton>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

// FiltersModal

// ReportsModal
const ReportsModal: React.FC<{
  appointments: Appointment[];
  persons: Person[];
  closures: Closure[];
  onClose: () => void;
}> = ({ appointments, persons, closures, onClose }) => {
  const [reportType, setReportType] = useState<
    "asistencia" | "pacientes" | "psicologos" | "cierres"
  >("asistencia");
  const [startDate, setStartDate] = useState(
    fmtDate(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [endDate, setEndDate] = useState(
    fmtDate(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    ),
  );
  const exportReport = () => {
    let data: any[] = [];
    let fileName = "";
    switch (reportType) {
      case "asistencia":
        const filtered = appointments.filter(
          (a) => a.date >= startDate && a.date <= endDate,
        );
        data = filtered.map((a) => {
          const p = persons.find((per) => per.id === a.personId);
          return {
            Fecha: a.date,
            Hora: a.time,
            Paciente: p?.nombre || "N/A",
            Psicólogo: a.psicologoNombre || "N/A",
            "Tipo de cita": a.primeravez ? "Primera vez" : "Subsecuente", // 👈 Nueva columna

            Asistió: a.attended ? "Sí" : "No",
            Notas: a.followUpNotes || "",
          };
        });
        fileName = `reporte_asistencia_${startDate}_a_${endDate}.xlsx`;
        break;
      case "pacientes":
        data = persons.map((p) => ({
          Nombre: p.nombre,
          Teléfono: p.phone || "N/A",
          Email: p.email || "N/A",
          Edad: p.edad || "N/A",
          Observaciones: p.observaciones || "N/A", // 👈 Agrega esta línea

          "Obra Social": p.obraSocial || "N/A",
          "Fecha Ingreso": p.fechaIngreso || "N/A",
          Estado: closures.find((c) => c.personId === String(p.id))
            ? "Cerrado"
            : "Activo",
        }));
        fileName = "reporte_pacientes.xlsx";
        break;
      case "psicologos":
        const psicologos = Array.from(
          new Set(appointments.map((a) => a.psicologoNombre).filter(Boolean)),
        );
        data = psicologos.map((psic) => {
          const citasPsic = appointments.filter(
            (a) => a.psicologoNombre === psic,
          );
          const asistidas = citasPsic.filter((a) => a.attended).length;
          return {
            Psicólogo: psic,
            "Total citas": citasPsic.length,
            "Citas asistidas": asistidas,
            "Tasa asistencia": citasPsic.length
              ? ((asistidas / citasPsic.length) * 100).toFixed(1) + "%"
              : "0%",
          };
        });
        fileName = "reporte_carga_psicologos.xlsx";
        break;
      case "cierres":
        data = closures.map((c) => {
          const p = persons.find((per) => String(per.id) === c.personId);
          return {
            Paciente: p?.nombre || "N/A",
            "Fecha cierre": c.closureDate,
            Motivo: c.reason,
            "Otro motivo": c.otherReason || "",
            "Diagnóstico final": c.finalDiagnosis,
          };
        });
        fileName = "reporte_casos_cerrados.xlsx";
        break;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, fileName);
    Swal.fire("Éxito", "Reporte exportado correctamente", "success");
    onClose();
  };
  return (
    <CustomModal isOpen onClose={onClose} title="Generar Reportes">
      <div style={{ padding: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Tipo de reporte
        </label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as any)}
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option value="asistencia">📊 Asistencia por rango de fechas</option>
          <option value="pacientes">👥 Listado de pacientes</option>
          <option value="psicologos">👨‍⚕️ Carga por psicólogo</option>
          <option value="cierres">🔒 Casos cerrados</option>
        </select>
        {reportType === "asistencia" && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Fecha desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Fecha hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <CustomButton variant="outline" onClick={onClose}>
            Cancelar
          </CustomButton>
          <CustomButton variant="solid" onClick={exportReport}>
            <FaFileExcel /> Exportar
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

// QuickNoteModal
const QuickNoteModal: React.FC<{
  appointment: Appointment;
  onSave: (id: string, note: string) => void;
  onClose: () => void;
}> = ({ appointment, onSave, onClose }) => {
  const [note, setNote] = useState(appointment.followUpNotes || "");
  return (
    <CustomModal isOpen onClose={onClose} title="Nota rápida">
      <textarea
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escribe una nota de seguimiento..."
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 8,
          border: "1px solid #ccc",
          marginBottom: 16,
        }}
      />
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <CustomButton variant="outline" onClick={onClose}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="solid"
          onClick={() => onSave(appointment.id, note)}
        >
          Guardar
        </CustomButton>
      </div>
    </CustomModal>
  );
};

// ========================== COMPONENTES DEL DASHBOARD ==========================
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, delta, deltaUp, icon, color }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #f1f5f9",
      borderRadius: 16,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
        {label}
      </span>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: color + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
      {value}
    </div>
    {delta && (
      <div
        style={{
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: deltaUp ? "#065f46" : "#991b1b",
        }}
      >
        {deltaUp ? (
          <HiChevronLeft size={12} style={{ transform: "rotate(90deg)" }} />
        ) : (
          <HiChevronRight size={12} style={{ transform: "rotate(90deg)" }} />
        )}
        {delta}
      </div>
    )}
  </div>
);

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #f1f5f9",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
        {title}
      </span>
      {action}
    </div>
    {children}
  </div>
);

const AdminDashboard: React.FC<{
  appointments: Appointment[];
  persons: Person[];
  closures: Closure[];
  onBack: () => void;
  onUpdateNote: (id: string, note: string) => Promise<void>; // 👈 nueva
}> = ({ appointments, persons, closures, onBack, onUpdateNote }) => {
  const [period, setPeriod] = useState<"mes" | "trimestre" | "anio">("mes");
  const today = new Date();
  const todayStr = fmtDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Filtrado por período (funcional)
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      const d = new Date(a.date);
      if (period === "mes")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (period === "trimestre") {
        const q = Math.floor(now.getMonth() / 3);
        return (
          Math.floor(d.getMonth() / 3) === q &&
          d.getFullYear() === now.getFullYear()
        );
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [appointments, period]);

  const totalCitas = filteredAppointments.length;
  const asistencias = filteredAppointments.filter((a) => a.attended).length;
  const noAsistencias = totalCitas - asistencias;
  const tasaAsistencia =
    totalCitas > 0 ? Math.round((asistencias / totalCitas) * 100) : 0;
  const pacientesActivos = persons.filter(
    (p) => !closures.find((c) => c.personId === String(p.id)),
  ).length;
  const casosCerrados = closures.length;

  // Datos para gráficos (sin cambios)
  const weeklyData = useMemo(() => {
    const map: Record<string, { asistieron: number; noAsistieron: number }> =
      {};
    filteredAppointments.forEach((a) => {
      const key = isoWeek(a.date);
      if (!map[key]) map[key] = { asistieron: 0, noAsistieron: 0 };
      if (a.attended) map[key].asistieron++;
      else map[key].noAsistieron++;
    });
    const labels = Object.keys(map).slice(-12);
    const asistieron = labels.map((l) => map[l].asistieron);
    const noAsistieron = labels.map((l) => map[l].noAsistieron);
    return { labels, asistieron, noAsistieron };
  }, [filteredAppointments]);

  const monthlyTrend = useMemo(() => {
    const labels: string[] = [];
    const citas: number[] = [];
    const asistenciasArr: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mo = d.getMonth();
      const yr = d.getFullYear();
      const appts = appointments.filter((a) => {
        const ad = new Date(a.date);
        return ad.getMonth() === mo && ad.getFullYear() === yr;
      });
      labels.push(MONTHS_SHORT[mo]);
      citas.push(appts.length);
      asistenciasArr.push(appts.filter((a) => a.attended).length);
    }
    return { labels, citas, asistencias: asistenciasArr };
  }, [appointments]);

  const closureData = useMemo(() => {
    const map: Record<string, number> = {};
    closures.forEach((c) => {
      const key = c.reason || "Sin motivo";
      map[key] = (map[key] || 0) + 1;
    });
    const labels = Object.keys(map);
    const values = labels.map((l) => map[l]);
    return { labels, values };
  }, [closures]);

  const psicologosData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      const nombre = a.psicologoNombre || "Sin asignar";
      map[nombre] = (map[nombre] || 0) + 1;
    });
    return Object.entries(map)
      .filter(
        ([nombre]) => nombre && nombre !== "null" && nombre !== "undefined",
      )
      .map(([nombre, citas]) => ({ nombre, citas }))
      .sort((a, b) => b.citas - a.citas)
      .slice(0, 8);
  }, [filteredAppointments]);

  const maxPsiCitas = psicologosData[0]?.citas || 1;

  const donutData = {
    labels: ["Asistieron", "No asistieron"],
    datasets: [
      {
        data: [asistencias, noAsistencias],
        backgroundColor: ["#3b82f6", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const weeklyChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: "Asistieron",
        data: weeklyData.asistieron,
        backgroundColor: "#3b82f6",
        stack: "stack0",
      },
      {
        label: "No asistieron",
        data: weeklyData.noAsistieron,
        backgroundColor: "#ef4444",
        stack: "stack0",
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyTrend.labels,
    datasets: [
      {
        label: "Total citas",
        data: monthlyTrend.citas,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Asistencias",
        data: monthlyTrend.asistencias,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const closureChartData = {
    labels: closureData.labels,
    datasets: [
      {
        label: "Cantidad",
        data: closureData.values,
        backgroundColor: closureData.labels.map(
          (l) =>
            CLOSURE_COLORS[l] ||
            PALETTE[Math.floor(Math.random() * PALETTE.length)],
        ),
        borderRadius: 6,
      },
    ],
  };

  const tomorrow = fmtDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  const proximasCitas = appointments
    .filter((a) => a.date === todayStr || a.date === tomorrow)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8);

  const sinCitaReciente = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = fmtDate(
      cutoff.getFullYear(),
      cutoff.getMonth(),
      cutoff.getDate(),
    );
    return persons.filter((p) => {
      if (closures.find((c) => c.personId === String(p.id))) return false;
      const last = appointments
        .filter((a) => a.personId === p.id && a.date <= todayStr)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return !last || last.date < cutoffStr;
    });
  }, [persons, appointments, closures]);

  const exportExcel = () => {
    const rows = filteredAppointments.map((a) => {
      const p = persons.find((x) => x.id === a.personId);
      const edad = p?.edad || calcularEdad(p?.fechaNacimiento) || "N/A";
      return {
        Folio: a.folio || "N/A",
        Fecha: a.date,
        Hora: formatTo12Hour(a.time),
        Paciente: p?.nombre || "N/A",
        Edad: edad,
        Teléfono: p?.phone || "N/A",

        Observaciones: p?.observaciones || "N/A", // 👈 Columna de observaciones
        Psicólogo: a.psicologoNombre || "N/A",
        "Duración (min)": a.duration,
        "Tipo de cita": a.primeravez ? "Primera vez" : "Subsecuente", // 👈 Nueva columna
        Asistió: a.attended ? "Sí" : "No",
        Notas: a.followUpNotes || "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [10, 12, 10, 28, 8, 15, 25, 12, 14, 10, 40].map((wch) => ({
      wch,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, `dashboard_${today.toISOString().slice(0, 10)}.xlsx`);
  };
  const periodBtnStyle = (p: string): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 40,
    border: "1px solid",
    borderColor: period === p ? "#3b82f6" : "#e2e8f0",
    background: period === p ? "#3b82f6" : "#fff",
    color: period === p ? "#fff" : "#475569",
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  const getInitial = (name?: string | null) =>
    (name && name.charAt(0).toUpperCase()) || "?";

  // Componente interno de celda editable
  const EditableNoteCell: React.FC<{
    appointmentId: string;
    initialNote: string;
    onSave: (id: string, note: string) => Promise<void>;
  }> = ({ appointmentId, initialNote, onSave }) => {
    const [note, setNote] = useState(initialNote);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
      await onSave(appointmentId, note);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={{
              flex: 1,
              fontSize: 12,
              border: "1px solid #3b82f6",
              borderRadius: 8,
              padding: "6px 8px",
              fontFamily: "inherit",
              resize: "vertical",
              minWidth: 150,
            }}
            autoFocus
          />
          <button
            onClick={handleSave}
            style={{
              background: "#10b981",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <FaCheck size={12} />
          </button>
          <button
            onClick={() => {
              setNote(initialNote);
              setIsEditing(false);
            }}
            style={{
              background: "#ef4444",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <HiX size={12} />
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          maxWidth: 200,
        }}
        onClick={() => setIsEditing(true)}
      >
        <span
          style={{
            color: "#475569",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {initialNote || "—"}
        </span>
        <FaPencilAlt size={12} style={{ color: "#94a3b8", opacity: 0.6 }} />
      </div>
    );
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eef2f6",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "#f1f5f9",
            border: "none",
            borderRadius: 12,
            padding: "8px 16px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
          }}
        >
          ← Regresar a Agenda
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Panel de Administración
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {MONTHS[today.getMonth()]} {today.getFullYear()} ·{" "}
            {appointments.length} citas registradas
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {(["mes", "trimestre", "anio"] as const).map((p) => (
            <button
              key={p}
              style={periodBtnStyle(p)}
              onClick={() => setPeriod(p)}
            >
              {p === "mes"
                ? "Este mes"
                : p === "trimestre"
                  ? "Trimestre"
                  : "Año completo"}
            </button>
          ))}
          <button
            onClick={exportExcel}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "8px 18px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RiFileExcelFill size={16} /> Exportar datos
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "28px 28px 40px",
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <KpiCard
            label="Citas totales"
            value={totalCitas}
            icon={<HiCalendar size={20} />}
            color="#3b82f6"
            delta={`${appointments.length} históricas`}
            deltaUp
          />
          <KpiCard
            label="Asistencias"
            value={asistencias}
            icon={<FaCheck size={20} />}
            color="#10b981"
            delta={`${tasaAsistencia}% de tasa`}
            deltaUp={tasaAsistencia >= 80}
          />
          <KpiCard
            label="No asistencias"
            value={noAsistencias}
            icon={<HiX size={20} />}
            color="#ef4444"
            delta={`${100 - tasaAsistencia}% de inasistencia`}
            deltaUp={false}
          />
          <KpiCard
            label="Pacientes activos"
            value={pacientesActivos}
            icon={<FaUserMd size={20} />}
            color="#8b5cf6"
            delta={`${persons.length} registrados`}
            deltaUp
          />
          <KpiCard
            label="Casos cerrados"
            value={casosCerrados}
            icon={<HiLockClosed size={20} />}
            color="#f59e0b"
            delta={`${persons.length > 0 ? Math.round((casosCerrados / persons.length) * 100) : 0}% del total`}
            deltaUp={false}
          />
          <KpiCard
            label="Tasa de asistencia"
            value={`${tasaAsistencia}%`}
            icon={<FaChartLine size={20} />}
            color={tasaAsistencia >= 85 ? "#10b981" : "#f59e0b"}
            delta={tasaAsistencia >= 85 ? "Meta superada (85%)" : "Meta: 85%"}
            deltaUp={tasaAsistencia >= 85}
          />
        </div>

        {/* Gráficos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <SectionCard title="📊 Evolución semanal">
            <Bar
              data={weeklyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </SectionCard>
          <SectionCard title="🍩 Resumen de asistencia">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ width: 220, height: 220, margin: "0 auto" }}>
                <Doughnut
                  data={donutData}
                  options={{
                    cutout: "65%",
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span style={{ color: "#3b82f6" }}>
                  {asistencias} asistieron
                </span>{" "}
                ·{" "}
                <span style={{ color: "#ef4444" }}>
                  {noAsistencias} no asistieron
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <SectionCard title="📈 Tendencia mensual (últimos 6 meses)">
            <Line
              data={monthlyChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </SectionCard>
          <SectionCard title="🔎 Motivos de cierre de caso">
            {closureData.labels.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  padding: "48px 0",
                }}
              >
                No hay cierres registrados todavía
              </div>
            ) : (
              <Bar
                data={closureChartData}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            )}
          </SectionCard>
        </div>

        {/* Psicólogos */}
        <div style={{ marginBottom: 32 }}>
          <SectionCard
            title={`👨‍⚕️ Psicólogos — desempeño en el período (${filteredAppointments.length} citas)`}
          >
            {psicologosData.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}
              >
                Sin información de psicólogos
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {psicologosData.map((p, i) => (
                  <div
                    key={p.nombre}
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: PALETTE[i % PALETTE.length] + "20",
                        color: PALETTE[i % PALETTE.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {getInitial(p.nombre)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          fontSize: 14,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>
                          {p.nombre}
                        </span>
                        <span style={{ color: "#475569", fontWeight: 500 }}>
                          {p.citas} citas
                        </span>
                      </div>
                      <div
                        style={{
                          background: "#e2e8f0",
                          borderRadius: 20,
                          height: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.round((p.citas / maxPsiCitas) * 100)}%`,
                            height: "100%",
                            background: PALETTE[i % PALETTE.length],
                            borderRadius: 20,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Próximas citas y pacientes inactivos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <SectionCard
            title="📅 Próximas 48h"
            action={
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "4px 12px",
                  borderRadius: 30,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {proximasCitas.length} pendientes
              </span>
            }
          >
            {proximasCitas.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#94a3b8",
                }}
              >
                ✨ No hay citas programadas para hoy o mañana
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {proximasCitas.map((a) => {
                  const person = persons.find((x) => x.id === a.personId);
                  const isTodayFlag = a.date === todayStr;
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 14px",
                        background: isTodayFlag ? "#f0f9ff" : "#f8fafc",
                        borderRadius: 14,
                        borderLeft: `4px solid ${isTodayFlag ? "#3b82f6" : "#cbd5e1"}`,
                      }}
                    >
                      <HiCalendar
                        size={18}
                        color={isTodayFlag ? "#3b82f6" : "#94a3b8"}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: 14,
                          }}
                        >
                          {formatTo12Hour(a.time)} ·{" "}
                          {person?.nombre || "Paciente"}
                        </div>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          {a.psicologoNombre || "Sin psicólogo"} · {a.duration}{" "}
                          min
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          background: isTodayFlag ? "#dbeafe" : "#e2e8f0",
                          padding: "4px 10px",
                          borderRadius: 20,
                          color: isTodayFlag ? "#1e40af" : "#475569",
                        }}
                      >
                        {isTodayFlag ? "Hoy" : "Mañana"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
          <SectionCard
            title="⚠️ Pacientes inactivos (30+ días sin cita)"
            action={
              sinCitaReciente.length > 0 ? (
                <span
                  style={{
                    background: "#fed7aa",
                    color: "#9a3412",
                    padding: "4px 12px",
                    borderRadius: 30,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {sinCitaReciente.length} paciente
                  {sinCitaReciente.length !== 1 ? "s" : ""}
                </span>
              ) : undefined
            }
          >
            {sinCitaReciente.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#10b981",
                  padding: "40px 0",
                }}
              >
                ✅ Todos los casos activos tienen seguimiento reciente
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {sinCitaReciente.slice(0, 6).map((p) => {
                  const ultima = appointments
                    .filter((a) => a.personId === p.id && a.date <= todayStr)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: "#fffbeb",
                        borderRadius: 12,
                        borderLeft: "3px solid #f59e0b",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "#fde68a",
                          color: "#92400e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {getInitial(p.nombre)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#111827",
                            fontSize: 13,
                          }}
                        >
                          {p.nombre}
                        </div>
                        <div style={{ fontSize: 11, color: "#92400e" }}>
                          {ultima
                            ? `Última cita: ${ultima.date}`
                            : "Nunca ha tenido cita"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sinCitaReciente.length > 6 && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 8,
                    }}
                  >
                    +{sinCitaReciente.length - 6} pacientes más
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Tabla detallada con nuevas columnas */}
        <SectionCard
          title={`📋 Detalle de citas (${filteredAppointments.length} registros en el período)`}
        >
          <div style={{ overflowX: "auto", borderRadius: 12 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f1f5f9",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {[
                    "Folio",
                    "Fecha",
                    "Hora",
                    "Paciente",
                    "Edad",
                    "Teléfono",
                    "Psicólogo",
                    "Duración",
                    "Asistió",
                    "Notas",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.slice(0, 15).map((a, i) => {
                  const person = persons.find((x) => x.id === a.personId);
                  const edad =
                    person?.edad ||
                    calcularEdad(person?.fechaNacimiento) ||
                    "N/A";
                  const telefono = person?.phone || "N/A";
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: i % 2 === 0 ? "#fff" : "#fafcff",
                      }}
                    >
                      <td style={{ padding: "10px 16px", color: "#475569" }}>
                        {a.folio || "—"}
                      </td>
                      <td
                        style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                      >
                        {a.date}
                      </td>
                      <td
                        style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                      >
                        {formatTo12Hour(a.time)}
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 500 }}>
                        {person?.nombre || "N/A"}
                      </td>
                      <td style={{ padding: "10px 16px" }}>{edad}</td>
                      <td style={{ padding: "10px 16px" }}>{telefono}</td>
                      <td style={{ padding: "10px 16px", color: "#475569" }}>
                        {a.psicologoNombre || "—"}
                      </td>
                      <td style={{ padding: "10px 16px" }}>{a.duration} min</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            background: a.attended ? "#dcfce7" : "#fee2e2",
                            color: a.attended ? "#166534" : "#991b1b",
                            padding: "2px 10px",
                            borderRadius: 30,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {a.attended ? "Sí" : "No"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", maxWidth: 250 }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: a.followUpNotes || "—",
                          }}
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            maxHeight: 80,
                            overflowY: "auto",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAppointments.length > 15 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "16px",
                  fontSize: 13,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                Mostrando 15 de {filteredAppointments.length} registros. Exporta
                a Excel para ver el listado completo.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// ========================== COMPONENTE PRINCIPAL AGENDAPRO ==========================
const AgendaPro: React.FC<AgendaProProps> = ({
  initialPersons,
  initialAppointments,
  initialClosures = [],
  onEvent = () => {},
}) => {
  const {
    getDiary,
    listDiary,
    loading: loadingPersons,
    open: isModalOpenPsychological,
    selectPersonCalendary,
    evaluationPerson,
  } = UsePsychologicalEvaluationModuleData();
  const {
    items: listAppointments,
    saveAppointment,
    deleteAppointment,
    moveAppointment,
    closeCase,
    reabrirCaso,
    loadAgenda,
    agendaData,
    closures: closuresFromHook,
  } = UsePsychologicalEvaluationModuleDiaryData();

  const [persons, setPersons] = useState<Person[]>(initialPersons || []);
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments || [],
  );
  const [closures, setClosures] = useState<Closure[]>(initialClosures || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [modalAppt, setModalAppt] = useState<{
    appt: Appointment | null;
    dateKey: string;
    personId?: number;
  } | null>(null);
  const [personDetail, setPersonDetail] = useState<Person | null>(null);
  const [closureModalPerson, setClosureModalPerson] = useState<Person | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [selectedDayPanel, setSelectedDayPanel] = useState<string | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [quickNote, setQuickNote] = useState<Appointment | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [filters, setFilters] = useState({
    edadMin: "",
    edadMax: "",
    genero: "",
    estado: "activos" as "activos" | "cerrados" | "todos",
    obraSocial: "",
    psicologo: "",
  });

  useEffect(() => {
    if (initialPersons === undefined && getDiary) getDiary();
    if (initialAppointments === undefined && loadAgenda) loadAgenda();
  }, [getDiary, loadAgenda]);
  useEffect(() => {
    if (listDiary && listDiary.length > 0 && initialPersons === undefined) {
      // Asegurar que el teléfono se mapea correctamente
      const personsWithPhone = listDiary.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        phone: p.telefono || p.phone || null, // ← aquí mapeamos el teléfono
        email: p.email,
        edad: p.edad,
        fechaNacimiento: p.fecha_nacimiento,
        genero: p.genero,
        telefonoEmergencia: p.telefono_emergencia,
        obraSocial: p.obra_social,
        numeroAfiliado: p.numero_afiliado,
        escolaridad: p.escolaridad,
        ocupacion: p.ocupacion,
        derivadoPor: p.derivado_por,
        fechaIngreso: p.fecha_ingreso,
        psicologoAsignado: p.psicologo_asignado,
        observaciones: p.observaciones || p.notes || null, // 👈 Agrega esta línea

        notes: p.notes,
      }));
      setPersons(personsWithPhone);
    }
  }, [listDiary, initialPersons]);
  useEffect(() => {
    if (
      closuresFromHook &&
      closuresFromHook.length > 0 &&
      initialClosures === undefined
    )
      setClosures(
        closuresFromHook.map((c: any) => ({
          personId: String(c.personaId || c.personId),
          finalDiagnosis: c.diagnosticoFinal || c.finalDiagnosis,
          reason: c.motivo || c.reason,
          otherReason: c.otroMotivo || c.otherReason,
          closureDate: c.fechaCierre || c.closureDate,
          closedAt: c.cerradoEn || c.closedAt,
        })),
      );
  }, [closuresFromHook, initialClosures]);
  useEffect(() => {
    if (
      agendaData?.cierres &&
      agendaData.cierres.length > 0 &&
      initialClosures === undefined
    )
      setClosures(
        agendaData.cierres.map((c: any) => ({
          personId: String(c.personaId || c.personId),
          finalDiagnosis: c.diagnosticoFinal || c.finalDiagnosis,
          reason: c.motivo || c.reason,
          otherReason: c.otroMotivo || c.otherReason,
          closureDate: c.fechaCierre || c.closureDate,
          closedAt: c.cerradoEn || c.closedAt,
        })),
      );
  }, [agendaData?.cierres, initialClosures]);
  useEffect(() => {
    const citasArray = listAppointments?.[0]?.citas;
    if (
      citasArray &&
      Array.isArray(citasArray) &&
      citasArray.length > 0 &&
      initialAppointments === undefined
    ) {
      setAppointments(
        citasArray.map((c: any) => ({
          id: String(c.id),
          personId: c.personaId,
          date: c.fecha ? c.fecha.split("T")[0] : "", // ✅ NORMALIZA A YYYY-MM-DD
          time: c.hora,
          duration: c.duracion,
          attended: c.asistio,
          followUpNotes: c.notasSeguimiento || "",
          folio: c.folio,
          psicologoNombre: c.nombre_completo,
          primeravez: c.primeravez ?? false,
        })),
      );
    }
  }, [listAppointments, initialAppointments]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const getPalette = useCallback(
    (personId: number): Palette => {
      const idx = persons.findIndex((p) => p.id === personId);
      return PERSON_PALETTES[idx % PERSON_PALETTES.length];
    },
    [persons],
  );
  const emit = useCallback(
    (type: string, payload: any) => onEvent({ type, payload }),
    [onEvent],
  );
  const daysOfMonth = useMemo(() => {
    const daysInCurrentMonth = daysInMonth(year, month);
    const days: { date: Date; dateKey: string; dayName: string }[] = [];
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        dateKey: fmtDate(year, month, d),
        dayName: DAYS_FULL[date.getDay()],
      });
    }
    return days;
  }, [year, month]);
  const getApptsByDate = useCallback(
    (dateKey: string) =>
      appointments
        .filter((a) => a.date === dateKey)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments],
  );
  const getClosureForPerson = (personId: number) =>
    closures.find((c) => c.personId === String(personId));
  const isPersonCaseClosed = useCallback(
    (personId: number) => !!getClosureForPerson(personId),
    [closures],
  );

  const reabrirCasoConConfirmacion = useCallback(
    async (personId: number, personaNombre: string) => {
      const result = await Swal.fire({
        title: "¿Reabrir caso?",
        text: `¿Estás seguro de reabrir el caso de ${personaNombre}? Se podrán agendar nuevas citas.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, reabrir",
        cancelButtonText: "Cancelar",
      });
      if (!result.isConfirmed) return;
      try {
        await reabrirCaso(personId);
        setClosures((prev) =>
          prev.filter((c) => c.personId !== String(personId)),
        );
        setPersonDetail(null);
        setClosureModalPerson(null);
        await loadAgenda();
      } catch (error) {
        console.error(error);
      }
    },
    [reabrirCaso, loadAgenda],
  );

  const saveAppt = useCallback(
    async (appt: Appointment) => {
      setAppointments((prev) => {
        const exists = prev.find((a) => a.id === appt.id);
        return exists
          ? prev.map((a) => (a.id === appt.id ? appt : a))
          : [...prev, appt];
      });
      try {
        const citaData = {
          id: parseInt(appt.id) || 0,
          personaId: appt.personId,
          fecha: appt.date, // ✅ Ya está en YYYY-MM-DD
          hora: appt.time,
          duracion: appt.duration,
          asistio: appt.attended,
          notasSeguimiento: appt.followUpNotes,
          primeravez: appt.primeravez,
        };
        await saveAppointment(citaData);
        emit(appt.id ? "appointment:updated" : "appointment:created", appt);
        await loadAgenda();
      } catch (error) {
        console.error(error);
        if (!appt.id)
          setAppointments((prev) => prev.filter((a) => a.id !== appt.id));
      }
      setModalAppt(null);
    },
    [saveAppointment, loadAgenda, emit],
  );

  const deleteAppt = useCallback(
    async (id: string) => {
      const appt = appointments.find((a) => a.id === id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      try {
        await deleteAppointment(parseInt(id));
        emit("appointment:deleted", appt);
        await loadAgenda();
      } catch (error) {
        console.error(error);
        if (appt) setAppointments((prev) => [...prev, appt]);
      }
      setModalAppt(null);
    },
    [deleteAppointment, loadAgenda, emit, appointments],
  );

  const moveAppt = useCallback(
    async (apptId: string, sourceDate: string, targetDate: string) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, date: targetDate } : a)),
      );
      try {
        // Si el backend requiere ISO, puedes hacer:
        // const targetISO = new Date(targetDate).toISOString();
        // await moveAppointment(parseInt(apptId), targetISO);
        // Si acepta YYYY-MM-DD, usa targetDate directamente:
        await moveAppointment(parseInt(apptId), targetDate);
        emit("appointment:moved", { apptId, from: sourceDate, to: targetDate });
        await loadAgenda();
      } catch (error) {
        console.error(error);
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, date: sourceDate } : a)),
        );
      }
    },
    [moveAppointment, loadAgenda, emit],
  );
  const saveClosure = useCallback(
    async (
      personId: string,
      closureData: Omit<Closure, "personId" | "closedAt">,
    ) => {
      const newClosure: Closure = {
        personId,
        ...closureData,
        closedAt: new Date().toISOString(),
      };
      setClosures((prev) => [
        ...prev.filter((c) => c.personId !== personId),
        newClosure,
      ]);
      try {
        await closeCase({
          personaId: parseInt(personId),
          diagnosticoFinal: closureData.finalDiagnosis,
          motivo: closureData.reason,
          otroMotivo: closureData.otherReason,
          fechaCierre: closureData.closureDate,
        });
        emit("case:closed", newClosure);
        await loadAgenda();
      } catch (error) {
        console.error(error);
        setClosures((prev) => prev.filter((c) => c.personId !== personId));
      }
      setClosureModalPerson(null);
      setPersonDetail(null);
    },
    [closeCase, loadAgenda, emit],
  );

  const updateQuickNote = useCallback(
    async (id: string, note: string) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, followUpNotes: note } : a)),
      );
      const appt = appointments.find((a) => a.id === id);
      if (appt) {
        try {
          const citaData = {
            id: parseInt(appt.id) || 0,
            personaId: appt.personId,
            fecha: appt.date,
            hora: appt.time,
            duracion: appt.duration,
            asistio: appt.attended,
            notasSeguimiento: note,
            primeravez: appt.primeravez, // 👈 Preserva el valor
          };
          await saveAppointment(citaData);
          await loadAgenda();
        } catch (error) {
          console.error(error);
        }
      }
      setQuickNote(null);
    },
    [appointments, saveAppointment, loadAgenda],
  );

  const todayKey = fmtDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
  const filteredPersons = persons.filter((p) => {
    if (!p?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    const edad = p.edad || calcularEdad(p.fechaNacimiento);
    if (filters.edadMin && edad && edad < parseInt(filters.edadMin))
      return false;
    if (filters.edadMax && edad && edad > parseInt(filters.edadMax))
      return false;
    if (filters.genero && p.genero !== filters.genero) return false;
    const isClosed = isPersonCaseClosed(p.id);
    if (filters.estado === "activos" && isClosed) return false;
    if (filters.estado === "cerrados" && !isClosed) return false;
    if (
      filters.obraSocial &&
      !p.obraSocial?.toLowerCase().includes(filters.obraSocial.toLowerCase())
    )
      return false;
    if (filters.psicologo && p.psicologoAsignado !== filters.psicologo)
      return false;
    return true;
  });
  const psicologosList = Array.from(
    new Set(appointments.map((a) => a.psicologoNombre).filter(Boolean)),
  ) as string[];
  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());
  const handleMonthYearSelect = (newYear: number, newMonth: number) =>
    setCurrentDate(new Date(newYear, newMonth, 1));
  const openApptModal = (
    appt: Appointment | null,
    dateKey: string,
    personId?: number,
  ) => {
    if (!appt && personId && isPersonCaseClosed(personId)) {
      Swal.fire({
        title: "Caso cerrado",
        text: "No se pueden agendar nuevas citas para un caso cerrado. Reabre el caso primero.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }
    setSelectedDayPanel(null);
    setPersonDetail(null);
    setClosureModalPerson(null);
    setModalAppt({ appt, dateKey, personId });
  };
  const openPersonDetail = (person: Person) => {
    setSelectedDayPanel(null);
    setModalAppt(null);
    setClosureModalPerson(null);
    setPersonDetail(person);
  };
  const openClosureModal = (person: Person) => {
    setSelectedDayPanel(null);
    setModalAppt(null);
    setPersonDetail(null);
    setClosureModalPerson(person);
  };
  const openDayPanel = (dateKey: string) => {
    setModalAppt(null);
    setPersonDetail(null);
    setClosureModalPerson(null);
    setSelectedDayPanel(dateKey);
  };
  const handlePersonDragStart = (e: React.DragEvent, personId: number) => {
    if (isPersonCaseClosed(personId)) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ personId }));
    e.dataTransfer.effectAllowed = "copy";
    (e.target as HTMLElement).style.opacity = "0.5";
  };
  const handleApptDragStart = (
    e: React.DragEvent,
    apptId: string,
    sourceDate: string,
  ) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ apptId, sourceDate }),
    );
    e.dataTransfer.effectAllowed = "move";
    (e.target as HTMLElement).style.opacity = "0.5";
  };
  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "";
  };
  const handleDropOnDay = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.apptId && data.sourceDate)
        moveAppt(data.apptId, data.sourceDate, targetDate);
      else if (data.personId) {
        if (isPersonCaseClosed(data.personId)) {
          Swal.fire({
            title: "Caso cerrado",
            text: "No se pueden agendar citas para un caso cerrado.",
            icon: "warning",
            confirmButtonText: "Entendido",
          });
          return;
        }
        openApptModal(null, targetDate, data.personId);
      }
    } catch (err) {}
  };
  const exportToExcel = () => {
    const data = appointments.map((appt) => {
      const person = persons.find((p) => p.id === appt.personId);
      return {
        Folio: appt.folio || "N/A",
        "Nombre del psicólogo": appt.psicologoNombre || "N/A",
        Fecha: appt.date,
        Hora: formatTo12Hour(appt.time),
        Persona: person?.nombre || "N/A",
        Edad: person?.edad || calcularEdad(person?.fechaNacimiento) || "N/A",
        Teléfono: person?.phone || "N/A",
        "Obra Social": person?.obraSocial || "N/A",
        "Duración (min)": appt.duration,
        Asistió: appt.attended ? "Sí" : "No",
        Notas: appt.followUpNotes || "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 30 },
      { wch: 8 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Citas");
    XLSX.writeFile(wb, `citas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const interviewData = UseInterview();

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f1f5f9" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "#3b82f6",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📅
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Agenda</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {appointments.length} citas
              </div>
            </div>
          </div>
          <Tooltip content="Reportes">
            <button
              onClick={() => setShowReportsModal(true)}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
              }}
            >
              <FaFileExcel size={16} color="#10b981" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
        {(filters.edadMin ||
          filters.edadMax ||
          filters.genero ||
          filters.estado !== "activos" ||
          filters.obraSocial ||
          filters.psicologo) && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
          >
            {filters.edadMin && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                Edad ≥ {filters.edadMin}
              </span>
            )}
            {filters.edadMax && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                Edad ≤ {filters.edadMax}
              </span>
            )}
            {filters.genero && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                Género: {filters.genero}
              </span>
            )}
            {filters.estado !== "activos" && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                Estado: {filters.estado}
              </span>
            )}
            {filters.obraSocial && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                OS: {filters.obraSocial}
              </span>
            )}
            {filters.psicologo && (
              <span
                style={{
                  background: "#e2e8f0",
                  padding: "4px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                Psicólogo: {filters.psicologo}
              </span>
            )}
            <button
              onClick={() =>
                setFilters({
                  edadMin: "",
                  edadMax: "",
                  genero: "",
                  estado: "activos",
                  obraSocial: "",
                  psicologo: "",
                })
              }
              style={{
                background: "#fee2e2",
                border: "none",
                borderRadius: 20,
                padding: "4px 8px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Limpiar todos ✕
            </button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar persona..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 16,
            marginBottom: 16,
          }}
        />
        {filteredPersons.map((p, i) => {
          const pal = PERSON_PALETTES[i % PERSON_PALETTES.length];
          const total = appointments.filter((a) => a.personId === p.id).length;
          const isClosed = isPersonCaseClosed(p.id);
          const esNuevo = p.fechaIngreso && daysSince(p.fechaIngreso) <= 30;
          const ultimaCita = appointments
            .filter((a) => a.personId === p.id)
            .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
          const inactivo = ultimaCita && daysSince(ultimaCita) > 30;
          return (
            <div
              key={p.id}
              draggable={!isClosed}
              onDragStart={(e) => handlePersonDragStart(e, p.id)}
              onDragEnd={handleDragEnd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 12,
                cursor: isClosed ? "default" : "grab",
                marginBottom: 8,
                background: isClosed ? "#fef3c7" : pal.bg,
                opacity: isClosed ? 0.7 : 1,
                position: "relative",
              }}
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
                openPersonDetail(p);
              }}
            >
              <Avatar name={p.nombre} palette={pal} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {p.nombre}{" "}
                  {p.edad && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: "normal",
                        color: pal.text,
                      }}
                    >
                      ({p.edad} años)
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {p.phone && (
                    <span>
                      <FaPhoneAlt size={10} /> {p.phone}
                    </span>
                  )}
                  {p.psicologoAsignado && (
                    <span>
                      <FaUserMd size={10} /> {p.psicologoAsignado}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: pal.text, marginTop: 2 }}>
                  {total} citas {isClosed && "🔒 Cerrado"}{" "}
                  {esNuevo && !isClosed && (
                    <span
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 12,
                        marginLeft: 8,
                      }}
                    >
                      NUEVO
                    </span>
                  )}{" "}
                  {inactivo && !isClosed && (
                    <span
                      style={{
                        background: "#f59e0b",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 12,
                        marginLeft: 8,
                      }}
                    >
                      INACTIVO
                    </span>
                  )}
                </div>
              </div>
              <span onClick={(e) => e.stopPropagation()}>
                <Tooltip content="PDF">
                  <CustomButton
                    variant="icon"
                    color="pink"
                    onClick={() => {
                      const item = interviewData.items.find(
                        (it) => it.id === p.id,
                      );
                      if (item) {
                        interviewData.setExtra(
                          "selectInterview",
                          item as unknown as EntrevistaShowResponse,
                        );
                        interviewData.setExtra("openCaratula",true);
                      }
                    }}
                  >
                    <FaFilePdf />
                  </CustomButton>
                </Tooltip>
              </span>
              <span style={{ fontSize: 18, color: "#9ca3af" }}>›</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          padding: 12,
          borderTop: "1px solid #f1f5f9",
          fontSize: 11,
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        {isMobile
          ? "Toca un día para agregar cita"
          : "Arrastra personas al calendario"}
      </div>
    </div>
  );

  if (loadingPersons && persons.length === 0)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Cargando agenda...
      </div>
    );

  if (showDashboard)
    return (
      <AdminDashboard
        appointments={appointments}
        persons={persons}
        closures={closures}
        onBack={() => setShowDashboard(false)}
        onUpdateNote={updateQuickNote}
      />
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f8fafc",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!isMobile && (
        <aside
          style={{
            width: 360,
            background: "#fff",
            borderRight: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {sidebarContent}
        </aside>
      )}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-start",
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: "85%",
              maxWidth: 320,
              background: "#fff",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #f1f5f9",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <HiMenu size={24} />
            </button>
          )}
          <button
            onClick={goPrevMonth}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 40,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <HiChevronLeft size={18} />
          </button>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {MONTHS[month]} <span style={{ color: "#3b82f6" }}>{year}</span>
            {!isMobile && (
              <button
                onClick={() => setShowMonthYearPicker(true)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 30,
                  padding: "4px 8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <HiCalendar size={14} />{" "}
                <span style={{ fontSize: 12 }}>cambiar</span>
              </button>
            )}
          </h2>
          <button
            onClick={goNextMonth}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 40,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <HiChevronRight size={18} />
          </button>
          <button
            onClick={goToday}
            style={{
              background: "#dbeafe",
              border: "none",
              borderRadius: 40,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hoy
          </button>
          <div style={{ flex: 1 }} />
          {/* <Tooltip content="Exportar citas a Excel">
            <CustomButton color="green" onClick={exportToExcel}>
              <RiFileExcelFill size={14} />
            </CustomButton>
          </Tooltip> */}
          <Tooltip content="Panel administrativo">
            <CustomButton color="green" onClick={() => setShowDashboard(true)}>
              <FaChartLine size={14} /> Administrativo
            </CustomButton>
          </Tooltip>
          <Tooltip content="Nueva cita">
            <button
              onClick={() => openApptModal(null, todayKey)}
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 40,
                padding: "8px 20px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <HiPlus size={16} /> Nueva
            </button>
          </Tooltip>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {!isMobile ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 8,
                minWidth: 700,
              }}
            >
              {DAYS_SHORT.map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    padding: 8,
                    color: "#4b5563",
                  }}
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth(year, month) }).map(
                (_, i) => (
                  <div
                    key={`empty-${i}`}
                    style={{
                      background: "#f9fafb",
                      borderRadius: 12,
                      minHeight: 100,
                    }}
                  />
                ),
              )}
              {daysOfMonth.map((day) => {
                const appts = getApptsByDate(day.dateKey);
                const todayFlag = isToday(day.date);
                return (
                  <div
                    key={day.dateKey}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: `1px solid ${todayFlag ? "#3b82f6" : "#f1f5f9"}`,
                      padding: 8,
                      minHeight: 120,
                      cursor: "pointer",
                      boxShadow: todayFlag ? "0 0 0 2px #3b82f6" : "none",
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropOnDay(e, day.dateKey)}
                    onClick={() => openDayPanel(day.dateKey)}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: todayFlag ? "#3b82f6" : "#1f2937",
                      }}
                    >
                      {day.date.getDate()}
                    </div>
                    {appts.slice(0, 3).map((a) => {
                      const p = persons.find((x) => x.id === a.personId);
                      if (!p) return null;
                      const pal = getPalette(a.personId);
                      const tooltipText = `${p.nombre}\n📞 ${p.phone || "Sin teléfono"}\n🎂 ${p.edad || calcularEdad(p.fechaNacimiento) || "N/A"} años\n🏥 ${p.obraSocial || "Sin OS"}\n👨‍⚕️ ${a.psicologoNombre || "N/A"}\n📝 ${a.followUpNotes?.substring(0, 50) || "Sin notas"}`;
                      return (
                        <div
                          key={a.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            handleApptDragStart(e, a.id, day.dateKey);
                          }}
                          onDragEnd={handleDragEnd}
                          style={{
                            background: pal.bg,
                            borderRadius: 8,
                            padding: "4px 8px",
                            marginBottom: 4,
                            fontSize: 12,
                            display: "flex",
                            justifyContent: "space-between",
                            cursor: "grab",
                            alignItems: "center",
                            borderLeft: `3px solid ${getColorByPsicologo(a.psicologoNombre)}`,
                            position: "relative",
                          }}
                          title={tooltipText}
                        >
                          <span
                            style={{
                              cursor: "pointer",
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openApptModal(a, day.dateKey);
                            }}
                          >
                            {formatTo12Hour(a.time)} {p.nombre}
                          </span>
                          <div
                            style={{ display: "flex", gap: 4, flexShrink: 0 }}
                          >
                            <AttendedBadge attended={a.attended} />
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const result = await Swal.fire({
                                  title: "¿Eliminar cita?",
                                  text: `¿Estás seguro de eliminar la cita de ${p.nombre} a las ${a.time}?`,
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  confirmButtonText: "Sí, eliminar",
                                });
                                if (result.isConfirmed) await deleteAppt(a.id);
                              }}
                              style={{
                                background: "#fee2e2",
                                border: "none",
                                borderRadius: 4,
                                padding: "2px 6px",
                                cursor: "pointer",
                                color: "#b91c1c",
                                fontSize: 10,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}{" "}
                    {appts.length > 3 && (
                      <div
                        style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}
                      >
                        +{appts.length - 3} más
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {daysOfMonth.map((day) => {
                const appts = getApptsByDate(day.dateKey);
                const todayFlag = isToday(day.date);
                return (
                  <div
                    key={day.dateKey}
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      border: todayFlag ? "1px solid #3b82f6" : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        background: todayFlag ? "#eff6ff" : "#f9fafb",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            marginRight: 8,
                          }}
                        >
                          {day.date.getDate()}
                        </span>
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                          {day.dayName}
                        </span>
                      </div>
                      <button
                        onClick={() => openApptModal(null, day.dateKey)}
                        style={{
                          background: "#dbeafe",
                          border: "none",
                          borderRadius: 40,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <HiPlus size={14} /> Agregar
                      </button>
                    </div>
                    <div style={{ padding: "12px 16px" }}>
                      {appts.length === 0 && (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "20px 0",
                          }}
                        >
                          Sin citas este día
                        </div>
                      )}
                      {appts.map((a) => {
                        const p = persons.find((x) => x.id === a.personId);
                        if (!p) return null;
                        const pal = getPalette(a.personId);
                        return (
                          <div
                            key={a.id}
                            style={{
                              background: pal.bg,
                              borderRadius: 16,
                              padding: 12,
                              marginBottom: 8,
                              borderLeft: `4px solid ${getColorByPsicologo(a.psicologoNombre)}`,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 6,
                              }}
                              onClick={() => openApptModal(a, day.dateKey)}
                            >
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>
                                  {a.time}
                                </span>{" "}
                                <span style={{ fontSize: 14, color: pal.text }}>
                                  • {p.nombre}
                                </span>
                              </div>
                              <AttendedBadge attended={a.attended} />
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: pal.text,
                                opacity: 0.8,
                              }}
                            >
                              {a.duration} min
                            </div>
                            {a.followUpNotes && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#4b5563",
                                  marginTop: 6,
                                  fontStyle: "italic",
                                }}
                              >
                                {a.followUpNotes}
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                marginTop: 12,
                              }}
                            >
                              <CustomButton
                                size="sm"
                                variant="outline"
                                onClick={() => openApptModal(a, day.dateKey)}
                              >
                                <HiPencilAlt size={14} /> Editar
                              </CustomButton>
                              <CustomButton
                                size="sm"
                                variant="solid"
                                color="ruby"
                                onClick={async () => {
                                  const result = await Swal.fire({
                                    title: "¿Eliminar cita?",
                                    text: `¿Estás seguro de eliminar la cita de ${p.nombre} a las ${a.time}?`,
                                    icon: "warning",
                                    showCancelButton: true,
                                  });
                                  if (result.isConfirmed)
                                    await deleteAppt(a.id);
                                }}
                              >
                                <HiTrash size={14} /> Eliminar
                              </CustomButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {showMonthYearPicker && (
        <MonthYearPicker
          year={year}
          month={month}
          onSelect={handleMonthYearSelect}
          onClose={() => setShowMonthYearPicker(false)}
        />
      )}
      {selectedDayPanel && !isMobile && (
        <DayPanelDesktop
          dateKey={selectedDayPanel}
          appointments={appointments}
          persons={persons}
          palettes={PERSON_PALETTES}
          onClose={() => setSelectedDayPanel(null)}
          onEdit={(appt) => {
            setSelectedDayPanel(null);
            openApptModal(appt, appt.date);
          }}
          onAdd={() => {
            setSelectedDayPanel(null);
            openApptModal(null, selectedDayPanel);
          }}
          onDelete={deleteAppt}
          onQuickNote={(appt) => setQuickNote(appt)}
        />
      )}
      {modalAppt && (
        <ApptModal
          appt={modalAppt.appt}
          persons={persons}
          dateKey={modalAppt.dateKey}
          defaultPersonId={modalAppt.personId}
          onSave={saveAppt}
          onDelete={deleteAppt}
          onClose={() => setModalAppt(null)}
        />
      )}
      {personDetail && (
        <PersonDetailModal
          person={personDetail}
          appointments={appointments}
          palettes={PERSON_PALETTES}
          personIndex={persons.findIndex((p) => p.id === personDetail.id)}
          onClose={() => setPersonDetail(null)}
          onEditAppt={(appt) => {
            setPersonDetail(null);
            openApptModal(appt, appt.date);
          }}
          onNewAppt={() => {
            setPersonDetail(null);
            openApptModal(null, todayKey, personDetail.id);
          }}
          onClosure={() => openClosureModal(personDetail)}
          onReabrirCaso={() =>
            reabrirCasoConConfirmacion(personDetail.id, personDetail.nombre)
          }
          closureInfo={getClosureForPerson(personDetail.id)}
        />
      )}
      {closureModalPerson && (
        <ClosureModal
          person={closureModalPerson}
          onSave={(data) => saveClosure(String(closureModalPerson.id), data)}
          onClose={() => setClosureModalPerson(null)}
        />
      )}
      {isModalOpenPsychological && <PsychologicalForm />}
      {showReportsModal && (
        <ReportsModal
          appointments={appointments}
          persons={persons}
          closures={closures}
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {quickNote && (
        <QuickNoteModal
          appointment={quickNote}
          onSave={updateQuickNote}
          onClose={() => setQuickNote(null)}
        />
      )}
    </div>
  );
};

export default AgendaPro;
