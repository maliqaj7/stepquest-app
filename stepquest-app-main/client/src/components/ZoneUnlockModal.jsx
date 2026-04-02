import { useEffect, useState, useCallback } from "react";
import { useInventory } from "../context/InventoryContext";
import { useQuest } from "../context/QuestContext";
import "./Modals.css";

const TAUNTS = [
  "Is that all the 'hero' has to offer? Pathetic.",
  "Go back to the Forest Edge, little one. You're out of your league.",
  "My power is absolute. Your steps are meaningless.",
  "Tell your town that their 'savior' is a joke.",
  "You call that an attack? I've felt mosquito bites more painful.",
  "Maybe try walking a few more miles before facing a REAL challenge.",
  "I'll remember your face... it'll be a great story to tell the other monsters.",
  "Don't worry, the ground is very comfortable. You'll be staying here a while.",
  "If only your sword was as big as your ego...",
  "I expected a hero, but I found a nuisance."
];

export default function ZoneUnlockModal({ zone, onWin, onLose, isReplay = false }) {
  const { totalStats } = useInventory();
  const { level, selectedAvatar } = useQuest();

  // Stats derivation
  // Stats derivation with safety defaults
  const safeEnd = isNaN(Number(totalStats.end)) ? 5 : Number(totalStats.end);
  const safeLevel = isNaN(Number(level)) ? 1 : Number(level);
  
  const playerMaxHp = Math.max(10, (safeEnd * 12) + (safeLevel * 5));
  const bossMaxHp = Math.max(10, zone?.hp || 100);

  // Growth Scaling Calculation
  const intendedLevel = Math.max(1, Math.floor((zone?.requiredSteps || 0) / 2500));
  const levelDiff = Math.max(0, safeLevel - intendedLevel);
  const powerMult = levelDiff > 5 ? 1 + (levelDiff * 0.1) : 1; // 10% more dmg per level ahead after +5 margin

  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [battleLog, setBattleLog] = useState(`The ${zone?.bossName || "Guardian"} blocks your path!`);
  const [isCasting, setIsCasting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [battleOver, setBattleOver] = useState(null); // 'win' or 'lose'

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleAttack = useCallback(() => {
    if (battleOver || isCasting) return;
    setIsCasting(true);

    // 1. Player Attacks
    let playerBaseDmg = totalStats.atk + Math.floor(Math.random() * 5);
    const bossMitigation = Math.floor((zone.def || 0) / 2);
    let finalDmgToBoss = Math.max(5, playerBaseDmg - bossMitigation);

    // Apply Growth Scaling
    if (powerMult > 1.2) {
      finalDmgToBoss = Math.floor(finalDmgToBoss * powerMult);
      setBattleLog(`✨ OVERWHELMING POWER! You strike for ${finalDmgToBoss} damage!`);
    } else {
      setBattleLog(`You strike for ${finalDmgToBoss} damage!`);
    }

    const newBossHp = Math.max(0, bossHp - finalDmgToBoss);
    setBossHp(newBossHp);
    triggerShake();

    if (newBossHp <= 0) {
      setBattleOver('win');
      setBattleLog("GUARDIAN DEFEATED!");
      setIsCasting(false);
      return;
    }

    // 2. Boss Counter-Attacks after delay
    setTimeout(() => {
      const bossBaseDmg = (zone.atk || 10) + Math.floor(Math.random() * 5);
      const playerMitigation = Math.floor(totalStats.def / 2);
      const finalDmgToPlayer = Math.max(3, bossBaseDmg - playerMitigation);

      const newPlayerHp = Math.max(0, playerHp - finalDmgToPlayer);
      setPlayerHp(newPlayerHp);
      setBattleLog(`${zone.bossName} retaliates for ${finalDmgToPlayer} damage!`);
      triggerShake();

      if (newPlayerHp <= 0) {
        setBattleOver('lose');
        const randomTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
        setBattleLog(`💀 LOSS! ${zone.bossName} mocks you: "${randomTaunt}"`);
      }
      setIsCasting(false);
    }, 800);
  }, [battleOver, bossHp, playerHp, totalStats, zone, isCasting]);

  const handleHeal = () => {
    if (battleOver || isCasting) return;
    setIsCasting(true);
    
    const healAmount = Math.floor(totalStats.end * 2.5);
    setPlayerHp(prev => Math.min(playerMaxHp, prev + healAmount));
    setBattleLog(`You focus your endurance, recovering ${healAmount} HP.`);
    
    // Boss still attacks!
    setTimeout(() => {
      const bossBaseDmg = (zone.atk || 10);
      const finalDmg = Math.max(2, bossBaseDmg - Math.floor(totalStats.def / 2));
      setPlayerHp(prev => Math.max(0, prev - finalDmg));
      setBattleLog(`${zone.bossName} attacks while you heal for ${finalDmg} damage!`);
      triggerShake();
      setIsCasting(false);
    }, 600);
  };

  return (
    <div className={`modal-overlay zone-unlock-bg ${battleOver ? 'battle-fade' : ''}`}>
      <div className={`modal-content combat-modal ${isShaking ? 'shake' : ''}`}>
        
        {/* Header */}
        <div className="combat-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span className="combat-zone-badge">{zone.name}</span>
            {isReplay && <span className="combat-zone-badge" style={{ background: "#9333ea" }}>REPLAY MODE</span>}
          </div>
          <h2 className="combat-boss-name">{zone.bossName || "Unknown Guardian"}</h2>
          <p className="stat muted" style={{ fontSize: "0.7rem", marginTop: "-10px" }}>
             Level {safeLevel} Hero vs Tier {intendedLevel} Boss
          </p>
        </div>

        {/* HP Bars Section */}
        <div className="combat-arena">
          <div className="combat-unit boss-unit">
             <div className="hp-bar-outer">
               <div className="hp-bar-fill boss-hp" style={{ width: `${(bossHp/bossMaxHp)*100}%` }} />
               <span className="hp-text">{bossHp} / {bossMaxHp}</span>
             </div>
             <div className="boss-visual">
                <span className="boss-giant-sprite">{zone.bossSprite}</span>
             </div>
          </div>

          <div className="combat-vs">VS</div>

          <div className="combat-unit player-unit">
             <div className="hp-bar-outer">
               <div className="hp-bar-fill player-hp" style={{ width: `${(playerHp/playerMaxHp)*100}%` }} />
               <span className="hp-text">{playerHp} / {playerMaxHp}</span>
             </div>
             <div className="player-visual">
                <img src={selectedAvatar} className="player-avatar-combat" alt="Hero" />
             </div>
             <p className="player-label">YOU (Hero)</p>
          </div>
        </div>

        {/* Battle Log */}
        <div className="combat-log">
          <p>{battleLog}</p>
        </div>

        {/* Actions or Outcomes */}
        <div className="combat-actions">
          {!battleOver ? (
            <>
              <button 
                className="btn-primary attack-btn" 
                onClick={handleAttack}
                disabled={isCasting}
              >
                ⚔️ Attack
              </button>
              <button 
                className="btn-secondary heal-btn" 
                onClick={handleHeal}
                disabled={isCasting}
              >
                🍵 Heal
              </button>
            </>
          ) : (
            <button 
              className={`btn-primary full-width ${battleOver === 'win' ? 'btn-win' : 'btn-lose'}`}
              onClick={battleOver === 'win' ? onWin : onLose}
            >
              {battleOver === 'win' 
                ? (isReplay ? "Claim Replay Reward" : "Victory! Enter Zone") 
                : (isReplay ? "Try Again Later" : "Retreat (Needs Recovery)")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

