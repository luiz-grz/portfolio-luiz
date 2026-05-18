import React from "react";
import ReactDOM from "react-dom/client";
import App from "./portfolio-leg.jsx";
import "./style.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Elemento #root não encontrado. Adicione <div id="root"></div> no index.html.');
}

ReactDOM.createRoot(rootElement).render(<App />);
