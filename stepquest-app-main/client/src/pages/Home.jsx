import { useState, useEffect, useRef } from "react";
import { useQuest } from "../context/QuestContext";
import { startStepTracking, stopStepTracking } from "../services/realStepAPI";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "../context/Achievement";
import { useInventory } from "../context/InventoryContext";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import QuestCompleteModal from "../components/QuestCompleteModal";
import LevelUpModal from "../components/LevelUpModal";
import ZoneUnlockModal from "../components/ZoneUnlockModal";
import { ZONES } from "../data/zones";
import { useEnvironment } from "../hooks/useEnvironment";
import { getHeroProgression } from "../data/progression";
import { useNotification } from "../context/NotificationContext";
import { rollLoot } from "../data/items";
import { logSocialActivity } from "../services/socialService";
import "../components/Modals.css";

// Logic for dynamic XP scaling
const getXpRequired = (lvl) => 250 + (lvl * 50); // Lvl 1: 300, Lvl 2: 350, Lvl 3: 400...

export default function Home() {
  const navigate = useNavigate();
  const knightRef = useRef(null);

  const { 
    activeQuest,
    totalSteps,
    setTotalSteps,
    stepsToday,
    setStepsToday,
    statsLoaded,
    setStatsLoaded,
    level,
    setLevel,
    xp,
    setXp,
    dailyGoal,
    setDailyGoal,
    questProgress,
    setQuestProgress,
    announcedZones,
    setAnnouncedZones,
    onboardingCompleted,
    setOnboardingCompleted,
    setWeight,
    setHeight,
    setAge,
    setHeroClass,
    setMotivation,
    setBaseStats
  } = useQuest();

  const { addItem } = useInventory();
  const { unlock } = useAchievements();
  const { user } = useAuth(); // current logged‑in Supabase user
  const { showToast } = useNotification();

  // Local UI state
  const [streak, setStreak] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questRewardGiven, setQuestRewardGiven] = useState(false);

  // Modal states
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [recentLevelData, setRecentLevelData] = useState(null);
  const [recentRewardData, setRecentRewardData] = useState(null);
  const [unlockedZoneData, setUnlockedZoneData] = useState(null);
  // 🔹 NEW: avatar from ProfilePage (localStorage)
  const [avatar, setAvatar] = useState(null);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [recoveryStepsRemaining, setRecoveryStepsRemaining] = useState(0);

  // 🔹 NEW: Local Geolocation Weather Environment
  const { city, weather, temp } = useEnvironment();

  useEffect(() => {
    if (!user) return;
    const key = `sq_${user.id}_avatar`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setAvatar(stored);
    }
  }, [user]);

  /* -----------------------------
        LOAD STATS FROM SUPABASE
  ------------------------------*/
  useEffect(() => {
  if (!user || statsLoaded) return;

  const loadStats = async () => {
    const { data: results, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .order("last_updated", { ascending: false })
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.error("Error loading stats:", error);
      return;
    }

    const data = results && results.length > 0 ? results[0] : null;

    const today = new Date().toISOString().split("T")[0];
    let isNewDay = false;

    if (data) {
      const dbDate = data.last_updated ? String(data.last_updated).split("T")[0] : "";

      // ----- NEW DAY DETECTION -----
      // Use localStorage last_date as the primary source of truth.
      // Supabase's last_updated may be stale if the 3s debounce didn't fire before a reload.
      // It's only a new day if BOTH local storage AND Supabase agree the date has rolled over.
      const localLastDate = window.localStorage.getItem(`sq_${user.id}_last_date`);
      isNewDay = (localLastDate !== today) && (dbDate !== today);

      // Take the HIGHER of local cache vs Supabase to never lose progress
      const dbStepsToday = isNewDay ? 0 : (data.steps_today ?? 0);
      const dbTotalSteps = data.total_steps ?? 0;
      const dbXp = data.xp ?? 0;
      const dbLevel = data.level ?? 1;
      const dbDailyGoal = data.daily_goal ?? 5000;
      const dbOnboarding = data.onboarding_completed ?? false;
      const dbWeight = data.weight_kg ?? 0;
      const dbHeight = data.height_cm ?? 0;
      const dbAge = data.age ?? 0;
      const dbHeroClass = data.hero_class ?? null;
      const dbMotivation = data.motivation ?? null;
      const dbBaseStats = data.base_stats ?? { atk: 5, def: 5, spd: 5, luck: 5, end: 5, mag: 5 };

      // Numeric fields: always take the higher of localStorage vs Supabase
      // so a stale Supabase record can never lower progress already saved locally.
      setStepsToday(prev => isNewDay ? 0 : Math.max(Number(prev) || 0, dbStepsToday));
      setTotalSteps(prev => Math.max(Number(prev) || 0, dbTotalSteps));
      setXp(prev => Math.max(Number(prev) || 0, dbXp));
      setLevel(prev => Math.max(Number(prev) || 1, dbLevel));
      setDailyGoal(dbDailyGoal); // server is authority for goal

      setOnboardingCompleted(dbOnboarding);
      setWeight(dbWeight);
      setHeight(dbHeight);
      setAge(dbAge);

      // String/object fields: prefer localStorage over Supabase.
      // Supabase may have null (missing columns, stale row) but localStorage
      // is written synchronously and is always the freshest data source.
      const localHeroClass = window.localStorage.getItem(`sq_${user.id}_hero_class`);
      const localMotivation = window.localStorage.getItem(`sq_${user.id}_motivation`);
      const rawBaseStats = window.localStorage.getItem(`sq_${user.id}_base_stats`);
      let localBaseStats = null;
      try { localBaseStats = rawBaseStats ? JSON.parse(rawBaseStats) : null; } catch {}

      setHeroClass(localHeroClass || dbHeroClass);
      setMotivation(localMotivation || dbMotivation);
      setBaseStats(localBaseStats || dbBaseStats);

      // Update last_updated + reset daily steps in Supabase if new day
      if (isNewDay) {
        await supabase
          .from("player_stats")
          .update({
            steps_today: 0,
            last_updated: today,
          })
          .eq("user_id", user.id);
      }
    } else {
      // First time user row
      const newUsername = user.email ? user.email.split("@")[0] : `Hero_${user.id.substring(0,4)}`;
      await supabase.from("player_stats").insert({
        user_id: user.id,
        username: newUsername,
        email: user.email,
        steps_today: 0,
        total_steps: 0,
        xp: 0,
        level: 1,
        daily_goal: 5000,
        onboarding_completed: false,
        last_updated: today,
      });
      setOnboardingCompleted(false);
    }

    // Load Streak
    const { data: stepHistory } = await supabase
      .from("daily_steps")
      .select("date, steps")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (stepHistory) {
      const records = new Set(stepHistory.filter(d => d.steps > 0).map(d => d.date));
      let count = 0;
      let checkDate = new Date();
      let dateStr = checkDate.toISOString().split("T")[0];

      if (records.has(dateStr) || (data && data.steps_today > 0) || isNewDay === false) {
        // Evaluate today and step backwards
        if (records.has(dateStr) || (data && data.steps_today > 0)) count = 1;
        
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split("T")[0];
        while (records.has(dateStr)) {
          count++;
          checkDate.setDate(checkDate.getDate() - 1);
          dateStr = checkDate.toISOString().split("T")[0];
        }
      } else {
        // Today has no steps yet, see if yesterday kept the streak alive
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split("T")[0];
        if (records.has(dateStr)) {
          count = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          dateStr = checkDate.toISOString().split("T")[0];
          while (records.has(dateStr)) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
            dateStr = checkDate.toISOString().split("T")[0];
          }
        }
      }
      setStreak(count);

      // --- ADAPTIVE GOAL LOGIC ---
      const currentGoal = data?.daily_goal ?? 5000;
      let goalDaysMet = 0;
      let checkDateGoal = new Date();
      let dateStrGoal = checkDateGoal.toISOString().split("T")[0];
      
      // Check if today met the goal
      if ((data && data.steps_today >= currentGoal)) {
         goalDaysMet++;
      }
      
      // Look back
      checkDateGoal.setDate(checkDateGoal.getDate() - 1);
      dateStrGoal = checkDateGoal.toISOString().split("T")[0];
      let pastRec = stepHistory.find(d => d.date === dateStrGoal);
      
      while(pastRec && pastRec.steps >= currentGoal) {
         goalDaysMet++;
         checkDateGoal.setDate(checkDateGoal.getDate() - 1);
         dateStrGoal = checkDateGoal.toISOString().split("T")[0];
         pastRec = stepHistory.find(d => d.date === dateStrGoal);
      }

      // If met for 3+ days, adaptive bump!
      if (goalDaysMet >= 3) {
        const newGoal = Math.round(currentGoal * 1.1); // 10% increase
        setDailyGoal(newGoal);
        await supabase.from("player_stats").update({ daily_goal: newGoal }).eq("user_id", user.id);
        
        // Let the user know they are scaling up!
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification("Level Up Your Activity!", { body: `You crushed your goals! Your daily goal increased to ${newGoal} steps.` });
        }
      }

    }

    setStatsLoaded(true);
  };

  loadStats();
}, [user, statsLoaded, setTotalSteps, setStepsToday, setStatsLoaded]);


  /* -----------------------------
        HELPER TO SAVE STATS
  ------------------------------*/
  const saveStats = async (stats) => {
    if (!user) return;

    const username = user.email ? user.email.split("@")[0] : `Hero_${user.id.substring(0,4)}`;
    const today = new Date().toISOString().split("T")[0];

    console.log("⚔️ Syncing stats to server...", stats);

    const { error } = await supabase.from("player_stats").update({
      username,
      email: user.email,
      last_updated: today,
      steps_today: stats.steps_today,
      total_steps: stats.total_steps,
      xp: stats.xp,
      level: stats.level
    }).eq("user_id", user.id);

    // Upsert into history table
    await supabase.from("daily_steps").upsert({
      user_id: user.id,
      date: today,
      steps: stats.steps_today
    }, { onConflict: 'user_id,date' });

    if (error) {
      console.error("❌ Error saving stats:", error);
    } else {
      console.log("✅ Stats synced successfully.");
    }
  };

  // 🔹 Periodically sync to Supabase (debounced)
  const pendingStatsRef = useRef(null);

  useEffect(() => {
    if (!user || !statsLoaded) return;

    // Keep track of the latest stats for unmount saving
    pendingStatsRef.current = {
      steps_today: stepsToday,
      total_steps: totalSteps,
      xp,
      level,
    };

    const timer = setTimeout(() => {
      saveStats(pendingStatsRef.current);
      pendingStatsRef.current = null; // Clear pending once saved
    }, 3000); // 3s debounce to avoid spamming Supabase

    // If the user navigates away (component unmounts) OR dependencies change,
    // clear the timeout. BUT if it's an unmount and we have pending stats, SAVE THEM NOW!
    return () => {
      clearTimeout(timer);
    };
  }, [user, statsLoaded, stepsToday, totalSteps, xp, level]);

  // Handle immediate save on unmount specifically
  useEffect(() => {
    return () => {
      if (pendingStatsRef.current) {
        saveStats(pendingStatsRef.current);
      }
    };
  }, [user]);

  // 🔹 CATCH-UP LOGIC: Trigger missed boss discoveries on reload/load
  useEffect(() => {
    if (!statsLoaded || !announcedZones || showZoneModal || needsRecovery) return;

    // Find ALL zones that SHOULD be announced but aren't
    const allPending = ZONES.filter(z => totalSteps >= z.requiredSteps && !announcedZones.includes(z.id));
    
    if (allPending.length > 0) {
      // 1. Mark EVERYTHING as announced immediately to stop the loop
      const allIds = allPending.map(z => z.id);
      setAnnouncedZones(prev => [...new Set([...prev, ...allIds])]);

      // 2. Only show the LATEST boss zone if there are multiple pending
      // Reverse find to get the most advanced boss the hero just unlocked
      const latestWithBoss = [...allPending].reverse().find(z => z.bossName);
      
      if (latestWithBoss) {
        setUnlockedZoneData(latestWithBoss);
        setShowZoneModal(true);
      }
    }
  }, [statsLoaded, totalSteps, announcedZones, showZoneModal, needsRecovery]);
  






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
        QUEST REMINDER NOTIFICATIONS
  ------------------------------*/
  useEffect(() => {
    if (activeQuest && !questCompleted && "Notification" in window) {
      const today = new Date().toISOString().split("T")[0];
      const lastReminded = localStorage.getItem("quest_reminded");
      const currentHour = new Date().getHours();

      // Fire push notification if it's past noon, and we haven't already today
      if (currentHour >= 12 && lastReminded !== today) {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            const stepsLeft = Number(activeQuest.steps) - questProgress;
            new Notification("StepQuest: Hero Needed!", {
              body: `Don't forget to complete your active quest: ${activeQuest.title}. Only ${stepsLeft} steps remaining!`,
            });
            localStorage.setItem("quest_reminded", today);
          }
        });
      }
    }
  }, [activeQuest, questCompleted, questProgress]);

  /* -----------------------------
        LEVEL UP LISTENER
  ------------------------------*/
  useEffect(() => {
    const needed = getXpRequired(level);
    if (xp >= needed) {
      const leftoverXp = xp - needed;
      const newLevel = level + 1;

      // Update React state
      setXp(leftoverXp);
      setLevel(newLevel);

      // Immediately push the new level AND complete progress to Supabase — don't rely on the 3s debounce.
      // This ensures reloading right after leveling up doesn't roll back any progress (steps, xp, or level).
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        
        // 1. Update primary stats (Level, XP, Steps)
        supabase.from("player_stats").update({
          level: newLevel,
          xp: leftoverXp,
          total_steps: totalSteps,
          steps_today: stepsToday,
          last_updated: today,
        }).eq("user_id", user.id).then(({ error }) => {
          if (error) console.error("Level-up Supabase sync failed:", error.message);
          else console.log("✅ High-priority sync success: Level, XP, and Steps updated.");
        });

        // 2. Update daily history immediately
        supabase.from("daily_steps").upsert({
          user_id: user.id,
          date: today,
          steps: stepsToday
        }, { onConflict: 'user_id,date' }).then(({ error }) => {
          if (error) console.error("Level-up daily_steps sync failed:", error.message);
        });
      }

      // 🎁 Guaranteed Reward every 2 levels
      if (newLevel % 2 === 0) {
        const bonusItem = rollLoot(newLevel);
        addItem(bonusItem);
        console.log(`🎁 Level Up Reward: ${bonusItem.name}`);
        setRecentRewardData(bonusItem);
        setShowQuestModal(true);
      }

      // Trigger Level Modal
      setRecentLevelData({
        oldLevel: level,
        newLevel: newLevel,
        newTitle: getHeroProgression(newLevel).title
      });
      setShowLevelModal(true);
      logSocialActivity(user.id, 'level_up', `reached Level ${newLevel}!`);
    }
  // totalSteps removed from deps — it's not used in this logic and was causing
  // unnecessary re-runs on every step gained.
  }, [xp, level, user]);

  const handleStepGainRef = useRef(null);

  useEffect(() => {
    handleStepGainRef.current = handleStepGain;
  });

  /* -----------------------------
        ACHIEVEMENT MONITORING
  ------------------------------*/
  useEffect(() => {
    if (!statsLoaded) return;
    
    const MILESTONES = [
      { id: "first100",   req: 100,   title: "First Steps",   desc: "Walked 100 total steps!" },
      { id: "stepRookie", req: 1000,  title: "Step Rookie",   desc: "Walked 1,000 total steps!" },
      { id: "stepWarrior",req: 10000, title: "Step Warrior",  desc: "Walked 10,000 total steps!" },
      { id: "marathon",   req: 42195, title: "Marathoner",    desc: "Walked a full marathon distance!" },
    ];

    MILESTONES.forEach(m => {
      if (totalSteps >= m.req) {
        unlock(m.id, m.title, m.desc);
      }
    });
  }, [totalSteps, statsLoaded, unlock]);

  /* -----------------------------
        STEP TRACKING (REAL)
  ------------------------------*/
  useEffect(() => {
    startStepTracking((steps) => {
      if (steps <= 0) return;

      setStepsToday((prev) => prev + steps);
      setTotalSteps((prev) => prev + steps);
      if (handleStepGainRef.current) handleStepGainRef.current(steps);
    }, (err) => showToast(err, "error"));

    // Cleanup: remove the devicemotion listener when the component unmounts
    return () => stopStepTracking();
  }, []);

  /* -----------------------------
        MAIN LOGIC FOR STEP GAINS
  ------------------------------*/
  // ─── THROTTLED SYNC ───
  const lastSyncTimeRef = useRef(0);
  const throttledSave = (statsToSave) => {
    const now = Date.now();
    if (now - lastSyncTimeRef.current >= 1000) {
      saveStats(statsToSave);
      lastSyncTimeRef.current = now;
    }
  };

  const handleStepGain = (amount) => {
    const newTotal = totalSteps + amount;

    // Trigger Throttled Sync during active walking
    throttledSave({
      steps_today: stepsToday + amount,
      total_steps: newTotal,
      xp,
      level
    });

    const questGoal = Number(activeQuest?.steps || 0);

    // ZONE UNLOCK DETECTION (Batched)
    const pendingInGain = ZONES.filter(z => newTotal >= z.requiredSteps && !announcedZones.includes(z.id));

    if (pendingInGain.length > 0 && !needsRecovery && !showZoneModal) {
      const allIds = pendingInGain.map(z => z.id);
      setAnnouncedZones(prev => [...new Set([...prev, ...allIds])]);

      const latestBoss = [...pendingInGain].reverse().find(z => z.bossName);
      if (latestBoss) {
        setUnlockedZoneData(latestBoss);
        setShowZoneModal(true);
      }
    }




    // Pixel knight "walk" animation
    if (knightRef.current) {
      knightRef.current.classList.add("knight-walk");
      setTimeout(() => knightRef.current.classList.remove("knight-walk"), 300);
    }

    /* RECOVERY SYSTEM */
    if (needsRecovery) {
      const remaining = Math.max(0, recoveryStepsRemaining - amount);
      setRecoveryStepsRemaining(remaining);
      if (remaining === 0) {
        setNeedsRecovery(false);
      }
    }

    /* XP SYSTEM & STREAK MULTIPLIER */
    const multiplier = streak >= 3 ? 1.1 : 1.0;
    const gainedXp = Math.round(amount * 0.1 * multiplier);
    setXp((prev) => prev + gainedXp);

    /* QUEST SYSTEM */
    if (activeQuest && !questCompleted) {
      setQuestProgress((prev) => {
        const questGoal = Number(activeQuest.steps || 0);
        if (questGoal <= 0) return 0; // Avoid logic for invalid quests

        const updated = prev + amount;
        if (updated >= questGoal && !questRewardGiven) {
          setQuestCompleted(true);
          setQuestRewardGiven(true);
          setXp((prevXp) => prevXp + (activeQuest.reward || 0));

          const item = rollLoot(level);
          addItem(item);

          setRecentRewardData(item);
          setShowQuestModal(true);
        }
        return Math.min(updated, questGoal);
      });
    }


    /* LOOT SYSTEM */
    const LOOT_STEP_INTERVAL = 50;
    const guaranteedDrop = newTotal % LOOT_STEP_INTERVAL === 0;
    const randomDrop = Math.random() < 0.05;

    if (guaranteedDrop || randomDrop) {
      const item = rollLoot(level);
      addItem(item);
      // Removed alert as it can cause navigation/scroll glitches; use a toast if available
      if (item.rarity !== 'Common') {
        logSocialActivity(user.id, 'rare_loot', `found a ${item.rarity} ${item.name}!`);
      }
      console.log(`🎒 Loot Found: ${item.name}`);
    }
  };

  /* -----------------------------
        SIMULATE STEPS (for testing)
  ------------------------------*/
  const simulateSteps = () => {
    const amount = 5000;
    const newStepsToday = stepsToday + amount;
    const newTotalSteps = totalSteps + amount;

    // 1. Update state immediately
    setStepsToday(newStepsToday);
    setTotalSteps(newTotalSteps);

    // 2. Perform aggressive sync
    saveStats({
      steps_today: newStepsToday,
      total_steps: newTotalSteps,
      xp,
      level
    });

    // 3. Trigger remaining game logic (loot, XP, etc)
    handleStepGain(amount);
  };

  /* -----------------------------
        UI VALUES
  ------------------------------*/
  const xpToNext = getXpRequired(level);
  const xpPercent = Math.min(100, Math.round(((xp || 0) / (xpToNext || 1)) * 100));

  const questGoal = activeQuest ? Number(activeQuest.steps || 0) : 0;
  const questPercent = (activeQuest && questGoal > 0)
    ? Math.min(100, Math.round((questProgress / questGoal) * 100))
    : 0;

  // Pixel knight sprite depends on level
  const heroSprite = getHeroProgression(level);
  const pixelRows = heroSprite.pixels;
  const cols = pixelRows[0].length;

  // mobile‑app style metrics
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
            {city && temp != null && (
              <p className="home-header-weather" style={{ fontSize: "0.85rem", color: "#a1a1aa", marginTop: "0.25rem", fontWeight: "600" }}>
                {weather} {temp}°C in {city}
              </p>
            )}
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
            {streak > 0 && (
              <>
                <span className="badge-icon">🔥</span>
                <span className="badge-text" style={{marginRight: "0.4rem"}}>{streak} Day Streak</span>
              </>
            )}
            <span className="badge-icon">⚔️</span>
            <span className="badge-text">LVL {level}</span>
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
            className={`hero-pixel-grid ${heroSprite.visualClass || ""}`}
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

        {/* RECOVERY BANNER */}
        {needsRecovery && (
          <section className="recovery-card animate-pulse">
            <div className="recovery-glow" />
            <p className="recovery-text">
              ❤️ Recuperating from last battle... {recoveryStepsRemaining} steps to full recovery.
            </p>
          </section>
        )}

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
            Simulate +5,000 Steps
          </button>
        </section>
      </div>

      {showQuestModal && activeQuest && (
        <QuestCompleteModal
          quest={activeQuest}
          xpGained={activeQuest.reward || 0}
          itemDropped={recentRewardData}
          onClose={() => setShowQuestModal(false)}
        />
      )}

      {showLevelModal && recentLevelData && (
        <LevelUpModal
          oldLevel={recentLevelData.oldLevel}
          newLevel={recentLevelData.newLevel}
          newTitle={recentLevelData.newTitle}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {showZoneModal && unlockedZoneData && (
        <ZoneUnlockModal
          zone={unlockedZoneData}
          onWin={() => {
            setShowZoneModal(false);
            const bossXp = 500;
            setXp(prev => prev + bossXp);
            
            // Boss loot!
            const bossLoot = rollLoot(level);
            addItem(bossLoot);
            setRecentRewardData(bossLoot);
            setShowQuestModal(true); // Reuse modal to show loot
            
            console.log(`🏆 Boss Defeated! Gained ${bossXp} XP and ${bossLoot.name}`);
            logSocialActivity(user.id, 'boss_defeat', `defeated the boss of ${unlockedZoneData.name}!`);
          }}
          onLose={() => {
            setShowZoneModal(false);
            setNeedsRecovery(true);
            setRecoveryStepsRemaining(250); // Increased recovery for boss loss
            console.log("💀 Boss defeated you. Recovery needed.");
          }}
        />
      )}
    </div>
  );
}
