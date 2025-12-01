import { useState } from "react";
import { useQuest } from "../context/QuestContext";

export default function AIQuestMaster() {
  const [input, setInput] = useState("");
  const [quest, setQuest] = useState(null);

  const { setActiveQuest } = useQuest();

  // Difficulty tiers
  const difficultyLevels = [
    { name: "Easy", multiplier: 0.8, reward: 50 },
    { name: "Normal", multiplier: 1.0, reward: 75 },
    { name: "Hard", multiplier: 1.4, reward: 120 },
    { name: "Epic", multiplier: 1.8, reward: 180 },
    { name: "Mythic", multiplier: 2.5, reward: 300 },
  ];

  const generateQuest = () => {
    if (!input.trim()) return;

    // Pick difficulty at random
    const diff = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];

    // Steps scale by difficulty
    const baseSteps = 1500 + Math.floor(Math.random() * 1500);
    const scaledSteps = Math.round(baseSteps * diff.multiplier);

    // Build quest object
    const newQuest = {
      title: `${diff.name} Quest: ${input}`,
      description: `A quest forged from your request: "${input}".`,
      steps: scaledSteps,
      reward: `${diff.reward} XP`,
      difficulty: diff.name,
    };

    setQuest(newQuest);
  };

  const acceptQuest = () => {
    if (!quest) return;
    setActiveQuest(quest);
    alert(`Quest Accepted: ${quest.title}`);
  };

  return (
    <div className="page">
      <h1 className="page-title">AI Quest Master</h1>

      <textarea
        className="textarea"
        rows="4"
        placeholder="Describe the quest you want…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button className="btn-primary" onClick={generateQuest}>
        Generate Quest
      </button>

      {quest && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2 className="card-title">{quest.title}</h2>
          <p>{quest.description}</p>
          <p>Difficulty: <strong>{quest.difficulty}</strong></p>
          <p>Steps Required: {quest.steps}</p>
          <p>Reward: {quest.reward}</p>

          <button className="btn-secondary" onClick={acceptQuest} style={{ marginTop: "1rem" }}>
            Accept Quest
          </button>
        </div>
      )}
    </div>
  );
}
