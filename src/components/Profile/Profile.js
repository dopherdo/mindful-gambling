import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import BJCentralBack from "../BJCentralBack/BJCentralBack";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [editError, setEditError] = useState("");

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
    setEditError("");
    const trimmed = newUsername.trim().toLowerCase();
    if (!trimmed) { setEditError("Username is required."); return; }
    if (trimmed.length < 3) { setEditError("Username must be at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setEditError("Letters, numbers, and underscores only."); return; }

    if (trimmed !== userData.username) {
      const q = query(collection(db, "users"), where("username", "==", trimmed));
      const snap = await getDocs(q);
      if (!snap.empty) { setEditError("This username is already taken."); return; }

      await updateDoc(doc(db, "users", currentUser.uid), { username: trimmed });
      await updateProfile(auth.currentUser, { displayName: trimmed });
    }
    setEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!userData) return <div className="profile-page"><p className="profile-loading">Loading...</p></div>;

  const oldStats = userData.stats || {};
  const globalStats = userData.globalStats || {};
  const mindfulStats = userData.mindfulStats || {};
  const counterStats = userData.counterStats || userData.ccStats || {};

  // Fallback: merge old stats into new if migration hasn't run
  const gs = { totalGamesPlayed: globalStats.totalGamesPlayed ?? oldStats.totalGamesPlayed ?? 0, videosWatched: globalStats.videosWatched ?? oldStats.videosWatched ?? 0 };
  const ms = {
    totalWins: mindfulStats.totalWins ?? oldStats.totalWins ?? 0,
    totalLosses: mindfulStats.totalLosses ?? oldStats.totalLosses ?? 0,
    biggestWin: mindfulStats.biggestWin ?? oldStats.biggestWin ?? 0,
    totalWagered: mindfulStats.totalWagered ?? oldStats.totalWagered ?? 0,
    blackjackGames: mindfulStats.blackjackGames ?? oldStats.blackjackGames ?? 0,
    rouletteGames: mindfulStats.rouletteGames ?? oldStats.rouletteGames ?? 0,
  };
  const totalGames = gs.totalGamesPlayed;
  const winRate = totalGames > 0
    ? Math.round((ms.totalWins / totalGames) * 100)
    : 0;

  return (
    <div className="profile-page">
      <div className="app-topbar">
        <div className="app-topbar-left">
          <BJCentralBack />
          <span className="app-topbar-title">Profile</span>
        </div>
        <div className="app-topbar-right">
          <button className="logout-button" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className="profile-identity">
        {editing ? (
          <div className="profile-edit-form">
            <input
              className="profile-input"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
              autoFocus
            />
            {editError && <p className="profile-edit-error">{editError}</p>}
            <div className="profile-edit-actions">
              <button className="save-button" onClick={saveProfile}>Save</button>
              <button className="cancel-button" onClick={() => { setEditing(false); setEditError(""); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-name-row">
              <h1 className="profile-name">{userData.username || userData.displayName || "anonymous"}</h1>
              <button className="edit-button" onClick={() => { setNewUsername(userData.username || ""); setEditing(true); }} aria-label="Edit username">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
            </div>
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
          <span className="stat-value">{totalGames}</span>
          <span className="stat-label">Games Played</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{ms.totalWins}</span>
          <span className="stat-label">Wins</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{ms.totalLosses}</span>
          <span className="stat-label">Losses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{winRate}%</span>
          <span className="stat-label">Win Rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${ms.biggestWin}</span>
          <span className="stat-label">Biggest Win</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${ms.totalWagered}</span>
          <span className="stat-label">Total Wagered</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{gs.videosWatched}</span>
          <span className="stat-label">Videos Watched</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{ms.blackjackGames}</span>
          <span className="stat-label">Blackjack Games</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{ms.rouletteGames}</span>
          <span className="stat-label">Roulette Games</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counterStats.handsPlayed ?? 0}</span>
          <span className="stat-label">Cards Counted</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counterStats.accuracy ?? 0}%</span>
          <span className="stat-label">Count Accuracy</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
