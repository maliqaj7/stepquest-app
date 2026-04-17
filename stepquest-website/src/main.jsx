import React from "react";
import ReactDOM from "react-dom/client";
import App from "./StepQuestWebsite.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(<App />);