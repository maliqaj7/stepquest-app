# <p align="center">⚔️ StepQuest: Level Up Your Fitness 🛡️</p>

<p align="center">
  <strong>Transform your real-world steps into epic RPG adventures.</strong>
</p>

<p align="center">
  <img src="stepquest_logo_banner_1777324921840.png" alt="StepQuest Banner" width="800">
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Features</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-pwa-support">PWA</a>
</p>

---

## 🌟 Overview

**StepQuest** is a premium RPG-gamified fitness application that bridges the gap between physical activity and gaming. Developed as a final year college project, it uses your daily step data to power a fantasy hero's journey. Explore mystical zones, battle legendary bosses, and climb the leaderboards—all by simply walking.

> [!IMPORTANT]
> StepQuest leverages real-time step tracking and deep RPG mechanics to make fitness feel like an epic adventure rather than a chore.

---

## ✨ Key Features

### 🗺️ Tactical Map & Zone Discovery
Explore a sprawling world map where new regions are unlocked as you hit step milestones. 
- **Fog of War:** Discover hidden secrets as you walk.
- **Milestone Rewards:** Unlock unique loot and lore in every zone.

### ⚔️ Boss Combat & Daily Raids
Face off against powerful enemies! Your health and damage are directly tied to your fitness consistency.
- **Heroic Party:** Join forces with friends for daily raids that reward social cooperation.
- **Strategic Combat:** Use items and skills earned through movement.

### 🤖 AI Quest Master
Powered by AI, your personal Quest Master dynamically generates challenges and narratives based on your activity levels, ensuring no two journeys are the same.

### 🎒 Inventory & Gear System
Equip weapons, armor, and artifacts found during your travels. Each piece of gear enhances your stats, helping you tackle harder zones.

### 📊 Vitality Insights
Get detailed analytics on your progress. visualized through premium charts and dark-themed UI components. Track your steps, levels, and combat performance over time.

---

## 🛠️ Tech Stack

StepQuest is built with a modern, high-performance stack:

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend/Persistence:** [Supabase](https://supabase.com/) (Auth, Database, Real-time)
- **Maps:** [Leaflet](https://leafletjs.com/) with custom RPG-themed tiles
- **Animations:** [Lottie](https://airbnb.design/lottie/) for smooth, engaging micro-interactions
- **Styling:** Premium Vanilla CSS with a focus on Glassmorphism and Dark Mode aesthetics
- **Mobile Integration:** Progressive Web App (PWA) with iOS-specific install prompts

---

## 📂 Project Structure

```bash
stepquest-app/
├── stepquest-app-main/      # Core Application
│   └── client/
│       ├── src/
│       │   ├── components/  # Reusable UI (Navbar, Modals, etc.)
│       │   ├── context/     # Auth, Quest, and Notification state
│       │   ├── pages/       # Home, Map, Inventory, AI Master, etc.
│       │   ├── services/    # Supabase service layer
│       │   └── assets/      # Lottie animations and RPG icons
├── stepquest-website/       # Promotional & Landing Website
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/maliqaj7/stepquest-app.git
   cd stepquest-app/stepquest-app-main/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `stepquest-app-main/client`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📱 PWA Support

StepQuest is designed as an **Elite PWA**. Features include:
- **Offline Capabilities:** Access your stats and inventory without a connection.
- **Add to Home Screen:** Custom installation guides for iOS and Android.
- **Native Experience:** Full-screen mode with no browser chrome for immersive gameplay.

---

## 🎓 Project Context

This project was developed for **Year 4 at Atlantic Technological University**. The mission was to create a cohesive, technical, and visually stunning solution that encourages healthy lifestyle changes through innovative software design.

---

<p align="center">
  Developed by <strong>Maliq & Adrian </strong> and the StepQuest Team.
</p>
