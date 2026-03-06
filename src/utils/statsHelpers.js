import { doc, updateDoc, increment, serverTimestamp, runTransaction } from "firebase/firestore";
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
    "globalStats.totalGamesPlayed": increment(1),
    "mindfulStats.totalWagered": increment(wagered),
    lastUpdated: serverTimestamp(),
  };

  if (gameType === "blackjack") {
    updates["mindfulStats.blackjackGames"] = increment(1);
  } else if (gameType === "roulette") {
    updates["mindfulStats.rouletteGames"] = increment(1);
  }

  if (won) {
    updates["mindfulStats.totalWins"] = increment(1);
  } else {
    updates["mindfulStats.totalLosses"] = increment(1);
  }

  try {
    await updateDoc(doc(db, "users", userId), updates);
  } catch (err) {
    console.error("Failed to update stats:", err);
  }
};

export const updateBiggestWin = async (userId, profit) => {
  if (!userId || profit <= 0) return;
  try {
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) return;
      const current = snap.data().mindfulStats?.biggestWin ?? 0;
      if (profit > current) {
        transaction.update(userRef, {
          "mindfulStats.biggestWin": profit,
          lastUpdated: serverTimestamp(),
        });
      }
    });
  } catch (err) {
    console.error("Failed to update biggestWin:", err);
  }
};

export const incrementVideosWatched = async (userId) => {
  if (!userId) return;
  try {
    await updateDoc(doc(db, "users", userId), {
      "globalStats.videosWatched": increment(1),
      lastUpdated: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to update videosWatched:", err);
  }
};
