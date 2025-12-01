import { useQuest } from "../context/QuestContext";
import "../components/Quest.css";


// ================================
// QUEST DATABASE (RPG Style)
// ================================
const quests = [
  {
    id: 1,
    title: "Forest Walk",
    steps: 1500,
    reward: 50,
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Village Patrol",
    steps: 3000,
    reward: 100,
    difficulty: "Normal",
  },
  {
    id: 3,
    title: "Mountain Trail",
    steps: 5000,
    reward: 150,
    difficulty: "Hard",
  },
];

// Difficulty colors (RPG style)
const DIFFICULTY_COLORS = {
  Easy: "#4caf50",
  Normal: "#2196f3",
  Hard: "#ff9800",
};

export default function Quests() {
  const { activeQuest, setActiveQuest } = useQuest();

  const startQuest = (quest) => {
    setActiveQuest(quest);
  };

  const cancelQuest = () => {
    setActiveQuest(null);
  };

  return (
    <div className="page">
      <h1 className="page-title">Quest Board</h1>

      {/* ACTIVE QUEST PANEL */}
      {activeQuest && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2 className="card-title">Current Quest</h2>

          <p className="stat">
            <span className="stat-highlight">{activeQuest.title}</span>
          </p>
          <p className="stat">Steps Required: {activeQuest.steps}</p>
          <p className="stat">Reward: {activeQuest.reward} XP</p>
          <p
            className="stat"
            style={{
              color: DIFFICULTY_COLORS[activeQuest.difficulty],
              fontWeight: "bold",
            }}
          >
            Difficulty: {activeQuest.difficulty}
          </p>

          <button className="btn-secondary" onClick={cancelQuest} style={{ marginTop: "0.5rem" }}>
            Cancel Quest
          </button>
        </div>
      )}

      {/* QUEST LIST */}
      <div className="card-grid">
        {quests.map((q) => {
          const isActive = activeQuest && activeQuest.id === q.id;

          return (
            <div key={q.id} className="card quest-card">
              <div className="card-header">
                <h2 className="card-title">{q.title}</h2>
              </div>

              <p className="stat">Steps Required: {q.steps}</p>
              <p className="stat">Reward: {q.reward} XP</p>

              {/* Difficulty label */}
              <p
                className="quest-difficulty"
                style={{ color: DIFFICULTY_COLORS[q.difficulty] }}
              >
                {q.difficulty}
              </p>

              <button
                className="btn-secondary"
                onClick={() => startQuest(q)}
                disabled={isActive}
                style={isActive ? { opacity: 0.6, cursor: "default" } : {}}
              >
                {isActive ? "Active Quest" : "Start Quest"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
