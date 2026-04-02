import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";
import knight1 from "../assets/Knight.png";
import knight2 from "../assets/Evil Knight.png";
import knight3 from "../assets/Female Knight.png";
import knight4 from "../assets/Goblin.jpg";

export default function ProfilePage() {
  const { baseStats, availablePoints, level, commitStats, selectedAvatar, setSelectedAvatar } = useQuest();
  const { user } = useAuth();
  
  // Track points added *this session*
  const [sessionAllocations, setSessionAllocations] = useState({});
  const allocationsRef = useRef(sessionAllocations);

  // Sync ref with state
  useEffect(() => {
    allocationsRef.current = sessionAllocations;
  }, [sessionAllocations]);

  // Commit on unmount (navigation)
  useEffect(() => {
    return () => {
      const current = allocationsRef.current;
      const hasChanges = Object.values(current).some(v => v > 0);
      if (hasChanges) {
        commitStats(current);
      }
    };
  }, [commitStats]);

  // Commit on refresh/close
  useEffect(() => {
    const handleUnload = () => {
      const current = allocationsRef.current;
      const hasChanges = Object.values(current).some(v => v > 0);
      if (hasChanges) {
        commitStats(current);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [commitStats]);

  const totalSessionSpent = Object.values(sessionAllocations).reduce((a, b) => a + b, 0);
  const effectiveAvailablePoints = availablePoints - totalSessionSpent;

  const handleAdd = (stat) => {
    if (effectiveAvailablePoints > 0) {
      setSessionAllocations(prev => ({
        ...prev,
        [stat]: (prev[stat] || 0) + 1
      }));
    }
  };

  const handleRemove = (stat) => {
    if (sessionAllocations[stat] > 0) {
      setSessionAllocations(prev => ({
        ...prev,
        [stat]: prev[stat] - 1
      }));
    }
  };

  const userId = user?.id ?? "guest";

  const avatarList = [
    { id: 1, img: knight1, name: "Hero Knight" },
    { id: 2, img: knight2, name: "Evil Knight" },
    { id: 3, img: knight3, name: "Female Knight" },
    { id: 4, img: knight4, name: "Goblin Knight" },
  ];

  // Upload custom avatar
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result); // base64 image
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Hero Profile</h1>

      <div className="profile-grid">
        {/* LEFT COLUMN: AVATAR */}
        <section className="profile-section">
          <h2 className="profile-section-title">Visual Identity</h2>
          <div className="avatar-preview">
            <img src={selectedAvatar} className="avatar-large" alt="Hero" />
            <p className="avatar-subtext">Level {level} Explorer</p>
          </div>

          <label className="upload-btn">
            Upload Custom Sprite
            <input type="file" accept="image/*" onChange={handleUpload} />
          </label>

          <div className="avatar-presets">
            {avatarList.map((a) => (
              <div
                key={a.id}
                className={`avatar-mini ${
                  selectedAvatar === a.img ? "avatar-selected" : ""
                }`}
                onClick={() => setSelectedAvatar(a.img)}
              >
                <img src={a.img} className="avatar-mini-img" alt={a.name} />
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: STATS & SKILL POINTS */}
        <section className="profile-section stats-section">
          <h2 className="profile-section-title">Attributes & Mastery</h2>
          
          <div className="skill-points-banner">
            <p className="points-label">Available Skill Points</p>
            <p className="points-value">{availablePoints}</p>
          </div>

          <div className="stats-allocation-list">
            {Object.entries(baseStats).map(([key, val]) => (
              <div key={key} className="stat-alloc-row">
                <div className="stat-info">
                  <span className="stat-icon">
                    {key === "atk" && "⚔️"}
                    {key === "def" && "🛡️"}
                    {key === "spd" && "⚡"}
                    {key === "luck" && "🍀"}
                    {key === "end" && "🫀"}
                  </span>
                  <div className="stat-text">
                    <p className="stat-name">{key.toUpperCase()}</p>
                    <p className="stat-desc">
                      {key === "atk" && "Increases damage in boss battles"}
                      {key === "def" && "Reduces damage taken from foes"}
                      {key === "spd" && "Higher chance to dodge & strike first"}
                      {key === "luck" && "Better loot rarity from quests"}
                      {key === "end" && "Max HP and recovery speed"}
                    </p>
                  </div>
                </div>
                
                  <div className="stat-controls">
                    <button 
                      className="stat-minus-btn"
                      disabled={!sessionAllocations[key]}
                      onClick={() => handleRemove(key)}
                    >
                      -
                    </button>
                    <span className="stat-number">
                      {val + (sessionAllocations[key] || 0)}
                    </span>
                    <button 
                      className="stat-plus-btn"
                      disabled={effectiveAvailablePoints <= 0}
                      onClick={() => handleAdd(key)}
                    >
                      +
                    </button>
                  </div>
              </div>
            ))}
          </div>

          {effectiveAvailablePoints > 0 && (
            <p className="stat-hint">
              You earn 2 skill points every time you level up!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
