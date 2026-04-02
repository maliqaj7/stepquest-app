import { useQuest } from "../context/QuestContext";
import knightImg from "../assets/knight.png";
import "../components/Map.css";
import { ZONES as zones } from "../data/zones";
import { useEnvironment } from "../hooks/useEnvironment";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import ZoneUnlockModal from "../components/ZoneUnlockModal";

const getKnightIcon = () =>
  new L.Icon({
    iconUrl: knightImg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const getZoneIcon = (emoji, unlocked) =>
  new L.DivIcon({
    html: `<div style="font-size: 28px; filter: ${
      unlocked ? "drop-shadow(0 0 8px rgba(34,197,94,0.8))" : "grayscale(100%) opacity(50%)"
    };">${emoji}</div>`,
    className: "custom-zone-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

export default function Map() {
  const { totalSteps, setXp } = useQuest();
  const { city, lat, lon, loading } = useEnvironment();
  const [selectedReplayZone, setSelectedReplayZone] = useState(null);

  if (loading || !lat || !lon) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <p className="stat muted" style={{ fontSize: "1.2rem", textAlign: "center" }}>
          📡 Calibrating GPS...
        </p>
      </div>
    );
  }

  // Rewrite zones to include the user's city
  const localizedZones = zones.map((z, idx) => {
    if (!city || city === "Unknown") return z;
    if (idx === 0) return { ...z, name: `${city} Edge` };
    if (idx === 1) return { ...z, name: `${city} Woods` };
    return z;
  });

  // Calculate coordinates radiating outward from the user
  const userPos = [lat, lon];
  
  // Golden Angle Spiral distribution for 10km radius
  const MAX_RADIUS_KM = 10;
  const DEG_PER_KM = 1 / 111.32; // Approx degrees per km for latitude
  const MAX_RADIUS_DEG = MAX_RADIUS_KM * DEG_PER_KM;

  const mappedZones = localizedZones.map((z, i) => {
    if (i === 0) return { ...z, coords: [lat, lon] };
    
    // Golden angle in radians: (3 - sqrt(5)) * PI ≈ 137.5 degrees
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = i * goldenAngle;
    
    // Uniform area distribution: r = sqrt(i / total) * MaxR
    const r = Math.sqrt(i / (localizedZones.length - 1)) * MAX_RADIUS_DEG;
    
    const latOffset = r * Math.cos(angle);
    // Compensate longitude for latitude narrowing towards poles
    const lonOffset = (r * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180);
    
    return {
      ...z,
      coords: [lat + latOffset, lon + lonOffset],
    };
  });

  const unlockedCount = mappedZones.filter((z) => totalSteps >= z.requiredSteps).length;
  const pathPositions = [userPos, ...mappedZones.map((z) => z.coords)];

  return (
    <div className="page map-page" style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        className="card"
        style={{
          margin: "1rem",
          zIndex: 1000, // Stay above Leaflet map
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(9, 9, 11, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="stat" style={{ margin: 0 }}>
          GPS Locked: <span className="stat-highlight">{city}</span>
        </p>
        <p className="stat" style={{ margin: 0 }}>
          Zones Unlocked: <span className="stat-highlight">{unlockedCount} / {mappedZones.length}</span>
        </p>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={userPos}
          zoom={12}
          style={{ width: "100%", height: "100vh" }}
          zoomControl={false}
        >
          {/* Dark themed map tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Connect the zones with a dashed line */}
          <Polyline
            positions={pathPositions}
            pathOptions={{ color: "#22c55e", dashArray: "10, 10", weight: 3, opacity: 0.6 }}
          />

          {/* User Marker */}
          <Marker position={userPos} icon={getKnightIcon()}>
            <Popup zIndexOffset={1000}>
              <div style={{ color: "#000", fontWeight: "bold" }}>You are here!</div>
            </Popup>
          </Marker>

          {/* Zone Boss Markers */}
          {mappedZones.map((zone) => {
            const unlocked = totalSteps >= zone.requiredSteps;
            return (
              <Marker key={zone.id} position={zone.coords} icon={getZoneIcon("🦹‍♂️", unlocked)}>
                <Popup>
                  <div style={{ color: "#000", minWidth: "150px" }}>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "1rem" }}>{zone.name}</h3>
                    <p style={{ margin: "0 0 5px 0", fontSize: "0.8rem" }}>{zone.description}</p>
                    {unlocked ? (
                      <div style={{ marginTop: "8px" }}>
                        <strong style={{ color: "green", display: "block", marginBottom: "4px" }}>✅ Unlocked!</strong>
                        {zone.bossName && (
                          <button 
                            className="btn-primary" 
                            style={{ fontSize: "0.7rem", padding: "4px 8px", width: "100%" }}
                            onClick={() => setSelectedReplayZone(zone)}
                          >
                            ⚔️ Rebattle Boss
                          </button>
                        )}
                      </div>
                    ) : (
                      <em style={{ color: "red" }}>Requires {zone.requiredSteps} steps</em>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {selectedReplayZone && (
        <ZoneUnlockModal
          zone={selectedReplayZone}
          isReplay={true}
          onWin={() => {
            setSelectedReplayZone(null);
            setXp(prev => prev + 50); // Small XP reward for replay
            alert(`Victory! You've proven your growth. (+50 XP)`);
          }}
          onLose={() => {
            setSelectedReplayZone(null);
            alert("The boss stands firm. Train harder and return later!");
          }}
        />
      )}
    </div>
  );
}
