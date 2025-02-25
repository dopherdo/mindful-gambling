import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Blackjack.css";
import BalanceSection from "../Common/BalanceSection";


// Function to generate a shuffled deck
const generateDeck = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // handle randomness to give random cards from the deck
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

    const [balance, setBalance] = useState(() => {
        return parseInt(localStorage.getItem("balance")) || 100;    // set default to $100 otherwise get balance
    });

    const [deck, setDeck] = useState(generateDeck());
    const [playerHand, setPlayerHand] = useState([deck.pop(), deck.pop()]);
    const [dealerHand, setDealerHand] = useState([deck.pop(), deck.pop()]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");
    const [bet, setBet] = useState(10);     // default bet of $10

    // add $50 to the balance after watching a video
    const handleWatchVideo = (newBalance) => {
        setBalance(newBalance);
        localStorage.setItem("balance", newBalance);
    };


    // Start game and subtract bet from balance
    const placeBet = () => {
        if (bet > balance) {
            alert("Not enough Conscious Cash to place this bet.");
            return;
        }

        setBalance(prevBalance => {
            const newBalance = prevBalance - bet;
            localStorage.setItem("balance", newBalance);
            return newBalance;
        });

        // Reset game state
        const newDeck = generateDeck();
        setDeck(newDeck);
        setPlayerHand([newDeck.pop(), newDeck.pop()]);
        setDealerHand([newDeck.pop(), newDeck.pop()]);
        setGameOver(false);
        setMessage("");
    };


    const hit = () => {
        if (!gameOver) {
            const newHand = [...playerHand, deck.pop()];
            setPlayerHand(newHand);
            if (calculateHandValue(newHand) > 21) {
                setGameOver(true);
                setMessage("Bust! Dealer Wins!");
            }
        }
    };

    const double = () => {
        if (bet * 2 > balance) {
            alert("Not enough Money");
            return;
        }
        setBalance(balance - bet);
        localStorage.setItem("balance", balance - bet);
        setBet(bet * 2);

        const newHand = [...playerHand, deck.pop()];
        setPlayerHand(newHand);
        stand();
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
            setMessage("Player Wins!");
        } else if (dealerValue === playerValue) {
            setMessage("It's a Push!");
        } else {
            setMessage("Dealer Wins!");
        }

        setGameOver(true);
    };

    // Restart Game
    const restartGame = () => {
        const newDeck = generateDeck();
        setDeck(newDeck);
        setPlayerHand([newDeck.pop(), newDeck.pop()]);
        setDealerHand([newDeck.pop(), newDeck.pop()]);
        setGameOver(false);
        setMessage("");
    };
    


    return (
        <div className="blackjack-game">
            <h1>🃏 Mindful Blackjack 🃏</h1>

            {/* Shared Balance & Video Section */}
            <BalanceSection balance={balance} onWatchVideo={handleWatchVideo} />

            <div className="betting-section">
                <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Number(e.target.value))}
                    min="10"
                    max={balance}
                    className="bet-input"
                />
                <button onClick={placeBet} className="bet-button">Place Bet</button>
            </div>

            <div className="hand">
                <h2>Dealer's Hand</h2>
                <div className="cards">
                {gameOver
                    ? dealerHand.map((card, index) => <span key={index}>{card.value}{card.suit} </span>)
                    : <span>{dealerHand[0].value}{dealerHand[0].suit} ❓</span>}
                </div>
            </div>

            <div className="hand">
                <h2>Your Hand</h2>
                <div className="cards">
                    {playerHand.map((card, index) => <span key={index}>{card.value}{card.suit} </span>)}
                </div>
            </div>

            <h2>{message}</h2>

            {!gameOver && (
                <div className="buttons">
                <button onClick={hit}>Hit</button>
                <button onClick={stand}>Stand</button>
                <button onClick={double}>Double</button>
                </div>
            )}
            {gameOver && <button className="play-again-button" onClick={restartGame}>Play Again</button>}
            <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
};

export default Blackjack;
