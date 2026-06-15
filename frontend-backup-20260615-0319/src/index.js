import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mount React into a hidden node — the real page is static HTML in /public/index.html.
const host = document.getElementById("react-root") || document.body.appendChild(
  Object.assign(document.createElement("div"), { id: "react-root", style: "display:none" })
);
createRoot(host).render(<App />);
