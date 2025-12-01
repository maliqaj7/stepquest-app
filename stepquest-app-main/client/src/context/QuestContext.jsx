import { createContext, useContext, useState } from "react";

const QuestContext = createContext();

export function QuestProvider({ children }) {
  // Currently active quest (or null if none)
  const [activeQuest, setActiveQuest] = useState(null);

  // Total lifetime steps (used for map progression)
  const [totalSteps, setTotalSteps] = useState(0);

  // Completed quests history (for achievements later)
  const [completedQuests, setCompletedQuests] = useState([]);

  // Save completed quests + rewards
  const completeQuest = (quest) => {
    if (!quest) return;

    setCompletedQuests((prev) => [
      ...prev,
      {
        ...quest,
        completedAt: new Date().toISOString(),
      },
    ]);

    // Remove active quest
    setActiveQuest(null);
  };

  return (
    <QuestContext.Provider
      value={{
        activeQuest,
        setActiveQuest,
        totalSteps,
        setTotalSteps,
        completedQuests,
        completeQuest,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  return useContext(QuestContext);
}
