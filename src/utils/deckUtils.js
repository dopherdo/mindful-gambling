// ─── Shared deck & card utilities ────────────────────────────────────────────
let _cardId = 0;
export const uid = () => ++_cardId;

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

/** Build & shuffle a single 52-card deck */
export const buildDeck = () => {
  const deck = [];
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push({ id: uid(), suit, rank });
  shuffle(deck);
  return deck;
};

/** Build & shuffle a multi-deck shoe */
export const buildShoe = (deckCount) => {
  const shoe = [];
  for (let d = 0; d < deckCount; d++)
    for (const suit of SUITS)
      for (const rank of RANKS)
        shoe.push({ id: uid(), suit, rank });
  shuffle(shoe);
  return shoe;
};

/** Fisher-Yates shuffle (in-place) */
export const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Numeric value of a rank (Ace = 11) */
export const rankVal = (r) =>
  r === "A" ? 11 : ["J","Q","K"].includes(r) ? 10 : +r;

/** Hand total with ace adjustment */
export const handTotal = (hand) => {
  let t = 0, aces = 0;
  for (const c of hand) { t += rankVal(c.rank); if (c.rank === "A") aces++; }
  while (t > 21 && aces-- > 0) t -= 10;
  return t;
};

/** Whether a hand is "soft" (contains an ace counted as 11) */
export const isSoft = (hand) => {
  let t = 0, aces = 0;
  for (const c of hand) { t += rankVal(c.rank); if (c.rank === "A") aces++; }
  let reduced = 0;
  while (t > 21 && reduced < aces) { t -= 10; reduced++; }
  return t <= 21 && aces > reduced;
};

/** Whether a 2-card hand is a natural blackjack */
export const isBlackjack = (hand) => hand.length === 2 && handTotal(hand) === 21;

/** Whether a card's suit is red */
export const isRed = (card) => card.suit === "♥" || card.suit === "♦";

// ─── Hi-Lo counting ─────────────────────────────────────────────────────────

/** Hi-Lo value for a rank: 2-6 → +1, 7-9 → 0, 10-A → -1 */
export const hiLoValue = (rank) => {
  if (["2","3","4","5","6"].includes(rank)) return 1;
  if (["7","8","9"].includes(rank)) return 0;
  return -1;
};

/** Hi-Lo label string */
export const hiLoLabel = (rank) => {
  const v = hiLoValue(rank);
  return v > 0 ? "+1" : v < 0 ? "-1" : "0";
};
