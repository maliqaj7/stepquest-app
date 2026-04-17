import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { QuestProvider } from "./context/QuestContext.jsx";
import { InventoryProvider } from "./context/InventoryContext.jsx";
import { AchievementProvider } from "./context/Achievement.jsx";

// PWA Registration with auto-update
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <AchievementProvider>
          <QuestProvider>
            <InventoryProvider>
              <App />
            </InventoryProvider>
          </QuestProvider>
        </AchievementProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);

