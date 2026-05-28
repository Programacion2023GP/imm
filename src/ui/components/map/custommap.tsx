import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  MapPin,
  AlertTriangle,
  X,
  ChevronRight,
  BarChart3,
  Shield,
  Navigation,
  Filter,
  Search,
  Menu,
} from "lucide-react";
import { theme } from "../../../config/themes";

// Definir interfaces TypeScript
interface Penalty {
  id: string;
  name: string;
  city: string;
  cp: string;
  date: string;
  time: string;
  amountAlcohol: number;
  lat: number;
  lon: number;
  vehicleType?: string;
  licensePlate?: string;
  officer?: string;
  current_process_id: number;
  finish: number; // 0 = en proceso, 1 = finalizado
  [key: string]: any;
}

interface LocationGroup {
  cp: string;
  city: string;
  penalties: Penalty[];
  center: {
    lat: number;
    lon: number;
  };
  stats: {
    total: number;
    contraloria: number;
    transito: number;
    seguridad: number;
    juzgados: number;
    desconocido: number;
    enProceso: number;
    finalizados: number;
  };
}

interface CustomMapProps {
  penaltiesData: Penalty[];
  onCaseSelect?: (penalty: Penalty) => void;
}

// Función para determinar el nivel basado en current_process_id
const getRiskLevel = (current_process_id: number, finish?: number) => {
  let baseConfig;

  if (current_process_id === 1)
    baseConfig = {
      level: "Contraloría",
      color: theme.colors.status.error,
      bgColor: `${theme.colors.status.error}33`,
      textColor: theme.colors.status.error,
      markerColor: theme.colors.status.error,
      gradientColor: theme.colors.status.error + "80",
    };
  else if (current_process_id === 2)
    baseConfig = {
      level: "Tránsito y Vialidad",
      color: theme.colors.status.warning,
      bgColor: `${theme.colors.status.warning}33`,
      textColor: theme.colors.status.warning,
      markerColor: theme.colors.status.warning,
      gradientColor: theme.colors.status.warning + "80",
    };
  else if (current_process_id === 3)
    baseConfig = {
      level: "Seguridad Pública",
      color: theme.colors.status.info,
      bgColor: `${theme.colors.status.info}33`,
      textColor: theme.colors.status.info,
      markerColor: theme.colors.status.info,
      gradientColor: theme.colors.status.info + "80",
    };
  else if (current_process_id === 4)
    baseConfig = {
      level: "Juzgados",
      color: theme.colors.secondary.DEFAULT,
      bgColor: `${theme.colors.secondary.DEFAULT}33`,
      textColor: theme.colors.secondary.DEFAULT,
      markerColor: theme.colors.secondary.DEFAULT,
      gradientColor: theme.colors.secondary.DEFAULT + "80",
    };
  else
    baseConfig = {
      level: "Desconocido",
      color: theme.colors.neutral[500],
      bgColor: `${theme.colors.neutral[500]}33`,
      textColor: theme.colors.text.disabled,
      markerColor: theme.colors.neutral[500],
      gradientColor: theme.colors.neutral[500] + "80",
    };

  if (finish === 0) {
    return {
      ...baseConfig,
      level: `${baseConfig.level} (En proceso)`,
      isInProcess: true,
    };
  }

  return {
    ...baseConfig,
    isInProcess: false,
  };
};

const CustomMap = ({ penaltiesData, onCaseSelect }: CustomMapProps) => {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationGroup | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "analytics" | "documents"
  >("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mapViewState, setMapViewState] = useState({
    longitude: -103.4586,
    latitude: 25.6596,
    zoom: 12,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calcular estadísticas para cada ubicación
  const locationGroups: LocationGroup[] = useMemo(() => {
    const grouped = penaltiesData.reduce(
      (acc: { [key: string]: LocationGroup }, penalty) => {
        const key = penalty.cp;
        if (!acc[key]) {
          acc[key] = {
            cp: penalty.cp,
            city: penalty.city,
            penalties: [],
            center: { lat: penalty.lat, lon: penalty.lon },
            stats: {
              total: 0,
              contraloria: 0,
              transito: 0,
              seguridad: 0,
              juzgados: 0,
              desconocido: 0,
              enProceso: 0,
              finalizados: 0,
            },
          };
        }
        acc[key].penalties.push(penalty);
        return acc;
      },
      {},
    );

    return Object.values(grouped).map((location) => {
      const penalties = location.penalties;
      const stats = {
        total: penalties.length,
        contraloria: penalties.filter((p) => p.current_process_id === 1).length,
        transito: penalties.filter((p) => p.current_process_id === 2).length,
        seguridad: penalties.filter((p) => p.current_process_id === 3).length,
        juzgados: penalties.filter((p) => p.current_process_id === 4).length,
        desconocido: penalties.filter(
          (p) => ![1, 2, 3, 4].includes(p.current_process_id),
        ).length,
        enProceso: penalties.filter((p) => p.finish === 0).length,
        finalizados: penalties.filter((p) => p.finish === 1).length,
      };

      return {
        ...location,
        stats,
      };
    });
  }, [penaltiesData]);

  // Filtrar ubicaciones basado en búsqueda
  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locationGroups;
    return locationGroups.filter(
      (location) =>
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.cp.includes(searchTerm) ||
        location.penalties.some(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.includes(searchTerm),
        ),
    );
  }, [locationGroups, searchTerm]);

  // Función para determinar el color del marcador basado en la distribución de procesos
  const getLocationColor = (location: LocationGroup) => {
    if (location.stats.contraloria > 0) return theme.colors.status.error;
    if (location.stats.transito > 0) return theme.colors.status.warning;
    if (location.stats.seguridad > 0) return theme.colors.status.info;
    if (location.stats.juzgados > 0) return theme.colors.secondary.DEFAULT;
    return theme.colors.status.success;
  };

  // Función para obtener el gradiente del marcador
  const getMarkerGradient = (penalty: Penalty) => {
    const risk = getRiskLevel(penalty.current_process_id, penalty.finish);

    if (penalty.finish === 0) {
      return `linear-gradient(135deg, ${risk.markerColor} 0%, ${risk.gradientColor} 100%)`;
    }

    return risk.markerColor;
  };

  // Mover el mapa a una ubicación específica
  const flyToLocation = useCallback((location: LocationGroup) => {
    setMapViewState({
      longitude: location.center.lon,
      latitude: location.center.lat,
      zoom: 14,
    });
  }, []);

  const openPenaltyModal = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setShowModal(true);
    setPopupVisible(false);
    onCaseSelect?.(penalty);
  };

  const handleMarkerClick = (location: LocationGroup) => {
    setSelectedLocation(location);
    setPopupVisible(true);
    flyToLocation(location);

    if (isMobile) {
      setMobilePanelOpen(false);
    }
  };

  const handleLocationSelect = (location: LocationGroup) => {
    setSelectedLocation(location);
    flyToLocation(location);

    if (isMobile) {
      setMobilePanelOpen(true);
    }
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
    setPopupVisible(false);
    if (isMobile) {
      setMobilePanelOpen(false);
    }
  };

  const handleCloseMobilePanel = () => {
    setMobilePanelOpen(false);
    setSelectedLocation(null);
  };

  // Navegación entre casos en la misma ubicación
  const navigateCase = (direction: "prev" | "next") => {
    if (!selectedLocation || !selectedPenalty) return;

    const currentIndex = selectedLocation.penalties.findIndex(
      (p) => p.id === selectedPenalty.id,
    );
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % selectedLocation.penalties.length;
    } else {
      newIndex =
        (currentIndex - 1 + selectedLocation.penalties.length) %
        selectedLocation.penalties.length;
    }

    setSelectedPenalty(selectedLocation.penalties[newIndex]);
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: theme.colors.primary.dark }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex justify-between items-center"
        style={{
          borderBottomColor: `${theme.colors.primary.DEFAULT}40`,
          background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}, ${theme.colors.primary.dark}, ${theme.colors.secondary.dark})`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: `${theme.colors.text.inverse}10` }}
          >
            <Navigation
              className="w-6 h-6"
              style={{ color: theme.colors.text.inverse }}
            />
          </div>
          <div className="hidden sm:block">
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: theme.colors.text.inverse }}
            >
              Sistema de Monitoreo de Infracciones
            </h2>
            <p
              className="text-sm flex items-center gap-2"
              style={{ color: `${theme.colors.text.inverse}cc` }}
            >
              <Shield className="w-4 h-4" />
              {penaltiesData.length} casos registrados • {locationGroups.length}{" "}
              zonas monitorizadas
            </p>
          </div>
          <div className="sm:hidden">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: theme.colors.text.inverse }}
            >
              Monitoreo de Infracciones
            </h2>
            <p
              className="text-xs"
              style={{ color: `${theme.colors.text.inverse}cc` }}
            >
              {penaltiesData.length} casos • {locationGroups.length} zonas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: theme.colors.text.disabled }}
            />
            <input
              type="text"
              placeholder="Buscar ciudad, CP o folio..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-2 w-64"
              style={{
                background: `${theme.colors.text.inverse}10`,
                borderColor: `${theme.colors.text.inverse}20`,
                color: theme.colors.text.inverse,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 rounded-lg transition"
            style={{ background: `${theme.colors.text.inverse}10` }}
          >
            <Filter
              className="w-5 h-5"
              style={{ color: theme.colors.text.inverse }}
            />
          </button>
          {isMobile && (
            <button
              onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
              className="p-2 rounded-lg transition"
              style={{ background: `${theme.colors.text.inverse}10` }}
            >
              <Menu
                className="w-5 h-5"
                style={{ color: theme.colors.text.inverse }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda móvil */}
      {isMobile && (
        <div
          className="p-3 border-b"
          style={{
            borderBottomColor: `${theme.colors.border.DEFAULT}40`,
            background: theme.colors.background.surface,
          }}
        >
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: theme.colors.text.disabled }}
            />
            <input
              type="text"
              placeholder="Buscar ciudad, CP o folio..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{
                background: theme.colors.background.card,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Panel lateral para desktop */}
        {!isMobile && (
          <div
            className="w-96 border-r overflow-y-auto flex-shrink-0"
            style={{
              borderRightColor: theme.colors.border.DEFAULT,
              background: theme.colors.background.surface,
            }}
          >
            {selectedLocation ? (
              <div className="h-full flex flex-col">
                <div
                  className="p-4 border-b flex-shrink-0"
                  style={{
                    borderBottomColor: theme.colors.border.DEFAULT,
                    background: theme.colors.background.card,
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-lg flex items-center gap-2 truncate"
                        style={{ color: theme.colors.primary.DEFAULT }}
                      >
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">
                          {selectedLocation.city}
                        </span>
                      </h3>
                      <p
                        className="text-sm truncate"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Código Postal: {selectedLocation.cp}
                      </p>
                    </div>
                    <button
                      onClick={handleClosePanel}
                      className="p-1 flex-shrink-0 ml-2"
                      style={{ color: theme.colors.text.disabled }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{
                        background: `${theme.colors.primary.DEFAULT}20`,
                      }}
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {selectedLocation.stats.total}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Total Casos
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.status.warning}40, ${theme.colors.status.warning}20)`,
                      }}
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.status.warning }}
                      >
                        {selectedLocation.stats.enProceso}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        En Proceso
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: `${theme.colors.status.success}20` }}
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.status.success }}
                      >
                        {selectedLocation.stats.finalizados}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Finalizados
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: `${theme.colors.status.error}20` }}
                    >
                      <div
                        className="text-xl font-bold"
                        style={{ color: theme.colors.status.error }}
                      >
                        {selectedLocation.stats.contraloria}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Contraloría
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: `${theme.colors.status.warning}20` }}
                    >
                      <div
                        className="text-xl font-bold"
                        style={{ color: theme.colors.status.warning }}
                      >
                        {selectedLocation.stats.transito}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Tránsito
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: `${theme.colors.status.info}20` }}
                    >
                      <div
                        className="text-xl font-bold"
                        style={{ color: theme.colors.status.info }}
                      >
                        {selectedLocation.stats.seguridad}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Seguridad
                      </div>
                    </div>
                    {selectedLocation.stats.juzgados > 0 && (
                      <div
                        className="rounded-lg p-3 text-center"
                        style={{
                          background: `${theme.colors.secondary.DEFAULT}20`,
                        }}
                      >
                        <div
                          className="text-xl font-bold"
                          style={{ color: theme.colors.secondary.DEFAULT }}
                        >
                          {selectedLocation.stats.juzgados}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: theme.colors.text.disabled }}
                        >
                          Juzgados
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <h4
                    className="font-semibold mb-3 flex items-center justify-between"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    <span>Casos en esta zona</span>
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.text.disabled }}
                    >
                      {selectedLocation.penalties.length} casos
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {selectedLocation.penalties.map((penalty) => {
                      const risk = getRiskLevel(
                        penalty.current_process_id,
                        penalty.finish,
                      );
                      return (
                        <div
                          key={penalty.id}
                          onClick={() => openPenaltyModal(penalty)}
                          className={`p-3 rounded-lg cursor-pointer transition border ${
                            penalty.finish === 0 ? "border-dashed" : ""
                          }`}
                          style={{
                            borderColor:
                              penalty.finish === 0
                                ? `${theme.colors.status.warning}80`
                                : theme.colors.border.DEFAULT,
                            background:
                              penalty.finish === 0
                                ? `linear-gradient(135deg, ${theme.colors.background.card}, ${theme.colors.status.warning}10)`
                                : theme.colors.background.card,
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-sm font-semibold truncate"
                                style={{ color: theme.colors.text.primary }}
                              >
                                Folio {penalty.id}
                              </div>
                              <div
                                className="text-xs truncate"
                                style={{ color: theme.colors.text.secondary }}
                              >
                                {penalty.name}
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2`}
                              style={{
                                background: risk.bgColor,
                                color: risk.textColor,
                              }}
                            >
                              {risk.level}
                            </div>
                          </div>
                          <div
                            className="flex items-center justify-between text-xs"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            <span>{penalty.date}</span>
                            <span>{penalty.time}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div
                              className="text-xs"
                              style={{ color: theme.colors.text.disabled }}
                            >
                              Alcohol: {penalty.amountAlcohol} mg/L
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${
                                penalty.finish === 0
                                  ? `bg-${theme.colors.status.warning}/20 text-${theme.colors.status.warning}`
                                  : `bg-${theme.colors.status.success}/20 text-${theme.colors.status.success}`
                              }`}
                              style={{
                                background:
                                  penalty.finish === 0
                                    ? `${theme.colors.status.warning}20`
                                    : `${theme.colors.status.success}20`,
                                color:
                                  penalty.finish === 0
                                    ? theme.colors.status.warning
                                    : theme.colors.status.success,
                              }}
                            >
                              {penalty.finish === 0
                                ? "🔄 En proceso"
                                : "✅ Finalizado"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 h-full overflow-y-auto">
                <div
                  className="p-4 rounded-2xl mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary.DEFAULT}10, ${theme.colors.secondary.DEFAULT}10)`,
                  }}
                >
                  <MapPin
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: theme.colors.primary.DEFAULT }}
                  />
                  <h3
                    className="font-bold text-lg mb-2 text-center"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Sistema de Geolocalización
                  </h3>
                  <p
                    className="text-sm text-center"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Selecciona un marcador en el mapa para visualizar los casos
                  </p>
                </div>

                <div
                  className="rounded-xl p-4 text-left mb-4"
                  style={{ background: `${theme.colors.primary.DEFAULT}10` }}
                >
                  <h4
                    className="font-semibold mb-3 flex items-center gap-2"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Resumen General
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredLocations.map((location) => (
                      <div
                        key={location.cp}
                        className="flex justify-between items-center p-2 rounded-lg cursor-pointer transition"
                        style={{ color: theme.colors.text.primary }}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium block truncate">
                            {location.city}
                          </span>
                          <div
                            className="text-xs truncate"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            CP: {location.cp}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div
                            className="text-sm font-semibold whitespace-nowrap"
                            style={{ color: theme.colors.primary.DEFAULT }}
                          >
                            {location.stats.total} casos
                          </div>
                          <div className="text-xs whitespace-nowrap flex flex-wrap gap-1 justify-end">
                            {location.stats.enProceso > 0 && (
                              <span
                                className="px-1 rounded text-xs"
                                style={{
                                  background: `${theme.colors.status.warning}30`,
                                  color: theme.colors.status.warning,
                                }}
                              >
                                {location.stats.enProceso} en proceso
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: `${theme.colors.primary.DEFAULT}10` }}
                >
                  <h4
                    className="font-semibold mb-3 flex items-center gap-2"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Estados del Proceso
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.status.warning}, ${theme.colors.status.warning}80)`,
                            }}
                          ></div>
                          <span
                            className="text-sm"
                            style={{ color: theme.colors.text.primary }}
                          >
                            En Proceso
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: theme.colors.status.success }}
                          ></div>
                          <span
                            className="text-sm"
                            style={{ color: theme.colors.text.primary }}
                          >
                            Finalizado
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="pt-2 border-t"
                      style={{ borderTopColor: theme.colors.border.DEFAULT }}
                    >
                      <h5
                        className="text-xs mb-2"
                        style={{ color: theme.colors.text.disabled }}
                      >
                        Colores por proceso:
                      </h5>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: theme.colors.status.error }}
                          ></div>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            Contraloría
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: theme.colors.status.warning }}
                          ></div>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            Tránsito
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: theme.colors.status.info }}
                          ></div>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            Seguridad
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: theme.colors.secondary.DEFAULT,
                            }}
                          ></div>
                          <span
                            className="text-xs"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            Juzgados
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel móvil overlay */}
        {isMobile && mobilePanelOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex">
            <div
              className="w-4/5 max-w-sm h-full overflow-y-auto"
              style={{ background: theme.colors.background.surface }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  borderBottomColor: theme.colors.border.DEFAULT,
                  background: theme.colors.primary.DEFAULT,
                }}
              >
                <h3
                  className="font-bold"
                  style={{ color: theme.colors.text.inverse }}
                >
                  Panel de Navegación
                </h3>
                <button
                  onClick={handleCloseMobilePanel}
                  style={{ color: theme.colors.text.inverse }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.cp}
                      className="p-3 rounded-lg cursor-pointer transition border"
                      style={{
                        background: `${theme.colors.primary.DEFAULT}10`,
                        borderColor: theme.colors.border.DEFAULT,
                      }}
                      onClick={() => {
                        handleLocationSelect(location);
                        handleCloseMobilePanel();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-sm font-semibold truncate"
                            style={{ color: theme.colors.text.primary }}
                          >
                            {location.city}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: theme.colors.text.disabled }}
                          >
                            CP: {location.cp}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div
                            className="text-sm font-semibold"
                            style={{ color: theme.colors.primary.DEFAULT }}
                          >
                            {location.stats.total} casos
                          </div>
                          <div className="text-xs flex flex-wrap gap-1 justify-end">
                            {location.stats.enProceso > 0 && (
                              <span
                                className="px-1 rounded text-xs"
                                style={{
                                  background: `${theme.colors.status.warning}30`,
                                  color: theme.colors.status.warning,
                                }}
                              >
                                {location.stats.enProceso} en proceso
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1" onClick={handleCloseMobilePanel}></div>
          </div>
        )}

        {/* Mapa - Siempre visible */}
        <div className="flex-1 relative min-h-[500px] lg:min-h-[600px]">
          <Map
            {...mapViewState}
            onMove={(evt) => setMapViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          >
            {filteredLocations.map((location) => (
              <Marker
                key={location.cp}
                longitude={location.center.lon}
                latitude={location.center.lat}
              >
                <div
                  className="cursor-pointer transition-all duration-300 hover:scale-125 relative group"
                  onClick={() => handleMarkerClick(location)}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-2xl relative z-10 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${getLocationColor(location)} 0%, #000 70%)`,
                      boxShadow: `0 0 0 0px ${getLocationColor(location)}40, 0 4px 12px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {location.stats.total}
                  </div>
                  <div
                    className="absolute inset-0 w-8 h-8 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: getLocationColor(location) }}
                  ></div>
                </div>
              </Marker>
            ))}

            {/* Popup para desktop */}
            {popupVisible && selectedLocation && (
              <Popup
                longitude={selectedLocation.center.lon}
                latitude={selectedLocation.center.lat}
                anchor="top"
                onClose={handleClosePopup}
                closeButton={true}
                closeOnClick={false}
                className="custom-popup"
                maxWidth="300px"
              >
                <div
                  className="w-full max-w-[280px]"
                  style={{
                    background: theme.colors.background.card,
                    color: theme.colors.text.primary,
                  }}
                >
                  <div
                    className="p-4 border-b rounded-t-xl"
                    style={{
                      borderBottomColor: theme.colors.border.DEFAULT,
                      background: `linear-gradient(135deg, ${theme.colors.background.surface}, ${theme.colors.background.card})`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: `${theme.colors.primary.DEFAULT}20`,
                        }}
                      >
                        <MapPin
                          className="w-5 h-5"
                          style={{ color: theme.colors.primary.DEFAULT }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold truncate text-sm"
                          style={{ color: theme.colors.primary.DEFAULT }}
                        >
                          {selectedLocation.city}
                        </h3>
                        <p
                          className="text-xs truncate"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          CP: {selectedLocation.cp}
                        </p>
                        <div
                          className="flex items-center gap-2 mt-2 text-xs flex-wrap"
                          style={{ color: theme.colors.text.disabled }}
                        >
                          <span>{selectedLocation.stats.total} casos</span>
                          <span>•</span>
                          <span style={{ color: theme.colors.status.warning }}>
                            {selectedLocation.stats.enProceso} en proceso
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div
                        className="text-center p-2 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.status.warning}20, ${theme.colors.status.warning}10)`,
                        }}
                      >
                        <div
                          className="text-sm font-bold"
                          style={{ color: theme.colors.status.warning }}
                        >
                          {selectedLocation.stats.enProceso}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: theme.colors.text.disabled }}
                        >
                          En Proceso
                        </div>
                      </div>
                      <div
                        className="text-center p-2 rounded-lg"
                        style={{
                          background: `${theme.colors.status.success}10`,
                        }}
                      >
                        <div
                          className="text-sm font-bold"
                          style={{ color: theme.colors.status.success }}
                        >
                          {selectedLocation.stats.finalizados}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: theme.colors.text.disabled }}
                        >
                          Finalizados
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedLocation.penalties.map((penalty) => {
                        const risk = getRiskLevel(
                          penalty.current_process_id,
                          penalty.finish,
                        );
                        return (
                          <div
                            key={penalty.id}
                            onClick={() => openPenaltyModal(penalty)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition group ${
                              penalty.finish === 0 ? "border border-dashed" : ""
                            }`}
                            style={{
                              borderColor:
                                penalty.finish === 0
                                  ? `${theme.colors.status.warning}80`
                                  : "transparent",
                              background:
                                penalty.finish === 0
                                  ? `linear-gradient(135deg, ${theme.colors.background.card}, ${theme.colors.status.warning}10)`
                                  : `${theme.colors.primary.DEFAULT}08`,
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-xs font-medium truncate"
                                style={{ color: theme.colors.text.primary }}
                              >
                                Folio {penalty.id}
                              </div>
                              <div
                                className="text-xs truncate"
                                style={{ color: theme.colors.text.secondary }}
                              >
                                {penalty.name}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2 flex items-center gap-1">
                              <div
                                className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}
                                style={{
                                  background: risk.bgColor,
                                  color: risk.textColor,
                                }}
                              >
                                {risk.level.includes("(")
                                  ? risk.level.split("(")[0]
                                  : risk.level}
                              </div>
                              {penalty.finish === 0 && (
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                              )}
                              <ChevronRight
                                className="w-3 h-3"
                                style={{ color: theme.colors.text.disabled }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>

          {/* Botón para abrir panel en móvil */}
          {isMobile && !mobilePanelOpen && (
            <button
              onClick={() => setMobilePanelOpen(true)}
              className="absolute top-4 right-4 p-3 rounded-xl shadow-2xl z-10 transition-all"
              style={{
                background: theme.colors.primary.DEFAULT,
                color: theme.colors.text.inverse,
              }}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomMap;
