import { createContext, useContext, useState } from "react";
import { useNotification } from "./NotificationContext";

const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("sq_unlocked_achievements");
    return saved ? JSON.parse(saved) : [];
  });
  const { showToast } = useNotification();

  const unlock = (id, title, description) => {
    if (achievements.some(a => a.id === id)) return;

    const achievement = { id, title, description, timestamp: new Date().toISOString() };
    const updated = [...achievements, achievement];
    setAchievements(updated);
    localStorage.setItem("sq_unlocked_achievements", JSON.stringify(updated));

    showToast(`🏆 Achievement Unlocked!\n${title}\n${description}`, "achievement", 5000);
  };

  return (
    <AchievementContext.Provider value={{ achievements, unlock }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementContext);
}
