import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import "./Leaderboard.css";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getRankDisplay = (i) => {
    if (i === 0) return "1";
    if (i === 1) return "2";
    if (i === 2) return "3";
    return `${i + 1}`;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button className="back-button" onClick={() => navigate("/")}>Back</button>
        <h1 className="leaderboard-title">Leaderboard</h1>
      </div>

      {loading ? (
        <p className="leaderboard-loading">Loading...</p>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-head">
            <span className="col-rank">#</span>
            <span className="col-name">Player</span>
            <span className="col-balance">Balance</span>
            <span className="col-wins">Wins</span>
          </div>
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`leaderboard-row ${currentUser && player.id === currentUser.uid ? "current-user" : ""} ${i < 3 ? `top-${i + 1}` : ""}`}
            >
              <span className="col-rank">{getRankDisplay(i)}</span>
              <span className="col-name">
                <span className="player-display">@{player.username || "anonymous"}</span>
              </span>
              <span className="col-balance">${player.balance ?? 0}</span>
              <span className="col-wins">{player.mindfulStats?.totalWins ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
