import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';

// Importing assets 
import Knight from '../assets/Knight.png';
import FemaleKnight from '../assets/Female Knight.png';
import EvilKnight from '../assets/Evil Knight.png';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div />
        <Link to="/login" className="landing-signin">
          Sign In
        </Link>
      </header>

      <main className="landing-hero">
        <div className="path-container">
          {/* SVG Paths for the glowing lines */}
          <svg className="path-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path 
              className="path-line" 
              d="M 50,250 Q 150,50 350,100" 
            />
            <path 
              className="path-line" 
              style={{ stroke: '#a855f7', opacity: 0.6 }}
              d="M 20,200 Q 200,250 380,50" 
            />
          </svg>

          {/* Character Nodes */}
          <div className="avatar-node node-1">
            <img src={Knight} alt="Knight" />
          </div>
          <div className="avatar-node node-2">
            <img src={FemaleKnight} alt="Female Knight" />
          </div>
          <div className="avatar-node node-3">
            <img src={EvilKnight} alt="Evil Knight" />
          </div>

          {/* Small Decorative Icons */}
          <div className="small-node pos-1">🛡️</div>
          <div className="small-node pos-2">👑</div>
          <div className="small-node pos-3">⚔️</div>
          <div className="small-node pos-4">💰</div>
        </div>

        <div className="landing-brand">
          StepQuest
        </div>

        <h1 className="landing-title">
          Start Your <span className="title-highlight">Quest</span>
        </h1>
        
        <p className="landing-description">
          Walk. Run. Level Up.<br />
          Compete, Explore, Conquer.
        </p>
      </main>

      <footer className="landing-footer">
        <Link to="/signup" className="btn-signup-email">
          Sign up with Email
        </Link>
      </footer>

      <div className="landing-legal">
        By signing up you are agreeing to our <br />
        <Link to="/terms" className="legal-link">Terms of Service</Link> & <Link to="/privacy" className="legal-link">Privacy Policy</Link>.
      </div>
    </div>
  );
};

export default Landing;
