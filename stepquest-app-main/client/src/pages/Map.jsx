import { useQuest } from "../context/QuestContext";
import knightImg from "../assets/knight.png";
import "../components/Map.css";
import { ZONES as zones } from "../data/zones";
import { useEnvironment } from "../hooks/useEnvironment";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNotification } from "../context/NotificationContext";
import { useState } from "react";
import ZoneUnlockModal from "../components/ZoneUnlockModal";

// Player marker: glowing knight icon
const getKnightIcon = () =>
  new L.DivIcon({
    html: `
      <div style="
        width:44px; height:44px; border-radius:50%;
        background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%);
        border: 2px solid rgba(251,191,36,0.8);
        box-shadow: 0 0 20px rgba(251,191,36,0.7);
        display:flex; align-items:center; justify-content:center;
        animation: playerGlow 2s ease-in-out infinite;
        overflow:hidden;
      ">
        <img src="${knightImg}" style="width:28px;height:28px;image-rendering:pixelated;" />
      </div>`,
    className: "custom-zone-icon",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });

// Zone marker: pulsing for unlocked, dimmed for locked
const getZoneIcon = (emoji, unlocked) =>
  new L.DivIcon({
    html: `
      <div style="
        width:40px; height:40px; border-radius:50%;
        background: ${unlocked
          ? "radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(16,185,129,0.08) 60%)"
          : "rgba(24,24,36,0.7)"
        };
        border: 2px solid ${unlocked ? "rgba(34,197,94,0.7)" : "rgba(100,116,139,0.3)"};
        box-shadow: ${unlocked ? "0 0 18px rgba(34,197,94,0.55)" : "none"};
        display:flex; align-items:center; justify-content:center;
        font-size: 1.2rem;
        ${unlocked ? "animation: zonePulse 2.5s ease-in-out infinite;" : "filter: grayscale(70%) brightness(0.6);"}
      ">${emoji}</div>`,
    className: "custom-zone-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });

export default function Map() {
  const { totalSteps, setXp } = useQuest();
  const { city, lat, lon, loading } = useEnvironment();
  const { showToast } = useNotification();
  const [selectedReplayZone, setSelectedReplayZone] = useState(null);

  if (loading || !lat || !lon) {
    return (
      <div className="page map-loading">
        <div className="map-loading-pulse" />
        <p className="stat muted" style={{ fontSize: "1rem", textAlign: "center" }}>
          📡 Calibrating GPS...
        </p>
      </div>
    );
  }

  // Localize first two zone names to the user's city
  const localizedZones = zones.map((z, idx) => {
    if (!city || city === "Unknown") return z;
    if (idx === 0) return { ...z, name: `${city} Edge` };
    if (idx === 1) return { ...z, name: `${city} Woods` };
    return z;
  });

  const userPos = [lat, lon];
  const MAX_RADIUS_KM = 10;
  const DEG_PER_KM = 1 / 111.32;
  const MAX_RADIUS_DEG = MAX_RADIUS_KM * DEG_PER_KM;

  const mappedZones = localizedZones.map((z, i) => {
    if (i === 0) return { ...z, coords: [lat, lon] };
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = i * goldenAngle;
    const r = Math.sqrt(i / (localizedZones.length - 1)) * MAX_RADIUS_DEG;
    const latOffset = r * Math.cos(angle);
    const lonOffset = (r * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180);
    return { ...z, coords: [lat + latOffset, lon + lonOffset] };
  });

  const unlockedCount = mappedZones.filter((z) => totalSteps >= z.requiredSteps).length;
  const pathPositions = [userPos, ...mappedZones.map((z) => z.coords)];

  return (
    <div className="page map-page" style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── PREMIUM HUD OVERLAY ── */}
      <div className="map-hud">
        <div className="map-hud-left">
          <div className="map-hud-gps">GPS Locked</div>
          <div className="map-hud-city">{city || "Unknown Location"}</div>
        </div>
        <div className="map-hud-right">
          <div className="map-hud-zones-label">Zones Unlocked</div>
          <div className="map-hud-zones-count">{unlockedCount} <span style={{ color: '#475569', fontWeight: 400 }}>/ {mappedZones.length}</span></div>
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={userPos}
          zoom={12}
          style={{ width: "100%", height: "100vh" }}
          zoomControl={false}
        >
          {/* Dark Carto tile */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Quest path line */}
          <Polyline
            positions={pathPositions}
            pathOptions={{ color: "#fbbf24", dashArray: "8, 12", weight: 2, opacity: 0.4 }}
          />

          {/* Player Marker */}
          <Marker position={userPos} icon={getKnightIcon()}>
            <Popup>
              <p className="zone-popup-name" style={{ color: '#fbbf24' }}>⚔️ You Are Here</p>
              <p className="zone-popup-desc">Your current position.</p>
            </Popup>
          </Marker>

          {/* Zone Markers */}
          {mappedZones.map((zone) => {
            const unlocked = totalSteps >= zone.requiredSteps;
            return (
              <Marker key={zone.id} position={zone.coords} icon={getZoneIcon("🦹‍♂️", unlocked)}>
                <Popup>
                  <p className="zone-popup-name">{zone.name}</p>
                  <p className="zone-popup-desc">{zone.description}</p>
                  {unlocked ? (
                    <>
                      <div className="zone-popup-unlocked">✅ Zone Unlocked</div>
                      {zone.bossName && (
                        <button
                          className="zone-popup-btn"
                          onClick={() => setSelectedReplayZone(zone)}
                        >
                          ⚔️ Rebattle Boss
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="zone-popup-locked">
                      🔒 Requires {zone.requiredSteps.toLocaleString()} steps
                    </div>
                  )}
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
            setXp(prev => prev + 50);
            showToast("Victory! You've proven your growth. (+50 XP)", "success");
          }}
          onLose={() => {
            setSelectedReplayZone(null);
            showToast("The boss stands firm. Train harder and return later!", "error");
          }}
        />
      )}
    </div>
  );
}
