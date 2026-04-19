import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WelcomeLoginTransitionProvider } from "./contexts/WelcomeLoginTransitionContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WelcomeLoginTransitionProvider>
        <App />
      </WelcomeLoginTransitionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
