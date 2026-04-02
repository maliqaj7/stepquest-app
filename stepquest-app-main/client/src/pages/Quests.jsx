import { useQuest } from "../context/QuestContext";
import "../components/Quest.css";


// ================================
// BOUNTY DATABASE (Tavern Style)
// ================================
const quests = [
  {
    id: 1,
    title: "Clear the Thicket",
    steps: 1500,
    reward: 50,
    difficulty: "Easy",
    flavor: "The village elder needs someone to trample the overgrown paths before the upcoming festival.",
    loot: "Small chance for common items.",
  },
  {
    id: 2,
    title: "Border Patrol",
    steps: 3500,
    reward: 120,
    difficulty: "Normal",
    flavor: "Goblins have been spotted near the southern borders. Step heavily to scare them off.",
    loot: "Chance for uncommon gear.",
  },
  {
    id: 3,
    title: "Mountain Summit Dash",
    steps: 8000,
    reward: 350,
    difficulty: "Hard",
    flavor: "Only the swiftest heroes brave the Frostbite Peak. Are your legs up for the challenge?",
    loot: "High chance for Rare Loot!",
  },
  {
    id: 4,
    title: "Dragon's Errand",
    steps: 12000,
    reward: 600,
    difficulty: "Epic",
    flavor: "An ancient being requires a message delivered across the realm. Fail, and be scorched.",
    loot: "Guaranteed Epic Item Drop!",
  }
];

// Difficulty colors (RPG style)
const DIFFICULTY_COLORS = {
  Easy: "#10b981",    // Emerald
  Normal: "#3b82f6",  // Blue
  Hard: "#f59e0b",    // Amber/Gold
  Epic: "#a855f7",    // Purple
};

const DIFFICULTY_ICONS = {
  Easy: "🟢",
  Normal: "🔵",
  Hard: "🟠",
  Epic: "🟣",
};

export default function Quests() {
  const { activeQuest, setActiveQuest, questProgress } = useQuest();

  const startQuest = (quest) => {
    setActiveQuest(quest);
  };

  const cancelQuest = () => {
    setActiveQuest(null);
  };

  // Safe progress calculation
  const currentGoal = activeQuest ? Number(activeQuest.steps || 0) : 0;
  const currentProgress = Number(questProgress) || 0;
  const progressPercent = currentGoal > 0 ? Math.min(100, Math.round((currentProgress / currentGoal) * 100)) : 0;

  return (
    <div className="page quests-page">
      <div className="bounty-header-wrapper">
        <h1 className="bounty-board-title">Tavern Bounty Board</h1>
        <p className="bounty-board-subtitle">Accept a mandate and prove your worth on the roads.</p>
      </div>

      {/* ACTIVE QUEST: ROYAL MANDATE */}
      {activeQuest && (
        <div className="active-mandate">
          <div className="mandate-header">
            <h2 className="mandate-title">📜 Royal Mandate Accepted</h2>
            <div className="wax-seal">★</div>
          </div>

          <div className="mandate-content">
            <h3 className="mandate-quest-name">{activeQuest.title}</h3>
            <p className="mandate-flavor">"{activeQuest.flavor}"</p>
            
            <div className="mandate-stats">
              <div className="m-stat">
                <span className="m-icon">🥾</span>
                <div>
                  <p className="m-label">Task Progress</p>
                  <p className="m-value">{currentProgress.toLocaleString()} / {currentGoal.toLocaleString()} Steps</p>
                </div>
              </div>
              <div className="m-stat">
                <span className="m-icon">✨</span>
                <div>
                  <p className="m-label">Bounty Reward</p>
                  <p className="m-value">{activeQuest.reward} XP</p>
                </div>
              </div>
            </div>

            <div className="mandate-progress-bar">
              <div className="mandate-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <button className="btn-cancel-mandate" onClick={cancelQuest}>
              Abandon Mandate
            </button>
          </div>
        </div>
      )}

      {/* BOUNTY BOARD */}
      <div className="bounty-board">
        {quests.map((q) => {
          const isActive = activeQuest && activeQuest.id === q.id;

          return (
            <div key={q.id} className={`bounty-poster ${isActive ? "poster-taken" : ""}`}>
              <div className="poster-pin" />
              
              <div className="poster-header">
                <h2 className="poster-title">{q.title}</h2>
                <div className="poster-difficulty" style={{ color: DIFFICULTY_COLORS[q.difficulty] }}>
                  {DIFFICULTY_ICONS[q.difficulty]} {q.difficulty}
                </div>
              </div>

              <p className="poster-flavor">"{q.flavor}"</p>
              
              <div className="poster-details">
                <p><strong>Req:</strong> {q.steps.toLocaleString()} Steps</p>
                <p><strong>Bounty:</strong> {q.reward} XP</p>
                {q.loot && <p className="poster-loot">🎁 {q.loot}</p>}
              </div>

              <button
                className="btn-accept-bounty"
                onClick={() => startQuest(q)}
                disabled={isActive}
              >
                {isActive ? "ACCEPTED" : "Tear off & Accept"}
              </button>

              {isActive && <div className="stamp-taken">TAKEN</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
