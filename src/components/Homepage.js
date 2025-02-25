import React from "react";
import "./Homepage.css"; // Import external CSS

const Homepage = () => {
  return (
    <div className="homepage">

      {/* Top text */}
      <h2 className="info-text">Enjoy the fun of gambling without the risk!</h2>

      {/* Title */}
      <h1 className="home-title">🎲🎰 Mindful Gambling 🎲🎰</h1>

      {/* Top Right Section */}
      <div className="top-right">
        <button className="video-button"> 📺 Watch Mindful Video to Earn Conscious Cash! </button>
        <span className="balance"> 💰 Conscious Cash: <span> $100 </span></span>
      </div>

      {/* Middle Game Options */}
      <div className="game-options">
        <button className="roulette-button"> 🎡 Play Roulette </button>
        <button className="blackjack-button"> 🃏 Play Blackjack </button>
      </div>

      {/* Zooming text below */}
      <h3 className="start-text"> Play a game or watch a mindful video to get started! </h3>
    </div>
  );
};

export default Homepage;
