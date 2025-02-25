import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { BalanceProvider } from "../context/BalanceContext";
import Homepage from "./Homepage/Homepage";
import Blackjack from "./Blackjack/Blackjack";
import MindfulVideo from "./MindfulVideo/MindfulVideo"; // Import new page

function App() {
  return (
    <BalanceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/mindful-video" element={<MindfulVideo />} /> {/* New Route */}
        </Routes>
      </Router>
    </BalanceProvider>
  );
}

export default App;
