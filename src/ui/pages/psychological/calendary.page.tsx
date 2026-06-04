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
} from "react-icons/hi";

import CustomButton from "../../components/button/custombuttom";
import {
  FormikInput,
  FormikAutocomplete,
  FormikTextArea,
  FormikDatePicker,
} from "../../formik/FormikInputs/FormikInput";
import FormikForm from "../../formik/Formik";
import CustomModal from "../../components/modal/modal";
import UsePsychologicalEvaluationModuleData from "../../hooks/psychologicalevaluationmodule/usepsychologicalevaluationmoduledata";
import UsePsychologicalEvaluationModuleDiaryData from "../../hooks/psychologicalevaluationmodulediary/usepsychologicalevaluationmodulediarydata";
import Swal from "sweetalert2";

// ---------- Tipos ----------
interface Person {
  id: number;
  nombre: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Appointment {
  id: string;
  personId: number;
  date: string;
  time: string;
  duration: number;
  attended: boolean;
  followUpNotes: string;
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

// ---------- Constantes ----------
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
  "Conclusión del proceso",
  "Usuaria ya no acudio",
  "Usuaria referenciada a otra instancia",
  "Otro",
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

// ---------- Componente Switch personalizado ----------
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

// ---------- Componentes visuales auxiliares ----------
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

// ---------- Modal de selección de mes/año ----------
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

// ---------- Panel lateral de día (escritorio) ----------
const DayPanelDesktop: React.FC<{
  dateKey: string;
  appointments: Appointment[];
  persons: Person[];
  palettes: Palette[];
  onClose: () => void;
  onEdit: (appt: Appointment) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}> = ({
  dateKey,
  appointments,
  persons,
  palettes,
  onClose,
  onEdit,
  onAdd,
  onDelete,
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
                borderLeft: `4px solid ${pal.dot}`,
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
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

// ---------- Modal de cita ----------
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
  onSave: (form: Appointment) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}> = ({ appt, persons, dateKey, onSave, onDelete, onClose }) => {
  const isNew = !appt;
  const initialValues: Appointment = appt || {
    id: uid(),
    personId: persons[0]?.id || 0,
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
        {() => (
          <>
            <FormikAutocomplete
              name="personId"
              label="Persona"
              options={persons.map((p) => ({ value: p.id, label: p.nombre }))}
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

// ---------- Modal de cierre de caso ----------
const ClosureSchema = Yup.object({
  finalDiagnosis: Yup.string().required("Requerido"),
  reason: Yup.string().required("Requerido"),
  otherReason: Yup.string().when("reason", {
    is: "Otro",
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
              values.reason === "Otro" ? values.otherReason : undefined,
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
                if (val !== "Otro") setFieldValue("otherReason", "");
              }}
            />
            {values.reason === "Otro" && (
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

// ---------- Modal de detalle de persona (con Reabrir caso) ----------
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
  const isMobile = window.innerWidth < 768;

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
          }}
        >
          <Avatar name={person.nombre} palette={palette} size={56} />
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: palette.text }}>
              {person.nombre}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: palette.text,
                opacity: 0.8,
              }}
            >
              {personAppts.length} citas totales • {upcoming.length} próximas
            </p>
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
                <CustomButton
                  variant="solid"
                  color="amber"
                  size="sm"
                  onClick={onReabrirCaso}
                >
                  <HiX size={14} /> Reabrir caso
                </CustomButton>
              ) : (
                <CustomButton
                  variant="solid"
                  color="amber"
                  size="sm"
                  onClick={onClosure}
                >
                  <HiX size={14} /> Cerrar caso
                </CustomButton>
              )}
              <CustomButton
                variant="solid"
                size="sm"
                onClick={() => onNewAppt(person.id)}
                disabled={!!closureInfo}
             
              >
                <HiPlus size={14} /> Nueva cita
              </CustomButton>
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
                  {a.time} • {a.duration} min
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

// ---------- Componente principal AgendaPro ----------
const AgendaPro: React.FC<AgendaProProps> = ({
  initialPersons,
  initialAppointments,
  initialClosures = [],
  onEvent = () => {},
}) => {
  // Hooks
  const {
    getDiary,
    listDiary,
    loading: loadingPersons,
  } = UsePsychologicalEvaluationModuleData();
  const {
    items: listAppointments,
    saveAppointment,
    deleteAppointment,
    moveAppointment,
    closeCase,
    reabrirCaso,
    loadAgenda,
    loading: loadingAppointments,
    agendaData, // ✅ también útil para obtener datos actualizados
    closures: closuresFromHook, // ✅ obtener closures directamente del hook
  } = UsePsychologicalEvaluationModuleDiaryData();

  // Estados locales
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
  } | null>(null);
  const [personDetail, setPersonDetail] = useState<Person | null>(null);
  const [closureModalPerson, setClosureModalPerson] = useState<Person | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [selectedDayPanel, setSelectedDayPanel] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialPersons === undefined && getDiary) getDiary();
    if (initialAppointments === undefined && loadAgenda) loadAgenda();
  }, [getDiary, loadAgenda]);

  // Sincronizar personas desde el hook
  useEffect(() => {
    if (listDiary && listDiary.length > 0 && initialPersons === undefined) {
      setPersons(listDiary);
    }
  }, [listDiary, initialPersons]);

  // Sincronizar citas desde el hook
  // Sincronizar closures desde el hook
  useEffect(() => {
    if (
      closuresFromHook &&
      closuresFromHook.length > 0 &&
      initialClosures === undefined
    ) {
      const transformedClosures: Closure[] = closuresFromHook.map((c: any) => ({
        personId: String(c.personaId || c.personId),
        finalDiagnosis: c.diagnosticoFinal || c.finalDiagnosis,
        reason: c.motivo || c.reason,
        otherReason: c.otroMotivo || c.otherReason,
        closureDate: c.fechaCierre || c.closureDate,
        closedAt: c.cerradoEn || c.closedAt,
      }));
      setClosures(transformedClosures);
    }
  }, [closuresFromHook, initialClosures]);

  // También puedes sincronizar cuando se recarga la agenda
  useEffect(() => {
    if (
      agendaData?.cierres &&
      agendaData.cierres.length > 0 &&
      initialClosures === undefined
    ) {
      const transformedClosures: Closure[] = agendaData.cierres.map(
        (c: any) => ({
          personId: String(c.personaId || c.personId),
          finalDiagnosis: c.diagnosticoFinal || c.finalDiagnosis,
          reason: c.motivo || c.reason,
          otherReason: c.otroMotivo || c.otherReason,
          closureDate: c.fechaCierre || c.closureDate,
          closedAt: c.cerradoEn || c.closedAt,
        }),
      );
      setClosures(transformedClosures);
    }
  }, [agendaData?.cierres, initialClosures]);
  useEffect(() => {
    const citasArray = listAppointments?.[0]?.citas;
    if (
      citasArray &&
      Array.isArray(citasArray) &&
      citasArray.length > 0 &&
      initialAppointments === undefined
    ) {
      const transformedAppointments: Appointment[] = citasArray.map(
        (c: any) => ({
          id: String(c.id),
          personId: c.personaId,
          date: c.fecha,
          time: c.hora,
          duration: c.duracion,
          attended: c.asistio,
          followUpNotes: c.notasSeguimiento || "",
        }),
      );
      setAppointments(transformedAppointments);
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

  // Verificar si una persona tiene caso cerrado
  const isPersonCaseClosed = useCallback(
    (personId: number) => {
      return !!getClosureForPerson(personId);
    },
    [closures],
  );
  // ---------- Función para formatear hora a 12 horas ----------
  const formatTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  // Reabrir caso con confirmación
  // Reabrir caso con confirmación
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

        // ✅ Actualizar estado local inmediatamente
        setClosures((prev) =>
          prev.filter((c) => c.personId !== String(personId)),
        );

        // ✅ Cerrar ambos modales
        setPersonDetail(null); // Cierra el modal de detalle de persona
        setClosureModalPerson(null); // Cierra el modal de cierre (por si acaso)

        // Recargar datos completos para sincronizar
        await loadAgenda();
      } catch (error) {
        console.error("Error reopening case:", error);
      }
    },
    [reabrirCaso, loadAgenda],
  );

  // Guardar cita
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
          fecha: appt.date,
          hora: appt.time,
          duracion: appt.duration,
          asistio: appt.attended,
          notasSeguimiento: appt.followUpNotes,
        };
        await saveAppointment(citaData);
        emit(appt.id ? "appointment:updated" : "appointment:created", appt);
        await loadAgenda();
      } catch (error) {
        console.error("Error saving appointment:", error);
        if (!appt.id)
          setAppointments((prev) => prev.filter((a) => a.id !== appt.id));
      }
      setModalAppt(null);
    },
    [saveAppointment, loadAgenda, emit],
  );

  // Eliminar cita
  const deleteAppt = useCallback(
    async (id: string) => {
      const appt = appointments.find((a) => a.id === id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      try {
        await deleteAppointment(parseInt(id));
        emit("appointment:deleted", appt);
        await loadAgenda();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        if (appt) setAppointments((prev) => [...prev, appt]);
      }
      setModalAppt(null);
    },
    [deleteAppointment, loadAgenda, emit, appointments],
  );

  // Mover cita
  const moveAppt = useCallback(
    async (apptId: string, sourceDate: string, targetDate: string) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, date: targetDate } : a)),
      );
      try {
        await moveAppointment(parseInt(apptId), targetDate);
        emit("appointment:moved", { apptId, from: sourceDate, to: targetDate });
        await loadAgenda();
      } catch (error) {
        console.error("Error moving appointment:", error);
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, date: sourceDate } : a)),
        );
      }
    },
    [moveAppointment, loadAgenda, emit],
  );

  // Cerrar caso
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
        console.error("Error closing case:", error);
        setClosures((prev) => prev.filter((c) => c.personId !== personId));
      }
      setClosureModalPerson(null);
      setPersonDetail(null);
    },
    [closeCase, loadAgenda, emit],
  );

  const todayKey = fmtDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
  const filteredPersons = persons.filter((p) =>
    p?.nombre?.toLowerCase()?.includes(searchTerm.toLowerCase()),
  );

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
    setModalAppt({ appt, dateKey });
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
      if (data.apptId && data.sourceDate) {
        moveAppt(data.apptId, data.sourceDate, targetDate);
      } else if (data.personId) {
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

  if (loadingPersons && persons.length === 0) {
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
  }

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f1f5f9" }}
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
            <div style={{ fontWeight: 800, fontSize: 18 }}>AgendaPro</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {appointments.length} citas
            </div>
          </div>
        </div>
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
                marginBottom: 4,
                background: isClosed ? "#fef3c7" : "transparent",
                opacity: isClosed ? 0.7 : 1,
              }}
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
                openPersonDetail(p);
              }}
            >
              <Avatar name={p.nombre} palette={pal} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {total} total
                  {isClosed && (
                    <span style={{ color: "#f59e0b", marginLeft: 8 }}>
                      {" "}
                      🔒 Cerrado
                    </span>
                  )}
                </div>
              </div>
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
            width: 300,
            background: "#fff",
            borderRight: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
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
                          }}
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
                                  cancelButtonColor: "#3085d6",
                                  confirmButtonText: "Sí, eliminar",
                                  cancelButtonText: "Cancelar",
                                });
                                if (result.isConfirmed) {
                                  await deleteAppt(a.id);
                                  Swal.fire(
                                    "Eliminada",
                                    "La cita ha sido eliminada.",
                                    "success",
                                  );
                                }
                              }}
                              style={{
                                background: "#fee2e2",
                                border: "none",
                                borderRadius: 4,
                                padding: "2px 6px",
                                cursor: "pointer",
                                color: "#b91c1c",
                                fontSize: 10,
                                marginLeft: 4,
                              }}
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                              borderLeft: `4px solid ${pal.dot}`,
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
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#3085d6",
                                    confirmButtonText: "Sí, eliminar",
                                    cancelButtonText: "Cancelar",
                                  });
                                  if (result.isConfirmed) {
                                    await deleteAppt(a.id);
                                    Swal.fire(
                                      "Eliminada",
                                      "La cita ha sido eliminada.",
                                      "success",
                                    );
                                  }
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
        />
      )}
      {modalAppt && (
        <ApptModal
          appt={modalAppt.appt}
          persons={persons}
          dateKey={modalAppt.dateKey}
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
          onNewAppt={(personId) => {
            setPersonDetail(null);
            openApptModal(null, todayKey);
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
    </div>
  );
};;;;

export default AgendaPro;
