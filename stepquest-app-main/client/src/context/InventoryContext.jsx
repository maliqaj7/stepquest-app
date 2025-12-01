import { createContext, useContext, useState, useMemo } from "react";

const InventoryContext = createContext();

/* ============================================
   BASE PLAYER STATS — Before equipment bonuses
   ============================================ */
const BASE_STATS = {
  atk: 5,
  def: 5,
  spd: 5,
  luck: 5,
  end: 5,
};

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

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);

  /* ============================================
     ADD ITEM — Handles deep copy & validation
     ============================================ */
  const addItem = (item) => {
    if (!item || !item.name) {
      console.warn("Attempted to add invalid item:", item);
      return;
    }

    // Always clone item object so React state stays clean
    const newItem = { ...item };

    setInventory((prev) => [...prev, newItem]);
  };

  /* ============================================
     REMOVE a specific item
     ============================================ */
  const removeItem = (index) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  /* ============================================
     CLEAR Inventory (for debugging / prestige)
     ============================================ */
  const clearInventory = () => {
    setInventory([]);
  };

  /* ============================================
     DERIVED PLAYER TOTAL STATS
     Base stats + item bonuses
     ============================================ */
  const totalStats = useMemo(() => {
    const bonus = { atk: 0, def: 0, spd: 0, luck: 0, end: 0 };

    inventory.forEach((item) => {
      if (!item.stats) return;

      Object.entries(item.stats).forEach(([key, value]) => {
        if (bonus[key] !== undefined) {
          bonus[key] += value || 0;
        }
      });
    });

    // Final stats after bonuses
    return {
      atk: BASE_STATS.atk + bonus.atk,
      def: BASE_STATS.def + bonus.def,
      spd: BASE_STATS.spd + bonus.spd,
      luck: BASE_STATS.luck + bonus.luck,
      end: BASE_STATS.end + bonus.end,
    };
  }, [inventory]);

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

/* ============================================
   USE INVENTORY HOOK
   ============================================ */
export function useInventory() {
  return useContext(InventoryContext);
}
