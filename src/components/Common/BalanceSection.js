import React from "react";
import { useContext } from "react"
import { BalanceContext } from "../../context/BalanceContext";
import "./BalanceSection.css"; 

const BalanceSection = () => {
  const [balance, setBalance] = useContext(BalanceContext);

  
  const handleWatchVideo = () => {
    alert("You watched a video and earned 50 Conscious Cash!");
    const newBalance = balance + 50;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);
  };


  return (
    <div className="balance-container">
      <button className="video-button" onClick={handleWatchVideo}>
        📺 Watch Mindful Video to Earn Conscious Cash!
      </button>
      <span className="balance"> 💰 Conscious Cash: <span>${balance}</span></span>
    </div>
  );
};

export default BalanceSection;
