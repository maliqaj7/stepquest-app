import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuest } from "../context/QuestContext";
import "./Onboarding.css";

const CLASSES = [
  {
    id: "Warrior",
    name: "Warrior",
    icon: "⚔️",
    description: "Focuses on Strength. +2 Attack (ATK).",
    bonus: "atk"
  },
  {
    id: "Ranger",
    name: "Ranger",
    icon: "🏹",
    description: "Focuses on Speed. +2 Speed (SPD).",
    bonus: "spd"
  },
  {
    id: "Mage",
    name: "Mage",
    icon: "🪄",
    description: "Focuses on Wisdom. +2 Magic (MAG).",
    bonus: "mag"
  }
];

const MOTIVATIONS = [
  { id: "weight", name: "Health & Weight Loss", emoji: "🧘" },
  { id: "steps", name: "Get my daily steps in", emoji: "🚶" },
  { id: "adventure", name: "Pure Exploration & Adventure", emoji: "🗺️" }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, setOnboardingCompleted, userId } = useQuest();
  const { logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    heroClass: "",
    motivation: ""
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleComplete = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.heroClass || !formData.motivation) {
      alert("Please complete all fields to begin your journey!");
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding({
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
        heroClass: formData.heroClass,
        motivation: formData.motivation
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to saved your hero profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (userId) {
      // Set local flag so ProtectedRoute lets them in
      window.localStorage.setItem(`sq_${userId}_onboarding_completed`, "true");
      setOnboardingCompleted(true);
      navigate("/");
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-card">
          {/* PROGRESS BAR */}
          <div className="onboarding-progress">
            <div className={`progress-dot ${step >= 1 ? "active" : ""}`} />
            <div className={`progress-line ${step >= 2 ? "active" : ""}`} />
            <div className={`progress-dot ${step >= 2 ? "active" : ""}`} />
            <div className={`progress-line ${step >= 3 ? "active" : ""}`} />
            <div className={`progress-dot ${step >= 3 ? "active" : ""}`} />
          </div>

          {/* STEP 1: PHYSICAL STATS */}
          {step === 1 && (
            <div className="onboarding-step fade-in">
              <h1 className="step-title">The Hero's Form 📜</h1>
              <p className="step-subtitle">Tell us about your physical presence in this realm.</p>
              
              <div className="input-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 75" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Height (cm)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 180" 
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Age (years)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 24" 
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>

              <button className="onboarding-btn primary" onClick={nextStep}>
                Next: Choose Archetype
              </button>
            </div>
          )}

          {/* STEP 2: CLASS SELECTION */}
          {step === 2 && (
            <div className="onboarding-step fade-in">
              <h1 className="step-title">Choose Your Calling ⚔️</h1>
              <p className="step-subtitle">Select an archetype that resonates with your spirit.</p>
              
              <div className="class-grid">
                {CLASSES.map(cls => (
                  <div 
                    key={cls.id} 
                    className={`class-card ${formData.heroClass === cls.id ? "selected" : ""}`}
                    onClick={() => setFormData({...formData, heroClass: cls.id})}
                  >
                    <span className="class-icon">{cls.icon}</span>
                    <h3 className="class-name">{cls.name}</h3>
                    <p className="class-desc">{cls.description}</p>
                  </div>
                ))}
              </div>

              <div className="btn-row">
                <button className="onboarding-btn secondary" onClick={prevStep}>Back</button>
                <button className="onboarding-btn primary" onClick={nextStep}>Next: Your Motivation</button>
              </div>
            </div>
          )}

          {/* STEP 3: MOTIVATION */}
          {step === 3 && (
            <div className="onboarding-step fade-in">
              <h1 className="step-title">Your Motivation 🗺️</h1>
              <p className="step-subtitle">What drives you to walk the paths of this world?</p>
              
              <div className="motivation-list">
                {MOTIVATIONS.map(m => (
                  <div 
                    key={m.id} 
                    className={`motivation-item ${formData.motivation === m.name ? "selected" : ""}`}
                    onClick={() => setFormData({...formData, motivation: m.name})}
                  >
                    <span className="motivation-emoji">{m.emoji}</span>
                    <span className="motivation-name">{m.name}</span>
                  </div>
                ))}
              </div>

              <div className="btn-row">
                <button className="onboarding-btn secondary" onClick={prevStep}>Back</button>
                <button className="onboarding-btn primary" onClick={handleComplete} disabled={loading}>
                  {loading ? "Forging Hero..." : "Begin My Quest!"}
                </button>
              </div>

            </div>
          )}

          <div className="onboarding-footer">
            <button className="onboarding-skip-btn" onClick={handleSkip}>
              Skip for now
            </button>
            <span className="footer-divider">|</span>
            <button className="onboarding-logout-btn" onClick={() => logout().then(() => navigate("/login"))}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
