import { useState } from "react";
import "./visualize.css";

// 🔹 ROOM CONFIG (BASED ON YOUR FILES)
const ROOMS = [
  {
    id: "small",
    label: "Small Room",
    base: "/rooms/living/small_room.jpg",
    floorMask: "/mask/Floor/small_room_floor_mask.png",
  },
  {
    id: "medium",
    label: "Medium Room",
    base: "/rooms/living/medium_room.jpg",
    floorMask: "/mask/Floor/medium_room_floor_mask.png",
  },
  {
    id: "large",
    label: "Large Room",
    base: "/rooms/living/large_room.jpg",
    floorMask: "/mask/Floor/large_room_floor_mask.png",
  },
  {
    id: "extra",
    label: "Extra Large",
    base: "/rooms/living/extra_large_room.jpg",
    floorMask: "/mask/Floor/extra_large_room_floor_mask.png",
  },
];

export default function Visualize({ open, onClose, product }) {
  if (!open || !product) return null;

  // 🔹 selected room
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);

  // 🔹 tile image (from backend – correct approach)
  const tileUrl = product.tileImage
    ? `http://localhost:5000${product.tileImage}`
    : "";

  return (
    <div className="visualize-overlay">
      <div className="visualize-modal">
        <button className="visualize-close" onClick={onClose}>✕</button>

        {/* 🔹 ROOM SELECTOR */}
        <div className="room-selector">
          {ROOMS.map(room => (
            <div
              key={room.id}
              className={`room-thumb ${
                selectedRoom.id === room.id ? "active" : ""
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              <img src={room.base} alt={room.label} />
              <span>{room.label}</span>
            </div>
          ))}
        </div>

        {/* 🔹 VISUALIZATION */}
        <div className="visualize-wrapper">
          <div className="room-wrapper">
            {/* Base Room */}
            <img
              src={selectedRoom.base}
              className="room-base"
              alt="Room"
            />

            {/* Floor Tile Overlay */}
            <div
              className="tile-overlay"
              style={{
                backgroundImage: tileUrl ? `url(${tileUrl})` : "none",
                WebkitMaskImage: `url(${selectedRoom.floorMask})`,
                maskImage: `url(${selectedRoom.floorMask})`,
              }}
            />
          </div>

          <div className="visualize-info">
            <h2>{product.name}</h2>
            <p>
              Select a room above to preview this tile on the floor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}