import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function QuestCompleteModal({ quest, xpGained, itemDropped, onClose }) {
  const [confettiData, setConfettiData] = useState(null);

  useEffect(() => {
    // Fetching generic confetti from LottieFiles public assets
    fetch("https://lottie.host/80404eeb-fe8a-4428-ba73-585aef653066/M77p3Z7aHl.json")
      .then((res) => res.json())
      .then((data) => setConfettiData(data))
      .catch((err) => console.log("Lottie fetch error:", err));
  }, []);

  return (
    <div className="modal-overlay">
      {/* Background Lottie Confetti */}
      {confettiData && (
        <div className="lottie-bg">
          <Lottie animationData={confettiData} loop={false} />
        </div>
      )}

      <div className="modal-content quest-complete-modal">
        <h2 className="modal-title celebration-text">Quest Complete!</h2>
        <p className="modal-subtitle">{quest?.title}</p>
        
        <div className="modal-reward-card">
          <p className="reward-label">Rewards Gained:</p>
          <div className="reward-xp">
            <span className="xp-icon">✨</span>
            <span className="xp-amount">+{xpGained} XP</span>
          </div>
          
          {itemDropped && (
            <div className="dropped-item">
              <span className="dropped-item-icon">{itemDropped.icon}</span>
              <div className="dropped-item-info">
                <p className="dropped-item-name">{itemDropped.name}</p>
                <p className={`dropped-item-rarity rarity-${itemDropped.rarity.toLowerCase()}`}>
                  {itemDropped.rarity}
                </p>
              </div>
            </div>
          )}
        </div>

        <button className="btn-primary modal-btn mt-4" onClick={onClose}>
          Claim Rewards
        </button>
      </div>
    </div>
  );
}
