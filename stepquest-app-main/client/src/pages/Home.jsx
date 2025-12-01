import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { startStepTracking } from "../services/realStepAPI";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "../context/Achievement";
import { useInventory } from "../context/InventoryContext";

import knightImg from "../assets/knight.png";

export default function Home() {
  const navigate = useNavigate();
  const knightRef = useRef(null);

  const { activeQuest, totalSteps, setTotalSteps } = useQuest();
  const { addItem } = useInventory();
  const { unlock } = useAchievements();

  // Local UI state
  const [stepsToday, setStepsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [questProgress, setQuestProgress] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questRewardGiven, setQuestRewardGiven] = useState(false);

  /* -----------------------------
      LOOT TABLE
  ------------------------------*/
  const LOOT_TABLE = [
    { name: "Traveler Boots", rarity: "Uncommon", icon: "🥾", stats: { spd: 1 } },
    { name: "Bronze Sword", rarity: "Common", icon: "🗡️", stats: { atk: 1 } },
    { name: "Guardian Shield", rarity: "Rare", icon: "🛡️", stats: { def: 2 } },
    { name: "Crystal Amulet", rarity: "Epic", icon: "🔮", stats: { luck: 2 } },
    { name: "Endless Cloak", rarity: "Legendary", icon: "🧥", stats: { end: 3 } },
    { name: "Mythic Sun Relic", rarity: "Mythic", icon: "☀️", stats: { atk: 2, def: 2, spd: 2, luck: 2, end: 2 } }
  ];

  const rollLoot = () => {
    const r = Math.random();
    if (r < 0.5) return LOOT_TABLE[0];
    if (r < 0.75) return LOOT_TABLE[1];
    if (r < 0.88) return LOOT_TABLE[2];
    if (r < 0.96) return LOOT_TABLE[3];
    if (r < 0.99) return LOOT_TABLE[4];
    return LOOT_TABLE[5];
  };

  /* -----------------------------
      RESET QUEST WHEN SWITCHED
  ------------------------------*/
  useEffect(() => {
    if (activeQuest) {
      setQuestProgress(0);
      setQuestCompleted(false);
      setQuestRewardGiven(false);
    }
  }, [activeQuest]);

  /* -----------------------------
      STEP TRACKING (REAL)
  ------------------------------*/
  useEffect(() => {
    startStepTracking((steps) => {
      if (steps <= 0) return;

      setStepsToday(prev => prev + steps);
      setTotalSteps(prev => prev + steps);
      handleStepGain(steps);
    });
  }, []);

  /* -----------------------------
      MAIN LOGIC FOR STEP GAINS
  ------------------------------*/
  const handleStepGain = (amount) => {
    const newTotal = totalSteps + amount;
    const questGoal = Number(activeQuest?.steps || 0); // FIXED

    // Knight animation
    if (knightRef.current) {
      knightRef.current.classList.add("knight-walk");
      setTimeout(() => knightRef.current.classList.remove("knight-walk"), 300);
    }

    /* XP SYSTEM */
    setXp(prev => {
      const needed = level * 100;
      const updated = prev + Math.round(amount * 0.1);

      if (updated >= needed) {
        setLevel(prevLevel => prevLevel + 1);
        return updated - needed;
      }
      return updated;
    });

    /* QUEST SYSTEM */
    if (activeQuest && !questCompleted) {
      setQuestProgress(prev => {
        const updated = prev + amount;

        if (updated >= questGoal && !questRewardGiven) {
          setQuestCompleted(true);
          setQuestRewardGiven(true);

          alert(`🎉 Quest Complete: ${activeQuest.title}`);

          setXp(prev => prev + 100);
        }

        return Math.min(updated, questGoal);
      });
    }

    /* ACHIEVEMENTS */
    if (newTotal >= 100) unlock("first100", "First Steps", "Walked 100 total steps!");
    if (newTotal >= 1000) unlock("stepRookie", "Step Rookie", "Walked 1,000 total steps!");
    if (newTotal >= 10000) unlock("stepWarrior", "Step Warrior", "Walked 10,000 total steps!");

    /* LOOT SYSTEM */
    const LOOT_STEP_INTERVAL = 50;
    const guaranteedDrop = newTotal % LOOT_STEP_INTERVAL === 0;
    const randomDrop = Math.random() < 0.05;

    if (guaranteedDrop || randomDrop) {
      const item = rollLoot();
      addItem(item);
      alert(`🎒 Loot Found!\n${item.name} (${item.rarity})`);
    }
  };

  /* -----------------------------
      UI VALUES
  ------------------------------*/
  const xpToNext = level * 100;
  const xpPercent = Math.round((xp / xpToNext) * 100);

  const questGoal = Number(activeQuest?.steps || 0); // FIX for UI
  const questPercent = activeQuest
    ? Math.round((questProgress / questGoal) * 100)
    : 0;

  return (
    <div className="page">
      <h1 className="page-title">StepQuest Dashboard</h1>

      {/* Knight */}
      <div className="knight-container">
        <img ref={knightRef} src={knightImg} className="knight-sprite" />
        <div className="knight-info">
          <p className="knight-level">LVL {level}</p>
          <p className="knight-title">Wanderer of the Unknown</p>
        </div>
      </div>

      {/* Inventory */}
      <button className="inventory-btn" onClick={() => navigate("/inventory")}>
        🎒
      </button>

      {/* Stats */}
      <div className="card">
        <p className="stat">Steps Today: <span className="stat-highlight">{stepsToday}</span></p>
        <p className="stat">Total Steps: <span className="stat-highlight">{totalSteps}</span></p>
        <p className="stat">Level: <span className="stat-highlight">{level}</span></p>
        <p className="stat">XP: {xp} / {xpToNext}</p>

        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>

        <hr />

        {!activeQuest && <p>No quest selected.</p>}

        {activeQuest && (
          <>
            <h2 className="card-title">{activeQuest.title}</h2>
            <p className="stat">
              Progress: {questProgress} / {questGoal}
            </p>

            <div className="quest-bar">
              <div className="quest-fill" style={{ width: `${questPercent}%` }} />
            </div>

            {questCompleted && <p>✅ Quest Completed!</p>}
          </>
        )}
      </div>
    </div>
  );
}
