// src/services/socialService.js
import { supabase } from "../supabaseClient";

// ===== LEADERBOARD =====
export async function fetchLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("player_stats")
    .select("user_id, username, total_steps")
    .order("total_steps", { ascending: false })
    .limit(limit);
  
  return data || [];
}

// ===== FRIENDS WITH STATS =====
export async function fetchFriendsWithStats(userId) {
  if (!userId) return [];
  
  // 0. Get my username and email to find incoming accepted requests
  const { data: myStats } = await supabase
    .from("player_stats")
    .select("username, email")
    .eq("user_id", userId)
    .single();

  const myUsername = myStats?.username || "";
  const myEmail = myStats?.email || "unknown_email_fallback";

  // 1. Fetch friend list (Two-way, but handled separately due to types)
  const { data: friendsOut, error: errOut } = await supabase
    .from("social_friends")
    .select("*")
    .eq("owner_id", userId)
    .eq("status", "accepted");

  const identifiers = [myUsername];
  if (myEmail) identifiers.push(myEmail);

  const { data: friendsIn, error: errIn } = await supabase
    .from("social_friends")
    .select("*")
    .in("friend_email", identifiers)
    .eq("status", "accepted");

  if (errOut || errIn) {
    console.error("Error loading social links");
    return [];
  }

  // Deduplicate just in case
  const allFriendsMap = new Map();
  [...(friendsOut || []), ...(friendsIn || [])].forEach(f => allFriendsMap.set(f.id, f));
  const friends = Array.from(allFriendsMap.values());

  // 2. Fetch stats for each friend to show levels/steps
  // They are either identified by UUID (if they added us) OR Username/Email (if we added them)
  const uuids = friendsIn?.map(f => f.owner_id) || [];
  const textIds = friendsOut?.map(f => f.friend_email) || [];

  // Fetch from player_stats
  let allStats = [];
  
  if (uuids.length > 0) {
    const { data: s1 } = await supabase.from("player_stats").select("*").in("user_id", uuids);
    if (s1) allStats = [...allStats, ...s1];
  }
  if (textIds.length > 0) {
    const { data: s2 } = await supabase.from("player_stats").select("*").in("username", textIds);
    const { data: s3 } = await supabase.from("player_stats").select("*").in("email", textIds);
    if (s2) allStats = [...allStats, ...s2];
    if (s3) allStats = [...allStats, ...s3];
  }

  // Deduplicate stats by user_id
  const statsMap = new Map();
  allStats.forEach(s => statsMap.set(s.user_id, s));
  const finalStats = Array.from(statsMap.values());

  // 3. Merge data
  return friends.map(f => {
    let s;
    if (f.owner_id === userId) {
      // We added them. Their stats match friend_email
      s = finalStats.find(st => st.username === f.friend_email || st.email === f.friend_email);
    } else {
      // They added us. Their stats match owner_id
      s = finalStats.find(st => st.user_id === f.owner_id);
    }

    // Determine the logical display name (the 'other' person in the link)
    const displayName = f.owner_id === userId
      ? (f.nickname || s?.username || f.friend_email?.split('@')[0] || "Unknown")
      : (s?.username || "A Mysterious Hero");

    return { ...f, stats: s, displayName };
  });
}

export async function fetchPendingRequests(userId) {
  if (!userId) return [];

  const { data: myStats } = await supabase
    .from("player_stats")
    .select("username, email")
    .eq("user_id", userId)
    .single();

  if (!myStats) return [];

  const myUsername = myStats.username;
  const myEmail = myStats.email;

  const identifiers = [myUsername];
  if (myEmail) identifiers.push(myEmail);

  const { data, error } = await supabase
    .from("social_friends")
    .select("*")
    .in("friend_email", identifiers)
    .eq("status", "pending");

  if (error || !data) {
    console.error("fetchPendingRequests error:", error);
    return [];
  }
  
  const ownerIds = data.map(d => d.owner_id);
  const { data: ownerStats } = await supabase
    .from("player_stats")
    .select("user_id, username, level")
    .in("user_id", ownerIds);
    
  return data.map(d => ({
    ...d,
    requesterStats: ownerStats?.find(s => s.user_id === d.owner_id)
  }));
}


export async function addFriend(ownerId, targetInput, nickname) {
  if (!ownerId || !targetInput) return { error: { message: "Missing data" } };

  const cleanInput = targetInput.trim();

  // 1. Try finding by EXACT username (most reliable)
  let { data: users } = await supabase
    .from("player_stats")
    .select("user_id, username")
    .ilike("username", cleanInput);

  let targetUser = users && users.length > 0 ? users[0] : null;

  // 2. If not found, try searching by EXACT Email (if column exists)
  if (!targetUser) {
    const { data: emailMatch } = await supabase
      .from("player_stats")
      .select("user_id, username")
      .eq("email", cleanInput);
    
    if (emailMatch && emailMatch.length > 0) {
      targetUser = emailMatch[0];
    }
  }

  // 3. Fallback: If input is an email (contains @), try finding by the prefix as a username
  if (!targetUser && cleanInput.includes('@')) {
    const prefix = cleanInput.split('@')[0].trim();
    const { data: prefixMatch } = await supabase
      .from("player_stats")
      .select("user_id, username")
      .ilike("username", prefix);
    
    if (prefixMatch && prefixMatch.length > 0) {
      targetUser = prefixMatch[0];
    }
  }

  if (!targetUser) {
    return { error: { message: `Hero "${cleanInput}" not found. Verify their username in their profile.` } };
  }

  if (targetUser.user_id === ownerId) {
    return { error: { message: "You cannot recruit yourself!" } };
  }

  // 4. Send the pending request
  const { error } = await supabase.from("social_friends").insert({
    owner_id: ownerId,
    friend_email: targetUser.username,
    nickname: nickname || targetUser.username,
    status: 'pending' 
  });

  if (!error) {
    await logSocialActivity(ownerId, 'recruitment', `sent a recruitment invitation to ${targetUser.username}!`);
  }

  return { error };
}


export async function respondToRequest(requestId, accept) {
  if (accept) {
    return await supabase
      .from("social_friends")
      .update({ status: 'accepted' })
      .eq("id", requestId);
  } else {
    return await supabase
      .from("social_friends")
      .delete()
      .eq("id", requestId);
  }
}

export async function removeFriend(id) {
  // Ensure we delete by row ID
  const { error } = await supabase.from("social_friends").delete().eq("id", id);
  return { error };
}

// ===== SOCIAL INTERACTIONS =====

export async function logSocialActivity(userId, type, content) {
  await supabase.from("social_activity").insert({
    user_id: userId,
    type, // 'level_up', 'rare_loot', 'boss_defeat', 'cheer'
    content,
    created_at: new Date().toISOString()
  });
}

export async function fetchSocialActivity(userId, limit = 10) {
  try {
    const { data } = await supabase
      .from("social_activity")
      .select("*, player_stats(username)")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function cheerFriend(cheererId, friendId, friendUsername) {
  // 1. Log the activity
  await logSocialActivity(cheererId, 'cheer', `cheered for ${friendUsername}!`);
  
  // 2. Grant XP to friend (This would typically happen via an Edge Function for security,
  // but for now we'll just log it for the "Activity Feed" feel).
  return { success: true };
}
