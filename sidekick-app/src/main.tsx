import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mirohq/design-system";
import App from "./App";
import "./index.css";

function mount() {
  let root = document.getElementById("sidekick-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "sidekick-root";
    document.body.appendChild(root);
  }
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
