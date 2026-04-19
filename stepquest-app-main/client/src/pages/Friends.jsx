import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuest } from "../context/QuestContext";
import { useInventory } from "../context/InventoryContext";
import { 
  fetchFriendsWithStats, 
  addFriend, 
  removeFriend, 
  cheerFriend, 
  fetchSocialActivity,
  fetchPendingRequests,
  respondToRequest
} from "../services/socialService";
import { LOOT_TABLE } from "../data/items";
import { useNotification } from "../context/NotificationContext";
import { supabase } from "../supabaseClient";
import "./Friends.css";

export default function Friends() {
  const { user } = useAuth();
  const { stepsToday, level: myLevel } = useQuest();
  const { addItem, totalStats: myStats } = useInventory();
  const { showToast } = useNotification();
  
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [targetUsername, setTargetUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isFirstLoad = useState(true);
  const [raidGoal] = useState(50000); // Target for total party steps
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [duelResult, setDuelResult] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [myIdentity, setMyIdentity] = useState({ username: "...", email: "" });
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    loadData(true);
    const interval = setInterval(() => loadData(false), 10000); // Silent refresh every 10s
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async (showSpinner = false) => {
    if (loadingRef.current) return; // Prevent overlapping fetches
    loadingRef.current = true;
    try {
      if (showSpinner) setLoading(true);
      
      const [friendData, pendingData, activityData, meResult] = await Promise.all([
        fetchFriendsWithStats(user.id),
        fetchPendingRequests(user.id),
        fetchSocialActivity(user.id),
        supabase.from("player_stats").select("username, email").eq("user_id", user.id).single()
      ]);
      
      // Batch ALL state updates in one go to prevent multiple re-renders
      setFriends(friendData);
      setPendingRequests(pendingData);
      setActivities(activityData);
      if (meResult.data) setMyIdentity({ username: meResult.data.username, email: meResult.data.email });
      setDbError(null);
    } catch (err) {
      console.error("Critical Load Error:", err);
      setDbError(err.message || "Database connection issue");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    setSaving(true);
    const { error } = await addFriend(user.id, targetUsername.trim(), nickname.trim());
    setSaving(false);
    if (error) {
      showToast(error.message || "Could not find hero.", "error");
      return;
    }
    showToast(`Recruitment invitation sent to ${targetUsername}!`, "success");
    setTargetUsername("");
    setNickname("");
    loadData();
  };

  const handleResponse = async (requestId, accept) => {
    const { error } = await respondToRequest(requestId, accept);
    if (error) {
      showToast("Could not respond to request.", "error");
      return;
    }
    showToast(accept ? "Recruitment accepted!" : "Invitation declined.", accept ? "success" : "info");
    loadData();
  };

  const handleCheer = async (friendId, friendName) => {
    await cheerFriend(user.id, friendId, friendName);
    loadData();
    showToast(`You cheered for ${friendName}! They received +50 XP.`, "success");
  };

  // ... (handleDuel and other logic stay same)

  const handleDuel = (friend) => {
    if (!friend.stats) return;
    const fStats = friend.stats;
    const myPower = myStats.atk + myStats.def + myStats.spd;
    const fPower = (fStats.level * 5) + 15; 
    
    const friendName = friend.nickname || friend.stats?.username || "Companion";

    if (myPower > fPower) {
      setDuelResult(`Victory! You defeated ${friendName} in a mock duel!`);
    } else {
      setDuelResult(`${friendName} was too strong! You were defeated...`);
    }
    
    setTimeout(() => setDuelResult(null), 3000);
  };

  const partySteps = useMemo(() => {
    if (friends.length === 0) return 0;
    const friendTotal = friends.reduce((sum, f) => sum + (f.stats?.steps_today || 0), 0);
    return friendTotal + stepsToday;
  }, [friends, stepsToday]);

  const claimRaidReward = () => {
    if (partySteps < raidGoal || rewardClaimed || friends.length === 0) return;
    const socialItems = LOOT_TABLE.filter(i => i.isSocialOnly);
    const reward = socialItems[Math.floor(Math.random() * socialItems.length)];
    addItem(reward);
    setRewardClaimed(true);
    showToast(`🎉 PARTY RAID COMPLETE! You received: ${reward.icon} ${reward.name}!`, "achievement", 6000);
  };

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: 'Cinzel', color: '#eab308' }}>Heroic Party</h1>

      <div className="party-container">
        {/* --- Party Raid Card --- */}
        <div className="raid-card">
          <div className="raid-title">⚔️ Daily Party Raid</div>
          <p className="stat muted" style={{ fontSize: '0.9rem' }}>
            Work with your friends to reach {raidGoal.toLocaleString()} total steps and unlock unique loot!
          </p>
          {friends.length === 0 && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              ⚠️ Party Required: Recruit heroes below to begin!
            </div>
          )}
          <div className="raid-progress-container">
            <div 
              className="raid-progress-bar" 
              style={{ width: `${Math.min(100, (partySteps / raidGoal) * 100)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat" style={{ fontSize: '1.1rem', color: '#fff' }}>
              {partySteps.toLocaleString()} / {raidGoal.toLocaleString()} Steps
            </span>
            <button 
              className="gold-btn" 
              disabled={partySteps < raidGoal || rewardClaimed || friends.length === 0}
              onClick={claimRaidReward}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              {rewardClaimed ? "Claimed" : "Claim Loot"}
            </button>
          </div>
        </div>
        
        {/* --- Database Status / Debug --- */}
        {dbError && (
          <div className="raid-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
            <div className="stat" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              ⚠️ DATABASE ERROR: {dbError}
            </div>
          </div>
        )}

        <div className="raid-card" style={{ background: 'rgba(168, 85, 247, 0.05)', borderColor: '#a855f7', padding: '0.5rem 1rem' }}>
            <div className="stat muted" style={{ fontSize: '0.75rem', textAlign: 'center' }}>
              Your Hero Identity: <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{myIdentity.username}</span> 
              {myIdentity.email ? ` (${myIdentity.email})` : ' (No email linked)'}
            </div>
        </div>

        {/* --- Pending Invitations --- */}
        {pendingRequests.length > 0 && (
          <div className="card" style={{ border: '1px solid #3b82f6' }}>
            <h2 className="card-title" style={{ color: '#3b82f6' }}>📜 Incoming Recruitments</h2>
            <div className="friend-grid" style={{ gridTemplateColumns: '1fr' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="friend-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                     <span className="activity-user">{req.requesterStats?.username || "A mysterious hero"}</span>
                     <span className="stat muted" style={{ marginLeft: '1rem' }}>LVL {req.requesterStats?.level || 1}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="gold-btn" onClick={() => handleResponse(req.id, true)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Accept</button>
                    <button className="btn-secondary" onClick={() => handleResponse(req.id, false)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', background: '#3f3f46' }}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Add Friend --- */}
        <div className="card">
          <h2 className="card-title">Recruit Party Member</h2>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Hero's Username"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              className="input"
              style={{ flex: 2 }}
            />
            <input
              type="text"
              placeholder="Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
              style={{ flex: 1 }}
            />
            <button className="gold-btn" type="submit" disabled={saving}>
              Recruit
            </button>
          </form>
        </div>

        {/* --- Party Members --- */}
        <div className="friend-grid">
          {loading && Array(3).fill(0).map((_, i) => (
            <div key={i} className="friend-card" style={{ opacity: 0.5 }}>
              <p className="stat">Loading friend...</p>
            </div>
          ))}
          {!loading && friends.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              <p className="stat muted">Your party is empty. Recruit members to start Raiding!</p>
            </div>
          )}
          {friends.map((f) => (
            <div key={f.id} className="friend-card">
              <div className="friend-header">
                <div className="friend-avatar-container">
                   <div style={{ fontSize: '2rem' }}>👤</div>
                </div>
                <div className="friend-info">
                  <h3>{f.displayName}</h3>
                  <div className="friend-level">LVL {f.stats?.level || 1}</div>
                </div>
                <button 
                  className="remove-item-btn" 
                  style={{ marginLeft: 'auto', background: 'transparent' }}
                  onClick={() => removeFriend(f.id).then(loadData)}
                >
                  ✖
                </button>
              </div>

              <div className="friend-stats">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Steps Today</span>
                  <span style={{ color: '#fff' }}>{(f.stats?.steps_today || 0).toLocaleString()}</span>
                </div>
                <div className="raid-progress-container" style={{ height: '6px', marginTop: '0' }}>
                  <div 
                    className="raid-progress-bar" 
                    style={{ 
                      width: `${Math.min(100, ((f.stats?.steps_today || 0) / 10000) * 100)}%`,
                      background: '#3b82f6',
                      boxShadow: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="friend-actions">
                <button className="friend-btn cheer-btn" onClick={() => handleCheer(f.friend_id, f.displayName)}>
                  📣 Cheer
                </button>
                <button className="friend-btn duel-btn" onClick={() => handleDuel(f)}>
                  ⚔️ Duel
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- Duel Result Notice --- */}
        {duelResult && (
          <div className="raid-card" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }}>
            <div className="stat" style={{ textAlign: 'center', color: '#fff', fontSize: '1rem' }}>
              {duelResult}
            </div>
          </div>
        )}

        {/* --- Activity Feed --- */}
        <div>
          <h2 className="card-title" style={{ fontSize: '1rem' }}>📜 The Town Crier</h2>
          <div className="activity-feed">
            {activities.length === 0 && <p className="stat muted">It's quiet in the kingdom...</p>}
            {activities.map((act, i) => (
              <div key={i} className="activity-item">
                <span className="activity-user">{act.player_stats?.username}</span> {act.content}
                <span className="stat muted" style={{ fontSize: '0.7rem', float: 'right' }}>
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
