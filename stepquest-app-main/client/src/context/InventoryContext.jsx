import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { useQuest } from "./QuestContext";
import { useAuth } from "./AuthContext";

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

  // ─── PERSIST TO USER-SCOPED KEY ON EVERY CHANGE ───
  useEffect(() => {
    if (!userId || userId !== loadedUserId) return;
    const key = `sq_${userId}_inventory`;
    window.localStorage.setItem(key, JSON.stringify(inventory));
  }, [inventory, userId, loadedUserId]);

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
