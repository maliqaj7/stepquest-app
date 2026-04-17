import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <header className="legal-header">
          <h1 className="legal-title">Scrolls of Service</h1>
          <p className="legal-subtitle">The Laws of the Realm — Last Updated: April 2026</p>
        </header>

        <section className="legal-section">
          <h2 className="legal-section-title">1. The Hero's Oath</h2>
          <p className="legal-text">
            By entering StepQuest, you swear to act with honor. You agree that your progress shall be earned through true movement. 
            Any attempt to deceive the Quest Master through step-spoofing or magical automation (bots) may result in your immediate 
            exile from the leaderboards and the forfeiture of all items.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">2. Virtual Treasures</h2>
          <p className="legal-text">
            All loot, gear, and gold found within StepQuest are virtual items. They represent your heroic achievements and have 
            no real-world monetary value. They cannot be traded for off-screen coin or exchanged at merchant guilds outside 
            the sanctioned app interface.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">3. The Laws of Physics</h2>
          <p className="legal-text">
            The Quest Master (StepQuest Developers) reserves the right to update the laws of physics and game mechanics at any time. 
            This includes, but is not limited to:
          </p>
          <ul className="legal-list">
            <li>Adjusting XP reward rates.</li>
            <li>Rebalancing hero stats (ATK, DEF, SPD).</li>
            <li>Updating boss difficulty and loot drop tables.</li>
            <li>Resetting seasonal rankings and titles.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">4. Account Guardianship</h2>
          <p className="legal-text">
            You are responsible for guarding your own credentials. Keep your login scrolls safe. StepQuest is not responsible 
            for any loss of progress or stolen items resulting from a failure to protect your account access.
          </p>
        </section>

        <Link to="/landing" className="legal-back-btn">
          ← Return to the Gateway
        </Link>
      </div>
    </div>
  );
};

export default Terms;
