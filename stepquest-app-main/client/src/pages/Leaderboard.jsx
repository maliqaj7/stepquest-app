import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchLeaderboard } from "../services/socialService";
import "./Leaderboard.css";

// Helper component for the Podium Blocks
const PodiumSlot = ({ rank, row, isYou }) => {
  if (!row) {
    // If there aren't enough players to fill this slot
    return (
      <div className={`podium-slot rank-${rank}`} style={{ opacity: 0.5 }}>
        <div className="podium-avatar">?</div>
        <div className="podium-base">
           <div className="podium-glow-ring"></div>
           <div className="podium-rank-num">{rank}</div>
           <div className="podium-name">Empty Slot</div>
        </div>
      </div>
    );
  }

  const name = isYou ? "You" : (row.username || `Hero ${row.user_id.substring(0,4)}`);
  // Just grabbing the first letter for the avatar
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`podium-slot rank-${rank}`}>
      <div className="podium-avatar">{initial}</div>
      <div className="podium-base">
        <div className="podium-glow-ring"></div>
        <div className="podium-rank-num">{rank}</div>
        <div className="podium-name">{name}</div>
        <div className="podium-steps">{row.total_steps?.toLocaleString() || 0}</div>
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchLeaderboard(20);
      setRows(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="leaderboard-epic-container">
      <div className="leaderboard-epic-content">
        
        {/* Majestic Header */}
        <header className="epic-header">
          <h1 className="epic-title">Compete, Conquer</h1>
          <div className="epic-subtitle">Rise Up Leaderboards &bull; Earn Legendary Rewards</div>
        </header>

        {loading && <p style={{ color: "#fbbf24", fontFamily: 'Cinzel' }}>Summoning the rankings...</p>}

        {!loading && rows.length === 0 && (
          <p style={{ color: "#a1a1aa", fontFamily: 'Cinzel' }}>The realm is empty. Be the first to step forth!</p>
        )}

        {!loading && rows.length > 0 && (
          <>
            {/* TOP 3 PODIUM */}
            <div className="podium-container">
              {/* Order: 2nd, 1st, 3rd for visual podium layout */}
              <PodiumSlot 
                rank={2} 
                row={rows[1]} 
                isYou={user && rows[1]?.user_id === user.id} 
              />
              <PodiumSlot 
                rank={1} 
                row={rows[0]} 
                isYou={user && rows[0]?.user_id === user.id} 
              />
              <PodiumSlot 
                rank={3} 
                row={rows[2]} 
                isYou={user && rows[2]?.user_id === user.id} 
              />
            </div>

            {/* LIVE RANKINGS LIST (Rank 4+) */}
            {rows.length > 3 && (
              <div className="epic-list-container">
                <h2 className="epic-list-header">Live Rankings</h2>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {rows.slice(3).map((row, idx) => {
                    const realRank = idx + 4; // Because we sliced off top 3
                    const isYou = user && row.user_id === user.id;
                    const name = isYou ? "You" : (row.username || `Hero ${row.user_id.substring(0,4)}`);

                    return (
                      <div key={row.user_id + idx} className={`epic-list-item ${isYou ? "is-you" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                          <span className="epic-item-rank">#{realRank}</span>
                          <span className="epic-item-name">{name}</span>
                        </div>
                        <span className="epic-item-steps">
                          {row.total_steps?.toLocaleString() || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
