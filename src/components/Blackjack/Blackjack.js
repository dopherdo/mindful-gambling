import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Blackjack.css";
import { BalanceContext } from "../../context/BalanceContext"; // Use Global Balance Context

const generateDeck = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (["J", "Q", "K"].includes(card.value)) {
      value += 10;
    } else if (card.value === "A") {
      aces += 1;
      value += 11;
    } else {
      value += parseInt(card.value);
    }
  });

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

const Blackjack = () => {
  const navigate = useNavigate();
  const { balance, setBalance } = useContext(BalanceContext);
  const [deck, setDeck] = useState(generateDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);

  // Function to start a round after betting
  const placeBet = () => {
    if (bet > balance) {
      alert("Not enough Conscious Cash to place this bet.");
      return;
    }

    const newBalance = balance - bet;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);

    // Initialize the deck & hands
    const newDeck = generateDeck();
    const newPlayerHand = [newDeck.pop(), newDeck.pop()];
    const newDealerHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameOver(false);
    setMessage("");
    setGameStarted(true);

    // **Auto-win if player starts with 21**
    if (calculateHandValue(newPlayerHand) === 21) {
      handleWin();
    }
  };

  // Player Wins Instantly
  const handleWin = () => {
    const winnings = bet * 2;
    setMessage(`You Win! +$${winnings}`);
    const newBalance = balance + bet * 2;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);
    setGameOver(true);
  };

  // Player Hits
  const hit = () => {
    if (!gameOver) {
      const newHand = [...playerHand, deck.pop()];
      setPlayerHand(newHand);

      const handValue = calculateHandValue(newHand);
      if (handValue > 21) {
        setGameOver(true);
        setMessage("Bust! Dealer Wins!");
      } else if (handValue === 21) {
        handleWin(); // Auto-win if player hits 21
        setMessage("BLACKJACK!!")
      }
    }
  };

  // Player Doubles
  const double = () => {
    if (bet * 2 > balance) {
      alert("Not enough Conscious Cash to double!");
      return;
    }

    const newBet = bet * 2;
    const newBalance = balance - bet; // Deduct only the extra amount
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance);
    setBet(newBet);

    const newHand = [...playerHand, deck.pop()];
    setPlayerHand(newHand);

    const handValue = calculateHandValue(newHand);
    if (handValue > 21) {
      setGameOver(true);
      setMessage("Bust! Dealer Wins!");
    } else if (handValue === 21) {
      handleWin(); // Auto-win if player hits 21
      setMessage("BLACKJACK!!")
    } else {
      stand();
    }
  };

  // Player Stands (Dealer's Turn)
  const stand = () => {
    let dealerValue = calculateHandValue(dealerHand);
    let newDeck = [...deck];

    while (dealerValue < 17) {
      dealerHand.push(newDeck.pop());
      dealerValue = calculateHandValue(dealerHand);
    }

    setDeck(newDeck);
    setDealerHand([...dealerHand]);

    let playerValue = calculateHandValue(playerHand);
    if (dealerValue > 21 || playerValue > dealerValue) {
      handleWin();
    } else if (dealerValue === playerValue) {
      setMessage("It's a Push!");
      const newBalance = balance + bet;
      setBalance(newBalance);
      localStorage.setItem("balance", newBalance);
      setGameOver(true);
    } else {
      setMessage("Dealer Wins!");
      setGameOver(true);
    }
  };

  return (
    <div className="blackjack-game">
      <h1>🃏 Mindful Blackjack 🃏</h1>

      {/* Balance Section */}
      <div className="balance-section">
        <span className="conscious-cash"> Conscious Cash: <span> ${balance} </span> </span>
      </div>

      {/* Betting Section */}
      {!gameStarted && (
        <div className="betting-section">
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            min="10"
            max={balance}
            className="bet-input"
          />
          <button onClick={placeBet} className="bet-button">Deal Cards</button>
        </div>
      )}

      {/* Show game only after placing a bet */}
      {gameStarted && (
        <>
          <div className="hand">
            <h2>Dealer's Hand</h2>
            <div className="cards">
              {gameOver ? (
                dealerHand.map((card, index) => (
                  <span key={index}>{card.value}{card.suit} </span>
                ))
              ) : (
                <span>{dealerHand[0].value}{dealerHand[0].suit} ❓</span>
              )}
            </div>
          </div>

          <div className="hand">
            <h2>Your Hand</h2>
            <div className="cards">
              {playerHand.map((card, index) => (
                <span key={index}>{card.value}{card.suit} </span>
              ))}
            </div>
          </div>

          <h2>{message}</h2>

          {!gameOver && (
            <div className="buttons">
              <button onClick={hit} disabled={calculateHandValue(playerHand) === 21}>Hit</button>
              <button onClick={stand} disabled={calculateHandValue(playerHand) === 21}>Stand</button>
              <button className="double-button" onClick={double} disabled={calculateHandValue(playerHand) === 21}>Double</button>
            </div>
          )}

          {gameOver && (
            <button className="play-again-button" onClick={() => window.location.reload()}>
              Play Again
            </button>
          )}
        </>
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default Blackjack;
