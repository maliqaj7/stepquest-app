import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchLeaderboard } from "../services/socialService";

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
    <div className="page">
      <h1 className="page-title">Leaderboard</h1>

      <div className="card">
        <p className="stat">
          See who&apos;s walking the furthest in StepQuest.
        </p>
        {loading && <p className="stat muted">Loading...</p>}

        {!loading && rows.length === 0 && (
          <p className="stat muted">No data yet. Start walking!</p>
        )}

        {!loading && rows.length > 0 && (
          <ol style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
            {rows.map((row, idx) => {
              const isYou = user && row.user_id === user.id;
              return (
                <li
                  key={row.user_id + idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.4rem 0.2rem",
                    borderBottom: "1px solid #111827",
                  }}
                >
                  <div>
                    <span style={{ marginRight: "0.5rem" }}>#{idx + 1}</span>
                    <span style={{ fontWeight: isYou ? 700 : 500 }}>
                      {isYou ? "You" : row.username || `Hero ${idx + 1}`}
                    </span>
                  </div>
                  <span className="stat-highlight">
                    {row.total_steps?.toLocaleString() || 0} steps
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
