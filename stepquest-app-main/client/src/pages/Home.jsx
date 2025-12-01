import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { fetchNewSteps } from "../services/stepService";
import { startStepTracking } from "../services/realStepAPI";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import knightImg from "../assets/knight.png";

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useInventory();
  const knightRef = useRef(null);

  // Quest context
  const { activeQuest, totalSteps, setTotalSteps } = useQuest();

  // Local state
  const [stepsToday, setStepsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [questProgress, setQuestProgress] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questRewardGiven, setQuestRewardGiven] = useState(false);

  /* -----------------------------
      LOOT TABLE (RPG Items)
  ------------------------------*/
  const LOOT_TABLE = [
    { name: "Traveler Boots", rarity: "Uncommon", icon: "🥾", stats: { spd: 1 }, description: "+1 SPD. Light boots for long journeys." },
    { name: "Bronze Sword", rarity: "Common", icon: "🗡️", stats: { atk: 1 }, description: "+1 ATK. A basic but reliable blade." },
    { name: "Guardian Shield", rarity: "Rare", icon: "🛡️", stats: { def: 2 }, description: "+2 DEF. Protects against harsh quests." },
    { name: "Crystal Amulet", rarity: "Epic", icon: "🔮", stats: { luck: 2 }, description: "+2 LUCK. Increases chance of rare finds." },
    { name: "Endless Cloak", rarity: "Legendary", icon: "🧥", stats: { end: 3 }, description: "+3 END. Walk further without tiring." },
    { name: "Mythic Sun Relic", rarity: "Mythic", icon: "☀️", stats: { atk: 2, def: 2, spd: 2, luck: 2, end: 2 }, description: "+2 to all stats." }
  ];

  const rollLoot = () => {
    const roll = Math.random();
    if (roll < 0.5) return LOOT_TABLE[0];
    if (roll < 0.75) return LOOT_TABLE[1];
    if (roll < 0.88) return LOOT_TABLE[2];
    if (roll < 0.96) return LOOT_TABLE[3];
    if (roll < 0.99) return LOOT_TABLE[4];
    return LOOT_TABLE[5];
  };

  /* -----------------------------
      RESET QUEST WHEN CHANGED
  ------------------------------*/
  useEffect(() => {
    if (activeQuest) {
      setQuestProgress(0);
      setQuestCompleted(false);
      setQuestRewardGiven(false);
    }
  }, [activeQuest]);

  /* -----------------------------
      REAL STEP TRACKING FIXED
  ------------------------------*/
  useEffect(() => {
    startStepTracking((actualSteps) => {
      // Increase today’s steps properly
      setStepsToday((prev) => prev + actualSteps);

      // Increase world steps properly
      setTotalSteps((prev) => prev + actualSteps);

      // Apply XP
      handleStepGain(actualSteps);
    });
  }, []);

  /* -----------------------------
      XP, Loot, Quest Logic (Unified)
  ------------------------------*/
  const handleStepGain = (stepAmount) => {
    const addedXp = Math.round(stepAmount * 0.1); // scalable XP

    // Knight walk animation
    if (knightRef.current) {
      knightRef.current.classList.add("knight-walk");
      setTimeout(() => knightRef.current.classList.remove("knight-walk"), 300);
    }

    // XP logic
    setXp((prevXp) => {
      const xpNeeded = level * 100;
      const total = prevXp + addedXp;

      if (total >= xpNeeded) {
        setLevel((prev) => prev + 1);
        return total - xpNeeded;
      }
      return total;
    });

    // Quest logic
    if (activeQuest && !questCompleted) {
      setQuestProgress((prev) => {
        const newProgress = prev + stepAmount;
        if (newProgress >= activeQuest.steps) {
          setQuestCompleted(true);

          if (!questRewardGiven) {
            setQuestRewardGiven(true);

            alert(`🎉 Quest Complete: ${activeQuest.title}`);

            // Grant quest XP
            setXp((prevXp) => prevXp + 100);
          }
        }
        return Math.min(newProgress, activeQuest.steps);
      });
    }

    // Loot drop
    if (Math.random() < 0.35) {
      const item = rollLoot();
      addItem(item);
      alert(`🎒 Loot Found!\n${item.name} (${item.rarity})`);
    }
  };

  /* -----------------------------
      SIMULATION BUTTON -> Uses same logic
  ------------------------------*/
  const simulateSteps = async () => {
    const fakeSteps = await fetchNewSteps();
    handleStepGain(fakeSteps);
  };

  const xpToNextLevel = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / xpToNextLevel) * 100));
  const questPercent = activeQuest ? Math.min(100, Math.round((questProgress / activeQuest.steps) * 100)) : 0;

  return (
    <div className="page">
      <h1 className="page-title">StepQuest Dashboard</h1>

      {/* Knight UI */}
      <div className="knight-container">
        <img ref={knightRef} src={knightImg} alt="Knight" className="knight-sprite" />
        <div className="knight-info">
          <p className="knight-level">LVL {level}</p>
          <p className="knight-title">Wanderer of the Unknown</p>
        </div>
      </div>

      {/* Inventory button */}
      <button className="inventory-btn" onClick={() => navigate("/inventory")}>🎒</button>

      {/* Stats Card */}
      <div className="card">
        <p className="stat">Steps Today: <span className="stat-highlight">{stepsToday}</span></p>
        <p className="stat">Total Steps: <span className="stat-highlight">{totalSteps}</span></p>
        <p className="stat">Level: <span className="stat-highlight">{level}</span></p>
        <p className="stat">XP: {xp} / {xpToNextLevel}</p>

        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>

        <hr />

        {!activeQuest && <p>No quest selected.</p>}

        {activeQuest && (
          <>
            <h2 className="card-title">{activeQuest.title}</h2>
            <p className="stat">Progress: {questProgress} / {activeQuest.steps}</p>
            <div className="quest-bar">
              <div className="quest-fill" style={{ width: `${questPercent}%` }} />
            </div>
            {questCompleted && <p>✅ Quest Completed!</p>}
          </>
        )}

        <button className="btn-primary" onClick={simulateSteps}>
          Simulate Steps
        </button>
      </div>
    </div>
  );
}
