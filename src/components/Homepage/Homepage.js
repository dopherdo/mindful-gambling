import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { useAuth } from "../../context/AuthContext";
import { GAMES } from "../../config/gameNames";
import { useTransitionNavigate } from "../PageTransition/PageTransition";
import ConsciousCash from "../ConsciousCash/ConsciousCash";
import BJCentralBack from "../BJCentralBack/BJCentralBack";

const Homepage = () => {
  const navigate = useNavigate();
  const transitionNav = useTransitionNavigate();
  const { currentUser, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="homepage">
      <div className="app-topbar">
        <div className="app-topbar-left">
          <BJCentralBack />
        </div>
        <div className="app-topbar-right">
          <button className="video-button" onClick={() => navigate("/mindful/video")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "6px" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
            Mindful Video
          </button>
          <ConsciousCash />
          <div className="hamburger-wrap" ref={menuRef}>
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
            {menuOpen && (
              <div className="hamburger-menu">
                {currentUser ? (
                  <>
                    <button onClick={() => { navigate("/profile"); setMenuOpen(false); }}>Profile</button>
                    <button onClick={() => { navigate("/leaderboard"); setMenuOpen(false); }}>Leaderboard</button>
                    <div className="menu-divider" />
                    <button className="menu-signout" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
                  </>
                ) : (
                  <button onClick={() => { navigate("/auth"); setMenuOpen(false); }}>Sign In</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="homepage-hero">
        <h2 className="info-text">Make every bet a mindful one.</h2>
        <h1 className="home-title">{GAMES.mindful.name}</h1>
      </div>

      <div className="game-options">
        <button className="game-card" onClick={() => transitionNav("/mindful/blackjack")}>
          <span className="game-card-label">Blackjack</span>
        </button>
        <button className="game-card" onClick={() => transitionNav("/mindful/roulette")}>
          <span className="game-card-label">Roulette</span>
        </button>
      </div>

      <button className="science-button" onClick={() => setShowModal(true)}>
        The Science
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="modal-title">Why {GAMES.mindful.name}?</h2>

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
                How to Break the Cycle of Gambling Action
              </a>
              <a
                href="https://www.headward.co.uk/blogcontent/2024/2/29/gambling-addiction-recovery-why-you-have-to-stop-chasing-losses"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                Gambling Addiction Recovery: Why You Have to Stop Chasing Losses
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
