import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });
    return unsubscribe;
  }, [currentUser, navigate]);

  const saveDisplayName = async () => {
    if (!newName.trim()) return;
    await updateDoc(doc(db, "users", currentUser.uid), { displayName: newName.trim() });
    setEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!userData) return <div className="profile-page"><p className="profile-loading">Loading...</p></div>;

  const { stats = {} } = userData;
  const winRate = stats.totalGamesPlayed > 0
    ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100)
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>← Home</button>
        <button className="logout-button" onClick={handleLogout}>Sign Out</button>
      </div>

      <div className="profile-name-section">
        {editing ? (
          <div className="profile-name-edit">
            <input
              className="profile-name-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Display name"
              autoFocus
            />
            <button className="save-button" onClick={saveDisplayName}>Save</button>
            <button className="cancel-edit-button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="profile-name-row">
            <h1 className="profile-name">{userData.displayName || "Anonymous"}</h1>
            <button className="edit-button" onClick={() => { setNewName(userData.displayName || ""); setEditing(true); }}>
              Edit
            </button>
          </div>
        )}
        <p className="profile-email">{userData.email}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <span className="stat-value">${userData.balance ?? 0}</span>
          <span className="stat-label">Conscious Cash</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalGamesPlayed ?? 0}</span>
          <span className="stat-label">Games Played</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalWins ?? 0}</span>
          <span className="stat-label">Wins</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalLosses ?? 0}</span>
          <span className="stat-label">Losses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{winRate}%</span>
          <span className="stat-label">Win Rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${stats.biggestWin ?? 0}</span>
          <span className="stat-label">Biggest Win</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${stats.totalWagered ?? 0}</span>
          <span className="stat-label">Total Wagered</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.videosWatched ?? 0}</span>
          <span className="stat-label">Videos Watched</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.blackjackGames ?? 0}</span>
          <span className="stat-label">Blackjack Games</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.rouletteGames ?? 0}</span>
          <span className="stat-label">Roulette Games</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
