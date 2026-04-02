export const ZONES = [
  { 
    id: 1, 
    name: "Forest Edge", 
    requiredSteps: 0, 
    description: "A calm starting area to begin your journey.", 
    bossName: null, 
    bossSprite: null 
  },
  // --- STAGE 1: LVL 1 - 10 (THE AWAKENING) ---
  { 
    id: 2, 
    name: "Whispering Woods", 
    requiredSteps: 2000, 
    description: "Milestone: Level 1 Explorer. The forest holds its breath.", 
    bossName: "Elder Ent", 
    bossSprite: "🌳",
    hp: 60, atk: 10, def: 5
  },
  { 
    id: 3, 
    name: "Goblin Outpost", 
    requiredSteps: 10000, 
    description: "A crude fortification. Persistent pests block the path.", 
    bossName: "Goblin King", 
    bossSprite: "👑",
    hp: 120, atk: 15, def: 10
  },
  { 
    id: 4, 
    name: "Mountain Trail", 
    requiredSteps: 20000, 
    description: "The air grows thin. A rocky guardian awaits.", 
    bossName: "Stone Golem", 
    bossSprite: "🪨",
    hp: 200, atk: 25, def: 20
  },
  { 
    id: 5, 
    name: "Frozen Pass", 
    requiredSteps: 32000, 
    description: "Icy winds howl through this narrow gap.", 
    bossName: "Frost Yeti", 
    bossSprite: "❄️",
    hp: 350, atk: 35, def: 25
  },
  { 
    id: 6, 
    name: "The Great Gate", 
    requiredSteps: 45000, 
    description: "STAGE BOSS: Level 10 Guardian. Prove your worth.", 
    bossName: "Stone Monarch", 
    bossSprite: "⛰️",
    hp: 600, atk: 50, def: 40
  },

  // --- STAGE 2: LVL 11 - 20 (THE FORGOTTEN DEPTHS) ---
  { 
    id: 7, 
    name: "Lava Caves", 
    requiredSteps: 65000, 
    description: "Intense heat. Molten rock flows freely.", 
    bossName: "Magma Core", 
    bossSprite: "🌋",
    hp: 850, atk: 65, def: 45
  },
  { 
    id: 8, 
    name: "Obsidian Forge", 
    requiredSteps: 85000, 
    description: "A subterranean workshop of fire and shadow.", 
    bossName: "Flame Lord", 
    bossSprite: "🔥",
    hp: 1100, atk: 80, def: 55
  },
  { 
    id: 9, 
    name: "Swamp of Decay", 
    requiredSteps: 105000, 
    description: "Murky waters. Poisonous fumes choke the air.", 
    bossName: "Hydra Stalker", 
    bossSprite: "🐍",
    hp: 1400, atk: 100, def: 65
  },
  { 
    id: 10, 
    name: "Crystal Basin", 
    requiredSteps: 125000, 
    description: "A foul-smelling pit of ancient sludge.", 
    bossName: "Bog Monster", 
    bossSprite: "🧼",
    hp: 1800, atk: 125, def: 75
  },
  { 
    id: 11, 
    name: "Abyssal Trench", 
    requiredSteps: 150000, 
    description: "STAGE BOSS: Level 20 Guardian. Darkness and pressure.", 
    bossName: "Abyssal Kraken", 
    bossSprite: "🦑",
    hp: 2500, atk: 160, def: 90
  },

  // --- STAGE 3: LVL 21 - 30 (THE SHADOW REALM) ---
  { 
    id: 12, 
    name: "Crystal Peaks", 
    requiredSteps: 180000, 
    description: "High-altitude zone of shimmering light and biting cold.", 
    bossName: "Frost Wyrm", 
    bossSprite: "🐉",
    hp: 3200, atk: 190, def: 110
  },
  { 
    id: 13, 
    name: "Starry Summit", 
    requiredSteps: 210000, 
    description: "Where the air is thin and the stars feel close.", 
    bossName: "Celestial Orb", 
    bossSprite: "🔯",
    hp: 3800, atk: 220, def: 125
  },
  { 
    id: 14, 
    name: "Sky Temple", 
    requiredSteps: 240000, 
    description: "Float above the clouds in ancient ruins.", 
    bossName: "Storm Eagle", 
    bossSprite: "🦅",
    hp: 4500, atk: 260, def: 140
  },
  { 
    id: 15, 
    name: "Cloud Palace", 
    requiredSteps: 270000, 
    description: "The opulent residence of the storm spirits.", 
    bossName: "Thunder Valkyrie", 
    bossSprite: "⚡",
    hp: 5500, atk: 300, def: 160
  },
  { 
    id: 16, 
    name: "Infernal Gate", 
    requiredSteps: 300000, 
    description: "STAGE BOSS: Level 30 Guardian. A scorching stronghold.", 
    bossName: "Arch-Demon Infernal", 
    bossSprite: "👹",
    hp: 7500, atk: 380, def: 200
  },

  // --- STAGE 4: LVL 31 - 40 (THE CELESTIAL EXPANSE) ---
  { 
    id: 17, 
    name: "Sunken Ruins", 
    requiredSteps: 340000, 
    description: "Journey below the waves to find lost secrets.", 
    bossName: "Ocean Guardian", 
    bossSprite: "🔱",
    hp: 8500, atk: 430, def: 220
  },
  { 
    id: 18, 
    name: "Shadow Citadel", 
    requiredSteps: 380000, 
    description: "The ultimate trial. For the most disciplined heroes.", 
    bossName: "Shadow Lord", 
    bossSprite: "👤",
    hp: 10000, atk: 500, def: 250
  },
  { 
    id: 19, 
    name: "Void Gates", 
    requiredSteps: 420000, 
    description: "The boundary between reality and nothingness.", 
    bossName: "Gatekeeper", 
    bossSprite: "⛩️",
    hp: 12000, atk: 580, def: 280
  },
  { 
    id: 20, 
    name: "Chaos Bastion", 
    requiredSteps: 460000, 
    description: "A fortress warped by dark energy.", 
    bossName: "Chaos Knight", 
    bossSprite: "⚔️",
    hp: 15000, atk: 680, def: 320
  },
  { 
    id: 21, 
    name: "Star Grave", 
    requiredSteps: 500000, 
    description: "STAGE BOSS: Level 40 Guardian. Where stars come to die.", 
    bossName: "Ancient Star-Eater", 
    bossSprite: "🔯",
    hp: 20000, atk: 850, def: 400
  },

  // --- STAGE 5: LVL 41 - 50 (THE FINAL FRONTIER) ---
  { 
    id: 22, 
    name: "Void Rift", 
    requiredSteps: 550000, 
    description: "Where space and time begin to fracture.", 
    bossName: "Void Beholder", 
    bossSprite: "👁️",
    hp: 25000, atk: 950, def: 450
  },
  { 
    id: 23, 
    name: "Nexus Hub", 
    requiredSteps: 600000, 
    description: "The intersection of countless parallel worlds.", 
    bossName: "Reality Glitch", 
    bossSprite: "🌀",
    hp: 32000, atk: 1100, def: 520
  },
  { 
    id: 24, 
    name: "Celestial Throne", 
    requiredSteps: 650000, 
    description: "An overlook above the stars themselves.", 
    bossName: "True Celestial Dragon", 
    bossSprite: "✨",
    hp: 40000, atk: 1300, def: 600
  },
  { 
    id: 25, 
    name: "Ethereal Plane", 
    requiredSteps: 700000, 
    description: "A world of pure thought and energy.", 
    bossName: "Spirit Sovereign", 
    bossSprite: "👻",
    hp: 55000, atk: 1600, def: 750
  },
  { 
    id: 26, 
    name: "The Omni Point", 
    requiredSteps: 750000, 
    description: "FINAL BOSS: Level 50 Milestone. The end of all paths.", 
    bossName: "The Omni Creator", 
    bossSprite: "🌌",
    hp: 100000, atk: 2500, def: 1200
  },
];
