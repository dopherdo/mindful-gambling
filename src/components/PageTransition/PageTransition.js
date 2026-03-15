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

const DURATION_IN = 400;
const DURATION_OUT = 350;

export const PageTransitionProvider = ({ children }) => {
  const [phase, setPhase] = useState(null); // "in" | "out" | null
  const cbRef = useRef(null);

  const start = useCallback((navigateFn) => {
    if (phase) return; // already transitioning
    setPhase("in");
    cbRef.current = navigateFn;

    setTimeout(() => {
      if (cbRef.current) cbRef.current();
      setPhase("out");
      setTimeout(() => setPhase(null), DURATION_OUT);
    }, DURATION_IN);
  }, [phase]);

  return (
    <TransitionContext.Provider value={{ start }}>
      {children}
      {phase && (
        <div className={`pt-overlay ${phase === "out" ? "pt-exit" : ""}`}>
          <div className="pt-logo">
            <Logo size={64} animate={phase === "in"} />
          </div>
        </div>
      )}
    </TransitionContext.Provider>
  );
};
