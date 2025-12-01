import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QuestProvider } from "./context/QuestContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QuestProvider>
  <App />
</QuestProvider>

  </React.StrictMode>
);
