import React from "react";
import { useTransitionNavigate } from "../PageTransition/PageTransition";
import Logo from "../Logo/Logo";

const BJCentralBack = ({ to = "/" }) => {
  const navigate = useTransitionNavigate();
  return (
    <button className="bj-central-back" onClick={() => navigate(to)} aria-label="Home">
      <Logo size={24} />
    </button>
  );
};

export default BJCentralBack;
