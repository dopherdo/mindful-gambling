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

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button className="back-button" onClick={() => navigate("/")}>← BJ Central</button>
        <h1 className="leaderboard-title">Leaderboard</h1>
      </div>

      {loading ? (
        <p className="leaderboard-loading">Loading...</p>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-head">
            <span className="col-rank">Rank</span>
            <span className="col-name">Player</span>
            <span className="col-balance">Balance</span>
            <span className="col-wins">Wins</span>
            <span className="col-videos">Videos</span>
          </div>
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`leaderboard-row ${currentUser && player.id === currentUser.uid ? "current-user" : ""}`}
            >
              <span className="col-rank">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <span className="col-name">{player.displayName || "Anonymous"}</span>
              <span className="col-balance">${player.balance ?? 0}</span>
              <span className="col-wins">{player.stats?.totalWins ?? 0}</span>
              <span className="col-videos">{player.stats?.videosWatched ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
