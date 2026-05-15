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
import { configureGeneric } from "react-zustore";
import { env } from "./constant";
import type { UserTableRow } from "./ui/hooks/users/users.model";

// Lazy imports para todas las páginas
const PageDepartaments = lazy(
   () => import("./ui/pages/catalogues/departaments/PageDepartments"),
);

configureGeneric({
   baseUrl: "http://127.0.0.1:8000/api",
   responseMap: {
      ok: (res) => res?.status == true,
      data: (res) => res?.result ?? [],
      total: (res) => res?.result?.length ?? 0,
   },
   endpoints: {
      getAll: (prefix) => `${prefix}`,
      create: (prefix) => `${prefix}/createOrUpdate`,
   },
});

// Definición de tipos
interface BaseSidebarItem {
   id: string | number;
   prefix: string;
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

// Componente Layout para las rutas autenticadas
const MainLayout = () => {
   const [open, setOpen] = useState(false);
   const [showInstallPrompt, setShowInstallPrompt] = useState(false);
   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
   const location = useLocation();
   const navigate = useNavigate();

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
      prefix: string,
      route: string,
      icon: React.ReactNode,
      label: string,
   ): SidebarItemWithRoute => ({
      id,
      prefix,
      route,
      icon,
      label,
   });

   const createChildrenItem = (
      id: number,
      prefix: string,
      label: string,
      icon: React.ReactNode,
      children: SidebarItem[],
   ): SidebarItemWithChildren => ({
      id,
      prefix,
      label,
      icon,
      children,
   });

   const hasChildren = (item: SidebarItem): item is SidebarItemWithChildren => {
      return "children" in item && Array.isArray(item.children);
   };

   const hasRoute = (item: SidebarItem): item is SidebarItemWithRoute => {
      return "route" in item && typeof item.route === "string";
   };

   const sidebarItems: SidebarItem[] = useMemo(
      () => [
         createRouteItem(
            1,
            "usuarios_",
            "/usuarios",
            <FaUserTie />,
            "Usuarios",
         ),
         createRouteItem(
            2,
            "tramite_",
            "/tramite",
            <RiFileList3Line />,
            "Tramites",
         ),
         createRouteItem(6, "usuarios_crear", "/logs", <FaCode />, "Logs"),
         createChildrenItem(
            7,
            "catalogo_",
            "Catálogos",
            <FaBuildingColumns />,
            [
               createRouteItem(
                  71,
                  "catalogo_departamentos_",
                  "/catalogos/departamentos",
                  <FaUserDoctor />,
                  "Departamentos",
               ),
            ],
         ),
         createChildrenItem(8, "reports_", "Reportes", <FaChartLine />, []),
      ],
      [],
   );

   const mainRef = useRef<HTMLElement>(null);

   const handleMainClick = useCallback(
      (e: MouseEvent) => {
         if (open) {
            setOpen(false);
         }
      },
      [open],
   );

   useEffect(() => {
      const element = mainRef.current;
      if (!element) return;

      element.addEventListener("click", handleMainClick);
      return () => {
         element.removeEventListener("click", handleMainClick);
      };
   }, [handleMainClick]);

   const isActiveRoute = useCallback(
      (route: string) => {
         return (
            location.pathname === route ||
            location.pathname.startsWith(route + "/")
         );
      },
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
                     id={item.id}>
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
            <Header
               setOpenSidebar={toggleSidebar}
               isSidebarOpen={open}
               // authUser={null}
            />

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
            className="px-3 py-1 font-semibold text-blue-600 transition-colors bg-white rounded-md hover:bg-blue-100">
            Instalar
         </button>
         <button onClick={onClose} className="text-white hover:text-gray-200">
            ×
         </button>
      </div>
   </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
   const token = localStorage.getItem("token");
   const location = useLocation();

   if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
   }

   return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
   const token = localStorage.getItem("token");
   if (token) {
      return <Navigate to="/usuarios" replace />;
   }

   return <>{children}</>;
};

function App() {
   return (
      <Routes>
         <Route
            path="/"
            element={
               // <ProtectedRoute>
               <MainLayout />
               // </ProtectedRoute>
            }>
            <Route path="catalogos">
               <Route
                  path="departamentos"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageDepartaments />
                     </Suspense>
                  }
               />
            </Route>
         </Route>
      </Routes>
   );
}

export default App;
