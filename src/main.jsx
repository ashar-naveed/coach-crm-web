import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import App from "./App.jsx";

const root = document.getElementById("root");
root.addEventListener("click", () => {}, true); // force event delegation
createRoot(root).render(<App />);
