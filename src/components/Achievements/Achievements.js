import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import allAchievements, { getRank, gameAchievements } from "../../config/achievements";
import BJCentralBack from "../BJCentralBack/BJCentralBack";
import "./Achievements.css";

const Achievements = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });
    return unsubscribe;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="ach-page">
        <div className="ach-header">
          <BJCentralBack />
          <h1 className="ach-title">Achievements</h1>
        </div>
        <p className="ach-empty">Sign in to track your achievements.</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="ach-page">
        <p className="ach-loading">Loading...</p>
      </div>
    );
  }

  const oldStats = userData.stats || {};
  const data = {
    globalStats: {
      totalGamesPlayed: (userData.globalStats || {}).totalGamesPlayed ?? oldStats.totalGamesPlayed ?? 0,
      videosWatched: (userData.globalStats || {}).videosWatched ?? oldStats.videosWatched ?? 0,
    },
    mindfulStats: {
      blackjackGames: (userData.mindfulStats || {}).blackjackGames ?? oldStats.blackjackGames ?? 0,
      rouletteGames: (userData.mindfulStats || {}).rouletteGames ?? oldStats.rouletteGames ?? 0,
      totalWins: (userData.mindfulStats || {}).totalWins ?? oldStats.totalWins ?? 0,
      totalLosses: (userData.mindfulStats || {}).totalLosses ?? oldStats.totalLosses ?? 0,
      biggestWin: (userData.mindfulStats || {}).biggestWin ?? oldStats.biggestWin ?? 0,
      totalWagered: (userData.mindfulStats || {}).totalWagered ?? oldStats.totalWagered ?? 0,
    },
    counterStats: userData.counterStats || userData.ccStats || {},
    balance: userData.balance ?? 0,
  };

  const unlocked = allAchievements.filter((a) => a.check(data));
  const totalPct = Math.round((unlocked.length / allAchievements.length) * 100);
  const rank = getRank(totalPct);

  return (
    <div className="ach-page">
      <div className="ach-header">
        <BJCentralBack />
        <h1 className="ach-title">Achievements</h1>
      </div>

      {/* Overall rank card */}
      <div className="ach-rank-card">
        <div className="ach-rank-top">
          <div className="ach-rank-badge" style={{ borderColor: rank.color }}>
            <span className="ach-rank-name" style={{ color: rank.color }}>{rank.name}</span>
          </div>
          <div className="ach-rank-info">
            <span className="ach-rank-pct" style={{ color: rank.color }}>{totalPct}%</span>
            <span className="ach-rank-sub">{unlocked.length} / {allAchievements.length} unlocked</span>
          </div>
        </div>
        <div className="ach-bar-track">
          <div
            className="ach-bar-fill"
            style={{ width: `${totalPct}%`, background: rank.color }}
          />
        </div>
      </div>

      {/* Per-game sections */}
      {gameAchievements.map((game) => {
        const gameAchs = game.achievements;
        const gameUnlocked = gameAchs.filter((a) => a.check(data)).length;
        const gamePct = gameAchs.length > 0 ? Math.round((gameUnlocked / gameAchs.length) * 100) : 0;

        return (
          <div key={game.key} className="ach-game-section">
            <div className="ach-game-header">
              <h2 className="ach-game-title">{game.name}</h2>
              <span className="ach-game-count">{gameUnlocked}/{gameAchs.length}</span>
            </div>
            <div className="ach-bar-track ach-bar-sm">
              <div className="ach-bar-fill" style={{ width: `${gamePct}%` }} />
            </div>

            {game.categories.map((cat) => {
              const catAchs = gameAchs.filter((a) => a.category === cat.key);
              const catDone = catAchs.filter((a) => a.check(data)).length;

              return (
                <div key={cat.key} className="ach-category">
                  <div className="ach-cat-header">
                    <h3 className="ach-cat-title">{cat.label}</h3>
                    <span className="ach-cat-count">{catDone}/{catAchs.length}</span>
                  </div>
                  <div className="ach-list">
                    {catAchs.map((ach) => {
                      const done = ach.check(data);
                      return (
                        <div key={ach.id} className={`ach-item ${done ? "ach-done" : "ach-locked"}`}>
                          <div className="ach-icon">{done ? "\u2713" : "\u2022"}</div>
                          <div className="ach-item-info">
                            <span className="ach-item-title">{ach.title}</span>
                            <span className="ach-item-desc">{ach.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Achievements;
