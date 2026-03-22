import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../Logo/Logo";
import "./PageTransition.css";

const TransitionContext = createContext();

// ── Transition tiers ───────────────────────────────────────────────────────
// "heavy"  — cross-section navigations (e.g. BJCentral ↔ Card Counter)
// "medium" — sibling navigations (e.g. Homepage → Blackjack)
// "light"  — shallow navigations (e.g. back to home, profile, achievements)

const TIERS = {
  heavy:  { inMs: 550, holdMs: [1000, 1200, 1400], outMs: 400 },
  medium: { inMs: 450, holdMs: [700, 900, 1050],   outMs: 350 },
  light:  { inMs: 350, holdMs: [400, 550, 700],     outMs: 300 },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getTier = (from, to) => {
  // Same top-level section → light
  const fromBase = from.split("/")[1] || "";
  const toBase   = to.split("/")[1] || "";

  // Navigating to home or utility pages
  if (to === "/" || to === "/profile" || to === "/achievements" || to === "/leaderboard") {
    return "light";
  }

  // Same section (e.g. /mindful → /mindful/blackjack)
  if (fromBase === toBase && fromBase !== "") {
    return "medium";
  }

  // Cross-section (e.g. / → /card-counter, / → /mindful)
  return "heavy";
};

export const useTransitionNavigate = () => {
  const ctx = useContext(TransitionContext);
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((to) => {
    if (!ctx) {
      navigate(to);
      return;
    }
    ctx.start(() => navigate(to), location.pathname, to);
  }, [ctx, navigate, location.pathname]);
};

export const PageTransitionProvider = ({ children }) => {
  const [phase, setPhase] = useState(null);
  const cbRef = useRef(null);

  const start = useCallback((navigateFn, from, to) => {
    if (phase) return;
    setPhase("in");
    cbRef.current = navigateFn;

    const tier = TIERS[getTier(from, to)];
    const holdMs = pick(tier.holdMs);

    setTimeout(() => {
      if (cbRef.current) cbRef.current();
      setTimeout(() => {
        setPhase("out");
        setTimeout(() => setPhase(null), tier.outMs);
      }, holdMs);
    }, tier.inMs);
  }, [phase]);

  return (
    <TransitionContext.Provider value={{ start }}>
      {children}
      {phase && (
        <div className={`pt-overlay ${phase === "out" ? "pt-exit" : ""}`}>
          <div className="pt-logo">
            <Logo size={72} loading />
          </div>
        </div>
      )}
    </TransitionContext.Provider>
  );
};
