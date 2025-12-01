import "./App.css";

import { QuestProvider } from "./context/QuestContext";
import { InventoryProvider } from "./context/InventoryContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Map from "./pages/Map";
import InventoryPage from "./pages/InventoryPage";
import AIQuestMaster from "./pages/AIQuestMaster";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <QuestProvider>
      <InventoryProvider>
        <Router>
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/map" element={<Map />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/ai" element={<AIQuestMaster />} />
            </Routes>
          </main>
        </Router>
      </InventoryProvider>
    </QuestProvider>
  );
}

export default App;
