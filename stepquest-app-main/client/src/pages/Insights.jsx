import { useMemo } from "react";
import { useQuest } from "../context/QuestContext";

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Helper to generate a “nice looking” distribution over 12 bars
const BASE_WEIGHTS = [0.9, 1.1, 1.0, 1.3, 1.6, 1.2, 0.8, 0.9, 1.0, 1.4, 1.3, 1.1];

export default function Insights() {
  const { totalSteps } = useQuest();

  // Derive some fake-but-consistent yearly stats from totalSteps
  const {
    yearlyTotal,
    monthlySteps,
    bestMonthIndex,
    bestMonthSteps,
    avgSteps,
  } = useMemo(() => {
    const yearlyTotal = totalSteps;

    if (yearlyTotal <= 0) {
      return {
        yearlyTotal: 0,
        monthlySteps: new Array(12).fill(0),
        bestMonthIndex: 0,
        bestMonthSteps: 0,
        avgSteps: 0,
      };
    }

    const weightSum = BASE_WEIGHTS.reduce((a, b) => a + b, 0);
    const monthlyStepsRaw = BASE_WEIGHTS.map(
      (w) => (yearlyTotal * w) / weightSum
    );

    // Round nicely
    const monthlySteps = monthlyStepsRaw.map((v) => Math.round(v));

    const bestMonthSteps = Math.max(...monthlySteps);
    const bestMonthIndex = monthlySteps.indexOf(bestMonthSteps);
    const avgSteps = Math.round(yearlyTotal / 12);

    return {
      yearlyTotal,
      monthlySteps,
      bestMonthIndex,
      bestMonthSteps,
      avgSteps,
    };
  }, [totalSteps]);

  const yearLabel = new Date().getFullYear();

  return (
    <div className="page">
      <h1 className="page-title">Insights</h1>

      <div className="card insights-shell">
        {/* Header row: "Best Year" + Steps pill */}
        <div className="insights-header">
          <div>
            <p className="insights-label">Best Year</p>
            <p className="insights-year">{yearLabel}</p>
            <p className="insights-total">
              {yearlyTotal.toLocaleString()} <span className="insights-total-unit">steps</span>
            </p>
          </div>

          <button className="insights-mode-pill">
            Steps ▾
          </button>
        </div>

        {/* Tabs row */}
        <div className="insights-tabs">
          <button className="insights-tab">Day</button>
          <button className="insights-tab">Week</button>
          <button className="insights-tab insights-tab-active">Month</button>
          <button className="insights-tab">Year</button>
        </div>

        {/* Chart */}
        <div className="insights-chart-wrapper">
          {/* Target & average lines */}
          <div className="insights-line-label insights-line-label-top">
            <span>{bestMonthSteps.toLocaleString()}</span>
          </div>
          <div className="insights-line-label insights-line-label-mid">
            <span>AVG {avgSteps.toLocaleString()}</span>
          </div>

          <div className="insights-chart-bg">
            <div className="insights-line insights-line-top" />
            <div className="insights-line insights-line-mid" />
          </div>

          <div className="insights-bars">
            {monthlySteps.map((value, idx) => {
              const isBest = idx === bestMonthIndex;
              const heightPct =
                bestMonthSteps > 0
                  ? Math.max(8, Math.round((value / bestMonthSteps) * 100))
                  : 0;

              return (
                <div key={idx} className="insights-bar-group">
                  <div
                    className={
                      "insights-bar" +
                      (isBest ? " insights-bar-best" : "")
                    }
                    style={{ height: `${heightPct}%` }}
                    title={`${MONTH_LABELS[idx]}: ${value.toLocaleString()} steps`}
                  />
                  <span className="insights-bar-label">
                    {MONTH_LABELS[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary text */}
        <p className="insights-summary">
          {yearlyTotal > 0 ? (
            <>
              You walked{" "}
              <span className="insights-highlight">
                {yearlyTotal.toLocaleString()}
              </span>{" "}
              steps in {yearLabel}. That’s an impressive record.
            </>
          ) : (
            <>Start walking to unlock your yearly insights.</>
          )}
        </p>
      </div>
    </div>
  );
}
