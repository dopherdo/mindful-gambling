import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";
import "./PageTransition.css";

const TransitionContext = createContext();

export const useTransitionNavigate = () => {
  const ctx = useContext(TransitionContext);
  const navigate = useNavigate();

  return useCallback((to) => {
    if (!ctx) {
      navigate(to);
      return;
    }
    ctx.start(() => navigate(to));
  }, [ctx, navigate]);
};

const DURATION_IN = 600;   // fade in + logo starts filling
const DURATION_HOLD = 900; // let the stroke animation play
const DURATION_OUT = 400;

export const PageTransitionProvider = ({ children }) => {
  const [phase, setPhase] = useState(null); // "in" | "out" | null
  const cbRef = useRef(null);

  const start = useCallback((navigateFn) => {
    if (phase) return;
    setPhase("in");
    cbRef.current = navigateFn;

    setTimeout(() => {
      if (cbRef.current) cbRef.current();
      setTimeout(() => {
        setPhase("out");
        setTimeout(() => setPhase(null), DURATION_OUT);
      }, DURATION_HOLD);
    }, DURATION_IN);
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
