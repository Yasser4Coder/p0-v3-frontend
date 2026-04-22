import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { splashPriorityAssets } from "./assets/splashCritical";
import { WelcomeLoginTransitionProvider } from "./contexts/WelcomeLoginTransitionContext";
import { warmSplashPriorityAssets } from "./utils/preloadAssets";
import App from "./App";
import { NotificationsProvider } from "./hooks/useNotifications";
import "./index.css";

registerSW({ immediate: true });
warmSplashPriorityAssets(splashPriorityAssets);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WelcomeLoginTransitionProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </WelcomeLoginTransitionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
