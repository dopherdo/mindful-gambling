import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Update a user's stats after a game outcome.
 * @param {string} userId - Firebase UID
 * @param {"blackjack"|"roulette"} gameType
 * @param {{ won: boolean, wagered: number, profit: number }} result
 */
export const updateStats = async (userId, gameType, { won, wagered, profit }) => {
  if (!userId) return;

  const updates = {
    "stats.totalGamesPlayed": increment(1),
    "stats.totalWagered": increment(wagered),
    lastUpdated: serverTimestamp(),
  };

  if (gameType === "blackjack") {
    updates["stats.blackjackGames"] = increment(1);
  } else if (gameType === "roulette") {
    updates["stats.rouletteGames"] = increment(1);
  }

  if (won) {
    updates["stats.totalWins"] = increment(1);
    // biggestWin can't use increment for a max — handled client-side via separate logic
    // We pass profit so the caller can handle biggestWin if needed
  } else {
    updates["stats.totalLosses"] = increment(1);
  }

  try {
    await updateDoc(doc(db, "users", userId), updates);
  } catch (err) {
    console.error("Failed to update stats:", err);
  }
};

export const updateBiggestWin = async (userId, profit, currentBiggest) => {
  if (!userId || profit <= currentBiggest) return;
  try {
    await updateDoc(doc(db, "users", userId), {
      "stats.biggestWin": profit,
      lastUpdated: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to update biggestWin:", err);
  }
};

export const incrementVideosWatched = async (userId) => {
  if (!userId) return;
  try {
    await updateDoc(doc(db, "users", userId), {
      "stats.videosWatched": increment(1),
      lastUpdated: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to update videosWatched:", err);
  }
};
