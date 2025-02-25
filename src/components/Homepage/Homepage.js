import React from "react";
import { useContext } from "react";
import "./Homepage.css";
import { useNavigate } from "react-router-dom";
import { BalanceContext } from "../../context/BalanceContext";

const Homepage = () => {
  const navigate = useNavigate(); // Hook must be inside the functional component

  const { balance, setBalance } = useContext(BalanceContext);

  const handleWatchVideo = () => {
    alert("You watched a video and earned 50 Conscious Cash!");
    setBalance(balance + 50); // Updates global balance instantly
  };

  return (
    <div className="homepage">

      {/* Top text */}
      <h2 className="info-text">🧘 Play with purpose, pause with mindfulness 🧘</h2>

      {/* Title */}
      <h1 className="home-title">🎰🎲 Mindful Gambling 🎲🎰</h1>

      {/* Top Right Section */}
      <div className="top-right">
        <button className="video-button" onClick={handleWatchVideo}> 
          📺 Watch Mindful Video to Earn Conscious Cash! 
        </button>
        <span className="conscious-cash"> 💰 Conscious Cash: <span> ${balance} </span></span>
      </div>

      {/* Middle Game Options */}
      <div className="game-options">
        <button className="roulette-button"onClick={() => navigate("/roulette")}> 
          🎡 Play Roulette 
        </button>

        <button className="blackjack-button" onClick={() => navigate("/blackjack")}> 
          🃏 Play Blackjack 
        </button>

      </div>

      {/* Zooming text below */}
      <h3 className="start-text"> Play a game or watch a mindful video to get started! </h3>
    </div>
  );
};

export default Homepage;
