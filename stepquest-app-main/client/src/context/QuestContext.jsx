import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { ZONES } from "../data/zones";
import { supabase } from "../supabaseClient";

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

// Helper: read a plain string from localStorage (avoids Number() coercion)
const readStr = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    if (v === null || v === "undefined" || v === "null" || v === "") return fallback;
    return v;
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
    const today = new Date().toISOString().split("T")[0];
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
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => getInitialValue(userId, "onboarding_completed", "onboarding_completed", false));
  const [weight, setWeight] = useState(() => getInitialValue(userId, "weight_kg", "weight_kg", 0));
  const [height, setHeight] = useState(() => getInitialValue(userId, "height_cm", "height_cm", 0));
  const [age, setAge] = useState(() => getInitialValue(userId, "age", "age", 0));
  // String fields — must NOT go through Number() coercion, use readStr directly
  const [heroClass, setHeroClass] = useState(() => {
    if (!userId) return null;
    return readStr(`sq_${userId}_hero_class`, null);
  });
  const [motivation, setMotivation] = useState(() => {
    if (!userId) return null;
    return readStr(`sq_${userId}_motivation`, null);
  });
  
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
  const [announcedZones, setAnnouncedZones] = useState(() => {
    const stored = getInitialValue(userId, "announced_zones", "announced_zones", null, true);
    if (stored !== null) return stored;
    // Fallback: if we have steps but no history, pre-fill to avoid "discovery spam"
    const currentSteps = getInitialValue(userId, "total_steps", "total_steps", 0);
    if (currentSteps > 0) {
      return ZONES.filter(z => currentSteps >= z.requiredSteps).map(z => z.id);
    }
    return [];
  });

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
      setAnnouncedZones([]);
      setStatsLoaded(false);
      return;
    }

    // Check daily reset on user change
    const today = new Date().toISOString().split("T")[0];
    const lastDate = window.localStorage.getItem(`sq_${userId}_last_date`);
    let initSteps = getInitialValue(userId, "steps_today", "steps_today", 0);
    
    if (lastDate && lastDate !== today) {
      initSteps = 0;
      window.localStorage.setItem(`sq_${userId}_steps_today`, "0");
      window.localStorage.setItem(`sq_${userId}_last_date`, today);
    }

    setTotalSteps(getInitialValue(userId, "total_steps", "total_steps", 0));
    setStepsToday(initSteps);
    setOnboardingCompleted(getInitialValue(userId, "onboarding_completed", "onboarding_completed", false));
    setWeight(getInitialValue(userId, "weight_kg", "weight_kg", 0));
    setHeight(getInitialValue(userId, "height_cm", "height_cm", 0));
    setAge(getInitialValue(userId, "age", "age", 0));
    setHeroClass(readStr(`sq_${userId}_hero_class`, null));
    setMotivation(readStr(`sq_${userId}_motivation`, null));
    
    setLevel(getInitialValue(userId, "level", "level", 1));
    setXp(getInitialValue(userId, "xp", "xp", 0));
    setDailyGoal(getInitialValue(userId, "daily_goal", "daily_goal", 5000));
    setBaseStats(getInitialValue(userId, "base_stats", "base_stats", { ...DEFAULT_STATS }, true));
    setSpentPoints(getInitialValue(userId, "spent_points", "spent_points", 0));
    const avatarKey = `sq_${userId}_avatar`;
    setSelectedAvatar(window.localStorage.getItem(avatarKey) || knight1);
    setCompletedQuests([]);
    
    const hist = getInitialValue(userId, "announced_zones", "announced_zones", null, true);
    if (hist !== null) {
      setAnnouncedZones(hist);
    } else {
      // Catch-up if history is missing but steps are present
      const curSteps = getInitialValue(userId, "total_steps", "total_steps", 0);
      setAnnouncedZones(ZONES.filter(z => curSteps >= z.requiredSteps).map(z => z.id));
    }

    setActiveQuest(null);
    setQuestProgress(0);
    setStatsLoaded(false); // force Supabase reload for this user
  }, [userId]);

  // ─── PERSIST TO USER-SCOPED LOCALSTORAGE ON EVERY CHANGE ───
  useEffect(() => {
    if (!userId) return;

    if (statsLoaded) {
      const today = new Date().toISOString().split("T")[0];

      // Check if the day rolled over WHILE the user was active
      const lastDate = window.localStorage.getItem(`sq_${userId}_last_date`);
      if (lastDate && lastDate !== today) {
        setStepsToday(0); // dynamically reset if midnight strikes
      }

      write(userKey(userId, "onboarding_completed"), onboardingCompleted);
      write(userKey(userId, "daily_goal"), dailyGoal);
    }

    // ── ALWAYS persist these immediately — never gate on statsLoaded ─────────
    // Steps, level, XP and last_date must survive a page reload even if the
    // 3-second Supabase debounce hasn't fired yet.
    const today = new Date().toISOString().split("T")[0];
    write(userKey(userId, "last_date"), today);
    write(userKey(userId, "total_steps"), totalSteps);
    write(userKey(userId, "steps_today"), stepsToday);
    write(userKey(userId, "level"), level);
    write(userKey(userId, "xp"), xp);

    // Persist physical stats independently
    write(userKey(userId, "weight_kg"), weight);
    write(userKey(userId, "height_cm"), height);
    write(userKey(userId, "age"), age);
    write(userKey(userId, "hero_class"), heroClass);
    write(userKey(userId, "motivation"), motivation);

    // Always persist announced_zones to ensure zone discovery is never lost
    write(userKey(userId, "announced_zones"), announcedZones);
  }, [userId, statsLoaded, totalSteps, stepsToday, level, xp, dailyGoal, announcedZones]);

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

  // Stat bonus map for classes
  const CLASS_BONUS_STAT = { Warrior: "atk", Ranger: "spd", Mage: "mag" };

  const completeOnboarding = useCallback(async (data) => {
    if (!userId) return;
    
    // 1. Calculate base stats with class bonus (all start at 5)
    const initialStats = { ...DEFAULT_STATS };
    if (data.heroClass === "Warrior") initialStats.atk += 2;
    if (data.heroClass === "Ranger") initialStats.spd += 2;
    if (data.heroClass === "Mage") initialStats.mag += 2;

    // 2. Update local state immediately so UI reflects change
    setWeight(data.weight);
    setHeight(data.height);
    setAge(data.age);
    setHeroClass(data.heroClass);
    setMotivation(data.motivation);
    setBaseStats(initialStats);
    setOnboardingCompleted(true);
    // Persist onboarding flag to localStorage immediately so ProtectedRoute sees it
    window.localStorage.setItem(`sq_${userId}_onboarding_completed`, "true");

    // 3. Read any existing row to avoid overwriting gameplay progress
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("player_stats")
      .select("steps_today, total_steps, xp, level, daily_goal, username")
      .eq("user_id", userId)
      .maybeSingle();

    // 4. Upsert — inserts if row absent, updates if present.
    // Use Math.max so onboarding can NEVER lower an existing player's level/progress.
    const { error } = await supabase.from("player_stats").upsert({
      user_id: userId,
      username: existing?.username || `Hero_${userId.substring(0, 4)}`,
      steps_today: Math.max(existing?.steps_today ?? 0, stepsToday),
      total_steps: Math.max(existing?.total_steps ?? 0, totalSteps),
      xp: Math.max(existing?.xp ?? 0, xp),
      level: Math.max(existing?.level ?? 1, level),
      daily_goal: existing?.daily_goal ?? dailyGoal,
      last_updated: today,
      weight_kg: data.weight,
      height_cm: data.height,
      age: data.age,
      hero_class: data.heroClass,
      motivation: data.motivation,
      onboarding_completed: true,
      base_stats: initialStats,
    }, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  }, [userId]);

  /**
   * changeHeroClass — respec with a stat transfer penalty.
   * Old class bonus (-2) is removed. New class gets +1 (50% transfer).
   * The lost point is a respec cost — encourages thoughtful class choice.
   */
  const changeHeroClass = useCallback(async (newClass) => {
    if (!userId || !newClass) return;
    if (heroClass === newClass) return; // already this class, nothing to do

    const newStat = CLASS_BONUS_STAT[newClass];
    const newStats = { ...baseStats };

    if (heroClass) {
      // RESPEC — penalty applies: remove old +2, give new +1
      const oldStat = CLASS_BONUS_STAT[heroClass];
      newStats[oldStat] = Math.max(1, (newStats[oldStat] || 5) - 2);
      newStats[newStat] = (newStats[newStat] || 5) + 1;
    } else {
      // FIRST-TIME selection — no penalty, full +2
      newStats[newStat] = (newStats[newStat] || 5) + 2;
    }

    setBaseStats(newStats);
    setHeroClass(newClass);
    write(userKey(userId, "base_stats"), newStats);
    write(userKey(userId, "hero_class"), newClass);
    // Also mark onboarding as done in localStorage in case they skipped
    window.localStorage.setItem(`sq_${userId}_onboarding_completed`, "true");

    const { error } = await supabase.from("player_stats").update({
      hero_class: newClass,
      base_stats: newStats,
      onboarding_completed: true,
    }).eq("user_id", userId);

    // Don't throw — local state + localStorage are already updated.
    if (error) {
      console.error("changeHeroClass: Supabase sync failed:", error.message);
    }
    return { newStat, isFirstTime: !heroClass };
  }, [userId, heroClass, baseStats]);

  const value = useMemo(() => ({
    activeQuest, setActiveQuest,
    questProgress, setQuestProgress,
    totalSteps, setTotalSteps,
    stepsToday, setStepsToday,
    statsLoaded, setStatsLoaded,
    onboardingCompleted, setOnboardingCompleted,
    weight, setWeight,
    height, setHeight,
    age, setAge,
    heroClass, setHeroClass,
    motivation, setMotivation,
    level, setLevel,
    xp, setXp,
    dailyGoal, setDailyGoal,
    baseStats, availablePoints, upgradeStat, commitStats,
    selectedAvatar, setSelectedAvatar,
    completedQuests, completeQuest,
    announcedZones, setAnnouncedZones,
    completeOnboarding,
    changeHeroClass,
    userId,
  }), [
    activeQuest, questProgress, totalSteps, stepsToday, statsLoaded,
    onboardingCompleted, weight, height, age, heroClass, motivation,
    level, xp, dailyGoal, baseStats, availablePoints,
    upgradeStat, completedQuests, completeQuest, announcedZones,
    completeOnboarding, changeHeroClass, userId
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
