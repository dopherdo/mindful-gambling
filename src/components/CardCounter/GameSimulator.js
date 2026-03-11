import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  buildShoe, rankVal, handTotal, isSoft, isBlackjack, isRed, hiLoValue,
} from "../../utils/deckUtils";

// ─── Basic Strategy ─────────────────────────────────────────────────────────
// Returns: "H" = hit, "S" = stand, "D" = double (hit if can't), "Dh" = double else hit, "Ds" = double else stand
const getCorrectAction = (playerHand, dealerUpRank, canDouble) => {
  const total_ = handTotal(playerHand);
  const soft = isSoft(playerHand);
  const d = rankVal(dealerUpRank); // dealer upcard value (A=11)

  // Pair check (only for display purposes — we don't implement split in sim)
  if (playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank) {
    const pr = playerHand[0].rank;
    if (pr === "A" || pr === "8") return "H"; // would be split, default to hit
    if (pr === "5") { /* treat as 10 */ }
    else if (pr === "10" || pr === "J" || pr === "Q" || pr === "K") return "S";
    else if (pr === "9") return (d >= 2 && d <= 9 && d !== 7) ? "S" : "S";
  }

  // Soft totals
  if (soft && total_ <= 21) {
    if (total_ >= 20) return "S";
    if (total_ === 19) return "S";
    if (total_ === 18) {
      if (d >= 3 && d <= 6) return canDouble ? "D" : "S";
      if (d >= 9 || d === 11) return "H";
      return "S";
    }
    if (total_ === 17) {
      if (d >= 3 && d <= 6) return canDouble ? "D" : "H";
      return "H";
    }
    if (total_ <= 16 && total_ >= 15) {
      if (d >= 4 && d <= 6) return canDouble ? "D" : "H";
      return "H";
    }
    if (total_ <= 14) {
      if (d >= 5 && d <= 6) return canDouble ? "D" : "H";
      return "H";
    }
    return "H";
  }

  // Hard totals
  if (total_ >= 17) return "S";
  if (total_ >= 13 && total_ <= 16) return (d >= 2 && d <= 6) ? "S" : "H";
  if (total_ === 12) return (d >= 4 && d <= 6) ? "S" : "H";
  if (total_ === 11) return canDouble ? "D" : "H";
  if (total_ === 10) {
    if (d >= 2 && d <= 9) return canDouble ? "D" : "H";
    return "H";
  }
  if (total_ === 9) {
    if (d >= 3 && d <= 6) return canDouble ? "D" : "H";
    return "H";
  }
  return "H"; // 8 or less
};

// ─── Betting recommendation based on true count ─────────────────────────────
const getBetRecommendation = (tc) => {
  if (tc <= 1) return { units: 1, label: "1 unit", desc: "No edge — minimum bet" };
  if (tc === 2) return { units: 2, label: "2 units", desc: "Slight edge" };
  if (tc === 3) return { units: 4, label: "4 units", desc: "Good edge" };
  if (tc === 4) return { units: 8, label: "8 units", desc: "Strong edge" };
  return { units: 10, label: "10 units", desc: "Maximum edge" };
};

// ─── Card display ───────────────────────────────────────────────────────────
const SimCard = ({ card, faceDown, small }) => {
  if (faceDown) {
    return (
      <div className={`sim-card sim-card-back ${small ? "sim-card-sm" : ""}`}>
        <div className="sim-card-back-pattern" />
      </div>
    );
  }
  if (!card) return null;
  const red = isRed(card);
  return (
    <div className={`sim-card ${red ? "sim-card-red" : "sim-card-black"} ${small ? "sim-card-sm" : ""}`}>
      <span className="sim-card-rank">{card.rank}</span>
      <span className="sim-card-suit">{card.suit}</span>
    </div>
  );
};

// ─── Tips ────────────────────────────────────────────────────────────────────
const TIPS = [
  "Focus on accuracy over speed — speed comes with practice.",
  "In a real casino, bet in a 1-to-8 spread based on the true count.",
  "Never take insurance unless the true count is +3 or higher.",
  "Practice counting in pairs — it's faster than one at a time.",
  "A true count of +2 is when the player starts to have a real edge.",
  "Always use basic strategy as your foundation before counting.",
  "Don't stare at cards — learn to count with a quick glance.",
  "The cut card depth (penetration) affects how profitable counting is.",
  "Standing on 16 vs 10 is correct when the true count is 0 or higher.",
  "In a negative count, consider betting the minimum or leaving the table.",
  "Keep your bet spread natural — sudden jumps attract attention.",
  "Count every card you see, including other players' hands.",
];

// ═══════════════════════════════════════════════════════════════════════════
//  GAME SIMULATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const GameSimulator = ({ deckCount, onEnd, onBack }) => {
  // Shoe state
  const shoeRef = useRef([]);
  const [shoeSize, setShoeSize] = useState(0);
  const [cardsDealt, setCardsDealt] = useState(0);

  // Count tracking (actual)
  const runningCountRef = useRef(0);
  const [actualRC, setActualRC] = useState(0);
  const [showTrueCount, setShowTrueCount] = useState(false);

  // Hand state
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerHidden, setDealerHidden] = useState(true);

  // Game flow
  // phases: "count-check" | "betting" | "playing" | "dealer-turn" | "result" | "reshuffle"
  const [phase, setPhase] = useState("betting");
  const [bet, setBet] = useState(0);
  const [bankroll, setBankroll] = useState(1000);
  const [roundResult, setRoundResult] = useState(null); // { outcome, payout }
  const [hasDoubled, setHasDoubled] = useState(false);

  // Count accuracy (running count + decks remaining)
  const [countInput, setCountInput] = useState("");
  const [decksInput, setDecksInput] = useState("");
  const [countChecks, setCountChecks] = useState(0);
  const [countCorrect, setCountCorrect] = useState(0);
  const [lastCountResult, setLastCountResult] = useState(null);
  const COUNT_CHECK_INTERVAL = 5; // check every N hands

  // Decision accuracy
  const [decisionTotal, setDecisionTotal] = useState(0);
  const [decisionCorrect, setDecisionCorrect] = useState(0);

  // Tips
  const [currentTip, setCurrentTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  // Round number
  const [roundNum, setRoundNum] = useState(0);

  // Initialize shoe
  useEffect(() => {
    const shoe = buildShoe(deckCount);
    shoeRef.current = shoe;
    setShoeSize(shoe.length);
    runningCountRef.current = 0;
    setActualRC(0);
    setCardsDealt(0);
  }, [deckCount]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const decksRemaining = Math.max((shoeRef.current.length) / 52, 0.5);
  const actualTC = Math.round((actualRC / decksRemaining) * 10) / 10;
  const penetration = shoeSize > 0 ? (cardsDealt / shoeSize) * 100 : 0;
  const betRec = getBetRecommendation(Math.round(actualTC));

  const countAccuracy = countChecks > 0 ? Math.round((countCorrect / countChecks) * 100) : 0;
  const decisionAccuracy = decisionTotal > 0 ? Math.round((decisionCorrect / decisionTotal) * 100) : 0;

  const getAccuracyColor = useCallback((acc) => {
    if (acc >= 90) return "#5DBF7E";
    if (acc >= 70) return "#C4A855";
    if (acc >= 50) return "#D4874D";
    return "#BF6B6B";
  }, []);

  const dealCard = useCallback(() => {
    if (shoeRef.current.length === 0) return null;
    const card = shoeRef.current.pop();
    const hv = hiLoValue(card.rank);
    runningCountRef.current += hv;
    setActualRC(runningCountRef.current);
    setCardsDealt(prev => prev + 1);
    return card;
  }, []);

  // ── Count Check (Running Count + Decks Remaining) ──────────────────────
  const shouldCheckCount = roundNum > 0 && roundNum % COUNT_CHECK_INTERVAL === 0;

  const submitCountCheck = () => {
    const userRC = parseInt(countInput, 10);
    const userDecks = parseFloat(decksInput);
    if (isNaN(userRC)) return;

    // RC must be exact, decks remaining within 0.5
    const rcCorrect = userRC === actualRC;
    const decksCorrect = !isNaN(userDecks) && Math.abs(userDecks - decksRemaining) <= 0.5;
    const isCorrect = rcCorrect && decksCorrect;

    setCountChecks(prev => prev + 1);
    if (isCorrect) setCountCorrect(prev => prev + 1);
    setLastCountResult({
      isCorrect,
      rcCorrect,
      decksCorrect,
      userRC,
      actualRC,
      userDecks,
      actualDecks: Math.round(decksRemaining * 10) / 10,
    });
    setCountInput("");
    setDecksInput("");
    setTimeout(() => {
      setLastCountResult(null);
      setPhase("betting");
    }, 1500);
  };

  // ── Deal a new round ───────────────────────────────────────────────────
  const startRound = (betAmount) => {
    // Check for reshuffle (75% penetration)
    if (shoeRef.current.length < 52 * deckCount * 0.25) {
      const shoe = buildShoe(deckCount);
      shoeRef.current = shoe;
      setShoeSize(shoe.length);
      runningCountRef.current = 0;
      setActualRC(0);
      setCardsDealt(0);
      setPhase("reshuffle");
      return;
    }

    setBet(betAmount);
    setBankroll(prev => prev - betAmount);
    setHasDoubled(false);
    setRoundNum(prev => prev + 1);
    setShowTrueCount(false);
    setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);

    // Deal cards
    const p1 = dealCard();
    const d1 = dealCard();
    const p2 = dealCard();
    const d2 = dealCard();

    const pHand = [p1, p2];
    const dHand = [d1, d2];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDealerHidden(true);
    setRoundResult(null);

    // Check for player blackjack
    if (isBlackjack(pHand)) {
      setDealerHidden(false);
      if (isBlackjack(dHand)) {
        // Push
        setBankroll(prev => prev + betAmount);
        setRoundResult({ outcome: "push", payout: 0 });
      } else {
        // Blackjack pays 3:2
        const payout = Math.floor(betAmount * 2.5);
        setBankroll(prev => prev + payout);
        setRoundResult({ outcome: "blackjack", payout: payout - betAmount });
      }
      setPhase("result");
      return;
    }

    // Check for dealer blackjack
    if (isBlackjack(dHand)) {
      setDealerHidden(false);
      setRoundResult({ outcome: "dealer-bj", payout: -betAmount });
      setPhase("result");
      return;
    }

    setPhase("playing");
  };

  // ── Player actions ─────────────────────────────────────────────────────
  const handleAction = (action) => {
    const canDbl = playerHand.length === 2 && !hasDoubled;
    const correctAction = getCorrectAction(playerHand, dealerHand[0].rank, canDbl);

    // If correct action is "D" but player can't double, hitting is the fallback
    let correct = action === correctAction;
    if (!correct && correctAction === "D" && !canDbl && action === "H") correct = true;

    setDecisionTotal(prev => prev + 1);
    if (correct) setDecisionCorrect(prev => prev + 1);

    if (action === "H") {
      const card = dealCard();
      const newHand = [...playerHand, card];
      setPlayerHand(newHand);
      if (handTotal(newHand) > 21) {
        // Bust
        setDealerHidden(false);
        setRoundResult({ outcome: "bust", payout: -bet });
        setPhase("result");
      }
      // else continue playing
    } else if (action === "D") {
      // Double down
      setBankroll(prev => prev - bet);
      setBet(prev => prev * 2);
      setHasDoubled(true);
      const card = dealCard();
      const newHand = [...playerHand, card];
      setPlayerHand(newHand);
      if (handTotal(newHand) > 21) {
        setDealerHidden(false);
        setRoundResult({ outcome: "bust", payout: -(bet * 2) });
        setPhase("result");
      } else {
        playDealer(newHand, bet * 2);
      }
    } else if (action === "S") {
      playDealer(playerHand, bet);
    }
  };

  // ── Dealer plays ───────────────────────────────────────────────────────
  const playDealer = (pHand, currentBet) => {
    setDealerHidden(false);
    setPhase("dealer-turn");

    let dHand = [...dealerHand];

    // Dealer hits until 17+
    const dealerPlay = () => {
      while (handTotal(dHand) < 17) {
        const card = dealCard();
        dHand = [...dHand, card];
      }
      setDealerHand(dHand);

      const pTotal = handTotal(pHand);
      const dTotal = handTotal(dHand);

      if (dTotal > 21) {
        // Dealer bust
        setBankroll(prev => prev + currentBet * 2);
        setRoundResult({ outcome: "win", payout: currentBet });
      } else if (pTotal > dTotal) {
        setBankroll(prev => prev + currentBet * 2);
        setRoundResult({ outcome: "win", payout: currentBet });
      } else if (dTotal > pTotal) {
        setRoundResult({ outcome: "lose", payout: -currentBet });
      } else {
        setBankroll(prev => prev + currentBet);
        setRoundResult({ outcome: "push", payout: 0 });
      }
      setPhase("result");
    };

    // Small delay for drama
    setTimeout(dealerPlay, 400);
  };

  // ── Next round ─────────────────────────────────────────────────────────
  const nextRound = () => {
    if (bankroll <= 0) {
      setBankroll(1000);
    }
    // Only do count check every N hands
    const nextRoundNum = roundNum + 1;
    if (nextRoundNum > 0 && nextRoundNum % COUNT_CHECK_INTERVAL === 0) {
      setPhase("count-check");
    } else {
      setPhase("betting");
    }
  };

  const afterReshuffle = () => {
    setPhase("betting");
  };

  // ── Render: Reshuffle ──────────────────────────────────────────────────
  if (phase === "reshuffle") {
    return (
      <div className="sim-content">
        <div className="sim-reshuffle">
          <div className="sim-reshuffle-icon">♻</div>
          <h2 className="sim-reshuffle-title">Reshuffling</h2>
          <p className="sim-reshuffle-text">
            The shoe has reached 75% penetration. A new shoe is being shuffled.
            The count resets to 0.
          </p>
          <button className="sim-continue-btn" onClick={afterReshuffle}>Continue</button>
        </div>
      </div>
    );
  }

  // ── Render: Count Check ────────────────────────────────────────────────
  if (phase === "count-check") {
    return (
      <div className="sim-content">
        <div className="sim-topbar">
          <button className="cc-end-btn" onClick={onEnd}>End</button>
          <div className="sim-round-pill">Round {roundNum + 1}</div>
          <div className="sim-bankroll-pill">
            <span className="cc-stat-label">Bank</span>
            <span className="cc-stat-val">${bankroll}</span>
          </div>
        </div>

        {/* Accuracy bars */}
        <div className="sim-accuracy-section">
          <div className="sim-accuracy-row">
            <span className="sim-accuracy-name">Count</span>
            <div className="cc-accuracy-track">
              <div className="cc-accuracy-fill" style={{
                width: `${countChecks > 0 ? countAccuracy : 0}%`,
                backgroundColor: getAccuracyColor(countAccuracy),
              }} />
            </div>
            <span className="cc-accuracy-label" style={{ color: getAccuracyColor(countAccuracy) }}>
              {countChecks > 0 ? `${countAccuracy}%` : "---"}
            </span>
          </div>
          <div className="sim-accuracy-row">
            <span className="sim-accuracy-name">Play</span>
            <div className="cc-accuracy-track">
              <div className="cc-accuracy-fill" style={{
                width: `${decisionTotal > 0 ? decisionAccuracy : 0}%`,
                backgroundColor: getAccuracyColor(decisionAccuracy),
              }} />
            </div>
            <span className="cc-accuracy-label" style={{ color: getAccuracyColor(decisionAccuracy) }}>
              {decisionTotal > 0 ? `${decisionAccuracy}%` : "---"}
            </span>
          </div>
        </div>

        <div className="sim-count-check">
          <h2 className="sim-cc-title">Count Check</h2>
          <p className="sim-cc-subtitle">{cardsDealt} cards dealt from {deckCount}-deck shoe</p>

          {lastCountResult ? (
            <div className={`sim-cc-result ${lastCountResult.isCorrect ? "sim-cc-correct" : "sim-cc-wrong"}`}>
              {lastCountResult.isCorrect
                ? "Both correct!"
                : <>
                    RC: {lastCountResult.rcCorrect ? "Correct" : `${lastCountResult.actualRC > 0 ? "+" : ""}${lastCountResult.actualRC}`}
                    {" / "}
                    Decks: {lastCountResult.decksCorrect ? "Correct" : `${lastCountResult.actualDecks}`}
                  </>
              }
            </div>
          ) : (
            <>
              <div className="sim-cc-fields">
                <div className="sim-cc-field">
                  <label className="sim-cc-field-label">Running Count</label>
                  <input
                    type="number"
                    className="sim-cc-input"
                    value={countInput}
                    onChange={(e) => setCountInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && decksInput && submitCountCheck()}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <div className="sim-cc-field">
                  <label className="sim-cc-field-label">Decks Left</label>
                  <input
                    type="number"
                    step="0.5"
                    className="sim-cc-input"
                    value={decksInput}
                    onChange={(e) => setDecksInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && countInput && submitCountCheck()}
                    placeholder={String(deckCount)}
                  />
                </div>
                <button className="sim-cc-submit" onClick={submitCountCheck}>Check</button>
              </div>

              {/* Peek at running count */}
              <button
                className="sim-tc-peek"
                onMouseDown={() => setShowTrueCount(true)}
                onMouseUp={() => setShowTrueCount(false)}
                onMouseLeave={() => setShowTrueCount(false)}
                onTouchStart={() => setShowTrueCount(true)}
                onTouchEnd={() => setShowTrueCount(false)}
              >
                {showTrueCount ? (
                  <span className="sim-tc-value">
                    RC: {actualRC > 0 ? "+" : ""}{actualRC} / {Math.round(decksRemaining * 10) / 10}d left
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <span>Hold to peek</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Tip */}
        <div className="sim-tip">
          <span className="sim-tip-label">Tip</span>
          <span className="sim-tip-text">{currentTip}</span>
        </div>

        {/* Penetration */}
        <div className="cc-penetration" style={{ maxWidth: 340 }}>
          <div className="cc-pen-track">
            <div className="cc-pen-fill" style={{ width: `${penetration}%` }} />
          </div>
          <span className="cc-pen-label">{Math.round(penetration)}% dealt</span>
        </div>
      </div>
    );
  }

  // ── Render: Betting ────────────────────────────────────────────────────
  if (phase === "betting") {
    return (
      <div className="sim-content">
        <div className="sim-topbar">
          <button className="cc-end-btn" onClick={onEnd}>End</button>
          <div className="sim-round-pill">Round {roundNum + 1}</div>
          <div className="sim-bankroll-pill">
            <span className="cc-stat-label">Bank</span>
            <span className="cc-stat-val">${bankroll}</span>
          </div>
        </div>

        {/* Accuracy bars */}
        <div className="sim-accuracy-section">
          <div className="sim-accuracy-row">
            <span className="sim-accuracy-name">Count</span>
            <div className="cc-accuracy-track">
              <div className="cc-accuracy-fill" style={{
                width: `${countChecks > 0 ? countAccuracy : 0}%`,
                backgroundColor: getAccuracyColor(countAccuracy),
              }} />
            </div>
            <span className="cc-accuracy-label" style={{ color: getAccuracyColor(countAccuracy) }}>
              {countChecks > 0 ? `${countAccuracy}%` : "---"}
            </span>
          </div>
          <div className="sim-accuracy-row">
            <span className="sim-accuracy-name">Play</span>
            <div className="cc-accuracy-track">
              <div className="cc-accuracy-fill" style={{
                width: `${decisionTotal > 0 ? decisionAccuracy : 0}%`,
                backgroundColor: getAccuracyColor(decisionAccuracy),
              }} />
            </div>
            <span className="cc-accuracy-label" style={{ color: getAccuracyColor(decisionAccuracy) }}>
              {decisionTotal > 0 ? `${decisionAccuracy}%` : "---"}
            </span>
          </div>
        </div>

        <div className="sim-betting">
          <h2 className="sim-bet-title">Place Your Bet</h2>

          {/* Bet recommendation */}
          <div className="sim-bet-rec">
            <span className="sim-bet-rec-label">Recommended</span>
            <span className="sim-bet-rec-value">{betRec.label}</span>
            <span className="sim-bet-rec-desc">{betRec.desc}</span>
          </div>

          {/* Bet buttons */}
          <div className="sim-bet-chips">
            {[10, 25, 50, 100, 200].map(amount => (
              <button
                key={amount}
                className="sim-bet-chip"
                onClick={() => startRound(Math.min(amount, bankroll))}
                disabled={amount > bankroll}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* True count peek */}
          <button
            className="sim-tc-peek"
            onMouseDown={() => setShowTrueCount(true)}
            onMouseUp={() => setShowTrueCount(false)}
            onMouseLeave={() => setShowTrueCount(false)}
            onTouchStart={() => setShowTrueCount(true)}
            onTouchEnd={() => setShowTrueCount(false)}
          >
            {showTrueCount ? (
              <span className="sim-tc-value">
                RC: {actualRC > 0 ? "+" : ""}{actualRC} / {Math.round(decksRemaining * 10) / 10}d left
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <span>Hold to peek</span>
              </>
            )}
          </button>
        </div>

        {/* Tip */}
        <div className="sim-tip">
          <span className="sim-tip-label">Tip</span>
          <span className="sim-tip-text">{currentTip}</span>
        </div>

        {/* Penetration */}
        <div className="cc-penetration" style={{ maxWidth: 340 }}>
          <div className="cc-pen-track">
            <div className="cc-pen-fill" style={{ width: `${penetration}%` }} />
          </div>
          <span className="cc-pen-label">{Math.round(penetration)}% dealt</span>
        </div>
      </div>
    );
  }

  // ── Render: Playing / Dealer Turn / Result ─────────────────────────────
  const playerTotal = handTotal(playerHand);
  const dealerTotal = dealerHidden ? rankVal(dealerHand[0]?.rank) : handTotal(dealerHand);
  const canDouble = playerHand.length === 2 && !hasDoubled && bankroll >= bet;

  return (
    <div className="sim-content">
      <div className="sim-topbar">
        <button className="cc-end-btn" onClick={onEnd}>End</button>
        <div className="sim-round-pill">
          <span className="cc-stat-label">Bet</span>
          <span className="cc-stat-val">${bet}</span>
        </div>
        <div className="sim-bankroll-pill">
          <span className="cc-stat-label">Bank</span>
          <span className="cc-stat-val">${bankroll}</span>
        </div>
      </div>

      {/* Accuracy bars */}
      <div className="sim-accuracy-section">
        <div className="sim-accuracy-row">
          <span className="sim-accuracy-name">Count</span>
          <div className="cc-accuracy-track">
            <div className="cc-accuracy-fill" style={{
              width: `${countChecks > 0 ? countAccuracy : 0}%`,
              backgroundColor: getAccuracyColor(countAccuracy),
            }} />
          </div>
          <span className="cc-accuracy-label" style={{ color: getAccuracyColor(countAccuracy) }}>
            {countChecks > 0 ? `${countAccuracy}%` : "---"}
          </span>
        </div>
        <div className="sim-accuracy-row">
          <span className="sim-accuracy-name">Play</span>
          <div className="cc-accuracy-track">
            <div className="cc-accuracy-fill" style={{
              width: `${decisionTotal > 0 ? decisionAccuracy : 0}%`,
              backgroundColor: getAccuracyColor(decisionAccuracy),
            }} />
          </div>
          <span className="cc-accuracy-label" style={{ color: getAccuracyColor(decisionAccuracy) }}>
            {decisionTotal > 0 ? `${decisionAccuracy}%` : "---"}
          </span>
        </div>
      </div>

      {/* Dealer hand */}
      <div className="sim-hand-section">
        <div className="sim-hand-label">
          <span>Dealer</span>
          <span className="sim-hand-total">
            {dealerHidden ? rankVal(dealerHand[0]?.rank) : handTotal(dealerHand)}
          </span>
        </div>
        <div className="sim-hand-cards">
          {dealerHand.map((card, i) => (
            <SimCard
              key={card.id}
              card={card}
              faceDown={dealerHidden && i === 1}
            />
          ))}
        </div>
      </div>

      {/* Player hand */}
      <div className="sim-hand-section">
        <div className="sim-hand-label">
          <span>You</span>
          <span className="sim-hand-total">{playerTotal}</span>
        </div>
        <div className="sim-hand-cards">
          {playerHand.map(card => (
            <SimCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Result */}
      {phase === "result" && roundResult && (
        <div className={`sim-result ${
          roundResult.outcome === "win" || roundResult.outcome === "blackjack" ? "sim-result-win" :
          roundResult.outcome === "push" ? "sim-result-push" : "sim-result-lose"
        }`}>
          <span className="sim-result-text">
            {roundResult.outcome === "blackjack" ? "Blackjack!" :
             roundResult.outcome === "dealer-bj" ? "Dealer Blackjack" :
             roundResult.outcome === "bust" ? "Bust" :
             roundResult.outcome === "win" ? "You Win" :
             roundResult.outcome === "push" ? "Push" : "Dealer Wins"}
          </span>
          <span className="sim-result-payout">
            {roundResult.payout > 0 ? "+" : ""}{roundResult.payout !== 0 ? `$${roundResult.payout}` : "$0"}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="sim-actions">
        {phase === "playing" && (
          <div className="sim-action-btns">
            <button className="sim-action-btn sim-btn-hit" onClick={() => handleAction("H")}>
              Hit
            </button>
            <button className="sim-action-btn sim-btn-stand" onClick={() => handleAction("S")}>
              Stand
            </button>
            {canDouble && (
              <button className="sim-action-btn sim-btn-double" onClick={() => handleAction("D")}>
                Double
              </button>
            )}
          </div>
        )}
        {phase === "dealer-turn" && (
          <div className="sim-waiting">Dealer playing...</div>
        )}
        {phase === "result" && (
          <button className="sim-continue-btn" onClick={nextRound}>
            Next Hand
          </button>
        )}
      </div>

      {/* True count peek */}
      <button
        className="sim-tc-peek sim-tc-peek-mini"
        onMouseDown={() => setShowTrueCount(true)}
        onMouseUp={() => setShowTrueCount(false)}
        onMouseLeave={() => setShowTrueCount(false)}
        onTouchStart={() => setShowTrueCount(true)}
        onTouchEnd={() => setShowTrueCount(false)}
      >
        {showTrueCount ? (
          <span className="sim-tc-value">
            TC: {actualTC > 0 ? "+" : ""}{actualTC}
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default GameSimulator;
