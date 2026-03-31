import { useState, useEffect } from "react";
import { useQuest } from "../context/QuestContext";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";
import knight1 from "../assets/Knight.png";
import knight2 from "../assets/Evil Knight.png";
import knight3 from "../assets/Female Knight.png";
import knight4 from "../assets/Goblin.jpg";

export default function ProfilePage() {
  const { baseStats, availablePoints, upgradeStat, level } = useQuest();
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const avatarList = [
    { id: 1, img: knight1, name: "Hero Knight" },
    { id: 2, img: knight2, name: "Evil Knight" },
    { id: 3, img: knight3, name: "Female Knight" },
    { id: 4, img: knight4, name: "Goblin Knight" },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(knight1);

  // Load avatar for specific user
  useEffect(() => {
    const key = `sq_${userId}_avatar`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setSelectedAvatar(stored);
    } else {
      setSelectedAvatar(knight1);
    }
  }, [userId]);

  // Save avatar choice
  useEffect(() => {
    if (userId === "guest") return;
    const key = `sq_${userId}_avatar`;
    localStorage.setItem(key, selectedAvatar);
  }, [selectedAvatar, userId]);

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
                  <span className="stat-number">{val}</span>
                  <button 
                    className="stat-plus-btn"
                    disabled={availablePoints <= 0}
                    onClick={() => upgradeStat(key)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {availablePoints > 0 && (
            <p className="stat-hint">
              You earn 2 skill points every time you level up!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
