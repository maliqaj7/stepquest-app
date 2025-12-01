import { createContext, useContext, useState } from "react";

const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState([]);

  const unlock = (id, title, description) => {

    if (achievements.some(a => a.id === id)) return;

    const achievement = { id, title, description };
    setAchievements(prev => [...prev, achievement]);

    alert(`🏆 Achievement Unlocked!\n${title}\n${description}`);
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
