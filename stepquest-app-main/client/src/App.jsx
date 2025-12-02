// src/App.jsx
import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Map from "./pages/Map";
import InventoryPage from "./pages/InventoryPage";
import AIQuestMaster from "./pages/AIQuestMaster";
import Insights from "./pages/Insights";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user } = useAuth(); // who is logged in (from Supabase)

  return (
    <Router>
      {/* Show navbar only when logged in */}
      {user && <Navbar />}

      <main className="content">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED ROUTES (need to be logged in) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests"
            element={
              <ProtectedRoute>
                <Quests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIQuestMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
