export const ZONES = [
  { 
    id: 1, 
    name: "Forest Edge", 
    requiredSteps: 0, 
    description: "A calm starting area to begin your journey.", 
    bossName: null, 
    bossSprite: null 
  },
  { 
    id: 2, 
    name: "Whispering Woods", 
    requiredSteps: 2000, 
    description: "Deeper forest paths unlocked by steady walking.", 
    bossName: "Elder Ent", 
    bossSprite: "🌳",
    hp: 50,
    atk: 8,
    def: 5
  },
  { 
    id: 3, 
    name: "Mountain Trail", 
    requiredSteps: 10000, 
    description: "A challenging climb for dedicated adventurers.", 
    bossName: "Stone Golem", 
    bossSprite: "🪨",
    hp: 120,
    atk: 15,
    def: 12
  },
  { 
    id: 4, 
    name: "Crystal Peaks", 
    requiredSteps: 25000, 
    description: "High-altitude zone for serious step grinders.", 
    bossName: "Frost Wyrm", 
    bossSprite: "🐉",
    hp: 250,
    atk: 25,
    def: 20
  },
  { 
    id: 5, 
    name: "Shadow Citadel", 
    requiredSteps: 50000, 
    description: "The ultimate trial. Only for the most disciplined heroes.", 
    bossName: "Shadow Lord", 
    bossSprite: "👤",
    hp: 600,
    atk: 45,
    def: 35
  },
];
