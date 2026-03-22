import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { GAMES } from "../../config/gameNames";
import { buildShoe, isRed, hiLoValue, hiLoLabel } from "../../utils/deckUtils";
import "./CardCounter.css";
import BJCentralBack from "../BJCentralBack/BJCentralBack";
import Tutorial from "./Tutorial";
import GameSimulator from "./GameSimulator";

// ─── Card component (pure B&W) ─────────────────────────────────────────────
const Card = ({ card, revealed }) => {
  if (!card) return null;
  const red = isRed(card);
  return (
    <div className={`cc-card ${revealed ? "cc-card-revealed" : ""}`}>
      <div className={`cc-card-inner ${red ? "cc-card-red" : "cc-card-black"}`}>
        <span className="cc-card-rank">{card.rank}</span>
        <span className="cc-card-suit">{card.suit}</span>
      </div>
      {revealed && (
        <span className={`cc-card-hilo ${hiLoValue(card.rank) > 0 ? "hilo-pos" : hiLoValue(card.rank) < 0 ? "hilo-neg" : "hilo-zero"}`}>
          {hiLoLabel(card.rank)}
        </span>
      )}
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────
const CardCounter = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("cc-tutorial-seen");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem("cc-tutorial-seen", "1");
    }
  }, []);

  // Mode & setup state
  const [mode, setMode] = useState(null); // null | "trainer" | "simulator"
  const [phase, setPhase] = useState("setup"); // setup | playing | done
  const [deckCount, setDeckCount] = useState(null);

  // ── Count Trainer state ────────────────────────────────────────────────
  const shoeRef = useRef([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [, setDealtCards] = useState([]);
  const [trueCount, setTrueCount] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const [cardsDealt, setCardsDealt] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  // Decision tracking
  const [, setDecisions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalDecisions, setTotalDecisions] = useState(0);

  // Current decision state
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const getAccuracy = useCallback(() => {
    if (totalDecisions === 0) return 0;
    return Math.round((correctCount / totalDecisions) * 100);
  }, [correctCount, totalDecisions]);

  const getAccuracyColor = useCallback(() => {
    const acc = getAccuracy();
    if (acc >= 90) return "#5DBF7E";
    if (acc >= 70) return "#C4A855";
    if (acc >= 50) return "#D4874D";
    return "#BF6B6B";
  }, [getAccuracy]);

  // ── Start count trainer session ────────────────────────────────────────
  const startSession = (decks) => {
    setDeckCount(decks);
    const shoe = buildShoe(decks);
    shoeRef.current = shoe;
    setTotalCards(shoe.length);
    setCardsDealt(0);
    setRunningCount(0);
    setTrueCount(0);
    setCorrectCount(0);
    setTotalDecisions(0);
    setDecisions([]);
    setDealtCards([]);
    setCurrentCard(null);
    setShowResult(false);
    setLastCorrect(null);
    setPhase("playing");
    dealNext(shoe, 0, 0, decks);
  };

  // ── Deal next card ────────────────────────────────────────────────────
  const dealNext = (shoe, dealt, rc, decks) => {
    if (shoe.length === 0) {
      setPhase("done");
      syncStats();
      return;
    }
    const card = shoe.pop();
    setCurrentCard(card);
    setCardsDealt(dealt + 1);

    const newRc = rc + hiLoValue(card.rank);
    const decksRemaining = Math.max((shoe.length) / 52, 0.5);
    const tc = Math.round((newRc / decksRemaining) * 10) / 10;
    setTrueCount(tc);
    setShowResult(false);
    setLastCorrect(null);
  };

  // ── Handle user's count decision ──────────────────────────────────────
  const handleDecision = (userAnswer) => {
    if (showResult) return;

    const card = currentCard;
    const correct = hiLoValue(card.rank);
    const isCorrect = userAnswer === correct;

    setShowResult(true);
    setLastCorrect(isCorrect);

    const newRc = runningCount + correct;
    setRunningCount(newRc);

    setDecisions(prev => [...prev, {
      card,
      userAnswer,
      correct: isCorrect,
      trueAnswer: correct,
    }]);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setTotalDecisions(prev => prev + 1);
    setDealtCards(prev => [...prev, card]);
  };

  const nextCard = () => {
    dealNext(shoeRef.current, cardsDealt, runningCount, deckCount);
  };

  const endSession = () => {
    setPhase("done");
    syncStats();
  };

  // ── Sync stats to Firestore ───────────────────────────────────────────
  const syncStats = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        "counterStats.handsPlayed": cardsDealt,
        "counterStats.correctCounts": correctCount,
        "counterStats.accuracy": getAccuracy(),
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to sync CC stats:", err);
    }
  };

  // ── Penetration indicator ─────────────────────────────────────────────
  const penetration = totalCards > 0 ? (cardsDealt / totalCards) * 100 : 0;
  const decksRemaining = totalCards > 0 ? Math.max((totalCards - cardsDealt) / 52, 0) : 0;

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER: SETUP (Mode Selection + Deck Selection)
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div className="cc-page">
        <div className="app-topbar">
          <div className="app-topbar-left">
            <BJCentralBack />
            <span className="app-topbar-title">Card Counter</span>
          </div>
          <div className="app-topbar-right">
            {currentUser && (
              <button className="profile-icon-btn" onClick={() => navigate("/profile")} title="Profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tutorial overlay */}
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

        <div className="cc-setup">
          <h1 className="cc-title">{GAMES.cardCounter.name}</h1>
          <p className="cc-subtitle">Hi-Lo Counting Trainer</p>

          {/* Tutorial button */}
          <button className="cc-tutorial-btn" onClick={() => setShowTutorial(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            How to Count Cards
          </button>

          {!mode ? (
            <>
              {/* Mode Selection */}
              <p className="cc-choose-label">Choose your mode</p>
              <div className="cc-mode-options">
                <button className="cc-mode-btn" onClick={() => setMode("trainer")}>
                  <div className="cc-mode-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M12 8v4M10 10h4"/>
                    </svg>
                  </div>
                  <span className="cc-mode-name">Count Trainer</span>
                  <span className="cc-mode-desc">Cards dealt one at a time. Practice identifying Hi-Lo values.</span>
                </button>
                <button className="cc-mode-btn" onClick={() => setMode("simulator")}>
                  <div className="cc-mode-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="1" y="5" width="9" height="14" rx="1.5"/>
                      <rect x="14" y="5" width="9" height="14" rx="1.5"/>
                      <circle cx="12" cy="20" r="1"/>
                    </svg>
                  </div>
                  <span className="cc-mode-name">Game Simulator</span>
                  <span className="cc-mode-desc">Play simulated blackjack. Practice counting while making real decisions.</span>
                </button>
              </div>
            </>
          ) : mode === "trainer" ? (
            <>
              {/* Count Trainer — Deck selection */}
              <div className="cc-info-card">
                <h3 className="cc-info-heading">How it works</h3>
                <p className="cc-info-text">
                  Cards are dealt one at a time. For each card, identify whether it adds +1, 0, or -1
                  to the running count using the Hi-Lo system.
                </p>
                <div className="cc-hilo-guide">
                  <div className="cc-guide-row">
                    <span className="cc-guide-cards">2-6</span>
                    <span className="cc-guide-value hilo-pos">+1</span>
                  </div>
                  <div className="cc-guide-row">
                    <span className="cc-guide-cards">7-9</span>
                    <span className="cc-guide-value hilo-zero">0</span>
                  </div>
                  <div className="cc-guide-row">
                    <span className="cc-guide-cards">10-A</span>
                    <span className="cc-guide-value hilo-neg">-1</span>
                  </div>
                </div>
              </div>

              <p className="cc-choose-label">Choose your shoe</p>
              <div className="cc-deck-options">
                <button className="cc-deck-btn" onClick={() => startSession(2)}>
                  <span className="cc-deck-count">2</span>
                  <span className="cc-deck-label">Deck Shoe</span>
                  <span className="cc-deck-cards">104 cards</span>
                </button>
                <button className="cc-deck-btn" onClick={() => startSession(6)}>
                  <span className="cc-deck-count">6</span>
                  <span className="cc-deck-label">Deck Shoe</span>
                  <span className="cc-deck-cards">312 cards</span>
                </button>
              </div>

              <button className="cc-back-mode-btn" onClick={() => setMode(null)}>
                ← Choose mode
              </button>
            </>
          ) : (
            <>
              {/* Game Simulator — Deck selection */}
              <div className="cc-info-card">
                <h3 className="cc-info-heading">Game Simulator</h3>
                <p className="cc-info-text">
                  Play simulated blackjack hands while maintaining the count.
                  You'll be tested on your true count between rounds and your
                  playing decisions are tracked against basic strategy.
                </p>
              </div>

              <p className="cc-choose-label">Choose your shoe</p>
              <div className="cc-deck-options">
                <button className="cc-deck-btn" onClick={() => { setDeckCount(2); setPhase("simulator"); }}>
                  <span className="cc-deck-count">2</span>
                  <span className="cc-deck-label">Deck Shoe</span>
                  <span className="cc-deck-cards">104 cards</span>
                </button>
                <button className="cc-deck-btn" onClick={() => { setDeckCount(6); setPhase("simulator"); }}>
                  <span className="cc-deck-count">6</span>
                  <span className="cc-deck-label">Deck Shoe</span>
                  <span className="cc-deck-cards">312 cards</span>
                </button>
              </div>

              <button className="cc-back-mode-btn" onClick={() => setMode(null)}>
                ← Choose mode
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER: GAME SIMULATOR
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === "simulator") {
    return (
      <div className="cc-page">
        <GameSimulator
          deckCount={deckCount}
          onEnd={() => { setPhase("setup"); setMode(null); }}
          onBack={() => { setPhase("setup"); setMode("simulator"); }}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER: DONE (Count Trainer)
  // ═══════════════════════════════════════════════════════════════════════
  if (phase === "done") {
    const acc = getAccuracy();
    return (
      <div className="cc-page">
        <div className="cc-done">
          <h1 className="cc-done-title">Session Complete</h1>

          <div className="cc-done-stats">
            <div className="cc-done-stat cc-done-highlight">
              <span className="cc-done-value" style={{ color: getAccuracyColor() }}>{acc}%</span>
              <span className="cc-done-label">Accuracy</span>
            </div>
            <div className="cc-done-stat">
              <span className="cc-done-value">{cardsDealt}</span>
              <span className="cc-done-label">Cards Dealt</span>
            </div>
            <div className="cc-done-stat">
              <span className="cc-done-value">{correctCount}/{totalDecisions}</span>
              <span className="cc-done-label">Correct</span>
            </div>
            <div className="cc-done-stat">
              <span className="cc-done-value">{runningCount > 0 ? "+" : ""}{runningCount}</span>
              <span className="cc-done-label">Final Count</span>
            </div>
          </div>

          <div className="cc-done-grade">
            {acc >= 95 ? "Perfect. You have a real edge." :
             acc >= 85 ? "Strong. Keep drilling to lock it in." :
             acc >= 70 ? "Decent. Focus on the trouble spots." :
             acc >= 50 ? "Room to grow. Review the Hi-Lo values." :
             "Keep practicing. Mastery takes repetition."}
          </div>

          <div className="cc-done-actions">
            <button className="cc-play-again" onClick={() => startSession(deckCount)}>
              Play Again
            </button>
            <button className="cc-change-deck" onClick={() => { setPhase("setup"); setMode("trainer"); }}>
              Change Shoe
            </button>
            <button className="cc-change-deck" onClick={() => { setPhase("setup"); setMode(null); }}>
              Change Mode
            </button>
            <button className="cc-back-btn" onClick={() => navigate("/")}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER: PLAYING (Count Trainer)
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="cc-page">
      <div className="cc-playing-content">
      {/* Top bar */}
      <div className="cc-topbar">
        <button className="cc-end-btn" onClick={endSession}>End</button>
        <div className="cc-topbar-stats">
          <div className="cc-stat-pill">
            <span className="cc-stat-label">RC</span>
            <span className="cc-stat-val">{runningCount > 0 ? "+" : ""}{runningCount}</span>
          </div>
          <div className="cc-stat-pill">
            <span className="cc-stat-label">TC</span>
            <span className="cc-stat-val">{trueCount > 0 ? "+" : ""}{trueCount}</span>
          </div>
          <div className="cc-stat-pill">
            <span className="cc-stat-label">Left</span>
            <span className="cc-stat-val">{decksRemaining.toFixed(1)}d</span>
          </div>
        </div>
        <button className="cc-info-btn" onClick={() => setShowInfo(!showInfo)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </button>
      </div>

      {/* Info overlay */}
      {showInfo && (
        <div className="cc-info-overlay" onClick={() => setShowInfo(false)}>
          <div className="cc-info-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Hi-Lo Quick Reference</h3>
            <div className="cc-hilo-guide">
              <div className="cc-guide-row">
                <span className="cc-guide-cards">2, 3, 4, 5, 6</span>
                <span className="cc-guide-value hilo-pos">+1</span>
              </div>
              <div className="cc-guide-row">
                <span className="cc-guide-cards">7, 8, 9</span>
                <span className="cc-guide-value hilo-zero">0</span>
              </div>
              <div className="cc-guide-row">
                <span className="cc-guide-cards">10, J, Q, K, A</span>
                <span className="cc-guide-value hilo-neg">-1</span>
              </div>
            </div>
            <p className="cc-info-formula">True Count = Running Count / Decks Remaining</p>
            <button className="cc-info-close" onClick={() => setShowInfo(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Accuracy bar */}
      <div className="cc-accuracy-bar">
        <div className="cc-accuracy-track">
          <div
            className="cc-accuracy-fill"
            style={{
              width: `${totalDecisions > 0 ? getAccuracy() : 0}%`,
              backgroundColor: getAccuracyColor(),
            }}
          />
        </div>
        <span className="cc-accuracy-label" style={{ color: getAccuracyColor() }}>
          {totalDecisions > 0 ? `${getAccuracy()}%` : "---"}
        </span>
      </div>

      {/* Penetration bar */}
      <div className="cc-penetration">
        <div className="cc-pen-track">
          <div className="cc-pen-fill" style={{ width: `${penetration}%` }} />
        </div>
        <span className="cc-pen-label">{cardsDealt} / {totalCards}</span>
      </div>

      {/* Current card */}
      <div className="cc-card-area">
        {currentCard && <Card card={currentCard} revealed={showResult} />}
      </div>

      {/* Decision result */}
      {showResult && (
        <div className={`cc-result ${lastCorrect ? "cc-result-correct" : "cc-result-wrong"}`}>
          {lastCorrect ? "Correct" : `Wrong — it's ${hiLoLabel(currentCard.rank)}`}
        </div>
      )}

      {/* Decision buttons or Next button */}
      <div className="cc-decision-area">
        {!showResult ? (
          <div className="cc-decision-btns">
            <button className="cc-decision-btn cc-btn-plus" onClick={() => handleDecision(1)}>
              +1
            </button>
            <button className="cc-decision-btn cc-btn-zero" onClick={() => handleDecision(0)}>
              0
            </button>
            <button className="cc-decision-btn cc-btn-minus" onClick={() => handleDecision(-1)}>
              -1
            </button>
          </div>
        ) : (
          <button className="cc-next-btn" onClick={nextCard}>
            Next Card
          </button>
        )}
      </div>

      {/* Score line */}
      <div className="cc-score-line">
        {correctCount}/{totalDecisions} correct
      </div>
      </div>
    </div>
  );
};

export default CardCounter;
