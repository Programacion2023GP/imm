// src/App.tsx
import { Sidebar } from "./ui/components/sidebar/CustomSidebar";
import { SidebarItem } from "./ui/components/sidebar/CustomSidebarItem";
import { Header } from "./ui/components/header/CustomHeader";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
  useRef,
} from "react";
import { FaUserTie } from "react-icons/fa6";
import "./index.css";
import { FaChartLine, FaCode } from "react-icons/fa";
import { SidebarDrop } from "./ui/components/sidebar/CustomSidebarDrop";
import { FaBuildingColumns } from "react-icons/fa6";
import {
  Routes,
  Navigate,
  Outlet,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { FaUserDoctor } from "react-icons/fa6";
import Spinner from "./ui/components/loading/loading";
import { RiFileList3Line } from "react-icons/ri";
import { env } from "./constant";
import useAuthData from "./ui/hooks/auth/useauthdata";

// Lazy imports

const PageInterview = lazy(
  () => import("./ui/pages/interview/pageinterview.page"),
);
const Loby = lazy(
  () => import("./ui/pages/loby/loby.page"),
);
const PageUsers = lazy(
  () => import("./ui/pages/catalogues/users/pageusers.page"),
);
const PagePermissions = lazy(
  () => import("./ui/pages/catalogues/permissions/pagePermissions.page"),
);
const PageRoles = lazy(
  () => import("./ui/pages/catalogues/roles/pageroles.page"),
);
const PageLogin = lazy(() => import("./ui/pages/login/PageLogin"));
const PageNotFound = lazy(() => import("./ui/pages/notfound/pagenofound"));

// Tipos sidebar
interface BaseSidebarItem {
  id: string | number;
  prefix: string | null;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarItemWithRoute extends BaseSidebarItem {
  route: string;
  children?: never;
}

interface SidebarItemWithChildren extends BaseSidebarItem {
  children: SidebarItem[];
  route?: never;
}

type SidebarItem = SidebarItemWithRoute | SidebarItemWithChildren;

// Layout principal
const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { persist, hasPermissionPrefix } = useAuthData();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const toggleSidebar = useCallback(() => setOpen((prev) => !prev), []);
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleNavigation = useCallback(
    (route: string) => {
      navigate(route);
      setOpen(false);
    },
    [navigate],
  );

  const createRouteItem = (
    id: number,
    prefix: string | null,
    route: string,
    icon: React.ReactNode,
    label: string,
  ): SidebarItemWithRoute => ({ id, prefix, route, icon, label });

  const createChildrenItem = (
    id: number,
    prefix: string | null,
    label: string,
    icon: React.ReactNode,
    children: SidebarItem[],
  ): SidebarItemWithChildren => ({ id, prefix, label, icon, children });

  const hasChildren = (item: SidebarItem): item is SidebarItemWithChildren =>
    "children" in item && Array.isArray(item.children);
  const hasRoute = (item: SidebarItem): item is SidebarItemWithRoute =>
    "route" in item && typeof item.route === "string";

  // Filtrar sidebar por permisos
  const filterItemsByPermissions = useCallback(
    (items: SidebarItem[]): SidebarItem[] => {
      return items
        .filter((item) => {
          if (!item.prefix) return true;
          const hasAccess = hasPermissionPrefix(item.prefix);
          if (hasChildren(item)) {
            const filteredChildren = filterItemsByPermissions(item.children);
            return hasAccess && filteredChildren.length > 0;
          }
          return hasAccess;
        })
        .map((item) => {
          if (hasChildren(item)) {
            return {
              ...item,
              children: filterItemsByPermissions(item.children),
            };
          }
          return item;
        });
    },
    [hasPermissionPrefix],
  );

  const sidebarItems = useMemo(() => {
    const items: SidebarItem[] = [
      createRouteItem(
        5,
        "LOBY_PSICOLOGO",
        "/loby",
        <RiFileList3Line />,
        "LOBY",
      ),
      createRouteItem(
        6,
        "ENTREVISTA",
        "/expedienteuno",
        <RiFileList3Line />,
        "Expediente 1",
      ),
      createChildrenItem(7, "CATALOGOS", "Catálogos", <FaBuildingColumns />, [
        createRouteItem(
          71,
          "CATALOGOS",
          "/catalogos/usuarios",
          <FaUserDoctor />,
          "Usuarios",
        ),
        createRouteItem(
          72,
          "CATALOGOS",
          "/catalogos/permisos",
          <FaUserDoctor />,
          "Permisos",
        ),
        createRouteItem(
          73,
          "CATALOGOS",
          "/catalogos/roles",
          <FaUserDoctor />,
          "Roles",
        ),
      ]),
    ];
    return filterItemsByPermissions(items);
  }, [filterItemsByPermissions]);

  const mainRef = useRef<HTMLElement>(null);
  const handleMainClick = useCallback(
    (e: MouseEvent) => {
      if (open) setOpen(false);
    },
    [open],
  );
  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;
    element.addEventListener("click", handleMainClick);
    return () => element.removeEventListener("click", handleMainClick);
  }, [handleMainClick]);

  const isActiveRoute = useCallback(
    (route: string) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
    [location.pathname],
  );

  const renderSidebarItems = useCallback(
    (items: SidebarItem[]): React.ReactNode => {
      return items.map((item) => {
        if (hasChildren(item)) {
          return (
            <SidebarDrop
              key={item.id}
              label={item.label}
              icon={item.icon}
              id={item.id}
            >
              {renderSidebarItems(item.children)}
            </SidebarDrop>
          );
        }
        if (hasRoute(item)) {
          return (
            <SidebarItem
              key={item.id}
              route={item.route}
              icon={item.icon}
              label={item.label}
              id={item.id}
              active={isActiveRoute(item.route)}
              onClick={() => handleNavigation(item.route)}
            />
          );
        }
        return null;
      });
    },
    [isActiveRoute, handleNavigation],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa]">
      {open && (
        <div className="flex-shrink-0 w-64 shadow-md">
          <Sidebar name={env.NAME_SYSTEM} borderR>
            {renderSidebarItems(sidebarItems)}
          </Sidebar>
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <Header setOpenSidebar={toggleSidebar} isSidebarOpen={open} />
        <main ref={mainRef} className="flex-1 p-6 overflow-auto bg-white">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
        {showInstallPrompt && (
          <InstallPrompt
            onInstall={handleInstallClick}
            onClose={() => setShowInstallPrompt(false)}
          />
        )}
      </div>
    </div>
  );
};

const InstallPrompt = ({
  onInstall,
  onClose,
}: {
  onInstall: () => void;
  onClose: () => void;
}) => (
  <div className="fixed z-50 p-4 text-white bg-blue-600 rounded-lg shadow-lg bottom-4 right-4">
    <div className="flex items-center gap-3">
      <span>📱 Instalar App</span>
      <button
        onClick={onInstall}
        className="px-3 py-1 font-semibold text-blue-600 bg-white rounded-md hover:bg-blue-100"
      >
        Instalar
      </button>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        ×
      </button>
    </div>
  </div>
);

// ✅ Ruta protegida con verificación de permisos
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { persist, hasPermissionPrefix } = useAuthData();

  console.log("🟢 [PROTECTED_ROUTE] Path:", location.pathname);
  console.log("🟢 [PROTECTED_ROUTE] Token:", persist?.token);
  console.log("🟢 [PROTECTED_ROUTE] Permisos:", persist.permisos);

  if (!persist?.token) {
    console.log("🟢 [PROTECTED_ROUTE] No token, redirigiendo a login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const routePermissions: Record<string, string> = {
    "/expedienteuno": "ENTREVISTA",
    "/loby": "LOBY_PSICOLOGO",
    "/catalogos/usuarios": "CATALOGOS",
    "/catalogos/permisos": "CATALOGOS",
    "/catalogos/roles": "CATALOGOS",
  };

  const requiredPrefix = routePermissions[location.pathname];
  if (requiredPrefix) {
    const hasAccess = hasPermissionPrefix(requiredPrefix);
    console.log(
      `🟢 [PROTECTED_ROUTE] Ruta ${location.pathname} requiere ${requiredPrefix}, tiene acceso: ${hasAccess}`,
    );
    if (!hasAccess) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { persist } = useAuthData();
  if (persist?.token) {
    return <DefaultRedirect />;
  }
  return <>{children}</>;
};

// ✅ Redirección inicial según permisos (similar al login)
// ✅ Redirección inicial según permisos (corregido)
const DefaultRedirect = () => {
  const { persist, getRedirectRouteByPrefix } = useAuthData();
  const navigate = useNavigate();

  useEffect(() => {
    const permisos = persist?.permisos;

    console.log("🔵 [DEFAULT_REDIRECT] Permisos:", permisos);
    console.log("🔵 [DEFAULT_REDIRECT] Token:", persist?.token);

    // ✅ Esperar a que los permisos estén disponibles
    if (!permisos || permisos.length === 0) {
      console.log("🔵 [DEFAULT_REDIRECT] No hay permisos, esperando...");
      return;
    }

    const routesByPrefix = {
      ENTREVISTA: "/expedienteuno",
      LOBY_PSICOLOGO: "/loby",
      CATALOGOS: "/catalogos/usuarios",
    };

    const redirectUrl = getRedirectRouteByPrefix(routesByPrefix, "/dashboard");
    console.log("🔵 [DEFAULT_REDIRECT] Redirigiendo a:", redirectUrl);
    navigate(redirectUrl, { replace: true });
  }, [persist?.permisos, getRedirectRouteByPrefix, navigate]);

  return <Spinner />;
};

function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="login"
        element={
          <PublicRoute>
            <Suspense fallback={<Spinner />}>
              <PageLogin />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Rutas de error */}
      <Route path="403" element={<PageNotFound />} />
      <Route path="404" element={<PageNotFound />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Spinner />}>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Bienvenido al sistema del Instituto de la Mujer
                </p>
              </div>
            </Suspense>
          }
        />
        <Route
          path="loby"
          element={
            <Suspense fallback={<Spinner />}>
              <Loby loby="psicologo" />
            </Suspense>
          }
        />
        <Route
          path="expedienteuno"
          element={
            <Suspense fallback={<Spinner />}>
              <PageInterview />
            </Suspense>
          }
        />

        <Route path="catalogos">
          <Route
            path="usuarios"
            element={
              <Suspense fallback={<Spinner />}>
                <PageUsers />
              </Suspense>
            }
          />
          <Route
            path="permisos"
            element={
              <Suspense fallback={<Spinner />}>
                <PagePermissions />
              </Suspense>
            }
          />
          <Route
            path="roles"
            element={
              <Suspense fallback={<Spinner />}>
                <PageRoles />
              </Suspense>
            }
          />
          {/* <Route
            path="departamentos"
            element={
              <Suspense fallback={<Spinner />}>
                <PageDepartaments />
              </Suspense>
            }
          /> */}
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
