import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { useQuest } from "./QuestContext";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

const InventoryContext = createContext(null);

/* ============================================
   ITEM RARITY COLORS (Pixel RPG Style)
   ============================================ */
const RARITY_COLORS = {
  Common: "#b0b0b0",
  Uncommon: "#4caf50",
  Rare: "#2196f3",
  Epic: "#9c27b0",
  Legendary: "#ff9800",
  Mythic: "#ff1744",
};

// Synchronous helper for inventory read/migrate
const getInitialInventory = (userId) => {
  if (!userId) return [];
  try {
    const scopedKey = `sq_${userId}_inventory`;
    const oldKey = "sq_inventory";
    
    const scopedStored = window.localStorage.getItem(scopedKey);
    const oldStored = window.localStorage.getItem(oldKey);

    if (oldStored && !scopedStored) {
      // Migrate old inventory to new user-scoped key
      window.localStorage.setItem(scopedKey, oldStored);
      window.localStorage.removeItem(oldKey);
      return JSON.parse(oldStored) || [];
    } else if (scopedStored) {
      return JSON.parse(scopedStored) || [];
    }
  } catch (err) {
    console.warn("Failed to parse initial inventory:", err);
  }
  return [];
};

export function InventoryProvider({ children }) {
  const { baseStats } = useQuest();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [inventory, setInventory] = useState(() => getInitialInventory(userId));
  const [loadedUserId, setLoadedUserId] = useState(userId);

  // ─── LOAD USER-SCOPED INVENTORY WHEN USER CHANGES AT RUNTIME ───
  useEffect(() => {
    // Note: since initial load is synchronous, this is primarily for 
    // when a user logs out and another user logs in without refreshing.
    if (userId !== loadedUserId) {
      setInventory(getInitialInventory(userId));
      setLoadedUserId(userId);
    }
  }, [userId, loadedUserId]);

  // ─── PERSIST TO LOCALSTORAGE + SUPABASE ON EVERY CHANGE ───
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!userId || userId !== loadedUserId) return;
    
    // Always save locally (fast/offline)
    const key = `sq_${userId}_inventory`;
    window.localStorage.setItem(key, JSON.stringify(inventory));

    // Debounce the Supabase write so we don't spam it on rapid changes
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      supabase.from("player_stats")
        .update({ inventory: JSON.stringify(inventory) })
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.warn("[Inventory] Supabase save failed:", error.message);
        });
    }, 2000); // 2s debounce
  }, [inventory, userId, loadedUserId]);

  // ─── ON FIRST LOAD: RESTORE FROM SUPABASE IF LOCALSTORAGE IS EMPTY ───
  useEffect(() => {
    if (!userId) return;
    const key = `sq_${userId}_inventory`;
    const localData = window.localStorage.getItem(key);
    
    // Only fetch from Supabase if localStorage has nothing
    if (!localData || localData === '[]') {
      supabase.from("player_stats")
        .select("inventory")
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          if (data?.inventory) {
            try {
              const parsed = JSON.parse(data.inventory);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setInventory(parsed);
                window.localStorage.setItem(key, data.inventory); // Warm the local cache
              }
            } catch (e) {
              console.warn("[Inventory] Failed to restore from Supabase:", e);
            }
          }
        });
    }
  }, [userId]);

  /* ADD ITEM — Handles deep copy & validation */
  const addItem = (item) => {
    if (!item || !item.name) {
      console.warn("Attempted to add invalid item:", item);
      return;
    }

    const newItem = { ...item };
    setInventory((prev) => [...prev, newItem]);
  };

  /* REMOVE a specific item */
  const removeItem = (index) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  /* CLEAR Inventory */
  const clearInventory = () => {
    setInventory([]);
  };

  /* BASE (from QuestContext) + ITEM BONUS STATS */
  const totalStats = useMemo(() => {
    const bonus = { atk: 0, def: 0, spd: 0, luck: 0, end: 0, mag: 0 };
    
    inventory.forEach((item) => {
      if (!item.stats) return;

      Object.entries(item.stats).forEach(([key, value]) => {
        if (bonus[key] !== undefined) {
          bonus[key] += value || 0;
        }
      });
    });

    return {
      atk: baseStats.atk + bonus.atk,
      def: baseStats.def + bonus.def,
      spd: baseStats.spd + bonus.spd,
      luck: baseStats.luck + bonus.luck,
      end: baseStats.end + bonus.end,
      mag: baseStats.mag + bonus.mag,
    };
  }, [inventory, baseStats]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addItem,
        removeItem,
        clearInventory,
        totalStats,
        rarityColors: RARITY_COLORS,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

/* HOOK */
export function useInventory() {
  return useContext(InventoryContext);
}
