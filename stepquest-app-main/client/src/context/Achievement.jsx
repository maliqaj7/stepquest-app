import { createContext, useContext, useState } from "react";
import { useNotification } from "./NotificationContext";

const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState([]);
  const { showToast } = useNotification();

  const unlock = (id, title, description) => {

    if (achievements.some(a => a.id === id)) return;

    const achievement = { id, title, description };
    setAchievements(prev => [...prev, achievement]);

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
