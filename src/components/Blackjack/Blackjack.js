import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Blackjack.css";
import { BalanceContext } from "../../context/BalanceContext";
import { useAuth } from "../../context/AuthContext";
import { updateStats, updateBiggestWin } from "../../utils/statsHelpers";
import ConsciousCash from "../ConsciousCash/ConsciousCash";

// ─── Deck utilities ───────────────────────────────────────────────────────────
let _cardId = 0;
const uid = () => ++_cardId;

const buildDeck = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck = [];
  for (const suit of suits)
    for (const rank of ranks)
      deck.push({ id: uid(), suit, rank });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const rankVal = r => r === "A" ? 11 : ["J","Q","K"].includes(r) ? 10 : +r;

const total = hand => {
  let t = 0, aces = 0;
  for (const c of hand) { t += rankVal(c.rank); if (c.rank === "A") aces++; }
  while (t > 21 && aces-- > 0) t -= 10;
  return t;
};

const isBlackjack = hand => hand.length === 2 && total(hand) === 21;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Card component ───────────────────────────────────────────────────────────
const Card = ({ card }) => {
  if (card.faceDown) return <div className="bjc bjc-back" />;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`bjc ${red ? "bjc-red" : "bjc-black"}`}>
      <div className="bjc-corner bjc-tl">{card.rank}<br />{card.suit}</div>
      <div className="bjc-center">{card.suit}</div>
      <div className="bjc-corner bjc-br">{card.rank}<br />{card.suit}</div>
    </div>
  );
};

const CHIPS_ROW1 = [1, 5, 10, 25];
const CHIPS_ROW2 = [50, 100];

// ─── Component ────────────────────────────────────────────────────────────────
const Blackjack = () => {
  const navigate = useNavigate();
  const { balance, setBalance } = useContext(BalanceContext);
  const { currentUser } = useAuth();

  // phase: "betting" | "exiting" | "dealing" | "playing" | "gameover"
  const [phase, setPhase] = useState("betting");
  const [bet, setBet] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [activeHandIdx, setActiveHandIdx] = useState(0);
  const [handBets, setHandBets] = useState([]);
  const [results, setResults] = useState([]);
  const [showDealerTotal, setShowDealerTotal] = useState(false);
  const [lastBet, setLastBet] = useState(0);

  // Refs for stale-closure-free async access
  const deckRef = useRef([]);
  const dcRef = useRef([]);
  const phRef = useRef([]);
  const ahiRef = useRef(0);
  const hbRef = useRef([]);
  const balRef = useRef(balance);
  const busyRef = useRef(false);
  balRef.current = balance;

  const syncBalance = val => {
    balRef.current = val;
    setBalance(val);
    localStorage.setItem("balance", val);
  };

  const setBusyBoth = val => {
    busyRef.current = val;
    setBusy(val);
  };

  // ── Betting ───────────────────────────────────────────────────────────────
  const addChip = amt => {
    if (bet + amt > balance) return;
    setBet(b => b + amt);
  };

  // ── Dealer turn ───────────────────────────────────────────────────────────
  const runDealer = async () => {
    const revealed = dcRef.current.map(c => ({ ...c, faceDown: false }));
    dcRef.current = revealed;
    setDealerCards([...revealed]);
    setShowDealerTotal(true);
    await sleep(500);

    const allBust = phRef.current.every(h => total(h) > 21);
    if (!allBust) {
      while (total(dcRef.current) < 17) {
        await sleep(420);
        const card = deckRef.current.pop();
        dcRef.current = [...dcRef.current, card];
        setDealerCards([...dcRef.current]);
      }
    }

    const dTotal = total(dcRef.current);
    const dBust = dTotal > 21;
    let payout = 0;
    let totalProfit = 0;
    const res = phRef.current.map((hand, i) => {
      const pt = total(hand);
      const hb = hbRef.current[i];
      if (pt > 21) {
        if (currentUser) updateStats(currentUser.uid, "blackjack", { won: false, wagered: hb, profit: 0 });
        return "Bust";
      }
      if (dBust || pt > dTotal) {
        payout += hb * 2;
        totalProfit += hb;
        if (currentUser) updateStats(currentUser.uid, "blackjack", { won: true, wagered: hb, profit: hb });
        return `Win +$${hb * 2}`;
      }
      if (pt === dTotal) {
        payout += hb;
        return "Push";
      }
      if (currentUser) updateStats(currentUser.uid, "blackjack", { won: false, wagered: hb, profit: 0 });
      return "Loss";
    });
    if (payout > 0) syncBalance(balRef.current + payout);
    if (totalProfit > 0 && currentUser) updateBiggestWin(currentUser.uid, totalProfit);
    setResults(res);
    setPhase("gameover");
    setBusyBoth(false);
  };

  // ── Advance hand ──────────────────────────────────────────────────────────
  const advanceHand = async () => {
    const next = ahiRef.current + 1;
    if (next < phRef.current.length) {
      const nextHand = phRef.current[next];
      if (nextHand.length === 1) {
        await sleep(300);
        const c = deckRef.current.pop();
        const updated = phRef.current.map((h, i) => i === next ? [...h, c] : h);
        phRef.current = updated;
        setPlayerHands([...updated]);
      }
      ahiRef.current = next;
      setActiveHandIdx(next);
      setBusyBoth(false);
      if (total(phRef.current[next]) >= 21) {
        await sleep(300);
        setBusyBoth(true);
        await advanceHand();
      }
    } else {
      await runDealer();
    }
  };

  // ── Deal ──────────────────────────────────────────────────────────────────
  const deal = async (betAmount = bet) => {
    if (busyRef.current || betAmount < 1) return;
    setBusyBoth(true);
    syncBalance(balRef.current - betAmount);
    setLastBet(betAmount);

    // Only animate the betting section out when coming from betting phase
    if (phase === "betting") {
      setPhase("exiting");
      await sleep(380);
    }

    const deck = buildDeck();
    deckRef.current = deck;

    phRef.current = [[]];
    dcRef.current = [];
    ahiRef.current = 0;
    hbRef.current = [betAmount];
    setDealerCards([]);
    setPlayerHands([[]]);
    setHandBets([betAmount]);
    setActiveHandIdx(0);
    setResults([]);
    setShowDealerTotal(false);
    setPhase("dealing");

    await sleep(200);
    const p1 = deckRef.current.pop();
    phRef.current = [[p1]];
    setPlayerHands([[p1]]);

    await sleep(420);
    const d1 = deckRef.current.pop();
    dcRef.current = [d1];
    setDealerCards([d1]);

    await sleep(420);
    const p2 = deckRef.current.pop();
    phRef.current = [[p1, p2]];
    setPlayerHands([[p1, p2]]);

    await sleep(420);
    const hole = { ...deckRef.current.pop(), faceDown: true };
    dcRef.current = [d1, hole];
    setDealerCards([d1, hole]);

    await sleep(420);

    const phand = [p1, p2];
    if (isBlackjack(phand)) {
      const revealed = [d1, { ...hole, faceDown: false }];
      dcRef.current = revealed;
      setDealerCards(revealed);
      setShowDealerTotal(true);
      await sleep(400);
      let res, payout;
      if (isBlackjack(revealed)) {
        payout = betAmount;
        res = "Push";
      } else {
        const profit = Math.floor(betAmount * 1.5);
        payout = betAmount + profit;
        res = `Blackjack! +$${payout}`;
        if (currentUser) {
          updateStats(currentUser.uid, "blackjack", { won: true, wagered: betAmount, profit });
          updateBiggestWin(currentUser.uid, profit);
        }
      }
      syncBalance(balRef.current + payout);
      setResults([res]);
      setPhase("gameover");
      setBusyBoth(false);
      return;
    }

    setPhase("playing");
    setBusyBoth(false);
  };

  // ── Player actions ────────────────────────────────────────────────────────
  const hit = async () => {
    if (busyRef.current) return;
    setBusyBoth(true);
    const c = deckRef.current.pop();
    const idx = ahiRef.current;
    const updated = phRef.current.map((h, i) => i === idx ? [...h, c] : h);
    phRef.current = updated;
    setPlayerHands([...updated]);
    const t = total(updated[idx]);
    if (t >= 21) {
      await sleep(400);
      await advanceHand();
    } else {
      setBusyBoth(false);
    }
  };

  const stand = async () => {
    if (busyRef.current) return;
    setBusyBoth(true);
    await advanceHand();
  };

  const doDouble = async () => {
    if (busyRef.current) return;
    const idx = ahiRef.current;
    const hb = hbRef.current[idx];
    if (balRef.current < hb) return;
    setBusyBoth(true);
    syncBalance(balRef.current - hb);
    const newBets = hbRef.current.map((b, i) => i === idx ? b * 2 : b);
    hbRef.current = newBets;
    setHandBets([...newBets]);
    const c = deckRef.current.pop();
    const updated = phRef.current.map((h, i) => i === idx ? [...h, c] : h);
    phRef.current = updated;
    setPlayerHands([...updated]);
    await sleep(400);
    await advanceHand();
  };

  const doSplit = async () => {
    if (busyRef.current) return;
    const idx = ahiRef.current;
    const hand = phRef.current[idx];
    if (hand.length !== 2 || hand[0].rank !== hand[1].rank) return;
    const hb = hbRef.current[idx];
    if (balRef.current < hb) return;
    setBusyBoth(true);
    syncBalance(balRef.current - hb);

    const newHands = [...phRef.current];
    newHands.splice(idx, 1, [hand[0]], [hand[1]]);
    const newBets = [...hbRef.current];
    newBets.splice(idx, 1, hb, hb);
    phRef.current = newHands;
    hbRef.current = newBets;
    setPlayerHands([...newHands]);
    setHandBets([...newBets]);

    await sleep(300);
    const c1 = deckRef.current.pop();
    const h1 = phRef.current.map((h, i) => i === idx ? [...h, c1] : h);
    phRef.current = h1;
    setPlayerHands([...h1]);

    await sleep(420);
    const c2 = deckRef.current.pop();
    const h2 = phRef.current.map((h, i) => i === idx + 1 ? [...h, c2] : h);
    phRef.current = h2;
    setPlayerHands([...h2]);

    setBusyBoth(false);
    if (total(phRef.current[idx]) >= 21) {
      await sleep(300);
      setBusyBoth(true);
      await advanceHand();
    }
  };

  const playAgain = () => {
    setBet(0);
    setDealerCards([]);
    setPlayerHands([]);
    setHandBets([]);
    setResults([]);
    setActiveHandIdx(0);
    setShowDealerTotal(false);
    setBusyBoth(false);
    ahiRef.current = 0;
    phRef.current = [];
    hbRef.current = [];
    dcRef.current = [];
    deckRef.current = [];
    setPhase("betting");
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeHand = playerHands[activeHandIdx] || [];
  const activeHandBet = handBets[activeHandIdx] || 0;
  const at = total(activeHand);
  const canHit = !busy && at < 21;
  const canStand = !busy;
  const canDouble = !busy && activeHand.length === 2 && balance >= activeHandBet;
  const canSplit = !busy && activeHand.length === 2
    && activeHand[0]?.rank === activeHand[1]?.rank
    && balance >= activeHandBet;

  const inGame = phase === "dealing" || phase === "playing" || phase === "gameover";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`blackjack-game${inGame ? " bj-ingame" : ""}`}>
      <h1 className={`bj-title${inGame ? " bj-title-top" : ""}`}>
        Mindful Blackjack
      </h1>

      <div className="balance-section">
        <ConsciousCash />
      </div>

      {/* Betting screen */}
      {(phase === "betting" || phase === "exiting") && (
        <div className={`betting-wrapper${phase === "exiting" ? " bj-exit" : ""}`}>
          <div className="betting-section">
            <div className="bet-display">${bet}</div>
            <div className="chip-row">
              {CHIPS_ROW1.map(amt => (
                <button
                  key={amt}
                  className="chip-btn"
                  onClick={() => addChip(amt)}
                  disabled={bet + amt > balance}
                >
                  +{amt}
                </button>
              ))}
            </div>
            <div className="chip-row">
              {CHIPS_ROW2.map(amt => (
                <button
                  key={amt}
                  className="chip-btn"
                  onClick={() => addChip(amt)}
                  disabled={bet + amt > balance}
                >
                  +{amt}
                </button>
              ))}
              <button
                className="chip-btn chip-clear"
                onClick={() => setBet(0)}
                disabled={bet === 0}
              >
                Clear
              </button>
            </div>
          </div>
          <button className="deal-btn" onClick={() => deal()} disabled={bet < 1 || bet > balance}>
            Deal Cards
          </button>
          <button className="bj-back" onClick={() => navigate("/mindful")}>
            Back to Home
          </button>
        </div>
      )}

      {/* Game area */}
      {inGame && (
        <div className="game-area">
          <div className="dealer-zone">
            <div className="hand-area">
              <div className="hand-label">
                Dealer{showDealerTotal ? ` — ${total(dealerCards)}` : ""}
              </div>
              <div className="cards-row">
                {dealerCards.map(c => <Card key={c.id} card={c} />)}
              </div>
            </div>
          </div>

          <div className="player-zone">
            <div className="player-hands">
              {playerHands.map((hand, hi) => {
                const ht = total(hand);
                const res = results[hi];
                const active = hi === activeHandIdx && phase === "playing";
                const rc = !res ? "" : (res.startsWith("Win") || res.startsWith("Blackjack")) ? " hand-win" : res === "Push" ? " hand-push" : " hand-loss";
                return (
                  <div key={hi} className={`hand-area${active ? " active-hand" : ""}${rc}`}>
                    <div className="hand-label">
                      {playerHands.length > 1 ? `Hand ${hi + 1} ` : "You "}
                      — {ht}{res ? ` · ${res}` : ""}
                    </div>
                    <div className="cards-row">
                      {hand.map(c => <Card key={c.id} card={c} />)}
                    </div>
                    {handBets[hi] != null && (
                      <div className="hand-bet">Bet: ${handBets[hi]}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === "playing" && (
              <div className="action-btns">
                <button onClick={hit} disabled={!canHit}>Hit</button>
                <button onClick={stand} disabled={!canStand}>Stand</button>
                <button onClick={doDouble} disabled={!canDouble}>Double</button>
                <button onClick={doSplit} disabled={!canSplit}>Split</button>
              </div>
            )}

            {phase === "gameover" && (
              <div className="gameover-actions">
                <div className="gameover-btn-row">
                  <div className="rebet-spacer" />
                  <button className="deal-btn" onClick={playAgain}>Play Again</button>
                  {lastBet > 0 && lastBet <= balance ? (
                    <button className="rebet-btn" onClick={() => deal(lastBet)} title="Rebet same amount">
                      ↺
                    </button>
                  ) : (
                    <div className="rebet-spacer" />
                  )}
                </div>
                <button className="bj-back gameover-back" onClick={() => navigate("/mindful")}>
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackjack;
