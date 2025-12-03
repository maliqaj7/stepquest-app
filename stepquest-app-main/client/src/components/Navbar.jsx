import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="pixel-navbar pixel-navbar-bottom">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🏠</span>
        <span className="pixel-tab-label">Home</span>
      </NavLink>

      <NavLink
        to="/quests"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">📜</span>
        <span className="pixel-tab-label">Quests</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🗺️</span>
        <span className="pixel-tab-label">Map</span>
      </NavLink>

      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">🎒</span>
        <span className="pixel-tab-label">Bag</span>
      </NavLink>

      

      <NavLink
        to="/insights"
        className={({ isActive }) =>
          `pixel-tab ${isActive ? "active" : ""}`
        }
      >
        <span className="pixel-tab-icon">📊</span>
        <span className="pixel-tab-label">Insights</span>
      </NavLink>

      <NavLink
  to="/profile"
  className={({ isActive }) =>
    `pixel-tab ${isActive ? "active" : ""}`
  }
>
  <span className="pixel-tab-icon">👤</span>
  <span className="pixel-tab-label">Profile</span>
</NavLink>


      <button
        type="button"
        className="pixel-tab logout-tab"
        onClick={handleLogout}
      >
        <span className="pixel-tab-icon">🚪</span>
        <span className="pixel-tab-label">Logout</span>
      </button>
    </nav>
  );
}
