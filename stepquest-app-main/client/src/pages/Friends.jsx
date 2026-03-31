import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchFriends, addFriend, removeFriend } from "../services/socialService";

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const data = await fetchFriends(user.id);
      setFriends(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSaving(true);
    const { error } = await addFriend(user.id, email.trim(), nickname.trim());
    setSaving(false);

    if (error) {
      alert(error.message || "Could not add friend – check console.");
      return;
    }

    setEmail("");
    setNickname("");
    const data = await fetchFriends(user.id);
    setFriends(data);
  };

  const handleRemove = async (id) => {
    await removeFriend(id);
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="page">
      <h1 className="page-title">Friends</h1>

      <div className="card">
        <p className="stat" style={{ marginBottom: "0.75rem" }}>
          Add friends by email to build your party.
        </p>

        <form
          onSubmit={handleAdd}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <input
            type="email"
            placeholder="Friend's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Nickname (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="input"
          />
          <button
            className="btn-primary full-width"
            type="submit"
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Friend"}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="card-title">Your Party</h2>
        {loading && <p className="stat muted">Loading friends...</p>}
        {!loading && friends.length === 0 && (
          <p className="stat muted">No friends added yet.</p>
        )}
        {!loading &&
          friends.map((f) => (
            <div
              key={f.id}
              style={{
                padding: "0.75rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <p className="stat" style={{ margin: 0 }}>
                {f.nickname || f.friend_email}{" "}
                <span className="stat muted" style={{ fontSize: "0.8rem" }}>
                  ({f.friend_email})
                </span>
              </p>
              <button 
                className="remove-item-btn" 
                onClick={() => handleRemove(f.id)}
              >
                ✖
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
