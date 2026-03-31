import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

// Register service worker — notify on new deployments (don't auto-reload mid-game)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Check for updates every 60 seconds
        setInterval(() => reg.update().catch(() => {}), 60_000);

        // When a new SW is installed, show update banner
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              // Dispatch custom event so App can show a toast
              window.dispatchEvent(new CustomEvent("sw-update-available"));
            }
          });
        });
      })
      .catch(() => {});
  });
}

// Offline/online detection
window.addEventListener("offline", () => {
  window.dispatchEvent(new CustomEvent("app-offline"));
});
window.addEventListener("online", () => {
  window.dispatchEvent(new CustomEvent("app-online"));
});
