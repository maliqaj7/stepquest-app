// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuest } from "../context/QuestContext";
import { useInventory } from "../context/InventoryContext";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Settings.css";

const CLASSES = [
  { id: "Warrior", icon: "⚔️", stat: "atk", label: "Attack" },
  { id: "Ranger",  icon: "🏹", stat: "spd", label: "Speed" },
  { id: "Mage",   icon: "🪄", stat: "mag", label: "Magic" },
];

const MOTIVATIONS = [
  { id: "Health & Weight Loss",          emoji: "🧘" },
  { id: "Get my daily steps in",         emoji: "🚶" },
  { id: "Pure Exploration & Adventure",  emoji: "🗺️" },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const {
    dailyGoal, setDailyGoal,
    heroClass, changeHeroClass,
    motivation, setMotivation,
    weight, setWeight,
    height, setHeight,
    age, setAge,
    baseStats,
    level,
  } = useQuest();
  const { clearInventory } = useInventory();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // ─── Local controlled state ───────────────────────────────────────────────
  const [localGoal,       setLocalGoal]       = useState(dailyGoal || 5000);
  const [localWeight,     setLocalWeight]     = useState(weight || "");
  const [localHeight,     setLocalHeight]     = useState(height || "");
  const [localAge,        setLocalAge]        = useState(age || "");
  const [localMotivation, setLocalMotivation] = useState(motivation || "");

  const [soundOn,   setSoundOn]   = useState(() => localStorage.getItem("sq_soundOn")   !== "false");
  const [hapticsOn, setHapticsOn] = useState(() => localStorage.getItem("sq_hapticsOn") !== "false");

  const [classChanging, setClassChanging] = useState(false);
  const [physicalSaving, setPhysicalSaving] = useState(false);
  const [pendingClass, setPendingClass] = useState(null);
  const [confirmClass, setConfirmClass] = useState(false);

  // Sync from context when it loads
  useEffect(() => { if (dailyGoal)   setLocalGoal(dailyGoal); },   [dailyGoal]);
  useEffect(() => { if (weight)      setLocalWeight(weight); },    [weight]);
  useEffect(() => { if (height)      setLocalHeight(height); },    [height]);
  useEffect(() => { if (age)         setLocalAge(age); },          [age]);
  useEffect(() => { if (motivation)  setLocalMotivation(motivation); }, [motivation]);

  useEffect(() => { localStorage.setItem("sq_soundOn",   soundOn.toString()); },   [soundOn]);
  useEffect(() => { localStorage.setItem("sq_hapticsOn", hapticsOn.toString()); }, [hapticsOn]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleClearBag = () => {
    if (window.confirm("Clear all bag items? This can't be undone.")) {
      clearInventory();
      showToast("Bag cleared.", "success");
    }
  };

  const handleGoalSave = async () => {
    const parsed = parseInt(localGoal, 10);
    if (!parsed || parsed < 100) {
      showToast("Goal must be at least 100 steps.", "error");
      return;
    }
    setDailyGoal(parsed);
    if (user) {
      const { error } = await supabase
        .from("player_stats").update({ daily_goal: parsed }).eq("user_id", user.id);
      if (error) showToast("Failed to save goal.", "error");
      else       showToast(`Daily goal set to ${parsed.toLocaleString()} steps! ⚔️`, "success");
    }
  };

  const handlePhysicalSave = async () => {
    const w = parseFloat(localWeight);
    const h = parseFloat(localHeight);
    const a = parseInt(localAge, 10);
    if (!w || !h || !a || w < 20 || w > 300 || h < 50 || h > 250 || a < 5 || a > 120) {
      showToast("Please enter valid weight, height and age.", "error");
      return;
    }
    setPhysicalSaving(true);
    setWeight(w);
    setHeight(h);
    setAge(a);
    try {
      await supabase.from("player_stats")
        .update({ weight_kg: w, height_cm: h, age: a })
        .eq("user_id", user.id);
      showToast("Physical stats updated! 💪", "success");
    } catch { showToast("Failed to save physical stats.", "error"); }
    finally  { setPhysicalSaving(false); }
  };

  const handleMotivationChange = async (newMotivation) => {
    if (newMotivation === localMotivation) return;
    setLocalMotivation(newMotivation);
    setMotivation(newMotivation);
    if (user) {
      await supabase.from("player_stats")
        .update({ motivation: newMotivation }).eq("user_id", user.id);
    }
    showToast("Motivation updated!", "success");
  };

  const initiateClassChange = (cls) => {
    if (cls === heroClass) return;
    setPendingClass(cls);
    setConfirmClass(true);
  };

  const handleClassConfirm = async () => {
    if (!pendingClass) return;
    setClassChanging(true);
    setConfirmClass(false);
    const isFirstTime = !heroClass;
    try {
      await changeHeroClass(pendingClass);
      const newCls = CLASSES.find(c => c.id === pendingClass);
      if (isFirstTime) {
        showToast(`You have chosen the path of the ${pendingClass}! +2 ${newCls?.label} ⚔️`, "success");
      } else {
        const oldCls = CLASSES.find(c => c.id === heroClass);
        showToast(`Respec! -2 ${oldCls?.label ?? "old stat"}, +1 ${newCls?.label} 🔄`, "success");
      }
    } catch (e) {
      showToast("Failed to change class. Please try again.", "error");
    } finally {
      setClassChanging(false);
      setPendingClass(null);
    }
  };

  // BMI helper
  const bmi = (localWeight && localHeight)
    ? (parseFloat(localWeight) / ((parseFloat(localHeight) / 100) ** 2)).toFixed(1)
    : null;
  const bmiLabel = bmi
    ? bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese"
    : null;

  const selectedAvatar = localStorage.getItem("selectedAvatar") || null;
  const currentClass = CLASSES.find(c => c.id === heroClass);
  const pendingClassData = CLASSES.find(c => c.id === pendingClass);

  return (
    <div className="settings-page">
      <h1 className="settings-title">⚙️ Settings</h1>

      {/* ── HERO PROFILE ─────────────────────────────────────────────────── */}
      <section className="settings-card settings-profile-card">
        <h2 className="settings-section-title">Hero Profile</h2>
        <button type="button" className="settings-row-button" onClick={() => navigate("/profile")}>
          <div className="settings-profile-left">
            <div className="settings-avatar-wrapper">
              {selectedAvatar
                ? <img src={selectedAvatar} alt="Avatar" className="settings-avatar-img" />
                : <span className="settings-avatar-fallback">👤</span>}
            </div>
            <div>
              <p className="settings-profile-name">{user?.email || "StepQuest Hero"}</p>
              <p className="settings-profile-sub">
                {currentClass ? `${currentClass.icon} ${currentClass.id}` : "No class chosen"} · Lv {level}
              </p>
            </div>
          </div>
          <span className="settings-chevron">›</span>
        </button>
      </section>

      {/* ── PHYSICAL FORM ────────────────────────────────────────────────── */}
      <section className="settings-card">
        <h2 className="settings-section-title">Physical Form</h2>
        <p className="settings-hint">Used to calculate calories, BMI and future quest scaling.</p>

        <div className="physical-grid">
          <div className="physical-field">
            <label>Weight (kg)</label>
            <input
              type="number" value={localWeight}
              onChange={e => setLocalWeight(e.target.value)}
              placeholder="75"
            />
          </div>
          <div className="physical-field">
            <label>Height (cm)</label>
            <input
              type="number" value={localHeight}
              onChange={e => setLocalHeight(e.target.value)}
              placeholder="180"
            />
          </div>
          <div className="physical-field">
            <label>Age</label>
            <input
              type="number" value={localAge}
              onChange={e => setLocalAge(e.target.value)}
              placeholder="24"
            />
          </div>
        </div>

        {bmi && (
          <div className="bmi-badge">
            <span className="bmi-label">BMI</span>
            <span className={`bmi-value bmi-${bmiLabel?.toLowerCase()}`}>{bmi}</span>
            <span className="bmi-status">{bmiLabel}</span>
          </div>
        )}

        <button className="settings-save-btn" onClick={handlePhysicalSave} disabled={physicalSaving}>
          {physicalSaving ? "Saving…" : "Save Physical Stats"}
        </button>
      </section>

      {/* ── HERO ARCHETYPE ───────────────────────────────────────────────── */}
      <section className="settings-card">
        <h2 className="settings-section-title">Hero Archetype</h2>
        <p className="settings-hint">
          Switching class transfers <strong>1 of 2</strong> bonus points.
          You lose 1 point as a respec penalty.
        </p>

        <div className="class-switcher">
          {CLASSES.map(cls => {
            const isCurrent = cls.id === heroClass;
            const statVal = baseStats?.[cls.stat] ?? 5;
            return (
              <button
                key={cls.id}
                className={`class-tile ${isCurrent ? "class-tile--active" : ""}`}
                onClick={() => initiateClassChange(cls.id)}
                disabled={classChanging || isCurrent}
              >
                <span className="class-tile-icon">{cls.icon}</span>
                <span className="class-tile-name">{cls.id}</span>
                <span className="class-tile-stat">{cls.label} {statVal}</span>
                {isCurrent && <span className="class-tile-badge">Active</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MOTIVATION ───────────────────────────────────────────────────── */}
      <section className="settings-card">
        <h2 className="settings-section-title">Your Motivation</h2>
        <div className="motivation-picker">
          {MOTIVATIONS.map(m => (
            <button
              key={m.id}
              className={`motivation-tile ${localMotivation === m.id ? "motivation-tile--active" : ""}`}
              onClick={() => handleMotivationChange(m.id)}
            >
              <span>{m.emoji}</span>
              <span>{m.id}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── ACTIVITY PREFERENCES ─────────────────────────────────────────── */}
      <section className="settings-card">
        <h2 className="settings-section-title">Activity Preferences</h2>

        <div className="settings-goal-container">
          <label className="settings-goal-label">Daily Step Goal</label>
          <div className="settings-goal-row">
            <input
              type="number" value={localGoal}
              onChange={e => setLocalGoal(e.target.value)}
              placeholder="5000"
              className="settings-goal-input"
            />
            <button onClick={handleGoalSave} className="settings-goal-save">Save</button>
          </div>
          <p className="settings-goal-hint">
            Hitting your goal 3 days in a row increases it by 10% automatically! 🔥
          </p>
        </div>

        <div className="settings-toggles">
          <label className="settings-toggle-row">
            <input type="checkbox" checked={soundOn} onChange={e => setSoundOn(e.target.checked)} />
            <span>🔊 Sound effects</span>
          </label>
          <label className="settings-toggle-row">
            <input type="checkbox" checked={hapticsOn} onChange={e => setHapticsOn(e.target.checked)} />
            <span>📳 Vibration / haptics</span>
          </label>
        </div>
      </section>

      {/* ── ACCOUNT ──────────────────────────────────────────────────────── */}
      <section className="settings-card">
        <h2 className="settings-section-title">Account</h2>
        <p className="settings-email">
          Signed in as <span>{user?.email}</span>
        </p>
        <button className="settings-primary-btn" onClick={handleLogout}>
          Log out
        </button>
      </section>

      {/* ── DANGER ZONE ──────────────────────────────────────────────────── */}
      <section className="settings-card danger-card">
        <h2 className="settings-section-title">Danger Zone</h2>
        <button className="settings-danger-btn" onClick={handleClearBag}>
          🗑️ Clear bag items
        </button>
      </section>

      {/* ── CLASS CONFIRM DIALOG ─────────────────────────────────────────── */}
      {confirmClass && pendingClassData && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p className="confirm-icon">{pendingClassData.icon}</p>
            <h3>{heroClass ? `Switch to ${pendingClassData.id}?` : `Choose ${pendingClassData.id}?`}</h3>
            {heroClass ? (
              <p className="confirm-body">
                You'll lose <strong>2 {CLASSES.find(c => c.id === heroClass)?.label ?? "current stat"}</strong>{" "}
                and gain <strong>1 {pendingClassData.label}</strong>.
                <span className="confirm-penalty">⚠️ 1 stat point is the respec penalty.</span>
              </p>
            ) : (
              <p className="confirm-body">
                You will begin your journey as a <strong>{pendingClassData.id}</strong>!<br />
                You'll receive <strong>+2 {pendingClassData.label}</strong> as your starting bonus.
              </p>
            )}
            <div className="confirm-btns">
              <button className="confirm-cancel" onClick={() => { setConfirmClass(false); setPendingClass(null); }}>
                Cancel
              </button>
              <button className="confirm-accept" onClick={handleClassConfirm}>
                {heroClass ? "Respec!" : "Choose Class!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
