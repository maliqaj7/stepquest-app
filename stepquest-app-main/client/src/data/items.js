/* ============================================================
   STEPQUEST ITEM DATABASE
   Includes 20 unique items with rarity and stat scaling.
   ============================================================ */

export const LOOT_TABLE = [
  // Weapons
  { id: "obsidian_blade", name: "Obsidian Blade", rarity: "Rare", icon: "🗡️", stats: { atk: 8 }, description: "Forged from volcanic glass, incredibly sharp." },
  { id: "phantom_dagger", name: "Phantom Dagger", rarity: "Epic", icon: "👻", stats: { atk: 12, spd: 5 }, description: "Flickers in and out of existence." },
  { id: "stormcaller_staff", name: "Stormcaller Staff", rarity: "Legendary", icon: "🌩️", stats: { atk: 20, mag: 10 }, description: "Crackles with trapped lightning." },

  // Armor
  { id: "ironhide_vest", name: "Ironhide Vest", rarity: "Common", icon: "🛡️", stats: { def: 4 }, description: "Thick leather reinforced with iron plates." },
  { id: "shadow_cloak", name: "Shadow Cloak", rarity: "Uncommon", icon: "👤", stats: { def: 6, spd: 3 }, description: "Blends perfectly into the dark." },
  { id: "dragonscale_plate", name: "Dragonscale Plate", rarity: "Rare", icon: "🐲", stats: { def: 15 }, description: "Near-impenetrable scales of a Great Drake." },
  { id: "voidweave_robe", name: "Voidweave Robe", rarity: "Epic", icon: "🌌", stats: { def: 10, mag: 8 }, description: "Woven from the fabric of space itself." },

  // Boots
  { id: "windstep_sandals", name: "Windstep Sandals", rarity: "Common", icon: "🌬️", stats: { spd: 3 }, description: "Lightweight and blessed by the breeze." },
  { id: "mercury_greaves", name: "Mercury Greaves", rarity: "Uncommon", icon: "👢", stats: { spd: 6 }, description: "Metal boots that feel weightless." },
  { id: "phantom_treads", name: "Phantom Treads", rarity: "Rare", icon: "👟", stats: { spd: 9, atk: 4 }, description: "Allows for silent, deadly sprints." },

  // Accessories
  { id: "ember_ring", name: "Ember Ring", rarity: "Common", icon: "🔥", stats: { mag: 2 }, description: "A simple band that stays warm to the touch." },
  { id: "moonstone_pendant", name: "Moonstone Pendant", rarity: "Uncommon", icon: "🌙", stats: { luck: 4 }, description: "Glows softly under the night sky." },
  { id: "soul_prism", name: "Soul Prism", rarity: "Rare", icon: "💎", stats: { mag: 5, luck: 5 }, description: "Refracts the essence of the spirit." },
  { id: "void_heart", name: "Void Heart", rarity: "Epic", icon: "🔮", stats: { mag: 12 }, description: "A dark crystal that pulses with energy." },
  { id: "amulet_eternity", name: "Amulet of Eternity", rarity: "Mythic", icon: "🧿", stats: { mag: 20, luck: 10 }, description: "A relic of an age before time.", minLevel: 50 },

  // Relics / Special
  { id: "cursed_hourglass", name: "Cursed Hourglass", rarity: "Rare", icon: "⌛", stats: { spd: 8, def: -2 }, description: "Speeds up time but weakens its holder." },
  { id: "blood_rune", name: "Blood Rune", rarity: "Epic", icon: "🔯", stats: { atk: 10, end: 5 }, description: "An ancient symbol that fuels vigor." },
  { id: "oracle_eye", name: "Oracle's Eye", rarity: "Legendary", icon: "👁️", stats: { luck: 15, atk: 5, def: 5, spd: 5, end: 5, mag: 5 }, description: "Sees all possibilities at once." },
  { id: "tempest_core", name: "Tempest Core", rarity: "Mythic", icon: "🌀", stats: { atk: 25, spd: 10 }, description: "The heart of a raging hurricane.", minLevel: 50 },
  { id: "celestial_sigil", name: "Celestial Sigil", rarity: "Mythic", icon: "✨", stats: { atk: 10, def: 10, spd: 10, luck: 10, end: 10, mag: 10 }, description: "The ultimate mark of a Hero.", minLevel: 50 },
];

/**
 * Weighted roll based on player level
 */
export const rollLoot = (level = 1) => {
  const r = Math.random() * 100;
  let targetRarity = "Common";

  // Level-based probability tiers
  if (level >= 50) {
    if (r < 10) targetRarity = "Mythic";
    else if (r < 25) targetRarity = "Legendary";
    else if (r < 45) targetRarity = "Epic";
    else if (r < 70) targetRarity = "Rare";
    else if (r < 90) targetRarity = "Uncommon";
    else targetRarity = "Common";
  } else if (level >= 30) {
    if (r < 10) targetRarity = "Legendary";
    else if (r < 25) targetRarity = "Epic";
    else if (r < 50) targetRarity = "Rare";
    else if (r < 80) targetRarity = "Uncommon";
    else targetRarity = "Common";
  } else if (level >= 20) {
    if (r < 10) targetRarity = "Epic";
    else if (r < 30) targetRarity = "Rare";
    else if (r < 70) targetRarity = "Uncommon";
    else targetRarity = "Common";
  } else if (level >= 10) {
    if (r < 15) targetRarity = "Rare";
    else if (r < 50) targetRarity = "Uncommon";
    else targetRarity = "Common";
  } else {
    // Low level: mostly Common and Uncommon
    if (r < 20) targetRarity = "Uncommon";
    else targetRarity = "Common";
  }

  // Filter pool by rarity AND minLevel requirement
  let pool = LOOT_TABLE.filter(item => 
    item.rarity === targetRarity && 
    (item.minLevel ? level >= item.minLevel : true)
  );

  // If pool is empty (e.g., asked for Rare but level is too low for all Rares), 
  // recursively try with one lower rarity
  if (pool.length === 0) {
    const orders = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
    const currentIdx = orders.indexOf(targetRarity);
    if (currentIdx > 0) {
      // Fallback to one tier lower
      const lowerRarity = orders[currentIdx - 1];
      pool = LOOT_TABLE.filter(item => item.rarity === lowerRarity);
    }
  }

  if (pool.length === 0) return LOOT_TABLE[7]; // Ultimate fallback (Ironhide Vest)
  
  return pool[Math.floor(Math.random() * pool.length)];
};
