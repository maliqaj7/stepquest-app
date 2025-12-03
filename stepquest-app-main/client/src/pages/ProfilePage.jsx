import { useState, useEffect } from "react";
import "./ProfilePage.css";
import knight1 from "../assets/Knight.png";
import knight2 from "../assets/Evil Knight.png";
import knight3 from "../assets/Female Knight.png";
import knight4 from "../assets/Goblin.jpg";

export default function ProfilePage() {
  const avatarList = [
    { id: 1, img: knight1, name: "Hero Knight" },
    { id: 2, img: knight2, name: "Evil Knight" },
    { id: 3, img: knight3, name: "Female Knight" },
    { id: 4, img: knight4, name: "Goblin Knight" },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("selectedAvatar") || knight1
  );

  // Save avatar choice
  useEffect(() => {
    localStorage.setItem("selectedAvatar", selectedAvatar);
  }, [selectedAvatar]);

  // Upload custom avatar
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result); // base64 image
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Your Avatar</h1>

      {/* MAIN AVATAR DISPLAY */}
      <div className="avatar-preview">
        <img src={selectedAvatar} className="avatar-large" />
        <p className="avatar-subtext">
          This is your hero across the world map & dashboard.
        </p>
      </div>

      {/* UPLOAD BUTTON */}
      <label className="upload-btn">
        Upload Custom Image
        <input type="file" accept="image/*" onChange={handleUpload} />
      </label>

      <h2 className="profile-section-title">Choose a Preset Avatar</h2>

      {/* PRESET AVATAR GRID */}
      <div className="avatar-grid">
        {avatarList.map((a) => (
          <div
            key={a.id}
            className={`avatar-wrapper ${
              selectedAvatar === a.img ? "avatar-selected" : ""
            }`}
            onClick={() => setSelectedAvatar(a.img)}
          >
            <img src={a.img} className="avatar-option" />
            <p className="avatar-name">{a.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
