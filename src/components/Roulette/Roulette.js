import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BalanceContext } from "../../context/BalanceContext";

//CSS file
import "./Roulette.css";

const Roulette = () => {
    const navigate = useNavigate();
    const { balance, setBalance } = useContext(BalanceContext);
    const [betType, setBetType] = useState(null);
    const [betValue, setBetValue] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [result, setResult] = useState(null);
    const [outcome, setOutcome] = useState("");

    const placeBet = (type) => {
        if (betAmount > balance) {
            alert("Not enough Conscious Cash to place this bet.");
            return;
        }
        setBetType(type);
        if (type === 'number') {
            if (betValue < 0 || betValue > 36 || isNaN(betValue)) {
                alert("Please enter a valid number between 0 and 36.");
                return;
            }
        }
        const newBalance = balance - betAmount;
        setBalance(newBalance);
        localStorage.setItem("balance", newBalance);
        setOutcome(`Bet placed on: ${type} ${betValue !== null ? betValue : ''}`);
    };

    const spinWheel = () => {
        if (!betType) {
            alert("Please place a bet first!");
            return;
        }
        const number = Math.floor(Math.random() * 37);
        const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        const color = redNumbers.includes(number) ? 'red' : (number === 0 ? 'green' : 'black');
        const isEven = number !== 0 && number % 2 === 0 ? 'even' : 'odd';

        setResult(`Wheel landed on: ${number} (${color})`);
        let win = false;
        if (betType === 'number' && number === betValue) win = true;
        if (betType === 'red' && color === 'red') win = true;
        if (betType === 'black' && color === 'black') win = true;
        if (betType === 'even' && isEven === 'even') win = true;
        if (betType === 'odd' && isEven === 'odd') win = true;
        
        if (win) {
            const winnings = betAmount * (betType === 'number' ? 35 : 2);
            const newBalance = balance + winnings;
            setBalance(newBalance);
            localStorage.setItem("balance", newBalance);
            setOutcome(`You win! 🎉 +$${winnings}`);
        } else {
            setOutcome("You lose! 😞");
        }
    };

    return (
        <div className="roulette-game">
            <h1>Mindful Roulette</h1>
            <div className="balance-section">
                <span className="conscious-cash"> Conscious Cash: <span> ${balance} </span> </span>
            </div>
            
            <div className="betting-section">
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        min="10"
                        max={balance}
                        className="bet-input"
                    />
                <div className="bet-row">
                    <input
                        className="bet-number"
                        type="number"
                        value={betValue || ""}
                        onChange={(e) => setBetValue(Number(e.target.value))}
                        min="0"
                        max="36"
                        placeholder="Number"
                    />
                    
                    <button onClick={() => placeBet('number')}>Bet on Number</button>
                </div>
                <div className="bet-row">
                    <button onClick={() => placeBet('red')}>Bet on Red</button>
                    <button onClick={() => placeBet('black')}>Bet on Black</button>
                    <button onClick={() => placeBet('even')}>Bet on Even</button>
                    <button onClick={() => placeBet('odd')}>Bet on Odd</button>
                </div>
            </div>
            
            <button onClick={spinWheel} className="spin-button">Spin Wheel</button>
            <div className="wheel-result">{result}</div>
            <h2>{outcome}</h2>
            
            <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
};

export default Roulette;
