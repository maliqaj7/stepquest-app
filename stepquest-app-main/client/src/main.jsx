import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { QuestProvider } from "./context/QuestContext.jsx";
import { InventoryProvider } from "./context/InventoryContext.jsx";
import { AchievementProvider } from "./context/Achievement.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AchievementProvider>
        <QuestProvider>
          <InventoryProvider>
            <App />
          </InventoryProvider>
        </QuestProvider>
      </AchievementProvider>
    </AuthProvider>
  </React.StrictMode>
);
