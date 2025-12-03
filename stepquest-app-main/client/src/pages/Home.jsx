import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { startStepTracking } from "../services/realStepAPI";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "../context/Achievement";
import { useInventory } from "../context/InventoryContext";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

/* -----------------------------
   PIXEL KNIGHT SPRITES
   8×8 grid
   "." = transparent
   "1","2","3" = different colours
------------------------------*/

const BASE_PIXELS = [
  "..1111..",
  ".122221.",
  ".122221.",
  "..3333..",
  "..3..3..",
  ".3....3.",
  ".3....3.",
  "..3333..",
];

const HERO_SPRITES = {
  tier1: {
    title: "Apprentice Knight",
    pixels: BASE_PIXELS,
    colors: {
      "1": "#f9fafb", // helmet edge
      "2": "#facc15", // visor / face
      "3": "#111827", // dark armour
    },
  },
  tier2: {
    title: "Elite Vanguard",
    pixels: BASE_PIXELS,
    colors: {
      "1": "#e5e7eb",
      "2": "#f97316", // warmer visor
      "3": "#1d4ed8", // blue armour
    },
  },
  tier3: {
    title: "Dragon Knight",
    pixels: BASE_PIXELS,
    colors: {
      "1": "#fef3c7",
      "2": "#fbbf24", // bright gold visor
      "3": "#7f1d1d", // crimson armour
    },
  },
};

// ✅ Uses BOTH level & totalSteps so the knight evolves
const getHeroSprite = (level, totalSteps) => {
  // late‑game / high progress
  if (level >= 10 || totalSteps >= 10000) return HERO_SPRITES.tier3;
  // mid‑game
  if (level >= 5 || totalSteps >= 2000) return HERO_SPRITES.tier2;
  // early game
  return HERO_SPRITES.tier1;
};

export default function Home() {
  const navigate = useNavigate();
  const knightRef = useRef(null);

  const { activeQuest, totalSteps, setTotalSteps } = useQuest();
  const { addItem } = useInventory();
  const { unlock } = useAchievements();
  const { user } = useAuth(); // current logged‑in Supabase user

  // Local UI state
  const [stepsToday, setStepsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [questProgress, setQuestProgress] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questRewardGiven, setQuestRewardGiven] = useState(false);

  // track when we've loaded from Supabase so we don't overwrite with zeros
  const [statsLoaded, setStatsLoaded] = useState(false);

  // 🔹 NEW: avatar from ProfilePage (localStorage)
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedAvatar");
    if (stored) {
      setAvatar(stored);
    }
  }, []);

  /* -----------------------------
        LOAD STATS FROM SUPABASE
  ------------------------------*/
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      const { data, error } = await supabase
        .from("player_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // if it's a real error (not just "no row found")
      if (error && error.code !== "PGRST116") {
        console.error("Error loading stats:", error);
        return;
      }

      if (data) {
        // existing row – hydrate state
        setStepsToday(data.steps_today ?? 0);
        setTotalSteps(data.total_steps ?? 0);
        setXp(data.xp ?? 0);
        setLevel(data.level ?? 1);
      } else {
        // first time – create default row
        const { error: insertError } = await supabase
          .from("player_stats")
          .insert({
            user_id: user.id,
            steps_today: 0,
            total_steps: 0,
            xp: 0,
            level: 1,
          });

        if (insertError) {
          console.error("Error creating stats row:", insertError);
        }
      }

      setStatsLoaded(true);
    };

    loadStats();
  }, [user, setTotalSteps]);

  /* -----------------------------
        HELPER TO SAVE STATS
  ------------------------------*/
  const saveStats = async (stats) => {
    if (!user) return;

    const { error } = await supabase.from("player_stats").upsert({
      user_id: user.id,
      ...stats,
    });

    if (error) {
      console.error("Error saving stats:", error);
    }
  };

  // Whenever stats change (after initial load), sync to Supabase
  useEffect(() => {
    if (!user || !statsLoaded) return;

    saveStats({
      steps_today: stepsToday,
      total_steps: totalSteps,
      xp,
      level,
    });
  }, [user, statsLoaded, stepsToday, totalSteps, xp, level]);

  /* -----------------------------
        LOOT TABLE
  ------------------------------*/
  const LOOT_TABLE = [
    { name: "Traveler Boots", rarity: "Uncommon", icon: "🥾", stats: { spd: 1 } },
    { name: "Bronze Sword", rarity: "Common", icon: "🗡️", stats: { atk: 1 } },
    { name: "Guardian Shield", rarity: "Rare", icon: "🛡️", stats: { def: 2 } },
    { name: "Crystal Amulet", rarity: "Epic", icon: "🔮", stats: { luck: 2 } },
    { name: "Endless Cloak", rarity: "Legendary", icon: "🧥", stats: { end: 3 } },
    {
      name: "Mythic Sun Relic",
      rarity: "Mythic",
      icon: "☀️",
      stats: { atk: 2, def: 2, spd: 2, luck: 2, end: 2 },
    },
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

      setStepsToday((prev) => prev + steps);
      setTotalSteps((prev) => prev + steps);
      handleStepGain(steps);
    });
  }, []);

  /* -----------------------------
        MAIN LOGIC FOR STEP GAINS
  ------------------------------*/
  const handleStepGain = (amount) => {
    const newTotal = totalSteps + amount;
    const questGoal = Number(activeQuest?.steps || 0);

    // Pixel knight "walk" animation
    if (knightRef.current) {
      knightRef.current.classList.add("knight-walk");
      setTimeout(() => knightRef.current.classList.remove("knight-walk"), 300);
    }

    /* XP SYSTEM */
    setXp((prev) => {
      const needed = level * 100;
      const updated = prev + Math.round(amount * 0.1);
      if (updated >= needed) {
        setLevel((prevLevel) => prevLevel + 1);
        return updated - needed;
      }
      return updated;
    });

    /* QUEST SYSTEM */
    if (activeQuest && !questCompleted) {
      setQuestProgress((prev) => {
        const updated = prev + amount;
        if (updated >= questGoal && !questRewardGiven) {
          setQuestCompleted(true);
          setQuestRewardGiven(true);
          alert(`🎉 Quest Complete: ${activeQuest.title}`);
          setXp((prevXp) => prevXp + 100);
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
        SIMULATE STEPS (for testing)
  ------------------------------*/
  const simulateSteps = () => {
    const fakeSteps = 500;
    setStepsToday((prev) => prev + fakeSteps);
    setTotalSteps((prev) => prev + fakeSteps);
    handleStepGain(fakeSteps);
  };

  /* -----------------------------
        UI VALUES
  ------------------------------*/
  const xpToNext = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));

  const questGoal = Number(activeQuest?.steps || 0);
  const questPercent = activeQuest
    ? Math.min(100, Math.round((questProgress / questGoal) * 100))
    : 0;

  // Pixel knight sprite depends on level + totalSteps
  const heroSprite = getHeroSprite(level, totalSteps);
  const pixelRows = heroSprite.pixels;
  const cols = pixelRows[0].length;

  // mobile‑app style metrics
  const dailyGoal = 5000; // change if you like
  const dayPercent = Math.min(100, Math.round((stepsToday / dailyGoal) * 100));
  const distanceKm = (stepsToday * 0.0008).toFixed(1); // rough km estimate
  const calories = Math.round(stepsToday * 0.05); // rough kcal
  const activeMinutes = Math.round(stepsToday / 100); // ~1 min per 100 steps

  return (
    <div className="page home-page">
      <div className="home-shell">
        {/* HEADER */}
        <header className="home-header">
          <div>
            <p className="home-header-label">Today</p>
            <p className="home-header-date">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* 🔹 Avatar top‑right */}
          <button
            className="home-avatar-btn"
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
          >
            {avatar ? (
              <img
                src={avatar}
                alt="Your avatar"
                className="home-avatar-img"
              />
            ) : (
              <span className="home-avatar-placeholder">🙂</span>
            )}
          </button>
        </header>

        {/* BIG CIRCLE CARD */}
        <section className="steps-card">
          <div
            className="steps-ring-circle"
            style={{
              backgroundImage: `conic-gradient(#22c55e ${dayPercent}%, #111827 ${dayPercent}% 100%)`,
            }}
          >
            <div className="steps-ring-inner">
              <p className="steps-today-number">
                {stepsToday.toLocaleString()}
              </p>
              <p className="steps-goal-text">
                of {dailyGoal.toLocaleString()} steps
              </p>
            </div>
          </div>

          <div className="steps-badge">
            <span className="badge-icon">⚔️</span>
            <span className="badge-text">StepQuest · LVL {level}</span>
          </div>
        </section>

        {/* METRIC ROW */}
        <section className="metrics-row">
          <div className="metric-card">
            <p className="metric-label">Distance</p>
            <p className="metric-value">{distanceKm} km</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Calories</p>
            <p className="metric-value">{calories}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Active</p>
            <p className="metric-value">{activeMinutes} min</p>
          </div>
        </section>

        {/* PIXEL KNIGHT SECTION */}
        <section className="knight-section">
          <div
            ref={knightRef}
            className="hero-pixel-grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              boxShadow: `0 0 0 4px ${heroSprite.colors["1"]}33, 0 0 16px ${heroSprite.colors["3"]}66`,
            }}
          >
            {pixelRows.map((row, rowIndex) =>
              row.split("").map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                if (cell === ".") {
                  return (
                    <div
                      key={key}
                      className="hero-pixel-cell pixel-empty"
                    />
                  );
                }
                const color = heroSprite.colors[cell] || "transparent";
                return (
                  <div
                    key={key}
                    className="hero-pixel-cell"
                    style={{ backgroundColor: color }}
                  />
                );
              })
            )}
          </div>

          <div className="knight-info">
            <p className="knight-level">LVL {level}</p>
            <p className="knight-title">{heroSprite.title}</p>
          </div>

          {/* Inventory floating button */}
          <button
            className="inventory-fab"
            onClick={() => navigate("/inventory")}
          >
            🎒
          </button>
        </section>

        {/* BOTTOM DETAILS CARD */}
        <section className="details-card">
          <p className="stat">
            Steps Today:{" "}
            <span className="stat-highlight">
              {stepsToday.toLocaleString()}
            </span>
          </p>
          <p className="stat">
            Total Steps:{" "}
            <span className="stat-highlight">
              {totalSteps.toLocaleString()}
            </span>
          </p>
          <p className="stat">
            Level: <span className="stat-highlight">{level}</span>
          </p>
          <p className="stat">
            XP: {xp} / {xpToNext}
          </p>

          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>

          <hr />

          {!activeQuest && (
            <p className="stat muted">No quest selected.</p>
          )}

          {activeQuest && (
            <>
              <h2 className="card-title">{activeQuest.title}</h2>
              <p className="stat">
                Progress: {questProgress} / {questGoal}
              </p>
              <div className="quest-bar">
                <div
                  className="quest-fill"
                  style={{ width: `${questPercent}%` }}
                />
              </div>
              {questCompleted && <p>✅ Quest Completed!</p>}
            </>
          )}

          <button className="btn-primary full-width" onClick={simulateSteps}>
            Simulate +500 Steps
          </button>
        </section>
      </div>
    </div>
  );
}
