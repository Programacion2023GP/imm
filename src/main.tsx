// main.tsx - versión mínima para probar
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
   <HashRouter>
      <App />
   </HashRouter>,
);
