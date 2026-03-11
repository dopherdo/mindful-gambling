import React, { useState } from "react";

const STEPS = [
  {
    title: "Welcome to Card Counting",
    body: "Card counting is a strategy used in blackjack to determine whether the next hand is likely to give an advantage to the player or the dealer. It's not about memorizing every card — it's about tracking a simple ratio.",
    icon: "♠",
  },
  {
    title: "The Hi-Lo System",
    body: "The Hi-Lo system assigns a value to every card dealt:",
    table: [
      { cards: "2, 3, 4, 5, 6", value: "+1", cls: "hilo-pos", note: "Low cards help the dealer" },
      { cards: "7, 8, 9", value: "0", cls: "hilo-zero", note: "Neutral — ignore these" },
      { cards: "10, J, Q, K, A", value: "-1", cls: "hilo-neg", note: "High cards help the player" },
    ],
    icon: "🂠",
  },
  {
    title: "The Running Count",
    body: "As cards are dealt, you add or subtract from the running count (RC). Start at 0 and adjust for every card you see — your cards, other players' cards, and the dealer's cards.",
    example: "5 dealt → RC: +1\nK dealt → RC: 0\n3 dealt → RC: +1\n7 dealt → RC: +1",
    icon: "∑",
  },
  {
    title: "The True Count",
    body: "The running count alone isn't enough. You need to adjust for how many decks are left in the shoe. The True Count (TC) is what actually tells you your edge.",
    formula: "True Count = Running Count ÷ Decks Remaining",
    example: "RC: +6, 3 decks left → TC: +2\nRC: +6, 1 deck left → TC: +6",
    icon: "÷",
  },
  {
    title: "Betting with the Count",
    body: "The true count tells you when to bet more and when to bet less. A positive count means more high cards remain — favoring the player.",
    betTable: [
      { tc: "TC ≤ 1", bet: "1 unit (minimum)", desc: "No edge" },
      { tc: "TC 2", bet: "2 units", desc: "Slight edge" },
      { tc: "TC 3", bet: "4 units", desc: "Good edge" },
      { tc: "TC 4", bet: "8 units", desc: "Strong edge" },
      { tc: "TC 5+", bet: "10+ units", desc: "Maximum edge" },
    ],
    icon: "$",
  },
  {
    title: "Playing Decisions",
    body: "Basic strategy is your foundation — the mathematically correct play for every hand. Card counting adds deviations: moments where the count changes the correct play. For example:",
    deviations: [
      "Take insurance when TC ≥ 3",
      "Stand on 16 vs 10 when TC ≥ 0",
      "Stand on 12 vs 3 when TC ≥ 2",
      "Double 10 vs 10 when TC ≥ 4",
    ],
    icon: "⚡",
  },
  {
    title: "Practice Makes Perfect",
    body: "This trainer has two modes to help you improve:",
    modes: [
      { name: "Count Trainer", desc: "Cards dealt one at a time. Practice identifying Hi-Lo values quickly and accurately." },
      { name: "Game Simulator", desc: "Play simulated blackjack hands. Practice maintaining the count while making correct betting and playing decisions." },
    ],
    tips: [
      "Start with Count Trainer until you're 95%+ accurate",
      "Move to Game Simulator to practice under game conditions",
      "Use the True Count peek (eye icon) as a training wheel",
      "Focus on accuracy first, then build speed",
    ],
    icon: "🎯",
  },
];

const Tutorial = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="tut-overlay" onClick={onClose}>
      <div className="tut-popup" onClick={(e) => e.stopPropagation()}>
        {/* Progress */}
        <div className="tut-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`tut-dot ${i === step ? "tut-dot-active" : i < step ? "tut-dot-done" : ""}`} />
          ))}
        </div>

        {/* Icon */}
        <div className="tut-icon">{s.icon}</div>

        {/* Title */}
        <h2 className="tut-title">{s.title}</h2>

        {/* Body */}
        <p className="tut-body">{s.body}</p>

        {/* Hi-Lo table */}
        {s.table && (
          <div className="tut-hilo-table">
            {s.table.map((row, i) => (
              <div key={i} className="tut-hilo-row">
                <div className="tut-hilo-left">
                  <span className={`tut-hilo-val ${row.cls}`}>{row.value}</span>
                  <span className="tut-hilo-cards">{row.cards}</span>
                </div>
                <span className="tut-hilo-note">{row.note}</span>
              </div>
            ))}
          </div>
        )}

        {/* Formula */}
        {s.formula && (
          <div className="tut-formula">{s.formula}</div>
        )}

        {/* Example */}
        {s.example && (
          <div className="tut-example">
            {s.example.split("\n").map((line, i) => (
              <div key={i} className="tut-example-line">{line}</div>
            ))}
          </div>
        )}

        {/* Bet table */}
        {s.betTable && (
          <div className="tut-bet-table">
            {s.betTable.map((row, i) => (
              <div key={i} className="tut-bet-row">
                <span className="tut-bet-tc">{row.tc}</span>
                <span className="tut-bet-amount">{row.bet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Deviations */}
        {s.deviations && (
          <div className="tut-deviations">
            {s.deviations.map((d, i) => (
              <div key={i} className="tut-deviation">• {d}</div>
            ))}
          </div>
        )}

        {/* Modes */}
        {s.modes && (
          <div className="tut-modes">
            {s.modes.map((m, i) => (
              <div key={i} className="tut-mode">
                <span className="tut-mode-name">{m.name}</span>
                <span className="tut-mode-desc">{m.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {s.tips && (
          <div className="tut-tips">
            {s.tips.map((t, i) => (
              <div key={i} className="tut-tip">
                <span className="tut-tip-num">{i + 1}</span>
                <span className="tut-tip-text">{t}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="tut-nav">
          {step > 0 && (
            <button className="tut-back" onClick={() => setStep(step - 1)}>Back</button>
          )}
          <button
            className={`tut-next ${isLast ? "tut-next-final" : ""}`}
            onClick={() => isLast ? onClose() : setStep(step + 1)}
          >
            {isLast ? "Start Practicing" : "Next"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button className="tut-skip" onClick={onClose}>Skip tutorial</button>
        )}
      </div>
    </div>
  );
};

export default Tutorial;
