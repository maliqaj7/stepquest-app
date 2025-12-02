import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // redirect user after logout
  };

  return (
    <nav className="pixel-navbar">
      {/* Logo clickable to return home */}
      <h2
        className="pixel-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        ⚔️ StepQuest
      </h2>

      <div className="pixel-links">
        <NavLink
          to="/"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>

        <NavLink
          to="/quests"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          Quests
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          Map
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          Inventory
        </NavLink>

        <NavLink
          to="/ai"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          AI Master
        </NavLink>

        <NavLink
          to="/insights"
          className={({ isActive }) => `pixel-link ${isActive ? "active" : ""}`}
        >
          Insights
        </NavLink>

        {/* Only show logout if user is logged in */}
        {user && (
          <button
            className="pixel-link logout-btn"
            onClick={handleLogout}
            style={{
              marginLeft: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-color)",
              fontSize: "1rem",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
