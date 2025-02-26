import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { BalanceContext } from "../../context/BalanceContext";

const Homepage = () => {
  const navigate = useNavigate();
  const { balance } = useContext(BalanceContext);

  return (
    <div className="homepage">
      <h2 className="info-text">  Make every bet a mindful one. </h2>
      <h1 className="home-title"> 🎰🎲 Mindful Gambling 🎲🎰 </h1>

      {/* Top Right Section */}
      <div className="top-right">
        <button className="video-button" onClick={() => navigate("/mindful-video")}>
          Watch Mindful Video to Earn Conscious Cash!
        </button>
        <span className="conscious-cash"> Conscious Cash: <span> ${balance} </span></span>
      </div>

      {/* Middle Game Options */}
      <div className="game-options">
        <button className="blackjack-button" onClick={() => navigate("/blackjack")}>
          🃏 Play Blackjack
        </button>
      </div>

      <h3 className="start-text"> Play a game or watch a mindful video to get started! </h3>
    </div>
  );
};

export default Homepage;
