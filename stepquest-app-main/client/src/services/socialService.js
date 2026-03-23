// src/services/socialService.js
import { supabase } from "../supabaseClient";

// ===== LEADERBOARD =====
export async function fetchLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("player_stats")
    .select("user_id, username, total_steps")
    .order("total_steps", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading leaderboard:", error);
    return [];
  }
  return data || [];
}

// ===== FRIENDS =====
export async function fetchFriends(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("social_friends")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading friends:", error);
    return [];
  }
  return data || [];
}

export async function addFriend(ownerId, friendEmail, nickname) {
  if (!ownerId || !friendEmail) return { error: "Missing data" };

  // Validate the user exists by checking player_stats username (email prefix)
  const usernameGuess = friendEmail.split('@')[0];
  const { data: userStats, error: fetchErr } = await supabase
    .from("player_stats")
    .select("user_id")
    .eq("username", usernameGuess)
    .single();

  if (fetchErr || !userStats) {
    return { error: { message: "No registered StepQuest user found with that email." } };
  }

  const { error } = await supabase.from("social_friends").insert({
    owner_id: ownerId,
    friend_email: friendEmail,
    nickname,
  });

  if (error) {
    console.error("Error adding friend:", error);
  }
  return { error };
}

export async function removeFriend(id) {
  const { error } = await supabase.from("social_friends").delete().eq("id", id);
  return { error };
}
