import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const QuestContext = createContext();

const DEFAULT_STATS = { atk: 5, def: 5, spd: 5, luck: 5, end: 5 };

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
  const [totalSteps, setTotalSteps] = useState(() => getInitialValue(userId, "total_steps", "total_steps", 0));
  const [stepsToday, setStepsToday] = useState(() => getInitialValue(userId, "steps_today", "steps_today", 0));
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [level, setLevel] = useState(() => getInitialValue(userId, "level", "level", 1));
  const [xp, setXp] = useState(() => getInitialValue(userId, "xp", "xp", 0));
  const [dailyGoal, setDailyGoal] = useState(() => getInitialValue(userId, "daily_goal", "daily_goal", 5000));
  const [baseStats, setBaseStats] = useState(() => getInitialValue(userId, "base_stats", "base_stats", { ...DEFAULT_STATS }, true));
  const [spentPoints, setSpentPoints] = useState(() => getInitialValue(userId, "spent_points", "spent_points", 0));
  const [completedQuests, setCompletedQuests] = useState([]);

  // ─── LOAD USER-SCOPED DATA WHEN USER CHANGES ───
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    if (userId === prevUserIdRef.current) return; // same user, do nothing
    prevUserIdRef.current = userId;

    if (!userId) {
      // Logged out → reset to defaults
      setActiveQuest(null);
      setTotalSteps(0);
      setStepsToday(0);
      setLevel(1);
      setXp(0);
      setDailyGoal(5000);
      setBaseStats({ ...DEFAULT_STATS });
      setSpentPoints(0);
      setCompletedQuests([]);
      setStatsLoaded(false);
      return;
    }

    // Load this user's cached data directly using the safe initialization method
    setTotalSteps(getInitialValue(userId, "total_steps", "total_steps", 0));
    setStepsToday(getInitialValue(userId, "steps_today", "steps_today", 0));
    setLevel(getInitialValue(userId, "level", "level", 1));
    setXp(getInitialValue(userId, "xp", "xp", 0));
    setDailyGoal(getInitialValue(userId, "daily_goal", "daily_goal", 5000));
    setBaseStats(getInitialValue(userId, "base_stats", "base_stats", { ...DEFAULT_STATS }, true));
    setSpentPoints(getInitialValue(userId, "spent_points", "spent_points", 0));
    setCompletedQuests([]);
    setActiveQuest(null);
    setStatsLoaded(false); // force Supabase reload for this user
  }, [userId]);

  // ─── PERSIST TO USER-SCOPED LOCALSTORAGE ON EVERY CHANGE ───
  useEffect(() => {
    if (!userId || !statsLoaded) return;
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

  // Points calculation with safety check
  const safeSpent = isNaN(Number(spentPoints)) ? 0 : Number(spentPoints);
  const availablePoints = Math.max(0, (level - 1) * 2 - safeSpent);

  const upgradeStat = useCallback((statName) => {
    if (availablePoints <= 0) return;
    setBaseStats(prev => {
      const newStats = { ...prev, [statName]: prev[statName] + 1 };
      setSpentPoints(p => {
        const newSpent = p + 1;
        saveRpgStats(newStats, newSpent);
        return newSpent;
      });
      return newStats;
    });
  }, [availablePoints, saveRpgStats]);

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
    totalSteps, setTotalSteps,
    stepsToday, setStepsToday,
    statsLoaded, setStatsLoaded,
    level, setLevel,
    xp, setXp,
    dailyGoal, setDailyGoal,
    baseStats, availablePoints, upgradeStat,
    completedQuests, completeQuest,
  }), [
    activeQuest, totalSteps, stepsToday, statsLoaded,
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
