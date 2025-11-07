/**
 * Point d'entrée principal de l'application React
 * @version 1.0.0
 * @date 31-10-2025
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

