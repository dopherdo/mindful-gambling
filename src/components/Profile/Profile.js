import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");

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

  const saveProfile = async () => {
    const updates = {};
    if (newName.trim()) {
      updates.displayName = newName.trim();
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
    }
    if (newUsername.trim() && newUsername.trim() !== userData.username) {
      updates.username = newUsername.trim().toLowerCase();
    }
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "users", currentUser.uid), updates);
    }
    setEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!userData) return <div className="profile-page"><p className="profile-loading">Loading...</p></div>;

  const { stats = {} } = userData;
  const winRate = stats.totalGamesPlayed > 0
    ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100)
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>Back</button>
        <button className="logout-button" onClick={handleLogout}>Sign Out</button>
      </div>

      <div className="profile-identity">
        {editing ? (
          <div className="profile-edit-form">
            <input
              className="profile-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Display name"
              autoFocus
            />
            <input
              className="profile-input"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
            />
            <div className="profile-edit-actions">
              <button className="save-button" onClick={saveProfile}>Save</button>
              <button className="cancel-button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-name-row">
              <h1 className="profile-name">{userData.displayName || "Anonymous"}</h1>
              <button className="edit-button" onClick={() => { setNewName(userData.displayName || ""); setNewUsername(userData.username || ""); setEditing(true); }}>
                Edit
              </button>
            </div>
            {userData.username && (
              <p className="profile-username">@{userData.username}</p>
            )}
            <p className="profile-email">{userData.email}</p>
          </>
        )}
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
