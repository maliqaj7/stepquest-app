import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

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
          className={({ isActive }) =>
            `pixel-link ${isActive ? "active" : ""}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/quests"
          className={({ isActive }) =>
            `pixel-link ${isActive ? "active" : ""}`
          }
        >
          Quests
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `pixel-link ${isActive ? "active" : ""}`
          }
        >
          Map
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `pixel-link ${isActive ? "active" : ""}`
          }
        >
          Inventory
        </NavLink>

        <NavLink
          to="/ai"
          className={({ isActive }) =>
            `pixel-link ${isActive ? "active" : ""}`
          }
        >
          AI Master
        </NavLink>
      </div>
    </nav>
  );
}
