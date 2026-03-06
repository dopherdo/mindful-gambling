/*
  Achievement definitions — grouped per game.
  Each achievement has:
    id        – unique key
    title     – display name
    desc      – short description
    category  – subcategory within the game
    check(d)  – receives { mindfulStats, counterStats, globalStats, balance } and returns true/false
*/

import { GAMES } from "./gameNames";

// ── Mindful Gambling achievements ─────────────────────────────────────────────
const mindfulAchievements = [
  // Blackjack
  { id: "bj_first", title: "First Hand", desc: "Play your first blackjack hand", category: "blackjack", check: (d) => (d.mindfulStats.blackjackGames ?? 0) >= 1 },
  { id: "bj_10", title: "Regular", desc: "Play 10 blackjack hands", category: "blackjack", check: (d) => (d.mindfulStats.blackjackGames ?? 0) >= 10 },
  { id: "bj_50", title: "Veteran", desc: "Play 50 blackjack hands", category: "blackjack", check: (d) => (d.mindfulStats.blackjackGames ?? 0) >= 50 },
  { id: "bj_100", title: "Blackjack Addict", desc: "Play 100 blackjack hands", category: "blackjack", check: (d) => (d.mindfulStats.blackjackGames ?? 0) >= 100 },
  { id: "bj_win5", title: "On a Roll", desc: "Win 5 blackjack hands", category: "blackjack", check: (d) => (d.mindfulStats.totalWins ?? 0) >= 5 },
  { id: "bj_win25", title: "Card Shark", desc: "Win 25 hands total", category: "blackjack", check: (d) => (d.mindfulStats.totalWins ?? 0) >= 25 },
  { id: "bj_win100", title: "House Breaker", desc: "Win 100 hands total", category: "blackjack", check: (d) => (d.mindfulStats.totalWins ?? 0) >= 100 },
  { id: "bj_bigwin50", title: "Big Score", desc: "Win $50+ in a single hand", category: "blackjack", check: (d) => (d.mindfulStats.biggestWin ?? 0) >= 50 },
  { id: "bj_bigwin200", title: "Jackpot", desc: "Win $200+ in a single hand", category: "blackjack", check: (d) => (d.mindfulStats.biggestWin ?? 0) >= 200 },

  // Roulette
  { id: "rl_first", title: "First Spin", desc: "Play your first roulette game", category: "roulette", check: (d) => (d.mindfulStats.rouletteGames ?? 0) >= 1 },
  { id: "rl_10", title: "Spinner", desc: "Play 10 roulette games", category: "roulette", check: (d) => (d.mindfulStats.rouletteGames ?? 0) >= 10 },
  { id: "rl_50", title: "Roulette Fiend", desc: "Play 50 roulette games", category: "roulette", check: (d) => (d.mindfulStats.rouletteGames ?? 0) >= 50 },
  { id: "rl_wager500", title: "High Roller", desc: "Wager $500 total", category: "roulette", check: (d) => (d.mindfulStats.totalWagered ?? 0) >= 500 },
  { id: "rl_wager2000", title: "Whale", desc: "Wager $2,000 total", category: "roulette", check: (d) => (d.mindfulStats.totalWagered ?? 0) >= 2000 },

  // General / Mindfulness
  { id: "gen_video1", title: "Mindful Moment", desc: "Watch your first mindful video", category: "general", check: (d) => (d.globalStats.videosWatched ?? 0) >= 1 },
  { id: "gen_video5", title: "Self-Aware", desc: "Watch 5 mindful videos", category: "general", check: (d) => (d.globalStats.videosWatched ?? 0) >= 5 },
  { id: "gen_video10", title: "Enlightened", desc: "Watch 10 mindful videos", category: "general", check: (d) => (d.globalStats.videosWatched ?? 0) >= 10 },
  { id: "gen_bal500", title: "Stacking Up", desc: "Reach $500 Conscious Cash", category: "general", check: (d) => (d.balance ?? 0) >= 500 },
  { id: "gen_bal1000", title: "Four Figures", desc: "Reach $1,000 Conscious Cash", category: "general", check: (d) => (d.balance ?? 0) >= 1000 },
  { id: "gen_games100", title: "Centurion", desc: "Play 100 games total", category: "general", check: (d) => (d.globalStats.totalGamesPlayed ?? 0) >= 100 },
];

// ── Card Counter Trainer achievements ─────────────────────────────────────────
const cardCounterAchievements = [
  { id: "cc_first", title: "First Count", desc: "Complete a counting session", category: "sessions", check: (d) => (d.counterStats.handsPlayed ?? 0) >= 1 },
  { id: "cc_50cards", title: "Getting Started", desc: "Count 50 cards total", category: "sessions", check: (d) => (d.counterStats.handsPlayed ?? 0) >= 50 },
  { id: "cc_200cards", title: "Dedicated Counter", desc: "Count 200 cards total", category: "sessions", check: (d) => (d.counterStats.handsPlayed ?? 0) >= 200 },
  { id: "cc_500cards", title: "Card Counting Machine", desc: "Count 500 cards total", category: "sessions", check: (d) => (d.counterStats.handsPlayed ?? 0) >= 500 },
  { id: "cc_acc70", title: "Sharp Eye", desc: "Reach 70% counting accuracy", category: "accuracy", check: (d) => (d.counterStats.accuracy ?? 0) >= 70 },
  { id: "cc_acc85", title: "Card Sharp", desc: "Reach 85% counting accuracy", category: "accuracy", check: (d) => (d.counterStats.accuracy ?? 0) >= 85 },
  { id: "cc_acc95", title: "Rainman", desc: "Reach 95% counting accuracy", category: "accuracy", check: (d) => (d.counterStats.accuracy ?? 0) >= 95 },
];

// All achievements flat (for overall rank computation)
const allAchievements = [...mindfulAchievements, ...cardCounterAchievements];

/*
  Games structure — used by Achievements page.
  Each game has its own achievements and subcategories.
*/
export const gameAchievements = [
  {
    key: "mindful",
    name: GAMES.mindful.name,
    achievements: mindfulAchievements,
    categories: [
      { key: "blackjack", label: "Blackjack" },
      { key: "roulette", label: "Roulette" },
      { key: "general", label: "General" },
    ],
  },
  {
    key: "cardCounter",
    name: GAMES.cardCounter.name,
    achievements: cardCounterAchievements,
    categories: [
      { key: "sessions", label: "Sessions" },
      { key: "accuracy", label: "Accuracy" },
    ],
  },
];

/*
  Rank tiers based on % of all achievements unlocked.
*/
const ranks = [
  { threshold: 0,   name: "Iron",     color: "#8A8A8A" },
  { threshold: 10,  name: "Bronze",   color: "#A0785A" },
  { threshold: 25,  name: "Silver",   color: "#B0B0B0" },
  { threshold: 40,  name: "Gold",     color: "#D4A853" },
  { threshold: 55,  name: "Platinum", color: "#7EC8D4" },
  { threshold: 70,  name: "Emerald",  color: "#3DAA6E" },
  { threshold: 85,  name: "Diamond",  color: "#A78BFA" },
  { threshold: 100, name: "Elite",    color: "#F59E0B" },
];

export const getRank = (pct) => {
  let rank = ranks[0];
  for (const r of ranks) {
    if (pct >= r.threshold) rank = r;
  }
  return rank;
};

export default allAchievements;
