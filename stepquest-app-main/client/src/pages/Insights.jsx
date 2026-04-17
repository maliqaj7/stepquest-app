import { useMemo, useState } from "react";
import { useQuest } from "../context/QuestContext";
import "./Insights.css";

const TABS = ["Day", "Week", "Month", "Year"];
const TAB_CONFIG = {
  Day:   { count: 24, labels: ["12a", "4a", "8a", "12p", "4p", "8p"], weights: Array.from({ length: 24 }, (_, i) => Math.max(0.1, Math.sin((i / 24) * Math.PI * 1.5) * 1.5 + Math.random() * 0.5)) },
  Week:  { count: 7,  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], weights: [0.75, 1.1, 1.2, 1.45, 1.65, 2.0, 1.8] },
  Month: { count: 12, labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], weights: [0.85, 1.0, 1.05, 1.3, 1.6, 1.2, 0.8, 0.9, 1.05, 1.4, 1.3, 1.1] },
  Year:  { count: 5,  labels: ["2022", "2023", "2024", "2025", "2026"], weights: [0.65, 0.9, 1.2, 1.5, 1.8] },
};


// Weekly activity heatmap data (simulated)
const HEATMAP_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const HEATMAP_WEEKS = 12;

function getHeatmapIntensity(seed, week, day) {
  const v = Math.sin(seed + week * 7 + day) * 0.5 + 0.5;
  if (v < 0.2) return 0;
  if (v < 0.45) return 1;
  if (v < 0.65) return 2;
  if (v < 0.85) return 3;
  return 4;
}

const MILESTONE_BADGES = [
  { icon: "👟", label: "First Steps",     threshold: 100,    color: "#94a3b8" },
  { icon: "🏃", label: "Step Rookie",     threshold: 1000,   color: "#34d399" },
  { icon: "⚔️",  label: "Step Warrior",   threshold: 10000,  color: "#38bdf8" },
  { icon: "🏆", label: "Step Champion",   threshold: 50000,  color: "#fbbf24" },
  { icon: "👑", label: "Step Legend",     threshold: 100000, color: "#e879f9" },
  { icon: "🌟", label: "Step Conqueror",  threshold: 500000, color: "#f43f5e" },
];

export default function Insights() {
  const { totalSteps, stepsToday, level, xp, dailyGoal, streak } = useQuest();
  const [activeTab, setActiveTab] = useState("Week");
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const xpToNext = 250 + level * 50;
  const xpPercent = Math.min(100, Math.round(((xp || 0) / (xpToNext || 1)) * 100));
  const distanceKm = ((totalSteps || 0) * 0.0008).toFixed(1);
  const calories    = Math.round((totalSteps || 0) * 0.05);
  const yearLabel   = new Date().getFullYear();

  const { displayTotal, stepsData, bestIdx, bestValue, avgValue, linePoints, areaPoints, labels } =
    useMemo(() => {
      const config = TAB_CONFIG[activeTab];

      if (!totalSteps || totalSteps <= 0) {
        return { displayTotal: 0, stepsData: Array(config.count).fill(0), bestIdx: 0, bestValue: 0, avgValue: 0, linePoints: "", areaPoints: "", labels: config.labels };
      }

      const weightSum = config.weights.reduce((a, b) => a + b, 0);
      const stepsData = config.weights.map((w) => Math.round((totalSteps * w) / weightSum));
      const bestValue = Math.max(...stepsData);
      const bestIdx   = stepsData.indexOf(bestValue);
      const avgValue  = Math.round(totalSteps / config.count);
      const maxForChart = bestValue || 1;

      const pts = stepsData.map((v, i) => ({
        x: (i / (stepsData.length > 1 ? stepsData.length - 1 : 1)) * 100,
        y: 100 - (v / maxForChart) * 90, // keep some bottom margin
      }));

      const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
      // Close the area polygon bottom
      const areaPoints =
        linePoints +
        ` 100,100 0,100`;

      return { displayTotal: totalSteps, stepsData, bestIdx, bestValue, avgValue, linePoints, areaPoints, labels: config.labels };
    }, [totalSteps, activeTab]);

  // Heatmap seed from totalSteps for deterministic look
  const heatmapSeed = totalSteps % 100;

  const todayPercent = dailyGoal > 0 ? Math.min(100, Math.round((stepsToday / dailyGoal) * 100)) : 0;

  return (
    <div className="insights-page">
      <h1 className="page-title">Insights</h1>

      {/* ── HERO STAT CARDS ── */}
      <div className="ins-hero-grid">
        <div className="ins-hero-card ins-hero-card--steps">
          <div className="ins-hero-card__icon">👣</div>
          <div className="ins-hero-card__value">{(totalSteps || 0).toLocaleString()}</div>
          <div className="ins-hero-card__label">Total Steps</div>
          <div className="ins-hero-card__glow" />
        </div>
        <div className="ins-hero-card ins-hero-card--distance">
          <div className="ins-hero-card__icon">🗺️</div>
          <div className="ins-hero-card__value">{distanceKm}<span className="ins-hero-unit">km</span></div>
          <div className="ins-hero-card__label">Distance</div>
          <div className="ins-hero-card__glow" />
        </div>
        <div className="ins-hero-card ins-hero-card--calories">
          <div className="ins-hero-card__icon">🔥</div>
          <div className="ins-hero-card__value">{calories.toLocaleString()}</div>
          <div className="ins-hero-card__label">Calories</div>
          <div className="ins-hero-card__glow" />
        </div>
        <div className="ins-hero-card ins-hero-card--streak">
          <div className="ins-hero-card__icon">⚡</div>
          <div className="ins-hero-card__value">{streak || 0}</div>
          <div className="ins-hero-card__label">Day Streak</div>
          <div className="ins-hero-card__glow" />
        </div>
      </div>

      {/* ── TODAY'S GOAL RING ── */}
      <div className="ins-today-card card">
        <div className="ins-today-left">
          <p className="ins-today-label">Today's Goal</p>
          <p className="ins-today-steps">{(stepsToday || 0).toLocaleString()} <span className="ins-today-unit">steps</span></p>
          <p className="ins-today-sub">of {(dailyGoal || 5000).toLocaleString()} goal · {todayPercent}% complete</p>
          <div className="ins-today-bar">
            <div className="ins-today-fill" style={{ width: `${todayPercent}%` }} />
          </div>
        </div>
        <div className="ins-today-right">
          <svg className="ins-ring-svg" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke="url(#ringGrad)" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(todayPercent / 100) * 150.8} 150.8`}
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <text x="28" y="32" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="800">{todayPercent}%</text>
          </svg>
        </div>
      </div>

      {/* ── CHART SECTION ── */}
      <div className="ins-chart-card card">
        <div className="ins-chart-header">
          <div>
            <p className="ins-chart-eyebrow">Activity Overview</p>
            <p className="ins-chart-title">{activeTab === "Year" ? "Last 5 Years" : yearLabel} — {activeTab} View</p>
          </div>
          <div className="ins-chart-peak">
            <span className="ins-chart-peak-label">Peak</span>
            <span className="ins-chart-peak-val">{bestValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="ins-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ins-tab ${activeTab === tab ? "ins-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ins-chart-wrapper">
          {/* Reference lines */}
          <div className="ins-ref-lines">
            <span className="ins-ref-line ins-ref-line--top" />
            <span className="ins-ref-line ins-ref-line--mid" />
            <span className="ins-ref-label ins-ref-label--top">{bestValue.toLocaleString()}</span>
            <span className="ins-ref-label ins-ref-label--mid">Avg {avgValue.toLocaleString()}</span>
          </div>

          {/* New HTML Tooltip (to avoid SVG morphing) */}
          {hoveredIdx !== null && (
            <div 
              className="ins-tooltip"
              style={{ 
                left: `${(hoveredIdx / (stepsData.length > 1 ? stepsData.length - 1 : 1)) * 100}%`,
                top: `${100 - (stepsData[hoveredIdx] / (bestValue || 1)) * 90}%`
              }}
            >
              <div className="ins-tooltip-val">{stepsData[hoveredIdx].toLocaleString()}</div>
              <div className="ins-tooltip-label">{labels[hoveredIdx % labels.length]}</div>
            </div>
          )}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="ins-svg"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {displayTotal > 0 && (
              <>
                {/* Filled area */}
                <polygon points={areaPoints} fill="url(#areaGrad)" />
                {/* Line */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowFilter)"
                />
                {/* Interaction Bars (Invisible vertical bars for easier hover) */}
                {stepsData.map((_, idx) => (
                  <rect
                    key={`trigger-${idx}`}
                    x={(idx / (stepsData.length > 1 ? stepsData.length - 1 : 1)) * 100 - (100 / stepsData.length / 2)}
                    y="0"
                    width={100 / stepsData.length}
                    height="100"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    style={{ cursor: "crosshair" }}
                  />
                ))}
                {/* Dots */}
                {stepsData.map((value, idx) => {
                  const maxForChart = bestValue || 1;
                  const x = (idx / (stepsData.length > 1 ? stepsData.length - 1 : 1)) * 100;
                  const y = 100 - (value / maxForChart) * 90;
                  const isBest = idx === bestIdx;
                  const isHovered = idx === hoveredIdx;
                  return (
                    <g key={idx} style={{ pointerEvents: "none" }}>
                      <circle
                        cx={x} cy={y}
                        r={activeTab === "Day" ? 0.6 : isBest || isHovered ? 2 : 1.2}
                        fill={isBest ? "#fbbf24" : isHovered ? "#38bdf8" : "#050507"}
                        stroke={isBest ? "#fbbf24" : "#38bdf8"}
                        strokeWidth={isBest ? 1.5 : 1}
                        filter={isBest || isHovered ? "url(#glowFilter)" : undefined}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {displayTotal === 0 && (
              <text x="50" y="55" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="sans-serif">
                Start walking to see data
              </text>
            )}
          </svg>


          {/* X-axis labels */}
          <div className="ins-x-labels">
            {labels.map((l, i) => (
              <span key={i} className={`ins-x-label ${i === bestIdx ? "ins-x-label--best" : ""}`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Summary pill */}
        <div className="ins-chart-summary">
          {displayTotal > 0 ? (
            <>
              Peak of <strong>{bestValue.toLocaleString()}</strong> steps · Average of <strong>{avgValue.toLocaleString()}</strong> steps
            </>
          ) : (
            "Walk your first steps to unlock insights."
          )}
        </div>
      </div>

      {/* ── WEEKLY HEATMAP ── */}
      <div className="ins-heatmap-card card">
        <div className="ins-section-header">
          <span className="ins-section-icon">📅</span>
          <div>
            <p className="ins-section-title">Activity Heatmap</p>
            <p className="ins-section-sub">Last {HEATMAP_WEEKS} weeks</p>
          </div>
        </div>
        <div className="ins-heatmap">
          <div className="ins-heatmap-days">
            {HEATMAP_DAYS.map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="ins-heatmap-grid">
            {Array.from({ length: HEATMAP_WEEKS }).map((_, week) =>
              Array.from({ length: 7 }).map((_, day) => {
                // Simulate increasing activity intensity as totalSteps grows
                const raw = getHeatmapIntensity(heatmapSeed, week, day);
                const scaled = totalSteps > 0 ? raw : 0;
                return (
                  <div
                    key={`${week}-${day}`}
                    className={`ins-heatmap-cell ins-heatmap-cell--${scaled}`}
                    title={`Week ${HEATMAP_WEEKS - week}, ${HEATMAP_DAYS[day]}`}
                  />
                );
              })
            )}
          </div>
          <div className="ins-heatmap-legend">
            <span>Less</span>
            {[0,1,2,3,4].map(i => <div key={i} className={`ins-heatmap-cell ins-heatmap-cell--${i}`} style={{width:10,height:10}} />)}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* ── RPG PROGRESS ── */}
      <div className="ins-rpg-card card">
        <div className="ins-section-header">
          <span className="ins-section-icon">⚔️</span>
          <div>
            <p className="ins-section-title">Hero Progress</p>
            <p className="ins-section-sub">Level {level} Adventure</p>
          </div>
        </div>
        <div className="ins-rpg-body">
          <div className="ins-rpg-row">
            <span className="ins-rpg-label">Level</span>
            <span className="ins-rpg-val ins-rpg-val--gold">{level}</span>
          </div>
          <div className="ins-rpg-row">
            <span className="ins-rpg-label">XP Progress</span>
            <span className="ins-rpg-val">{(xp || 0).toLocaleString()} / {xpToNext.toLocaleString()}</span>
          </div>
          <div className="ins-xp-track">
            <div className="ins-xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="ins-rpg-row" style={{ marginTop: "1rem" }}>
            <span className="ins-rpg-label">Total Distance</span>
            <span className="ins-rpg-val ins-rpg-val--emerald">{distanceKm} km</span>
          </div>
          <div className="ins-rpg-row">
            <span className="ins-rpg-label">Calories Burned</span>
            <span className="ins-rpg-val ins-rpg-val--sky">{calories.toLocaleString()} kcal</span>
          </div>
          <div className="ins-rpg-row">
            <span className="ins-rpg-label">Best Day Streak</span>
            <span className="ins-rpg-val ins-rpg-val--crimson">{streak || 0} days 🔥</span>
          </div>
        </div>
      </div>

      {/* ── ACHIEVEMENT BADGES ── */}
      <div className="ins-badges-card card">
        <div className="ins-section-header">
          <span className="ins-section-icon">🏅</span>
          <div>
            <p className="ins-section-title">Milestones</p>
            <p className="ins-section-sub">Step achievements unlocked</p>
          </div>
        </div>
        <div className="ins-badges-grid">
          {MILESTONE_BADGES.map((badge) => {
            const unlocked = (totalSteps || 0) >= badge.threshold;
            return (
              <div
                key={badge.label}
                className={`ins-badge ${unlocked ? "ins-badge--unlocked" : "ins-badge--locked"}`}
                style={unlocked ? { "--badge-color": badge.color } : {}}
              >
                <div className="ins-badge__icon">{unlocked ? badge.icon : "🔒"}</div>
                <div className="ins-badge__label">{badge.label}</div>
                <div className="ins-badge__threshold">{badge.threshold.toLocaleString()} steps</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
