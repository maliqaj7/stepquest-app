import { useInventory } from "../context/InventoryContext";
import { useState } from "react";
import "../components/Inventory.css";




export default function InventoryPage() {
  const { inventory, totalStats, rarityColors, removeItem } = useInventory();

  const [sortBy, setSortBy] = useState("rarity");

  // Sorting logic
  const sortedInventory = [...inventory].sort((a, b) => {
    if (sortBy === "rarity") {
      const order = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    }
    if (sortBy === "newest") return -1;
    return 0;
  });

  return (
    <div className="page">
      <h1 className="page-title">Inventory</h1>

      {/* =======================
          Knight Stats Card
      ======================== */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="card-title">Knight Stats</h2>

        <div className="stats-grid">
          <p className="stat">ATK: <span className="stat-highlight">{totalStats.atk}</span></p>
          <p className="stat">DEF: <span className="stat-highlight">{totalStats.def}</span></p>
          <p className="stat">SPD: <span className="stat-highlight">{totalStats.spd}</span></p>
          <p className="stat">LUCK: <span className="stat-highlight">{totalStats.luck}</span></p>
          <p className="stat">END: <span className="stat-highlight">{totalStats.end}</span></p>
          <p className="stat">MAG: <span className="stat-highlight">{totalStats.mag}</span></p>
        </div>
      </div>

      {/* =======================
          Sort Menu
      ======================== */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="card-title">Sort Items</h2>
        <select
          className="select-menu"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rarity">Sort by Rarity</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* =======================
          Inventory Items
      ======================== */}
      <div className="card">
        <h2 className="card-title">Gear & Relics</h2>

        {inventory.length === 0 && (
          <p className="stat" style={{ opacity: 0.7 }}>
            No items found yet. Walk deeper into the unknown...
          </p>
        )}

        <div className="inventory-grid">
          {sortedInventory.map((item, index) => (
            <div
              key={index}
              className="inventory-item"
              style={{
                borderColor: rarityColors[item.rarity] || "#fff",
              }}
            >
              <div className="inventory-icon">{item.icon}</div>

              <div className="inventory-info">
                <p className="inventory-name">
                  {item.name}{" "}
                  <span
                    className="inventory-rarity"
                    style={{ color: rarityColors[item.rarity] }}
                  >
                    ({item.rarity})
                  </span>
                </p>

                <p className="inventory-desc">{item.description}</p>

                {item.stats && (
                  <p className="inventory-stats">
                    {item.stats.atk ? `+${item.stats.atk} ATK ` : ""}
                    {item.stats.def ? `+${item.stats.def} DEF ` : ""}
                    {item.stats.spd ? `+${item.stats.spd} SPD ` : ""}
                    {item.stats.luck ? `+${item.stats.luck} LUCK ` : ""}
                    {item.stats.end ? `+${item.stats.end} END ` : ""}
                    {item.stats.mag ? `+${item.stats.mag} MAG ` : ""}
                  </p>
                )}
              </div>

              {/* Remove Item Button */}
              <button
                className="remove-item-btn"
                onClick={() => removeItem(index)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
