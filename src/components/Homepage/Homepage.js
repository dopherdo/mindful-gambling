import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { BalanceContext } from "../../context/BalanceContext";
import { useAuth } from "../../context/AuthContext";
import ConsciousCash from "../ConsciousCash/ConsciousCash";

const Homepage = () => {
  const navigate = useNavigate();
  const { migrationPending, acceptMigration, declineMigration } = useContext(BalanceContext);
  const { currentUser, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="homepage">
      <h2 className="info-text">Make every bet a mindful one.</h2>
      <h1 className="home-title">Mindful Gambling</h1>

      {/* Top Right Section */}
      <div className="top-right">
        <button className="video-button" onClick={() => navigate("/mindful/video")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: "8px", verticalAlign: "middle"}}>
            <path d="M8 5v14l11-7z"/>
          </svg>
          Mindful Video
        </button>
        {currentUser ? (
          <>
            <button className="nav-link-button" onClick={() => navigate("/leaderboard")}>Leaderboard</button>
            <button className="nav-link-button" onClick={() => navigate("/profile")}>{currentUser.displayName || "Profile"}</button>
            <button className="nav-link-button" onClick={() => navigate("/")}>← BJ Central</button>
            <button className="nav-link-button signout" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <button className="nav-link-button signin" onClick={() => navigate("/auth")}>Sign In</button>
        )}
        <ConsciousCash />
      </div>

      {/* Balance migration prompt */}
      {migrationPending && (
        <div className="migration-banner">
          <span>You have ${parseInt(localStorage.getItem("balance"), 10)} as a guest. Keep it on your account?</span>
          <button onClick={acceptMigration}>Yes, keep it</button>
          <button onClick={declineMigration}>No, use account balance</button>
        </div>
      )}

      {/* Game Options */}
      <div className="game-options">
        <button className="blackjack-button" onClick={() => navigate("/mindful/blackjack")}>
          Blackjack
        </button>
        <button className="roulette-button" onClick={() => navigate("/mindful/roulette")}>
          Roulette
        </button>
      </div>

      {/* Science Button */}
      <button className="science-button" onClick={() => setShowModal(true)}>
        The Science
      </button>

      {/* Info Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>

            <h2 className="modal-title">Why Mindful Gambling?</h2>

            <p className="modal-body">
              This app is built around a simple truth: the most dangerous moment in gambling
              isn't when you're winning — it's when you're losing and convinced the next bet
              will fix it.
            </p>

            <h3 className="modal-section-title">The Science of Chasing Losses</h3>
            <p className="modal-body">
              When you lose money, your brain releases dopamine in a way that frames the loss
              as an <em>opportunity</em> rather than a setback. This triggers a compulsion to
              "get even" — a cycle that is self-perpetuating and mathematically impossible to
              escape through more gambling. The odds are always stacked against you, and the
              more you chase, the deeper the hole.
            </p>

            <h3 className="modal-section-title">How the Mindful Video Breaks the Cycle</h3>
            <p className="modal-body">
              Before placing another bet after a loss, the Mindful Video creates a deliberate
              pause. Research shows that even a brief interruption — watching something that
              reframes your thinking — can disrupt the dopamine-driven chase and restore
              rational decision-making. The goal is awareness, not restriction.
            </p>

            <div className="modal-links">
              <a
                href="https://gamblinghelp.org/how-to-break-the-cycle-of-gambling-action/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                How to Break the Cycle of Gambling Action →
              </a>
              <a
                href="https://www.headward.co.uk/blogcontent/2024/2/29/gambling-addiction-recovery-why-you-have-to-stop-chasing-losses"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                Gambling Addiction Recovery: Why You Have to Stop Chasing Losses →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
