import React from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "../../config/gameNames";

const BJCentralBack = () => {
  const navigate = useNavigate();
  return (
    <button className="bj-central-back" onClick={() => navigate("/")}>
      ← {APP_NAME}
    </button>
  );
};

export default BJCentralBack;
