// src/ui/pages/PageNotFound.tsx
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#9B2242]">404</h1>
        <div className="w-24 h-1 bg-[#9B2242] mx-auto my-6 rounded-full" />
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          ¡Página no encontrada!
        </h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-[#9B2242] text-[#9B2242] rounded-lg hover:bg-[#9B2242]/10 transition"
          >
            Volver Atrás
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[#9B2242] text-white rounded-lg hover:bg-[#651D32] transition"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
