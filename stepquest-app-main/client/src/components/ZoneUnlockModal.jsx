import { useEffect, useState } from "react";
import "./Modals.css";

export default function ZoneUnlockModal({ zone, onClose }) {
  const [defeatedState, setDefeatedState] = useState(false);

  useEffect(() => {
    // Delay the "DEFEATED" stamp animation for dramatic effect
    const timer = setTimeout(() => {
      setDefeatedState(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="modal-overlay zone-unlock-bg">
      <div className="modal-content cinematic-modal">
        <h2 className="modal-title celebration-text" style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}>
          ZONE UNLOCKED!
        </h2>
        <p className="modal-subtitle">{zone.name}</p>

        {zone.bossName && (
          <div className="boss-encounter">
            <p className="boss-label">Guardian Defeated:</p>
            <div className="boss-avatar-wrapper">
               <span className="boss-sprite">{zone.bossSprite}</span>
               {defeatedState && <div className="defeated-stamp">DEFEATED</div>}
            </div>
            <p className="boss-name">{zone.bossName}</p>
          </div>
        )}

        <p className="lore-snippet">"{zone.description}"</p>

        <button className="btn-primary modal-btn mt-4" onClick={onClose}>
          Enter {zone.name}
        </button>
      </div>
    </div>
  );
}
