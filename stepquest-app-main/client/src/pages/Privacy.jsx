import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Privacy = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <header className="legal-header">
          <h1 className="legal-title">Rites of Privacy</h1>
          <p className="legal-subtitle">Your Path is Your Own — Last Updated: April 2026</p>
        </header>

        <section className="legal-section">
          <h2 className="legal-section-title">1. The Sacred Path</h2>
          <p className="legal-text">
            StepQuest respects the physical path you walk. Your precise GPS location is used only locally by your device to 
            determine boss proximity. We do not store your physical coordinates on our scrolls. Your path remains your secret.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">2. Proclaimed Deeds</h2>
          <p className="legal-text">
            To maintain the Great Leaderboards, we synchronize the following aggregate deeds with the global ledger (Supabase):
          </p>
          <ul className="legal-list">
            <li>Your total and daily step counts.</li>
            <li>Your hero name, level, and current experience.</li>
            <li>Achievements unlocked and quests completed.</li>
            <li>Items currently equipped in your inventory.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">3. Merchant Guilds</h2>
          <p className="legal-text">
            We do not sell your data to outside merchant guilds or advertisers. Your heroic efforts are for the StepQuest 
            community alone. We may use anonymized, aggregate data to improve the app's forge (development) and balance 
            the game's economy.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">4. Health Sync</h2>
          <p className="legal-text">
            We pull data from Apple Health or Google Fit with your express permission. This data is only used to compute 
            your XP and quest progress. We do not access heart rate, medical history, or other sensitive health relics.
          </p>
        </section>

        <Link to="/landing" className="legal-back-btn">
          ← Return to the Gateway
        </Link>
      </div>
    </div>
  );
};

export default Privacy;
