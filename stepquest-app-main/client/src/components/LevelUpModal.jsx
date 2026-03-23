import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function LevelUpModal({ oldLevel, newLevel, newTitle, onClose }) {
  const [levelUpAnimation, setLevelUpAnimation] = useState(null);

  useEffect(() => {
    // Simple burst/reward lottie
    fetch("https://lottie.host/e3f0ae67-bb78-45e8-9bc9-08b5f3a0a38f/jFmbEw49Fp.json")
      .then((res) => res.json())
      .then((data) => setLevelUpAnimation(data))
      .catch((err) => console.log("Lottie fetch error:", err));
  }, []);

  return (
    <div className="modal-overlay level-up-bg">
      {levelUpAnimation && (
        <div className="lottie-bg burst-lottie">
          <Lottie animationData={levelUpAnimation} loop={false} />
        </div>
      )}

      <div className="modal-content level-up-modal">
        <h2 className="modal-title level-up-text">Level Up!</h2>
        
        <div className="level-transition">
          <span className="level-old">{oldLevel}</span>
          <span className="level-arrow">➯</span>
          <span className="level-new">{newLevel}</span>
        </div>

        <div className="title-reveal">
          <p className="title-label">New Rank Achieved:</p>
          <p className="title-value">{newTitle}</p>
        </div>

        <button className="btn-primary modal-btn mt-4" onClick={onClose}>
          Continue Journey
        </button>
      </div>
    </div>
  );
}
