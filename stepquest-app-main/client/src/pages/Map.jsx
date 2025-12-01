import { useQuest } from "../context/QuestContext";
import knightImg from "../assets/knight.png";
import "../components/Map.css";


const zones = [
  { id: 1, name: "Forest Edge", requiredSteps: 0, description: "A calm starting area to begin your journey." },
  { id: 2, name: "Whispering Woods", requiredSteps: 2000, description: "Deeper forest paths unlocked by steady walking." },
  { id: 3, name: "Mountain Trail", requiredSteps: 5000, description: "A challenging climb for dedicated adventurers." },
  { id: 4, name: "Crystal Peaks", requiredSteps: 8000, description: "High-altitude zone for serious step grinders." },
];

export default function Map() {
  const { totalSteps } = useQuest();

  // Get all unlocked zones
  const unlockedZones = zones.filter((z) => totalSteps >= z.requiredSteps);
  const unlockedCount = unlockedZones.length;

  // Current zone = last unlocked zone
  const currentZone = unlockedZones[unlockedZones.length - 1];

  // Next zone steps
  const nextZone = zones.find((z) => z.requiredSteps > totalSteps);

  return (
    <div className="page">
      <h1 className="page-title">World Map</h1>

      {/* ====== TOP STATS CARD ====== */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p className="stat">
          Total Steps:{" "}
          <span className="stat-highlight">{totalSteps}</span>
        </p>

        <p className="stat">
          Zones Unlocked:{" "}
          <span className="stat-highlight">{unlockedCount} / {zones.length}</span>
        </p>

        {nextZone ? (
          <p className="stat" style={{ fontSize: "0.8rem", opacity: 0.85 }}>
            Next zone unlocks at{" "}
            <span className="stat-highlight">{nextZone.requiredSteps.toLocaleString()}</span>{" "}
            steps
          </p>
        ) : (
          <p className="stat" style={{ fontSize: "0.8rem", opacity: 0.85 }}>
            🎉 You have reached the final zone!
          </p>
        )}
      </div>

      {/* ====== MAP GRID ====== */}
      <div className="map-grid">
        {zones.map((zone) => {
          const unlocked = totalSteps >= zone.requiredSteps;
          const isCurrentZone = currentZone && currentZone.id === zone.id;

          return (
            <div
              key={zone.id}
              className={`map-tile ${unlocked ? "map-tile-unlocked" : "map-tile-locked"}`}
            >
              {/* Knight Marker if in this zone */}
              {isCurrentZone && (
                <div className="map-knight-marker">
                  <img src={knightImg} alt="Knight" className="map-knight-icon" />
                  <span className="map-knight-text">You Are Here</span>
                </div>
              )}

              <div className="map-tile-header">
                <span>{zone.name}</span>
                <span className="map-tile-status">
                  {unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>

              <p className="map-tile-description">{zone.description}</p>

              {!unlocked && (
                <p className="map-tile-requirement">
                  Unlock at {zone.requiredSteps.toLocaleString()} steps
                </p>
              )}

              {unlocked && (
                <p className="map-tile-requirement">✅ Zone unlocked!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
