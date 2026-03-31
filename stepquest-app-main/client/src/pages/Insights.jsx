import { useMemo, useState } from "react";
import { useQuest } from "../context/QuestContext";

const TABS = ["Day", "Week", "Month", "Year"];
const TAB_CONFIG = {
  Day: { count: 24, labels: ["00", "04", "08", "12", "16", "20"], weights: new Array(24).fill(0).map(() => 0.5 + Math.random()) },
  Week: { count: 7, labels: ["M", "T", "W", "T", "F", "S", "S"], weights: [0.8, 1.2, 1.1, 1.4, 1.6, 2.0, 1.8] },
  Month: { count: 12, labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], weights: [0.9, 1.1, 1.0, 1.3, 1.6, 1.2, 0.8, 0.9, 1.0, 1.4, 1.3, 1.1] },
  Year: { count: 5, labels: ["'22", "'23", "'24", "'25", "'26"], weights: [0.7, 0.9, 1.2, 1.5, 1.8] }
};

export default function Insights() {
  const { totalSteps } = useQuest();
  const [activeTab, setActiveTab] = useState("Month");

  // Derive some fake-but-consistent stats based on totalSteps and activeTab
  const {
    displayTotal,
    stepsData,
    bestIdx,
    bestValue,
    avgValue,
    linePoints,
    labels
  } = useMemo(() => {
    const config = TAB_CONFIG[activeTab];
    const displayTotal = totalSteps;

    if (displayTotal <= 0) {
      return {
        displayTotal: 0,
        stepsData: new Array(config.count).fill(0),
        bestIdx: 0,
        bestValue: 0,
        avgValue: 0,
        linePoints: "",
        labels: config.labels
      };
    }

    const weightSum = config.weights.reduce((a, b) => a + b, 0);
    const stepsData = config.weights.map(
      (w) => Math.round((displayTotal * w) / weightSum)
    );

    const bestValue = Math.max(...stepsData);
    const bestIdx = stepsData.indexOf(bestValue);
    const avgValue = Math.round(displayTotal / config.count);

    const maxForChart = bestValue || 1;
    const linePoints = stepsData
      .map((value, idx) => {
        const x = (idx / (stepsData.length - 1 || 1)) * 100; 
        const y = 100 - (value / maxForChart) * 100; 
        return `${x},${y}`;
      })
      .join(" ");

    return {
      displayTotal,
      stepsData,
      bestIdx,
      bestValue,
      avgValue,
      linePoints,
      labels: config.labels
    };
  }, [totalSteps, activeTab]);

  const yearLabel = new Date().getFullYear();

  return (
    <div className="page">
      <h1 className="page-title">Insights</h1>

      <div className="insights-shell">
        <div className="insights-header">
          <div>
            <p className="insights-label">Record Overview</p>
            <p className="insights-year">{activeTab === "Year" ? "Last 5 Years" : yearLabel}</p>
            <p className="insights-total">
              {displayTotal.toLocaleString()}{" "}
              <span className="insights-total-unit">steps</span>
            </p>
          </div>

          <button className="insights-mode-pill">Steps ▾</button>
        </div>

        <div className="insights-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`insights-tab ${activeTab === tab ? "insights-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="insights-chart-wrapper">
          <div className="insights-chart-bg">
            <div className="insights-line insights-line-top" />
            <div className="insights-line insights-line-mid" />

            <span className="insights-line-label insights-line-label-top">
              {bestValue.toLocaleString()}
            </span>
            <span className="insights-line-label insights-line-label-mid">
              AVG {avgValue.toLocaleString()}
            </span>
          </div>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="insights-line-chart"
          >
            {displayTotal > 0 && (
              <>
                <polyline
                  points={linePoints}
                  className="insights-line-path"
                />
                {stepsData.map((value, idx) => {
                  const maxForChart = bestValue || 1;
                  const x = (idx / (stepsData.length - 1 || 1)) * 100;
                  const y = 100 - (value / maxForChart) * 100;

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={activeTab === "Day" ? 0.8 : 1.8}
                      className={
                        "insights-dot" +
                        (idx === bestIdx ? " insights-dot-best" : "")
                      }
                    />
                  );
                })}
              </>
            )}
          </svg>

          <div className="insights-month-row">
            {labels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>

        <p className="insights-summary">
          {displayTotal > 0 ? (
            <>
              Your {activeTab.toLowerCase()} record shows a peak of{" "}
              <span className="insights-highlight">
                {bestValue.toLocaleString()}
              </span>{" "}
              steps. Keep pushing your limits!
            </>
          ) : (
            <>Start walking to unlock your {activeTab.toLowerCase()} insights.</>
          )}
        </p>
      </div>
    </div>
  );
}

