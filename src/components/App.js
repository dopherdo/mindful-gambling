import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { BalanceProvider } from "../context/BalanceContext";
import Homepage from "./Homepage/Homepage";
import Blackjack from "./Blackjack/Blackjack";
import MindfulVideo from "./MindfulVideo/MindfulVideo";
import Roulette from "./Roulette/Roulette";
import AuthPage from "./Auth/AuthPage";
import Leaderboard from "./Leaderboard/Leaderboard";
import Profile from "./Profile/Profile";

function App() {
  return (
    <AuthProvider>
      <BalanceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/blackjack" element={<Blackjack />} />
            <Route path="/roulette" element={<Roulette />} />
            <Route path="/mindful-video" element={<MindfulVideo />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </BalanceProvider>
    </AuthProvider>
  );
}

export default App;
