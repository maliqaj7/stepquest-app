import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

import knight1 from "../assets/Knight.png";
import knight2 from "../assets/Evil Knight.png";
import knight3 from "../assets/Female Knight.png";
import knight4 from "../assets/Goblin.jpg";

const QuestContext = createContext();

const DEFAULT_STATS = { atk: 5, def: 5, spd: 5, luck: 5, end: 5, mag: 5 };

// Helper: safely read a number from localStorage
const readNum = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v != null && v !== "NaN" && v !== "undefined" ? Number(v) : fallback;
  } catch { return fallback; }
};

// Helper: read JSON from localStorage
const readJSON = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

// Helper: write to localStorage immediately
const write = (key, value) => {
  try {
    if (typeof value === "object") {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      window.localStorage.setItem(key, String(value));
    }
  } catch {}
};

const userKey = (userId, key) => `sq_${userId}_${key}`;

// Data Migration & Read Helper (Synchronous)
const getInitialValue = (userId, oldKeyStr, newKeyStr, fallback, isJSON = false) => {
  if (!userId) return fallback;
  const newKey = `sq_${userId}_${newKeyStr}`;
  const oldKey = `sq_${oldKeyStr}`;
  
  try {
    const oldVal = window.localStorage.getItem(oldKey);
    const newVal = window.localStorage.getItem(newKey);
    
    // Migrate if needed
    if (oldVal && !newVal) {
      window.localStorage.setItem(newKey, oldVal);
      window.localStorage.removeItem(oldKey);
      
      if (isJSON) {
        const parsedOld = JSON.parse(oldVal);
        return parsedOld !== null ? parsedOld : fallback;
      }
      return oldVal !== "null" && oldVal !== "NaN" && oldVal !== "undefined" ? Number(oldVal) : fallback;
    }
    
    // No migration needed. Read newKey safely.
    if (isJSON) {
      if (!newVal) return fallback;
      const parsedNew = JSON.parse(newVal);
      return parsedNew !== null ? parsedNew : fallback;
    } else {
      return newVal != null && newVal !== "NaN" && newVal !== "undefined" && newVal !== "null" ? Number(newVal) : fallback;
    }
  } catch {
    return fallback;
  }
};

export function QuestProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // ─── STATE (Synchronously initialized directly from localStorage) ───
  const [activeQuest, setActiveQuest] = useState(null);
  const [questProgress, setQuestProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(() => getInitialValue(userId, "total_steps", "total_steps", 0));
  const [stepsToday, setStepsToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = window.localStorage.getItem(`sq_${userId}_last_date`);
    if (lastDate && lastDate !== today) {
      // New day -> reset local steps synchronously
      window.localStorage.setItem(`sq_${userId}_steps_today`, "0");
      window.localStorage.setItem(`sq_${userId}_last_date`, today);
      return 0;
    }
    return getInitialValue(userId, "steps_today", "steps_today", 0);
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [level, setLevel] = useState(() => getInitialValue(userId, "level", "level", 1));
  const [xp, setXp] = useState(() => getInitialValue(userId, "xp", "xp", 0));
  const [dailyGoal, setDailyGoal] = useState(() => getInitialValue(userId, "daily_goal", "daily_goal", 5000));
  const [baseStats, setBaseStats] = useState(() => {
    const val = getInitialValue(userId, "base_stats", "base_stats", { ...DEFAULT_STATS }, true);
    return { ...DEFAULT_STATS, ...val };
  });
  const [spentPoints, setSpentPoints] = useState(() => getInitialValue(userId, "spent_points", "spent_points", 0));
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    if (!userId) return knight1;
    const key = `sq_${userId}_avatar`;
    return window.localStorage.getItem(key) || knight1;
  });
  const [completedQuests, setCompletedQuests] = useState([]);

  // ─── LOAD USER-SCOPED DATA WHEN USER CHANGES ───
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    if (userId === prevUserIdRef.current) return; // same user, do nothing
    prevUserIdRef.current = userId;

    if (!userId) {
      // Logged out → reset to defaults
      setActiveQuest(null);
      setQuestProgress(0);
      setTotalSteps(0);
      setStepsToday(0);
      setLevel(1);
      setXp(0);
      setDailyGoal(5000);
      setBaseStats({ ...DEFAULT_STATS });
      setSpentPoints(0);
      setSelectedAvatar(knight1);
      setCompletedQuests([]);
      setStatsLoaded(false);
      return;
    }

    // Check daily reset on user change
    const today = new Date().toLocaleDateString();
    const lastDate = window.localStorage.getItem(`sq_${userId}_last_date`);
    let initSteps = getInitialValue(userId, "steps_today", "steps_today", 0);
    
    if (lastDate && lastDate !== today) {
      initSteps = 0;
      window.localStorage.setItem(`sq_${userId}_steps_today`, "0");
      window.localStorage.setItem(`sq_${userId}_last_date`, today);
    }

    setTotalSteps(getInitialValue(userId, "total_steps", "total_steps", 0));
    setStepsToday(initSteps);
    setLevel(getInitialValue(userId, "level", "level", 1));
    setXp(getInitialValue(userId, "xp", "xp", 0));
    setDailyGoal(getInitialValue(userId, "daily_goal", "daily_goal", 5000));
    setBaseStats(getInitialValue(userId, "base_stats", "base_stats", { ...DEFAULT_STATS }, true));
    setSpentPoints(getInitialValue(userId, "spent_points", "spent_points", 0));
    const avatarKey = `sq_${userId}_avatar`;
    setSelectedAvatar(window.localStorage.getItem(avatarKey) || knight1);
    setCompletedQuests([]);
    setActiveQuest(null);
    setQuestProgress(0);
    setStatsLoaded(false); // force Supabase reload for this user
  }, [userId]);

  // ─── PERSIST TO USER-SCOPED LOCALSTORAGE ON EVERY CHANGE ───
  useEffect(() => {
    if (!userId || !statsLoaded) return;
    const today = new Date().toLocaleDateString();
    
    // Check if the day rolled over WHILE the user was active
    const lastDate = window.localStorage.getItem(`sq_${userId}_last_date`);
    if (lastDate && lastDate !== today) {
      setStepsToday(0); // dynamically reset if midnight strikes
    }

    write(userKey(userId, "last_date"), today);
    write(userKey(userId, "total_steps"), totalSteps);
    write(userKey(userId, "steps_today"), stepsToday);
    write(userKey(userId, "level"), level);
    write(userKey(userId, "xp"), xp);
    write(userKey(userId, "daily_goal"), dailyGoal);
  }, [userId, statsLoaded, totalSteps, stepsToday, level, xp, dailyGoal]);

  // ─── RPG STAT PERSISTENCE ───
  const saveRpgStats = useCallback((stats, points) => {
    if (!userId) return;
    write(userKey(userId, "base_stats"), stats);
    write(userKey(userId, "spent_points"), points);
  }, [userId]);

  // Persist Avatar
  useEffect(() => {
    if (!userId) return;
    const key = `sq_${userId}_avatar`;
    window.localStorage.setItem(key, selectedAvatar);
  }, [selectedAvatar, userId]);

  // Points calculation with safety check
  const safeSpent = isNaN(Number(spentPoints)) ? 0 : Number(spentPoints);
  const availablePoints = Math.max(0, (level - 1) * 2 - safeSpent);

  const commitStats = useCallback((increments) => {
    if (!userId) return;
    setBaseStats(prev => {
      const newStats = { ...prev };
      let totalAdded = 0;
      Object.entries(increments).forEach(([stat, val]) => {
        newStats[stat] = (newStats[stat] || 0) + val;
        totalAdded += val;
      });

      setSpentPoints(p => {
        const newSpent = p + totalAdded;
        write(userKey(userId, "base_stats"), newStats);
        write(userKey(userId, "spent_points"), newSpent);
        return newSpent;
      });

      return newStats;
    });
  }, [userId]);

  const upgradeStat = useCallback((statName) => {
    if (availablePoints <= 0) return;
    commitStats({ [statName]: 1 });
  }, [availablePoints, commitStats]);

  const completeQuest = useCallback((quest) => {
    if (!quest) return;
    setCompletedQuests((prev) => [
      ...prev,
      { ...quest, completedAt: new Date().toISOString() },
    ]);
    setActiveQuest(null);
  }, []);

  const value = useMemo(() => ({
    activeQuest, setActiveQuest,
    questProgress, setQuestProgress,
    totalSteps, setTotalSteps,
    stepsToday, setStepsToday,
    statsLoaded, setStatsLoaded,
    level, setLevel,
    xp, setXp,
    dailyGoal, setDailyGoal,
    baseStats, availablePoints, upgradeStat, commitStats,
    selectedAvatar, setSelectedAvatar,
    completedQuests, completeQuest,
  }), [
    activeQuest, questProgress, totalSteps, stepsToday, statsLoaded,
    level, xp, dailyGoal, baseStats, availablePoints,
    upgradeStat, completedQuests, completeQuest
  ]);

  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  return useContext(QuestContext);
}
